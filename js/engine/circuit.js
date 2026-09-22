/**
 * IEG-6030 회로 네트워크 해석 및 전자기 연동 시뮬레이터 엔진
 */

import { MeterPhysicsEngine } from './meter_physics.js';
import { MachinePhysicsModel } from './machine_models.js';

export class CircuitEngine {
  constructor(moduleDefs) {
    this.moduleDefs = moduleDefs;
    this.meterPhysics = new MeterPhysicsEngine();
    this.machinePhysics = new MachinePhysicsModel();

    // 현재 랙에 장착된 모듈 상태 (슬롯 -> 모듈 인스턴스)
    this.modules = new Map();
    // 연결된 전선 목록: Array of { id, from: { moduleId, terminalId }, to: { moduleId, terminalId }, color }
    this.wires = [];

    // 기계적 조립 상태 (계철 프레임)
    this.assembly = {
      rotorType: 'DISK_A', // 'NONE', 'DISK_A', 'DISK_B', 'SQUIRREL_CAGE', 'FIELD_ROTOR'
      poles: {
        P1: { type: 'MAGNET_N', coil: false },
        P5: { type: 'MAGNET_S', coil: false }
      },
      beltConnected: false, // 11번 구동모터와 10번 발전기간 벨트 연결
      brushInstalled: true
    };

    // 실시간 계측 및 안전 상태
    this.state = {
      powerSupplyOn: false,
      autoDriverOn: false,
      autoDriverDir: 'STOP',
      autoDriverRpm: 0,
      targetRpm: 1800,
      shortCircuit: false,
      shortDetails: '',
      calculatedValues: {},
      lampBrightness: {},
      scopeData: {
        ch1: new Float32Array(256),
        ch2: new Float32Array(256),
        freq: 60,
        vpp: 0
      }
    };

    // 계측기 초기 등록
    this.initMeters();
  }

  initMeters() {
    // 06 전원 공급기
    this.meterPhysics.registerMeter('M_AC_VOLT', { minVal: 0, maxVal: 80, angleMin: -42, angleMax: 42 });
    this.meterPhysics.registerMeter('M_DC_VOLT', { minVal: 0, maxVal: 80, angleMin: -42, angleMax: 42 });
    // 07 교류 전압/전류계
    this.meterPhysics.registerMeter('M_AC_V', { minVal: 0, maxVal: 50, angleMin: -42, angleMax: 42 });
    this.meterPhysics.registerMeter('M_AC_A', { minVal: 0, maxVal: 5, angleMin: -42, angleMax: 42 });
    // 08 직류 전압/전류계
    this.meterPhysics.registerMeter('M_DC_V', { minVal: 0, maxVal: 50, angleMin: -42, angleMax: 42 });
    this.meterPhysics.registerMeter('M_DC_A', { minVal: 0, maxVal: 5, angleMin: -42, angleMax: 42 });
    // 09 직류 검류계
    this.meterPhysics.registerMeter('M_GALVANO', { minVal: -5, maxVal: 5, angleMin: -42, angleMax: 42 });
  }

  addWire(from, to, color = 'red') {
    // 중복 연결 방지
    const exists = this.wires.some(w =>
      (w.from.moduleId === from.moduleId && w.from.terminalId === from.terminalId &&
       w.to.moduleId === to.moduleId && w.to.terminalId === to.terminalId) ||
      (w.from.moduleId === to.moduleId && w.from.terminalId === to.terminalId &&
       w.to.moduleId === from.moduleId && w.to.terminalId === from.terminalId)
    );
    if (exists) return false;

    const wire = {
      id: `wire_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      from,
      to,
      color
    };
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

  // 연결 확인 헬퍼 함수
  areTerminalsConnected(termA, termB) {
    // BFS/DFS로 두 단자가 전선망을 통해 통전되는지 확인
    const startKey = `${termA.moduleId}:${termA.terminalId}`;
    const targetKey = `${termB.moduleId}:${termB.terminalId}`;
    if (startKey === targetKey) return true;

    // 인접 리스트 생성
    const adj = new Map();
    const addEdge = (u, v) => {
      if (!adj.has(u)) adj.set(u, []);
      if (!adj.has(v)) adj.set(v, []);
      adj.get(u).push(v);
      adj.get(v).push(u);
    };

    // 전선 연결
    for (const w of this.wires) {
      addEdge(`${w.from.moduleId}:${w.from.terminalId}`, `${w.to.moduleId}:${w.to.terminalId}`);
    }

    // 모듈 내부 도통 경로 추가
    for (const [mId, mDef] of Object.entries(this.moduleDefs)) {
      if (mId === 'IEG-6030-10') {
        addEdge(`${mId}:A1`, `${mId}:A2`);
        addEdge(`${mId}:B1`, `${mId}:B2`);
        addEdge(`${mId}:C1`, `${mId}:C2`);
        addEdge(`${mId}:D1`, `${mId}:D2`);
        addEdge(`${mId}:E1`, `${mId}:E2`);
      } else if (mId === 'IEG-6030-01') {
        // 01번 계자 저항기 (가변저항 단자간 도통)
        addEdge(`${mId}:T1`, `${mId}:T2`);
        addEdge(`${mId}:T2`, `${mId}:T3`);
        addEdge(`${mId}:T1`, `${mId}:T3`);
      } else if (mId === 'IEG-6030-02') {
        // 02번 기동 저항기
        addEdge(`${mId}:T1`, `${mId}:T2`);
        addEdge(`${mId}:T2`, `${mId}:T3`);
        addEdge(`${mId}:T1`, `${mId}:T3`);
      } else if (mId === 'IEG-6030-08') {
        // 08번 직류 전류계 분로 저항 도통
        addEdge(`${mId}:A_5A`, `${mId}:A_COM`);
        addEdge(`${mId}:A_2_5A`, `${mId}:A_COM`);
        addEdge(`${mId}:A_1A`, `${mId}:A_COM`);
        addEdge(`${mId}:A_100MA`, `${mId}:A_COM`);
      } else if (mId === 'IEG-6030-07') {
        // 07번 교류 전류계 분로 저항 도통
        addEdge(`${mId}:A_5A`, `${mId}:A_COM`);
        addEdge(`${mId}:A_2_5A`, `${mId}:A_COM`);
        addEdge(`${mId}:A_1A`, `${mId}:A_COM`);
        addEdge(`${mId}:A_100MA`, `${mId}:A_COM`);
      } else if (mId === 'IEG-6030-09') {
        // 09번 검류계 코일 도통
        addEdge(`${mId}:POS`, `${mId}:NEG`);
      } else if (mId === 'IEG-6030-03') {
        // 03번 램프 부하 단자
        addEdge(`${mId}:A`, `${mId}:T1`);
        addEdge(`${mId}:B`, `${mId}:T2`);
        addEdge(`${mId}:C`, `${mId}:T3`);
        addEdge(`${mId}:T1`, `${mId}:T4`);
        addEdge(`${mId}:T2`, `${mId}:T5`);
        addEdge(`${mId}:T3`, `${mId}:T6`);
      } else if (mId === 'IEG-6030-05') {
        // 05번 RLC 부하
        addEdge(`${mId}:T1`, `${mId}:T4`);
        addEdge(`${mId}:T2`, `${mId}:T5`);
        addEdge(`${mId}:T3`, `${mId}:T6`);
      }
    }

    const visited = new Set([startKey]);
    const queue = [startKey];

    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr === targetKey) return true;
      const neighbors = adj.get(curr) || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
    return false;
  }

  startRun(rpm = 1800, dir = 'CW') {
    this.state.autoDriverOn = true;
    this.state.autoDriverDir = dir;
    this.state.powerSupplyOn = true;
    this.state.targetRpm = rpm;
    this.setControlValue('IEG-6030-11', 'MOTOR_POWER', true);
    this.setControlValue('IEG-6030-11', 'MOTOR_DIR', dir);
    this.setControlValue('IEG-6030-11', 'MOTOR_DIR_idx', dir === 'CW' ? 2 : (dir === 'CCW' ? 0 : 1));
    this.setControlValue('IEG-6030-06', 'MAIN_POWER_SW', true);
    this.solve();
  }

  stopRun() {
    this.state.autoDriverOn = false;
    this.state.autoDriverDir = 'STOP';
    this.state.autoDriverRpm = 0;
    this.state.rotorRpm = 0;
    this.state.powerSupplyOn = false;
    this.setControlValue('IEG-6030-11', 'MOTOR_POWER', false);
    this.setControlValue('IEG-6030-11', 'MOTOR_DIR', 'STOP');
    this.setControlValue('IEG-6030-11', 'MOTOR_DIR_idx', 1);
    this.setControlValue('IEG-6030-06', 'MAIN_POWER_SW', false);
    this.solve();
  }

  isRunning() {
    return (this.state.autoDriverOn && this.state.autoDriverDir !== 'STOP') ||
           (Math.abs(this.state.autoDriverRpm) > 50) ||
           (Math.abs(this.state.rotorRpm || 0) > 50);
  }

  /**
   * 실시간 전기기계 및 회로 물리 해석 (Solve cycle)
   */
  solve() {
    this.state.shortCircuit = false;
    this.state.shortDetails = '';

    const hasDriveMotor = this.modules.has('IEG-6030-11');
    const isRunning = (this.state.autoDriverOn && this.state.autoDriverDir !== 'STOP');

    // 1. 모터 구동 모듈(11번) 운전 속도 계산
    let motorSpeed = 0;
    if (hasDriveMotor && isRunning) {
      motorSpeed = this.state.targetRpm;
      // 기동 저항기(02번)의 저항값에 따른 기동 속도 제어 반영
      const rStart = this.getControlValue('IEG-6030-02', 'R_START', 0);
      if (this.modules.has('IEG-6030-02') && rStart > 0) {
        // 기동 저항이 50Ω일 때 감속, 0Ω으로 갈수록 정격 속도 도달
        const speedRatio = Math.max(0.3, 1.0 - (rStart / 50.0) * 0.5);
        motorSpeed = motorSpeed * speedRatio;
      }
      if (this.state.autoDriverDir === 'CCW') motorSpeed = -motorSpeed;
    }
    this.state.autoDriverRpm = motorSpeed;

    // 2. 계철 프레임(10번) 로터 회전 속도 결정
    let generatorRpm = 0;
    let motorRpm = 0;

    if (hasDriveMotor) {
      // [발전기 모드]: 11번 구동 모터가 벨트를 통해 10번 발전기를 돌림
      if (this.assembly.beltConnected) {
        generatorRpm = Math.abs(motorSpeed) * 0.99;
      }
      this.state.rotorRpm = (this.state.autoDriverDir === 'CCW' ? -generatorRpm : generatorRpm);
    } else {
      // 구동 모터가 없는 경우 (수동 회전 실습 또는 전동기 직결 모드)
      const manualRpm = this.state.manualRpm || 0;
      if (Math.abs(manualRpm) > 0) {
        generatorRpm = Math.abs(manualRpm);
        motorRpm = (this.state.manualDir === 'CCW' ? -generatorRpm : generatorRpm);
      } else if (isRunning && this.state.powerSupplyOn) {
        // 전원공급기에 연결되어 전동기로 운전되는 경우
        const baseSpeed = this.state.targetRpm || 1800;
        motorRpm = (this.state.autoDriverDir === 'CCW' ? -baseSpeed : baseSpeed);
        generatorRpm = Math.abs(baseSpeed);
      } else {
        // 전원 공급도 없고 수동 회전도 없는 상태: 완벽한 정지 (0 RPM)
        motorRpm = 0;
        generatorRpm = 0;
      }
      this.state.rotorRpm = motorRpm;
      this.state.autoDriverRpm = 0;
    }

    // 3. 전원 공급기 모듈(06번) 출력 확인
    let psuAcVolts = 0;
    let psuDcVolts = 0;
    if (this.state.powerSupplyOn) {
      // 탭 연결 상태 확인
      const is50vConnected = this.areTerminalsConnected({ moduleId: 'IEG-6030-06', terminalId: 'AC_50V' }, { moduleId: 'IEG-6030-06', terminalId: 'AC_IN1' }) ||
                             this.areTerminalsConnected({ moduleId: 'IEG-6030-06', terminalId: 'AC_50V' }, { moduleId: 'IEG-6030-06', terminalId: 'RECT_5' });
      const is24vConnected = this.areTerminalsConnected({ moduleId: 'IEG-6030-06', terminalId: 'AC_24V' }, { moduleId: 'IEG-6030-06', terminalId: 'AC_IN2' }) ||
                             this.areTerminalsConnected({ moduleId: 'IEG-6030-06', terminalId: 'AC_24V' }, { moduleId: 'IEG-6030-06', terminalId: 'RECT_5' });
      const is12vConnected = this.areTerminalsConnected({ moduleId: 'IEG-6030-06', terminalId: 'AC_12V' }, { moduleId: 'IEG-6030-06', terminalId: 'AC_IN3' }) ||
                             this.areTerminalsConnected({ moduleId: 'IEG-6030-06', terminalId: 'AC_12V' }, { moduleId: 'IEG-6030-06', terminalId: 'RECT_5' });

      psuAcVolts = is50vConnected ? 50.0 : (is24vConnected ? 24.0 : (is12vConnected ? 12.0 : 22.0));
      // 정류 회로 연결 여부
      const rectConnected = this.areTerminalsConnected({ moduleId: 'IEG-6030-06', terminalId: 'AC_0V' }, { moduleId: 'IEG-6030-06', terminalId: 'RECT_6' });
      psuDcVolts = rectConnected ? psuAcVolts * 1.35 : (is50vConnected || is24vConnected || is12vConnected ? psuAcVolts * 1.35 : 48.0);
    }
    this.meterPhysics.setTargetValue('M_AC_VOLT', psuAcVolts);
    this.meterPhysics.setTargetValue('M_DC_VOLT', psuDcVolts);

    // 4. 가변 저항값 가져오기
    const rField = this.getControlValue('IEG-6030-01', 'R_FIELD', 100);
    const rStart = this.getControlValue('IEG-6030-02', 'R_START', 50);

    // 5. RLC 부하 합성 임피던스 계산
    let rLoad = 999999;
    const s1 = this.getControlValue('IEG-6030-05', 'S1', false);
    const s2 = this.getControlValue('IEG-6030-05', 'S2', false);
    const s3 = this.getControlValue('IEG-6030-05', 'S3', false);
    let gSum = 0;
    if (s1) gSum += 1 / 10;
    if (s2) gSum += 1 / 30;
    if (s3) gSum += 1 / 50;
    if (gSum > 0) rLoad = 1 / gSum;

    // 6. 발전기 기전력 및 출력 계산
    const p1Type = this.assembly.poles?.P1?.type;
    const p5Type = this.assembly.poles?.P5?.type;
    const hasPermanentMagnet = (
      (p1Type === 'PERM_N' || p1Type === 'MAGNET_N') &&
      (p5Type === 'PERM_S' || p5Type === 'MAGNET_S')
    );
    const isCoilExcited = (p1Type === 'COIL' || p1Type?.includes?.('COIL'));

    // 계자전류 계산
    let iField = 0;
    // 전원공급기에서 계자권선으로 공급되는지 확인 (타여자)
    const fieldConnectedToPsu = (
      this.areTerminalsConnected({ moduleId: 'IEG-6030-06', terminalId: 'DC_POS' }, { moduleId: 'IEG-6030-10', terminalId: 'C1' }) ||
      this.areTerminalsConnected({ moduleId: 'IEG-6030-06', terminalId: 'DC_POS' }, { moduleId: 'IEG-6030-01', terminalId: 'T1' })
    ) && (
      this.areTerminalsConnected({ moduleId: 'IEG-6030-06', terminalId: 'DC_NEG' }, { moduleId: 'IEG-6030-10', terminalId: 'D1' }) ||
      this.areTerminalsConnected({ moduleId: 'IEG-6030-06', terminalId: 'DC_NEG' }, { moduleId: 'IEG-6030-01', terminalId: 'T2' })
    );

    if (fieldConnectedToPsu && psuDcVolts > 0) {
      iField = psuDcVolts / (45.0 + rField);
    }

    // 자여자(분권) 연결 확인: 전기자 출력(A1/B1)이 계자(C1/D1)와 병렬 연결되었는지
    const isShuntConnected = this.areTerminalsConnected({ moduleId: 'IEG-6030-10', terminalId: 'A2' }, { moduleId: 'IEG-6030-10', terminalId: 'C1' }) &&
                             this.areTerminalsConnected({ moduleId: 'IEG-6030-10', terminalId: 'B2' }, { moduleId: 'IEG-6030-10', terminalId: 'D1' });

    let genEmf = 0;
    let genTermVolt = 0;
    let genLoadCurr = 0;

    if (isShuntConnected && generatorRpm > 500) {
      const selfRes = this.machinePhysics.calculateSelfExcitedOperatingPoint(generatorRpm, rField);
      genEmf = selfRes.emf;
      genTermVolt = selfRes.vTerminal;
      iField = selfRes.ifield;
    } else {
      genEmf = this.machinePhysics.calculateGeneratorEmf(generatorRpm, iField, hasPermanentMagnet, 2);
      genTermVolt = genEmf;
    }

    // 부하 연결 확인 (전기자 출력 A2/B2에 부하가 연결되었는지)
    const loadConnectedToGen = this.areTerminalsConnected({ moduleId: 'IEG-6030-10', terminalId: 'A2' }, { moduleId: 'IEG-6030-05', terminalId: 'T1' }) &&
                               this.areTerminalsConnected({ moduleId: 'IEG-6030-10', terminalId: 'B2' }, { moduleId: 'IEG-6030-05', terminalId: 'T4' });

    const lampConnectedToGen = this.areTerminalsConnected({ moduleId: 'IEG-6030-10', terminalId: 'A2' }, { moduleId: 'IEG-6030-03', terminalId: 'A' }) &&
                               this.areTerminalsConnected({ moduleId: 'IEG-6030-10', terminalId: 'B2' }, { moduleId: 'IEG-6030-03', terminalId: 'AP' });

    let activeLoadR = 999999;
    if (loadConnectedToGen && rLoad < 900000) {
      activeLoadR = rLoad;
    }
    if (lampConnectedToGen) {
      activeLoadR = 15.0; // 램프 등가 저항
    }

    if (activeLoadR < 900000 && genEmf > 0) {
      const loadRes = this.machinePhysics.calculateGeneratorTerminalVoltage(genEmf, activeLoadR, iField, isShuntConnected);
      genTermVolt = loadRes.vTerminal;
      genLoadCurr = loadRes.iLoad;
    }

    // 7. 계측기 연결 분석 및 바늘 목표값 세팅 (멀티 레인지 탭 지원)
    // 08 직류 전압계(V) 측정 연결 확인 (50V, 10V, 5V 탭 모두 지원)
    const dcVoltTerm = ['V_50V', 'V_10V', 'V_5V'].find(term => 
      (this.areTerminalsConnected({ moduleId: 'IEG-6030-08', terminalId: term }, { moduleId: 'IEG-6030-10', terminalId: 'A2' }) &&
       this.areTerminalsConnected({ moduleId: 'IEG-6030-08', terminalId: 'V_COM' }, { moduleId: 'IEG-6030-10', terminalId: 'B2' })) ||
      (this.areTerminalsConnected({ moduleId: 'IEG-6030-08', terminalId: term }, { moduleId: 'IEG-6030-10', terminalId: 'B2' }) &&
       this.areTerminalsConnected({ moduleId: 'IEG-6030-08', terminalId: 'V_COM' }, { moduleId: 'IEG-6030-10', terminalId: 'A2' })) ||
      (this.areTerminalsConnected({ moduleId: 'IEG-6030-08', terminalId: term }, { moduleId: 'IEG-6030-06', terminalId: 'DC_POS' }) &&
       this.areTerminalsConnected({ moduleId: 'IEG-6030-08', terminalId: 'V_COM' }, { moduleId: 'IEG-6030-06', terminalId: 'DC_NEG' }))
    );
    const dcVoltConnected = !!dcVoltTerm;
    const actualDcVolt = dcVoltConnected ? (genTermVolt > 0 ? genTermVolt : psuDcVolts) : 0;
    let meterDeflectionV = actualDcVolt;
    if (dcVoltTerm === 'V_10V') {
      meterDeflectionV = (actualDcVolt / 10.0) * 50.0;
    } else if (dcVoltTerm === 'V_5V') {
      meterDeflectionV = (actualDcVolt / 5.0) * 50.0;
    }
    this.meterPhysics.setTargetValue('M_DC_V', Math.min(55, meterDeflectionV));

    // 08 직류 전류계(A) 측정 연결 확인 (5A, 2.5A, 1A, 100mA 탭 모두 지원)
    const dcAmpTerm = ['A_5A', 'A_2_5A', 'A_1A', 'A_100MA'].find(term => 
      this.areTerminalsConnected({ moduleId: 'IEG-6030-08', terminalId: term }, { moduleId: 'IEG-6030-10', terminalId: 'A2' }) ||
      this.areTerminalsConnected({ moduleId: 'IEG-6030-08', terminalId: term }, { moduleId: 'IEG-6030-06', terminalId: 'DC_POS' }) ||
      this.areTerminalsConnected({ moduleId: 'IEG-6030-08', terminalId: term }, { moduleId: 'IEG-6030-03', terminalId: 'A' })
    );
    const dcAmpConnected = !!dcAmpTerm;
    const actualDcAmp = (dcAmpConnected && activeLoadR < 900000) ? genLoadCurr : (fieldConnectedToPsu ? iField : 0);
    let meterDeflectionA = actualDcAmp;
    if (dcAmpTerm === 'A_1A') {
      meterDeflectionA = (actualDcAmp / 1.0) * 5.0;
    } else if (dcAmpTerm === 'A_2_5A') {
      meterDeflectionA = (actualDcAmp / 2.5) * 5.0;
    } else if (dcAmpTerm === 'A_100MA') {
      meterDeflectionA = (actualDcAmp / 0.1) * 5.0;
    }
    this.meterPhysics.setTargetValue('M_DC_A', Math.min(5.5, meterDeflectionA));

    // 07 교류 전압계(AC V) / 전류계(AC A)
    const acVoltTermGen = ['V_50V', 'V_10V', 'V_5V'].find(term => 
      (this.areTerminalsConnected({ moduleId: 'IEG-6030-07', terminalId: term }, { moduleId: 'IEG-6030-10', terminalId: 'A2' }) &&
       this.areTerminalsConnected({ moduleId: 'IEG-6030-07', terminalId: 'V_COM' }, { moduleId: 'IEG-6030-10', terminalId: 'B2' })) ||
      (this.areTerminalsConnected({ moduleId: 'IEG-6030-07', terminalId: term }, { moduleId: 'IEG-6030-10', terminalId: 'B2' }) &&
       this.areTerminalsConnected({ moduleId: 'IEG-6030-07', terminalId: 'V_COM' }, { moduleId: 'IEG-6030-10', terminalId: 'A2' }))
    );
    const acVoltTermPsu = ['V_50V', 'V_10V', 'V_5V'].find(term => 
      this.areTerminalsConnected({ moduleId: 'IEG-6030-07', terminalId: term }, { moduleId: 'IEG-6030-06', terminalId: 'AC_50V' }) ||
      this.areTerminalsConnected({ moduleId: 'IEG-6030-07', terminalId: term }, { moduleId: 'IEG-6030-06', terminalId: 'AC_24V' }) ||
      this.areTerminalsConnected({ moduleId: 'IEG-6030-07', terminalId: term }, { moduleId: 'IEG-6030-06', terminalId: 'AC_12V' })
    );
    const acVoltTerm = acVoltTermGen || acVoltTermPsu;
    const actualAcVolt = acVoltTermGen ? genTermVolt : (acVoltTermPsu ? psuAcVolts : 0);
    let meterDeflectionAcV = actualAcVolt;
    if (acVoltTerm === 'V_10V') meterDeflectionAcV = (actualAcVolt / 10.0) * 50.0;
    else if (acVoltTerm === 'V_5V') meterDeflectionAcV = (actualAcVolt / 5.0) * 50.0;
    this.meterPhysics.setTargetValue('M_AC_V', Math.min(55, meterDeflectionAcV));

    const acAmpTerm = ['A_5A', 'A_2_5A', 'A_1A', 'A_100MA'].find(term => 
      this.areTerminalsConnected({ moduleId: 'IEG-6030-07', terminalId: term }, { moduleId: 'IEG-6030-10', terminalId: 'A2' }) ||
      this.areTerminalsConnected({ moduleId: 'IEG-6030-07', terminalId: term }, { moduleId: 'IEG-6030-04', terminalId: 'U' })
    );
    const actualAcAmp = (acAmpTerm && activeLoadR < 900000) ? (actualAcVolt / activeLoadR) : 0;
    let meterDeflectionAcA = actualAcAmp;
    if (acAmpTerm === 'A_1A') meterDeflectionAcA = (actualAcAmp / 1.0) * 5.0;
    else if (acAmpTerm === 'A_2_5A') meterDeflectionAcA = (actualAcAmp / 2.5) * 5.0;
    else if (acAmpTerm === 'A_100MA') meterDeflectionAcA = (actualAcAmp / 0.1) * 5.0;
    this.meterPhysics.setTargetValue('M_AC_A', Math.min(5.5, meterDeflectionAcA));

    // 09 직류 검류계(Galvano) 연결 확인 (실습 01: 영구자석 회전 시 미소전류 관찰)
    const isNormalPolarity = (
      this.areTerminalsConnected({ moduleId: 'IEG-6030-09', terminalId: 'POS' }, { moduleId: 'IEG-6030-10', terminalId: 'A2' }) &&
      this.areTerminalsConnected({ moduleId: 'IEG-6030-09', terminalId: 'NEG' }, { moduleId: 'IEG-6030-10', terminalId: 'B2' })
    );
    const isReversePolarity = (
      this.areTerminalsConnected({ moduleId: 'IEG-6030-09', terminalId: 'NEG' }, { moduleId: 'IEG-6030-10', terminalId: 'A2' }) &&
      this.areTerminalsConnected({ moduleId: 'IEG-6030-09', terminalId: 'POS' }, { moduleId: 'IEG-6030-10', terminalId: 'B2' })
    );
    const galvanoConnected = isNormalPolarity || isReversePolarity;
    let galvanoVal = 0;
    if (galvanoConnected && (hasPermanentMagnet || isCoilExcited)) {
      const galvanoRange = this.getControlValue('IEG-6030-09', 'RANGE_SEL', 50);
      const mGalvano = this.meterPhysics.meters.get('M_GALVANO');
      if (mGalvano) {
        mGalvano.minVal = -galvanoRange;
        mGalvano.maxVal = galvanoRange;
      }
      // 회전 속도가 0이거나 정지 상태면 유도 기전력 및 검류계 지시치는 엄격히 0mA
      if (generatorRpm > 0 || Math.abs(this.state.rotorRpm) > 0) {
        const effRpm = generatorRpm || Math.abs(this.state.rotorRpm);
        // 교재 실습 1 기대값: 수동 회전(약 150~300 RPM) 시 ±2.5 ~ ±4.0 mA
        const baseCurrent = Math.min(galvanoRange, (effRpm / 300) * 3.5);
        const dirSign = (this.state.rotorRpm < 0 || this.state.manualDir === 'CCW') ? -1 : 1;
        const polSign = isNormalPolarity ? 1 : -1;
        galvanoVal = baseCurrent * dirSign * polSign;
      } else {
        galvanoVal = 0;
      }
    }
    this.meterPhysics.setTargetValue('M_GALVANO', galvanoVal);

    // 8. 램프 밝기 계산 (0~100%)
    let lampRatio = 0;
    if (lampConnectedToGen && genTermVolt > 1) {
      lampRatio = Math.min(1.0, genTermVolt / 12.0);
    }
    this.state.lampBrightness = {
      L1: lampRatio,
      L2: lampRatio * 0.8,
      L3: lampRatio * 0.6
    };

    // 9. 오실로스코프 신호 갱신
    this.updateScopeWaveform(genTermVolt > 0 ? genTermVolt : psuAcVolts, generatorRpm > 0 ? (generatorRpm / 60) : 60);

    this.state.calculatedValues = {
      genEmf,
      genTermVolt,
      genLoadCurr,
      iField,
      generatorRpm,
      psuAcVolts,
      psuDcVolts
    };
  }

  updateScopeWaveform(amplitude, freq) {
    const data = this.state.scopeData.ch1;
    const len = data.length;
    const timeScale = 0.05;
    const effectiveAmp = Math.max(0.2, Math.min(45, amplitude));

    for (let i = 0; i < len; i++) {
      const t = (i / len) * timeScale;
      // 노이즈 포함된 부드러운 사인파
      const wave = Math.sin(2 * Math.PI * freq * t) * effectiveAmp;
      data[i] = wave;
    }
    this.state.scopeData.freq = Math.round(freq);
    this.state.scopeData.vpp = (effectiveAmp * 2).toFixed(1);
  }

  getControlValue(moduleId, controlId, defaultVal) {
    const mod = this.modules.get(moduleId);
    if (!mod || !mod.controls) return defaultVal;
    if (controlId === 'MOTOR_SPEED' && mod.controls['SPEED_KNOB'] !== undefined) {
      return mod.controls['SPEED_KNOB'];
    }
    if (controlId === 'SPEED_KNOB' && mod.controls['MOTOR_SPEED'] !== undefined) {
      return mod.controls['MOTOR_SPEED'];
    }
    const ctrl = mod.controls[controlId];
    return ctrl !== undefined ? ctrl : defaultVal;
  }

  setControlValue(moduleId, controlId, value) {
    if (!this.modules.has(moduleId)) {
      this.modules.set(moduleId, { controls: {} });
    }
    const mod = this.modules.get(moduleId);
    if (!mod.controls) mod.controls = {};
    mod.controls[controlId] = value;
    if (controlId === 'SPEED_KNOB') mod.controls['MOTOR_SPEED'] = value;
    if (controlId === 'MOTOR_SPEED') mod.controls['SPEED_KNOB'] = value;
    this.solve();
  }

  update(dt) {
    this.meterPhysics.update(dt);
  }
}
