import { t } from '../i18n.js';
/**
 * IEG-6030 회로망 해석 및 전기기계 연동 시뮬레이션 엔진 (v2)
 *
 * 1) 전선 + 모듈 내부 도통 → 전기적 노드 (Union-Find)
 * 2) 모듈별 소자(가변저항, 램프, R/L/C, 계측기 내부저항, 계자권선, 전기자 기전력, 전원)를
 *    회로망(Netlist)으로 조립하여 복소 페이저 절점해석(MNA)으로 풀이
 * 3) 계측기는 실제 단자 간 전압/분류기 전류를 읽어 표시 (탭 레인지·극성·과부하 반영)
 * 4) 회전수·계자자속은 시간적분(dt)으로 갱신 → 자여자 전압확립, 전동기 가속을 재현
 */

import { Netlist, UnionFind, C } from './netlist.js';
import {
  MACHINE, N_REF, OMEGA_REF, occDc, occSync, pmEmf, electricalFreq, syncSpeed, frictionTorque
} from './machine_models.js';

const SQRT2 = Math.SQRT2;
const rpmToOmega = (rpm) => rpm * 2 * Math.PI / 60;
const omegaToRpm = (w) => w * 60 / (2 * Math.PI);

// 계측기 레인지 정의
const V_RANGES = [
  { term: 'V_5V', fs: 5 }, { term: 'V_10V', fs: 10 }, { term: 'V_50V', fs: 50 }
];
const A_RANGES = [
  { term: 'A_100MA', fs: 0.1, shunt: 1.0 }, { term: 'A_1A', fs: 1, shunt: 0.1 },
  { term: 'A_2_5A', fs: 2.5, shunt: 0.04 }, { term: 'A_5A', fs: 5, shunt: 0.02 }
];
const VOLTMETER_R = 100e3;     // 전압계 입력저항 [Ω]
const GALVANO_R = 300;         // 검류계 내부저항 [Ω]
const OVERRANGE = 1.1;         // 표시 한계 (정격의 110% 초과 시 OL)

// 램프 정격 (전압 V, 전류 A)
const LAMP_SPEC = {
  'IEG-6030-03': { L1: [3, 0.3], L2: [6, 0.3], L3: [12, 0.25] },
  'IEG-6030-04': { L1: [12, 0.25], L2: [12, 0.25], L3: [12, 0.25], L4: [12, 0.25], L5: [12, 0.25], L6: [12, 0.25] }
};
// 04번 3상 부하 램프 연결 (소켓 양단 단자)
const LAMP_TERMS = {
  'IEG-6030-03': { L1: ['T1', 'T4'], L2: ['T2', 'T5'], L3: ['T3', 'T6'] },
  'IEG-6030-04': { L1: ['T1', 'T2'], L2: ['T3', 'T4'], L3: ['T5', 'T6'], L4: ['T9', 'T10'], L5: ['T7', 'T8'], L6: ['T12', 'T11'] }
};

// 전원공급기 교류 탭
const PSU_TAPS = [
  { term: 'AC_50V', v: 50 }, { term: 'AC_24V', v: 24 }, { term: 'AC_12V', v: 12 }, { term: 'AC_6V', v: 6 }
];
const PSU_TAP_R = 0.3;
const PSU_DC_R = 0.5;
const BRIDGE_DROP = 1.4;       // 브리지 다이오드 2개 순방향 강하 [V]
const PSU_FUSE_A = 3.0;        // 과전류 차단 [A]

export const GENERATOR_TYPES = new Set(['PM_AC_GEN', 'PM_DC_GEN', 'DC_GEN', 'SYNC_GEN_1PH', 'SYNC_GEN_3PH', 'ROT_ARM_3PH', 'ROTARY_CONV']);

export const DEFAULT_METERS = {
  M_AC_VOLT: { unit: 'V', fs: 80, kind: 'psu' },
  M_DC_VOLT: { unit: 'V', fs: 80, kind: 'psu' },
  M_AC_V: { unit: 'V', fs: 50 },
  M_AC_A: { unit: 'A', fs: 5 },
  M_DC_V: { unit: 'V', fs: 50 },
  M_DC_A: { unit: 'A', fs: 5 },
  M_GALVANO: { unit: 'mA', fs: 50, bipolar: true }
};

export class CircuitEngine {
  constructor(moduleDefs) {
    this.moduleDefs = moduleDefs;
    this.modules = new Map();       // 모듈별 조작 상태 (controls)
    this.rackModules = new Set();   // 현재 랙에 장착된 모듈
    this.wires = [];

    this.assembly = {
      rotorType: 'DISK_A',
      poles: {},
      beltConnected: false,
      machine: null,                // 실습별 기기 구성 (experiments_data.assemblyConfig.machine)
      requiredRotor: null
    };

    this.state = {
      powerSupplyOn: false,
      autoDriverOn: false,
      autoDriverDir: 'STOP',
      autoDriverRpm: 0,             // 구동 전동기 실제 회전수
      targetRpm: 1800,
      rotorRpm: 0,                  // 계철 프레임 회전자 회전수 (부호 = 방향)
      rotorAngle: 0,                // 회전자 기계각 [deg]
      manualRpm: 0,
      manualDir: 'CW',
      continuousSpin: false,
      fieldIf: 0,                   // 계자 자속 상태 (등가 계자전류, 시정수 지연)
      splitPhaseRunning: false,
      shortCircuit: false,
      shortDetails: '',
      warnings: [],
      calculatedValues: {},
      lampBrightness: {},
      lampOver: {},
      scopeData: { type: 'none', traces: [], freq: 0, vpp: 0 }
    };

    this.readings = {};
    for (const [id, m] of Object.entries(DEFAULT_METERS)) {
      this.readings[id] = { id, value: 0, display: 0, unit: m.unit, fs: m.fs, rangeLabel: '', ol: false, active: false, bipolar: !!m.bipolar };
    }
    this.uf = new UnionFind();
    this.lastSolve = null;
    this.solve();
  }

  // ─────────────────────────── 랙/배선/조작 API ───────────────────────────
  setRackModules(list) {
    this.rackModules = new Set(list);
    this.solve();
  }

  hasModule(id) { return this.rackModules.has(id); }

  addWire(from, to, color = 'red') {
    if (from.moduleId === to.moduleId && from.terminalId === to.terminalId) return false;
    const exists = this.wires.some(w =>
      (w.from.moduleId === from.moduleId && w.from.terminalId === from.terminalId &&
       w.to.moduleId === to.moduleId && w.to.terminalId === to.terminalId) ||
      (w.from.moduleId === to.moduleId && w.from.terminalId === to.terminalId &&
       w.to.moduleId === from.moduleId && w.to.terminalId === from.terminalId)
    );
    if (exists) return false;
    const wire = { id: `wire_${Date.now()}_${Math.floor(Math.random() * 1e6)}`, from, to, color };
    this.wires.push(wire);
    this.solve();
    return wire;
  }

  removeWire(wireId) {
    this.wires = this.wires.filter(w => w.id !== wireId);
    this.solve();
  }

  clearWires() {
    this.wires = [];
    this.solve();
  }

  /** 모듈 정의(MODULE_DEFS)의 초기값을 기본값으로 사용하는 조작값 조회 */
  getControlValue(moduleId, controlId, defaultVal) {
    const mod = this.modules.get(moduleId);
    if (mod && mod.controls && mod.controls[controlId] !== undefined) return mod.controls[controlId];
    const def = this.moduleDefs[moduleId];
    if (def) {
      if (controlId.endsWith('_idx')) {
        const base = controlId.slice(0, -4);
        const c = (def.controls || []).find(x => x.id === base);
        if (c && c.selectedIndex !== undefined) return c.selectedIndex;
      }
      const c = (def.controls || []).find(x => x.id === controlId);
      if (c) {
        if (c.options) return c.options[c.selectedIndex ?? 0].value;
        if (c.value !== undefined) return c.value;
      }
      const s = (def.switches || []).find(x => x.id === controlId);
      if (s) return s.value;
      if (controlId.startsWith('BULB_')) return this.defaultBulb(moduleId, controlId.slice(5));
    }
    return defaultVal;
  }

  defaultBulb(moduleId, lampId) {
    if (moduleId === 'IEG-6030-04') return ['L4', 'L5', 'L6'].includes(lampId); // 기본: Y 결선 램프 장착
    return true;
  }

  setControlValue(moduleId, controlId, value, silent = false) {
    if (!this.modules.has(moduleId)) this.modules.set(moduleId, { controls: {} });
    const mod = this.modules.get(moduleId);
    mod.controls[controlId] = value;
    if (moduleId === 'IEG-6030-11' && controlId === 'MOTOR_SPEED') this.state.targetRpm = value;
    if (!silent) this.solve();
  }

  resetControls() {
    this.modules.clear();
  }

  /** 두 단자가 전선/내부 도통(0Ω)으로 연결되어 있는지 */
  areTerminalsConnected(a, b) {
    const ka = `${a.moduleId}:${a.terminalId}`;
    const kb = `${b.moduleId}:${b.terminalId}`;
    if (ka === kb) return true;
    return this.uf.same(ka, kb);
  }

  /** 단자에 전선이 1개 이상 꽂혀 있는지 */
  isTerminalUsed(moduleId, terminalId) {
    return this.wires.some(w =>
      (w.from.moduleId === moduleId && w.from.terminalId === terminalId) ||
      (w.to.moduleId === moduleId && w.to.terminalId === terminalId));
  }

  // ─────────────────────────── 운전 제어 ───────────────────────────
  startRun(rpm = null, dir = 'CW') {
    const machine = this.assembly.machine || {};
    this.state.shortCircuit = false;
    this.state.shortDetails = '';
    if (this.hasModule('IEG-6030-06')) {
      this.state.powerSupplyOn = true;
      this.setControlValue('IEG-6030-06', 'MAIN_POWER_SW', true, true);
    }
    if (this.hasModule('IEG-6030-11')) {
      const r = rpm ?? this.getControlValue('IEG-6030-11', 'MOTOR_SPEED', 1800);
      this.state.targetRpm = r;
      this.state.autoDriverOn = true;
      this.state.autoDriverDir = dir;
      this.setControlValue('IEG-6030-11', 'MOTOR_SPEED', r, true);
      this.setControlValue('IEG-6030-11', 'MOTOR_POWER', true, true);
      this.setControlValue('IEG-6030-11', 'MOTOR_DIR', dir, true);
      this.setControlValue('IEG-6030-11', 'MOTOR_DIR_idx', dir === 'CW' ? 2 : (dir === 'CCW' ? 0 : 1), true);
    } else if (machine.manual) {
      // 구동 전동기가 없는 수동 회전 실습: RUN = 연속 수동 회전
      this.state.continuousSpin = true;
      this.state.manualRpm = machine.manualRpm || 150;
      this.state.manualDir = dir;
    }
    if (this.hasModule('IEG-6030-12') && this.getControlValue('IEG-6030-12', 'POLE_SW', 'STOP') === 'STOP') {
      this.setControlValue('IEG-6030-12', 'POLE_SW', 'DELTA', true);
      this.setControlValue('IEG-6030-12', 'POLE_SW_idx', 0, true);
    }
    this.solve();
  }

  stopRun() {
    this.state.autoDriverOn = false;
    this.state.autoDriverDir = 'STOP';
    this.state.powerSupplyOn = false;
    this.state.continuousSpin = false;
    this.state.manualRpm = 0;
    if (this.hasModule('IEG-6030-11') || this.modules.has('IEG-6030-11')) {
      this.setControlValue('IEG-6030-11', 'MOTOR_POWER', false, true);
      this.setControlValue('IEG-6030-11', 'MOTOR_DIR', 'STOP', true);
      this.setControlValue('IEG-6030-11', 'MOTOR_DIR_idx', 1, true);
    }
    if (this.hasModule('IEG-6030-06') || this.modules.has('IEG-6030-06')) {
      this.setControlValue('IEG-6030-06', 'MAIN_POWER_SW', false, true);
    }
    if (this.hasModule('IEG-6030-12')) {
      this.setControlValue('IEG-6030-12', 'POLE_SW', 'STOP', true);
      this.setControlValue('IEG-6030-12', 'POLE_SW_idx', 1, true);
    }
    this.solve();
  }

  /** 정지 상태로 즉시 초기화 (실습 전환 시) */
  hardReset() {
    this.stopRun();
    this.state.autoDriverRpm = 0;
    this.state.rotorRpm = 0;
    this.state.fieldIf = 0;
    this.state.splitPhaseRunning = false;
    this.state.shortCircuit = false;
    this.state.shortDetails = '';
    for (const r of Object.values(this.readings)) { r.display = 0; r.value = 0; }
    this.solve();
  }

  isRunning() {
    return (this.state.autoDriverOn && this.state.autoDriverDir !== 'STOP') ||
      Math.abs(this.state.autoDriverRpm) > 30 || Math.abs(this.state.rotorRpm) > 30;
  }

  rotorMatches() {
    const req = this.assembly.requiredRotor;
    const cur = this.assembly.rotorType;
    if (cur === 'NONE') return false;
    if (!req) return true;
    if (req === 'DISK_A' || req === 'DISK_B') return cur === 'DISK_A' || cur === 'DISK_B';
    return cur === req;
  }

  // ─────────────────────────── 회로망 조립 ───────────────────────────
  buildTopology() {
    const uf = new UnionFind();
    const k = (m, t) => `${m}:${t}`;
    for (const w of this.wires) uf.union(k(w.from.moduleId, w.from.terminalId), k(w.to.moduleId, w.to.terminalId));

    // 모듈 내부 도통 (0Ω 연결)
    const short = (m, a, b) => uf.union(k(m, a), k(m, b));
    const M = (id) => id;
    // 01/02 가변저항기: 1번과 3번 단자는 동일 노드 (패널 결선도)
    short(M('IEG-6030-01'), 'T1', 'T3');
    short(M('IEG-6030-02'), 'T1', 'T3');
    // 03 부하: A-1, 4-A' 등 실선 도통
    for (const [a, t1, t2, ap] of [['A', 'T1', 'T4', 'AP'], ['B', 'T2', 'T5', 'BP'], ['C', 'T3', 'T6', 'CP']]) {
      short('IEG-6030-03', a, t1); short('IEG-6030-03', t2, ap);
    }
    // 04 3상 부하 (Y-Δ 패널 실선)
    for (const [a, b] of [['U', 'T1'], ['T2', 'V'], ['V', 'T3'], ['T4', 'W'], ['U', 'T5'], ['T6', 'W'],
                          ['U', 'T9'], ['T10', 'N'], ['V', 'T7'], ['T8', 'N'], ['W', 'T12'], ['T11', 'N']]) {
      short('IEG-6030-04', a, b);
    }
    // 06 전원공급기: AC OUTPUT 1~4 공통모선 → 5번
    for (const t of ['AC_IN1', 'AC_IN2', 'AC_IN3', 'AC_IN4']) short('IEG-6030-06', t, 'RECT_5');
    // 10 계철 프레임 단자대: A1=A2, B1=B2, C1=C2, D1=D2 (이중 잭), E1-E2 = 직권 계자권선 양단
    for (const L of ['A', 'B', 'C', 'D']) short('IEG-6030-10', `${L}1`, `${L}2`);
    this.ufNoPoleSw = null;
    // 12 극수 전환기: 캠 스위치 위치에 따라 R/S/T → Ua/Va/Wa(저속 Δ) 또는 Ub/Vb/Wb(고속 YY)
    const pole = this.getControlValue('IEG-6030-12', 'POLE_SW', 'STOP');
    if (pole === 'DELTA') {
      short('IEG-6030-12', 'R', 'UA'); short('IEG-6030-12', 'S', 'VA'); short('IEG-6030-12', 'T', 'WA');
    } else if (pole === 'Y') {
      short('IEG-6030-12', 'R', 'UB'); short('IEG-6030-12', 'S', 'VB'); short('IEG-6030-12', 'T', 'WB');
      short('IEG-6030-12', 'UA', 'VA'); short('IEG-6030-12', 'VA', 'WA');
    }
    this.uf = uf;
    return uf;
  }

  // ─────────────────────────── 해석 사이클 ───────────────────────────
  /**
   * @param {number} dt 경과 시간 [s] (0 = 조작 직후 정적 재계산)
   */
  solve(dt = 0) {
    const uf = this.buildTopology();
    const net = new Netlist(uf);
    const K = (m, t) => `${m}:${t}`;
    const has = (id) => this.hasModule(id);
    const machine = this.assembly.machine || { type: 'NONE' };
    const rotorOk = this.rotorMatches();
    const st = this.state;
    const warnings = [];

    // 1. 수동 소자 ────────────────────────────────────────────
    if (has('IEG-6030-01')) net.addBranch('RH01', K('IEG-6030-01', 'T1'), K('IEG-6030-01', 'T2'), { R: Math.max(0.2, +this.getControlValue('IEG-6030-01', 'R_FIELD', 100)) });
    if (has('IEG-6030-02')) net.addBranch('RH02', K('IEG-6030-02', 'T1'), K('IEG-6030-02', 'T2'), { R: Math.max(0.2, +this.getControlValue('IEG-6030-02', 'R_START', 50)) });

    for (const modId of ['IEG-6030-03', 'IEG-6030-04']) {
      if (!has(modId)) continue;
      for (const [lid, [t1, t2]] of Object.entries(LAMP_TERMS[modId])) {
        if (!this.getControlValue(modId, `BULB_${lid}`, true)) continue;
        const [vr, ir] = LAMP_SPEC[modId][lid];
        net.addBranch(`LAMP_${modId}_${lid}`, K(modId, t1), K(modId, t2), { R: vr / ir });
      }
    }

    if (has('IEG-6030-05')) {
      const m = 'IEG-6030-05';
      const R = [['S1', 10], ['S2', 30], ['S3', 50]];
      const L = [['S4', 0.2, 4], ['S5', 0.4, 7], ['S6', 0.8, 12]];
      for (const [s, r] of R) if (this.getControlValue(m, s, false)) net.addBranch(`RLC_${s}`, K(m, 'T1'), K(m, 'T4'), { R: r });
      for (const [s, l, r] of L) if (this.getControlValue(m, s, false)) net.addBranch(`RLC_${s}`, K(m, 'T2'), K(m, 'T5'), { R: r, L: l });
      for (const s of ['S7', 'S8', 'S9']) if (this.getControlValue(m, s, false)) net.addBranch(`RLC_${s}`, K(m, 'T3'), K(m, 'T6'), { R: 0.5, C: 8.5e-6 });
    }

    for (const m of ['IEG-6030-07', 'IEG-6030-08']) {
      if (!has(m)) continue;
      for (const r of V_RANGES) net.addBranch(`${m}_${r.term}`, K(m, r.term), K(m, 'V_COM'), { R: VOLTMETER_R });
      for (const r of A_RANGES) net.addBranch(`${m}_${r.term}`, K(m, r.term), K(m, 'A_COM'), { R: r.shunt });
    }
    if (has('IEG-6030-09')) net.addBranch('GALV', K('IEG-6030-09', 'POS'), K('IEG-6030-09', 'NEG'), { R: GALVANO_R });

    // 2. 전원공급기 ───────────────────────────────────────────
    const psuOn = has('IEG-6030-06') && st.powerSupplyOn && !!this.getControlValue('IEG-6030-06', 'MAIN_POWER_SW', false);
    const P = 'IEG-6030-06';
    if (has(P)) {
      for (const tap of PSU_TAPS) {
        net.addSource(`TAP_${tap.term}`, K(P, 'AC_0V'), K(P, tap.term), 'ac60', [psuOn ? tap.v : 0, 0], PSU_TAP_R);
      }
      // 브리지 정류 출력 (값은 교류 해석 후 결정)
      net.addSource('PSU_DC', K(P, 'DC_NEG'), K(P, 'DC_POS'), 'dc', [0, 0], PSU_DC_R);
      // 브리지 입력(6번)과 0V 사이 입력 저항 (정류기 부하 표현)
      net.addBranch('PSU_BRIDGE_IN', K(P, 'RECT_6'), K(P, 'AC_0V'), { R: 2000 });
      // 내장 AC VOLT METER: AC OUTPUT 공통모선(1~5번)과 0V 사이에 접속
      net.addBranch('PSU_ACVM', K(P, 'RECT_5'), K(P, 'AC_0V'), { R: VOLTMETER_R });
    }

    // 3. 계철 프레임 기기 소자 ─────────────────────────────────
    const F = 'IEG-6030-10';
    const frame = has(F) && rotorOk;
    const mt = machine.type;
    const omega = rpmToOmega(st.rotorRpm);
    const genFreq = electricalFreq(st.rotorRpm, 2);
    let armSrc = null;           // 전기자(또는 발전 출력) 전원 소자 ID
    let kPhi = 0;                // 토크/기전력 상수 [V·s/rad]
    const dcArmature = ['DC_GEN', 'PM_DC_GEN', 'PM_DC_MOTOR', 'DC_SERIES_MOTOR', 'DC_COMPOUND_MOTOR'];

    if (has(F)) {
      // 계자권선 (조립된 경우 항상 존재)
      if (['DC_GEN', 'SYNC_GEN_1PH', 'DC_COMPOUND_MOTOR'].includes(mt)) {
        net.addBranch('F_SH', K(F, 'C1'), K(F, 'D1'), { R: MACHINE.shuntFieldR, L: MACHINE.shuntFieldL });
      }
      if (mt === 'DC_SERIES_MOTOR' || mt === 'UNIVERSAL_MOTOR') {
        net.addBranch('F_SE', K(F, 'C1'), K(F, 'D1'), { R: MACHINE.seriesFieldR, L: mt === 'UNIVERSAL_MOTOR' ? 0.05 : MACHINE.seriesFieldL });
      }
      if (mt === 'DC_COMPOUND_MOTOR') {
        net.addBranch('F_SE', K(F, 'E1'), K(F, 'E2'), { R: MACHINE.seriesFieldR, L: MACHINE.seriesFieldL });
      }
      if (['SHADED_POLE_MOTOR', 'REPULSION_MOTOR'].includes(mt)) {
        net.addBranch('F_ST', K(F, 'C1'), K(F, 'D1'), { R: 4, L: 0.04 });
      }
      if (mt === 'SPLIT_PHASE_MOTOR') {
        net.addBranch('W_MAIN', K(F, 'A1'), K(F, 'D1'), { R: 8, L: 0.03 });   // 주권선
        net.addBranch('W_AUX', K(F, 'B1'), K(F, 'D1'), { R: 10, L: 0.8 });    // 보조(기동)권선
      }
      if (mt === 'ROTARY_CONV') {
        net.addBranch('RC_AC_IN', K(F, 'A1'), K(F, 'B1'), { R: 40, L: 0.05 });
      }
    }

    if (frame) {
      const Ra = MACHINE.armatureR + MACHINE.armatureReactionR;
      if (dcArmature.includes(mt)) {
        if (mt === 'PM_DC_GEN' || mt === 'PM_DC_MOTOR') {
          kPhi = pmEmf('DC') / OMEGA_REF;
        } else {
          kPhi = occDc(st.fieldIf) / OMEGA_REF;
        }
        net.addSource('ARM', K(F, 'B1'), K(F, 'A1'), 'dc', [kPhi * omega, 0], Ra, MACHINE.armatureL);
        armSrc = 'ARM';
      } else if (mt === 'PM_AC_GEN') {
        const E = pmEmf('AC') * Math.abs(st.rotorRpm) / N_REF;
        net.addSource('ARM', K(F, 'B1'), K(F, 'A1'), 'acg', [E, 0], MACHINE.armatureR, MACHINE.armatureL);
        armSrc = 'ARM';
      } else if (mt === 'SYNC_GEN_1PH') {
        const E = occSync(st.fieldIf) * Math.abs(st.rotorRpm) / N_REF;
        net.addSource('ARM', K(F, 'B1'), K(F, 'A1'), 'acg', [E, 0], MACHINE.armatureR, MACHINE.syncLs);
        armSrc = 'ARM';
      } else if (mt === 'SYNC_GEN_3PH' || mt === 'ROT_ARM_3PH') {
        const E = MACHINE.threePhaseVp * Math.abs(st.rotorRpm) / N_REF;
        const seq = st.rotorRpm >= 0 ? 1 : -1;
        const ph = [0, -120 * seq, 120 * seq].map(d => d * Math.PI / 180);
        ['A1', 'B1', 'C1'].forEach((t, i) => {
          net.addSource(`ARM_${'ABC'[i]}`, K(F, 'D1'), K(F, t), 'acg', C.polar(E, ph[i]), MACHINE.armatureR, MACHINE.threePhaseLs);
        });
        armSrc = 'ARM_A';
      } else if (mt === 'ROTARY_CONV') {
        net.addSource('RC_DC', K(F, 'D1'), K(F, 'C1'), 'dc', [0, 0], Ra);
      } else if (mt === 'UNIVERSAL_MOTOR') {
        const iPrev = st.universalI || 0;
        const ifEff = iPrev * MACHINE.seriesTurnRatio;
        const eb = Math.abs(occDc(ifEff) - MACHINE.residualV) * Math.abs(omega) / OMEGA_REF;
        const rEmf = iPrev > 0.01 ? eb / iPrev : 0;
        st.universalREmf = rEmf;
        net.addBranch('ARM_U', K(F, 'A1'), K(F, 'B1'), { R: MACHINE.armatureR + rEmf, L: 0.01 });
      } else if (mt === 'REPULSION_MOTOR') {
        // 전기자 브러시 단락 여부만 판정 (소자 없음)
      }
    }

    // 4. 교류(60Hz) 해석 → 브리지 정류 / 회전변류기 직류 결정 ───────
    const ac60 = net.solve('ac60', 60);
    let vBus = 0, vDc = 0;
    if (has(P)) {
      vBus = C.abs(C.sub(ac60.v(K(P, 'RECT_5')), ac60.v(K(P, 'AC_0V'))));
      const bridgeLinked = uf.same(K(P, 'RECT_5'), K(P, 'RECT_6'));
      vDc = (psuOn && bridgeLinked) ? Math.max(0, SQRT2 * vBus - BRIDGE_DROP) : 0;
      const src = net.sources.find(s => s.id === 'PSU_DC');
      if (src) src.V = [vDc, 0];
    }
    let rcVac = 0;
    if (frame && mt === 'ROTARY_CONV') {
      rcVac = C.abs(C.sub(ac60.v(K(F, 'A1')), ac60.v(K(F, 'B1'))));
      const spinning = Math.abs(st.rotorRpm) > 1000;
      const src = net.sources.find(s => s.id === 'RC_DC');
      if (src) src.V = [spinning ? SQRT2 * rcVac : 0, 0];
    }

    // 5. 직류 / 발전기 교류 해석 ─────────────────────────────────
    const dcs = net.solve('dc', 0);
    const acg = genFreq > 0.05 ? net.solve('acg', genFreq) : net.solve('acg', 0.05);

    // 6. 과전류(퓨즈) 판정 ────────────────────────────────────
    if (psuOn) {
      let worst = 0, worstName = '';
      for (const tap of PSU_TAPS) {
        const i = C.abs(ac60.branchI(`TAP_${tap.term}`));
        if (i > worst) { worst = i; worstName = t('AC {v}V 탭', { v: tap.v }); }
      }
      const idc = Math.abs(dcs.branchI('PSU_DC')[0]);
      if (idc > worst) { worst = idc; worstName = t('DC 출력'); }
      // 퓨즈 특성: 정격 1.5배 초과 즉시 차단, 정격 초과가 1.5초 이상 지속되면 차단
      if (worst > PSU_FUSE_A) st.overTime = (st.overTime || 0) + dt; else st.overTime = 0;
      if (worst > PSU_FUSE_A * 1.5 || st.overTime > 1.5) {
        st.overTime = 0;
        st.shortCircuit = true;
        st.shortDetails = t('전원공급기 {name} 과전류 {a}A → 퓨즈(3A) 차단. 결선(단락)을 확인하세요.', { name: worstName, a: worst.toFixed(1) });
        st.powerSupplyOn = false;
        this.setControlValue(P, 'MAIN_POWER_SW', false, true);
        return this.solve(0);
      }
    }

    // 7. 계측 ──────────────────────────────────────────────
    const vdiff = (sol, a, b) => C.sub(sol.v(a), sol.v(b));
    const acMag = (a, b) => Math.hypot(C.abs(vdiff(ac60, a, b)), C.abs(vdiff(acg, a, b)));
    const acCur = (id) => Math.hypot(C.abs(ac60.branchI(id)), C.abs(acg.branchI(id)));

    const setReading = (id, value, fs, rangeLabel, active) => {
      const r = this.readings[id];
      r.value = value; r.fs = fs; r.rangeLabel = rangeLabel; r.active = active;
      r.ol = active && Math.abs(value) > fs * OVERRANGE;
    };

    // 06 내장 메터
    setReading('M_AC_VOLT', has(P) && psuOn ? vBus : 0, 80, '80V', has(P));
    setReading('M_DC_VOLT', has(P) ? vdiff(dcs, K(P, 'DC_POS'), K(P, 'DC_NEG'))[0] : 0, 80, '80V', has(P));

    // 07 / 08 전압계·전류계
    const meterRead = (m, isAC) => {
      const vUsed = V_RANGES.filter(r => this.isTerminalUsed(m, r.term) && this.isTerminalUsed(m, 'V_COM'));
      let vr = null, vVal = 0;
      if (vUsed.length) {
        vr = vUsed[0];
        vVal = isAC ? acMag(K(m, vr.term), K(m, 'V_COM')) : vdiff(dcs, K(m, vr.term), K(m, 'V_COM'))[0];
      }
      const aUsed = A_RANGES.filter(r => this.isTerminalUsed(m, r.term) && this.isTerminalUsed(m, 'A_COM'));
      let ar = null, aVal = 0;
      for (const r of aUsed) {
        const i = isAC ? acCur(`${m}_${r.term}`) : dcs.branchI(`${m}_${r.term}`)[0];
        if (!ar || Math.abs(i) > Math.abs(aVal)) { ar = r; aVal = i; }
      }
      return { vr, vVal, ar, aVal };
    };
    const fmtV = (r) => `${r.fs}V`;
    const fmtA = (r) => (r.fs < 1 ? `${Math.round(r.fs * 1000)}mA` : `${r.fs}A`);
    for (const [mod, vId, aId, isAC] of [['IEG-6030-08', 'M_DC_V', 'M_DC_A', false], ['IEG-6030-07', 'M_AC_V', 'M_AC_A', true]]) {
      if (!has(mod)) { setReading(vId, 0, 50, '', false); setReading(aId, 0, 5, '', false); continue; }
      const d = meterRead(mod, isAC);
      setReading(vId, d.vVal, d.vr ? d.vr.fs : 50, d.vr ? fmtV(d.vr) : t('미결선'), !!d.vr);
      setReading(aId, d.aVal, d.ar ? d.ar.fs : 5, d.ar ? fmtA(d.ar) : t('미결선'), !!d.ar);
    }

    // 09 검류계 (직류 + 저주파 교류 순시값: 가동코일형 지침은 수 Hz 이하에서 좌우로 흔들림)
    if (has('IEG-6030-09')) {
      const galvRange = +this.getControlValue('IEG-6030-09', 'RANGE_SEL', 50);
      let iG = dcs.branchI('GALV')[0];
      if (genFreq > 0 && genFreq < 6) {
        const iac = acg.branchI('GALV');
        const th = st.rotorAngle * Math.PI / 180;
        iG += SQRT2 * (iac[0] * Math.cos(th) - iac[1] * Math.sin(th));
      }
      const used = this.isTerminalUsed('IEG-6030-09', 'POS') && this.isTerminalUsed('IEG-6030-09', 'NEG');
      setReading('M_GALVANO', iG * 1000, galvRange, `±${galvRange}mA`, used);
    } else {
      setReading('M_GALVANO', 0, 50, '', false);
    }

    // 8. 램프 밝기 ────────────────────────────────────────────
    const lampBrightness = {};
    const lampOver = {};
    for (const modId of ['IEG-6030-03', 'IEG-6030-04']) {
      if (!has(modId)) continue;
      for (const [lid, [t1, t2]] of Object.entries(LAMP_TERMS[modId])) {
        const key = `${modId}:${lid}`;
        if (!this.getControlValue(modId, `BULB_${lid}`, true)) { lampBrightness[key] = -1; continue; }
        const a = K(modId, t1), b = K(modId, t2);
        const vrms = Math.hypot(vdiff(dcs, a, b)[0], C.abs(vdiff(ac60, a, b)), C.abs(vdiff(acg, a, b)));
        const vr = LAMP_SPEC[modId][lid][0];
        const ratio = vrms / vr;
        lampBrightness[key] = Math.max(0, Math.min(1, (ratio - 0.15) / 0.85));
        lampOver[key] = ratio > 1.3;
        if (ratio > 1.3) warnings.push(t('{m}번 {lid} 램프 과전압 ({v}V / 정격 {r}V) — 필라멘트 단선 위험', { m: modId.slice(-2), lid, v: vrms.toFixed(1), r: vr }));
      }
    }

    // 9. 기기 상태량 ─────────────────────────────────────────
    let vArm = 0, iArm = 0, ifMeas = 0, torque = 0, isAcOut = false;
    if (has(F)) {
      const A = K(F, 'A1'), B = K(F, 'B1');
      if (dcArmature.includes(mt)) {
        vArm = vdiff(dcs, A, B)[0];
        const iab = frame ? dcs.branchI('ARM')[0] : 0;   // 내부 B→A 방향 (발전 방향 +)
        iArm = iab;
        torque = -kPhi * iab;
      } else if (['PM_AC_GEN', 'SYNC_GEN_1PH'].includes(mt)) {
        vArm = C.abs(vdiff(acg, A, B));
        iArm = frame ? C.abs(acg.branchI('ARM')) : 0;
        isAcOut = true;
      } else if (['SYNC_GEN_3PH', 'ROT_ARM_3PH'].includes(mt)) {
        vArm = C.abs(vdiff(acg, A, K(F, 'D1')));
        iArm = frame ? C.abs(acg.branchI('ARM_A')) : 0;
        isAcOut = true;
      } else if (mt === 'ROTARY_CONV') {
        vArm = vdiff(dcs, K(F, 'C1'), K(F, 'D1'))[0];
        iArm = frame ? Math.abs(dcs.branchI('RC_DC')[0]) : 0;
      } else if (mt === 'UNIVERSAL_MOTOR') {
        vArm = acMag(K(F, 'C1'), B);
        iArm = acCur('ARM_U');
        st.universalI = iArm;
      } else if (['SPLIT_PHASE_MOTOR'].includes(mt)) {
        vArm = acMag(A, K(F, 'D1'));
        iArm = acCur('W_MAIN');
      } else if (['SHADED_POLE_MOTOR', 'REPULSION_MOTOR'].includes(mt)) {
        vArm = acMag(K(F, 'C1'), K(F, 'D1'));
        iArm = acCur('F_ST');
      }
      // 계자 전류
      if (['DC_GEN', 'SYNC_GEN_1PH'].includes(mt)) ifMeas = dcs.branchI('F_SH')[0];
      else if (mt === 'DC_SERIES_MOTOR') ifMeas = dcs.branchI('F_SE')[0] * MACHINE.seriesTurnRatio;
      else if (mt === 'DC_COMPOUND_MOTOR') ifMeas = dcs.branchI('F_SH')[0] + dcs.branchI('F_SE')[0] * MACHINE.seriesTurnRatio;
      else if (mt === 'UNIVERSAL_MOTOR') ifMeas = iArm * MACHINE.seriesTurnRatio;
    }

    // 10. 시간 적분 (회전수, 계자자속, 회전각) ────────────────────
    if (dt > 0) this.integrate(dt, { machine, frame, kPhi, torque, iArm, vArm, ifMeas, uf, ac60, acg, net, psuOn });

    // 11. 결과 정리 ───────────────────────────────────────────
    const rpm = st.rotorRpm;
    const freq = isAcOut ? electricalFreq(rpm, 2) : (['UNIVERSAL_MOTOR', 'SPLIT_PHASE_MOTOR', 'SHADED_POLE_MOTOR', 'REPULSION_MOTOR', 'ROTARY_CONV', 'INDUCTION_3PH'].includes(mt) && (psuOn || mt === 'INDUCTION_3PH') ? 60 : 0);
    st.lampBrightness = lampBrightness;
    st.lampOver = lampOver;
    st.warnings = warnings;
    st.calculatedValues = {
      machineType: mt,
      generatorRpm: Math.abs(rpm),
      rotorRpm: rpm,
      genTermVolt: vArm,
      genLoadCurr: Math.abs(iArm),
      iField: Math.abs(mt === 'DC_SERIES_MOTOR' ? ifMeas / MACHINE.seriesTurnRatio : ifMeas),
      fluxIf: st.fieldIf,
      galvanoVal: this.readings.M_GALVANO.value,
      frequency: freq,
      psuAcVolts: this.readings.M_AC_VOLT.value,
      psuDcVolts: this.readings.M_DC_VOLT.value,
      isAcOutput: isAcOut,
      torque,
      rcVac
    };
    this.buildScope(machine, isAcOut, vArm, rpm, acg, dcs, ac60, psuOn);
    this.lastSolve = { dcs, ac60, acg, net };
    return st.calculatedValues;
  }

  /** 시간적분: 구동 전동기, 회전자 속도, 계자 자속 */
  integrate(dt, ctx) {
    const st = this.state;
    const { machine, frame, kPhi, torque, iArm, vArm, ifMeas, uf, ac60, psuOn } = ctx;
    const mt = machine.type;
    const hasDrive = this.hasModule('IEG-6030-11');

    // (1) 구동 전동기 (IEG-6030-11): 설정속도로 1차 지연 응답 + 발전기 부하에 따른 속도 저하
    let driveTarget = 0;
    const motorPower = !!this.getControlValue('IEG-6030-11', 'MOTOR_POWER', false);
    if (hasDrive && st.autoDriverOn && motorPower && st.autoDriverDir !== 'STOP') {
      const pElec = Math.abs(vArm * iArm);
      const droop = st.beltLoadCoupled ? Math.min(0.3, pElec * MACHINE.driveDroopPerW) : 0;
      driveTarget = st.targetRpm * (1 - droop) * (st.autoDriverDir === 'CCW' ? -1 : 1);
    }
    st.autoDriverRpm += (driveTarget - st.autoDriverRpm) * Math.min(1, dt / MACHINE.driveTau);
    if (Math.abs(st.autoDriverRpm) < 0.5 && driveTarget === 0) st.autoDriverRpm = 0;

    // (2) 수동 회전 감속
    if (st.manualRpm > 0 && !st.continuousSpin) {
      st.manualRpm = Math.max(0, st.manualRpm - dt * 60);
    }

    // (3) 회전자 속도
    const isGen = GENERATOR_TYPES.has(mt);
    let rpm = st.rotorRpm;
    st.beltLoadCoupled = false;
    if (mt === 'ROTARY_CONV') {
      // 회전변류기: 교류 입력으로 동기속도(2극, 60Hz → 3600rpm)까지 기동
      const vac = frame ? C.abs(C.sub(ac60.v('IEG-6030-10:A1'), ac60.v('IEG-6030-10:B1'))) : 0;
      const tgt = (frame && vac > 6) ? syncSpeed(60, 2) : 0;
      rpm += (tgt - rpm) * Math.min(1, dt / MACHINE.inductionTau);
      if (Math.abs(rpm) < 1 && tgt === 0) rpm = 0;
    } else if (isGen) {
      if (hasDrive && this.assembly.beltConnected) {
        rpm = st.autoDriverRpm;          // 벨트 1:1 (슬립 무시)
        st.beltLoadCoupled = true;
      } else if (st.manualRpm > 0) {
        rpm = st.manualRpm * (st.manualDir === 'CCW' ? -1 : 1);
      } else {
        rpm += (0 - rpm) * Math.min(1, dt / 1.2);
        if (Math.abs(rpm) < 1) rpm = 0;
      }
    } else {
      // 전동기: 기계 방정식 J·dω/dt = T_em − T_f  (부분 스텝)
      let target = null;
      if (mt === 'INDUCTION_3PH') {
        target = this.inductionTarget(frame, uf);
      } else if (mt === 'SPLIT_PHASE_MOTOR') {
        target = this.splitPhaseTarget(frame, ac60);
      } else if (mt === 'SHADED_POLE_MOTOR') {
        const v = frame ? vArm : 0;
        target = v > 8 ? syncSpeed(60, 2) * (1 - MACHINE.shadedPoleSlip) * Math.min(1, v / 20) : 0;
      } else if (mt === 'REPULSION_MOTOR') {
        const shorted = frame && uf.same('IEG-6030-10:A1', 'IEG-6030-10:B1');
        const v = frame ? vArm : 0;
        target = (shorted && v > 6) ? MACHINE.repulsionRpmAt24V * Math.min(1.5, v / 24) : 0;
      } else if (mt === 'UNIVERSAL_MOTOR') {
        // 교류 직권(만능) 전동기: 자속과 전류가 동시에 반전 → 평균 토크 = kΦ(I)·I (항상 동일 방향)
        const w = rpmToOmega(rpm);
        const iu = frame ? (st.universalI || 0) : 0;
        const kp = Math.abs(occDc(iu * MACHINE.seriesTurnRatio) - MACHINE.residualV) / OMEGA_REF;
        const tem = kp * iu;
        let tnet = tem - frictionTorque(w);
        if (Math.abs(w) < 0.05 && tem <= MACHINE.frictionTc) tnet = 0;
        const wn = Math.max(0, w + tnet / MACHINE.inertiaJ * Math.min(dt, 0.02));
        rpm = Math.min(MACHINE.maxRpm, omegaToRpm(wn));
      } else if (['PM_DC_MOTOR', 'DC_SERIES_MOTOR', 'DC_COMPOUND_MOTOR'].includes(mt)) {
        // 전기적 상태를 부분 스텝마다 근사 재계산: Ia = (V_ext − kΦω)/R 는 직전 해석값 이용
        const w = rpmToOmega(rpm);
        const tf = frictionTorque(w);
        let tnet = torque - tf;
        if (Math.abs(w) < 0.05 && Math.abs(torque) <= MACHINE.frictionTc) tnet = 0; // 정지 마찰
        const wn = w + tnet / MACHINE.inertiaJ * Math.min(dt, 0.02);
        rpm = Math.max(-MACHINE.maxRpm, Math.min(MACHINE.maxRpm, omegaToRpm(wn)));
        if (Math.abs(rpm) >= MACHINE.maxRpm - 1) this.state.overspeed = true;
      }
      if (target !== null) {
        rpm += (target - rpm) * Math.min(1, dt / MACHINE.inductionTau);
        if (Math.abs(rpm) < 1 && target === 0) rpm = 0;
      }
    }
    st.rotorRpm = rpm;

    // (4) 계자 자속 (L/R 시정수 지연)
    if (['DC_GEN', 'SYNC_GEN_1PH', 'DC_SERIES_MOTOR', 'DC_COMPOUND_MOTOR'].includes(mt)) {
      const tau = mt === 'DC_SERIES_MOTOR' ? 0.05 : MACHINE.fieldTau;
      st.fieldIf += (ifMeas - st.fieldIf) * Math.min(1, dt / tau);
    } else {
      st.fieldIf = 0;
    }

    // (5) 회전각
    st.rotorAngle = (st.rotorAngle + (rpm / 60) * 360 * dt) % 360;

    // (6) 표시값 평활 (디지털 패널메타 응답)
    for (const r of Object.values(this.readings)) {
      if (r.id === 'M_GALVANO') { r.display += (r.value - r.display) * Math.min(1, dt / 0.05); continue; }
      r.display += (r.value - r.display) * Math.min(1, dt / 0.15);
      if (Math.abs(r.value - r.display) < 1e-4) r.display = r.value;
    }
  }

  /** 3상 유도전동기 목표 속도 (극수 전환기 내장 3상 전원 가정) */
  inductionTarget(frame, uf) {
    if (!frame || !this.hasModule('IEG-6030-12')) return 0;
    const pole = this.getControlValue('IEG-6030-12', 'POLE_SW', 'STOP');
    if (pole === 'STOP') return 0;
    // 극수 전환기 출력(U/V/W 상, a·b 단자)이 계철 프레임 A/B/C 권선에 어떻게 결선되었는지 (전선만 고려)
    const wuf = new UnionFind();
    for (const w of this.wires) wuf.union(`${w.from.moduleId}:${w.from.terminalId}`, `${w.to.moduleId}:${w.to.terminalId}`);
    for (const L of ['A', 'B', 'C']) wuf.union(`IEG-6030-10:${L}1`, `IEG-6030-10:${L}2`);
    const phases = [['UA', 'UB'], ['VA', 'VB'], ['WA', 'WB']];
    const lines = ['A1', 'B1', 'C1'];
    const perm = lines.map(l => phases.findIndex(ph => ph.some(t => wuf.same(`IEG-6030-12:${t}`, `IEG-6030-10:${l}`))));
    if (perm.some(p => p < 0) || new Set(perm).size !== 3) return 0; // 3선 모두 결선 필요 (결상 시 기동 불가)
    // 상순: 짝수 치환 = 정회전, 홀수 치환(2선 교체) = 역회전
    let inv = 0;
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) if (perm[i] > perm[j]) inv++;
    const dir = inv % 2 === 0 ? 1 : -1;
    const poles = pole === 'DELTA' ? 4 : 2;
    const s = poles === 4 ? MACHINE.inductionSlip4p : MACHINE.inductionSlip2p;
    return dir * syncSpeed(60, poles) * (1 - s);
  }

  /** 분상 기동 단상유도전동기 */
  splitPhaseTarget(frame, ac60) {
    const st = this.state;
    if (!frame) { st.splitPhaseRunning = false; return 0; }
    const im = ac60.branchI('W_MAIN');
    const ia = ac60.branchI('W_AUX');
    const mMain = C.abs(im), mAux = C.abs(ia);
    if (mMain < 0.1) { st.splitPhaseRunning = false; return 0; }
    // 기동 토크 ∝ Im·Ia·sin(φa − φm)
    const phaseDiff = C.arg(ia) - C.arg(im);
    const sinD = Math.sin(phaseDiff);
    st.splitPhaseAngle = phaseDiff * 180 / Math.PI;
    // 보조권선 전류와 위상차가 충분해야 회전자계가 형성되어 자기 기동
    if (!st.splitPhaseRunning && mAux > 0.03 && Math.abs(sinD) > 0.3) {
      st.splitPhaseRunning = true;
      st.splitPhaseDir = Math.sign(sinD);
    }
    if (!st.splitPhaseRunning) return 0;
    return (st.splitPhaseDir || 1) * syncSpeed(60, 2) * (1 - MACHINE.splitPhaseSlip);
  }

  /** 오실로스코프 표시 신호 구성 */
  buildScope(machine, isAcOut, vArm, rpm, acg, dcs, ac60, psuOn) {
    const mt = machine.type;
    const f = electricalFreq(rpm, 2);
    const sd = { type: 'none', traces: [], freq: 0, vpp: 0, label: '' };
    const F = 'IEG-6030-10';
    if (['SYNC_GEN_3PH', 'ROT_ARM_3PH'].includes(mt) && Math.abs(rpm) > 1) {
      const traces = ['A1', 'B1', 'C1'].map(t => {
        const ph = C.sub(acg.v(`${F}:${t}`), acg.v(`${F}:D1`));
        return { amp: C.abs(ph) * SQRT2, phase: C.arg(ph) };
      });
      Object.assign(sd, { type: 'sine3', traces, freq: f, vpp: traces[0].amp * 2, label: '상전압 A/B/C-N' });
    } else if (isAcOut && Math.abs(rpm) > 1) {
      Object.assign(sd, { type: 'sine', traces: [{ amp: vArm * SQRT2, phase: 0 }], freq: f, vpp: vArm * 2 * SQRT2, label: '발전 출력 A-B' });
    } else if (['DC_GEN', 'PM_DC_GEN'].includes(mt) && Math.abs(vArm) > 0.05) {
      // 2극 전기자 + 2편 정류자: 전파정류 파형 (평균 = 2Vm/π)
      const vm = vArm * Math.PI / 2;
      Object.assign(sd, { type: 'rectified', traces: [{ amp: vm, phase: 0 }], freq: f, vpp: Math.abs(vm), label: '정류 출력 A-B (평균 {v}V)', labelVars: { v: vArm.toFixed(1) } });
    } else if (Math.abs(vArm) > 0.05 && ['PM_DC_MOTOR', 'DC_SERIES_MOTOR', 'DC_COMPOUND_MOTOR', 'ROTARY_CONV'].includes(mt)) {
      Object.assign(sd, { type: 'dc', traces: [{ amp: vArm, phase: 0 }], freq: 0, vpp: 0, label: mt === 'ROTARY_CONV' ? '직류 출력 C-D' : '전기자 전압 A-B' });
    } else if (Math.abs(vArm) > 0.05) {
      Object.assign(sd, { type: 'sine', traces: [{ amp: vArm * SQRT2, phase: 0 }], freq: 60, vpp: vArm * 2 * SQRT2, label: '인가 전압' });
    }
    this.state.scopeData = sd;
  }

  update(dt) {
    const step = Math.min(dt, 0.05);
    // 전동기 동특성 안정화를 위해 부분 스텝
    const n = step > 0.02 ? 3 : 1;
    for (let i = 0; i < n; i++) this.solve(step / n);
  }
}
