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
             title="${def.name} - 단자 ${t.label}">
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
        const sizePct = c.sizePercent || 38.0;

        controlsHtml += `
          <div class="control-knob-wrapper" style="left: ${c.x}%; top: ${c.y}%; width: ${sizePct}%; aspect-ratio: 1/1;">
            <div class="knob-body"
                 data-module="${def.id}"
                 data-control="${c.id}"
                 data-min="${c.min}"
                 data-max="${c.max}"
                 data-step="${c.step || 1}"
                 style="transform: rotate(${angle}deg);">
              <div class="knob-indicator"></div>
            </div>
            <div class="knob-val-bubble" id="val_${def.id}_${c.id}">${val} ${c.unit || ''}</div>
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
             style="left: ${s.x}%; top: ${s.y}%;">
          <div class="toggle-lever"></div>
          <span class="toggle-label">${s.label}</span>
        </div>
      `;
    }

    // 램프 부하 (03번, 04번)
    let lampsHtml = '';
    for (const l of (def.lamps || [])) {
      lampsHtml += `
        <div class="lamp-socket" id="lamp_${def.id}_${l.id}" style="left: ${l.x}%; top: ${l.y}%;">
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
          <div class="digital-panel-meter ${themeClass}" id="meter_${m.id}" style="left: ${m.x}%; top: ${m.y}%; width: ${m.w}%; height: ${m.h}%;">
            <div class="dpm-header">
              <span class="dpm-title">${m.label}</span>
              <span class="dpm-range" id="range_${m.id}">${m.range || ''}</span>
            </div>
            <div class="dpm-body">
              <span class="dpm-num" id="dpm_val_${m.id}">0.00</span>
              <span class="dpm-unit">${m.unit}</span>
            </div>
            <div class="dpm-footer">
              <div class="dpm-bar-track">
                <div class="dpm-bar-fill" id="dpm_bar_${m.id}" style="width: 0%;"></div>
              </div>
              <div class="dpm-ticks">
                ${m.isBipolar ? '<span>-F.S.</span><span>0</span><span>+F.S.</span>' : '<span>0</span><span>50%</span><span>F.S.</span>'}
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
   * 이벤트 바인딩 (노브, 스위치, 단자)
   */
  attachEvents(workbenchEl) {
    // 1. 단자 클릭/드래그
    workbenchEl.addEventListener('click', (e) => {
      const jack = e.target.closest('.terminal-jack');
      if (jack) {
        const moduleId = jack.dataset.module;
        const terminalId = jack.dataset.terminal;
        this.onTerminalClick(moduleId, terminalId, jack);
      }
    });

    // 2. 락커 스위치 (전원 ON/OFF)
    workbenchEl.addEventListener('click', (e) => {
      const sw = e.target.closest('.rocker-switch');
      if (sw) {
        const moduleId = sw.dataset.module;
        const controlId = sw.dataset.control;
        const curr = this.engine.getControlValue(moduleId, controlId, false);
        const next = !curr;
        this.engine.setControlValue(moduleId, controlId, next);

        sw.classList.toggle('sw-on', next);
        sw.classList.toggle('sw-off', !next);

        if (controlId === 'MAIN_POWER_SW') {
          this.engine.state.powerSupplyOn = next;
          this.engine.solve();
          if (this.onControlChange) this.onControlChange(moduleId, controlId, next);
        } else if (controlId === 'MOTOR_POWER') {
          this.engine.state.autoDriverOn = next;
          if (!next) {
            this.engine.state.autoDriverRpm = 0;
          }
          this.engine.solve();
          if (this.onControlChange) this.onControlChange(moduleId, controlId, next);
        }
      }
    });

    // 3. 토글 스위치 (05번 RLC 부하)
    workbenchEl.addEventListener('click', (e) => {
      const tsw = e.target.closest('.toggle-switch-wrapper');
      if (tsw) {
        const moduleId = tsw.dataset.module;
        const switchId = tsw.dataset.switch;
        const curr = this.engine.getControlValue(moduleId, switchId, false);
        const next = !curr;
        this.engine.setControlValue(moduleId, switchId, next);

        tsw.classList.toggle('sw-up', next);
        tsw.classList.toggle('sw-down', !next);
        this.engine.solve();
        if (this.onControlChange) this.onControlChange(moduleId, switchId, next);
      }
    });

    // 4. 로터리/캠 스위치 (3-pos)
    workbenchEl.addEventListener('click', (e) => {
      const rsw = e.target.closest('.rotary-handle');
      if (rsw) {
        const moduleId = rsw.dataset.module;
        const controlId = rsw.dataset.control;
        const options = JSON.parse(rsw.dataset.options);
        let currIdx = parseInt(rsw.dataset.currIdx, 10);
        currIdx = (currIdx + 1) % options.length;
        rsw.dataset.currIdx = currIdx;

        const opt = options[currIdx];
        rsw.style.transform = `rotate(${opt.angle}deg)`;
        this.engine.setControlValue(moduleId, controlId, opt.value);
        this.engine.setControlValue(moduleId, controlId + '_idx', currIdx);

        if (controlId === 'MOTOR_DIR') {
          this.engine.state.autoDriverDir = opt.value;
          if (opt.value === 'STOP') {
            this.engine.state.autoDriverRpm = 0;
          } else {
            // 사용자가 CW 또는 CCW 회전 방향을 선택하면 구동 전원도 자동 ON
            this.engine.state.autoDriverOn = true;
            this.engine.setControlValue(moduleId, 'MOTOR_POWER', true);
            const pwr = workbenchEl.querySelector(`[data-module="${moduleId}"][data-control="MOTOR_POWER"]`);
            if (pwr) {
              pwr.classList.add('sw-on');
              pwr.classList.remove('sw-off');
            }
          }
          this.engine.solve();
          if (this.onControlChange) this.onControlChange(moduleId, controlId, opt.value);
        } else if (controlId === 'RANGE_SEL') {
          this.engine.solve();
          if (this.onControlChange) this.onControlChange(moduleId, controlId, opt.value);
        }
      }

    });

    // 5. 노브 마우스 원형 회전 드래그 & 마우스 휠
    workbenchEl.addEventListener('mousedown', (e) => {
      const knob = e.target.closest('.knob-body');
      if (knob) {
        const rect = knob.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx);

        this.activeDragKnob = {
          el: knob,
          cx,
          cy,
          lastAngle: startAngle,
          lastY: e.clientY,
          startVal: parseFloat(this.engine.getControlValue(knob.dataset.module, knob.dataset.control, 0)),
          currVal: parseFloat(this.engine.getControlValue(knob.dataset.module, knob.dataset.control, 0)),
          min: parseFloat(knob.dataset.min),
          max: parseFloat(knob.dataset.max),
          step: parseFloat(knob.dataset.step)
        };
        e.preventDefault();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.activeDragKnob) return;
      const { el, cx, cy, min, max, step } = this.activeDragKnob;

      // 1. 노브 중심 기준 마우스 원형 각도 회전 계산
      const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
      let diffAngle = currentAngle - this.activeDragKnob.lastAngle;
      // 각도 wrapping 처리 (-PI ~ +PI)
      if (diffAngle > Math.PI) diffAngle -= 2 * Math.PI;
      if (diffAngle < -Math.PI) diffAngle += 2 * Math.PI;
      this.activeDragKnob.lastAngle = currentAngle;

      // 2. 수직 드래그 보조 성분 계산
      const dy = this.activeDragKnob.lastY - e.clientY;
      this.activeDragKnob.lastY = e.clientY;

      const range = max - min;
      // 270도 (약 1.5*PI 라디안) 회전 = 전체 가변 범위
      let valDelta = (diffAngle / (1.5 * Math.PI)) * range;

      // 만약 각도 변화가 거의 없고 수직 직선 드래그만 일어난 경우 보조 지원
      if (Math.abs(diffAngle) < 0.005 && Math.abs(dy) > 1) {
        valDelta = (dy / 180) * range;
      }

      let nextVal = this.activeDragKnob.currVal + valDelta;
      nextVal = Math.max(min, Math.min(max, nextVal));
      this.activeDragKnob.currVal = nextVal;

      let snappedVal = Math.round((nextVal - min) / step) * step + min;
      snappedVal = Math.max(min, Math.min(max, snappedVal));
      if (step < 1) snappedVal = parseFloat(snappedVal.toFixed(2));

      this.updateKnobUI(el, snappedVal, min, max);
    });

    window.addEventListener('mouseup', () => {
      this.activeDragKnob = null;
    });

    // 휠 스크롤 조절
    workbenchEl.addEventListener('wheel', (e) => {
      const knob = e.target.closest('.knob-body');
      if (knob) {
        e.preventDefault();
        const min = parseFloat(knob.dataset.min);
        const max = parseFloat(knob.dataset.max);
        const step = parseFloat(knob.dataset.step);
        const currVal = parseFloat(this.engine.getControlValue(knob.dataset.module, knob.dataset.control, 0));
        const delta = e.deltaY < 0 ? step : -step;
        const newVal = Math.max(min, Math.min(max, currVal + delta));

        this.updateKnobUI(knob, newVal, min, max);
        return;
      }

      // 계철 프레임 회전자 휠 스크롤 회전 (손으로 돌리는 감각)
      const frameAssembly = e.target.closest('#field_frame_assembly');
      if (frameAssembly && !this.engine.modules.has('IEG-6030-11')) {
        e.preventDefault();
        this.engine.state.manualRpm = 320;
        this.engine.state.manualDir = (e.deltaY < 0 ? 'CW' : 'CCW');
        this.engine.solve();
      }
    }, { passive: false });
  }

  updateKnobUI(knobEl, newVal, min, max) {
    const moduleId = knobEl.dataset.module;
    const controlId = knobEl.dataset.control;
    this.engine.setControlValue(moduleId, controlId, newVal);

    const ratio = (newVal - min) / (max - min);
    const angle = -135 + ratio * 270;
    knobEl.style.transform = `rotate(${angle}deg)`;

    const bubble = document.getElementById(`val_${moduleId}_${controlId}`);
    if (bubble) {
      bubble.textContent = `${newVal}`;
    }

    if (controlId === 'SPEED_KNOB' || controlId === 'MOTOR_SPEED') {
      this.engine.state.targetRpm = newVal;
    }
    // 저항값(계자, 기동), 속도 등 모든 노브 값 변경 시 즉각 회로 물리 재해석 수행
    this.engine.solve();

    if (this.onControlChange) {
      this.onControlChange(moduleId, controlId, newVal);
    }
  }

  /**
   * 실기기 스위치 및 로터리 핸들 UI 상태를 엔진 상태와 동기화
   */
  syncSwitchesUI() {
    // 1. 06번 주전원 스위치
    const psuSw = this.container.querySelector('[data-module="IEG-6030-06"][data-control="MAIN_POWER_SW"]');
    if (psuSw) {
      const on = !!this.engine.state.powerSupplyOn;
      psuSw.classList.toggle('sw-on', on);
      psuSw.classList.toggle('sw-off', !on);
    }

    // 2. 11번 구동 모터 전원 스위치
    const motPwr = this.container.querySelector('[data-module="IEG-6030-11"][data-control="MOTOR_POWER"]');
    if (motPwr) {
      const on = !!this.engine.state.autoDriverOn;
      motPwr.classList.toggle('sw-on', on);
      motPwr.classList.toggle('sw-off', !on);
    }

    // 3. 11번 구동 모터 방향 로터리 스위치
    const dirSw = this.container.querySelector('[data-module="IEG-6030-11"][data-control="MOTOR_DIR"]');
    if (dirSw) {
      const dir = this.engine.state.autoDriverDir || 'STOP';
      let angle = 0;
      let idx = 1;
      if (dir === 'CW') { angle = 45; idx = 2; }
      else if (dir === 'CCW') { angle = -45; idx = 0; }
      dirSw.dataset.currIdx = idx;
      dirSw.style.transform = `rotate(${angle}deg)`;
    }

    // 4. 11번 속도 노브
    const speedKnob = this.container.querySelector('[data-module="IEG-6030-11"][data-control="MOTOR_SPEED"]') ||
                      this.container.querySelector('[data-module="IEG-6030-11"][data-control="SPEED_KNOB"]');
    if (speedKnob) {
      const rpm = this.engine.state.targetRpm || 1800;
      const ratio = rpm / 3500;
      const angle = -135 + ratio * 270;
      speedKnob.style.transform = `rotate(${angle}deg)`;
      const bubble = document.getElementById('val_IEG-6030-11_MOTOR_SPEED') ||
                     document.getElementById('val_IEG-6030-11_SPEED_KNOB');
      if (bubble) bubble.textContent = `${rpm} RPM`;
    }
  }

  /**
   * 실시간 계측기 바늘 각도 및 디지털 미터 텍스트 갱신
   */
  updateMetersUI() {
    for (const [mId, meter] of this.engine.meterPhysics.meters.entries()) {
      const el = document.getElementById(`meter_${mId}`);
      if (el) {
        // 1. 디지털 패널 메타 (Digital Panel Meter) 실시간 수치 및 바 그래프 갱신
        const dpmNum = el.querySelector('.dpm-num');
        const dpmBar = el.querySelector('.dpm-bar-fill');
        if (dpmNum) {
          const currVal = this.engine.meterPhysics.getCurrentValue(mId);
          const absVal = Math.abs(currVal);
          let formatted;
          if (mId === 'M_GALVANO') {
            formatted = (currVal >= 0 ? '+' : '') + currVal.toFixed(1);
          } else if (mId === 'M_DC_A' || mId === 'M_AC_A') {
            formatted = (absVal < 0.0005 ? 0 : currVal).toFixed(3);
          } else {
            formatted = (absVal < 0.005 ? 0 : currVal).toFixed(2);
          }
          dpmNum.textContent = formatted;

          if (dpmBar) {
            if (mId === 'M_GALVANO') {
              // Center-Zero 바이폴라: 중앙이 0, 좌우 50% 분기
              const fullScale = Math.abs(meter.maxVal || 50);
              const span = Math.min(50, (absVal / fullScale) * 50);
              if (currVal >= 0) {
                dpmBar.style.left = '50%';
                dpmBar.style.width = `${span}%`;
              } else {
                dpmBar.style.left = `${50 - span}%`;
                dpmBar.style.width = `${span}%`;
              }
              const rangeEl = el.querySelector('.dpm-range');
              if (rangeEl) rangeEl.textContent = `±${fullScale}mA`;
            } else {
              const maxV = meter.maxVal || 50;
              const pct = Math.min(100, Math.max(0, (absVal / maxV) * 100));
              dpmBar.style.left = '0%';
              dpmBar.style.width = `${pct}%`;
            }
          }
        }

        // 2. 아날로그 바늘 피벗 (기존 아날로그 메타 호환)
        const pivot = el.querySelector('.needle-pivot');
        if (pivot) {
          const angle = meter.currentAngle;
          const px = pivot.getAttribute('data-px') || '50';
          const py = pivot.getAttribute('data-py') || '78';
          pivot.setAttribute('transform', `translate(${px}, ${py}) rotate(${angle.toFixed(2)})`);
        }
      }
    }

    // 디지털 RPM 미터
    const rpmMeter = document.getElementById('meter_M_RPM');
    if (rpmMeter) {
      const valEl = rpmMeter.querySelector('.digi-val');
      if (valEl) {
        const rpm = Math.round(this.engine.state.autoDriverRpm);
        valEl.textContent = Math.abs(rpm).toString().padStart(4, '0');
      }
    }

    // 램프 밝기
    for (const [lId, ratio] of Object.entries(this.engine.state.lampBrightness)) {
      const lEl = document.getElementById(`lamp_IEG-6030-03_${lId}`) || document.getElementById(`lamp_IEG-6030-04_${lId}`);
      if (lEl) {
        const glow = lEl.querySelector('.lamp-glow');
        const fil = lEl.querySelector('.lamp-filament');
        if (glow) {
          glow.style.opacity = (ratio * 0.9).toFixed(2);
          glow.style.transform = `scale(${0.7 + ratio * 0.8})`;
        }
        if (fil) {
          fil.style.backgroundColor = ratio > 0.1 ? '#fffae0' : '#444';
          fil.style.boxShadow = ratio > 0.1 ? `0 0 ${10 * ratio}px #ffb703` : 'none';
        }
      }
    }
  }
}
