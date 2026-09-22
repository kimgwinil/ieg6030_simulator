/**
 * IEG-6030 계철 프레임 및 구동 모터 기계 부품 조립 & 회전 애니메이션 엔진
 * 회전자, 구동 풀리, 고무 운전 벨트, 자극(P1~P8) 60FPS 고속 회전 렌더링
 */

export class MachineAssembler {
  constructor(circuitEngine, onAssemblyChange) {
    this.engine = circuitEngine;
    this.onAssemblyChange = onAssemblyChange;

    this.state = {
      rotor: 'DISK_A', // 'DISK_A' | 'DISK_B' | 'SALIENT_POLE' | 'SQUIRREL_CAGE' | 'NONE'
      poles: {
        P1: { type: 'PERM_N', label: 'N극' },
        P5: { type: 'PERM_S', label: 'S극' }
      },
      beltInstalled: true,
      rotorAngle: 0,
      beltOffset: 0
    };

    // DOM 캐시
    this.cachedRotorEl = null;
    this.cachedPulleyEl = null;
    this.cachedBeltEl = null;
  }

  setRotor(type) {
    this.state.rotor = type;
    this.syncEngine();
  }

  toggleBelt() {
    this.state.beltInstalled = !this.state.beltInstalled;
    this.syncEngine();
    return this.state.beltInstalled;
  }

  syncEngine() {
    this.engine.assembly.rotorType = this.state.rotor;
    this.engine.assembly.beltConnected = this.state.beltInstalled;
    this.engine.assembly.poles = { ...this.state.poles };
    this.engine.solve();
    if (this.onAssemblyChange) {
      this.onAssemblyChange(this.state);
    }
  }

  /**
   * 60FPS 고속 회전 업데이트 (DOM 직접 변형으로 렉 없는 부드러운 애니메이션)
   */
  updateAnimation(dt, rotorRpm = 0, motorRpm = 0, isCcw = false) {
    const effectiveMotorRpm = (motorRpm !== 0) ? motorRpm : rotorRpm;
    const dir = isCcw ? -1 : 1;

    // 1. 계철 프레임 로터 회전 (발전기 또는 전동기 회전자)
    if (Math.abs(rotorRpm) > 1) {
      const degPerSec = (Math.abs(rotorRpm) / 60) * 360 * dir;
      this.state.rotorAngle = (this.state.rotorAngle + degPerSec * dt) % 360;
      const rotorGroup = document.getElementById('animated_rotor_body');
      if (rotorGroup) {
        rotorGroup.setAttribute('transform', `rotate(${this.state.rotorAngle.toFixed(2)})`);
      }
    }

    // 2. 11번 구동 모터 풀리 회전 및 벨트 이동
    if (Math.abs(effectiveMotorRpm) > 1) {
      const pulleyDeg = (Math.abs(effectiveMotorRpm) / 60) * 360 * dir;
      this.state.pulleyAngle = ((this.state.pulleyAngle || 0) + pulleyDeg * dt) % 360;
      const pulleyMarker = document.getElementById('motor_pulley_spokes');
      if (pulleyMarker) {
        pulleyMarker.setAttribute('transform', `rotate(${this.state.pulleyAngle.toFixed(2)})`);
      }

      // 3. 구동 벨트 대시 이동
      if (this.state.beltInstalled) {
        const beltSpeedPx = (Math.abs(effectiveMotorRpm) / 60) * 120 * dir;
        this.state.beltOffset = (this.state.beltOffset - beltSpeedPx * dt) % 1000;
        const beltDash = document.getElementById('animated_drive_belt_texture');
        if (beltDash) {
          beltDash.setAttribute('stroke-dashoffset', this.state.beltOffset.toFixed(1));
        }
      }
    }
  }

  /**
   * 계철 프레임 내부 로터 & 자극 SVG 생성 (776x697 고정 좌표계)
   */
  renderSvg() {
    // mod_10 계철 프레임 원형 개구부 중심 (776 x 697 기준 정밀 위치)
    const cx = 383;
    const cy = 349;
    const rRotor = 120; // 8개 고정자 치 내부 직경에 완벽하게 내접하는 로터 반경

    let svg = `<g class="machine-assembly-group" transform="translate(${cx}, ${cy})">`;

    // 1. 자극 (P1~P8) 슬롯 배치 (반경 156 위치)
    const poleAngles = {
      P1: -90, P2: -45, P3: 0, P4: 45,
      P5: 90, P6: 135, P7: 180, P8: 225
    };

    for (const [pId, angleDeg] of Object.entries(poleAngles)) {
      const rad = (angleDeg * Math.PI) / 180;
      const px = Math.cos(rad) * 156;
      const py = Math.sin(rad) * 156;
      const pole = this.state.poles[pId];

      if (pole) {
        const isN = pole.type === 'PERM_N';
        const color = isN ? '#dc2626' : (pole.type === 'PERM_S' ? '#1e3a8a' : '#b45309');
        const text = isN ? 'N' : (pole.type === 'PERM_S' ? 'S' : 'COIL');

        svg += `
          <g class="pole-item" transform="translate(${px.toFixed(1)}, ${py.toFixed(1)}) rotate(${angleDeg + 90})">
            <path d="M -18 -14 L 18 -14 L 14 12 L -14 12 Z" fill="${color}" stroke="#fff" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"/>
            <circle cx="0" cy="-2" r="3.5" fill="#333" stroke="#aaa" stroke-width="1"/>
            <text x="0" y="7" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">${text}</text>
          </g>
        `;
      }
    }

    // 2. 회전자 (Rotor Body) - id="animated_rotor_body"로 60FPS 회전 바인딩
    if (this.state.rotor !== 'NONE') {
      svg += `<g id="animated_rotor_body" transform="rotate(${this.state.rotorAngle.toFixed(2)})">`;

      if (this.state.rotor === 'DISK_A' || this.state.rotor === 'DISK_B') {
        // 디스크 슬롯 회전자 (황동/골드 원판 + 8개 구리 권선 슬롯 + 스포크)
        svg += `
          <!-- 골드 알루미늄 디스크 원판 -->
          <circle cx="0" cy="0" r="${rRotor}" fill="url(#metalGrad)" stroke="#b45309" stroke-width="2.5" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.6))"/>
          <!-- 회전자 방사형 패턴 (회전하는 모습이 아주 뚜렷하게 보임) -->
          <circle cx="0" cy="0" r="${rRotor * 0.85}" fill="none" stroke="#78350f" stroke-width="10" stroke-dasharray="10, 8"/>
          <line x1="-${rRotor*0.9}" y1="0" x2="${rRotor*0.9}" y2="0" stroke="#451a03" stroke-width="3"/>
          <line x1="0" y1="-${rRotor*0.9}" x2="0" y2="${rRotor*0.9}" stroke="#451a03" stroke-width="3"/>
          <line x1="-${rRotor*0.65}" y1="-${rRotor*0.65}" x2="${rRotor*0.65}" y2="${rRotor*0.65}" stroke="#451a03" stroke-width="2.5"/>
          <line x1="-${rRotor*0.65}" y1="${rRotor*0.65}" x2="${rRotor*0.65}" y2="-${rRotor*0.65}" stroke="#451a03" stroke-width="2.5"/>
          <!-- 중앙 축 및 베어링 -->
          <circle cx="0" cy="0" r="22" fill="#18181b" stroke="#71717a" stroke-width="3"/>
          <circle cx="0" cy="0" r="10" fill="#d4d4d8"/>
          <!-- 회전 감지 스트로보 인덱스 도트 (회전 속도 시각화) -->
          <circle cx="${rRotor * 0.65}" cy="0" r="7" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>
          <circle cx="-${rRotor * 0.65}" cy="0" r="7" fill="#3b82f6" stroke="#fff" stroke-width="1.5"/>
        `;
      } else if (this.state.rotor === 'SQUIRREL_CAGE') {
        // 농형 유도 회전자
        svg += `
          <circle cx="0" cy="0" r="${rRotor}" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
          <circle cx="0" cy="0" r="${rRotor * 0.88}" fill="none" stroke="#f8fafc" stroke-width="7" stroke-dasharray="4, 5"/>
          <!-- 슬롯 바 스트라이프 -->
          <line x1="-${rRotor}" y1="0" x2="${rRotor}" y2="0" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="0" y1="-${rRotor}" x2="0" y2="${rRotor}" stroke="#cbd5e1" stroke-width="2"/>
          <circle cx="0" cy="0" r="18" fill="#0f172a" stroke="#cbd5e1" stroke-width="2"/>
          <circle cx="${rRotor * 0.6}" cy="0" r="5" fill="#f59e0b"/>
        `;
      } else {
        // 돌극형 계자 회전자
        svg += `
          <rect x="-${rRotor*0.8}" y="-24" width="${rRotor*1.6}" height="48" rx="10" fill="#dc2626" stroke="#fca5a5" stroke-width="2"/>
          <circle cx="0" cy="0" r="22" fill="#18181b" stroke="#e4e4e7" stroke-width="3"/>
          <text x="-${rRotor*0.4}" y="7" font-size="16" font-weight="900" fill="#fff">N</text>
          <text x="${rRotor*0.4}" y="7" font-size="16" font-weight="900" fill="#fff">S</text>
        `;
      }

      svg += `</g>`;
    }

    svg += `</g>`;
    return svg;
  }
}
