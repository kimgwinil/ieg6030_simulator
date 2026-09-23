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

  /**
   * 측정 신호 크기 및 주파수에 맞추어 최적의 VOLT/DIV 및 TIME/DIV 자동 설정
   */
  autoScale() {
    const scopeData = this.engine.state.scopeData;
    const vpp = parseFloat(scopeData.vpp) || (this.engine.state.calculatedValues?.genTermVolt || 0) * 2;
    const amp = vpp / 2;
    const freq = scopeData.freq || (Math.abs(this.engine.state.rotorRpm || 0) / 60) || 30;

    // 수직축: 파형의 피크가 화면의 2.5~3 DIV에 오도록 최적 VOLT/DIV 선택
    let bestVolt = 50;
    for (const v of [1, 2, 5, 10, 20, 50]) {
      if ((amp / v) <= 3.2) {
        bestVolt = v;
        break;
      }
    }
    this.setVoltDiv(bestVolt);

    // 수평축: 10개 DIV 화면에 1.5 ~ 3개의 완전한 주기가 보이도록 최적 TIME/DIV 선택
    if (freq > 0.5) {
      const periodMs = 1000 / freq;
      const targetTimeDiv = (periodMs * 2.2) / 10;
      let bestTime = 50;
      for (const t of [1, 2, 5, 10, 20, 50]) {
        if (t >= targetTimeDiv * 0.8) {
          bestTime = t;
          break;
        }
      }
      this.setTimeDiv(bestTime);
    }

    this.resetY();
  }

  toggleRun() {
    this.settings.running = !this.settings.running;
    const btn = document.getElementById('btn_scope_run');
    if (btn) {
      btn.textContent = this.settings.running ? 'Run/Stop' : 'PAUSED';
      btn.classList.toggle('paused', !this.settings.running);
    }
    return this.settings.running;
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. 화면 클리어 (어두운 CRT 오실로스코프 화면)
    ctx.fillStyle = '#070d14';
    ctx.fillRect(0, 0, w, h);

    // 2. 그리드 (격자선: 10 horizontal x 8 vertical divisions)
    const numDivX = 10;
    const numDivY = 8;
    const xStep = w / numDivX;
    const yStep = h / numDivY;

    ctx.strokeStyle = '#142230';
    ctx.lineWidth = 1;

    for (let x = 0; x <= w + 1; x += xStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h + 1; y += yStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 중앙 크로스헤어 눈금
    ctx.strokeStyle = '#233d54';
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. 실시간 파형 생성 및 렌더링
    const scopeData = this.engine.state.scopeData;
    const freq = scopeData.freq || 0;
    const vpp = parseFloat(scopeData.vpp) || 0;
    const amplitude = vpp / 2;

    const midY = h / 2;
    const pixelsPerVolt = yStep / this.settings.voltDiv;
    const totalTimeSec = (numDivX * this.settings.timeDiv) / 1000;

    if (this.settings.running && freq > 0) {
      this.settings.phase += 0.08;
      if (this.settings.phase > 2 * Math.PI) this.settings.phase -= 2 * Math.PI;
    }

    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    const numPoints = Math.round(w);
    for (let i = 0; i <= numPoints; i++) {
      const x = (i / numPoints) * w;
      let volt = 0;
      if (freq > 0.1 && amplitude > 0.05) {
        const t = (x / w) * totalTimeSec;
        volt = Math.sin(2 * Math.PI * freq * t + this.settings.phase) * amplitude;
      } else if (amplitude > 0.05) {
        // 직류 전압일 경우 직선 표시
        volt = amplitude;
      }

      const y = midY - (volt + this.settings.yOffset) * pixelsPerVolt;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. 정보 OSD 텍스트 오버레이
    ctx.fillStyle = '#f1faee';
    ctx.font = '10.5px monospace';
    ctx.fillText(`CH1: ${this.settings.voltDiv}V/DIV`, 8, 16);
    ctx.fillText(`TIME: ${this.settings.timeDiv}ms/DIV`, w / 2 - 45, 16);

    ctx.fillStyle = this.settings.running ? '#22c55e' : '#ef4444';
    ctx.fillText(this.settings.running ? '▶ RUN' : '❚❚ STOP', w - 54, 16);

    ctx.fillStyle = '#00f5d4';
    ctx.fillText(`FREQ: ${freq.toFixed(1)} Hz`, 8, h - 8);
    const vrms = (amplitude * 0.707).toFixed(1);
    ctx.fillText(`Vpp: ${vpp.toFixed(1)}V (Vrms: ${vrms}V)`, w - 165, h - 8);
  }
}

