/**
 * IEG-6030 전기기계 구조 실습장비 - 실습 커리큘럼 (총 25개 과정)
 * 제4장 발전기의 기본 실습 (13개) + 제6장 전동기의 기본 실습 (12개)
 *
 * assemblyConfig.machine.type : 회로 해석 엔진이 사용하는 기기 모델
 * targetWires                 : 정답 배선 (자동 결선 및 채점 기준)
 * presets                     : 실습 로드 시 초기 조작값 (모듈 → 컨트롤 → 값)
 * expectedReadings            : 시뮬레이터 모델로 계산한 이론 기대값 (tests/verify_theory.mjs로 검증)
 * verify                      : 실습 평가(운전·계측) 판정 범위
 */
export const EXPERIMENTS_DATA = [
  {
    "id": "GEN-01",
    "category": "발전기 실습",
    "title": "실습 01. 발전기의 기본 원리",
    "manualPage": "43 ~ 50",
    "goal": "영구자석에 의한 계자를 형성하여 자계 내에 연동선(Coil)의 도체를 빠르게 움직였을 때 유도되는 교류 기전력의 발생을 관찰하고 유도 기전력의 세기에 관계되는 요소를 이해한다.",
    "modules": [
      "IEG-6030-09",
      "IEG-6030-10"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "PERM_N",
          "label": "N극"
        },
        "P5": {
          "type": "PERM_S",
          "label": "S극"
        }
      },
      "beltInstalled": false,
      "machine": {
        "type": "PM_AC_GEN",
        "manual": true,
        "manualRpm": 150
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-09",
          "terminalId": "POS"
        },
        "color": "#e63946"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-09",
          "terminalId": "NEG"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "랙에 직류 검류계(09)와 계철 프레임(10)을 설치합니다.",
      "계철 프레임에 회전자 고정대와 디스크 슬롯 A형 회전자(슬립링·A형 브러시)를 결합합니다.",
      "P1에 N극, P5에 S극 영구자석을 결합하고 고정 볼트로 조여줍니다.",
      "계철 프레임 A2, B2 단자를 직류 검류계의 (+), (−) 단자에 결선합니다.",
      "검류계를 ±50mA 레인지에 두고 [↷ CW 수동]·[↶ CCW 수동] 또는 [▶ 연속 회전(150rpm)]으로 회전시키며 지시값이 ±로 번갈아 흔들리는 것(교류)을 관찰합니다. ±5mA 레인지로 바꾸어 다시 관찰합니다."
    ],
    "expectedReadings": {
      "meter": "직류 검류계",
      "value": "연속 회전 150rpm: 기전력 1.21V(실효) → 최대 약 ±5.7mA로 좌우 진동 (I = √2·E / (Ra+Rg) = √2×1.21 / 302.5Ω)"
    },
    "verify": [
      {
        "key": "galvPeak",
        "min": 1,
        "max": 60,
        "label": "검류계 지시 발생"
      }
    ]
  },
  {
    "id": "GEN-02",
    "category": "발전기 실습",
    "title": "실습 02. 영구자석을 이용한 단상 교류 발전기",
    "manualPage": "51 ~ 58",
    "goal": "원형 영구자석으로 계자를 형성한 단상 교류 발전기의 구조를 이해하고 유도되는 교류 기전력의 파형과 주파수 특성을 계측한다.",
    "modules": [
      "IEG-6030-07",
      "IEG-6030-10",
      "IEG-6030-11"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "PERM_N",
          "label": "N극"
        },
        "P5": {
          "type": "PERM_S",
          "label": "S극"
        }
      },
      "beltInstalled": true,
      "machine": {
        "type": "PM_AC_GEN"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "V_50V"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "V_COM"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "교류 전압/전류계(07), 계철 프레임(10), 구동 전동기(11)를 랙에 배치합니다.",
      "계철 프레임 P1(N), P5(S)에 원형 영구자석을 결합하고 구동 모터 풀리와 벨트를 연결합니다.",
      "슬립링 인출단자(A2, B2)를 교류 전압계의 50V 및 COM 단자에 연결합니다.",
      "[RUN]으로 구동 전동기를 1800rpm으로 운전합니다.",
      "교류 전압계 지시값과 오실로스코프의 정현파(주기·주파수)를 관찰하고, 속도 노브를 바꾸어 전압·주파수가 회전수에 비례함을 확인합니다."
    ],
    "expectedReadings": {
      "meter": "교류 전압계",
      "value": "AC 14.5V (1800rpm, 무부하) · 주파수 f = P·n/120 = 2×1800/120 = 30Hz"
    },
    "verify": [
      {
        "key": "M_AC_V",
        "min": 13,
        "max": 16,
        "label": "교류 기전력 14.5V"
      }
    ]
  },
  {
    "id": "GEN-03",
    "category": "발전기 실습",
    "title": "실습 03. 영구자석을 이용한 직류 발전기",
    "manualPage": "59 ~ 66",
    "goal": "전기자에 유도된 교류 기전력이 정류자(Commutator)를 통해 직류로 정류되는 원리를 이해하고 정류 특성을 관찰한다.",
    "modules": [
      "IEG-6030-08",
      "IEG-6030-10",
      "IEG-6030-11"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "PERM_N",
          "label": "N극"
        },
        "P5": {
          "type": "PERM_S",
          "label": "S극"
        }
      },
      "beltInstalled": true,
      "machine": {
        "type": "PM_DC_GEN"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_50V"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_COM"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "직류 전압/전류계(08), 계철 프레임(10), 구동 전동기(11)를 설치합니다.",
      "영구자석(P1:N, P5:S)과 2극 전기자를 조립하고 B형 브러시 홀더(정류자)를 결합합니다.",
      "A2(+), B2(−) 단자를 직류 전압계 50V–COM에 결선합니다.",
      "[RUN]으로 1800rpm 운전하고 전압계가 한 방향(+) 직류를 지시하는지 확인합니다.",
      "STOP 후 구동 전동기의 방향 스위치(DIRECTION)를 CCW로 돌려 다시 운전하면 극성이 (−)로 반전됨을 확인합니다."
    ],
    "expectedReadings": {
      "meter": "직류 전압계",
      "value": "DC +13.1V (CW) / −13.1V (CCW) — 정류 평균값 = (2√2/π)×14.5V = 0.9×14.5V"
    },
    "verify": [
      {
        "key": "M_DC_V_abs",
        "min": 11.5,
        "max": 14.5,
        "label": "정류 직류 13.1V"
      }
    ]
  },
  {
    "id": "GEN-04",
    "category": "발전기 실습",
    "title": "실습 04. 직류 타려 분권 발전기",
    "manualPage": "67 ~ 74",
    "goal": "발전기의 계자 형성을 위해 전자석 계자권선을 사용하고, 독립된 외부 전원으로 계자 전류를 가감하여 유도 기전력을 제어한다.",
    "modules": [
      "IEG-6030-01",
      "IEG-6030-06",
      "IEG-6030-08",
      "IEG-6030-10",
      "IEG-6030-11"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "계자권선 1"
        },
        "P5": {
          "type": "COIL",
          "label": "계자권선 2"
        }
      },
      "beltInstalled": true,
      "machine": {
        "type": "DC_GEN"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_12V"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_IN2"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_5"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_6"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_POS"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_1A"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_COM"
        },
        "to": {
          "moduleId": "IEG-6030-01",
          "terminalId": "T1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-01",
          "terminalId": "T2"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_NEG"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_50V"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_COM"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "전원공급기(06), 계자저항기(01), 직류 전압/전류계(08), 계철 프레임(10), 구동 전동기(11)를 장착합니다.",
      "계자권선/700회 2개를 P1·P5 자극에 설치하고 2극 전기자와 벨트를 연결합니다.",
      "전원공급기 AC 12V 탭을 AC OUTPUT 2번에, 5번–6번 단자를 점퍼로 연결합니다 (DC 출력 약 15.5V).",
      "계자회로: DC(+) → 전류계 1A → 계자저항기 1–2 → 계자 C1 … D1 → DC(−)로 결선합니다.",
      "전기자 A2–B2를 직류 전압계 50V–COM에 결선합니다.",
      "1800rpm으로 운전하며 계자저항을 100Ω → 0Ω으로 줄여 계자전류(If) 증가에 따른 발전전압 상승을 관찰합니다. 방향을 CCW로 바꾸면 극성이 반전됩니다."
    ],
    "expectedReadings": {
      "meter": "직류 전압계 / 전류계",
      "value": "R=100Ω: If≈0.112A, V≈20.7V → R=0Ω: If≈0.391A, V≈46.0V (1800rpm, DC 15.5V 여자)"
    },
    "verify": [
      {
        "key": "M_DC_V_abs",
        "min": 18,
        "max": 48,
        "label": "발전전압 20~46V"
      },
      {
        "key": "M_DC_A_abs",
        "min": 0.09,
        "max": 0.45,
        "label": "계자전류 0.11~0.39A"
      }
    ]
  },
  {
    "id": "GEN-05",
    "category": "발전기 실습",
    "title": "실습 05. 직류 자려 분권 발전기",
    "manualPage": "75 ~ 82",
    "goal": "자려 분권 발전기의 구조 및 원리를 이해하고 자려 발전에서 최초 계자의 자극편에 잔류자기가 존재해야 하는 이유를 이해한다.",
    "modules": [
      "IEG-6030-01",
      "IEG-6030-08",
      "IEG-6030-10",
      "IEG-6030-11"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "계자권선"
        },
        "P5": {
          "type": "COIL",
          "label": "계자권선"
        }
      },
      "beltInstalled": true,
      "machine": {
        "type": "DC_GEN"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-01",
          "terminalId": "T1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-01",
          "terminalId": "T2"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_50V"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_COM"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "계자권선(C1–D1)을 계자저항기를 거쳐 전기자 출력(A2–B2)에 병렬 결선합니다 (A2 → 01의 1번, 01의 2번 → C1, D1 → B2).",
      "직류 전압계 50V–COM을 A2–B2에 연결합니다.",
      "구동 전동기 속도 노브를 1000rpm으로 두고 [RUN] → 잔류자기에 의한 약 3V만 나타나고 전압이 확립되지 않음을 확인합니다.",
      "속도 노브를 1800rpm으로 올리면 임계속도(R=100Ω에서 약 1300rpm)를 넘어 전압이 급격히 확립(약 38V)되는 과정을 관찰합니다.",
      "계자저항을 줄이면 확립 전압이 높아지고(최대 약 47V), 회전방향을 CCW로 바꾸면 잔류자기가 상쇄되어 확립되지 않음을 확인합니다."
    ],
    "expectedReadings": {
      "meter": "직류 전압계",
      "value": "1000rpm: 약 3V (미확립) → 1800rpm: 약 38V (확립, R=100Ω) → R=50Ω: 약 46.5V"
    },
    "verify": [
      {
        "key": "M_DC_V_abs",
        "min": 30,
        "max": 50,
        "label": "자려 전압 확립"
      }
    ],
    "presets": {
      "IEG-6030-11": {
        "MOTOR_SPEED": 1000
      }
    }
  },
  {
    "id": "GEN-06",
    "category": "발전기 실습",
    "title": "실습 06. 분권 발전기의 무부하 포화상태",
    "manualPage": "83 ~ 88",
    "goal": "분권 발전기의 무부하 상태에서 계자 전류 증가에 따른 유도 기전력 포화 특성 곡선을 측정하고 자기 포화 현상을 검증한다.",
    "modules": [
      "IEG-6030-01",
      "IEG-6030-06",
      "IEG-6030-08",
      "IEG-6030-10",
      "IEG-6030-11"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "계자"
        },
        "P5": {
          "type": "COIL",
          "label": "계자"
        }
      },
      "beltInstalled": true,
      "machine": {
        "type": "DC_GEN"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_12V"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_IN2"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_5"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_6"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_POS"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_1A"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_COM"
        },
        "to": {
          "moduleId": "IEG-6030-01",
          "terminalId": "T1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-01",
          "terminalId": "T2"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_NEG"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_50V"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_COM"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "계자 회로에 직류 전류계(1A)를 직렬로, 전기자 출력(A2–B2)에 직류 전압계(50V)를 병렬로 결선합니다.",
      "전원공급기는 AC 12V 탭 → 2번, 5–6번 점퍼로 DC 약 15.5V를 계자에 공급합니다.",
      "구동 전동기를 1800rpm으로 유지합니다.",
      "계자저항을 100Ω에서 0Ω까지 단계적으로 줄이며 계자전류(If)와 발전전압(V)을 [📥 데이터 기록]으로 기록합니다.",
      "[결과 피드백] 탭에서 기록 점과 이론 포화곡선을 비교합니다 (24V 탭 사용 시 If 약 0.8A까지 확장)."
    ],
    "expectedReadings": {
      "meter": "If – V 포화곡선",
      "value": "E = 1.8 + 50·tanh(If/0.28) [1800rpm]: If 0.1A→18.9V, 0.2A→32.5V, 0.3A→41.3V, 0.39A→46.0V"
    },
    "verify": [
      {
        "key": "M_DC_V_abs",
        "min": 18,
        "max": 52,
        "label": "포화곡선 측정 범위"
      }
    ]
  },
  {
    "id": "GEN-07",
    "category": "발전기 실습",
    "title": "실습 07. 직류 타려 분권 발전기의 부하특성",
    "manualPage": "89 ~ 96",
    "goal": "부하 전류를 증가시킬 때 내부 저항 및 전기자 반작용으로 인한 단자 전압 강하 특성(외부 특성 곡선)을 측정한다.",
    "modules": [
      "IEG-6030-01",
      "IEG-6030-05",
      "IEG-6030-06",
      "IEG-6030-08",
      "IEG-6030-10",
      "IEG-6030-11"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "계자"
        },
        "P5": {
          "type": "COIL",
          "label": "계자"
        }
      },
      "beltInstalled": true,
      "machine": {
        "type": "DC_GEN"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_12V"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_IN2"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_5"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_6"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_POS"
        },
        "to": {
          "moduleId": "IEG-6030-01",
          "terminalId": "T1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-01",
          "terminalId": "T2"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_NEG"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_5A"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_COM"
        },
        "to": {
          "moduleId": "IEG-6030-05",
          "terminalId": "T1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-05",
          "terminalId": "T4"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_50V"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_COM"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "전원공급기(06) DC 출력 → 계자저항기 → 계자 C1–D1으로 타여자 계자회로를 결선합니다 (AC 12V 탭 → 2번, 5–6번 점퍼).",
      "발전기 A2 → 직류 전류계 5A → RLC 부하 1번(R+) / 부하 4번(R−) → B2, 전압계 50V를 A2–B2에 결선합니다.",
      "1800rpm으로 운전하고 무부하 전압이 약 40V인지 확인합니다 (계자저항 16Ω 설정).",
      "RLC 부하의 50Ω → 30Ω → 30Ω+50Ω(18.75Ω) → 10Ω 스위치를 차례로 켜며 부하전류(IL)와 단자전압(V)을 기록합니다.",
      "부하 증가에 따른 단자전압 강하(V = E − Ia·Ra)와 구동 전동기 속도 저하를 관찰합니다."
    ],
    "expectedReadings": {
      "meter": "전압계 & 전류계",
      "value": "무부하 39.9V → 50Ω: 36.1V/0.72A → 30Ω: 34.0V/1.13A → 18.75Ω: 31.4V/1.67A → 10Ω: 26.6V/2.65A"
    },
    "presets": {
      "IEG-6030-01": {
        "R_FIELD": 16
      }
    },
    "verify": [
      {
        "key": "M_DC_V_abs",
        "min": 20,
        "max": 41,
        "label": "단자전압"
      },
      {
        "key": "M_DC_A_abs",
        "min": 0.3,
        "max": 4,
        "label": "부하전류 발생"
      }
    ]
  },
  {
    "id": "GEN-08",
    "category": "발전기 실습",
    "title": "실습 08. 회전 계자형 단상 교류 분권 발전기",
    "manualPage": "97 ~ 103",
    "goal": "회전 계자형(Rotative Field type) 단상 교류 발전기의 구조와 발전 원리를 이해하고 고정자 권선에서 유도되는 교류 출력을 관찰한다.",
    "modules": [
      "IEG-6030-06",
      "IEG-6030-07",
      "IEG-6030-10",
      "IEG-6030-11"
    ],
    "assemblyConfig": {
      "rotor": "SALIENT_POLE",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "고정자"
        },
        "P5": {
          "type": "COIL",
          "label": "고정자"
        }
      },
      "beltInstalled": true,
      "machine": {
        "type": "SYNC_GEN_1PH"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_12V"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_IN2"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_5"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_6"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_POS"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_NEG"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "V_50V"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "V_COM"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "돌극형 계자 회전자를 중심축에 결합하고, 슬립링(C1–D1)에 전원공급기 직류(12V 탭 → 약 15.5V)를 공급합니다.",
      "고정자 출력(A2–B2)을 교류 전압계 50V–COM에 결선합니다.",
      "[RUN]으로 1800rpm 운전하여 회전 계자에 의해 고정자 권선에 유기되는 교류 전압과 파형을 관찰합니다."
    ],
    "expectedReadings": {
      "meter": "교류 전압계",
      "value": "AC 23.9V (If≈0.39A, 1800rpm) · f = 2×1800/120 = 30Hz"
    },
    "verify": [
      {
        "key": "M_AC_V",
        "min": 21,
        "max": 26,
        "label": "교류 기전력 23.9V"
      }
    ]
  },
  {
    "id": "GEN-09",
    "category": "발전기 실습",
    "title": "실습 09. 교류 발전기의 부하특성",
    "manualPage": "104 ~ 110",
    "goal": "교류 발전기의 출력 단자에 R 부하 및 L 부하를 연결했을 때 감자 작용 및 전압 변동률을 측정한다.",
    "modules": [
      "IEG-6030-05",
      "IEG-6030-06",
      "IEG-6030-07",
      "IEG-6030-10",
      "IEG-6030-11"
    ],
    "assemblyConfig": {
      "rotor": "SALIENT_POLE",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "고정자"
        },
        "P5": {
          "type": "COIL",
          "label": "고정자"
        }
      },
      "beltInstalled": true,
      "machine": {
        "type": "SYNC_GEN_1PH"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_12V"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_IN2"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_5"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_6"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_POS"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_NEG"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "A_5A"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-07",
          "terminalId": "A_COM"
        },
        "to": {
          "moduleId": "IEG-6030-05",
          "terminalId": "T1"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-05",
          "terminalId": "T4"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-05",
          "terminalId": "T1"
        },
        "to": {
          "moduleId": "IEG-6030-05",
          "terminalId": "T2"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-05",
          "terminalId": "T4"
        },
        "to": {
          "moduleId": "IEG-6030-05",
          "terminalId": "T5"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "V_50V"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "V_COM"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "회전계자형 교류발전기(실습 08 구성)의 계자에 직류 여자를 공급합니다.",
      "발전기 A2 → 교류 전류계 5A → RLC 부하 1번, 부하 4번 → B2로 결선하고, 부하 1–2번 / 4–5번을 점퍼로 연결해 R과 L을 병렬로 사용할 수 있게 합니다.",
      "1800rpm 무부하 전압을 기록한 뒤, 30Ω 저항(S2)을 켜서 전압·전류를 측정합니다.",
      "이어서 0.4H 인덕터(S5)를 추가로 켜 지상 역률 부하에서의 전압 강하를 비교하고 전압 변동률을 계산합니다."
    ],
    "expectedReadings": {
      "meter": "교류 전압계/전류계",
      "value": "무부하 23.9V → R 30Ω: 21.3V/0.71A → R30Ω∥L0.4H: 19.7V/0.73A (지상 부하 시 전압 추가 강하)"
    },
    "verify": [
      {
        "key": "M_AC_V",
        "min": 15,
        "max": 25,
        "label": "단자전압"
      }
    ]
  },
  {
    "id": "GEN-10",
    "category": "발전기 실습",
    "title": "실습 10. 3상 발전기의 원리",
    "manualPage": "111 ~ 116",
    "goal": "120° 위상차를 가진 3개의 고정자 권선에서 발생하는 3상 교류 기전력의 원리를 오실로스코프로 관찰한다.",
    "modules": [
      "IEG-6030-07",
      "IEG-6030-10",
      "IEG-6030-11"
    ],
    "assemblyConfig": {
      "rotor": "SALIENT_POLE",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "U상"
        },
        "P4": {
          "type": "COIL",
          "label": "V상"
        },
        "P7": {
          "type": "COIL",
          "label": "W상"
        }
      },
      "beltInstalled": true,
      "machine": {
        "type": "SYNC_GEN_3PH"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A1"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "V_50V"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "V_COM"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "돌극형 회전자와 120° 간격의 3개 고정자 코일(P1·P4·P7)을 조립합니다.",
      "A상 권선(A1)과 중성선(D1)을 교류 전압계 50V–COM에 결선합니다.",
      "1800rpm으로 운전하여 상전압을 측정하고, 오실로스코프에서 A·B·C 3상 파형의 120° 위상차를 관찰합니다."
    ],
    "expectedReadings": {
      "meter": "3상 상전압",
      "value": "상전압 12.0V (1800rpm), 30Hz, 3상 정현파 120° 위상차"
    },
    "verify": [
      {
        "key": "M_AC_V",
        "min": 10.5,
        "max": 13.5,
        "label": "상전압 12V"
      }
    ]
  },
  {
    "id": "GEN-11",
    "category": "발전기 실습",
    "title": "실습 11. 회전 계자형 3상 교류 발전기 (Y-Δ 부하)",
    "manualPage": "117 ~ 124",
    "goal": "3상 교류 발전기의 Y결선 및 Δ결선에 따른 선간 전압과 상전압의 관계(√3배) 및 부하 점등을 실험한다.",
    "modules": [
      "IEG-6030-04",
      "IEG-6030-07",
      "IEG-6030-10",
      "IEG-6030-11"
    ],
    "assemblyConfig": {
      "rotor": "SALIENT_POLE",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "U상"
        },
        "P4": {
          "type": "COIL",
          "label": "V상"
        },
        "P7": {
          "type": "COIL",
          "label": "W상"
        }
      },
      "beltInstalled": true,
      "machine": {
        "type": "SYNC_GEN_3PH"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-04",
          "terminalId": "U"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-04",
          "terminalId": "V"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C2"
        },
        "to": {
          "moduleId": "IEG-6030-04",
          "terminalId": "W"
        },
        "color": "#d97706"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D2"
        },
        "to": {
          "moduleId": "IEG-6030-04",
          "terminalId": "N"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-04",
          "terminalId": "U"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "V_50V"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-04",
          "terminalId": "N"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "V_COM"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "3상 부하 모듈(04)의 Y결선 램프(L4·L5·L6, 12V)를 장착하고 A2→U, B2→V, C2→W, D2→N으로 결선합니다.",
      "교류 전압계를 U–N 사이에 연결합니다 (상전압).",
      "1800rpm으로 운전하여 3상 램프가 고르게 점등하는지 확인합니다.",
      "전압계 COM을 N에서 V 단자로 옮겨 선간전압(U–V)을 측정하고 상전압과의 비(√3)를 확인합니다. 램프 소켓을 클릭하면 전구를 장착/분리할 수 있습니다."
    ],
    "expectedReadings": {
      "meter": "선간 / 상전압",
      "value": "Y 부하 시 상전압 약 11.4V, 선간전압 약 19.7V (= √3 × 11.36V) — 무부하 기전력 12V"
    },
    "verify": [
      {
        "key": "M_AC_V",
        "min": 10,
        "max": 21,
        "label": "상/선간 전압"
      }
    ]
  },
  {
    "id": "GEN-12",
    "category": "발전기 실습",
    "title": "실습 12. 회전 전기자형 3상 교류 발전기",
    "manualPage": "125 ~ 131",
    "goal": "회전 전기자형 발전기의 슬립링 브러시를 통한 3상 교류 인출 구조를 관찰한다.",
    "modules": [
      "IEG-6030-04",
      "IEG-6030-07",
      "IEG-6030-10",
      "IEG-6030-11"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "계자"
        },
        "P5": {
          "type": "COIL",
          "label": "계자"
        }
      },
      "beltInstalled": true,
      "machine": {
        "type": "ROT_ARM_3PH"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-04",
          "terminalId": "U"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-04",
          "terminalId": "V"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C2"
        },
        "to": {
          "moduleId": "IEG-6030-04",
          "terminalId": "W"
        },
        "color": "#d97706"
      },
      {
        "from": {
          "moduleId": "IEG-6030-04",
          "terminalId": "U"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "V_50V"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-04",
          "terminalId": "V"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "V_COM"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "회전 전기자(3상 권선 + 슬립링) 회전자를 조립하고 A2→U, B2→V, C2→W로 3상 Δ 부하(L1·L2·L3)에 결선합니다.",
      "교류 전압계를 U–V 사이(선간)에 연결합니다.",
      "구동 전동기 속도를 1000rpm으로 설정하고 [RUN] → 램프 점등과 선간전압을 확인합니다.",
      "속도를 높이면 선간전압이 램프 정격(12V)을 넘어 과전압 경고가 나타남을 확인합니다 (교재: 1400rpm 이상 운전 금지)."
    ],
    "expectedReadings": {
      "meter": "교류 선간전압",
      "value": "1000rpm: 약 9.9V (정격 이내) / 1800rpm: 약 17.6V → 12V 램프 과전압"
    },
    "presets": {
      "IEG-6030-04": {
        "BULB_L1": true,
        "BULB_L2": true,
        "BULB_L3": true,
        "BULB_L4": false,
        "BULB_L5": false,
        "BULB_L6": false
      },
      "IEG-6030-11": {
        "MOTOR_SPEED": 1000
      }
    },
    "verify": [
      {
        "key": "M_AC_V",
        "min": 7,
        "max": 13,
        "label": "정격 이내 선간전압"
      }
    ]
  },
  {
    "id": "GEN-13",
    "category": "발전기 실습",
    "title": "실습 13. 회전 변류기 (Rotary Converter)",
    "manualPage": "132 ~ 138",
    "goal": "하나의 전기기계에서 교류를 입력받아 직류로 변환하는 회전 변류기의 동작 원리를 실습한다.",
    "modules": [
      "IEG-6030-06",
      "IEG-6030-08",
      "IEG-6030-10"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "계자"
        },
        "P5": {
          "type": "COIL",
          "label": "계자"
        }
      },
      "beltInstalled": false,
      "machine": {
        "type": "ROTARY_CONV"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_24V"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A1"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_0V"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B1"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_50V"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_COM"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "전원공급기 AC 24V 탭과 0V를 회전변류기 슬립링(A1, B1)에 결선합니다.",
      "정류자 브러시 단자(C2, D2)를 직류 전압계 50V–COM에 결선합니다.",
      "[RUN]으로 전원을 투입하면 회전자가 동기속도로 기동하고 정류자 측에서 직류가 인출되는지 확인합니다."
    ],
    "expectedReadings": {
      "meter": "직류 출력",
      "value": "교류 23.8V 입력 → 동기속도 3600rpm, 직류 출력 약 33.7V (≈ √2 × 교류 실효값)"
    },
    "verify": [
      {
        "key": "M_DC_V_abs",
        "min": 30,
        "max": 36,
        "label": "직류 변환 출력"
      }
    ]
  },
  {
    "id": "MOT-01",
    "category": "전동기 실습",
    "title": "실습 01. 전동기의 원리 (플레밍의 왼손 법칙)",
    "manualPage": "167 ~ 172",
    "goal": "자계 내에 위치한 도체에 전류를 흘릴 때 발생하는 전자기력(토크)의 방향을 플레밍의 왼손 법칙으로 검증한다.",
    "modules": [
      "IEG-6030-06",
      "IEG-6030-10"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "PERM_N",
          "label": "N극"
        },
        "P5": {
          "type": "PERM_S",
          "label": "S극"
        }
      },
      "beltInstalled": false,
      "machine": {
        "type": "PM_DC_MOTOR"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_6V"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_IN4"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_5"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_6"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_POS"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_NEG"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "계철 프레임에 영구자석(P1: N, P5: S)과 디스크 슬롯 회전자(B형 브러시)를 결합합니다.",
      "전원공급기 AC 6V 탭 → 4번, 5–6번 점퍼로 DC 약 7V를 만들고 DC(+)→A2, DC(−)→B2로 결선합니다.",
      "[RUN]으로 직류를 투입해 회전 방향을 관찰하고, 결선 극성을 바꾸어 방향이 반대가 되는지 확인합니다."
    ],
    "expectedReadings": {
      "meter": "회전력(토크)",
      "value": "DC 7.0V 인가 → 시계방향(CW) 기동, 약 830rpm / 극성 반대 시 반시계(CCW)"
    },
    "verify": [
      {
        "key": "rpm",
        "min": 300,
        "max": 1500,
        "label": "전동기 회전"
      }
    ]
  },
  {
    "id": "MOT-02",
    "category": "전동기 실습",
    "title": "실습 02. 영구자석을 이용한 직류 전동기",
    "manualPage": "173 ~ 178",
    "goal": "영구자석 계자와 정류자를 갖춘 직류 전동기의 연속 회전 운전 특성과 인가 전압에 따른 속도 변화를 실습한다.",
    "modules": [
      "IEG-6030-06",
      "IEG-6030-08",
      "IEG-6030-10"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "PERM_N",
          "label": "N극"
        },
        "P5": {
          "type": "PERM_S",
          "label": "S극"
        }
      },
      "beltInstalled": false,
      "machine": {
        "type": "PM_DC_MOTOR"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_6V"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_IN4"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_5"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_6"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_POS"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_5A"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_COM"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_NEG"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_10V"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "V_COM"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "전원공급기(6V 탭 → 4번, 5–6번 점퍼) DC(+) → 직류 전류계 5A → A2, B2 → DC(−)로 결선합니다.",
      "전압계 10V–COM을 A2–B2에 연결합니다.",
      "[RUN]으로 운전하여 전압·전류·회전수를 기록합니다.",
      "STOP 후 탭을 12V(→2번)로 바꾸고 전압계를 50V 레인지로 옮겨 다시 측정합니다. (24V 탭 직입은 기동전류가 3A 퓨즈를 초과하므로 금지)"
    ],
    "expectedReadings": {
      "meter": "전동기 속도",
      "value": "6V 탭(DC 7.0V): 약 830rpm, 0.21A / 12V 탭(DC 15.4V): 약 1870rpm, 0.40A — n = (V − Ia·Ra)/kΦ"
    },
    "verify": [
      {
        "key": "rpm",
        "min": 600,
        "max": 2100,
        "label": "전압에 따른 회전"
      }
    ]
  },
  {
    "id": "MOT-03",
    "category": "전동기 실습",
    "title": "실습 03. 계자권선을 이용한 직권 전동기",
    "manualPage": "179 ~ 184",
    "goal": "계자 권선과 전기자 권선을 직렬로 접속한 직권 전동기의 강력한 기동 토크 및 부하에 따른 속도 변화를 관찰한다.",
    "modules": [
      "IEG-6030-02",
      "IEG-6030-06",
      "IEG-6030-08",
      "IEG-6030-10"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "직권 300회"
        },
        "P5": {
          "type": "COIL",
          "label": "직권 300회"
        }
      },
      "beltInstalled": false,
      "machine": {
        "type": "DC_SERIES_MOTOR"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_12V"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_IN2"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_5"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_6"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_POS"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_5A"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_COM"
        },
        "to": {
          "moduleId": "IEG-6030-02",
          "terminalId": "T1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-02",
          "terminalId": "T2"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_NEG"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "계자권선/300회(직권 계자, C1–D1)와 전기자(A2–B2)를 직렬로 결선하고, 기동저항기(02)와 직류 전류계 5A를 직렬로 넣습니다.",
      "전원공급기 12V 탭 → 2번, 5–6번 점퍼 (DC 약 15.5V).",
      "기동저항 50Ω(최대)에서 [RUN] → 기동전류와 회전수를 측정합니다.",
      "기동저항을 서서히 0Ω까지 줄이며 속도가 급상승하는 직권 특성을 관찰합니다.",
      "전기자 결선(A2↔B2)만 바꾸면 역회전, 계자와 전기자를 모두 바꾸면 회전방향이 변하지 않음을 확인합니다."
    ],
    "expectedReadings": {
      "meter": "직권 전동기",
      "value": "기동저항 50Ω: 기동전류 0.26A, 약 670rpm → 0Ω: 약 1320rpm (직입 기동전류 약 1.4A)"
    },
    "verify": [
      {
        "key": "rpm",
        "min": 300,
        "max": 1600,
        "label": "직권 전동기 회전"
      }
    ]
  },
  {
    "id": "MOT-04",
    "category": "전동기 실습",
    "title": "실습 04. 직류 복권 전동기 (가동 복권)",
    "manualPage": "185 ~ 190",
    "goal": "분권 계자권선과 직권 계자권선을 모두 구비한 가동 복권 전동기의 결선법과 운전 특성을 습득한다.",
    "modules": [
      "IEG-6030-01",
      "IEG-6030-02",
      "IEG-6030-06",
      "IEG-6030-08",
      "IEG-6030-10"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "직권 300회"
        },
        "P5": {
          "type": "COIL",
          "label": "분권 700회"
        }
      },
      "beltInstalled": false,
      "machine": {
        "type": "DC_COMPOUND_MOTOR"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_12V"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_IN2"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_5"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_6"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_POS"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_5A"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_COM"
        },
        "to": {
          "moduleId": "IEG-6030-02",
          "terminalId": "T1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-02",
          "terminalId": "T2"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "E1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "E2"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_NEG"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_POS"
        },
        "to": {
          "moduleId": "IEG-6030-01",
          "terminalId": "T1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-01",
          "terminalId": "T2"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_NEG"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "분권 계자(700회, C1–D1)는 계자저항기(01)를 거쳐 DC 전원에 병렬로, 직권 계자(300회, E1→E2)는 기동저항기(02)·전류계와 함께 전기자(A2–B2)에 직렬로 결선합니다 (가동 복권: 두 계자의 자속이 합쳐지는 방향).",
      "계자저항 20Ω, 기동저항 50Ω(최대)에서 [RUN]합니다.",
      "기동저항을 0Ω까지 줄여 정상 운전 속도와 전기자 전류를 기록합니다.",
      "계자저항을 증가시키면 자속 감소로 속도가 상승(약계자 제어)함을 확인합니다."
    ],
    "expectedReadings": {
      "meter": "가동 복권",
      "value": "기동저항 0Ω, 계자저항 20Ω: 약 660rpm → 계자저항 100Ω: 약 940rpm (N = (V − IaRa)/KΦ)"
    },
    "presets": {
      "IEG-6030-01": {
        "R_FIELD": 20
      }
    },
    "verify": [
      {
        "key": "rpm",
        "min": 400,
        "max": 1200,
        "label": "복권 전동기 회전"
      }
    ]
  },
  {
    "id": "MOT-05",
    "category": "전동기 실습",
    "title": "실습 05. 직류 복권 전동기 (차동 복권)",
    "manualPage": "191 ~ 198",
    "goal": "직권 계자권선의 자속이 분권 계자의 자속을 감쇄시키는 차동 복권 결선 시의 속도 및 기동 불안정 현상을 실습한다.",
    "modules": [
      "IEG-6030-01",
      "IEG-6030-02",
      "IEG-6030-06",
      "IEG-6030-08",
      "IEG-6030-10"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "직권 300회"
        },
        "P5": {
          "type": "COIL",
          "label": "분권 700회"
        }
      },
      "beltInstalled": false,
      "machine": {
        "type": "DC_COMPOUND_MOTOR"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_12V"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_IN2"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_5"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "RECT_6"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_POS"
        },
        "to": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_5A"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-08",
          "terminalId": "A_COM"
        },
        "to": {
          "moduleId": "IEG-6030-02",
          "terminalId": "T1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-02",
          "terminalId": "T2"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "E2"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "E1"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_NEG"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_POS"
        },
        "to": {
          "moduleId": "IEG-6030-01",
          "terminalId": "T1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-01",
          "terminalId": "T2"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "DC_NEG"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "실습 04와 같이 결선하되 직권 계자를 반대(E2→E1)로 연결하여 차동 복권으로 만듭니다.",
      "기동저항 50Ω(최대)에서 [RUN] → 정상 방향으로 약 590rpm 운전됨을 확인합니다.",
      "STOP 후 기동저항을 0Ω으로 두고 다시 [RUN](직입 기동)하면 큰 기동전류에 의한 직권 계자 기자력이 분권 자속을 상쇄하여, 역회전·고속으로 불안정해지는 현상을 관찰합니다."
    ],
    "expectedReadings": {
      "meter": "차동 복권",
      "value": "기동저항 50Ω: 약 590rpm (CW) → 기동저항 0Ω로 직입 기동 시 합성 자속 상쇄로 역회전 약 1840rpm·전류 0.72A (불안정)"
    },
    "presets": {
      "IEG-6030-01": {
        "R_FIELD": 20
      }
    },
    "verify": [
      {
        "key": "rpm",
        "min": 300,
        "max": 2000,
        "label": "차동 복권 회전"
      }
    ]
  },
  {
    "id": "MOT-06",
    "category": "전동기 실습",
    "title": "실습 06. 교류 정류자 전동기 (만능 전동기)",
    "manualPage": "199 ~ 204",
    "goal": "교류 전원으로도 직류 직권 전동기와 동일한 방향의 토크를 발생시켜 동작하는 만능 전동기(Universal Motor)의 특성을 실습한다.",
    "modules": [
      "IEG-6030-06",
      "IEG-6030-07",
      "IEG-6030-10"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "직권 300회"
        },
        "P5": {
          "type": "COIL",
          "label": "직권 300회"
        }
      },
      "beltInstalled": false,
      "machine": {
        "type": "UNIVERSAL_MOTOR"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_24V"
        },
        "to": {
          "moduleId": "IEG-6030-07",
          "terminalId": "A_5A"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-07",
          "terminalId": "A_COM"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_0V"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "직권 결선(계자 C1–D1 → 전기자 A2–B2) 상태에서 전원공급기 AC 24V 탭 → 교류 전류계 5A → C1, B2 → 0V로 결선합니다.",
      "[RUN]으로 교류를 투입하여 전동기가 한 방향으로 연속 회전하는지 확인합니다.",
      "전원의 극성(결선)을 바꾸어도 전류와 자속이 동시에 반전되어 회전방향이 유지됨을 확인합니다."
    ],
    "expectedReadings": {
      "meter": "교류 정류자 전동기",
      "value": "AC 24V: 약 1910rpm, 0.27A — 극성과 무관하게 동일 방향 회전"
    },
    "verify": [
      {
        "key": "rpm",
        "min": 1000,
        "max": 2200,
        "label": "만능 전동기 회전"
      }
    ]
  },
  {
    "id": "MOT-07",
    "category": "전동기 실습",
    "title": "실습 07. 3상 유도 전동기의 회전자계",
    "manualPage": "205 ~ 212",
    "goal": "고정자에 120° 위상차를 갖는 3상 교류를 인가했을 때 원형 회전 자계(Rotating Magnetic Field)가 형성되는 것을 관찰한다.",
    "modules": [
      "IEG-6030-10",
      "IEG-6030-12"
    ],
    "assemblyConfig": {
      "rotor": "SQUIRREL_CAGE",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "U"
        },
        "P4": {
          "type": "COIL",
          "label": "V"
        },
        "P7": {
          "type": "COIL",
          "label": "W"
        }
      },
      "beltInstalled": false,
      "machine": {
        "type": "INDUCTION_3PH"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-12",
          "terminalId": "UA"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-12",
          "terminalId": "VA"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B1"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-12",
          "terminalId": "WA"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#d97706"
      }
    ],
    "procedure": [
      "극수 전환기(12) 출력 Ua·Va·Wa를 계철 프레임 3상 권선 A1·B1·C1(P1·P4·P7 코일, 성형 결선)에 결선합니다. (시뮬레이터는 극수 전환기의 R·S·T에 60Hz 3상 전원이 공급된 것으로 가정)",
      "농형 회전자를 결합하고 [RUN] → 극수 전환 스위치가 LOW(Δ, 4극)로 전환되어 회전자계가 형성됩니다.",
      "동기속도 Ns = 120f/P와 실제 회전수(슬립)를 비교합니다."
    ],
    "expectedReadings": {
      "meter": "회전자계",
      "value": "4극: Ns = 120×60/4 = 1800rpm, 회전자 약 1740rpm (s = 3.3%)"
    },
    "verify": [
      {
        "key": "rpm",
        "min": 1650,
        "max": 1800,
        "label": "회전자계에 의한 회전"
      }
    ]
  },
  {
    "id": "MOT-08",
    "category": "전동기 실습",
    "title": "실습 08. 농형 유도 전동기",
    "manualPage": "213 ~ 220",
    "goal": "농형 회전자(Squirrel-cage Rotor)를 조립하여 3상 회전자계에 의해 슬립(Slip)을 동반한 유도 전동기 회전을 실습한다.",
    "modules": [
      "IEG-6030-10",
      "IEG-6030-12"
    ],
    "assemblyConfig": {
      "rotor": "SQUIRREL_CAGE",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "U"
        },
        "P4": {
          "type": "COIL",
          "label": "V"
        },
        "P7": {
          "type": "COIL",
          "label": "W"
        }
      },
      "beltInstalled": false,
      "machine": {
        "type": "INDUCTION_3PH"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-12",
          "terminalId": "UA"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-12",
          "terminalId": "VA"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B1"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-12",
          "terminalId": "WA"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#d97706"
      }
    ],
    "procedure": [
      "농형 회전자를 계철 프레임 중심축에 결합합니다.",
      "극수 전환기 Ua·Va·Wa → A1·B1·C1으로 3상 결선하고 [RUN]합니다 (내장 3상 60Hz 전원 가정).",
      "정격 회전수와 슬립을 측정합니다.",
      "STOP 후 2선(예: Ua↔Va)의 결선을 서로 바꾸어 역회전을 확인합니다."
    ],
    "expectedReadings": {
      "meter": "유도 전동기 속도",
      "value": "약 1740rpm (s = (1800−1740)/1800 = 3.3%), 2선 교체 시 −1740rpm(역회전)"
    },
    "verify": [
      {
        "key": "rpm",
        "min": 1650,
        "max": 1800,
        "label": "유도전동기 정격 회전"
      }
    ]
  },
  {
    "id": "MOT-09",
    "category": "전동기 실습",
    "title": "실습 09. 유도 전동기의 2단 속도 제어",
    "manualPage": "221 ~ 228",
    "goal": "극수 전환기(Pole Changing Unit) 모듈을 조작하여 고정자 극수를 2극 및 4극으로 절환함으로써 속도를 2배로 제어한다.",
    "modules": [
      "IEG-6030-10",
      "IEG-6030-12"
    ],
    "assemblyConfig": {
      "rotor": "SQUIRREL_CAGE",
      "poles": {
        "P1": {
          "type": "COIL",
          "label": "U"
        },
        "P4": {
          "type": "COIL",
          "label": "V"
        },
        "P7": {
          "type": "COIL",
          "label": "W"
        }
      },
      "beltInstalled": false,
      "machine": {
        "type": "INDUCTION_3PH"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-12",
          "terminalId": "UA"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A1"
        },
        "color": "#dc2626"
      },
      {
        "from": {
          "moduleId": "IEG-6030-12",
          "terminalId": "VA"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B1"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-12",
          "terminalId": "WA"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#d97706"
      }
    ],
    "procedure": [
      "극수 전환기 Ua·Va·Wa → A1·B1·C1으로 결선하고 농형 회전자를 결합합니다.",
      "[RUN] → LOW(Δ, 4극)에서 회전수를 측정합니다.",
      "극수 전환 스위치를 클릭하여 STOP을 거쳐 HIGH(YY, 2극)로 전환하고 회전수가 약 2배로 증가함을 확인합니다."
    ],
    "expectedReadings": {
      "meter": "2단 변속",
      "value": "LOW 4극: Ns 1800 → 1740rpm ↔ HIGH 2극: Ns 3600 → 3450rpm"
    },
    "verify": [
      {
        "key": "rpm",
        "min": 1650,
        "max": 3600,
        "label": "극수 전환 운전"
      }
    ]
  },
  {
    "id": "MOT-10",
    "category": "전동기 실습",
    "title": "실습 10. 반발 전동기 (Repulsion Motor)",
    "manualPage": "229 ~ 235",
    "goal": "단상 교류 전원을 고정자에 인가하고 단락된 전기자 브러시 각도를 조절하여 회전 토크를 발생하는 반발 전동기를 실습한다.",
    "modules": [
      "IEG-6030-06",
      "IEG-6030-10"
    ],
    "assemblyConfig": {
      "rotor": "DISK_A",
      "beltInstalled": false,
      "machine": {
        "type": "REPULSION_MOTOR"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_24V"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_0V"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "color": "#212529"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A2"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B2"
        },
        "color": "#10b981"
      }
    ],
    "procedure": [
      "고정자 계자(C1–D1)에 전원공급기 AC 24V 탭과 0V를 결선합니다.",
      "전기자 브러시 양단(A2–B2)을 점퍼선으로 단락합니다.",
      "[RUN]으로 교류를 투입해 반발 토크로 회전하는지 확인하고, 단락선을 제거하면 토크가 사라짐을 확인합니다."
    ],
    "expectedReadings": {
      "meter": "반발 토크",
      "value": "AC 24V, 전기자 단락 시 약 2400rpm / 단락선 제거 시 정지"
    },
    "verify": [
      {
        "key": "rpm",
        "min": 1500,
        "max": 3000,
        "label": "반발 전동기 회전"
      }
    ]
  },
  {
    "id": "MOT-11",
    "category": "전동기 실습",
    "title": "실습 11. 분상 전동기 (Split-Phase Motor)",
    "manualPage": "236 ~ 242",
    "goal": "단상 유도 전동기에서 주권선과 보조권선(기동권선)의 임피던스 차이를 이용해 90° 위상차 분상 자계를 만들어 기동한다.",
    "modules": [
      "IEG-6030-05",
      "IEG-6030-06",
      "IEG-6030-10"
    ],
    "assemblyConfig": {
      "rotor": "SQUIRREL_CAGE",
      "beltInstalled": false,
      "machine": {
        "type": "SPLIT_PHASE_MOTOR"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_24V"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "A1"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_24V"
        },
        "to": {
          "moduleId": "IEG-6030-05",
          "terminalId": "T3"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-05",
          "terminalId": "T6"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "B1"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "to": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_0V"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "주권선(A1–D1)에 AC 24V를, 보조권선(B1–D1)에는 RLC 모듈의 콘덴서(3–6번, 8.5μF, S7 ON)를 직렬로 넣어 같은 전원에 결선합니다. D1은 0V에 연결합니다.",
      "[RUN]으로 전원을 투입하면 주/보조 전류의 위상차(약 100°)로 회전자계가 형성되어 자기 기동하는 것을 관찰합니다.",
      "STOP 후 콘덴서 스위치(S7)를 OFF로 두고 다시 투입하면 보조권선 회로가 열려 기동하지 못함을 확인합니다."
    ],
    "expectedReadings": {
      "meter": "콘덴서 기동",
      "value": "8.5μF 기동: 위상차 약 100° → 자기 기동, 약 3420rpm (2극, s=5%) / 콘덴서 OFF: 기동 불가"
    },
    "presets": {
      "IEG-6030-05": {
        "S7": true
      }
    },
    "verify": [
      {
        "key": "rpm",
        "min": 3000,
        "max": 3600,
        "label": "단상 유도전동기 기동"
      }
    ]
  },
  {
    "id": "MOT-12",
    "category": "전동기 실습",
    "title": "실습 12. 세이딩 코일형 전동기 (Shaded-Pole Motor)",
    "manualPage": "243 ~ 250",
    "goal": "자극의 일부에 동선(세이딩 코일)을 감아 자속의 위상 지연을 유도하여 기동 회전자계를 만드는 구조를 실습한다.",
    "modules": [
      "IEG-6030-06",
      "IEG-6030-10"
    ],
    "assemblyConfig": {
      "rotor": "SQUIRREL_CAGE",
      "beltInstalled": false,
      "machine": {
        "type": "SHADED_POLE_MOTOR"
      }
    },
    "targetWires": [
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_24V"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "C1"
        },
        "color": "#2563eb"
      },
      {
        "from": {
          "moduleId": "IEG-6030-06",
          "terminalId": "AC_0V"
        },
        "to": {
          "moduleId": "IEG-6030-10",
          "terminalId": "D1"
        },
        "color": "#212529"
      }
    ],
    "procedure": [
      "셰이딩 코일이 장착된 자극을 설치하고 농형 회전자를 결합합니다.",
      "자극 권선(C1–D1)에 AC 24V 탭과 0V를 결선합니다.",
      "[RUN]으로 교류를 가하여 주자극 → 셰이딩 자극 방향으로 이동하는 자계에 의해 회전함을 확인합니다."
    ],
    "expectedReadings": {
      "meter": "셰이딩 모터",
      "value": "AC 24V: 약 3060rpm (2극, 슬립 15% — 효율·토크가 작은 소형 팬 모터 특성)"
    },
    "verify": [
      {
        "key": "rpm",
        "min": 2500,
        "max": 3500,
        "label": "셰이딩 코일 전동기 회전"
      }
    ]
  }
];
