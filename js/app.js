/**
 * IEG-6030 전기기계 구조 실습 시뮬레이터 - 메인 애플리케이션 컨트롤러
 */

import { MODULE_DEFS } from './modules/module_defs.js';
import { CircuitEngine } from './engine/circuit.js';
import { CableRouter } from './cable_router.js';
import { MachineAssembler } from './assembly/machine_assembler.js';
import { ModuleRenderer } from './modules/module_renderer.js';
import { CableUI } from './ui/cable_ui.js';
import { VirtualOscilloscope } from './ui/oscilloscope.js';
import { THEORY_DATA } from './curriculum/theory_data.js';
import { EXPERIMENTS_DATA } from './curriculum/experiments_data.js';
import { EvaluationEngine } from './curriculum/evaluation_engine.js';
import { ReportGenerator } from './curriculum/report_generator.js';
import { FULL_MANUAL } from './curriculum/full_manual_data.js';

class SimulatorApp {
  constructor() {
    this.currentExpId = 'GEN-04'; // 기본 실습: 타려 분권 발전기
    this.currentTab = 'workbench'; // 'theory' | 'workbench' | 'evaluation' | 'feedback'
    this.isGuideCollapsed = false;
    this.isDockCollapsed = false;
    this.currentRackHeight = 420;
    this.isAutoFit = true;

    // 통합 교재 매뉴얼 리더 상태
    this.currentManualSectionId = 'chap_1_all';
    this.manualSearchTerm = '';

    // 엔진 초기화
    this.engine = new CircuitEngine(MODULE_DEFS);
    this.router = new CableRouter();
    this.assembler = new MachineAssembler(this.engine, () => this.onAssemblyUpdated());
    this.evaluator = new EvaluationEngine(this.engine, EXPERIMENTS_DATA);
    this.reportGen = new ReportGenerator(this.engine);

    // DOM 요소
    this.rackEl = document.getElementById('equipment_rack');
    this.cableSvg = document.getElementById('cable_svg_canvas');
    this.scopeCanvas = document.getElementById('oscilloscope_canvas');

    // UI 인스턴스
    this.moduleRenderer = new ModuleRenderer(
      this.rackEl,
      this.engine,
      (mId, tId, el) => {
        this.cableUI.handleTerminalClick(mId, tId, el);
      },
      (mId, cId, val) => {
        this.onControlChanged(mId, cId, val);
      }
    );

    this.cableUI = new CableUI(this.cableSvg, this.engine, this.router, () => {
      this.onCircuitUpdated();
    });

    this.scope = new VirtualOscilloscope(this.scopeCanvas, this.engine);

    // 루프 변수
    this.lastTime = performance.now();

    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupToolbar();
    this.setupSidebarControls();
    this.setupManualReader();
    this.loadExperiment(this.currentExpId);

    // 모듈 렌더러 이벤트 연결
    this.moduleRenderer.attachEvents(this.rackEl);

    // 메인 시뮬레이션 루프 가동
    requestAnimationFrame((t) => this.loop(t));

    // 화면 맞춤 기능 없이 자동으로 화면 가운데 정렬 및 무잘림 자동 크기 조정 (ResizeObserver)
    const wrap = document.getElementById('rack_workspace_wrap');
    if (wrap && window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.fitRackToScreen();
      });
      this.resizeObserver.observe(wrap);
    }

    // 윈도우 리사이즈 보조 대응
    window.addEventListener('resize', () => {
      this.fitRackToScreen();
      this.scope.initCanvas();
    });
  }

  /**
   * 상단 네비게이션 탭 설정
   */
  setupNavigation() {
    const tabBtns = document.querySelectorAll('.curriculum-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.dataset.tab;
        this.switchTab(tabKey);
      });
    });
  }

  switchTab(tabKey) {
    this.currentTab = tabKey;
    document.querySelectorAll('.curriculum-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabKey);
    });

    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeSec = document.getElementById(`view_${tabKey}`);
    if (activeSec) {
      activeSec.classList.add('active');
    }

    if (tabKey === 'theory') {
      this.renderTheoryView();
    } else if (tabKey === 'workbench') {
      setTimeout(() => {
        this.fitRackToScreen();
        this.cableUI.render();
        this.scope.initCanvas();
      }, 50);
    } else if (tabKey === 'evaluation') {
      this.renderEvaluationView();
    } else if (tabKey === 'feedback') {
      this.renderFeedbackView();
    }
  }

  /**
   * 툴바 설정
   */
  setupToolbar() {
    // 실습 선택 드롭다운 (25개 실습: 발전기 13종 + 전동기 12종)
    const expSelect = document.getElementById('exp_select');
    if (expSelect) {
      expSelect.innerHTML = '';
      const genGroup = document.createElement('optgroup');
      genGroup.label = '⚡ [제4장] 발전기의 기본 실습 (13개 과정)';
      const motGroup = document.createElement('optgroup');
      motGroup.label = '🔄 [제6장] 전동기의 기본 실습 (12개 과정)';

      EXPERIMENTS_DATA.forEach(exp => {
        const opt = document.createElement('option');
        opt.value = exp.id;
        opt.textContent = `${exp.title}`;
        if (exp.category === '발전기 실습') {
          genGroup.appendChild(opt);
        } else {
          motGroup.appendChild(opt);
        }
      });
      expSelect.appendChild(genGroup);
      expSelect.appendChild(motGroup);
      expSelect.value = this.currentExpId;
      expSelect.addEventListener('change', (e) => {
        this.loadExperiment(e.target.value);
      });
    }

    // 배선 초기화 버튼
    const clearWireBtn = document.getElementById('btn_clear_wires');
    if (clearWireBtn) {
      clearWireBtn.addEventListener('click', () => {
        this.engine.clearWires();
        this.cableUI.render();
        this.onCircuitUpdated();
      });
    }

    // 정답 배선 자동 연결 (원클릭 가이드 기능)
    const autoWireBtn = document.getElementById('btn_auto_wire');
    if (autoWireBtn) {
      autoWireBtn.addEventListener('click', () => {
        const exp = EXPERIMENTS_DATA.find(e => e.id === this.currentExpId);
        if (exp && exp.targetWires) {
          this.engine.clearWires();
          exp.targetWires.forEach(w => {
            this.engine.addWire(w.from, w.to, w.color);
          });
          this.cableUI.render();
          this.onCircuitUpdated();
        }
      });
    }

    // 명시적 RUN (운전) 버튼
    const btnRun = document.getElementById('btn_run');
    if (btnRun) {
      btnRun.addEventListener('click', () => {
        this.startSimulation(1800, 'CW');
      });
    }

    // 명시적 STOP (정지) 버튼
    const btnStop = document.getElementById('btn_stop');
    if (btnStop) {
      btnStop.addEventListener('click', () => {
        this.stopSimulation();
      });
    }

    // 마스터 발전기 운전 토글 버튼 (하위 호환)
    const runToggleBtn = document.getElementById('btn_toggle_run');
    if (runToggleBtn) {
      runToggleBtn.addEventListener('click', () => {
        if (this.engine.isRunning()) {
          this.stopSimulation();
        } else {
          this.startSimulation(1800, 'CW');
        }
      });
    }

    // 배선 정렬 방식 토글
    const routingModeSelect = document.getElementById('routing_mode_select');
    if (routingModeSelect) {
      routingModeSelect.addEventListener('change', (e) => {
        this.router.setRoutingMode(e.target.value);
        this.cableUI.render();
      });
    }

    // 전선 색상 칩 (신규 .wire-chip-btn 및 .wire-chip 지원)
    const colorChips = document.querySelectorAll('.wire-chip-btn, .wire-chip');
    colorChips.forEach(chip => {
      chip.addEventListener('click', () => {
        colorChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.cableUI.setColor(chip.dataset.color);
      });
    });

    // 실시간 데이터 기록 버튼들 (툴바, 서랍 헤더, 우측 계측 도크)
    const recordButtons = ['btn_record_data', 'btn_drawer_record', 'btn_dock_record'];
    recordButtons.forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleRecordMeasurement();
        });
      }
    });

    // 계측 서랍 초기화 버튼
    const clearDrawerBtn = document.getElementById('btn_drawer_clear');
    if (clearDrawerBtn) {
      clearDrawerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleClearMeasurements();
      });
    }

    // 계측 서랍 접기/펼치기 토글
    const drawerToggleBtn = document.getElementById('drawer_toggle_btn');
    if (drawerToggleBtn) {
      drawerToggleBtn.addEventListener('click', () => {
        this.toggleLiveDrawer();
      });
    }

    // 단축키: Spacebar로 1-클릭 계측 데이터 기록
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
        // 워크벤치 탭에서만 동작
        if (this.currentTab === 'workbench') {
          e.preventDefault();
          this.handleRecordMeasurement();
        }
      }
    });

    // 툴바 데이터 내보내기 버튼 (CSV, XLSX, PDF)
    const btnExportCsv = document.getElementById('btn_export_csv');
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => this.reportGen.exportToCsv());
    }
    const btnExportXlsx = document.getElementById('btn_export_xlsx');
    if (btnExportXlsx) {
      btnExportXlsx.addEventListener('click', () => this.reportGen.exportToExcel());
    }
    const btnExportPdf = document.getElementById('btn_export_pdf');
    if (btnExportPdf) {
      btnExportPdf.addEventListener('click', () => this.reportGen.exportToPdf());
    }
  }

  /**
   * 실시간 계측값 1클릭 기록 처리
   */
  handleRecordMeasurement() {
    const curExp = EXPERIMENTS[this.currentExpId];
    const labTitle = curExp ? curExp.title : this.currentExpId;
    const pt = this.reportGen.recordCurrentPoint(labTitle);

    // 서랍이 닫혀있으면 첫 기록 시 자동으로 펼침
    const drawer = document.getElementById('live_measurement_drawer');
    if (drawer && drawer.classList.contains('collapsed')) {
      this.toggleLiveDrawer(true);
    }

    this.renderLiveMeasurementTable(pt.id);
    this.showToast(`📥 [계측 #${pt.id}] ${pt.rpm} RPM | ${pt.vTerm} V | ${pt.iLoad} A 기록 완료`);
  }

  /**
   * 실시간 계측 데이터 테이블 렌더링
   */
  renderLiveMeasurementTable(newlyAddedId = null) {
    const tbody = document.getElementById('live_meas_tbody');
    const badge1 = document.getElementById('record_count_badge');
    const badge2 = document.getElementById('drawer_record_count_badge');

    const count = this.reportGen.recordedData.length;
    if (badge1) badge1.textContent = `${count}건`;
    if (badge2) badge2.textContent = `${count}건 기록됨`;

    if (!tbody) return;

    if (count === 0) {
      tbody.innerHTML = `
        <tr class="empty-meas-row">
          <td colspan="11">아직 기록된 데이터가 없습니다. 장비를 운전하고 [📥 계측값 기록] 버튼을 누르거나 스페이스바(Space)를 누르세요.</td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    this.reportGen.recordedData.forEach((r, idx) => {
      const isNew = r.id === newlyAddedId;
      rowsHtml += `
        <tr class="${isNew ? 'highlight-row' : ''}">
          <td style="font-weight:700; color:#38bdf8;">${r.id}</td>
          <td style="color:#94a3b8;">${r.time}</td>
          <td style="max-width:180px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${r.labName}">${r.labName}</td>
          <td style="font-weight:700; color:#22c55e;">${r.rpm}</td>
          <td style="font-weight:700; color:#38bdf8;">${r.vTerm}</td>
          <td style="font-weight:700; color:#38bdf8;">${r.iLoad}</td>
          <td style="font-weight:700; color:#f59e0b;">${r.iField}</td>
          <td style="font-weight:700; color:#a78bfa;">${r.galv}</td>
          <td style="font-weight:700; color:#38bdf8;">${r.freq}</td>
          <td><span class="meas-status-badge ${r.statusClass || 'normal'}">${r.status}</span></td>
          <td>
            <button class="btn-del-meas" onclick="window.app.handleDeleteMeasurement(${idx})" title="이 측정점 삭제">✕</button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  }

  /**
   * 특정 측정점 삭제
   */
  handleDeleteMeasurement(idx) {
    this.reportGen.deletePoint(idx);
    this.renderLiveMeasurementTable();
    this.showToast('🗑️ 측정 데이터가 삭제되었습니다.');
  }

  /**
   * 계측 데이터 전체 초기화
   */
  handleClearMeasurements() {
    if (this.reportGen.recordedData.length === 0) return;
    if (confirm('기록된 모든 계측 데이터를 초기화하시겠습니까?')) {
      this.reportGen.clearData();
      this.renderLiveMeasurementTable();
      this.showToast('🗑️ 모든 계측 데이터가 초기화되었습니다.');
    }
  }

  /**
   * 계측 서랍 접기/펼치기
   */
  toggleLiveDrawer(forceOpen = null) {
    const drawer = document.getElementById('live_measurement_drawer');
    const arrow = document.getElementById('drawer_toggle_arrow');
    if (!drawer) return;

    if (forceOpen === true) {
      drawer.classList.remove('collapsed');
      if (arrow) arrow.textContent = '▼ 접기';
    } else if (forceOpen === false) {
      drawer.classList.add('collapsed');
      if (arrow) arrow.textContent = '▲ 펼치기';
    } else {
      const isCollapsed = drawer.classList.toggle('collapsed');
      if (arrow) arrow.textContent = isCollapsed ? '▲ 펼치기' : '▼ 접기';
    }

    setTimeout(() => this.fitRackToScreen(), 150);
  }

  /**
   * 플로팅 알림 토스트 표시
   */
  showToast(msg) {
    const existing = document.querySelector('.meas-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'meas-toast';
    toast.innerHTML = `<span>⚡</span><span>${msg}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }

  /**
   * 화면 맞춤 버튼 없이 항상 화면 중앙에 전체 모듈이 짤림 없이 100% 보이도록 자동 계산
   */
  fitRackToScreen() {
    const wrap = document.getElementById('rack_workspace_wrap');
    const rack = document.getElementById('equipment_rack');
    if (!wrap || !rack) return;

    const modules = rack.querySelectorAll('.rack-module');
    if (modules.length === 0) return;

    let totalAspect = 0;
    modules.forEach(m => {
      const mId = m.dataset.moduleId;
      const def = MODULE_DEFS[mId];
      if (def && def.aspectRatio) {
        totalAspect += def.aspectRatio;
      } else if (mId === 'IEG-6030-11') {
        totalAspect += (532 / 478);
      } else if (m.classList.contains('module-double')) {
        totalAspect += (803 / 714);
      } else {
        totalAspect += (396 / 725);
      }
    });

    const gapCount = Math.max(0, modules.length - 1);
    const gapsWidth = gapCount * 12; // gap: 12px
    const rackFramePaddingX = 32; // rack padding 14px * 2 + border 4px
    const rackFramePaddingY = 56; // rack padding 20px * 2 + border 4px + duct
    const wrapPaddingX = 40; // wrap padding 20px * 2
    const wrapPaddingY = 32; // wrap padding 16px * 2

    const availW = Math.max(80, wrap.clientWidth - wrapPaddingX - rackFramePaddingX - gapsWidth);
    const availH = Math.max(80, wrap.clientHeight - wrapPaddingY - rackFramePaddingY);

    // 가로 폭과 세로 높이 모두 절대 넘치지 않도록 최대 높이 산출
    const heightFromW = availW / totalAspect;
    const optH = Math.min(availH, heightFromW);

    this.setRackHeight(Math.round(optH));
  }

  /**
   * 랙 모듈 높이 설정 및 화면 중앙 정렬 동기화
   */
  setRackHeight(newHeight) {
    this.currentRackHeight = Math.max(120, Math.min(650, newHeight));
    document.documentElement.style.setProperty('--rack-height', `${this.currentRackHeight}px`);

    this.cableUI.render();
    this.onAssemblyUpdated();
  }

  /**
   * 시뮬레이터 운전 가동 (RUN)
   */
  startSimulation(rpm = 1800, dir = 'CW') {
    this.engine.startRun(rpm, dir);
    this.moduleRenderer.syncSwitchesUI();
    this.updateRunControls();
    this.cableUI.render();
    this.updateMonitorDock();
  }

  /**
   * 시뮬레이터 운전 정지 (STOP)
   */
  stopSimulation() {
    this.engine.stopRun();
    this.moduleRenderer.syncSwitchesUI();
    this.updateRunControls();
    this.cableUI.render();
    this.updateMonitorDock();
  }

  /**
   * 실기기 스위치/노브 조작 시 상단 툴바 및 도크 상태 동기화
   */
  onControlChanged(moduleId, controlId, value) {
    this.updateRunControls();
    this.cableUI.render();
    this.updateMonitorDock();
  }

  /**
   * 상단 RUN / STOP 버튼 및 상태 뱃지 시각 동기화
   */
  updateRunControls() {
    const isRunning = this.engine.isRunning();
    const curRpm = Math.round(Math.abs(this.engine.state.autoDriverRpm || this.engine.state.rotorRpm || 0));

    const btnRun = document.getElementById('btn_run');
    const btnStop = document.getElementById('btn_stop');
    const statusBadge = document.getElementById('run_status_badge');

    if (btnRun) {
      btnRun.classList.toggle('active', isRunning);
    }
    if (btnStop) {
      btnStop.classList.toggle('active', !isRunning);
    }

    if (statusBadge) {
      statusBadge.className = `run-status-badge ${isRunning ? 'running' : 'stopped'}`;
      const txt = statusBadge.querySelector('.status-text');
      if (txt) {
        txt.textContent = isRunning ? `RUNNING (${curRpm > 0 ? curRpm : (this.engine.state.targetRpm || 1800)} RPM)` : 'STOPPED';
      }
    }

    // 하위 호환용 토글 버튼 동기화
    const runToggleBtn = document.getElementById('btn_toggle_run');
    if (runToggleBtn) {
      runToggleBtn.innerHTML = isRunning ? '⏹️ 발전기 운전 정지' : '▶️ 발전기 운전 가동';
      runToggleBtn.style.background = isRunning ? '#dc2626' : '#16a34a';
    }
  }

  /**
   * 실습 로드 (모듈 랙 배치 및 조립 프리셋)
   */
  loadExperiment(expId) {
    // 실습 전환 시 안전을 위해 먼저 정지
    this.stopSimulation();

    this.currentExpId = expId;
    const exp = EXPERIMENTS_DATA.find(e => e.id === expId);
    if (!exp) return;

    // 1. 랙 모듈 렌더링
    let rackHtml = `
      <div class="rack-cable-duct top">▲ CABLE TROUGH / WIRE DUCT (UPPER) ▲</div>
      <div class="rack-cable-duct bottom">▼ CABLE TROUGH / WIRE DUCT (LOWER) ▼</div>
    `;

    exp.modules.forEach((mId, slotIdx) => {
      rackHtml += this.moduleRenderer.renderModule(mId, slotIdx);
    });

    this.rackEl.innerHTML = rackHtml;

    // 2. 기계 조립 상태 프리셋 적용
    if (exp.assemblyConfig) {
      this.assembler.state.rotor = exp.assemblyConfig.rotor;
      this.assembler.state.poles = { ...exp.assemblyConfig.poles };
      this.assembler.state.beltInstalled = exp.assemblyConfig.beltInstalled;
      this.assembler.syncEngine();
    }

    // 3. 사이드바 가이드 텍스트 업데이트
    this.updateSidebarGuide(exp);

    // 4. 배선 캔버스 및 하드웨어 스위치 동기화
    setTimeout(() => {
      this.moduleRenderer.syncSwitchesUI();
      this.updateRunControls();
      if (this.isAutoFit) {
        this.fitRackToScreen();
      }
      this.cableUI.render();
      this.onAssemblyUpdated();
    }, 60);
  }

  /**
   * 현재 실습에 자동 구동 유닛(IEG-6030-11)을 추가하여 자동 회전 구동
   */
  addDriveMotorToCurrentExp() {
    const exp = EXPERIMENTS_DATA.find(e => e.id === this.currentExpId);
    if (!exp) return;

    // 이미 있으면 무시
    if (exp.modules.includes('IEG-6030-11')) return;

    // 11번 모듈 추가 + 벨트 연결 설정
    exp.modules.push('IEG-6030-11');
    if (exp.assemblyConfig) {
      exp.assemblyConfig.beltInstalled = true;
    }

    // 연속 회전 해제
    this.engine.state.continuousSpin = false;
    this.engine.state.manualRpm = 0;

    // 실험 재로드
    this.loadExperiment(this.currentExpId);
  }

  updateSidebarGuide(exp) {
    const titleEl = document.getElementById('guide_exp_title');
    const goalEl = document.getElementById('guide_exp_goal');
    const procEl = document.getElementById('guide_exp_procedure');
    const readEl = document.getElementById('guide_exp_expected');

    if (titleEl) titleEl.textContent = exp.title;
    if (goalEl) goalEl.textContent = exp.goal;
    if (readEl) readEl.textContent = exp.expectedReadings.value;

    if (procEl) {
      procEl.innerHTML = exp.procedure.map(p => `<li>${p}</li>`).join('');
    }

    // 기계 조립 컨트롤 셀렉트 동기화
    const rotorSel = document.getElementById('select_rotor_type');
    if (rotorSel) rotorSel.value = this.assembler.state.rotor;

    const beltCheck = document.getElementById('check_belt_installed');
    if (beltCheck) beltCheck.checked = this.assembler.state.beltInstalled;
  }

  setupSidebarControls() {
    const rotorSel = document.getElementById('select_rotor_type');
    if (rotorSel) {
      rotorSel.addEventListener('change', (e) => {
        this.assembler.setRotor(e.target.value);
      });
    }

    const beltCheck = document.getElementById('check_belt_installed');
    if (beltCheck) {
      beltCheck.addEventListener('change', (e) => {
        this.assembler.state.beltInstalled = e.target.checked;
        this.assembler.syncEngine();
      });
    }

    // 워크벤치 가이드 및 도크에서 해당 실습 교재 매뉴얼 바로가기 버튼
    const gotoManualBtn = document.getElementById('btn_goto_manual');
    if (gotoManualBtn) {
      gotoManualBtn.addEventListener('click', () => {
        this.openManualForCurrentLab();
      });
    }

    const dockGotoBtn = document.getElementById('btn_dock_goto_manual');
    if (dockGotoBtn) {
      dockGotoBtn.addEventListener('click', () => {
        this.openManualForCurrentLab();
      });
    }
  }

  onAssemblyUpdated() {
    const svgG = document.getElementById('assembly_svg_content');
    if (svgG) {
      svgG.innerHTML = this.assembler.renderSvg();
    }
  }

  onCircuitUpdated() {
    this.engine.solve();
    this.updateMonitorDock();
  }

  updateMonitorDock() {
    const calc = this.engine.state.calculatedValues || {};
    const vEl = document.getElementById('dock_stat_volt');
    const iEl = document.getElementById('dock_stat_curr');
    const rpmEl = document.getElementById('dock_stat_rpm');
    const ifEl = document.getElementById('dock_stat_ifield');
    const galvEl = document.getElementById('dock_stat_galv');
    const freqEl = document.getElementById('dock_stat_freq');

    if (vEl) vEl.textContent = `${(calc.genTermVolt || 0).toFixed(1)} V`;
    if (iEl) iEl.textContent = `${(calc.genLoadCurr || 0).toFixed(2)} A`;
    if (rpmEl) rpmEl.textContent = `${Math.round(calc.generatorRpm || this.engine.state.autoDriverRpm || 0)} RPM`;
    if (ifEl) ifEl.textContent = `${((calc.iField || 0) * 1000).toFixed(1)} mA`;
    if (galvEl) galvEl.textContent = `${(calc.galvanoVal || 0).toFixed(2)} mA`;
    const rpm = calc.generatorRpm || this.engine.state.autoDriverRpm || 0;
    const freq = calc.frequency || (rpm > 0 ? (rpm / 60) : 0);
    if (freqEl) freqEl.textContent = `${freq.toFixed(1)} Hz`;
  }

  /**
   * 통합 교재 매뉴얼 리더 이벤트 및 검색 설정
   */
  setupManualReader() {
    const searchInput = document.getElementById('manual_search_input');
    const clearBtn = document.getElementById('btn_clear_search');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.manualSearchTerm = e.target.value.trim().toLowerCase();
        if (clearBtn) {
          clearBtn.style.display = this.manualSearchTerm ? 'inline-block' : 'none';
        }
        this.renderManualToc();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.manualSearchTerm = '';
        clearBtn.style.display = 'none';
        this.renderManualToc();
      });
    }

    this.renderManualToc();
    this.renderManualContent();
  }

  /**
   * 이론/매뉴얼 탭 활성화 시 매뉴얼 렌더링 동기화
   */
  renderTheoryView() {
    this.renderManualToc();
    this.renderManualContent();
  }

  /**
   * 좌측 목차 (TOC) 렌더링
   */
  renderManualToc() {
    const tocSidebar = document.getElementById('manual_toc_sidebar');
    if (!tocSidebar) return;

    let html = '';
    const q = this.manualSearchTerm || '';

    FULL_MANUAL.chapters.forEach(chap => {
      // 검색어 필터링
      const filteredSections = chap.sections.filter(sec => {
        if (!q) return true;
        return (
          chap.title.toLowerCase().includes(q) ||
          sec.title.toLowerCase().includes(q) ||
          sec.content.toLowerCase().includes(q)
        );
      });

      if (filteredSections.length === 0 && q) return;

      const isLabChapter = chap.num === 4 || chap.num === 6;

      html += `
        <div class="manual-toc-group">
          <div class="manual-toc-header">
            <span>${chap.title}</span>
            <span class="manual-toc-badge ${isLabChapter ? 'lab' : 'theory'}">${isLabChapter ? `${chap.sections.length}개 실습` : '이론/규격'}</span>
          </div>
          <div class="manual-toc-list">
            ${filteredSections.map(sec => {
              const isActive = sec.id === this.currentManualSectionId;
              return `
                <div class="manual-toc-item ${isActive ? 'active' : ''}" onclick="window.app.selectManualSection('${sec.id}')">
                  <span style="font-size:11px; opacity:0.75;">${sec.labId ? '⚡' : '📄'}</span>
                  <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;" title="${sec.title}">${sec.title}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    if (!html && q) {
      html = `
        <div style="padding:28px; text-align:center; color:#94a3b8; font-size:13px;">
          검색어 "<strong>${q}</strong>"에 일치하는 매뉴얼 항목이 없습니다.
        </div>
      `;
    }

    tocSidebar.innerHTML = html;
  }

  /**
   * 목차에서 섹션 선택
   */
  selectManualSection(secId) {
    this.currentManualSectionId = secId;
    this.renderManualToc();
    this.renderManualContent();
    const viewer = document.getElementById('manual_content_viewer');
    if (viewer) viewer.scrollTop = 0;
  }

  /**
   * 우측 본문 뷰어 렌더링
   */
  renderManualContent() {
    const contentTarget = document.getElementById('theory_content_target');
    if (!contentTarget) return;

    let foundChap = null;
    let foundSec = null;

    for (const chap of FULL_MANUAL.chapters) {
      const s = chap.sections.find(sec => sec.id === this.currentManualSectionId);
      if (s) {
        foundChap = chap;
        foundSec = s;
        break;
      }
    }

    if (!foundSec && FULL_MANUAL.chapters[0]?.sections[0]) {
      foundChap = FULL_MANUAL.chapters[0];
      foundSec = FULL_MANUAL.chapters[0].sections[0];
      this.currentManualSectionId = foundSec.id;
    }

    if (!foundSec) {
      contentTarget.innerHTML = `<div style="padding:40px; color:#94a3b8;">본문 내용이 없습니다.</div>`;
      return;
    }

    const html = `
      <div class="manual-breadcrumb">
        <span>📖 IEG-6030 디지털 교재</span>
        <span>›</span>
        <span>${foundChap.title}</span>
        <span>›</span>
        <span style="color:#38bdf8; font-weight:600;">${foundSec.title}</span>
      </div>
      <h1 class="manual-article-title">${foundSec.title}</h1>
      <div class="manual-article-subtitle">${foundChap.subtitle}</div>
      <div class="manual-body-text">
        ${foundSec.content}
      </div>
    `;

    contentTarget.innerHTML = html;
  }

  /**
   * 매뉴얼 본문에서 워크벤치 실습으로 즉시 로드
   */
  loadManualLab(labId) {
    this.currentExpId = labId;
    const expSelect = document.getElementById('exp_select');
    if (expSelect) {
      expSelect.value = labId;
    }
    this.loadExperiment(labId);
    this.switchTab('workbench');
  }

  /**
   * 현재 워크벤치 실습에 해당하는 교재 매뉴얼 본문 열기
   */
  openManualForCurrentLab() {
    let targetSecId = 'chap_1_all';
    if (this.currentExpId && this.currentExpId.startsWith('GEN-')) {
      const num = this.currentExpId.replace('GEN-', '');
      targetSecId = `chap_4_${num}`;
    } else if (this.currentExpId && this.currentExpId.startsWith('MOT-')) {
      const num = this.currentExpId.replace('MOT-', '');
      targetSecId = `chap_6_${num}`;
    }

    this.currentManualSectionId = targetSecId;
    this.switchTab('theory');
    this.renderManualToc();
    this.renderManualContent();
    const viewer = document.getElementById('manual_content_viewer');
    if (viewer) viewer.scrollTop = 0;
  }
  renderEvaluationView() {
    const result = this.evaluator.evaluateExperiment(this.currentExpId);
    const container = document.getElementById('eval_content_target');
    if (!container) return;

    let checklistHtml = '';
    result.checklist.forEach(c => {
      checklistHtml += `
        <div class="report-eval-item ${c.passed ? 'passed' : 'failed'}">
          <span class="eval-badge">${c.passed ? '✓ 정상' : '✕ 미흡'}</span>
          <strong>${c.item}</strong> (${c.score}점): ${c.desc}
        </div>
      `;
    });

    const quizScore = this.evaluator.getQuizScore();

    let quizHtml = '';
    this.evaluator.quizQuestions.forEach((q, idx) => {
      const userState = this.evaluator.userQuizAnswers[q.id] || { selected: null, checked: false };
      const isAnswered = userState.selected !== null;
      const isChecked = userState.checked;
      const isCorrect = isChecked && (userState.selected === q.correctIndex);

      quizHtml += `
        <div class="quiz-card" id="quiz_card_${q.id}" style="border-left: 4px solid ${isChecked ? (isCorrect ? '#10b981' : '#ef4444') : '#38bdf8'};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
            <span class="quiz-category-tag" style="background:#0f172a; color:#38bdf8; font-size:11.5px; padding:3px 8px; border-radius:4px; font-weight:600;">
              [${q.category}] 문항 ${idx + 1} / ${this.evaluator.quizQuestions.length}
            </span>
            ${isChecked ? (isCorrect ? '<span style="color:#34d399; font-weight:800; font-size:13px;">✅ 정답 (+10점)</span>' : '<span style="color:#f87171; font-weight:800; font-size:13px;">❌ 오답</span>') : ''}
          </div>

          <div class="quiz-question" style="font-size:14.5px; line-height:1.5; color:#f8fafc; margin-bottom:12px;">
            ${idx + 1}. ${q.question}
          </div>

          <div class="quiz-options">
            ${q.options.map((opt, oIdx) => {
              const checkedAttr = (userState.selected === oIdx) ? 'checked' : '';
              let labelStyle = '';
              if (isChecked) {
                if (oIdx === q.correctIndex) {
                  labelStyle = 'border: 1px solid #10b981; background: rgba(16,185,129,0.15);';
                } else if (userState.selected === oIdx) {
                  labelStyle = 'border: 1px solid #ef4444; background: rgba(239,68,68,0.15);';
                }
              }
              return `
                <label class="quiz-option-label" style="${labelStyle}">
                  <input type="radio" name="quiz_${q.id}" value="${oIdx}" ${checkedAttr} onchange="window.app.onSelectQuizOption('${q.id}', ${oIdx})">
                  <span style="flex:1;">${oIdx + 1}) ${opt}</span>
                  ${isChecked && oIdx === q.correctIndex ? '<strong style="color:#34d399; font-size:12px;">[정답]</strong>' : ''}
                </label>
              `;
            }).join('')}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
            <button class="btn btn-sm btn-primary" onclick="window.app.onCheckQuiz('${q.id}')" ${!isAnswered ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
              🔍 정답 확인
            </button>
            ${!isChecked && isAnswered ? '<span style="font-size:12px; color:#f59e0b;">보기를 선택했습니다. [정답 확인]을 클릭하세요.</span>' : ''}
          </div>

          ${isChecked ? `
            <div class="quiz-result-msg ${isCorrect ? 'correct' : 'incorrect'}" style="margin-top:12px; line-height:1.5;">
              <div style="font-weight:700; margin-bottom:4px;">
                ${isCorrect ? '🎉 정답입니다!' : `⚠️ 오답입니다. (정답: ${q.correctIndex + 1}번)`}
              </div>
              <div style="font-size:12.5px; opacity:0.95;">
                <strong>상세 해설:</strong> ${q.explanation}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    });

    container.innerHTML = `
      <div class="curriculum-card">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #38bdf8; padding-bottom: 12px; margin-bottom: 20px;">
          <div>
            <h2 class="curriculum-title" style="margin:0;">📝 실습 과제 평가 및 실습문제 풀이</h2>
            <div class="curriculum-subtitle" style="margin:4px 0 0 0;">매뉴얼 기반 배선/조립/운전 실기 자동 채점 및 핵심 이론 실습문제 10문항 풀이</div>
          </div>
          <button class="btn btn-primary" onclick="window.app.switchTab('feedback')">📊 실습 결과 보고서 보기</button>
        </div>

        <!-- 1. 실습 장비 조작 실기 채점 카드 -->
        <div class="report-section">
          <h3>1. 실기 과제 결선 및 운전 자동 채점 (100점 만점)</h3>
          <div style="background:#0f172a; padding:16px 20px; border-radius:8px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; border: 1px solid #334155;">
            <div>
              <div style="font-size:12.5px; color:#94a3b8;">현재 과제 실기 획득 점수</div>
              <div style="font-size:28px; font-weight:900; color:${result.passed ? '#34d399' : '#f87171'};">
                ${result.totalScore}점 <span style="font-size:15px; font-weight:600; color:#cbd5e1;">/ 100점 (${result.passed ? '합격' : '보완 필요'})</span>
              </div>
            </div>
            <div style="text-align:right; font-size:12px; color:#94a3b8;">
              채점 기준: 랙 배치(20) + 조립(20) + 결선(40) + 운전(20)<br>
              합격 기준: 70점 이상
            </div>
          </div>

          <div class="eval-checklist-box">
            ${checklistHtml}
          </div>
        </div>

        <!-- 2. 매뉴얼 핵심 실습문제 풀이 및 정답 확인 -->
        <div class="report-section" style="margin-top:36px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <h3>2. 매뉴얼 핵심 실습문제 10선 및 정답 확인</h3>
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:13px; color:#cbd5e1; background:#0f172a; padding:6px 14px; border-radius:6px; border:1px solid #334155;">
                진행도: <strong style="color:#38bdf8;">${quizScore.answered}</strong> / ${quizScore.total}문제 완료 | 정답: <strong style="color:#22c55e;">${quizScore.correct}</strong>개 (<strong style="color:#f59e0b;">${quizScore.pct}%</strong>)
              </span>
              <button class="btn btn-sm btn-danger" onclick="window.app.onResetQuiz()" title="모든 문제의 풀이 상태를 초기화합니다">
                🔄 문제 초기화
              </button>
            </div>
          </div>

          <div class="quiz-section">
            ${quizHtml}
          </div>
        </div>
      </div>
    `;
  }

  onSelectQuizOption(qId, optionIdx) {
    this.evaluator.setQuizAnswer(qId, optionIdx);
    this.renderEvaluationView();
  }

  onCheckQuiz(qId) {
    this.evaluator.checkQuizAnswer(qId);
    this.renderEvaluationView();
  }

  onResetQuiz() {
    if (confirm('모든 문제 풀이 기록을 초기화하시겠습니까?')) {
      this.evaluator.resetAllQuiz();
      this.renderEvaluationView();
    }
  }

  renderFeedbackView() {
    const container = document.getElementById('feedback_content_target');
    if (!container) return;

    const evalResult = this.evaluator.evaluateExperiment(this.currentExpId);
    container.innerHTML = this.reportGen.generateReportHtml(evalResult);

    // 그래프 렌더링
    setTimeout(() => {
      const canvas = document.getElementById('report_graph_canvas');
      if (canvas) {
        const type = (this.currentExpId === 'EXP-07') ? 'LOAD' : 'SATURATION';
        this.reportGen.drawGraph(canvas, type);
      }
    }, 50);
  }

  /**
   * 메인 60FPS 애니메이션 루프
   */
  loop(timestamp) {
    const dt = (timestamp - this.lastTime) / 1000.0;
    this.lastTime = timestamp;

    // 1. 물리 엔진 업데이트
    this.engine.update(dt);

    // 2. 계철 프레임 로터, 모터 풀리 및 구동 벨트 60FPS 회전 애니메이션
    const hasDriveMotor = this.engine.modules.has('IEG-6030-11');
    const isGenerator = this.currentExpId.startsWith('GEN');
    let rotorRpm = 0;
    let motorRpm = 0;

    // 수동 회전 중인 경우 자연스러운 회전 감속(inertia friction decay)
    if (this.engine.state.manualRpm > 0) {
      if (!this.engine.state.continuousSpin) {
        // 단발 회전: 서서히 감속 (약 2.5초에 정지)
        this.engine.state.manualRpm = Math.max(0, this.engine.state.manualRpm - dt * 120);
      }
      this.engine.solve();
    }

    if (hasDriveMotor) {
      if (isGenerator) {
        motorRpm = this.engine.state.autoDriverRpm;
        rotorRpm = this.assembler.state.beltInstalled ? (motorRpm * 0.99) : 0;
      } else {
        rotorRpm = this.engine.state.rotorRpm || this.engine.state.autoDriverRpm;
        motorRpm = 0;
      }
    } else {
      // 구동 모터(11)가 없는 실습 (예: GEN-01)
      if (this.engine.state.manualRpm > 0) {
        rotorRpm = (this.engine.state.manualDir === 'CCW' ? -this.engine.state.manualRpm : this.engine.state.manualRpm);
      } else {
        rotorRpm = this.engine.state.rotorRpm || 0;
      }
      motorRpm = 0;
    }

    const isCcw = (hasDriveMotor ? (this.engine.state.autoDriverDir === 'CCW') : (this.engine.state.manualDir === 'CCW'));
    this.assembler.updateAnimation(dt, rotorRpm, motorRpm, isCcw);

    // 3. 계측기 바늘 지침 및 디스플레이 갱신
    this.moduleRenderer.updateMetersUI();

    // 4. 모니터 도크 수치 갱신
    this.updateMonitorDock();

    // 5. 오실로스코프 렌더링
    if (this.currentTab === 'workbench') {
      this.scope.render();
    }

    requestAnimationFrame((t) => this.loop(t));
  }
}

// 애플리케이션 기동
window.addEventListener('DOMContentLoaded', () => {
  window.app = new SimulatorApp();
});
