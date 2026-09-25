/**
 * IEG-6030 실습 평가 및 실습문제 풀이 & 채점 엔진
 * 결선 적합성, 조립 적합성, 운전 조작 달성도 판정 및 매뉴얼 핵심 실습문제 10선
 */

export const PRACTICE_QUESTIONS = [
  {
    id: 'q1',
    category: '기초 전자기 이론',
    question: '발전기에서 도체가 자기장 속에서 회전하며 자속을 끊을 때, 도체 내부에 유도되는 기전력(전류)의 방향을 결정하는 법칙은?',
    options: [
      '플레밍의 오른손 법칙 (Fleming\'s Right-Hand Rule)',
      '플레밍의 왼손 법칙 (Fleming\'s Left-Hand Rule)',
      '암페어의 오른나사 법칙 (Ampere\'s Right-Hand Grip Rule)',
      '쿨롱의 정전기 법칙 (Coulomb\'s Law)'
    ],
    correctIndex: 0,
    explanation: '발전기의 유도 기전력 및 유도 전류의 방향은 플레밍의 오른손 법칙(우발좌동: 오른손은 발전기, 왼손은 전동기)을 따릅니다. 엄지는 도체 운동방향(F/v), 검지는 자계방향(B), 중지는 유도기전력(e/I)의 방향입니다.'
  },
  {
    id: 'q2',
    category: '직류 발전기',
    question: '자여자 분권 발전기가 외부 전원 없이 스스로 전압을 확립(Voltage Building-Up)하기 위해 반드시 충족해야 하는 3대 조건 중 옳지 않은 것은?',
    options: [
      '계자 철심에 미약한 잔류 자기(Residual Magnetism)가 남아있어야 한다.',
      '발전기 회전 방향이 잔류 자기를 강화하는 방향이어야 한다.',
      '계자 회로의 총 저항이 임계 저항(Critical Resistance)보다 작아야 한다.',
      '계자 저항기(Field Rheostat)의 저항값을 최대로 설정하여 무한대 저항을 유지해야 한다.'
    ],
    correctIndex: 3,
    explanation: '계자 회로 저항이 임계 저항보다 커지면 자속 증가 루프가 형성되지 않아 전압이 확립되지 않습니다. 따라서 계자 저항은 임계 저항보다 충분히 작아야(즉, 저항을 작게 유지해야) 전압 확립이 성공적으로 일어납니다.'
  },
  {
    id: 'q3',
    category: '발전기 특성 곡선',
    question: '직류 발전기의 무부하 포화 곡선(No-load Saturation Curve)에 대한 설명으로 가장 타당한 것은?',
    options: [
      '정격 회전수에서 계자 전류(If) 증가에 따른 단자 유도 기전력(E)의 포화 변화를 나타낸다.',
      '부하 전류(IL) 증가에 따른 단자 전압(V)의 강하 곡선을 나타낸다.',
      '전기자 전류 증가에 따른 토크의 2차 곡선적 증가를 나타낸다.',
      '회전수 변화에 따른 발전기 기계적 효율 곡선을 나타낸다.'
    ],
    correctIndex: 0,
    explanation: '무부하 포화 곡선은 부하가 없는 상태에서 회전수를 일정하게 유지하고 계자 전류(If)를 0부터 증가시킬 때, 초기 공극선(직선)을 거쳐 철심의 자기 포화로 인해 완만하게 꺾이는 기전력(E)의 특성을 나타냅니다.'
  },
  {
    id: 'q4',
    category: '발전기 부하 특성',
    question: '직류 분권 발전기에서 R/L/C 부하 모듈(IEG-6030-05)의 저항 스위치를 올려 부하 전류(IL)가 증가할 때 단자 전압이 떨어지는 핵심 원인 3가지가 아닌 것은?',
    options: [
      '전기자 권선 내부 저항에 의한 전압 강하 (Ia * Ra)',
      '부하 전류 자속에 의한 감자성 전기자 반작용 (Armature Reaction)',
      '단자 전압 강하로 인한 분권 계자 전류(If = V/Rf) 감소에 따른 2차 자속 감소',
      '구동 모터의 전자기 유도 결합 차단에 따른 원동기 속도의 무제한 폭주'
    ],
    correctIndex: 3,
    explanation: '분권 발전기의 전압 강하 요인은 ① 전기자 권선 저항 강하(Ia*Ra), ② 전기자 반작용에 의한 주자속 감자, ③ 단자 전압 강하에 따른 분권 계자 전류(If) 감소입니다. 원동기 속도의 무제한 폭주는 전압 강하의 요인이 아닙니다.'
  },
  {
    id: 'q5',
    category: '전기자 반작용',
    question: '직류기에서 부하 운전 시 전기자 반작용(Armature Reaction)을 근본적으로 상쇄하기 위해 주자극 표면에 도체를 매설하여 전기자 전류와 반대 방향의 전류를 흘리는 가장 이상적인 장치는?',
    options: [
      '보상 권선 (Compensating Winding)',
      '브러시 로커 (Brush Rocker)',
      '슬립링 (Slip Ring)',
      '기동 저항기 (Starting Rheostat)'
    ],
    correctIndex: 0,
    explanation: '보상 권선은 주자극편 표면 슬롯에 도체를 배치하고 전기자와 직렬로 반대 방향의 전류를 흘려 전기자 기자력을 가장 직접적이고 완벽하게 100% 상쇄하는 장치입니다. 주자극 사이에는 보극(Interpole)을 설치하여 정류 불꽃을 억제합니다.'
  },
  {
    id: 'q6',
    category: '직류 전동기',
    question: '직류 전동기 기동 시 기동 가변저항기(IEG-6030-02, Starting Rheostat)의 저항값을 최대로 투입한 상태에서 전원을 넣어야 하는 결정적인 이유는?',
    options: [
      '정지 상태에서는 역기전력이 0V(Ec = 0)이므로, 수십 배의 위험한 과대 기동 전류(V/Ra)가 흘러 권선이 소손되는 것을 방지하기 위해',
      '기동 시 회전 속도를 10,000 RPM 이상으로 순간 가속하기 위해',
      '계자 철심의 잔류 자기를 완전히 소자(Degauss)시키기 위해',
      '부하 전류의 역률을 1.0으로 보정하기 위해'
    ],
    correctIndex: 0,
    explanation: '직류 전동기는 정지 시 역기전력 Ec = 0이므로 전기자 저항 Ra만 존재합니다. Ra는 매우 작으므로(실습기 수 Ω, 대형기 1Ω 미만) 전압 V를 직접 가하면 정격의 10~20배 대전류가 흘러 권선이 타버립니다. 따라서 기동 저항을 최대로 직렬 삽입하여 기동 전류를 안전하게 억제해야 합니다.'
  },
  {
    id: 'q7',
    category: '직류 전동기 속도 제어',
    question: '직류 분권 전동기 운전 중 계자 가변저항기(IEG-6030-01)의 노브를 돌려 저항값(Rf)을 증가시키면 회전 속도는 어떻게 변화하는가?',
    options: [
      '계자 전류(If)와 자속(Φ)이 감소하므로 역기전력 관계식(N = (V - IaRa)/(KΦ))에 의해 회전 속도가 상승한다.',
      '계자 저항이 커지므로 토크가 무한대가 되고 회전 속도는 즉시 0 RPM으로 정지한다.',
      '전원 인가 전압이 0V로 떨어져 차단기가 트립된다.',
      '회전 방향이 시계 방향에서 반시계 방향으로 즉시 역전된다.'
    ],
    correctIndex: 0,
    explanation: '직류 전동기 속도 공식 N = (V - IaRa) / (K * Φ)에 의해 계자 저항을 증가시키면 계자 전류 If가 줄고 자속 Φ가 감소하여 회전 속도 N이 상승합니다. 이를 약계자 속도 제어(Field Weakening Control)라 부릅니다.'
  },
  {
    id: 'q8',
    category: '동기기 이론',
    question: '주파수가 60Hz인 3상 교류 전원에 연결된 4극(P=4) 동기 발전기의 동기 회전 속도(Ns)는 얼마인가?',
    options: [
      '1,800 RPM',
      '3,600 RPM',
      '1,200 RPM',
      '900 RPM'
    ],
    correctIndex: 0,
    explanation: '동기 속도 공식은 Ns = 120 * f / P 입니다. 주파수 f = 60Hz, 극수 P = 4극이므로, Ns = 120 * 60 / 4 = 7,200 / 4 = 1,800 RPM이 됩니다.'
  },
  {
    id: 'q9',
    category: '유도 전동기',
    question: '3상 농형 유도 전동기에서 슬립(Slip, s)에 관한 설명 중 올바른 것은?',
    options: [
      '슬립 s = (Ns - N) / Ns 이며, 정상 전부하 운전 시 통상 2~5% (0.02~0.05) 내외의 작은 값을 갖는다.',
      '전동기가 정지해 있는 기동 순간에는 슬립이 0이다.',
      '전동기가 동기 속도(Ns)와 완전히 일치하여 회전할 때 슬립이 1이다.',
      '슬립이 0이 되면 유도 기전력과 회전 토크가 최대가 된다.'
    ],
    correctIndex: 0,
    explanation: '슬립 s = (Ns - N) / Ns 입니다. 정지 시(N=0)에는 s = 1 (100%)이며, 정상 운전 시에는 s = 0.02 ~ 0.05(2~5%)입니다. 회전자가 동기속도(N=Ns)에 도달하면 슬립 s = 0이 되어 자속을 끊지 못하므로 기전력과 토크가 0이 됩니다.'
  },
  {
    id: 'q10',
    category: '극수 변환 제어',
    question: 'IEG-6030-12 극수 전환기를 LOW(Δ, 4극)에서 HIGH(YY, 2극)로 절환했을 때 60Hz 전원에서 동기 속도의 변화는?',
    options: [
      '1,800 RPM에서 3,600 RPM으로 동기 속도가 2배 빨라진다.',
      '3,600 RPM에서 1,800 RPM으로 동기 속도가 절반으로 느려진다.',
      '극수가 바뀌어도 주파수가 60Hz이므로 회전 속도는 전혀 변하지 않는다.',
      '회전자계가 소멸하여 모터가 즉시 역회전한다.'
    ],
    correctIndex: 0,
    explanation: '동기 속도 Ns = 120f / P 입니다. 4극 시 Ns = 120×60/4 = 1,800 RPM, 2극 시 Ns = 120×60/2 = 3,600 RPM으로 극수가 1/2로 줄면 동기 속도는 2배가 됩니다. (실습 09: 슬립을 포함한 실제 회전수 약 1,740 ↔ 3,450 RPM)'
  }
];

export class EvaluationEngine {
  constructor(circuitEngine, experimentsData) {
    this.engine = circuitEngine;
    this.experiments = experimentsData;
    this.quizQuestions = PRACTICE_QUESTIONS;
    this.userQuizAnswers = {}; // { qId: { selected: number, checked: boolean } }
  }

  setQuizAnswer(qId, selectedIdx) {
    if (!this.userQuizAnswers[qId]) {
      this.userQuizAnswers[qId] = { selected: selectedIdx, checked: false };
    } else {
      this.userQuizAnswers[qId].selected = selectedIdx;
    }
  }

  checkQuizAnswer(qId) {
    if (this.userQuizAnswers[qId]) {
      this.userQuizAnswers[qId].checked = true;
    }
  }

  resetAllQuiz() {
    this.userQuizAnswers = {};
  }

  getQuizScore() {
    let total = this.quizQuestions.length;
    let answered = 0;
    let correct = 0;

    this.quizQuestions.forEach(q => {
      const u = this.userQuizAnswers[q.id];
      if (u && u.checked) {
        answered++;
        if (u.selected === q.correctIndex) {
          correct++;
        }
      }
    });

    return {
      total,
      answered,
      correct,
      pct: total > 0 ? Math.round((correct / total) * 100) : 0
    };
  }

  /**
   * 현재 실습 과제 평가 수행
   */
  evaluateExperiment(expId) {
    const exp = this.experiments.find(e => e.id === expId);
    if (!exp) return null;

    const checklist = [];
    let earnedScore = 0;

    // 1. 모듈 랙 장착 검사 (20점)
    let modulePassed = true;
    for (const reqMod of exp.modules) {
      const isMounted = document.querySelector(`.rack-module[data-module-id="${reqMod}"]`);
      if (!isMounted) modulePassed = false;
    }
    if (modulePassed) {
      checklist.push({ item: '필수 모듈 랙 배치', passed: true, score: 20, desc: '요구된 모든 실험 모듈이 랙에 정상 장착되었습니다.' });
      earnedScore += 20;
    } else {
      checklist.push({ item: '필수 모듈 랙 배치', passed: false, score: 0, desc: '실습에 필요한 모듈 중 일부가 누락되었습니다.' });
    }

    // 2. 기계 부품 조립 검사 (20점)
    let assemblyScore = 0;
    if (exp.assemblyConfig) {
      const curAssembly = this.engine.assembly;
      const req = exp.assemblyConfig.rotor;
      const cur = curAssembly.rotorType;
      let rotorOk = (cur === req) || (['DISK_A', 'DISK_B'].includes(req) && ['DISK_A', 'DISK_B'].includes(cur));
      let beltOk = (!!curAssembly.beltConnected === !!exp.assemblyConfig.beltInstalled);

      if (rotorOk && beltOk) {
        assemblyScore = 20;
        checklist.push({ item: '회전자 및 구동 벨트 조립', passed: true, score: 20, desc: '회전자 종류 및 구동 벨트 결합 상태가 완벽합니다.' });
      } else {
        checklist.push({ item: '회전자 및 구동 벨트 조립', passed: false, score: 0, desc: `조립 오류: 회전자(${rotorOk ? '정상' : '불일치'}), 벨트 연결(${beltOk ? '정상' : '불일치'})` });
      }
    } else {
      assemblyScore = 20;
    }
    earnedScore += assemblyScore;

    // 3. 회로 결선 적합성 검사 (40점)
    let wireMatchedCount = 0;
    const targetWires = exp.targetWires || [];
    for (const tw of targetWires) {
      if (this.engine.areTerminalsConnected(tw.from, tw.to)) {
        wireMatchedCount++;
      }
    }

    const wireRatio = targetWires.length > 0 ? (wireMatchedCount / targetWires.length) : 1;
    const wireScore = Math.round(wireRatio * 40);
    earnedScore += wireScore;

    checklist.push({
      item: '회로 단자간 배선 결선',
      passed: wireMatchedCount === targetWires.length,
      score: wireScore,
      desc: `필수 배선 통전 상태: ${wireMatchedCount} / ${targetWires.length}개 완료 (${Math.round(wireRatio * 100)}%)`
    });

    // 4. 운전 및 계측 동작 검사 (20점): 실습별 이론 기대 범위(verify) 충족 여부
    const val = (key) => {
      const st = this.engine.state;
      if (key === 'rpm') return { ok: true, v: Math.abs(st.rotorRpm || 0), unit: 'rpm' };
      if (key === 'galvPeak') return { ok: true, v: st.galvPeak || 0, unit: 'mA' };
      const abs = key.endsWith('_abs');
      const id = abs ? key.slice(0, -4) : key;
      const r = this.engine.readings[id];
      if (!r || !r.active) return { ok: false, v: 0, unit: r ? r.unit : '', why: '계측기 미결선' };
      if (r.ol) return { ok: false, v: r.value, unit: r.unit, why: '레인지 초과(OL)' };
      return { ok: true, v: abs ? Math.abs(r.display) : r.display, unit: r.unit };
    };
    const checks = (exp.verify || []).map(c => {
      const m = val(c.key);
      const pass = m.ok && m.v >= c.min && m.v <= c.max;
      return { ...c, pass, text: `${c.label}: ${m.ok ? m.v.toFixed(m.unit === 'rpm' ? 0 : 2) + ' ' + m.unit : m.why} (기준 ${c.min}~${c.max})` };
    });
    const allPass = checks.length > 0 && checks.every(c => c.pass);
    const opScore = checks.length === 0 ? 20 : Math.round(20 * checks.filter(c => c.pass).length / checks.length);
    earnedScore += opScore;

    checklist.push({
      item: '장비 운전 및 계측 결과',
      passed: allPass,
      score: opScore,
      desc: checks.length ? checks.map(c => `${c.pass ? '✓' : '✕'} ${c.text}`).join(' / ')
        : '운전 판정 기준 없음'
    });

    return {
      expId,
      totalScore: earnedScore,
      passed: earnedScore >= 70,
      checklist,
      timestamp: new Date().toLocaleString()
    };
  }
}
