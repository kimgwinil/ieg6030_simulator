/**
 * IEG-6030 마우스 배선 인터랙션 및 실시간 전류 흐름 애니메이션 SVG 렌더러
 */

export class CableUI {
  constructor(svgOverlay, circuitEngine, cableRouter, onWireChange) {
    this.svg = svgOverlay;
    this.engine = circuitEngine;
    this.router = cableRouter;
    this.onWireChange = onWireChange;

    this.currentColor = '#dc2626'; // 기본 적색
    this.connectingFrom = null;    // { moduleId, terminalId, el, x, y }
    this.mousePos = { x: 0, y: 0 };
    this.isDragging = false;

    this.wireColorPalette = [
      { name: '적색 (+ / R상)', hex: '#dc2626' },
      { name: '청색 (S상 / 교류)', hex: '#2563eb' },
      { name: '황색 (T상)', hex: '#d97706' },
      { name: '흑색 (- / N상)', hex: '#1e293b' },
      { name: '녹색 (접지 / PE)', hex: '#059669' },
      { name: '백색 (단자 연결)', hex: '#f8fafc' }
    ];

    this.initEvents();
  }

  setColor(hex) {
    this.currentColor = hex;
  }

  handleTerminalClick(moduleId, terminalId, element) {
    const rect = element.getBoundingClientRect();
    const svgRect = this.svg.getBoundingClientRect();
    const termPos = {
      x: rect.left + rect.width / 2 - svgRect.left,
      y: rect.top + rect.height / 2 - svgRect.top,
      moduleId,
      terminalId,
      el: element
    };

    if (!this.connectingFrom) {
      // 1차 클릭: 시작 단자 선택
      this.connectingFrom = termPos;
      element.classList.add('terminal-active');
      this.render();
    } else {
      // 2차 클릭: 도착 단자 선택
      if (this.connectingFrom.moduleId === moduleId && this.connectingFrom.terminalId === terminalId) {
        this.cancelConnecting();
        return;
      }

      const fromObj = { moduleId: this.connectingFrom.moduleId, terminalId: this.connectingFrom.terminalId };
      const toObj = { moduleId, terminalId };

      this.engine.addWire(fromObj, toObj, this.currentColor);
      this.cancelConnecting();

      if (this.onWireChange) {
        this.onWireChange(this.engine.wires);
      }
      this.render();
    }
  }

  cancelConnecting() {
    if (this.connectingFrom && this.connectingFrom.el) {
      this.connectingFrom.el.classList.remove('terminal-active');
    }
    this.connectingFrom = null;
    this.render();
  }

  initEvents() {
    window.addEventListener('mousemove', (e) => {
      if (this.connectingFrom) {
        const svgRect = this.svg.getBoundingClientRect();
        this.mousePos = {
          x: e.clientX - svgRect.left,
          y: e.clientY - svgRect.top
        };
        this.renderPreview();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.cancelConnecting();
      }
    });

    this.svg.addEventListener('click', (e) => {
      if (e.target === this.svg) {
        this.cancelConnecting();
      }
    });
  }

  getTerminalCoord(moduleId, terminalId) {
    const el = document.querySelector(`.terminal-jack[data-module="${moduleId}"][data-terminal="${terminalId}"]`);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const svgRect = this.svg.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - svgRect.left,
      y: rect.top + rect.height / 2 - svgRect.top,
      moduleId,
      terminalId
    };
  }

  /**
   * 구동 모터(11)와 계철 프레임(10) 사이의 구동 벨트(Drive Belt) SVG 경로 생성
   */
  renderDriveBeltSvg() {
    if (!this.engine.assembly.beltConnected) return '';

    const mod10 = document.querySelector('.rack-module[data-module-id="IEG-6030-10"]');
    const mod11 = document.querySelector('.rack-module[data-module-id="IEG-6030-11"]');
    if (!mod10 || !mod11) return '';

    const svgRect = this.svg.getBoundingClientRect();
    const r10 = mod10.getBoundingClientRect();
    const r11 = mod11.getBoundingClientRect();

    // 10번 로터 축 중심 (776x697 원본 사진 중심 383, 349 대응)
    const c10x = r10.left + r10.width * (383 / 776) - svgRect.left;
    const c10y = r10.top + r10.height * (349 / 697) - svgRect.top;
    const radius10 = r10.width * (18 / 776);

    // 11번 풀리 축 중심 (실제 렌더링된 풀리 오버레이의 정밀 중심 바운딩)
    const pulleyOverlay = mod11.querySelector('.motor-pulley-overlay');
    let c11x, c11y, radius11;
    if (pulleyOverlay) {
      const pRect = pulleyOverlay.getBoundingClientRect();
      c11x = pRect.left + pRect.width / 2 - svgRect.left;
      c11y = pRect.top + pRect.height / 2 - svgRect.top;
      radius11 = (pRect.width / 2) * 0.90;
    } else {
      c11x = r11.left + r11.width * 0.842 - svgRect.left;
      c11y = r11.top + r11.height * 0.469 - svgRect.top;
      radius11 = r11.width * 0.088;
    }

    // 두 풀리를 감싸는 공통 외접선 기하학 계산
    const dx = c11x - c10x;
    const dy = c11y - c10y;
    const dist = Math.hypot(dx, dy);
    if (dist < radius10 + radius11) return '';

    const alpha = Math.atan2(dy, dx);
    const gamma = Math.asin(Math.max(-1, Math.min(1, (radius11 - radius10) / dist)));

    const sinDiff = Math.sin(alpha - gamma);
    const cosDiff = Math.cos(alpha - gamma);

    // 하단 접선 (p1 -> p2)
    const p1x = c10x - radius10 * sinDiff;
    const p1y = c10y + radius10 * cosDiff;
    const p2x = c11x - radius11 * sinDiff;
    const p2y = c11y + radius11 * cosDiff;

    // 상단 접선 (p3 -> p4)
    const p3x = c11x + radius11 * sinDiff;
    const p3y = c11y - radius11 * cosDiff;
    const p4x = c10x + radius10 * sinDiff;
    const p4y = c10y - radius10 * cosDiff;

    // 볼록 외곽 호(Arc)로 두 풀리를 감싸는 완전한 폐곡선 루프 (안쪽으로 꺾이지 않는 완벽한 타원형 벨트)
    const beltLoop = `M ${p1x.toFixed(1)} ${p1y.toFixed(1)} L ${p2x.toFixed(1)} ${p2y.toFixed(1)} A ${radius11.toFixed(1)} ${radius11.toFixed(1)} 0 1 0 ${p3x.toFixed(1)} ${p3y.toFixed(1)} L ${p4x.toFixed(1)} ${p4y.toFixed(1)} A ${radius10.toFixed(1)} ${radius10.toFixed(1)} 0 0 0 ${p1x.toFixed(1)} ${p1y.toFixed(1)} Z`;

    return `
      <g class="animated-drive-belt-group">
        <!-- 벨트 외곽 그림자 -->
        <path d="${beltLoop}" fill="rgba(15,23,42,0.6)" stroke="#09090b" stroke-width="6" stroke-linejoin="round"/>
        <!-- 고무 벨트 본체 -->
        <path d="${beltLoop}" fill="none" stroke="#27272a" stroke-width="4.5" stroke-linejoin="round"/>
        <!-- 움직이는 벨트 질감 대시 라인 -->
        <path id="animated_drive_belt_texture" d="${beltLoop}" fill="none" stroke="#e4e4e7" stroke-width="1.8" stroke-dasharray="12, 10" stroke-linecap="round"/>
      </g>
    `;
  }

  /**
   * 모든 전선 및 벨트 SVG 렌더링
   */
  render() {
    const svgRect = this.svg.getBoundingClientRect();
    const topDuctEl = document.querySelector('.rack-cable-duct.top');
    const bottomDuctEl = document.querySelector('.rack-cable-duct.bottom');
    const firstMod = document.querySelector('.rack-module');
    const rackEl = document.getElementById('equipment_rack');

    let topDuct, bottomDuct, midY;

    if (firstMod) {
      const mRect = firstMod.getBoundingClientRect();
      const modTop = mRect.top - svgRect.top;
      const modBottom = mRect.bottom - svgRect.top;
      // 상단 덕트: 모듈 최상단보다 28px 충분히 위로 띄워 모듈 헤더/블럭 가림을 원천 차단
      // 캔버스 최상단 테두리에 잘리지 않도록 최소 16px 안전 여백 강제
      topDuct = Math.max(16, modTop - 28);
      // 하단 덕트: 모듈 최하단보다 28px 충분히 아래로 띄워 하단 단자/스위치 가림을 원천 차단
      // 캔버스 바닥 및 계측 서랍에 가리지 않도록 canvasHeight - 26px 안전 여백 강제
      bottomDuct = Math.min(svgRect.height - 26, modBottom + 28);
      midY = (modTop + modBottom) / 2;
    } else if (rackEl) {
      const rRect = rackEl.getBoundingClientRect();
      const rTop = rRect.top - svgRect.top;
      const rBottom = rRect.bottom - svgRect.top;
      topDuct = Math.max(16, rTop - 6);
      bottomDuct = Math.min(svgRect.height - 26, rBottom + 6);
      midY = (rTop + rBottom) / 2;
    } else {
      topDuct = 35;
      bottomDuct = Math.max(120, svgRect.height - 45);
      midY = svgRect.height / 2;
    }

    const rackBounds = {
      left: 0,
      right: svgRect.width,
      canvasHeight: svgRect.height,
      topDuct,
      bottomDuct,
      midY
    };

    // 회로 통전 상태 (전류가 실제로 흐르고 있는지)
    const isCircuitActive = (
      (this.engine.isRunning() && (Math.abs(this.engine.state.autoDriverRpm) > 50 || Math.abs(this.engine.state.rotorRpm || 0) > 50)) ||
      (this.engine.state.powerSupplyOn && ((this.engine.state.calculatedValues?.genTermVolt || 0) > 1 || (this.engine.state.calculatedValues?.iField || 0) > 0.01))
    );

    let wiresSvg = '';

    // 1. 구동 벨트 렌더링
    wiresSvg += this.renderDriveBeltSvg();

    // 2. 전선 렌더링
    this.engine.wires.forEach((wire, idx) => {
      const ptA = this.getTerminalCoord(wire.from.moduleId, wire.from.terminalId);
      const ptB = this.getTerminalCoord(wire.to.moduleId, wire.to.terminalId);

      if (ptA && ptB) {
        const pathD = this.router.generatePath(ptA, ptB, idx, rackBounds);

        // 통전 중일 때 전류 흐름 파티클 레이어
        let currentFlowSvg = '';
        if (isCircuitActive) {
          currentFlowSvg = `
            <!-- 통전 시 실시간 전류 흐름 파티클 효과 -->
            <path class="wire-current-flow" d="${pathD}" fill="none" stroke="#fef08a" stroke-width="2.5" stroke-dasharray="10, 16" stroke-linecap="round"/>
          `;
        }

        wiresSvg += `
          <g class="rendered-wire" data-wire-id="${wire.id}">
            <!-- 그림자 -->
            <path d="${pathD}" fill="none" stroke="rgba(0,0,0,0.45)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
            <!-- 본체 피복선 -->
            <path class="wire-interactive-path" d="${pathD}" fill="none" stroke="${wire.color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
            <!-- 광택 하이라이트 -->
            <path d="${pathD}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            ${currentFlowSvg}
            <!-- 바나나 플러그 부트 -->
            <circle cx="${ptA.x}" cy="${ptA.y}" r="6" fill="${wire.color}" stroke="#111" stroke-width="2"/>
            <circle cx="${ptB.x}" cy="${ptB.y}" r="6" fill="${wire.color}" stroke="#111" stroke-width="2"/>
          </g>
        `;
      }
    });

    wiresSvg += `<g id="wire_preview_group"></g>`;
    this.svg.innerHTML = wiresSvg;
    this.attachWireDeleteEvents();
  }

  renderPreview() {
    const previewGroup = document.getElementById('wire_preview_group');
    if (!previewGroup || !this.connectingFrom) return;

    const ptA = this.connectingFrom;
    const ptB = this.mousePos;

    const dx = ptB.x - ptA.x;
    const dy = ptB.y - ptA.y;
    const cx1 = ptA.x + dx * 0.3;
    const cy1 = ptA.y + Math.max(30, dy * 0.5);
    const cx2 = ptB.x - dx * 0.3;
    const cy2 = ptB.y + Math.max(30, -dy * 0.5);

    const d = `M ${ptA.x} ${ptA.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${ptB.x} ${ptB.y}`;

    previewGroup.innerHTML = `
      <path d="${d}" fill="none" stroke="${this.currentColor}" stroke-width="4" stroke-dasharray="6,4" stroke-linecap="round"/>
      <circle cx="${ptB.x}" cy="${ptB.y}" r="5" fill="${this.currentColor}" stroke="#fff" stroke-width="2"/>
    `;
  }

  attachWireDeleteEvents() {
    const wireGroups = this.svg.querySelectorAll('.rendered-wire');
    wireGroups.forEach(g => {
      g.addEventListener('click', (e) => {
        const wireId = g.dataset.wireId;
        if (wireId) {
          this.engine.removeWire(wireId);
          if (this.onWireChange) {
            this.onWireChange(this.engine.wires);
          }
          this.render();
        }
      });
    });
  }
}
