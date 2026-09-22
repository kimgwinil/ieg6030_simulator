/**
 * IEG-6030 전기기계 구조 실습장비 - 매뉴얼 전체 실습 커리큘럼 (총 25개 전 과정)
 * 제4장 발전기의 기본 실습 (13개) + 제6장 전동기의 기본 실습 (12개)
 */

export const EXPERIMENTS_DATA = [
  // ==========================================
  // [제4장] 발전기의 기본 실습 (실습 01 ~ 13)
  // ==========================================
  {
    id: 'GEN-01',
    category: '발전기 실습',
    title: '실습 01. 발전기의 기본 원리',
    manualPage: '43 ~ 50',
    goal: '영구자석에 의한 계자를 형성하여 자계 내에 연동선(Coil)의 도체를 빠르게 움직였을 때 유도되는 교류 기전력의 발생을 관찰하고 유도 기전력의 세기에 관계되는 요소를 이해한다.',
    modules: ['IEG-6030-09', 'IEG-6030-10'],
    assemblyConfig: {
      rotor: 'DISK_A',
      poles: { P1: { type: 'PERM_N', label: 'N극' }, P5: { type: 'PERM_S', label: 'S극' } },
      beltInstalled: false
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-09', terminalId: 'POS' }, color: '#e63946' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-09', terminalId: 'NEG' }, color: '#212529' }
    ],
    procedure: [
      '1. 랙에 직류 검류계(09)와 계철 프레임(10)을 설치합니다.',
      '2. 계철 프레임에 회전자 고정대 및 디스크 슬롯 A형 회전자를 결합합니다.',
      '3. P1에 N극 영구자석, P5에 S극 영구자석을 결합하고 고정 볼트로 조여줍니다.',
      '4. 계철 프레임 A2, B2 단자를 직류 검류계의 (+), (-) 단자에 결선합니다.',
      '5. 검류계 모드를 ±50mA로 설정하고, 회전자 원판을 손으로 회전시키며 지침의 편향을 관찰합니다.'
    ],
    expectedReadings: { meter: '직류 검류계', value: '±2.5 ~ ±4.0 mA (회전 방향에 따른 양방향 진동)' }
  },

  {
    id: 'GEN-02',
    category: '발전기 실습',
    title: '실습 02. 영구자석을 이용한 단상 교류 발전기',
    manualPage: '51 ~ 58',
    goal: '원형 영구자석으로 계자를 형성한 단상 교류 발전기의 구조를 이해하고 유도되는 교류 기전력의 파형과 주파수 특성을 계측한다.',
    modules: ['IEG-6030-07', 'IEG-6030-10', 'IEG-6030-11'],
    assemblyConfig: {
      rotor: 'DISK_A',
      poles: { P1: { type: 'PERM_N', label: 'N극' }, P5: { type: 'PERM_S', label: 'S극' } },
      beltInstalled: true
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-07', terminalId: 'V_50V' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-07', terminalId: 'V_COM' }, color: '#212529' }
    ],
    procedure: [
      '1. 교류 전압계(07), 계철 프레임(10), 구동 전동기(11)를 랙에 배치합니다.',
      '2. 계철 프레임 P1(N), P5(S)에 영구자석을 결합하고 구동 모터 풀리와 벨트를 연결합니다.',
      '3. 슬립링 인출단자(A2, B2)를 교류 전압계의 50V 및 COM 단자에 연결합니다.',
      '4. 구동 전동기 전원을 켜고 1800 RPM으로 운전합니다.',
      '5. 교류 전압계의 지침과 오실로스코프 정현파 파형을 관찰합니다.'
    ],
    expectedReadings: { meter: '교류 전압계', value: 'AC 14.5V RMS @ 1800 RPM' }
  },

  {
    id: 'GEN-03',
    category: '발전기 실습',
    title: '실습 03. 영구자석을 이용한 직류 발전기',
    manualPage: '59 ~ 66',
    goal: '전기자에 유도된 교류 기전력이 정류자(Commutator)를 통해 직류로 정류되는 원리를 이해하고 정류 특성을 관찰한다.',
    modules: ['IEG-6030-08', 'IEG-6030-10', 'IEG-6030-11'],
    assemblyConfig: {
      rotor: 'DISK_A',
      poles: { P1: { type: 'PERM_N', label: 'N극' }, P5: { type: 'PERM_S', label: 'S극' } },
      beltInstalled: true
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-08', terminalId: 'V_50V' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-08', terminalId: 'V_COM' }, color: '#212529' }
    ],
    procedure: [
      '1. 직류 전압계(08), 계철 프레임(10), 구동 전동기(11)를 설치합니다.',
      '2. 브러시 홀더를 정류자 위치에 장착하고 A2(+), B2(-) 단자를 직류 전압계에 결선합니다.',
      '3. 구동 모터를 1800 RPM으로 회전시킵니다.',
      '4. 전압계 지침이 한 방향 직류 전압을 가리키는지 확인합니다.',
      '5. 회전 방향을 CCW로 반전시켰을 때 극성이 반대로 전환되는 것을 확인합니다.'
    ],
    expectedReadings: { meter: '직류 전압계', value: 'DC +14.2V (CW 회전 시)' }
  },

  {
    id: 'GEN-04',
    category: '발전기 실습',
    title: '실습 04. 직류 타려 분권 발전기',
    manualPage: '67 ~ 74',
    goal: '발전기의 계자 형성을 위해 전자석 계자권선을 사용하고, 독립된 외부 전원으로 계자 전류를 가감하여 유도 기전력을 제어한다.',
    modules: ['IEG-6030-01', 'IEG-6030-06', 'IEG-6030-08', 'IEG-6030-10', 'IEG-6030-11'],
    assemblyConfig: {
      rotor: 'DISK_A',
      poles: { P1: { type: 'COIL', label: '계자권선 1' }, P5: { type: 'COIL', label: '계자권선 2' } },
      beltInstalled: true
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-06', terminalId: 'DC_POS' }, to: { moduleId: 'IEG-6030-01', terminalId: 'T1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-01', terminalId: 'T2' }, to: { moduleId: 'IEG-6030-10', terminalId: 'C1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'D1' }, to: { moduleId: 'IEG-6030-06', terminalId: 'DC_NEG' }, color: '#212529' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-08', terminalId: 'V_50V' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-08', terminalId: 'V_COM' }, color: '#212529' }
    ],
    procedure: [
      '1. 전원공급기(06), 계자저항기(01), 직류계측기(08), 계철프레임(10), 구동모터(11)를 장착합니다.',
      '2. 계철 프레임에 전자석 계자 코일을 설치하고 벨트로 연결합니다.',
      '3. 전원공급기 직류 출력을 계자 저항기를 거쳐 계자 단자(C1-D1)에 연결합니다.',
      '4. 발전기 전기자 단자(A2-B2)를 직류 전압계(50V-COM)에 연결합니다.',
      '5. 모터를 1800 RPM으로 운전하고 계자 저항 노브를 조절하며 발전 전압(20~48V)을 관찰합니다.'
    ],
    expectedReadings: { meter: '직류 전압계', value: '20V ~ 48V (계자 저항 감소 시 전압 상승)' }
  },

  {
    id: 'GEN-05',
    category: '발전기 실습',
    title: '실습 05. 직류 자려 분권 발전기',
    manualPage: '75 ~ 82',
    goal: '자려 분권 발전기의 구조 및 원리를 이해하고 자려 발전에서 최초 계자의 자극편에 잔류자기가 존재해야 하는 이유를 이해한다.',
    modules: ['IEG-6030-01', 'IEG-6030-08', 'IEG-6030-10', 'IEG-6030-11'],
    assemblyConfig: {
      rotor: 'DISK_A',
      poles: { P1: { type: 'COIL', label: '계자권선' }, P5: { type: 'COIL', label: '계자권선' } },
      beltInstalled: true
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-01', terminalId: 'T1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-01', terminalId: 'T2' }, to: { moduleId: 'IEG-6030-10', terminalId: 'C1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'D1' }, to: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, color: '#212529' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-08', terminalId: 'V_50V' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-08', terminalId: 'V_COM' }, color: '#212529' }
    ],
    procedure: [
      '1. 계자 권선(C1-D1)과 계자 저항기를 전기자 출력(A2-B2)에 병렬로 결선합니다.',
      '2. 전압계를 A2-B2 단자에 연결합니다.',
      '3. 구동 모터를 1800 RPM으로 기동합니다.',
      '4. 계자 저항기 값을 100Ω에서 서서히 줄여 임계 저항 이하로 낮춥니다.',
      '5. 잔류자기 전압(약 2V)에서 전압이 급격히 상승하여 42V에 도달하는 전압 확립 과정을 관찰합니다.'
    ],
    expectedReadings: { meter: '직류 전압계', value: '약 2V (미확립) -> 42V (전압 확립 성공)' }
  },

  {
    id: 'GEN-06',
    category: '발전기 실습',
    title: '실습 06. 분권 발전기의 무부하 포화상태',
    manualPage: '83 ~ 88',
    goal: '분권 발전기의 무부하 상태에서 계자 전류 증가에 따른 유도 기전력 포화 특성 곡선을 측정하고 자기 포화 현상을 검증한다.',
    modules: ['IEG-6030-01', 'IEG-6030-06', 'IEG-6030-08', 'IEG-6030-10', 'IEG-6030-11'],
    assemblyConfig: {
      rotor: 'DISK_A',
      poles: { P1: { type: 'COIL', label: '계자' }, P5: { type: 'COIL', label: '계자' } },
      beltInstalled: true
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-06', terminalId: 'DC_POS' }, to: { moduleId: 'IEG-6030-08', terminalId: 'A_1A' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-08', terminalId: 'A_COM' }, to: { moduleId: 'IEG-6030-01', terminalId: 'T1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-01', terminalId: 'T2' }, to: { moduleId: 'IEG-6030-10', terminalId: 'C1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'D1' }, to: { moduleId: 'IEG-6030-06', terminalId: 'DC_NEG' }, color: '#212529' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-08', terminalId: 'V_50V' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-08', terminalId: 'V_COM' }, color: '#212529' }
    ],
    procedure: [
      '1. 계자 회로에 전류계를 직렬 결선하고, 전기자 출력에 전압계를 병렬 결선합니다.',
      '2. 구동 모터를 정격 1800 RPM으로 유지합니다.',
      '3. 계자 전류(If)를 50mA 간격으로 증가시키며 유도 기전력(V)을 측정합니다.',
      '4. [데이터 기록] 버튼을 눌러 점들을 기록하고 결과 피드백 탭에서 포화 곡선을 플롯합니다.'
    ],
    expectedReadings: { meter: 'If vs V 측정', value: 'If=100mA->18V, 200mA->32V, 300mA->41V, 400mA->46V (포화)' }
  },

  {
    id: 'GEN-07',
    category: '발전기 실습',
    title: '실습 07. 직류 타려 분권 발전기의 부하특성',
    manualPage: '89 ~ 96',
    goal: '부하 전류를 증가시킬 때 내부 저항 및 전기자 반작용으로 인한 단자 전압 강하 특성(외부 특성 곡선)을 측정한다.',
    modules: ['IEG-6030-01', 'IEG-6030-05', 'IEG-6030-08', 'IEG-6030-10', 'IEG-6030-11'],
    assemblyConfig: {
      rotor: 'DISK_A',
      poles: { P1: { type: 'COIL', label: '계자' }, P5: { type: 'COIL', label: '계자' } },
      beltInstalled: true
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-08', terminalId: 'A_5A' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-08', terminalId: 'A_COM' }, to: { moduleId: 'IEG-6030-05', terminalId: 'T1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-05', terminalId: 'T4' }, to: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, color: '#212529' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-08', terminalId: 'V_50V' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-08', terminalId: 'V_COM' }, color: '#212529' }
    ],
    procedure: [
      '1. 발전기 출력에 전류계를 직렬로, RLC 부하 모듈을 부하로 결선합니다.',
      '2. 구동 모터를 1800 RPM으로 운전하고 무부하 전압을 40V로 조정합니다.',
      '3. RLC 부하의 50Ω, 30Ω, 10Ω 스위치를 순차적으로 켜며 부하 전류(IL)를 늘립니다.',
      '4. 부하 전류 증가에 따른 단자 전압 강하를 기록합니다.'
    ],
    expectedReadings: { meter: '전압계 & 전류계', value: '무부하: 40V, 0A -> 정격 부하: 32V, 1.2A' }
  },

  {
    id: 'GEN-08',
    category: '발전기 실습',
    title: '실습 08. 회전 계자형 단상 교류 분권 발전기',
    manualPage: '97 ~ 103',
    goal: '회전 계자형(Rotative Field type) 단상 교류 발전기의 구조와 발전 원리를 이해하고 고정자 권선에서 유도되는 교류 출력을 관찰한다.',
    modules: ['IEG-6030-06', 'IEG-6030-07', 'IEG-6030-10', 'IEG-6030-11'],
    assemblyConfig: {
      rotor: 'SALIENT_POLE',
      poles: { P1: { type: 'COIL', label: '고정자' }, P5: { type: 'COIL', label: '고정자' } },
      beltInstalled: true
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-06', terminalId: 'DC_POS' }, to: { moduleId: 'IEG-6030-10', terminalId: 'C1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-06', terminalId: 'DC_NEG' }, to: { moduleId: 'IEG-6030-10', terminalId: 'D1' }, color: '#212529' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-07', terminalId: 'V_50V' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-07', terminalId: 'V_COM' }, color: '#212529' }
    ],
    procedure: [
      '1. 돌극형 계자 회전자를 중심축에 결합하고, 슬립링에 직류 여자 전원을 공급합니다.',
      '2. 고정자 출력 단자를 교류 전압계에 결선합니다.',
      '3. 모터를 회전시켜 회전 계자극에 의해 고정자 도체에 기전력이 유도되도록 합니다.'
    ],
    expectedReadings: { meter: '교류 전압계', value: 'AC 24.0V RMS (60 Hz)' }
  },

  {
    id: 'GEN-09',
    category: '발전기 실습',
    title: '실습 09. 교류 발전기의 부하특성',
    manualPage: '104 ~ 110',
    goal: '교류 발전기의 출력 단자에 R 부하 및 L 부하를 연결했을 때 감자 작용 및 전압 변동률을 측정한다.',
    modules: ['IEG-6030-05', 'IEG-6030-07', 'IEG-6030-10', 'IEG-6030-11'],
    assemblyConfig: { rotor: 'SALIENT_POLE', beltInstalled: true },
    targetWires: [
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-05', terminalId: 'T1' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-05', terminalId: 'T4' }, to: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, color: '#212529' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-07', terminalId: 'V_50V' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-07', terminalId: 'V_COM' }, color: '#212529' }
    ],
    procedure: [
      '1. 교류 발전기 출력에 RLC 가변 부하를 연결합니다.',
      '2. 무부하 단자 전압을 기록한 뒤, 저항 및 인덕터 스위치를 켜 부하 특성을 관찰합니다.'
    ],
    expectedReadings: { meter: '교류 전압계', value: '지상 역률 부하 투입 시 감자 작용으로 전압 추가 강하' }
  },

  {
    id: 'GEN-10',
    category: '발전기 실습',
    title: '실습 10. 3상 발전기의 원리',
    manualPage: '111 ~ 116',
    goal: '120° 위상차를 가진 3개의 고정자 권선에서 발생하는 3상 교류 기전력의 원리를 오실로스코프로 관찰한다.',
    modules: ['IEG-6030-07', 'IEG-6030-10', 'IEG-6030-11'],
    assemblyConfig: {
      rotor: 'SALIENT_POLE',
      poles: {
        P1: { type: 'COIL', label: 'U상' },
        P4: { type: 'COIL', label: 'V상' },
        P7: { type: 'COIL', label: 'W상' }
      },
      beltInstalled: true
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A1' }, to: { moduleId: 'IEG-6030-07', terminalId: 'V_50V' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-07', terminalId: 'V_COM' }, color: '#212529' }
    ],
    procedure: [
      '1. 고정자에 120° 각도로 3개의 코일을 배치합니다.',
      '2. 회전자를 회전시키며 각 상의 전압 크기와 위상차를 측정합니다.'
    ],
    expectedReadings: { meter: '3상 위상차', value: '각 상 120° 위상차 정현파' }
  },

  {
    id: 'GEN-11',
    category: '발전기 실습',
    title: '실습 11. 회전 계자형 3상 교류 발전기 (Y-Δ 부하)',
    manualPage: '117 ~ 124',
    goal: '3상 교류 발전기의 Y결선 및 Δ결선에 따른 선간 전압과 상전압의 관계(√3배) 및 부하 점등을 실험한다.',
    modules: ['IEG-6030-04', 'IEG-6030-07', 'IEG-6030-10', 'IEG-6030-11'],
    assemblyConfig: { rotor: 'SALIENT_POLE', beltInstalled: true },
    targetWires: [
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-04', terminalId: 'U' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-04', terminalId: 'V' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'C2' }, to: { moduleId: 'IEG-6030-04', terminalId: 'W' }, color: '#d97706' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'D2' }, to: { moduleId: 'IEG-6030-04', terminalId: 'N' }, color: '#212529' }
    ],
    procedure: [
      '1. 3상 부하 모듈(04)을 Y결선 상태로 3상 발전기 출력단과 결선합니다.',
      '2. 모터를 1800 RPM으로 운전하고 3상 램프가 고르게 점등하는지 확인합니다.',
      '3. 선간 전압(U-V)과 상전압(U-N)을 교류 전압계로 비교 측정합니다.'
    ],
    expectedReadings: { meter: '선간 / 상전압', value: '상전압 Vp = 12V, 선간전압 VL = 20.8V (√3배 성립)' }
  },

  {
    id: 'GEN-12',
    category: '발전기 실습',
    title: '실습 12. 회전 전기자형 3상 교류 발전기',
    manualPage: '125 ~ 131',
    goal: '회전 전기자형 발전기의 슬립링 브러시를 통한 3상 교류 인출 구조를 관찰한다.',
    modules: ['IEG-6030-04', 'IEG-6030-10', 'IEG-6030-11'],
    assemblyConfig: { rotor: 'DISK_A', beltInstalled: true },
    targetWires: [
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-04', terminalId: 'U' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-04', terminalId: 'V' }, color: '#2563eb' }
    ],
    procedure: [
      '1. 회전 전기자 코일의 인출선을 슬립링에 연결하고 발전 출력을 측정합니다.'
    ],
    expectedReadings: { meter: '교류 출력', value: '슬립링을 통한 3상 출력 관찰' }
  },

  {
    id: 'GEN-13',
    category: '발전기 실습',
    title: '실습 13. 회전 변류기 (Rotary Converter)',
    manualPage: '132 ~ 138',
    goal: '하나의 전기기계에서 교류를 입력받아 직류로 변환하는 회전 변류기의 동작 원리를 실습한다.',
    modules: ['IEG-6030-06', 'IEG-6030-08', 'IEG-6030-10'],
    assemblyConfig: { rotor: 'DISK_A', beltInstalled: false },
    targetWires: [
      { from: { moduleId: 'IEG-6030-06', terminalId: 'AC_24V' }, to: { moduleId: 'IEG-6030-10', terminalId: 'A1' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-06', terminalId: 'AC_0V' }, to: { moduleId: 'IEG-6030-10', terminalId: 'B1' }, color: '#212529' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'C2' }, to: { moduleId: 'IEG-6030-08', terminalId: 'V_50V' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'D2' }, to: { moduleId: 'IEG-6030-08', terminalId: 'V_COM' }, color: '#212529' }
    ],
    procedure: [
      '1. 슬립링 측에 교류 전원을 가하고, 정류자 브러시 측에서 직류 출력이 인출되는지 확인합니다.'
    ],
    expectedReadings: { meter: '직류 출력', value: '정류 브러시 단자에서 DC 34V 변환 출력' }
  },

  // ==========================================
  // [제6장] 전동기의 기본 실습 (실습 01 ~ 12)
  // ==========================================
  {
    id: 'MOT-01',
    category: '전동기 실습',
    title: '실습 01. 전동기의 원리 (플레밍의 왼손 법칙)',
    manualPage: '167 ~ 172',
    goal: '자계 내에 위치한 도체에 전류를 흘릴 때 발생하는 전자기력(토크)의 방향을 플레밍의 왼손 법칙으로 검증한다.',
    modules: ['IEG-6030-06', 'IEG-6030-10'],
    assemblyConfig: {
      rotor: 'DISK_A',
      poles: { P1: { type: 'PERM_N', label: 'N극' }, P5: { type: 'PERM_S', label: 'S극' } },
      beltInstalled: false
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-06', terminalId: 'DC_POS' }, to: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-06', terminalId: 'DC_NEG' }, to: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, color: '#212529' }
    ],
    procedure: [
      '1. 계철 프레임에 영구자석(P1: N, P5: S)과 디스크 슬롯 회전자를 결합합니다.',
      '2. 전원공급기 직류 단자를 회전자 전기자 단자에 연결합니다.',
      '3. 직류 전원을 순간 투입하여 원판이 어느 방향으로 힘을 받아 튀는지 관찰합니다.'
    ],
    expectedReadings: { meter: '회전력(토크)', value: '플레밍의 왼손 법칙에 따라 시계방향 회전 모멘트 발생' }
  },

  {
    id: 'MOT-02',
    category: '전동기 실습',
    title: '실습 02. 영구자석을 이용한 직류 전동기',
    manualPage: '173 ~ 178',
    goal: '영구자석 계자와 정류자를 갖춘 직류 전동기의 연속 회전 운전 특성과 인가 전압에 따른 속도 변화를 실습한다.',
    modules: ['IEG-6030-06', 'IEG-6030-08', 'IEG-6030-10'],
    assemblyConfig: {
      rotor: 'DISK_A',
      poles: { P1: { type: 'PERM_N', label: 'N극' }, P5: { type: 'PERM_S', label: 'S극' } },
      beltInstalled: false
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-06', terminalId: 'DC_POS' }, to: { moduleId: 'IEG-6030-08', terminalId: 'A_5A' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-08', terminalId: 'A_COM' }, to: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-06', terminalId: 'DC_NEG' }, color: '#212529' }
    ],
    procedure: [
      '1. 전원공급기에서 직류 전류계를 거쳐 전기자에 전원을 공급합니다.',
      '2. 전압을 6V, 12V, 24V로 올리며 전동기 회전수 상승 및 전류를 측정합니다.'
    ],
    expectedReadings: { meter: '전동기 속도', value: '전압 증가에 비례하여 회전 속도 선형 증가' }
  },

  {
    id: 'MOT-03',
    category: '전동기 실습',
    title: '실습 03. 계자권선을 이용한 직권 전동기',
    manualPage: '179 ~ 184',
    goal: '계자 권선과 전기자 권선을 직렬로 접속한 직권 전동기의 강력한 기동 토크 및 부하에 따른 속도 변화를 관찰한다.',
    modules: ['IEG-6030-02', 'IEG-6030-06', 'IEG-6030-08', 'IEG-6030-10'],
    assemblyConfig: {
      rotor: 'DISK_A',
      poles: { P1: { type: 'COIL', label: '직권계자' }, P5: { type: 'COIL', label: '직권계자' } },
      beltInstalled: false
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-06', terminalId: 'DC_POS' }, to: { moduleId: 'IEG-6030-02', terminalId: 'T1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-02', terminalId: 'T2' }, to: { moduleId: 'IEG-6030-10', terminalId: 'C1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'D1' }, to: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-06', terminalId: 'DC_NEG' }, color: '#212529' }
    ],
    procedure: [
      '1. 기동 저항기(02)를 직렬로 연결하여 기동 전류를 억제합니다.',
      '2. 계자 권선(C1-D1)과 전기자(A2-B2)를 직렬로 연결합니다.',
      '3. 전원을 인가하고 기동 저항을 서서히 줄여 안정 운전 상태를 만듭니다.'
    ],
    expectedReadings: { meter: '직권 모터 기동', value: '기동 토크 우수, 무부하 시 속도 급상승 특성' }
  },

  {
    id: 'MOT-04',
    category: '전동기 실습',
    title: '실습 04. 직류 복권 전동기 (가동 복권)',
    manualPage: '185 ~ 190',
    goal: '분권 계자권선과 직권 계자권선을 모두 구비한 가동 복권 전동기의 결선법과 운전 특성을 습득한다.',
    modules: ['IEG-6030-01', 'IEG-6030-06', 'IEG-6030-08', 'IEG-6030-10'],
    assemblyConfig: {
      rotor: 'DISK_A',
      poles: { P1: { type: 'COIL', label: '복권코일 1' }, P5: { type: 'COIL', label: '복권코일 2' } },
      beltInstalled: false
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-06', terminalId: 'DC_POS' }, to: { moduleId: 'IEG-6030-10', terminalId: 'C1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'D1' }, to: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-06', terminalId: 'DC_NEG' }, color: '#212529' }
    ],
    procedure: [
      '1. 분권 권선과 직권 권선의 자속 방향이 서로 합쳐지도록(가동) 결선합니다.',
      '2. 안정된 기동 토크와 정속도 특성을 확인합니다.'
    ],
    expectedReadings: { meter: '복권 특성', value: '가동 복권에 의한 안정적인 회전 운전' }
  },

  {
    id: 'MOT-05',
    category: '전동기 실습',
    title: '실습 05. 직류 복권 전동기 (차동 복권)',
    manualPage: '191 ~ 198',
    goal: '직권 계자권선의 자속이 분권 계자의 자속을 감쇄시키는 차동 복권 결선 시의 속도 및 기동 불안정 현상을 실습한다.',
    modules: ['IEG-6030-01', 'IEG-6030-06', 'IEG-6030-08', 'IEG-6030-10'],
    assemblyConfig: { rotor: 'DISK_A', beltInstalled: false },
    targetWires: [
      { from: { moduleId: 'IEG-6030-06', terminalId: 'DC_POS' }, to: { moduleId: 'IEG-6030-10', terminalId: 'D1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'C1' }, to: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-06', terminalId: 'DC_NEG' }, color: '#212529' }
    ],
    procedure: [
      '1. 직권 권선의 극성을 반대로 결선하여 자속이 상쇄되도록 합니다.',
      '2. 부하 인가 시 자속 감소로 회전수가 비정상적으로 증가하는 위험 특성을 확인합니다.'
    ],
    expectedReadings: { meter: '차동 복권', value: '자속 상쇄에 따른 속도 불안정 관찰' }
  },

  {
    id: 'MOT-06',
    category: '전동기 실습',
    title: '실습 06. 교류 정류자 전동기 (만능 전동기)',
    manualPage: '199 ~ 204',
    goal: '교류 전원으로도 직류 직권 전동기와 동일한 방향의 토크를 발생시켜 동작하는 만능 전동기(Universal Motor)의 특성을 실습한다.',
    modules: ['IEG-6030-06', 'IEG-6030-07', 'IEG-6030-10'],
    assemblyConfig: { rotor: 'DISK_A', beltInstalled: false },
    targetWires: [
      { from: { moduleId: 'IEG-6030-06', terminalId: 'AC_24V' }, to: { moduleId: 'IEG-6030-10', terminalId: 'C1' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'D1' }, to: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, to: { moduleId: 'IEG-6030-06', terminalId: 'AC_0V' }, color: '#212529' }
    ],
    procedure: [
      '1. 직권 전동기 결선 상태에서 교류 24V 전원을 공급합니다.',
      '2. 전류와 자속이 동시에 반전되므로 일정한 방향의 토크가 발생하는 것을 확인합니다.'
    ],
    expectedReadings: { meter: '교류 정류자', value: 'AC 전원에서도 연속 단방향 회전' }
  },

  {
    id: 'MOT-07',
    category: '전동기 실습',
    title: '실습 07. 3상 유도 전동기의 회전자계',
    manualPage: '205 ~ 212',
    goal: '고정자에 120° 위상차를 갖는 3상 교류를 인가했을 때 원형 회전 자계(Rotating Magnetic Field)가 형성되는 것을 관찰한다.',
    modules: ['IEG-6030-06', 'IEG-6030-10', 'IEG-6030-12'],
    assemblyConfig: {
      rotor: 'SQUIRREL_CAGE',
      poles: {
        P1: { type: 'COIL', label: 'U' },
        P4: { type: 'COIL', label: 'V' },
        P7: { type: 'COIL', label: 'W' }
      },
      beltInstalled: false
    },
    targetWires: [
      { from: { moduleId: 'IEG-6030-12', terminalId: 'UA' }, to: { moduleId: 'IEG-6030-10', terminalId: 'A1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-12', terminalId: 'VA' }, to: { moduleId: 'IEG-6030-10', terminalId: 'B1' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-12', terminalId: 'WA' }, to: { moduleId: 'IEG-6030-10', terminalId: 'C1' }, color: '#d97706' }
    ],
    procedure: [
      '1. 3상 전원을 극수 변환기(12)를 거쳐 계철 프레임 3상 권선에 인가합니다.',
      '2. 고정자 내부에 자계 회전 방향을 나타내는 자침 또는 회전자를 투입하여 회전자계를 확인합니다.'
    ],
    expectedReadings: { meter: '회전자계', value: '동기속도 Ns = 120f/P에 따른 회전자계 형성' }
  },

  {
    id: 'MOT-08',
    category: '전동기 실습',
    title: '실습 08. 농형 유도 전동기',
    manualPage: '213 ~ 220',
    goal: '농형 회전자(Squirrel-cage Rotor)를 조립하여 3상 회전자계에 의해 슬립(Slip)을 동반한 유도 전동기 회전을 실습한다.',
    modules: ['IEG-6030-06', 'IEG-6030-07', 'IEG-6030-10', 'IEG-6030-12'],
    assemblyConfig: { rotor: 'SQUIRREL_CAGE', beltInstalled: false },
    targetWires: [
      { from: { moduleId: 'IEG-6030-12', terminalId: 'UA' }, to: { moduleId: 'IEG-6030-10', terminalId: 'A1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-12', terminalId: 'VA' }, to: { moduleId: 'IEG-6030-10', terminalId: 'B1' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-12', terminalId: 'WA' }, to: { moduleId: 'IEG-6030-10', terminalId: 'C1' }, color: '#d97706' }
    ],
    procedure: [
      '1. 농형 회전자를 계철 프레임 중심축에 결합합니다.',
      '2. 3상 교류 전원을 인가하여 전동기가 부드럽게 기동하는지 확인합니다.',
      '3. 2선의 결선을 서로 맞바꾸어(R-S 교환) 역회전 제어를 실습합니다.'
    ],
    expectedReadings: { meter: '유도 전동기 속도', value: '약 1740 RPM (슬립 s = 3.3%)' }
  },

  {
    id: 'MOT-09',
    category: '전동기 실습',
    title: '실습 09. 유도 전동기의 2단 속도 제어',
    manualPage: '221 ~ 228',
    goal: '극수 전환기(Pole Changing Unit) 모듈을 조작하여 고정자 극수를 2극 및 4극으로 절환함으로써 속도를 2배로 제어한다.',
    modules: ['IEG-6030-10', 'IEG-6030-12'],
    assemblyConfig: { rotor: 'SQUIRREL_CAGE', beltInstalled: false },
    targetWires: [
      { from: { moduleId: 'IEG-6030-12', terminalId: 'UA' }, to: { moduleId: 'IEG-6030-10', terminalId: 'A1' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-12', terminalId: 'UB' }, to: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, color: '#dc2626' },
      { from: { moduleId: 'IEG-6030-12', terminalId: 'VA' }, to: { moduleId: 'IEG-6030-10', terminalId: 'B1' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-12', terminalId: 'VB' }, to: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, color: '#2563eb' }
    ],
    procedure: [
      '1. 극수 전환 스위치를 LOW(4극)에 두고 속도를 측정합니다 (약 1740 RPM).',
      '2. 스위치를 HIGH(2극)로 전환하여 속도가 2배(약 3450 RPM)로 증가하는 것을 확인합니다.'
    ],
    expectedReadings: { meter: '2단 변속', value: '4극(저속: 1740 RPM) <-> 2극(고속: 3450 RPM)' }
  },

  {
    id: 'MOT-10',
    category: '전동기 실습',
    title: '실습 10. 반발 전동기 (Repulsion Motor)',
    manualPage: '229 ~ 235',
    goal: '단상 교류 전원을 고정자에 인가하고 단락된 전기자 브러시 각도를 조절하여 회전 토크를 발생하는 반발 전동기를 실습한다.',
    modules: ['IEG-6030-06', 'IEG-6030-10'],
    assemblyConfig: { rotor: 'DISK_A', beltInstalled: false },
    targetWires: [
      { from: { moduleId: 'IEG-6030-06', terminalId: 'AC_24V' }, to: { moduleId: 'IEG-6030-10', terminalId: 'C1' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-06', terminalId: 'AC_0V' }, to: { moduleId: 'IEG-6030-10', terminalId: 'D1' }, color: '#212529' },
      { from: { moduleId: 'IEG-6030-10', terminalId: 'A2' }, to: { moduleId: 'IEG-6030-10', terminalId: 'B2' }, color: '#10b981' }
    ],
    procedure: [
      '1. 전기자 양단(A2-B2)을 단락선(점퍼선)으로 직접 쇼트 연결합니다.',
      '2. 고정자에 단상 교류를 인가하고 브러시 각도를 이동시키며 토크 방향 및 크기를 관찰합니다.'
    ],
    expectedReadings: { meter: '반발 토크', value: '브러시 변위에 따른 회전 방향 및 속도 제어' }
  },

  {
    id: 'MOT-11',
    category: '전동기 실습',
    title: '실습 11. 분상 전동기 (Split-Phase Motor)',
    manualPage: '236 ~ 242',
    goal: '단상 유도 전동기에서 주권선과 보조권선(기동권선)의 임피던스 차이를 이용해 90° 위상차 분상 자계를 만들어 기동한다.',
    modules: ['IEG-6030-05', 'IEG-6030-06', 'IEG-6030-10'],
    assemblyConfig: { rotor: 'SQUIRREL_CAGE', beltInstalled: false },
    targetWires: [
      { from: { moduleId: 'IEG-6030-06', terminalId: 'AC_24V' }, to: { moduleId: 'IEG-6030-10', terminalId: 'A1' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-06', terminalId: 'AC_24V' }, to: { moduleId: 'IEG-6030-05', terminalId: 'T3' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-05', terminalId: 'T6' }, to: { moduleId: 'IEG-6030-10', terminalId: 'B1' }, color: '#2563eb' }
    ],
    procedure: [
      '1. 보조 권선에 RLC 모듈의 콘덴서(8.5μF)를 직렬로 연결하여 진상 전류를 만듭니다.',
      '2. 단상 교류를 투입하여 단상 유도 전동기가 기동 토크를 얻고 스스로 회전하는 것을 관찰합니다.'
    ],
    expectedReadings: { meter: '콘덴서 기동', value: '진상 보조전류에 의한 단상 모터 자력 기동' }
  },

  {
    id: 'MOT-12',
    category: '전동기 실습',
    title: '실습 12. 세이딩 코일형 전동기 (Shaded-Pole Motor)',
    manualPage: '243 ~ 250',
    goal: '자극의 일부에 동선(세이딩 코일)을 감아 자속의 위상 지연을 유도하여 기동 회전자계를 만드는 구조를 실습한다.',
    modules: ['IEG-6030-06', 'IEG-6030-10'],
    assemblyConfig: { rotor: 'SQUIRREL_CAGE', beltInstalled: false },
    targetWires: [
      { from: { moduleId: 'IEG-6030-06', terminalId: 'AC_24V' }, to: { moduleId: 'IEG-6030-10', terminalId: 'C1' }, color: '#2563eb' },
      { from: { moduleId: 'IEG-6030-06', terminalId: 'AC_0V' }, to: { moduleId: 'IEG-6030-10', terminalId: 'D1' }, color: '#212529' }
    ],
    procedure: [
      '1. 세이딩 코일이 장착된 자극을 설치하고 농형 회전자를 결합합니다.',
      '2. 교류 전원을 가하여 주자극에서 세이딩 자극 쪽으로 이동하는 자계에 의해 회전하는 원리를 확인합니다.'
    ],
    expectedReadings: { meter: '세이딩 모터', value: '단순한 구조의 소형 팬 모터 회전 원리 검증' }
  }
];
