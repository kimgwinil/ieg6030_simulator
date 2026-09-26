import { t } from '../i18n.js';
import { MODULE_DEFS } from '../modules/module_defs.js';

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
    this.selectedWireId = null;

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
        this.selectWire(null);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedWireId &&
          !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        this.deleteWire(this.selectedWireId);
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
    if (!isFinite(dist) || !(radius10 > 0) || !(radius11 > 0) || dist < radius10 + radius11) return '';

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
      <g class="animated-drive-belt-group" pointer-events="none">
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
   * 라우팅 장애물 (계측기 표시창, 노브, 스위치, 단자) 수집 — SVG 좌표
   */
  collectObstacles(svgRect) {
    const obs = [];
    const add = (el, kind, pad = 0) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      const mod = el.closest('.rack-module');
      obs.push({
        x1: r.left - svgRect.left - pad, x2: r.right - svgRect.left + pad,
        y1: r.top - svgRect.top - pad, y2: r.bottom - svgRect.top + pad,
        kind, moduleId: mod ? mod.dataset.moduleId : ''
      });
    };
    document.querySelectorAll('.digital-panel-meter, .digital-meter-display').forEach(el => add(el, 'meter', 3));
    document.querySelectorAll('.control-knob-wrapper, .rotary-switch-wrapper, .rocker-switch').forEach(el => add(el, 'control', 2));
    document.querySelectorAll('.terminal-jack').forEach(el => add(el, 'terminal', 2));
    // 모듈 정의의 보호 영역 (가변저항 눈금판, 램프 등)
    document.querySelectorAll('.rack-module').forEach(modEl => {
      const def = MODULE_DEFS[modEl.dataset.moduleId];
      if (!def || !def.obstacles) return;
      const r = modEl.getBoundingClientRect();
      for (const o of def.obstacles) {
        obs.push({
          x1: r.left - svgRect.left + r.width * o.x / 100, x2: r.left - svgRect.left + r.width * (o.x + o.w) / 100,
          y1: r.top - svgRect.top + r.height * o.y / 100, y2: r.top - svgRect.top + r.height * (o.y + o.h) / 100,
          kind: 'panel', moduleId: def.id
        });
      }
    });
    return obs;
  }

  /**
   * 모든 전선 및 벨트 SVG 렌더링
   */
  render() {
    const svgRect = this.svg.getBoundingClientRect();
    if (svgRect.width === 0 || svgRect.height === 0) return; // 워크벤치 탭이 숨겨진 상태
    const firstMod = document.querySelector('.rack-module');
    let topDuct = 30, bottomDuct = Math.max(120, svgRect.height - 40), midY = svgRect.height / 2;
    if (firstMod) {
      const mRect = firstMod.getBoundingClientRect();
      const modTop = mRect.top - svgRect.top;
      const modBottom = mRect.bottom - svgRect.top;
      topDuct = Math.max(10, modTop - 13);
      bottomDuct = Math.min(svgRect.height - 10, modBottom + 13);
      midY = (modTop + modBottom) / 2;
    }
    const rackBounds = { left: 0, right: svgRect.width, canvasHeight: svgRect.height, topDuct, bottomDuct, midY };
    const obstacles = this.collectObstacles(svgRect);

    const calc = this.engine.state.calculatedValues || {};
    const isCircuitActive = Math.abs(calc.genLoadCurr || 0) > 0.005 || Math.abs(calc.iField || 0) > 0.005 ||
      (this.engine.isRunning() && Math.abs(calc.genTermVolt || 0) > 0.5);

    let wiresSvg = this.renderDriveBeltSvg();
    let plugsSvg = '';

    this.engine.wires.forEach((wire, idx) => {
      const ptA = this.getTerminalCoord(wire.from.moduleId, wire.from.terminalId);
      const ptB = this.getTerminalCoord(wire.to.moduleId, wire.to.terminalId);
      if (!ptA || !ptB) return;
      const pathD = this.router.generatePath(ptA, ptB, idx, rackBounds, obstacles);
      const selected = wire.id === this.selectedWireId;
      const flow = isCircuitActive
        ? `<path class="wire-current-flow" d="${pathD}" fill="none" stroke="#fef08a" stroke-width="2" stroke-dasharray="8, 16" stroke-linecap="round" pointer-events="none"/>`
        : '';
      wiresSvg += `
        <g class="rendered-wire ${selected ? 'wire-selected' : ''}" data-wire-id="${wire.id}">
          <path d="${pathD}" fill="none" stroke="rgba(0,0,0,0.45)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>
          ${selected ? `<path d="${pathD}" fill="none" stroke="#38bdf8" stroke-width="10" stroke-opacity="0.55" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>` : ''}
          <path class="wire-interactive-path" d="${pathD}" fill="none" stroke="${wire.color}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="${pathD}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>
          ${flow}
        </g>`;
      // 4mm 바나나 플러그 머리: 단자 중앙을 비워(링 형태) 다른 플러그를 겹쳐 꽂을 수 있게 표시, 클릭은 단자로 통과
      for (const pt of [ptA, ptB]) {
        plugsSvg += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="5.2" fill="none" stroke="${wire.color}" stroke-width="3" pointer-events="none"/>`;
        plugsSvg += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="6.8" fill="none" stroke="#111" stroke-width="1" pointer-events="none"/>`;
      }
    });

    this.svg.innerHTML = wiresSvg + `<g class="plug-layer">${plugsSvg}</g><g id="wire_preview_group" pointer-events="none"></g>`;
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

  selectWire(wireId) {
    this.selectedWireId = wireId;
    this.render();
    if (wireId && window.app && window.app.showToast) {
      window.app.showToast(t('선택한 전선: 더블클릭 또는 Delete 키로 삭제 (Esc: 선택 해제)'));
    }
  }

  deleteWire(wireId) {
    this.engine.removeWire(wireId);
    this.selectedWireId = null;
    if (this.onWireChange) this.onWireChange(this.engine.wires);
    this.render();
  }

  /** 전선 아래에 단자가 있으면 단자 클릭을 우선 처리 (케이블이 4mm 단자를 가려 결선을 방해하지 않도록) */
  terminalUnderPointer(e) {
    const els = document.elementsFromPoint(e.clientX, e.clientY);
    return els.find(el => el.classList && el.classList.contains('terminal-jack')) || null;
  }

  attachWireDeleteEvents() {
    this.svg.querySelectorAll('.rendered-wire').forEach(g => {
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        const jack = this.terminalUnderPointer(e);
        if (jack) {
          this.handleTerminalClick(jack.dataset.module, jack.dataset.terminal, jack);
          return;
        }
        if (this.connectingFrom) return; // 결선 중에는 전선 선택 안 함
        this.selectWire(g.dataset.wireId === this.selectedWireId ? null : g.dataset.wireId);
      });
      g.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (this.terminalUnderPointer(e)) return;
        this.deleteWire(g.dataset.wireId);
      });
    });
  }
}
