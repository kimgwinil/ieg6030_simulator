/**
 * IEG-6030 시뮬레이터 — 이론 계산값 대조 테스트
 * 실행: node tests/verify_theory.mjs
 *
 * 각 실습을 정답 배선으로 운전한 뒤, 계측기에 표시되는 값과
 * 교재 이론식(엔진과 별도로 여기서 직접 계산)을 비교한다.
 */
import { MODULE_DEFS } from '../js/modules/module_defs.js';
import { CircuitEngine } from '../js/engine/circuit.js';
import { EXPERIMENTS_DATA } from '../js/curriculum/experiments_data.js';

// ── 이론 상수 (교재/모델 파라미터) ──
const SQ2 = Math.SQRT2;
const Ra = 2.5, Rar = 2.0, Rf = 39, RpsuDC = 0.5, Rgalv = 300;
const occ = (If) => 1.8 + 50 * Math.tanh(If / 0.28);          // 무부하 포화곡선 @1800rpm
const occSync = (If) => 1.0 + 25.8 * Math.tanh(Math.abs(If) / 0.28);
const vdcBridge = (vac) => SQ2 * vac - 1.4;                     // 브리지 정류 + 평활 (다이오드 2개 강하)
const cabs = (re, im) => Math.hypot(re, im);

let pass = 0, fail = 0;
function check(name, sim, theory, tolPct = 1.0) {
  const err = Math.abs(sim - theory) / Math.max(1e-9, Math.abs(theory)) * 100;
  const ok = err <= tolPct;
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(52)} 시뮬 ${sim.toFixed(3).padStart(9)}  이론 ${theory.toFixed(3).padStart(9)}  오차 ${err.toFixed(2)}%`);
}

function load(id, mutate) {
  const exp = JSON.parse(JSON.stringify(EXPERIMENTS_DATA.find(e => e.id === id)));
  const e = new CircuitEngine(MODULE_DEFS);
  e.setRackModules(exp.modules);
  const a = exp.assemblyConfig;
  Object.assign(e.assembly, { rotorType: a.rotor, requiredRotor: a.rotor, poles: a.poles || {}, beltConnected: !!a.beltInstalled, machine: a.machine });
  for (const [m, cs] of Object.entries(exp.presets || {})) for (const [c, v] of Object.entries(cs)) e.setControlValue(m, c, v, true);
  e.state.targetRpm = e.getControlValue('IEG-6030-11', 'MOTOR_SPEED', 1800);
  e.hardReset();
  for (const w of exp.targetWires) e.addWire(w.from, w.to, w.color);
  if (mutate) mutate(e);
  return e;
}
const run = (e, s) => { for (let t = 0; t < s; t += 1 / 60) e.update(1 / 60); };
const rd = (e, id) => e.readings[id].display;
const rpmOf = (e) => Math.abs(e.state.rotorRpm);

console.log('── 전원공급기 ──');
{ const e = load('GEN-04'); e.startRun(); run(e, 6);
  const Idc = rd(e, 'M_DC_A');
  check('PSU DC 출력 = √2·12V − 1.4V − I·Rint', rd(e, 'M_DC_VOLT'), vdcBridge(12) - Idc * RpsuDC, 0.5); }

console.log('── 발전기 ──');
{ const e = load('GEN-01'); e.startRun(); run(e, 3);
  let peak = 0; for (let t = 0; t < 3; t += 1 / 240) { e.update(1 / 240); peak = Math.max(peak, Math.abs(e.readings.M_GALVANO.value)); }
  const E = 14.5 * 150 / 1800;
  check('GEN-01 검류계 최대전류 = √2·E/(Ra+Rg) [mA]', peak, SQ2 * E / (Ra + Rgalv) * 1000, 1); }
{ const e = load('GEN-02'); e.startRun(); run(e, 6); const n = rpmOf(e);
  check('GEN-02 교류 기전력 E = 14.5·n/1800', rd(e, 'M_AC_V'), 14.5 * n / 1800);
  check('GEN-02 주파수 f = P·n/120 (P=2)', e.state.calculatedValues.frequency, 2 * n / 120); }
{ const e = load('GEN-03'); e.startRun(); run(e, 6); const n = rpmOf(e);
  check('GEN-03 정류 평균 = (2√2/π)·14.5·n/1800', rd(e, 'M_DC_V'), (2 * SQ2 / Math.PI) * 14.5 * n / 1800); }
for (const R of [100, 50, 0]) {
  const e = load('GEN-06', x => x.setControlValue('IEG-6030-01', 'R_FIELD', R, true)); e.startRun(); run(e, 8);
  const n = rpmOf(e);
  const Vdc = vdcBridge(12);
  const If = Vdc / (RpsuDC + 0.1 + Math.max(0.2, R) + Rf);   // 가변저항 최소 접촉저항 0.2Ω
  check(`GEN-06 계자전류 If = Vdc/(Rint+Rsh+R+Rf), R=${R}Ω`, rd(e, 'M_DC_A'), If, 0.5);
  check(`GEN-06 무부하 기전력 E = OCC(If)·n/1800, R=${R}Ω`, rd(e, 'M_DC_V'), occ(If) * n / 1800, 0.5);
}
{ // 자려: E(If)·n/1800 = If·(Rf + R + Ra + Rar) 의 교점 (잔류자기에서 출발한 반복 해)
  for (const rpm of [1000, 1800]) {
    const e = load('GEN-05', x => x.setControlValue('IEG-6030-11', 'MOTOR_SPEED', rpm, true)); e.state.targetRpm = rpm; e.startRun(rpm); run(e, 15);
    const n = rpmOf(e), Rt = Rf + 100 + Ra + Rar;
    let If = 0; for (let k = 0; k < 5000; k++) If = occ(If) * n / 1800 / Rt;
    check(`GEN-05 자려 확립전압 V = E − If·(Ra+Rar) @${rpm}rpm`, rd(e, 'M_DC_V'), occ(If) * n / 1800 - If * (Ra + Rar), 1.5);
  }
}
for (const sw of [['S3'], ['S2'], ['S1']]) {
  const Rl = { S1: 10, S2: 30, S3: 50 }[sw[0]];
  const e = load('GEN-07', x => x.setControlValue('IEG-6030-05', sw[0], true, true)); e.startRun(); run(e, 10);
  const n = rpmOf(e);
  const If = e.state.calculatedValues.iField;
  const E = occ(If) * n / 1800;
  const I = E / (Rl + Ra + Rar + 0.02);
  check(`GEN-07 부하전류 I = E/(RL+Ra+Rar), RL=${Rl}Ω`, rd(e, 'M_DC_A'), I, 0.5);
  check(`GEN-07 단자전압 V = I·RL, RL=${Rl}Ω`, rd(e, 'M_DC_V'), I * Rl, 0.5);
}
{ const e = load('GEN-08'); e.startRun(); run(e, 6); const n = rpmOf(e);
  const If = e.state.calculatedValues.iField;
  check('GEN-08 교류 기전력 E = OCCsync(If)·n/1800', rd(e, 'M_AC_V'), occSync(If) * n / 1800, 0.5); }
{ const e = load('GEN-09', x => x.setControlValue('IEG-6030-05', 'S2', true, true)); e.startRun(); run(e, 6); const n = rpmOf(e);
  const E = occSync(e.state.calculatedValues.iField) * n / 1800, w = 2 * Math.PI * n / 60;
  const RL = 30 + 0.02, Xs = w * 0.04;
  const I = E / cabs(RL + Ra, Xs);
  check('GEN-09 R부하 단자전압 V = |E·RL/(RL+Ra+jXs)|', rd(e, 'M_AC_V'), I * 30, 0.5); }
{ const e = load('GEN-11'); e.startRun(); run(e, 6); const n = rpmOf(e);
  const E = 12 * n / 1800, w = 2 * Math.PI * n / 60, Rl = 12 / 0.25;
  const Vp = E * Rl / cabs(Rl + Ra, w * 0.02);
  check('GEN-11 Y부하 상전압 Vp', rd(e, 'M_AC_V'), Vp, 0.5);
  e.wires = e.wires.filter(x => !(x.from.terminalId === 'N' && x.to.moduleId === 'IEG-6030-07'));
  e.addWire({ moduleId: 'IEG-6030-04', terminalId: 'V' }, { moduleId: 'IEG-6030-07', terminalId: 'V_COM' }); run(e, 1);
  check('GEN-11 선간전압 VL = √3·Vp', rd(e, 'M_AC_V'), Math.sqrt(3) * Vp, 0.5); }
{ const e = load('GEN-13'); e.startRun(); run(e, 8);
  const Vab = e.state.calculatedValues.rcVac;
  check('GEN-13 회전변류기 직류 = √2·Vac', rd(e, 'M_DC_V'), SQ2 * Vab, 0.5);
  check('GEN-13 동기속도 = 120·60/2', rpmOf(e), 3600, 0.5); }

console.log('── 전동기 ──');
{ const e = load('MOT-02'); e.startRun(); run(e, 15);
  const V = rd(e, 'M_DC_V'), I = rd(e, 'M_DC_A'), kPhi = (2 * SQ2 / Math.PI) * 14.5 / (2 * Math.PI * 1800 / 60);
  check('MOT-02 속도 n = (V − Ia·Ra)/kΦ', rpmOf(e), (V - I * (Ra + Rar)) / kPhi * 60 / (2 * Math.PI), 1.0); }
{ const e = load('MOT-09'); e.startRun(); run(e, 8);
  check('MOT-09 LOW(4극) n = 120f/P·(1−s)', rpmOf(e), 120 * 60 / 4 * (1740 / 1800), 0.5);
  e.setControlValue('IEG-6030-12', 'POLE_SW', 'Y'); run(e, 10);
  check('MOT-09 HIGH(2극) n = 120f/P·(1−s)', rpmOf(e), 120 * 60 / 2 * (3450 / 3600), 0.5); }
{ const e = load('MOT-08', x => { for (const w of x.wires) { if (w.from.terminalId === 'UA') w.from.terminalId = 'VA'; else if (w.from.terminalId === 'VA') w.from.terminalId = 'UA'; } x.solve(); });
  e.startRun(); run(e, 8);
  check('MOT-08 2선 교체 시 역회전 (−1740rpm)', e.state.rotorRpm, -1740, 0.5); }

console.log(`\n결과: ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
