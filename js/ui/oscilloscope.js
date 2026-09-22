/**
 * IEG-6030 가상 디지털 스토리지 오실로스코프 (DSO)
 * 매뉴얼 실습 01, 02, 08, 10 등에 명시된 기전력 파형 측정 계측기
 */

export class VirtualOscilloscope {
  constructor(canvasEl, circuitEngine) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.engine = circuitEngine;

    this.settings = {
      voltDiv: 5,   // 5V / Div
      timeDiv: 5,   // 5ms / Div
      running: true,
      triggerLevel: 0
    };

    this.initCanvas();
  }

  initCanvas() {
    // Retina 대응
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = (rect.width || 340) * dpr;
    this.canvas.height = (rect.height || 200) * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width || 340;
    this.height = rect.height || 200;
  }

  toggleRun() {
    this.settings.running = !this.settings.running;
    return this.settings.running;
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. 화면 클리어 (CRT/디지털 오실로스코프 어두운 배경)
    ctx.fillStyle = '#0a1118';
    ctx.fillRect(0, 0, w, h);

    // 2. 그리드 (격자선: 10x8 divisions)
    ctx.strokeStyle = '#1e3040';
    ctx.lineWidth = 1;
    const xStep = w / 10;
    const yStep = h / 8;

    for (let x = 0; x <= w; x += xStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += yStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 중앙 크로스헤어 강조
    ctx.strokeStyle = '#2c475d';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. 실시간 파형 렌더링
    const scopeData = this.engine.state.scopeData;
    const data = scopeData.ch1;
    const midY = h / 2;
    const pixelsPerVolt = (yStep) / this.settings.voltDiv;

    ctx.strokeStyle = '#00f5d4'; // 오실로스코프 형광 시안 색상
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    const len = data.length;
    for (let i = 0; i < len; i++) {
      const x = (i / (len - 1)) * w;
      // 발전기 전압 파형
      const volt = data[i];
      const y = midY - volt * pixelsPerVolt;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. 정보 OSD 텍스트
    ctx.fillStyle = '#f1faee';
    ctx.font = '11px monospace';
    ctx.fillText(`CH1: ${this.settings.voltDiv}V/DIV`, 10, 18);
    ctx.fillText(`TIME: ${this.settings.timeDiv}ms/DIV`, 120, 18);
    ctx.fillStyle = '#00f5d4';
    ctx.fillText(`FREQ: ${scopeData.freq} Hz`, 10, h - 10);
    ctx.fillText(`Vpp: ${scopeData.vpp} V`, 140, h - 10);
  }
}
