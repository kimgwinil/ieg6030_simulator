/**
 * IEG-6030 다국어(한국어/English) 지원
 * - t('한국어 원문', {변수}) : 현재 언어가 영어면 사전(EN)에서 번역을 찾아 반환, 없으면 원문
 * - applyStaticI18n(root) : index.html 정적 텍스트·툴팁·placeholder를 현재 언어로 교체 (원문은 보관)
 */

const STORAGE_KEY = 'ieg6030_lang';
let current = 'ko';
try {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (saved === 'ko' || saved === 'en') current = saved;
  else if (typeof location !== 'undefined' && /[?&]lang=en/.test(location.search)) current = 'en';
} catch (e) { /* 저장소 사용 불가 시 기본 한국어 */ }

const listeners = new Set();

export function getLang() { return current; }
export function isEn() { return current === 'en'; }

export function setLang(lang) {
  if (lang !== 'ko' && lang !== 'en') return;
  current = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
  listeners.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}

export function onLangChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

const norm = (s) => s.replace(/\s+/g, ' ').trim();

/** 번역: 키는 한국어 원문 (공백 정규화) */
export function t(ko, vars = null) {
  let s = ko;
  if (current === 'en') {
    const hit = EN[norm(ko)];
    if (hit !== undefined) s = hit;
  }
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  return s;
}

/** 정적 DOM(텍스트 노드, title/placeholder/aria-label 속성) 번역 적용 */
export function applyStaticI18n(root) {
  if (typeof document === 'undefined') return;
  const hangul = /[가-힣]/;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const p = n.parentElement;
      if (!p || p.closest('[data-i18n-skip]') || ['SCRIPT', 'STYLE'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
      return (n.__ko !== undefined || hangul.test(n.nodeValue)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    if (n.__ko === undefined) n.__ko = n.nodeValue;
    const orig = n.__ko;
    if (current === 'ko') { n.nodeValue = orig; continue; }
    const key = norm(orig);
    const tr = EN[key];
    if (tr === undefined) continue;
    const lead = orig.match(/^\s*/)[0];
    const trail = orig.match(/\s*$/)[0];
    n.nodeValue = lead + tr + trail;
  }
  root.querySelectorAll('[title], [placeholder], [aria-label]').forEach(el => {
    if (el.closest('[data-i18n-skip]')) return;
    for (const attr of ['title', 'placeholder', 'aria-label']) {
      if (!el.hasAttribute(attr)) continue;
      const store = `i18nKo_${attr.replace('-', '')}`;
      if (el.dataset[store] === undefined) {
        if (!hangul.test(el.getAttribute(attr))) continue;
        el.dataset[store] = el.getAttribute(attr);
      }
      const orig = el.dataset[store];
      el.setAttribute(attr, current === 'ko' ? orig : (EN[norm(orig)] ?? orig));
    }
  });
}

/* ───────────────────────── 영어 사전 (키 = 한국어 원문) ───────────────────────── */
export const EN = {
  // ── 헤더 / 탭 / 툴바 ──
  'IEG-6030 전기기계 구조 실습 시뮬레이터': 'IEG-6030 Electrical Machine Trainer Simulator',
  '한국어': 'Korean',
  '전기기계 구조 가상 실습 시스템': 'Electrical Machine Virtual Lab',
  '교재 매뉴얼 (전권 수록)': 'Textbook Manual',
  '실습 장비': 'Workbench',
  '실습 평가': 'Assessment',
  '결과 피드백': 'Feedback',
  '📲 앱 설치': '📲 Install App',
  'ℹ️ 시스템 안내': 'ℹ️ About',
  '실습 과제:': 'Lab:',
  '⚡ 정답 배선 연결': '⚡ Auto-Wire (Answer)',
  '🗑️ 배선 초기화': '🗑️ Clear Wiring',
  '▶️ RUN (운전)': '▶️ RUN',
  '⏹️ STOP (정지)': '⏹️ STOP',
  '배선 정렬:': 'Cable routing:',
  '스마트 덕트 정렬': 'Smart duct',
  '자연스러운 현수선': 'Natural catenary',
  '직각 맨해튼 배선': 'Right-angle (Manhattan)',
  '전선 색상:': 'Wire color:',
  '적색 (+)': 'Red (+)',
  '청색 (S)': 'Blue (S)',
  '황색 (T)': 'Yellow (T)',
  '흑색 (-)': 'Black (−)',
  '녹색 (G)': 'Green (G)',
  '⛶ 장비 확대': '⛶ Enlarge Rack',
  '⛶ 패널 보이기': '⛶ Show Panels',
  '📥 데이터 기록': '📥 Record Data',
  '이 시뮬레이터를 컴퓨터/태블릿에 앱으로 설치합니다': 'Install this simulator as an app on your computer or tablet',
  '매뉴얼 권장 배선을 자동으로 연결합니다': 'Automatically connects the wiring recommended by the manual',
  '모든 전선을 제거합니다': 'Removes all wires',
  '전동기/발전기 운전을 시작합니다 (RUN)': 'Starts the motor/generator (RUN)',
  '모든 운전 및 회전을 즉시 정지합니다 (STOP)': 'Immediately stops all operation and rotation (STOP)',
  '실시간 운전/정지 상태': 'Live run/stop status',
  '장비를 가리지 않는 스마트 덕트 정렬 및 현수선 모드': 'Cable routing mode (smart duct avoids covering the equipment)',
  '적색 (+/R상)': 'Red (+ / R phase)',
  '청색 (S상)': 'Blue (S phase)',
  '황색 (T상)': 'Yellow (T phase)',
  '흑색 (-/N상)': 'Black (− / N)',
  '녹색 (접지)': 'Green (ground)',
  '좌·우 패널을 접어 실습 장비를 크게 봅니다 (단축키 F)': 'Hide the side panels to enlarge the equipment (shortcut F)',
  '현재 계측값을 보고서용 데이터로 기록합니다': 'Records the current readings for the report',
  '기록된 데이터를 CSV 파일로 다운로드합니다': 'Downloads the recorded data as a CSV file',
  '기록된 데이터를 Excel (XLSX) 파일로 다운로드합니다': 'Downloads the recorded data as an Excel file',
  '실습 보고서를 PDF 파일로 인쇄/저장합니다': 'Prints / saves the lab report as PDF',
  '한국어 / English': 'Korean / English',

  // ── 좌측 가이드 ──
  '실습 가이드': 'Lab Guide',
  '🎯 실습 목표': '🎯 Objectives',
  '🔧 기계 부품 조립': '🔧 Machine Assembly',
  '회전자(Rotor):': 'Rotor:',
  '디스크 슬롯 A형': 'Slotted disc, type A',
  '디스크 슬롯 B형': 'Slotted disc, type B',
  '돌극형 계자회전자': 'Salient-pole field rotor',
  '농형 회전자': 'Squirrel-cage rotor',
  '미장착 (탈착)': 'None (removed)',
  '구동 벨트 커플링:': 'Drive belt coupling:',
  '벨트 연결됨': 'Belt connected',
  '⚡ 회전자 구동': '⚡ Turn the Rotor',
  '↷ CW 수동': '↷ CW manual',
  '↶ CCW 수동': '↶ CCW manual',
  '▶ 연속 회전': '▶ Continuous',
  '⏩ 회전 중...': '⏩ Spinning...',
  '■ 정지': '■ Stop',
  '⚡ + 구동 전동기(IEG-6030-11) 추가': '⚡ + Add drive motor (IEG-6030-11)',
  '수동: 클릭 시 300rpm으로 튕긴 뒤 서서히 감속 · 연속: 150rpm 유지 · 계철 프레임 위에서 마우스 휠로도 돌릴 수 있습니다.': 'Manual: flicks to 300 rpm and slows down · Continuous: holds 150 rpm · You can also turn it with the mouse wheel over the field frame.',
  '📝 실습 진행 순서': '📝 Procedure',
  '🔍 계측 예상 기준': '🔍 Expected Readings',
  '📖 본 실습 교재 매뉴얼 보기 ▶': '📖 Open this lab in the manual ▶',
  '본 실습의 교재 매뉴얼 본문으로 이동합니다': 'Opens the textbook section for this lab',
  '시뮬레이터 모델로 계산한 이론 기대값': 'Theoretical values calculated with the simulator model',

  // ── 계측 서랍 ──
  '실시간 계측 데이터 기록표 (Live Measurement Table)': 'Live Measurement Table',
  '0건 기록됨': '0 recorded',
  '{n}건 기록됨': '{n} recorded',
  '📥 계측값 기록 (Space)': '📥 Record (Space)',
  '현재 상태를 1클릭 기록합니다 (단축키: Spacebar)': 'Records the current state in one click (shortcut: Space)',
  '🗑️ 초기화': '🗑️ Clear',
  '기록된 데이터를 모두 초기화합니다': 'Clears all recorded data',
  '▲ 펼치기': '▲ Expand',
  '▼ 접기': '▼ Collapse',
  'No.': 'No.',
  '시간': 'Time',
  '실습 과제': 'Lab',
  '회전수 [rpm]': 'Speed [rpm]',
  '발전 전압 [V]': 'Voltage [V]',
  '부하 전류 [A]': 'Current [A]',
  '계자 전류 [mA]': 'Field current [mA]',
  '검류계 [mA]': 'Galvanometer [mA]',
  '주파수 [Hz]': 'Frequency [Hz]',
  '운전 상태 / 판정': 'Status',
  '삭제': 'Delete',
  '이 측정점 삭제': 'Delete this point',
  '아직 기록된 데이터가 없습니다. 장비를 운전하고 [📥 계측값 기록] 버튼을 누르거나 스페이스바(Space)를 누르세요.': 'No data recorded yet. Run the equipment, then press [📥 Record] or the Space bar.',

  // ── 오실로스코프 / 도크 ──
  '📈 가상 오실로스코프 (DSO)': '📈 Virtual Oscilloscope (DSO)',
  '수직 VOLT:': 'VOLT/div:',
  '수평 TIME:': 'TIME/div:',
  'Y위치:': 'Y pos:',
  '파형 위로 이동': 'Move trace up',
  '중앙 0V 복귀': 'Center at 0 V',
  '파형 아래로 이동': 'Move trace down',
  '수직/수평축 자동 최적화': 'Auto-scale both axes',
  '파형 정지 / 실행': 'Freeze / run the trace',
  '📊 실시간 상태 계측값': '📊 Live Readings',
  '발전 단자 전압:': 'Terminal voltage:',
  '부하 선간 전류:': 'Line current:',
  '모터 회전 속도:': 'Motor speed:',
  '계자 여자 전류:': 'Field current:',
  '검류계 지시치:': 'Galvanometer:',
  '발전 주파수:': 'Output frequency:',
  '발전 단자 전압 (실효값):': 'Terminal voltage (rms):',
  '발전 단자 전압 (직류):': 'Terminal voltage (DC):',
  '전동기 인가 전압 (실효값):': 'Motor voltage (rms):',
  '전기자 전압:': 'Armature voltage:',
  '부하(전기자) 전류:': 'Load (armature) current:',
  '전동기 전류:': 'Motor current:',
  '발전기 회전 속도:': 'Generator speed:',
  '전동기 회전 속도:': 'Motor speed:',
  '전원 주파수:': 'Supply frequency:',
  '— (미결선)': '— (not wired)',
  '📥 실시간 계측값 기록 (Space)': '📥 Record Readings (Space)',
  '💡 마우스 조작 안내': '💡 Mouse Controls',
  '배선 연결:': 'Wiring:',
  '단자를 클릭한 뒤 다른 단자를 클릭하면 연결됩니다. 이미 플러그가 꽂힌 단자에도 겹쳐 꽂을 수 있습니다 (Esc: 취소).': 'Click a terminal, then another terminal to connect them. You can stack plugs on a terminal that already has one (Esc: cancel).',
  '배선 삭제:': 'Remove a wire:',
  '전선을 클릭해 선택한 뒤 더블클릭하거나 Delete 키를 누릅니다.': 'Click a wire to select it, then double-click it or press Delete.',
  '램프:': 'Lamps:',
  '03·04번 램프 소켓을 클릭하면 전구를 장착/분리합니다.': 'Click a lamp socket on module 03/04 to insert or remove the bulb.',
  '노브 조절:': 'Knobs:',
  '노브 위에서 마우스 휠을 굴리거나 드래그하여 값을 미세 조절합니다.': 'Scroll the mouse wheel or drag over a knob to adjust it.',
  '스위치 조작:': 'Switches:',
  '전원 스위치, 토글 스위치, 캠스위치를 클릭하여 상태를 전환합니다.': 'Click power, toggle and cam switches to change their position.',

  // ── 매뉴얼 ──
  '전권 수록': 'Full edition',
  '📖 IEG-6030 전기기계구조 실습장비 교재 매뉴얼': '📖 IEG-6030 Electrical Machine Trainer — Textbook Manual',
  '매뉴얼 검색 (예: 분권, 슬립, 기동저항, 실습 05)...': 'Search the manual (e.g. shunt, slip, starting rheostat, Lab 05)...',
  '{n}개 실습': '{n} labs',
  '이론/규격': 'Theory / specs',
  '검색어 "<strong>{q}</strong>"에 일치하는 매뉴얼 항목이 없습니다.': 'No manual sections match "<strong>{q}</strong>".',
  '본문 내용이 없습니다.': 'No content.',
  '📖 IEG-6030 디지털 교재': '📖 IEG-6030 Digital Textbook',

  // ── 앱 동작 / 토스트 ──
  '⚡ [제4장] 발전기의 기본 실습 (13개 과정)': '⚡ [Ch. 4] Generator Labs (13)',
  '🔄 [제6장] 전동기의 기본 실습 (12개 과정)': '🔄 [Ch. 6] Motor Labs (12)',
  '📥 [계측 #{id}] {rpm} RPM | {v} V | {i} A | If {f} mA 기록 완료': '📥 [Record #{id}] {rpm} RPM | {v} V | {i} A | If {f} mA saved',
  '🗑️ 측정 데이터가 삭제되었습니다.': '🗑️ Measurement deleted.',
  '기록된 모든 계측 데이터를 초기화하시겠습니까?': 'Clear all recorded measurements?',
  '🗑️ 모든 계측 데이터가 초기화되었습니다.': '🗑️ All measurements cleared.',
  '⚡ 구동 전동기(IEG-6030-11)를 추가하고 벨트를 연결했습니다. [RUN]으로 운전하세요.': '⚡ Drive motor (IEG-6030-11) added and belt connected. Press [RUN] to start.',
  '⚠️ 과속 — 기계적 한계 속도 도달': '⚠️ Overspeed — mechanical speed limit reached',
  '선택한 전선: 더블클릭 또는 Delete 키로 삭제 (Esc: 선택 해제)': 'Wire selected: double-click or press Delete to remove (Esc: deselect)',
  'IEG-6030 전기기계 구조 실습장비 통합 시뮬레이터\n\n· 회로망 해석(절점해석) 기반: 결선한 대로 전압·전류가 계산됩니다.\n· 디지털 메터는 선택한 레인지 단자 기준 실제값을 표시하며, 레인지 초과 시 OL을 표시합니다.\n· 발전기 특성은 1800rpm 기준, 2극 기기(f = n/60)로 모델링되어 있습니다.':
    'IEG-6030 Electrical Machine Trainer — Integrated Simulator\n\n· Circuit (nodal) analysis: voltages and currents follow exactly what you wire.\n· Digital meters show the true value for the selected range terminal and display OL when over range.\n· Generator characteristics are modelled at 1800 rpm for a 2-pole machine (f = n/60).',

  // ── 모듈 툴팁 ──
  '{name} - 단자 {label}': '{name} — terminal {label}',
  '{label}: 드래그 또는 마우스 휠로 조절': '{label}: drag or use the mouse wheel',
  '{label} 전구 ({v}V) — 클릭하여 장착/분리': '{label} bulb ({v} V) — click to insert/remove',
  '{label} (클릭하여 전환)': '{label} (click to switch)',
  '계자 저항기 모듈': 'Field Rheostat', '기동 저항기 모듈': 'Starting Rheostat', '직류기/교류기 부하 모듈': 'AC/DC Machine Load Unit',
  '3상 부하 모듈': 'Three-Phase Load Unit', 'R, L, C 부하 모듈': 'R/L/C Load Unit', '전원 공급기 모듈': 'AC/DC Power Supply',
  '교류 전압계/전류계 모듈': 'AC Volt/Ampere Meter', '직류 전압계/전류계 모듈': 'DC Volt/Ampere Meter', '직류 검류계 모듈': 'DC Milliammeter',
  '계철 프레임 모듈': 'Field Frame', '구동 전동기 모듈': 'Auto Driving Unit', '극수 전환기 모듈': 'Pole Changing Unit',

  // ── 엔진 경고 / 계측 ──
  '미결선': 'not wired',
  'AC {v}V 탭': 'AC {v} V tap',
  'DC 출력': 'DC output',
  '전원공급기 {name} 과전류 {a}A → 퓨즈(3A) 차단. 결선(단락)을 확인하세요.': 'Power supply {name} overcurrent {a} A → 3 A fuse blown. Check the wiring for a short circuit.',
  '{m}번 {lid} 램프 과전압 ({v}V / 정격 {r}V) — 필라멘트 단선 위험': 'Module {m} lamp {lid} over-voltage ({v} V / rated {r} V) — filament may burn out',
  '상전압 A/B/C-N': 'Phase voltages A/B/C–N',
  '발전 출력 A-B': 'Generator output A–B',
  '정류 출력 A-B (평균 {v}V)': 'Rectified output A–B (avg {v} V)',
  '직류 출력 C-D': 'DC output C–D',
  '전기자 전압 A-B': 'Armature voltage A–B',
  '인가 전압': 'Applied voltage',
  'Vp {p}V · 평균 {a}V': 'Vp {p} V · avg {a} V',
  '신호 없음': 'No signal',

  // ── 평가 ──
  '✓ 정상': '✓ OK',
  '✕ 미흡': '✕ Needs work',
  '✓ 통과': '✓ Pass',
  '{n}점': '{n} pts',
  '[{c}] 문항 {i} / {n}': '[{c}] Question {i} / {n}',
  '✅ 정답 (+10점)': '✅ Correct (+10)',
  '❌ 오답': '❌ Incorrect',
  '[정답]': '[Answer]',
  '🔍 정답 확인': '🔍 Check answer',
  '보기를 선택했습니다. [정답 확인]을 클릭하세요.': 'Option selected. Click [Check answer].',
  '🎉 정답입니다!': '🎉 Correct!',
  '⚠️ 오답입니다. (정답: {n}번)': '⚠️ Incorrect. (Answer: option {n})',
  '상세 해설:': 'Explanation:',
  '📝 실습 과제 평가 및 실습문제 풀이': '📝 Lab Assessment & Practice Questions',
  '매뉴얼 기반 배선/조립/운전 실기 자동 채점 및 핵심 이론 실습문제 10문항 풀이': 'Automatic grading of wiring, assembly and operation, plus 10 key theory questions from the manual',
  '📊 실습 결과 보고서 보기': '📊 View Lab Report',
  '1. 실기 과제 결선 및 운전 자동 채점 (100점 만점)': '1. Automatic Grading of Wiring and Operation (out of 100)',
  '현재 과제 실기 획득 점수': 'Score for the current lab',
  '/ 100점 ({r})': '/ 100 ({r})',
  '합격': 'Pass',
  '보완 필요': 'Needs work',
  '채점 기준: 랙 배치(20) + 조립(20) + 결선(40) + 운전(20)': 'Criteria: rack (20) + assembly (20) + wiring (40) + operation (20)',
  '합격 기준: 70점 이상': 'Pass mark: 70 or more',
  '2. 매뉴얼 핵심 실습문제 10선 및 정답 확인': '2. Ten Key Practice Questions from the Manual',
  '진행도: {a} / {n}문제 완료 | 정답: {c}개 ({p}%)': 'Progress: {a} / {n} answered | Correct: {c} ({p}%)',
  '모든 문제의 풀이 상태를 초기화합니다': 'Reset all answers',
  '🔄 문제 초기화': '🔄 Reset Questions',
  '모든 문제 풀이 기록을 초기화하시겠습니까?': 'Reset all question answers?',
  '필수 모듈 랙 배치': 'Required modules in rack',
  '요구된 모든 실험 모듈이 랙에 정상 장착되었습니다.': 'All required modules are mounted in the rack.',
  '실습에 필요한 모듈 중 일부가 누락되었습니다.': 'Some modules required for this lab are missing.',
  '회전자 및 구동 벨트 조립': 'Rotor and drive belt assembly',
  '회전자 종류 및 구동 벨트 결합 상태가 완벽합니다.': 'Rotor type and drive belt are assembled correctly.',
  '조립 오류: 회전자({r}), 벨트 연결({b})': 'Assembly error: rotor ({r}), belt ({b})',
  '정상': 'OK',
  '불일치': 'mismatch',
  '회로 단자간 배선 결선': 'Circuit wiring',
  '필수 배선 통전 상태: {m} / {n}개 완료 ({p}%)': 'Required connections: {m} / {n} done ({p}%)',
  '장비 운전 및 계측 결과': 'Operation and readings',
  '운전 판정 기준 없음': 'No operation criteria',
  '{label}: {v} (기준 {min}~{max})': '{label}: {v} (target {min}–{max})',
  '계측기 미결선': 'meter not wired',
  '레인지 초과(OL)': 'over range (OL)',

  // ── 보고서 ──
  '정상 운전': 'Running normally',
  '단락(Short) 차단': 'Short circuit — tripped',
  '수동 유도 기전력 검출': 'Manual EMF detected',
  '부하 운전 발전': 'Generating under load',
  '무부하 정격 발전': 'Generating at no load',
  '미여자/무기전력 회전': 'Rotating, no excitation / EMF',
  '정지(STOP)': 'Stopped',
  '현재 실습': 'Current lab',
  '단자 전압 V [V]': 'Terminal voltage V [V]',
  '계자 전류 If [mA]': 'Field current If [mA]',
  '부하 전류 IL [A]': 'Load current IL [A]',
  '측정된 데이터가 없습니다. 실습 중 [데이터 기록] 버튼을 누르세요.': 'No data recorded. Press [Record Data] during the lab.',
  '전기기계 구조 실습장비 (IEG-6030) 실습 보고서': 'IEG-6030 Electrical Machine Trainer — Lab Report',
  '실습 번호:': 'Lab:',
  '일시:': 'Date:',
  '종합 점수:': 'Total score:',
  '{n}점 / 100점': '{n} / 100',
  '1. 실습 평가 및 체크리스트': '1. Assessment Checklist',
  '2. 실습 계측 데이터 기록표 ({n}건)': '2. Recorded Measurements ({n})',
  '📥 CSV 다운로드': '📥 Download CSV',
  '📊 Excel 다운로드': '📊 Download Excel',
  '📄 PDF 저장/인쇄': '📄 Save / Print PDF',
  '기록된 측정 데이터를 초기화하시겠습니까?': 'Clear the recorded measurements?',
  '측정 시각': 'Time',
  '회전 속도 (RPM)': 'Speed (RPM)',
  '계자 전류 (If)': 'Field current (If)',
  '발전 단자전압 (V)': 'Terminal voltage (V)',
  '부하 전류 (IL)': 'Load current (IL)',
  '3. 특성 곡선 그래프 분석': '3. Characteristic Curve',
  '※ 점선: 시뮬레이터 모델 이론 곡선 (포화곡선 E = 1.8 + 50·tanh(If/0.28) @1800rpm / 외부특성 V = E0 − IL·4.5Ω), 실선 및 포인트: 사용자 계측 기록':
    '※ Dashed: theoretical curve of the simulator model (saturation E = 1.8 + 50·tanh(If/0.28) @1800 rpm / external characteristic V = E0 − IL·4.5 Ω); solid line and points: your recorded measurements',
  '4. 기술 분석 및 피드백': '4. Technical Analysis & Feedback',
  '🖨️ 보고서 인쇄 및 PDF 저장': '🖨️ Print / Save Report as PDF',
  '📥 데이터 CSV 저장': '📥 Save Data as CSV',
  '📊 데이터 Excel 저장': '📊 Save Data as Excel',
  '<p><strong>우수한 실습 성과:</strong> 전기기계의 전자기 유도 특성과 발전기-부하 간의 전기적 특성을 정확히 이해하고 올바른 결선 및 안정된 운전 조작을 달성하였습니다.</p><p>계자 저항 변화에 따른 자화 곡선상의 포화 특성을 명확히 관찰하였으며, 계측기 측정값이 매뉴얼 권장 허용 범위 내에 잘 부합합니다.</p>':
    '<p><strong>Excellent result:</strong> You understood the electromagnetic induction of the machine and the electrical behaviour between generator and load, wired the circuit correctly and operated it stably.</p><p>The saturation of the magnetization curve with changing field resistance was clearly observed, and your readings fall within the ranges recommended by the manual.</p>',
  '<p><strong>보완 권장 사항:</strong> 회로 배선에서 일부 단자가 누락되었거나 구동 모터 속도가 정격(1800 RPM)에 미달하였습니다.</p><p>매뉴얼의 실습 결선도를 다시 확인하고, 계자 권선의 극성과 전압계의 접속 단자(V_50V 및 COM)가 올바르게 연결되었는지 점검하시기 바랍니다.</p>':
    '<p><strong>Suggested improvements:</strong> Some connections are missing, or the readings did not reach the expected range (e.g. drive speed below 1800 RPM).</p><p>Check the wiring diagram in the manual again, and confirm the field-winding polarity and the voltmeter terminals (V_50V and COM).</p>',
  '기록된 계측 데이터가 없습니다. 워크벤치에서 [데이터 기록]을 먼저 진행하세요.': 'No measurements recorded. Use [Record Data] on the workbench first.',
  'No,측정시각,실습과제,회전속도(RPM),계자전류(mA),발전단자전압(V),부하전류(A),검류계전류(mA),주파수(Hz),운전상태판정': 'No,Time,Lab,Speed(RPM),Field current(mA),Terminal voltage(V),Load current(A),Galvanometer(mA),Frequency(Hz),Status',
  'IEG6030_실습계측데이터': 'IEG6030_measurements',
  'IEG6030_실습데이터': 'IEG6030_lab_data',
  'IEG-6030 전기기계 구조 실습 계측 데이터 기록표': 'IEG-6030 Electrical Machine Trainer — Measurement Log',
  '기록 일시: {d}': 'Recorded: {d}',
  '실습 과제 ': 'Lab ',
  '계자 전류 (mA)': 'Field current (mA)',
  '부하 전류 (A)': 'Load current (A)',
  '검류계 전류 (mA)': 'Galvanometer (mA)',
  '발전 주파수 (Hz)': 'Frequency (Hz)',
  '운전 상태 판정': 'Status',

  // ── 조립 ──
  'N극': 'N pole', 'S극': 'S pole'
};
