import { occDc, MACHINE } from '../engine/machine_models.js';

/**
 * IEG-6030 실습 피드백 및 종합 실험 보고서(Report) 생성기
 * 데이터 테이블, 무부하 포화곡선 / 외부특성곡선 그래프 렌더링, 인쇄 지원
 */

export class ReportGenerator {
  constructor(circuitEngine) {
    this.engine = circuitEngine;
    // 기록된 실험 데이터 포인트 목록
    this.recordedData = [];
  }

  recordCurrentPoint(labName = '') {
    const calc = this.engine.state.calculatedValues || {};
    const rpm = Math.round(Math.abs(calc.rotorRpm || 0));
    const vTerm = (calc.genTermVolt || 0).toFixed(2);
    const iLoad = (calc.genLoadCurr || 0).toFixed(3);
    const iField = ((calc.iField || 0) * 1000).toFixed(1); // mA
    const g = this.engine.readings.M_GALVANO;
    const galv = (g && g.active ? g.display : 0).toFixed(2); // mA
    const freq = (calc.frequency || 0).toFixed(1);

    // 운전 상태 및 동작 판정
    let status = '정상 운전';
    let statusClass = 'normal';
    if (this.engine.state.shortCircuit) {
      status = '단락(Short) 차단';
      statusClass = 'danger';
    } else if (rpm === 0 && Math.abs(parseFloat(galv)) > 0.05) {
      status = '수동 유도 기전력 검출';
      statusClass = 'normal';
    } else if (rpm > 0 && Math.abs(parseFloat(vTerm)) >= 1.0) {
      status = parseFloat(iLoad) > 0.05 ? '부하 운전 발전' : '무부하 정격 발전';
      statusClass = 'normal';
    } else if (rpm > 0 && Math.abs(parseFloat(vTerm)) < 1.0) {
      status = '미여자/무기전력 회전';
      statusClass = 'warn';
    } else if (rpm === 0) {
      status = '정지(STOP)';
      statusClass = 'warn';
    }

    const pt = {
      id: this.recordedData.length + 1,
      time: new Date().toLocaleTimeString(),
      labName: labName || '현재 실습',
      rpm,
      vSupply: (calc.psuDcVolts || 0).toFixed(1),
      iField,
      vTerm,
      iLoad,
      galv,
      freq,
      status,
      statusClass
    };
    this.recordedData.push(pt);
    return pt;
  }

  deletePoint(idx) {
    if (idx >= 0 && idx < this.recordedData.length) {
      this.recordedData.splice(idx, 1);
      // Re-index
      this.recordedData.forEach((p, i) => p.id = i + 1);
    }
  }

  clearData() {
    this.recordedData = [];
  }

  /**
   * 측정 그래프(Canvas) 그리기
   */
  drawGraph(canvasEl, type = 'SATURATION') {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    const w = canvasEl.width = 460;
    const h = canvasEl.height = 260;

    // 배경
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);

    // 여백
    const padL = 50, padR = 30, padT = 30, padB = 40;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // 축 그리기
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // 격자선
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([2, 2]);
    for (let i = 1; i <= 4; i++) {
      const y = padT + (plotH / 5) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    }
    for (let i = 1; i <= 5; i++) {
      const x = padL + (plotW / 6) * i;
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
    }
    ctx.setLineDash([]);

    // 라벨
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px sans-serif';
    if (type === 'SATURATION') {
      ctx.fillText('단자 전압 V [V]', 10, 20);
      ctx.fillText('계자 전류 If [mA]', padL + plotW - 40, h - 10);
    } else {
      ctx.fillText('단자 전압 V [V]', 10, 20);
      ctx.fillText('부하 전류 IL [A]', padL + plotW - 40, h - 10);
    }

    // 이론적 기준 곡선 (점선)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let xPx = 0; xPx <= plotW; xPx += 5) {
      const xRatio = xPx / plotW;
      let yVal = 0;
      if (type === 'SATURATION') {
        // 엔진과 동일한 무부하 포화곡선 E = Er + Ea·tanh(If/I0) @1800rpm
        const ifVal = xRatio * 500;
        yVal = occDc(ifVal / 1000);
      } else {
        // 타여자 발전기 외부특성 V = E0 − IL·(Ra + Rar) (무부하 전압 = 첫 기록점 또는 40V)
        const ilVal = xRatio * 2.5;
        const e0 = this.recordedData.length ? Math.max(...this.recordedData.map(d => Math.abs(parseFloat(d.vTerm)))) : 40;
        yVal = Math.max(0, e0 - ilVal * (MACHINE.armatureR + MACHINE.armatureReactionR));
      }
      const yRatio = yVal / 60.0;
      const yPx = padT + plotH - yRatio * plotH;
      if (xPx === 0) ctx.moveTo(padL + xPx, yPx);
      else ctx.lineTo(padL + xPx, yPx);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 사용자가 측정한 실측 데이터 포인트 플롯
    if (this.recordedData.length > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      this.recordedData.forEach((d, idx) => {
        const xVal = type === 'SATURATION' ? parseFloat(d.iField) : parseFloat(d.iLoad);
        const xMax = type === 'SATURATION' ? 500 : 2.5;
        const xRatio = Math.min(1.0, Math.max(0, xVal / xMax));
        const yRatio = Math.min(1.0, Math.max(0, Math.abs(parseFloat(d.vTerm)) / 60.0));

        const px = padL + xRatio * plotW;
        const py = padT + plotH - yRatio * plotH;

        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // 마커 원
      this.recordedData.forEach(d => {
        const xVal = type === 'SATURATION' ? parseFloat(d.iField) : parseFloat(d.iLoad);
        const xMax = type === 'SATURATION' ? 500 : 2.5;
        const xRatio = Math.min(1.0, Math.max(0, xVal / xMax));
        const yRatio = Math.min(1.0, Math.max(0, Math.abs(parseFloat(d.vTerm)) / 60.0));

        const px = padL + xRatio * plotW;
        const py = padT + plotH - yRatio * plotH;

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }
  }

  /**
   * 보고서 HTML 생성
   */
  generateReportHtml(evalResult) {
    let rowsHtml = '';
    this.recordedData.forEach((row, i) => {
      rowsHtml += `
        <tr>
          <td>${i + 1}</td>
          <td>${row.time}</td>
          <td>${row.rpm} RPM</td>
          <td>${row.iField} mA</td>
          <td>${row.vTerm} V</td>
          <td>${row.iLoad} A</td>
        </tr>
      `;
    });

    if (this.recordedData.length === 0) {
      rowsHtml = `<tr><td colspan="6" style="text-align:center; color:#94a3b8;">측정된 데이터가 없습니다. 실습 중 [데이터 기록] 버튼을 누르세요.</td></tr>`;
    }

    let checklistHtml = '';
    if (evalResult && evalResult.checklist) {
      evalResult.checklist.forEach(c => {
        checklistHtml += `
          <div class="report-eval-item ${c.passed ? 'passed' : 'failed'}">
            <span class="eval-badge">${c.passed ? '✓ 통과' : '✕ 미흡'}</span>
            <strong>${c.item}</strong> (${c.score}점): ${c.desc}
          </div>
        `;
      });
    }

    return `
      <div class="experiment-report-sheet">
        <div class="report-header">
          <h2>전기기계 구조 실습장비 (IEG-6030) 실습 보고서</h2>
          <div class="report-meta">
            <span><strong>실습 번호:</strong> ${evalResult ? evalResult.expId : '-'}</span>
            <span><strong>일시:</strong> ${new Date().toLocaleString()}</span>
            <span><strong>종합 점수:</strong> <span class="score-highlight">${evalResult ? evalResult.totalScore : 0}점 / 100점</span></span>
          </div>
        </div>

        <div class="report-section">
          <h3>1. 실습 평가 및 체크리스트</h3>
          <div class="eval-checklist-box">
            ${checklistHtml}
          </div>
        </div>

        <div class="report-section">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h3 style="margin:0;">2. 실습 계측 데이터 기록표 (${this.recordedData.length}건)</h3>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm" style="background:#10b981; color:#fff; border-color:#10b981;" onclick="window.app.reportGen.exportToCsv()">
                📥 CSV 다운로드
              </button>
              <button class="btn btn-sm" style="background:#059669; color:#fff; border-color:#059669;" onclick="window.app.reportGen.exportToExcel()">
                📊 Excel 다운로드
              </button>
              <button class="btn btn-sm" style="background:#0284c7; color:#fff; border-color:#0284c7;" onclick="window.app.reportGen.exportToPdf()">
                📄 PDF 저장/인쇄
              </button>
              <button class="btn btn-sm btn-danger" onclick="if(confirm('기록된 측정 데이터를 초기화하시겠습니까?')){ window.app.reportGen.clearData(); window.app.renderFeedbackView(); window.app.renderLiveMeasurementTable(); }">
                🗑️ 초기화
              </button>
            </div>
          </div>
          <table class="report-data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>측정 시각</th>
                <th>회전 속도 (RPM)</th>
                <th>계자 전류 (If)</th>
                <th>발전 단자전압 (V)</th>
                <th>부하 전류 (IL)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <div class="report-section">
          <h3>3. 특성 곡선 그래프 분석</h3>
          <div class="report-graph-wrap">
            <canvas id="report_graph_canvas"></canvas>
            <p class="graph-caption">※ 점선: 시뮬레이터 모델 이론 곡선 (포화곡선 E = 1.8 + 50·tanh(If/0.28) @1800rpm / 외부특성 V = E0 − IL·4.5Ω), 실선 및 포인트: 사용자 계측 기록</p>
          </div>
        </div>

        <div class="report-section">
          <h3>4. 기술 분석 및 피드백</h3>
          <div class="feedback-text">
            ${this.getFeedbackText(evalResult)}
          </div>
        </div>

        <div class="report-footer" style="display:flex; justify-content:center; gap:12px;">
          <button class="btn btn-primary" onclick="window.app.reportGen.exportToPdf()">🖨️ 보고서 인쇄 및 PDF 저장</button>
          <button class="btn" style="background:#10b981; color:#fff;" onclick="window.app.reportGen.exportToCsv()">📥 데이터 CSV 저장</button>
          <button class="btn" style="background:#059669; color:#fff;" onclick="window.app.reportGen.exportToExcel()">📊 데이터 Excel 저장</button>
        </div>
      </div>
    `;
  }

  getFeedbackText(evalResult) {
    if (!evalResult || evalResult.totalScore >= 80) {
      return `
        <p><strong>우수한 실습 성과:</strong> 전기기계의 전자기 유도 특성과 발전기-부하 간의 전기적 특성을 정확히 이해하고 올바른 결선 및 안정된 운전 조작을 달성하였습니다.</p>
        <p>계자 저항 변화에 따른 자화 곡선상의 포화 특성을 명확히 관찰하였으며, 계측기 측정값이 매뉴얼 권장 허용 범위 내에 잘 부합합니다.</p>
      `;
    } else {
      return `
        <p><strong>보완 권장 사항:</strong> 회로 배선에서 일부 단자가 누락되었거나 구동 모터 속도가 정격(1800 RPM)에 미달하였습니다.</p>
        <p>매뉴얼의 실습 결선도를 다시 확인하고, 계자 권선의 극성과 전압계의 접속 단자(V_50V 및 COM)가 올바르게 연결되었는지 점검하시기 바랍니다.</p>
      `;
    }
  }

  /**
   * CSV 파일 내보내기 (UTF-8 with BOM)
   */
  exportToCsv() {
    if (this.recordedData.length === 0) {
      alert('기록된 계측 데이터가 없습니다. 워크벤치에서 [데이터 기록]을 먼저 진행하세요.');
      return;
    }

    let csv = '\uFEFFNo,측정시각,실습과제,회전속도(RPM),계자전류(mA),발전단자전압(V),부하전류(A),검류계전류(mA),주파수(Hz),운전상태판정\r\n';
    this.recordedData.forEach((row, i) => {
      csv += `${i + 1},"${row.time}","${row.labName}",${row.rpm},${row.iField},${row.vTerm},${row.iLoad},${row.galv},${row.freq},"${row.status}"\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timeStr = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
    a.href = url;
    a.download = `IEG6030_실습계측데이터_${timeStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Excel (XLSX/XML) 파일 내보내기
   */
  exportToExcel() {
    if (this.recordedData.length === 0) {
      alert('기록된 계측 데이터가 없습니다. 워크벤치에서 [데이터 기록]을 먼저 진행하세요.');
      return;
    }

    let rowsXml = '';
    this.recordedData.forEach((r, i) => {
      rowsXml += `
        <tr>
          <td style="text-align:center;">${i + 1}</td>
          <td>${r.time}</td>
          <td>${r.labName}</td>
          <td style="text-align:right;">${r.rpm}</td>
          <td style="text-align:right;">${r.iField}</td>
          <td style="text-align:right;">${r.vTerm}</td>
          <td style="text-align:right;">${r.iLoad}</td>
          <td style="text-align:right;">${r.galv}</td>
          <td style="text-align:right;">${r.freq}</td>
          <td style="text-align:center;">${r.status}</td>
        </tr>
      `;
    });

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>IEG6030_데이터</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 11pt; }
          th { background: #0284c7; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8; padding: 8px; }
          td { border: 1px solid #cbd5e1; padding: 6px; }
        </style>
      </head>
      <body>
        <h3>IEG-6030 전기기계 구조 실습 계측 데이터 기록표</h3>
        <p>기록 일시: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>측정 시각</th>
              <th>실습 과제</th>
              <th>회전 속도 (RPM)</th>
              <th>계자 전류 (mA)</th>
              <th>발전 단자전압 (V)</th>
              <th>부하 전류 (A)</th>
              <th>검류계 전류 (mA)</th>
              <th>발전 주파수 (Hz)</th>
              <th>운전 상태 판정</th>
            </tr>
          </thead>
          <tbody>
            ${rowsXml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timeStr = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
    a.href = url;
    a.download = `IEG6030_실습데이터_${timeStr}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * PDF 보고서 인쇄 및 저장
   */
  exportToPdf() {
    if (window.app && window.app.currentTab !== 'feedback') {
      window.app.switchTab('feedback');
    }
    setTimeout(() => {
      window.print();
    }, 250);
  }
}
