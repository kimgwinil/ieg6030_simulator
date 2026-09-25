/**
 * IEG-6030 가상 디지털 스토리지 오실로스코프 (DSO)
 * 매뉴얼 실습 01, 02, 08, 10 등에 명시된 기전력 파형 측정 계측기
 * 수직 감도(VOLT/DIV), 수평 시간축(TIME/DIV), Y위치(Y-POS), AUTO 자동축맞춤 전면 지원
 */

export class VirtualOscilloscope {
  constructor(canvasEl, circuitEngine) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.engine = circuitEngine;

    this.settings = {
      voltDiv: 20,   // 기본 20V / Div (발전기 파형 40~80V에 최적)
      timeDiv: 10,   // 기본 10ms / Div (30Hz 파형 3주기 관찰)
      yOffset: 0,    // Y축 수직 오프셋 (V 단위)
      running: true,
      phase: 0
    };

    this.voltDivOptions = [1, 2, 5, 10, 20, 50];
    this.timeDivOptions = [1, 2, 5, 10, 20, 50];

    this.initCanvas();
    this.bindControls();
  }

  initCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = (rect.width || 340) * dpr;
    this.canvas.height = (rect.height || 180) * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width || 340;
    this.height = rect.height || 180;
  }

  bindControls() {
    const voltSelect = document.getElementById('scope_volt_div');
    if (voltSelect) {
      voltSelect.value = String(this.settings.voltDiv);
      voltSelect.addEventListener('change', (e) => {
        this.setVoltDiv(parseFloat(e.target.value));
      });
    }

    const timeSelect = document.getElementById('scope_time_div');
    if (timeSelect) {
      timeSelect.value = String(this.settings.timeDiv);
      timeSelect.addEventListener('change', (e) => {
        this.setTimeDiv(parseFloat(e.target.value));
      });
    }

    const btnYUp = document.getElementById('btn_scope_y_up');
    if (btnYUp) {
      btnYUp.addEventListener('click', () => {
        this.shiftY(this.settings.voltDiv * 0.5);
      });
    }

    const btnYZero = document.getElementById('btn_scope_y_zero');
    if (btnYZero) {
      btnYZero.addEventListener('click', () => {
        this.resetY();
      });
    }

    const btnYDown = document.getElementById('btn_scope_y_down');
    if (btnYDown) {
      btnYDown.addEventListener('click', () => {
        this.shiftY(-this.settings.voltDiv * 0.5);
      });
    }

    const btnAuto = document.getElementById('btn_scope_auto');
    if (btnAuto) {
      btnAuto.addEventListener('click', () => {
        this.autoScale();
      });
    }

    const btnRun = document.getElementById('btn_scope_run');
    if (btnRun) {
      btnRun.addEventListener('click', () => {
        this.toggleRun();
      });
    }
  }

  setVoltDiv(v) {
    if (v > 0) {
      this.settings.voltDiv = v;
      const sel = document.getElementById('scope_volt_div');
      if (sel) sel.value = String(v);
    }
  }

  setTimeDiv(t) {
    if (t > 0) {
      this.settings.timeDiv = t;
      const sel = document.getElementById('scope_time_div');
      if (sel) sel.value = String(t);
    }
  }

  shiftY(deltaVolts) {
    this.settings.yOffset += deltaVolts;
  }

  resetY() {
    this.settings.yOffset = 0;
  }

  /** 현재 신호의 순시값 v(t) 계산 (트리거: CH1 상승 영점) */
  signalAt(sd, t, k = 0) {
    const tr = sd.traces[k] || sd.traces[0];
    if (!tr) return 0;
    const w = 2 * Math.PI * (sd.freq || 0);
    switch (sd.type) {
      case 'sine':
      case 'sine3': return tr.amp * Math.sin(w * t + (tr.phase - (sd.traces[0]?.phase || 0)));
      case 'rectified': return tr.amp * Math.abs(Math.sin(w * t));
      case 'dc': return tr.amp;
      default: return 0;
    }
  }

  /**
   * 측정 신호 크기·주파수에 맞춰 VOLT/DIV, TIME/DIV 자동 설정
   */
  autoScale() {
    const sd = this.engine.state.scopeData || {};
    const peak = Math.max(0, ...((sd.traces || []).map(t => Math.abs(t.amp))));
    let bestVolt = 50;
    for (const v of this.voltDivOptions) { if (peak / v <= 3.2) { bestVolt = v; break; } }
    this.setVoltDiv(bestVolt);
    if (sd.freq > 0.5) {
      const periodMs = 1000 / sd.freq;
      const target = (periodMs * 2.5) / 10;   // 화면에 약 2.5주기
      let bestTime = 50;
      for (const t of this.timeDivOptions) { if (t >= target * 0.8) { bestTime = t; break; } }
      this.setTimeDiv(bestTime);
    }
    this.resetY();
  }

  toggleRun() {
    this.settings.running = !this.settings.running;
    const btn = document.getElementById('btn_scope_run');
    if (btn) {
      btn.textContent = this.settings.running ? 'Run/Stop' : 'STOPPED';
      btn.classList.toggle('paused', !this.settings.running);
    }
    return this.settings.running;
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    if (this.settings.running) this.frozen = JSON.parse(JSON.stringify(this.engine.state.scopeData || {}));
    const sd = this.frozen || { type: 'none', traces: [] };

    ctx.fillStyle = '#070d14';
    ctx.fillRect(0, 0, w, h);

    // 격자 10 × 8 DIV
    const numDivX = 10, numDivY = 8;
    const xStep = w / numDivX, yStep = h / numDivY;
    ctx.strokeStyle = '#142230';
    ctx.lineWidth = 1;
    for (let i = 0; i <= numDivX; i++) { ctx.beginPath(); ctx.moveTo(i * xStep, 0); ctx.lineTo(i * xStep, h); ctx.stroke(); }
    for (let i = 0; i <= numDivY; i++) { ctx.beginPath(); ctx.moveTo(0, i * yStep); ctx.lineTo(w, i * yStep); ctx.stroke(); }
    ctx.strokeStyle = '#233d54';
    ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
    ctx.setLineDash([]);

    const midY = h / 2;
    const pxPerV = yStep / this.settings.voltDiv;
    const totalT = (numDivX * this.settings.timeDiv) / 1000;
    const colors = ['#00f5d4', '#facc15', '#f472b6'];
    const nTr = sd.type === 'sine3' ? 3 : (sd.type === 'none' ? 1 : 1);

    for (let k = 0; k < nTr; k++) {
      ctx.strokeStyle = colors[k];
      ctx.lineWidth = 2;
      ctx.shadowColor = colors[k];
      ctx.shadowBlur = 5;
      ctx.beginPath();
      const N = Math.round(w);
      for (let i = 0; i <= N; i++) {
        const x = (i / N) * w;
        const v = this.signalAt(sd, (x / w) * totalT, k);
        const y = Math.max(-2, Math.min(h + 2, midY - (v + this.settings.yOffset) * pxPerV));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // OSD (상단: 감도·시간축·상태 / 하단: 측정값) — 글자 겹침 방지 위해 폭에 맞춰 배치
    const font = Math.max(9, Math.min(11, w / 32));
    ctx.font = `${font}px monospace`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#f1faee';
    ctx.textAlign = 'left';
    ctx.fillText(`CH1 ${this.settings.voltDiv}V/div`, 6, 5);
    ctx.textAlign = 'center';
    ctx.fillText(`${this.settings.timeDiv}ms/div`, w / 2, 5);
    ctx.textAlign = 'right';
    ctx.fillStyle = this.settings.running ? '#22c55e' : '#ef4444';
    ctx.fillText(this.settings.running ? 'RUN' : 'STOP', w - 6, 5);

    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#00f5d4';
    const f = sd.freq || 0;
    const peak = Math.abs((sd.traces || [])[0]?.amp || 0);
    let meas;
    if (sd.type === 'dc') meas = `DC ${peak.toFixed(2)}V`;
    else if (sd.type === 'rectified') meas = `Vp ${peak.toFixed(1)}V · 평균 ${(peak * 2 / Math.PI).toFixed(1)}V`;
    else if (sd.type === 'none') meas = '신호 없음';
    else meas = `Vpp ${(peak * 2).toFixed(1)}V · ${(peak / Math.SQRT2).toFixed(1)}Vrms`;
    ctx.textAlign = 'left';
    ctx.fillText(`f ${f.toFixed(1)}Hz`, 6, h - 4);
    ctx.textAlign = 'right';
    ctx.fillText(meas, w - 6, h - 4);
    if (sd.label) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.textBaseline = 'top';
      ctx.fillText(sd.type === 'sine3' ? 'A/B/C-N' : sd.label, 6, 5 + font + 3);
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}
