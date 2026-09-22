/**
 * IEG-6030 아날로그 계측기 지침 물리 시뮬레이션 엔진
 * 2차 질량-스프링-감쇠기(Mass-Spring-Damper) 물리 모델로 실제 아날로그 메터의 바늘 움직임 재현
 */

export class MeterPhysicsEngine {
  constructor() {
    this.meters = new Map();
  }

  registerMeter(id, config) {
    this.meters.set(id, {
      id,
      minVal: config.minVal ?? 0,
      maxVal: config.maxVal ?? 100,
      angleMin: config.angleMin ?? -42,
      angleMax: config.angleMax ?? 42,
      targetVal: config.initialVal ?? 0,
      currentAngle: config.angleMin ?? -42,
      angularVelocity: 0,
      // 물리 상수: 감쇠비 zeta ~ 0.75, 고유진동수 wn ~ 14 rad/s (약 0.2~0.3초 이내 부드러운 안착)
      springK: 200.0,
      dampingC: 22.0,
      inertiaJ: 1.0,
      clamped: true
    });
  }

  setTargetValue(id, value) {
    const meter = this.meters.get(id);
    if (!meter) return;
    meter.targetVal = value;
  }

  update(dt = 0.016) {
    // 수치 안정성을 위해 최대 50ms로 클램프
    const clampedDt = Math.min(dt, 0.05);

    for (const meter of this.meters.values()) {
      // 목표 각도 계산 (선형 보간)
      const valRatio = (meter.targetVal - meter.minVal) / (meter.maxVal - meter.minVal);
      const targetRatio = Math.max(-0.15, Math.min(1.15, valRatio)); // 약간의 눈금 밖 오버플로우 허용
      const targetAngle = meter.angleMin + (meter.angleMax - meter.angleMin) * targetRatio;

      // 물리 방정식: J * a + c * v + k * (angle - targetAngle) = 0
      const displacement = meter.currentAngle - targetAngle;
      const springForce = -meter.springK * displacement;
      const dampingForce = -meter.dampingC * meter.angularVelocity;
      const acceleration = (springForce + dampingForce) / meter.inertiaJ;

      // Euler integration
      meter.angularVelocity += acceleration * clampedDt;
      meter.currentAngle += meter.angularVelocity * clampedDt;

      // 기계적 스토퍼(바늘 침 한계) 충돌
      const stopMin = meter.angleMin - 4;
      const stopMax = meter.angleMax + 4;
      if (meter.currentAngle < stopMin) {
        meter.currentAngle = stopMin;
        meter.angularVelocity = -meter.angularVelocity * 0.2; // 비탄성 충돌 반동
      } else if (meter.currentAngle > stopMax) {
        meter.currentAngle = stopMax;
        meter.angularVelocity = -meter.angularVelocity * 0.2;
      }
    }
  }

  getAngle(id) {
    const meter = this.meters.get(id);
    return meter ? meter.currentAngle : 0;
  }

  getCurrentValue(id) {
    const meter = this.meters.get(id);
    if (!meter) return 0;
    const ratio = (meter.currentAngle - meter.angleMin) / (meter.angleMax - meter.angleMin);
    return meter.minVal + ratio * (meter.maxVal - meter.minVal);
  }
}
