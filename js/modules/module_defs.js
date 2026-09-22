/**
 * IEG-6030 전기기계 구조 실습장비 - 모듈 정의 및 정밀 픽셀 좌표 매핑 (12개 전 모듈 캘리브레이션 완료)
 * 원본 사진의 단자 소켓 홀 중심, 노브 회전축, 토글 스위치, 미터 지침 피벗과 1픽셀 단위 정밀 일치
 */

export const MODULE_DEFS = {
  'IEG-6030-01': {
    id: 'IEG-6030-01',
    name: '계자 저항기 모듈',
    enName: 'FIELD RHEOSTAT',
    widthUnits: 1,
    width: 396,
    height: 725,
    aspectRatio: 396 / 725,
    image: 'assets/modules/mod_01_field_rheostat.png',
    spec: '가변저항 : 100W, 100Ω',
    terminals: [
      { id: 'T1', label: '1', x: 18.2, y: 70.6, color: 'black', type: 'terminal' },
      { id: 'T2', label: '2', x: 81.5, y: 70.6, color: 'black', type: 'terminal' },
      { id: 'T3', label: '3', x: 17.9, y: 83.6, color: 'black', type: 'terminal' }
    ],
    controls: [
      {
        id: 'R_FIELD',
        type: 'knob',
        label: 'FIELD CURRENT (0-100Ω)',
        x: 50.0,
        y: 37.9,
        sizePercent: 30.3, // 원본 노브 캡 지름 30.3%
        min: 0,
        max: 100,
        step: 1,
        value: 100,
        unit: 'Ω',
        angleMin: -135,
        angleMax: 135
      }
    ],
    obstacles: [
      { x: 15, y: 18, w: 70, h: 42, desc: 'Knob & Scale' }
    ]
  },

  'IEG-6030-02': {
    id: 'IEG-6030-02',
    name: '기동 저항기 모듈',
    enName: 'STARTING RHEOSTAT',
    widthUnits: 1,
    width: 397,
    height: 709,
    aspectRatio: 397 / 709,
    image: 'assets/modules/mod_02_starting_rheostat.png',
    spec: '가변저항 : 100W, 50Ω',
    terminals: [
      { id: 'T1', label: '1', x: 18.1, y: 71.1, color: 'black', type: 'terminal' },
      { id: 'T2', label: '2', x: 82.6, y: 71.1, color: 'black', type: 'terminal' },
      { id: 'T3', label: '3', x: 18.1, y: 84.1, color: 'black', type: 'terminal' }
    ],
    controls: [
      {
        id: 'R_START',
        type: 'knob',
        label: 'STARTING CURRENT (0-50Ω)',
        x: 50.0,
        y: 37.4,
        sizePercent: 30.0,
        min: 0,
        max: 50,
        step: 0.5,
        value: 50,
        unit: 'Ω',
        angleMin: -135,
        angleMax: 135
      }
    ],
    obstacles: [
      { x: 15, y: 18, w: 70, h: 42, desc: 'Knob & Scale' }
    ]
  },

  'IEG-6030-03': {
    id: 'IEG-6030-03',
    name: '직류기/교류기 부하 모듈',
    enName: 'AC/DC MACHINE LOAD UNIT',
    widthUnits: 1,
    width: 389,
    height: 703,
    aspectRatio: 389 / 703,
    image: 'assets/modules/mod_03_load_unit.png',
    spec: '백열전구 3V, 6V, 12V (3채널)',
    terminals: [
      { id: 'A',  label: 'A',  x: 21.1, y: 16.1, color: 'red',   type: 'terminal' },
      { id: 'B',  label: 'B',  x: 50.1, y: 16.1, color: 'red',   type: 'terminal' },
      { id: 'C',  label: 'C',  x: 79.1, y: 16.1, color: 'red',   type: 'terminal' },
      { id: 'T1', label: '1',  x: 21.1, y: 37.0, color: 'white', type: 'terminal' },
      { id: 'T2', label: '2',  x: 50.1, y: 37.0, color: 'white', type: 'terminal' },
      { id: 'T3', label: '3',  x: 79.1, y: 37.0, color: 'white', type: 'terminal' },
      { id: 'T4', label: '4',  x: 21.1, y: 62.9, color: 'white',  type: 'terminal' },
      { id: 'T5', label: '5',  x: 50.1, y: 62.9, color: 'white',  type: 'terminal' },
      { id: 'T6', label: '6',  x: 79.1, y: 62.9, color: 'white',  type: 'terminal' },
      { id: 'AP', label: "A'", x: 21.1, y: 85.3, color: 'black', type: 'terminal' },
      { id: 'BP', label: "B'", x: 50.1, y: 85.3, color: 'black', type: 'terminal' },
      { id: 'CP', label: "C'", x: 79.1, y: 85.3, color: 'black', type: 'terminal' }
    ],
    lamps: [
      { id: 'L1', label: 'L1', x: 21.1, y: 52.6, rating: 12 },
      { id: 'L2', label: 'L2', x: 50.1, y: 52.6, rating: 12 },
      { id: 'L3', label: 'L3', x: 79.1, y: 52.6, rating: 12 }
    ],
    obstacles: [
      { x: 12, y: 44, w: 76, h: 14, desc: 'Lamps' }
    ]
  },

  'IEG-6030-04': {
    id: 'IEG-6030-04',
    name: '3상 부하 모듈',
    enName: 'THREE-PHASE (Y-Δ) LOAD UNIT',
    widthUnits: 2,
    width: 781,
    height: 709,
    aspectRatio: 781 / 709,
    image: 'assets/modules/mod_04_3phase_load.png',
    spec: '3상 Y-Δ 결선용 램프 6구',
    terminals: [
      { id: 'U',  label: 'U',  x: 49.8, y: 15.4, color: 'red',    type: 'terminal' },
      { id: 'V',  label: 'V',  x: 13.1, y: 86.3, color: 'blue',   type: 'terminal' },
      { id: 'W',  label: 'W',  x: 86.6, y: 86.5, color: 'yellow', type: 'terminal' },
      { id: 'N',  label: 'N',  x: 50.2, y: 62.6, color: 'black',  type: 'terminal' },
      { id: 'T1', label: '1',  x: 36.6, y: 40.6, color: 'white',  type: 'terminal' },
      { id: 'T2', label: '2',  x: 26.4, y: 60.9, color: 'white',  type: 'terminal' },
      { id: 'T3', label: '3',  x: 39.4, y: 86.2, color: 'white',  type: 'terminal' },
      { id: 'T4', label: '4',  x: 60.2, y: 86.2, color: 'white',  type: 'terminal' },
      { id: 'T5', label: '5',  x: 63.3, y: 40.8, color: 'white',  type: 'terminal' },
      { id: 'T6', label: '6',  x: 73.5, y: 60.9, color: 'white',  type: 'terminal' },
      { id: 'T7', label: '7',  x: 23.2, y: 79.5, color: 'white',  type: 'terminal' },
      { id: 'T8', label: '8',  x: 41.4, y: 68.5, color: 'white',  type: 'terminal' },
      { id: 'T9', label: '9',  x: 49.9, y: 28.6, color: 'white',  type: 'terminal' },
      { id: 'T10',label: '10', x: 49.9, y: 51.9, color: 'white',  type: 'terminal' },
      { id: 'T11',label: '11', x: 58.5, y: 68.5, color: 'white',  type: 'terminal' },
      { id: 'T12',label: '12', x: 76.7, y: 79.8, color: 'white',  type: 'terminal' }
    ],
    lamps: [
      { id: 'L1', label: 'L1', x: 31.8, y: 50.6, rating: 12 },
      { id: 'L2', label: 'L2', x: 49.8, y: 86.2, rating: 12 },
      { id: 'L3', label: 'L3', x: 68.2, y: 50.5, rating: 12 },
      { id: 'L4', label: 'L4', x: 49.9, y: 39.8, rating: 12 },
      { id: 'L5', label: 'L5', x: 32.3, y: 73.9, rating: 12 },
      { id: 'L6', label: 'L6', x: 67.5, y: 73.9, rating: 12 }
    ]
  },

  'IEG-6030-05': {
    id: 'IEG-6030-05',
    name: 'R, L, C 부하 모듈',
    enName: 'VARIABLE R/L/C LOAD UNIT',
    widthUnits: 2,
    width: 806,
    height: 722,
    aspectRatio: 806 / 722,
    image: 'assets/modules/mod_05_rlc_load.png',
    spec: 'R: 10,30,50Ω / L: 0.2,0.4,0.8H / C: 8.5μF×3',
    terminals: [
      { id: 'T1', label: '1 (R+)', x: 20.5, y: 17.1, color: 'blue', type: 'terminal' },
      { id: 'T2', label: '2 (L+)', x: 50.0, y: 17.1, color: 'blue', type: 'terminal' },
      { id: 'T3', label: '3 (C+)', x: 79.4, y: 17.2, color: 'blue', type: 'terminal' },
      { id: 'T4', label: '4 (R-)', x: 20.6, y: 82.6, color: 'blue', type: 'terminal' },
      { id: 'T5', label: '5 (L-)', x: 49.8, y: 82.6, color: 'blue', type: 'terminal' },
      { id: 'T6', label: '6 (C-)', x: 79.3, y: 82.7, color: 'blue', type: 'terminal' }
    ],
    switches: [
      { id: 'S1', label: '10Ω',   x: 10.9, y: 33.3, type: 'toggle', value: false },
      { id: 'S2', label: '30Ω',   x: 19.7, y: 33.4, type: 'toggle', value: false },
      { id: 'S3', label: '50Ω',   x: 28.5, y: 33.3, type: 'toggle', value: false },
      { id: 'S4', label: '0.2H',  x: 40.4, y: 33.4, type: 'toggle', value: false },
      { id: 'S5', label: '0.4H',  x: 50.1, y: 33.1, type: 'toggle', value: false },
      { id: 'S6', label: '0.8H',  x: 58.2, y: 33.2, type: 'toggle', value: false },
      { id: 'S7', label: '8.5μF', x: 69.4, y: 32.4, type: 'toggle', value: false },
      { id: 'S8', label: '8.5μF', x: 80.3, y: 33.7, type: 'toggle', value: false },
      { id: 'S9', label: '8.5μF', x: 89.0, y: 33.7, type: 'toggle', value: false }
    ]
  },

  'IEG-6030-06': {
    id: 'IEG-6030-06',
    name: '전원 공급기 모듈',
    enName: 'AC/DC POWER SUPPLY',
    widthUnits: 2,
    width: 803,
    height: 714,
    aspectRatio: 803 / 714,
    image: 'assets/modules/mod_06_power_supply.png',
    spec: 'AC 6,12,24,50V / 브리지 정류 DC / 아날로그 미터 2구',
    terminals: [
      { id: 'AC_50V', label: '50V', x: 43.0, y: 40.9, color: 'green',  type: 'terminal' },
      { id: 'AC_24V', label: '24V', x: 43.0, y: 50.8, color: 'green',  type: 'terminal' },
      { id: 'AC_12V', label: '12V', x: 43.0, y: 60.6, color: 'green',  type: 'terminal' },
      { id: 'AC_6V',  label: '6V',  x: 43.0, y: 70.5, color: 'green',  type: 'terminal' },
      { id: 'AC_0V',  label: '0V',  x: 43.0, y: 80.3, color: 'green',  type: 'terminal' },
      { id: 'AC_IN1', label: '1',   x: 48.7, y: 40.9, color: 'blue',   type: 'terminal' },
      { id: 'AC_IN2', label: '2',   x: 48.6, y: 50.7, color: 'blue',   type: 'terminal' },
      { id: 'AC_IN3', label: '3',   x: 48.6, y: 60.6, color: 'blue',   type: 'terminal' },
      { id: 'AC_IN4', label: '4',   x: 48.7, y: 70.4, color: 'blue',   type: 'terminal' },
      { id: 'RECT_5', label: '5',   x: 58.2, y: 40.8, color: 'blue',   type: 'terminal' },
      { id: 'RECT_6', label: '6',   x: 63.5, y: 40.8, color: 'blue',   type: 'terminal' },
      { id: 'DC_POS', label: '+',   x: 92.6, y: 40.9, color: 'red',    type: 'terminal' },
      { id: 'DC_NEG', label: 'GND', x: 92.7, y: 84.0, color: 'black',  type: 'terminal' }
    ],
    meters: [
      {
        id: 'M_AC_VOLT',
        type: 'digital_panel',
        label: 'AC VOLTMETER',
        unit: 'V',
        x: 41.2,
        y: 15.8,
        w: 22.9,
        h: 19.8,
        minVal: 0,
        maxVal: 80,
        range: '0 ~ 80V',
        theme: 'cyan'
      },
      {
        id: 'M_DC_VOLT',
        type: 'digital_panel',
        label: 'DC VOLTMETER',
        unit: 'V',
        x: 69.9,
        y: 15.8,
        w: 22.9,
        h: 19.8,
        minVal: 0,
        maxVal: 80,
        range: '0 ~ 80V',
        theme: 'cyan'
      }
    ],
    controls: [
      {
        id: 'MAIN_POWER_SW',
        type: 'rocker_switch',
        label: 'POWER SWITCH',
        x: 18.2,
        y: 77.2,
        value: false
      }
    ]
  },

  'IEG-6030-07': {
    id: 'IEG-6030-07',
    name: '교류 전압계/전류계 모듈',
    enName: 'AC VOLT/AMPERE METER',
    widthUnits: 1,
    width: 387,
    height: 701,
    aspectRatio: 387 / 701,
    image: 'assets/modules/mod_07_ac_meter.png',
    spec: 'AC Volt (5/10/50V), AC Amp (100mA/1A/2.5A/5A)',
    terminals: [
      { id: 'V_5V',    label: '5V',    x: 23.6, y: 44.6, color: 'blue',  type: 'terminal' },
      { id: 'V_10V',   label: '10V',   x: 41.2, y: 44.6, color: 'blue',  type: 'terminal' },
      { id: 'V_50V',   label: '50V',   x: 58.8, y: 44.6, color: 'blue',  type: 'terminal' },
      { id: 'V_COM',   label: 'COM',   x: 76.5, y: 44.6, color: 'black', type: 'terminal' },
      { id: 'A_100MA', label: '100mA', x: 23.3, y: 85.8, color: 'blue',  type: 'terminal' },
      { id: 'A_1A',    label: '1A',    x: 36.6, y: 85.8, color: 'blue',  type: 'terminal' },
      { id: 'A_2_5A',  label: '2.5A',  x: 49.9, y: 85.8, color: 'blue',  type: 'terminal' },
      { id: 'A_5A',    label: '5A',    x: 63.2, y: 85.8, color: 'blue',  type: 'terminal' },
      { id: 'A_COM',   label: 'COM',   x: 76.5, y: 85.8, color: 'black', type: 'terminal' }
    ],
    meters: [
      {
        id: 'M_AC_V',
        type: 'digital_panel',
        label: 'AC VOLTMETER',
        unit: 'V',
        x: 20.0,
        y: 12.7,
        w: 60.0,
        h: 26.8,
        minVal: 0,
        maxVal: 50,
        range: '50V F.S.',
        theme: 'cyan'
      },
      {
        id: 'M_AC_A',
        type: 'digital_panel',
        label: 'AC AMMETER',
        unit: 'A',
        x: 20.0,
        y: 54.4,
        w: 60.0,
        h: 26.8,
        minVal: 0,
        maxVal: 5,
        range: '5A F.S.',
        theme: 'green'
      }
    ]
  },

  'IEG-6030-08': {
    id: 'IEG-6030-08',
    name: '직류 전압계/전류계 모듈',
    enName: 'DC VOLT/AMPERE METER',
    widthUnits: 1,
    width: 385,
    height: 704,
    aspectRatio: 385 / 704,
    image: 'assets/modules/mod_08_dc_meter.png',
    spec: 'DC Volt (5/10/50V), DC Amp (100mA/1A/2.5A/5A)',
    terminals: [
      { id: 'V_5V',    label: '5V',    x: 23.6, y: 44.6, color: 'red',   type: 'terminal' },
      { id: 'V_10V',   label: '10V',   x: 41.3, y: 44.6, color: 'red',   type: 'terminal' },
      { id: 'V_50V',   label: '50V',   x: 59.0, y: 44.6, color: 'red',   type: 'terminal' },
      { id: 'V_COM',   label: 'COM',   x: 76.9, y: 44.6, color: 'black', type: 'terminal' },
      { id: 'A_100MA', label: '100mA', x: 23.4, y: 86.0, color: 'red',   type: 'terminal' },
      { id: 'A_1A',    label: '1A',    x: 36.8, y: 86.0, color: 'red',   type: 'terminal' },
      { id: 'A_2_5A',  label: '2.5A',  x: 50.1, y: 86.0, color: 'red',   type: 'terminal' },
      { id: 'A_5A',    label: '5A',    x: 63.5, y: 86.0, color: 'red',   type: 'terminal' },
      { id: 'A_COM',   label: 'COM',   x: 76.9, y: 86.0, color: 'black', type: 'terminal' }
    ],
    meters: [
      {
        id: 'M_DC_V',
        type: 'digital_panel',
        label: 'DC VOLTMETER',
        unit: 'V',
        x: 20.0,
        y: 12.8,
        w: 60.0,
        h: 26.8,
        minVal: 0,
        maxVal: 50,
        range: '50V F.S.',
        theme: 'cyan'
      },
      {
        id: 'M_DC_A',
        type: 'digital_panel',
        label: 'DC AMMETER',
        unit: 'A',
        x: 20.0,
        y: 54.4,
        w: 60.0,
        h: 26.8,
        minVal: 0,
        maxVal: 5,
        range: '5A F.S.',
        theme: 'green'
      }
    ]
  },

  'IEG-6030-09': {
    id: 'IEG-6030-09',
    name: '직류 검류계 모듈',
    enName: 'DC MILLI AMPERE METER',
    widthUnits: 1,
    width: 387,
    height: 696,
    aspectRatio: 387 / 696,
    image: 'assets/modules/mod_09_dc_galvano.png',
    spec: '측정 범위 : ±5mA, ±50mA, ±500mA',
    terminals: [
      { id: 'POS', label: '+', x: 37.0, y: 59.2, color: 'red',   type: 'terminal' },
      { id: 'NEG', label: '-', x: 62.8, y: 59.3, color: 'black', type: 'terminal' }
    ],
    meters: [
      {
        id: 'M_GALVANO',
        type: 'digital_panel',
        label: 'DC MILLIAMMETER',
        unit: 'mA',
        x: 20.0,
        y: 20.8,
        w: 60.0,
        h: 26.9,
        minVal: -500,
        maxVal: 500,
        isBipolar: true,
        range: '±500mA F.S.',
        theme: 'amber'
      }
    ],
    controls: [
      {
        id: 'RANGE_SEL',
        type: 'rotary_3pos',
        label: 'SELECT MODE',
        x: 50.0,
        y: 82.1,
        sizePercent: 17.5,
        options: [
          { label: '±5mA (x1)', value: 5, angle: -45 },
          { label: '±50mA (x10)', value: 50, angle: 0 },
          { label: '±500mA (x100)', value: 500, angle: 45 }
        ],
        selectedIndex: 1
      }
    ]
  },

  'IEG-6030-10': {
    id: 'IEG-6030-10',
    name: '계철 프레임 모듈',
    enName: 'AC/DC MACHINE FIELD FRAME',
    widthUnits: 2,
    width: 776,
    height: 697,
    aspectRatio: 776 / 697,
    image: 'assets/modules/mod_10_field_frame.png',
    spec: 'Φ190 계철 프레임, 8극 슬롯(P1~P8), 단자대 5조',
    terminals: [
      { id: 'A1', label: 'A1', x: 83.4, y: 16.2, color: 'white',  type: 'terminal' },
      { id: 'A2', label: 'A2', x: 92.5, y: 16.2, color: 'white',  type: 'terminal' },
      { id: 'B1', label: 'B1', x: 83.4, y: 24.2, color: 'yellow', type: 'terminal' },
      { id: 'B2', label: 'B2', x: 92.5, y: 24.2, color: 'yellow', type: 'terminal' },
      { id: 'C1', label: 'C1', x: 83.4, y: 69.7, color: 'green',  type: 'terminal' },
      { id: 'C2', label: 'C2', x: 92.7, y: 70.3, color: 'green',  type: 'terminal' },
      { id: 'D1', label: 'D1', x: 83.5, y: 78.1, color: 'blue',   type: 'terminal' },
      { id: 'D2', label: 'D2', x: 92.5, y: 78.0, color: 'blue',   type: 'terminal' },
      { id: 'E1', label: 'E1', x: 83.6, y: 86.4, color: 'black',  type: 'terminal' },
      { id: 'E2', label: 'E2', x: 92.8, y: 86.3, color: 'black',  type: 'terminal' }
    ]
  },

  'IEG-6030-11': {
    id: 'IEG-6030-11',
    name: '구동 전동기 모듈',
    enName: 'AUTO DRIVING UNIT',
    widthUnits: 2,
    width: 532,
    height: 478,
    aspectRatio: 532 / 478,
    image: 'assets/modules/mod_11_auto_driving.png',
    spec: 'DC 모터 90V/0.4A 3000RPM, 속도조절기, 회전수 미터',
    terminals: [],
    meters: [
      {
        id: 'M_RPM',
        type: 'digital',
        label: 'MOTOR RPM METER',
        x: 33.1,
        y: 10.9,
        w: 19.2,
        h: 16.1,
        currentVal: 0,
        unit: 'RPM'
      }
    ],
    controls: [
      {
        id: 'MOTOR_POWER',
        type: 'rocker_switch',
        label: 'POWER',
        x: 18.6,
        y: 76.9,
        value: false
      },
      {
        id: 'MOTOR_SPEED',
        type: 'knob',
        label: 'SPEED REGULATION (0-3500 RPM)',
        x: 46.6,
        y: 75.3,
        sizePercent: 13.9, // 원본 노브 캡 지름 13.9%
        min: 0,
        max: 3500,
        step: 50,
        value: 1800,
        unit: 'RPM',
        angleMin: -135,
        angleMax: 135
      },
      {
        id: 'MOTOR_DIR',
        type: 'cam_switch_3pos',
        label: 'DIRECTION OF ROTATION',
        x: 79.5,
        y: 80.1,
        sizePercent: 10.4, // 원본 로터리 스위치 지름 10.4%
        options: [
          { label: 'CCW', value: 'CCW', angle: -45 },
          { label: 'STOP', value: 'STOP', angle: 0 },
          { label: 'CW', value: 'CW', angle: 45 }
        ],
        selectedIndex: 1
      }
    ]
  },

  'IEG-6030-12': {
    id: 'IEG-6030-12',
    name: '극수 전환기 모듈',
    enName: 'POLE CHANGING UNIT',
    widthUnits: 1,
    width: 401,
    height: 713,
    aspectRatio: 401 / 713,
    image: 'assets/modules/mod_12_pole_changing.png',
    spec: 'Y/Δ 3단 캠 스위치, 극수 전환 제어',
    terminals: [
      { id: 'R',  label: 'R',  x: 16.0, y: 36.9, color: 'red',    type: 'terminal' },
      { id: 'S',  label: 'S',  x: 16.1, y: 47.3, color: 'blue',   type: 'terminal' },
      { id: 'T',  label: 'T',  x: 15.7, y: 57.5, color: 'yellow', type: 'terminal' },
      { id: 'UA', label: 'Ua', x: 72.4, y: 35.1, color: 'red',    type: 'terminal' },
      { id: 'UB', label: 'Ub', x: 84.2, y: 38.7, color: 'red',    type: 'terminal' },
      { id: 'VA', label: 'Va', x: 72.1, y: 44.1, color: 'blue',   type: 'terminal' },
      { id: 'VB', label: 'Vb', x: 84.1, y: 50.1, color: 'blue',   type: 'terminal' },
      { id: 'WA', label: 'Wa', x: 72.0, y: 55.5, color: 'yellow', type: 'terminal' },
      { id: 'WB', label: 'Wb', x: 84.4, y: 60.6, color: 'yellow', type: 'terminal' }
    ],
    controls: [
      {
        id: 'POLE_SW',
        type: 'cam_switch_3pos',
        label: 'POLE CONVERSION SW',
        x: 49.8,
        y: 79.9,
        sizePercent: 21.6,
        options: [
          { label: 'LOW (Δ)', value: 'DELTA', angle: -45 },
          { label: 'STOP', value: 'STOP', angle: 0 },
          { label: 'HIGH (Y)', value: 'Y', angle: 45 }
        ],
        selectedIndex: 1
      }
    ]
  }
};
