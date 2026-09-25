/**
 * IEG-6030 전기기계 파라미터 및 전자기 특성식
 * (교재 3장·5장 이론식 기반, 교육용 소형기기 등가 파라미터)
 *
 * 모든 기전력 특성은 기준 속도 1800 rpm 값으로 정의하고 E ∝ n 으로 환산한다.
 *   E = K·Φ·n  →  E(n) = E_1800 × (n / 1800)
 */

export const N_REF = 1800;                       // 특성 기준 회전수 [rpm]
export const OMEGA_REF = 2 * Math.PI * N_REF / 60; // 188.5 rad/s

export const MACHINE = {
  // ── 직류기 (2극 전기자, B형 브러시 = 정류자) ──
  armatureR: 2.5,          // 전기자 권선 저항 Ra [Ω]
  armatureL: 0.01,         // 전기자 인덕턴스 [H]
  armatureReactionR: 2.0,  // 전기자 반작용 + 브러시 접촉 강하 등가저항 [Ω] (부하 특성용)

  // ── 계자권선 ──
  shuntFieldR: 39.0,       // 계자권선/700회 × 2 직렬 저항 [Ω]
  shuntFieldL: 2.0,        // 계자권선 인덕턴스 [H]
  seriesFieldR: 6.0,       // 계자권선/300회 (직권 계자) 저항 [Ω]
  seriesFieldL: 0.15,
  seriesTurnRatio: 300 / 700, // 직권 계자 기자력 환산비
  fieldTau: 0.35,          // 계자 자속 시정수 [s] (전압 확립 과정 재현)

  // ── 무부하 포화곡선 (1800 rpm) : E = Er + Ea·tanh(If / I0) ──
  residualV: 1.8,          // 잔류자기 전압 Er [V]
  satEa: 50.0,             // 포화 기전력 성분 [V]
  satI0: 0.28,             // 포화 기준 계자전류 [A]

  // ── 영구자석 계자 (원형 영구자석 N/S) ──
  pmAcRms: 14.5,           // 슬립링(A형 브러시) 교류 기전력 실효값 @1800rpm [V]
  // 정류자(B형 브러시) 직류 평균값 = (2√2/π)·Erms = 0.9·Erms
  pmDcFactor: 2 * Math.SQRT2 / Math.PI,

  // ── 회전계자형 단상 교류발전기 (돌극형 회전자) ──
  syncEa: 25.8,            // 교류 기전력 포화성분 [V rms] @1800rpm
  syncResidualV: 1.0,
  syncLs: 0.04,            // 동기 인덕턴스 [H] → Xs = 2πf·Ls

  // ── 3상 발전기 (상전압, 고정 여자 가정) ──
  threePhaseVp: 12.0,      // 상전압 실효값 @1800rpm [V]
  threePhaseLs: 0.02,

  // ── 기계계 ──
  inertiaJ: 0.0012,        // 회전자 관성 [kg·m²]
  frictionTc: 0.004,       // 쿨롱 마찰 토크 [N·m]
  frictionB: 1.2e-4,       // 점성 마찰 계수 [N·m·s/rad]
  maxRpm: 3600,            // 기계적 안전 한계

  // ── 구동 전동기(IEG-6030-11) ──
  driveTau: 0.6,           // 속도 응답 시정수 [s]
  driveDroopPerW: 0.0005,  // 발전기 전기출력 1 W 당 속도 저하율

  // ── 유도전동기 ──
  inductionSlip4p: 1 - 1740 / 1800, // 3.33 % (교재 1740 rpm)
  inductionSlip2p: 1 - 3450 / 3600, // 4.17 % (교재 3450 rpm)
  inductionTau: 0.8,
  splitPhaseSlip: 0.05,
  shadedPoleSlip: 0.15,
  repulsionRpmAt24V: 2400
};

/** 직류기 무부하 포화곡선: 1800 rpm 기준 유도기전력 [V] (If 부호 반영) */
export function occDc(ifEff) {
  return MACHINE.residualV + MACHINE.satEa * Math.tanh(ifEff / MACHINE.satI0);
}

/** 회전계자형 교류발전기 기전력 실효값 @1800rpm [V] */
export function occSync(ifield) {
  const x = Math.abs(ifield);
  return MACHINE.syncResidualV + MACHINE.syncEa * Math.tanh(x / MACHINE.satI0);
}

/** 영구자석 기전력 (1800 rpm 기준) */
export function pmEmf(kind = 'AC') {
  return kind === 'AC' ? MACHINE.pmAcRms : MACHINE.pmAcRms * MACHINE.pmDcFactor;
}

/** 교류 발전기 주파수 f = P·n / 120 */
export function electricalFreq(rpm, poles = 2) {
  return poles * Math.abs(rpm) / 120;
}

/** 동기속도 Ns = 120·f / P */
export function syncSpeed(freq, poles) {
  return 120 * freq / poles;
}

/** 마찰 토크 (회전 방향 반대) */
export function frictionTorque(omega) {
  if (Math.abs(omega) < 1e-3) return 0;
  return Math.sign(omega) * (MACHINE.frictionTc + MACHINE.frictionB * Math.abs(omega));
}
