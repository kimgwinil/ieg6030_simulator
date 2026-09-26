import { t as tr } from '../i18n.js';
/**
 * IEG-6030 실습 모듈 인터랙티브 렌더러 (정밀 보정 버전)
 * 실제 매뉴얼 패널 사진 + 실시간 조작 노브, 토글 스위치, 바늘 지침, 단자 잭 렌더링
 */

import { MODULE_DEFS } from './module_defs.js';

export class ModuleRenderer {
  constructor(container, circuitEngine, onTerminalClick, onControlChange = null) {
    this.container = container;
    this.engine = circuitEngine;
    this.onTerminalClick = onTerminalClick;
    this.onControlChange = onControlChange;
    this.activeDragKnob = null;
  }

  /**
   * 단일 모듈 HTML 템플릿 생성
   */
  renderModule(moduleId, slotIndex) {
    const def = MODULE_DEFS[moduleId];
    if (!def) return '';

    const widthClass = def.widthUnits === 2 ? 'module-double' : 'module-single';

    let terminalsHtml = '';
    for (const t of (def.terminals || [])) {
      terminalsHtml += `
        <div class="terminal-jack jack-${t.color}"
             data-module="${def.id}"
             data-terminal="${t.id}"
             style="left: ${t.x}%; top: ${t.y}%;"
             title="${tr('{name} - 단자 {label}', { name: tr(def.name), label: t.label })}">
          <div class="jack-core"></div>
          <span class="jack-label">${t.label}</span>
        </div>
      `;
    }

    let controlsHtml = '';
    for (const c of (def.controls || [])) {
      if (c.type === 'knob') {
        const val = this.engine.getControlValue(def.id, c.id, c.value);
        const ratio = (val - c.min) / (c.max - c.min);
        const angle = c.angleMin + ratio * (c.angleMax - c.angleMin);
        const knobTitle = tr('{label}: 드래그 또는 마우스 휠로 조절', { label: c.label });
        const sizePct = c.sizePercent || 38.0;

        controlsHtml += `
          <div class="control-knob-wrapper" style="left: ${c.x}%; top: ${c.y}%; width: ${sizePct}%; aspect-ratio: 1/1;">
            <div class="knob-body" title="${knobTitle}"
                 data-module="${def.id}"
                 data-control="${c.id}"
                 data-min="${c.min}"
                 data-max="${c.max}"
                 data-step="${c.step || 1}"
                 style="transform: rotate(${angle}deg);">
              <div class="knob-indicator"></div>
            </div>
            <div class="knob-val-bubble" id="val_${def.id}_${c.id}" data-unit="${c.unit || ''}">${val} ${c.unit || ''}</div>
          </div>
        `;
      } else if (c.type === 'rocker_switch') {
        const val = this.engine.getControlValue(def.id, c.id, c.value);
        controlsHtml += `
          <div class="rocker-switch ${val ? 'sw-on' : 'sw-off'}"
               data-module="${def.id}"
               data-control="${c.id}"
               style="left: ${c.x}%; top: ${c.y}%;">
            <div class="rocker-rock"></div>
          </div>
        `;
      } else if (c.type === 'cam_switch_3pos' || c.type === 'rotary_3pos') {
        const selectedIdx = this.engine.getControlValue(def.id, c.id + '_idx', c.selectedIndex || 1);
        const opt = c.options[selectedIdx];
        const sizePct = c.sizePercent || 25.0;

        controlsHtml += `
          <div class="rotary-switch-wrapper" style="left: ${c.x}%; top: ${c.y}%; width: ${sizePct}%; aspect-ratio: 1/1;">
            <div class="rotary-handle"
                 data-module="${def.id}"
                 data-control="${c.id}"
                 data-type="${c.type}"
                 data-options='${JSON.stringify(c.options)}'
                 data-curr-idx="${selectedIdx}"
                 style="transform: rotate(${opt.angle}deg);">
              <div class="rotary-indicator"></div>
            </div>
          </div>
        `;
      }
    }

    // 토글 스위치 (05번 모듈 등)
    let switchesHtml = '';
    for (const s of (def.switches || [])) {
      const state = this.engine.getControlValue(def.id, s.id, s.value);
      switchesHtml += `
        <div class="toggle-switch-wrapper ${state ? 'sw-up' : 'sw-down'}"
             data-module="${def.id}"
             data-switch="${s.id}"
             title="${s.id} ${s.label} (${state ? 'ON' : 'OFF'})"
             style="left: ${s.x}%; top: ${s.y}%;">
          <div class="toggle-lever"></div>
          <span class="toggle-label">${s.label}</span>
        </div>
      `;
    }

    // 램프 부하 (03번, 04번) — 소켓 클릭 시 전구 장착/분리
    let lampsHtml = '';
    for (const l of (def.lamps || [])) {
      const installed = this.engine.getControlValue(def.id, `BULB_${l.id}`, true);
      lampsHtml += `
        <div class="lamp-socket ${installed ? '' : 'bulb-removed'}" id="lamp_${def.id}_${l.id}"
             data-module="${def.id}" data-lamp="${l.id}"
             title="${tr('{label} 전구 ({v}V) — 클릭하여 장착/분리', { label: l.label, v: l.rating })}"
             style="left: ${l.x}%; top: ${l.y}%;">
          <div class="lamp-bulb">
            <div class="lamp-filament"></div>
            <div class="lamp-glow"></div>
          </div>
        </div>
      `;
    }

    // 아날로그/디지털 미터 지침 오버레이
    // 아날로그/디지털 미터 오버레이 (디지털 패널 메타 전면 지원)
    let metersHtml = '';
    for (const m of (def.meters || [])) {
      if (m.type === 'digital_panel') {
        const themeClass = m.theme ? `theme-${m.theme}` : 'theme-cyan';
        metersHtml += `
          <div class="digital-panel-meter ${themeClass}" data-i18n-skip id="meter_${m.id}" style="left: ${m.x}%; top: ${m.y}%; width: ${m.w}%; height: ${m.h}%;" title="${m.label}">
           <div class="dpm-inner">
            <div class="dpm-header">
              <span class="dpm-title"><span class="t-full">${m.label}</span><span class="t-short">${m.short || m.label}</span></span>
              <span class="dpm-range" id="range_${m.id}">${m.range || ''}</span>
            </div>
            <div class="dpm-body">
              <span class="dpm-num" id="dpm_val_${m.id}">0.00</span>
              <span class="dpm-unit" id="dpm_unit_${m.id}">${m.unit}</span>
            </div>
            <div class="dpm-footer">
              <div class="dpm-bar-track">
                <div class="dpm-bar-fill" id="dpm_bar_${m.id}" style="width: 0%;"></div>
              </div>
              <div class="dpm-ticks">
                ${m.isBipolar ? '<span>−F.S.</span><span>0</span><span>+F.S.</span>' : '<span>0</span><span>50%</span><span>F.S.</span>'}
              </div>
            </div>
           </div>
          </div>
        `;
      } else if (m.type === 'analog' || m.type === 'center_zero') {
        const meterW = ((def.width || 387) * m.w / 100);
        const meterH = ((def.height || 700) * m.h / 100);
        const pivX = (meterW * m.pivotX / 100);
        const pivY = (meterH * m.pivotY / 100);
        const nLen = (meterH * m.needleLength / 100);
        const initAngle = (m.type === 'center_zero') ? 0 : (m.angleMin !== undefined ? m.angleMin : -42);

        metersHtml += `
          <div class="meter-window-overlay" id="meter_${m.id}" style="left: ${m.x}%; top: ${m.y}%; width: ${m.w}%; height: ${m.h}%;">
            <svg class="meter-needle-svg" viewBox="0 0 ${meterW.toFixed(1)} ${meterH.toFixed(1)}" preserveAspectRatio="none">
              <g class="needle-pivot" data-px="${pivX.toFixed(1)}" data-py="${pivY.toFixed(1)}" transform="translate(${pivX.toFixed(1)}, ${pivY.toFixed(1)}) rotate(${initAngle})">
                <line x1="0" y1="0" x2="0" y2="-${nLen.toFixed(1)}" stroke="#dc2626" stroke-width="1.8" stroke-linecap="round"/>
                <circle cx="0" cy="0" r="4.2" fill="#18181b" stroke="#e4e4e7" stroke-width="1"/>
              </g>
            </svg>
          </div>
        `;
      } else if (m.type === 'digital') {
        metersHtml += `
          <div class="digital-meter-display" id="meter_${m.id}" style="left: ${m.x}%; top: ${m.y}%; width: ${m.w}%; height: ${m.h}%;">
            <span class="digi-val">0000</span>
            <span class="digi-unit">${m.unit}</span>
          </div>
        `;
      }
    }

    // 10번 계철 프레임인 경우 기계 조립 SVG 레이어 추가 (고정 viewBox 776x697로 100% 정밀 정렬)
    let assemblyHtml = '';
    if (def.id === 'IEG-6030-10') {
      assemblyHtml = `
        <div class="field-frame-assembly-layer" id="field_frame_assembly">
          <svg class="assembly-svg" viewBox="0 0 776 697" preserveAspectRatio="none" style="position:absolute; inset:0; width:100%; height:100%;">
            <defs>
              <radialGradient id="metalGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fff275"/>
                <stop offset="65%" stop-color="#e0a96d"/>
                <stop offset="100%" stop-color="#735d43"/>
              </radialGradient>
            </defs>
            <g id="assembly_svg_content"></g>
          </svg>
        </div>
      `;
    } else if (def.id === 'IEG-6030-11') {
      assemblyHtml = `
        <div class="motor-pulley-overlay" style="position:absolute; left:84.2%; top:46.9%; width:19.5%; aspect-ratio:1/1; transform:translate(-50%,-50%); z-index:5; pointer-events:none;">
          <svg viewBox="-50 -50 100 100" style="width:100%; height:100%; overflow:visible;">
            <g id="motor_pulley_spokes">
              <circle cx="0" cy="0" r="46" fill="#18181b" stroke="#71717a" stroke-width="3" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.8))"/>
              <line x1="-42" y1="0" x2="42" y2="0" stroke="#a1a1aa" stroke-width="4"/>
              <line x1="0" y1="-42" x2="0" y2="42" stroke="#a1a1aa" stroke-width="4"/>
              <circle cx="0" cy="0" r="15" fill="#3f3f46" stroke="#fff" stroke-width="2"/>
              <circle cx="28" cy="0" r="6" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>
            </g>
          </svg>
        </div>
      `;
    }

    const aspectStyle = def.aspectRatio ? `style="aspect-ratio: ${def.aspectRatio};"` : '';

    return `
      <div class="rack-module ${widthClass}" id="module_${def.id}" data-module-id="${def.id}" data-slot="${slotIndex}" ${aspectStyle}>
        <div class="module-panel-wrap">
          <img class="module-bg-img" src="${def.image}" alt="${def.name}" draggable="false" />
          <div class="module-overlay-layer">
            ${assemblyHtml}
            ${metersHtml}
            ${terminalsHtml}
            ${controlsHtml}
            ${switchesHtml}
            ${lampsHtml}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 이벤트 바인딩 (노브, 스위치, 단자, 램프 소켓)
   */
  attachEvents(workbenchEl) {
    // 1. 단자 클릭 → 배선
    workbenchEl.addEventListener('click', (e) => {
      const jack = e.target.closest('.terminal-jack');
      if (jack) {
        this.onTerminalClick(jack.dataset.module, jack.dataset.terminal, jack);
      }
    });

    // 2. 락커 스위치 (전원 ON/OFF)
    workbenchEl.addEventListener('click', (e) => {
      const sw = e.target.closest('.rocker-switch');
      if (!sw) return;
      const moduleId = sw.dataset.module;
      const controlId = sw.dataset.control;
      const next = !this.engine.getControlValue(moduleId, controlId, false);
      this.engine.setControlValue(moduleId, controlId, next, true);
      sw.classList.toggle('sw-on', next);
      sw.classList.toggle('sw-off', !next);
      if (controlId === 'MAIN_POWER_SW') {
        this.engine.state.powerSupplyOn = next;
        if (next) { this.engine.state.shortCircuit = false; this.engine.state.shortDetails = ''; }
      } else if (controlId === 'MOTOR_POWER') {
        this.engine.state.autoDriverOn = next;
      }
      this.engine.solve();
      if (this.onControlChange) this.onControlChange(moduleId, controlId, next);
    });

    // 3. 토글 스위치 (05번 RLC 부하)
    workbenchEl.addEventListener('click', (e) => {
      const tsw = e.target.closest('.toggle-switch-wrapper');
      if (!tsw) return;
      const moduleId = tsw.dataset.module;
      const switchId = tsw.dataset.switch;
      const next = !this.engine.getControlValue(moduleId, switchId, false);
      this.engine.setControlValue(moduleId, switchId, next);
      tsw.classList.toggle('sw-up', next);
      tsw.classList.toggle('sw-down', !next);
      tsw.title = tsw.title.replace(/\((ON|OFF)\)/, `(${next ? 'ON' : 'OFF'})`);
      if (this.onControlChange) this.onControlChange(moduleId, switchId, next);
    });

    // 4. 로터리/캠 스위치 (3-pos): 클릭할 때마다 한 칸씩 (예: CCW → STOP → CW)
    workbenchEl.addEventListener('click', (e) => {
      const rsw = e.target.closest('.rotary-handle');
      if (!rsw) return;
      const moduleId = rsw.dataset.module;
      const controlId = rsw.dataset.control;
      const options = JSON.parse(rsw.dataset.options);
      const currIdx = (parseInt(rsw.dataset.currIdx, 10) + 1) % options.length;
      rsw.dataset.currIdx = currIdx;
      const opt = options[currIdx];
      rsw.style.transform = `rotate(${opt.angle}deg)`;
      rsw.title = tr('{label} (클릭하여 전환)', { label: opt.label });
      this.engine.setControlValue(moduleId, controlId + '_idx', currIdx, true);

      if (controlId === 'MOTOR_DIR') {
        this.engine.state.autoDriverDir = opt.value;
        if (opt.value !== 'STOP') {
          // 방향 선택 시 구동 전원 자동 ON
          this.engine.state.autoDriverOn = true;
          this.engine.setControlValue(moduleId, 'MOTOR_POWER', true, true);
          const pwr = workbenchEl.querySelector(`[data-module="${moduleId}"][data-control="MOTOR_POWER"]`);
          if (pwr) { pwr.classList.add('sw-on'); pwr.classList.remove('sw-off'); }
        }
      }
      this.engine.setControlValue(moduleId, controlId, opt.value);
      if (this.onControlChange) this.onControlChange(moduleId, controlId, opt.value);
    });

    // 5. 램프 소켓: 전구 장착/분리
    workbenchEl.addEventListener('click', (e) => {
      const sock = e.target.closest('.lamp-socket');
      if (!sock) return;
      const moduleId = sock.dataset.module;
      const lampId = sock.dataset.lamp;
      const next = !this.engine.getControlValue(moduleId, `BULB_${lampId}`, true);
      this.engine.setControlValue(moduleId, `BULB_${lampId}`, next);
      sock.classList.toggle('bulb-removed', !next);
      if (this.onControlChange) this.onControlChange(moduleId, `BULB_${lampId}`, next);
    });

    // 6. 노브 드래그 (원형 회전 + 수직 드래그 보조)
    const startDrag = (knob, clientX, clientY) => {
      const rect = knob.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const v = parseFloat(this.engine.getControlValue(knob.dataset.module, knob.dataset.control, 0));
      this.activeDragKnob = {
        el: knob, cx, cy,
        lastAngle: Math.atan2(clientY - cy, clientX - cx),
        lastY: clientY,
        currVal: v,
        min: parseFloat(knob.dataset.min),
        max: parseFloat(knob.dataset.max),
        step: parseFloat(knob.dataset.step)
      };
    };
    const moveDrag = (clientX, clientY) => {
      if (!this.activeDragKnob) return;
      const { el, cx, cy, min, max, step } = this.activeDragKnob;
      const currentAngle = Math.atan2(clientY - cy, clientX - cx);
      let diffAngle = currentAngle - this.activeDragKnob.lastAngle;
      if (diffAngle > Math.PI) diffAngle -= 2 * Math.PI;
      if (diffAngle < -Math.PI) diffAngle += 2 * Math.PI;
      this.activeDragKnob.lastAngle = currentAngle;
      const dy = this.activeDragKnob.lastY - clientY;
      this.activeDragKnob.lastY = clientY;
      const range = max - min;
      let valDelta = (diffAngle / (1.5 * Math.PI)) * range;   // 270° = 전 범위
      if (Math.abs(diffAngle) < 0.005 && Math.abs(dy) > 1) valDelta = (dy / 180) * range;
      let nextVal = Math.max(min, Math.min(max, this.activeDragKnob.currVal + valDelta));
      this.activeDragKnob.currVal = nextVal;
      let snapped = Math.round((nextVal - min) / step) * step + min;
      snapped = Math.max(min, Math.min(max, snapped));
      if (step < 1) snapped = parseFloat(snapped.toFixed(2));
      if (snapped !== parseFloat(this.engine.getControlValue(el.dataset.module, el.dataset.control, 0))) {
        this.updateKnobUI(el, snapped, min, max);
      }
    };
    workbenchEl.addEventListener('mousedown', (e) => {
      const knob = e.target.closest('.knob-body');
      if (knob) { startDrag(knob, e.clientX, e.clientY); e.preventDefault(); }
    });
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', () => { this.activeDragKnob = null; });
    // 터치 지원 (태블릿 실습)
    workbenchEl.addEventListener('touchstart', (e) => {
      const knob = e.target.closest('.knob-body');
      if (knob && e.touches[0]) { startDrag(knob, e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }
    }, { passive: false });
    window.addEventListener('touchmove', (e) => { if (this.activeDragKnob && e.touches[0]) { moveDrag(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); } }, { passive: false });
    window.addEventListener('touchend', () => { this.activeDragKnob = null; });

    // 7. 휠 조절 (노브) / 계철 프레임 회전자 손으로 돌리기
    workbenchEl.addEventListener('wheel', (e) => {
      const knob = e.target.closest('.knob-body');
      if (knob) {
        e.preventDefault();
        const min = parseFloat(knob.dataset.min);
        const max = parseFloat(knob.dataset.max);
        const step = parseFloat(knob.dataset.step);
        const currVal = parseFloat(this.engine.getControlValue(knob.dataset.module, knob.dataset.control, 0));
        const delta = e.deltaY < 0 ? step : -step;
        const newVal = parseFloat(Math.max(min, Math.min(max, currVal + delta)).toFixed(2));
        this.updateKnobUI(knob, newVal, min, max);
        return;
      }
      const frameAssembly = e.target.closest('.rack-module[data-module-id="IEG-6030-10"]');
      if (frameAssembly && !this.engine.hasModule('IEG-6030-11') && (this.engine.assembly.machine || {}).manual) {
        e.preventDefault();
        this.engine.state.continuousSpin = false;
        this.engine.state.manualRpm = Math.min(400, Math.max(this.engine.state.manualRpm, 0) + 60);
        this.engine.state.manualDir = (e.deltaY < 0 ? 'CW' : 'CCW');
      }
    }, { passive: false });
  }

  updateKnobUI(knobEl, newVal, min, max) {
    const moduleId = knobEl.dataset.module;
    const controlId = knobEl.dataset.control;
    this.engine.setControlValue(moduleId, controlId, newVal);
    const ratio = (newVal - min) / (max - min);
    knobEl.style.transform = `rotate(${-135 + ratio * 270}deg)`;
    const bubble = document.getElementById(`val_${moduleId}_${controlId}`);
    if (bubble) bubble.textContent = `${newVal} ${bubble.dataset.unit || ''}`;
    if (this.onControlChange) this.onControlChange(moduleId, controlId, newVal);
  }

  /**
   * 모든 조작부(노브·스위치·로터리·램프) UI를 엔진 상태와 동기화
   */
  syncSwitchesUI() {
    const root = this.container;
    root.querySelectorAll('.rocker-switch').forEach(sw => {
      let on = !!this.engine.getControlValue(sw.dataset.module, sw.dataset.control, false);
      if (sw.dataset.control === 'MAIN_POWER_SW') on = on && !!this.engine.state.powerSupplyOn;
      if (sw.dataset.control === 'MOTOR_POWER') on = on && !!this.engine.state.autoDriverOn;
      sw.classList.toggle('sw-on', on);
      sw.classList.toggle('sw-off', !on);
    });
    root.querySelectorAll('.rotary-handle').forEach(h => {
      const options = JSON.parse(h.dataset.options);
      let idx = this.engine.getControlValue(h.dataset.module, h.dataset.control + '_idx', 1);
      if (h.dataset.control === 'MOTOR_DIR') {
        const dir = this.engine.state.autoDriverDir || 'STOP';
        idx = dir === 'CW' ? 2 : (dir === 'CCW' ? 0 : 1);
      }
      idx = Math.max(0, Math.min(options.length - 1, idx));
      h.dataset.currIdx = idx;
      h.style.transform = `rotate(${options[idx].angle}deg)`;
      h.title = tr('{label} (클릭하여 전환)', { label: options[idx].label });
    });
    root.querySelectorAll('.knob-body').forEach(k => {
      const min = parseFloat(k.dataset.min), max = parseFloat(k.dataset.max);
      const v = parseFloat(this.engine.getControlValue(k.dataset.module, k.dataset.control, min));
      k.style.transform = `rotate(${-135 + ((v - min) / (max - min)) * 270}deg)`;
      const bubble = document.getElementById(`val_${k.dataset.module}_${k.dataset.control}`);
      if (bubble) bubble.textContent = `${v} ${bubble.dataset.unit || ''}`;
    });
    root.querySelectorAll('.toggle-switch-wrapper').forEach(t => {
      const on = !!this.engine.getControlValue(t.dataset.module, t.dataset.switch, false);
      t.classList.toggle('sw-up', on);
      t.classList.toggle('sw-down', !on);
    });
    root.querySelectorAll('.lamp-socket').forEach(l => {
      const on = !!this.engine.getControlValue(l.dataset.module, `BULB_${l.dataset.lamp}`, true);
      l.classList.toggle('bulb-removed', !on);
    });
  }

  /** 디지털 패널메타 표시 문자열 (레인지에 맞춘 자릿수, 극성, 과부하 OL) */
  formatReading(id, r) {
    let v = r.display;
    let unit = r.unit;
    let fs = r.fs;
    if (r.ol) return { text: (r.value < 0 ? '−OL' : 'OL'), unit, ol: true };
    if (unit === 'A' && fs <= 0.1) { v *= 1000; unit = 'mA'; fs *= 1000; }
    let dec;
    if (id === 'M_GALVANO') dec = fs <= 5 ? 2 : (fs <= 50 ? 1 : 0);   // ±5mA: 0.00 / ±50mA: 0.0 / ±500mA: 0
    else if (unit === 'mA') dec = 1;                                   // 100mA 레인지: 00.0 mA
    else if (unit === 'A') dec = 3;                                    // 1A / 2.5A / 5A: 0.000 A
    else dec = fs <= 5 ? 3 : 2;                                        // 5V: 0.000 / 10·50·80V: 00.00
    const eps = 0.5 * Math.pow(10, -dec);
    if (Math.abs(v) < eps) v = 0;
    let text = Math.abs(v).toFixed(dec);
    if (v < 0) text = '−' + text;
    else if (r.bipolar && v > 0) text = '+' + text;
    return { text, unit, ol: false };
  }

  /**
   * 실시간 계측기 표시 갱신 (디지털 패널메타, RPM 미터, 램프)
   */
  updateMetersUI() {
    for (const [mId, r] of Object.entries(this.engine.readings)) {
      const el = document.getElementById(`meter_${mId}`);
      if (!el) continue;
      const numEl = el.querySelector('.dpm-num');
      if (!numEl) continue;
      const f = this.formatReading(mId, r);
      if (numEl.textContent !== f.text) numEl.textContent = f.text;
      const unitEl = el.querySelector('.dpm-unit');
      if (unitEl && unitEl.textContent !== f.unit) unitEl.textContent = f.unit;
      el.classList.toggle('dpm-overload', f.ol);
      el.classList.toggle('dpm-inactive', !r.active);
      const rangeEl = el.querySelector('.dpm-range');
      if (rangeEl && r.rangeLabel && rangeEl.textContent !== r.rangeLabel) rangeEl.textContent = r.rangeLabel;
      const bar = el.querySelector('.dpm-bar-fill');
      if (bar) {
        const ratio = Math.min(1, Math.abs(r.display) / (r.fs || 1));
        if (r.bipolar) {
          const span = ratio * 50;
          bar.style.left = r.display >= 0 ? '50%' : `${50 - span}%`;
          bar.style.width = `${span}%`;
        } else {
          bar.style.left = '0%';
          bar.style.width = `${ratio * 100}%`;
        }
      }
    }

    // 구동 전동기 RPM 미터 (모듈 11 자체 표시)
    const rpmMeter = document.getElementById('meter_M_RPM');
    if (rpmMeter) {
      const valEl = rpmMeter.querySelector('.digi-val');
      const txt = Math.round(Math.abs(this.engine.state.autoDriverRpm)).toString().padStart(4, '0');
      if (valEl && valEl.textContent !== txt) valEl.textContent = txt;
    }

    // 램프 밝기 (-1 = 전구 없음)
    for (const [key, ratio] of Object.entries(this.engine.state.lampBrightness || {})) {
      const [modId, lId] = key.split(':');
      const lEl = document.getElementById(`lamp_${modId}_${lId}`);
      if (!lEl) continue;
      const glow = lEl.querySelector('.lamp-glow');
      const fil = lEl.querySelector('.lamp-filament');
      const b = Math.max(0, ratio);
      if (glow) {
        glow.style.opacity = (b * 0.9).toFixed(2);
        glow.style.transform = `scale(${(0.7 + b * 0.8).toFixed(2)})`;
      }
      if (fil) {
        fil.style.backgroundColor = b > 0.05 ? '#fffae0' : '#444';
        fil.style.boxShadow = b > 0.05 ? `0 0 ${(10 * b).toFixed(1)}px #ffb703` : 'none';
      }
      lEl.classList.toggle('lamp-over', !!(this.engine.state.lampOver || {})[key]);
    }
  }
}
