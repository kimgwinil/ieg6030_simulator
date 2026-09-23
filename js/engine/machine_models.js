/**
 * IEG-6030 전기기계 전자기 물리 수학 모델
 * 매뉴얼 3장, 4장, 5장, 6장 이론 및 실험 공식 기반
 */

export class MachinePhysicsModel {
  constructor() {
    // 발전기 기본 파라미터 (IEG 6030 교육용 소형기기 정격, 교재 포화곡선 준거)
    this.generator = {
      poles: 2,               // 기본 2극
      armatureResistance: 2.5,// 전기자 저항 Ra [Ω]
      fieldResistance: 45.0,  // 계자 권선 저항 Rf [Ω]
      residualFluxVoltage: 1.8,// 잔류자기에 의한 초기 전압 E_res [V] @ 1800RPM
      saturationKe: 0.022,    // 기전력 계수
      satConstant: 0.449,     // 포화 상수 (GEN-06: If=0.1A→18V, 0.4A→46V 최적화)
      maxNoLoadVoltage: 95.5, // 포화 Emax [V] (Froelich 모델 최적화)
      criticalRheostat: 80.0, // 자여자 임계 가변저항 [Ω] (이상 → 미확립)
      inertia: 0.05
    };

    // 전동기 파라미터
    this.motor = {
      ratedVoltage: 90.0,
      ratedCurrent: 0.4,
      ratedSpeed: 3000,
      armatureResistance: 12.0,
      fieldResistance: 180.0,
      torqueConst: 0.15
    };
  }

  /**
   * 직류 발전기 무부하 유도 기전력 계산 (무부하 포화 곡선)
   * @param {number} rpm 회전 속도 [RPM]
   * @param {number} ifield 계자 전류 [A] (자석일 경우 등가 자속)
   * @param {boolean} isPermanentMagnet 영구자석 여부
   * @param {number} poleCount 자극 수 (2, 4 등)
   */
  calculateGeneratorEmf(rpm, ifield, isPermanentMagnet = false, poleCount = 2) {
    if (rpm <= 10) return 0;
    const speedRatio = rpm / 1800.0;

    if (isPermanentMagnet) {
      // 영구자석 발전기: 자속 Phi가 일정하므로 기전력은 속도에 선형 비례
      const baseEmf = 14.5 * (poleCount / 2); // 1800 RPM 기준 약 14.5V
      return baseEmf * speedRatio;
    }

    // 전자석(계자권선): 히스테리시스 잔류자기 + 계자전류에 의한 포화곡선
    const eRes = this.generator.residualFluxVoltage * speedRatio;
    if (ifield <= 0.001) {
      return eRes;
    }

    // 비선형 포화곡선 모델 (Froelich's equation / Tanh)
    // E = speedRatio * (E_res + E_max * If / (K_sat + If))
    const eMax = this.generator.maxNoLoadVoltage;
    const eFlux = (eMax * ifield) / (this.generator.satConstant + ifield);
    return speedRatio * (eRes + eFlux);
  }

  /**
   * 자여자 분권 발전기 전압 확립 계산 (Building-Up Process)
   * 계자 저항선 R_f_total = R_coil + R_rheostat
   * 임계 가변저항(criticalRheostat) 이상이면 전압 확립 실패
   */
  calculateSelfExcitedOperatingPoint(rpm, rRheostat) {
    if (rpm < 600) return { emf: 0, vTerminal: 0, ifield: 0, established: false };

    const speedRatio = rpm / 1800.0;
    const rTotal = this.generator.fieldResistance + rRheostat;
    const critR = this.generator.criticalRheostat || 80.0;

    // 임계 가변저항 이상이면 전압 확립 실패 (교재 GEN-05 준거)
    if (rRheostat >= critR) {
      const eRes = this.generator.residualFluxVoltage * speedRatio;
      return { emf: eRes, vTerminal: eRes, ifield: eRes / rTotal, established: false };
    }

    // 수치적 교점 탐색 (0 ~ 1.5A)
    let bestIf = 0;
    let established = false;

    for (let curIf = 0.01; curIf <= 1.5; curIf += 0.005) {
      const emf = this.calculateGeneratorEmf(rpm, curIf, false);
      const vLine = curIf * rTotal; // 계자 저항선
      if (emf >= vLine) {
        bestIf = curIf;
        established = true;
      } else if (established) {
        break;
      }
    }

    if (!established) {
      const eRes = this.generator.residualFluxVoltage * speedRatio;
      return { emf: eRes, vTerminal: eRes, ifield: eRes / rTotal, established: false };
    }

    const finalEmf = this.calculateGeneratorEmf(rpm, bestIf, false);
    // 단자전압 = EMF - If * Ra (무부하이므로 Ia ≈ If)
    const vTerminal = Math.max(0, finalEmf - bestIf * this.generator.armatureResistance);
    return {
      emf: finalEmf,
      vTerminal,
      ifield: bestIf,
      established: true
    };
  }

  /**
   * 발전기 부하 특성 계산 (외부 특성 곡선)
   * V = E - Ia * Ra - deltaV_brush
   */
  calculateGeneratorTerminalVoltage(emf, loadResistance, ifield = 0, isShunt = false) {
    if (loadResistance <= 0.01) {
      // 단락 상태
      const shortCurrent = emf / (this.generator.armatureResistance + 0.1);
      return { vTerminal: 0, iLoad: shortCurrent, isShort: true };
    }

    const ra = this.generator.armatureResistance;
    if (isShunt) {
      // 분권: Ia = I_load + If
      // V = E - (I_load + If) * Ra = I_load * R_load
      // I_load * (R_load + Ra) = E - If * Ra
      const num = Math.max(0, emf - ifield * ra);
      const iLoad = num / (loadResistance + ra);
      const vTerm = iLoad * loadResistance;
      return { vTerminal: Math.max(0, vTerm), iLoad, isShort: false };
    } else {
      // 타여자: Ia = I_load
      const iLoad = emf / (loadResistance + ra);
      const vTerm = iLoad * loadResistance;
      return { vTerminal: Math.max(0, vTerm), iLoad, isShort: false };
    }
  }

  /**
   * 3상 동기 발전기 유도 기전력 및 주파수 계산
   * E = 4.44 * f * N * Phi * Kw
   * f = P * Ns / 120
   */
  calculate3PhaseGenerator(rpm, ifield, loadType = 'Y', rPhase = 100) {
    const poles = 4;
    const freq = (poles * rpm) / 120.0; // 1800 RPM -> 60 Hz
    const speedRatio = rpm / 1800.0;

    // 상기전력 (Phase Voltage)
    const basePhaseVoltage = 24.0 * speedRatio * (ifield > 0 ? Math.min(1.5, ifield / 0.3) : 0.8);
    const vPhase = basePhaseVoltage;
    const vLine = loadType === 'Y' ? Math.sqrt(3) * vPhase : vPhase;

    // 전류 계산
    const iLine = vLine / (rPhase + 1.0);
    return {
      freq,
      vPhase,
      vLine,
      iLine,
      power: Math.sqrt(3) * vLine * iLine
    };
  }

  /**
   * 직류 전동기 특성 계산 (기동 및 운전)
   * Ia = (V - Ec) / (Ra + Rstart)
   * Ec = Ke * Phi * n
   */
  calculateDcMotor(vSupply, rStart, rField, mechanicalLoad = 0.05) {
    if (vSupply < 5) return { speed: 0, current: 0, torque: 0, backEmf: 0 };

    const ra = this.motor.armatureResistance + rStart;
    const rf = this.motor.fieldResistance + rField;
    const ifield = vSupply / rf;
    const phiRatio = Math.min(1.5, ifield / 0.2); // 계자 자속 비례

    // 균형 속도 계산 (토크 = 기계적 부하)
    // T = Kt * Phi * Ia = mechanicalLoad * speed
    // Ia = (V - Ke * Phi * speed) / Ra
    const ke = 0.025;
    const kt = 0.2;
    const num = kt * phiRatio * vSupply;
    const denom = mechanicalLoad * ra + kt * phiRatio * (ke * phiRatio);
    const speed = Math.max(0, Math.min(3500, num / denom));

    const backEmf = ke * phiRatio * speed;
    const ia = Math.max(0, (vSupply - backEmf) / ra);
    const torque = kt * phiRatio * ia;

    return { speed, current: ia, torque, backEmf, ifield };
  }
}
