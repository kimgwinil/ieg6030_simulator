/**
 * IEG-6030 전기기계 구조 실습장비 - 매뉴얼 기반 심층 이론 및 전 부품 상세 해설
 * 매뉴얼 전 과정(기초 이론, 부품 구조, 직류기, 동기기, 유도기) 충실 수록
 */

export const THEORY_DATA = [
  {
    id: 'th_modules',
    category: '실습장비 부품 구조 해설',
    title: '0. IEG-6030 실습 모듈(1번~12번) 및 부속 장치 상세 구조',
    summary: '실습장비를 구성하는 12개 전 모듈의 사양, 내부 원리, 단자대 기능 및 결선 주의사항',
    content: `
      <h3>1) 12개 실습 모듈별 상세 사양 및 내부 구조</h3>
      <div class="module-spec-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:14px; margin: 16px 0;">
        <div class="guide-card" style="background:#1e293b; border:1px solid #334155;">
          <h4 style="color:#38bdf8;">IEG-6030-01 계자 가변저항기 (Field Rheostat)</h4>
          <p style="font-size:12.5px; color:#cbd5e1; line-height:1.6;">
            <strong>정격 사양:</strong> 0 ~ 300Ω, 300W 대용량 권선형 가변저항기<br>
            <strong>구조 및 기능:</strong> 세라믹 보빈에 권선된 저항체 위를 슬라이더 브러시가 이동하며 저항값을 연속 가변합니다. 분권 발전기 및 타여자 발전기의 계자 회로에 직렬로 연결되어 여자 전류(\(I_f\))를 정밀 제어하여 무부하 유도 기전력 및 단자 전압을 확립하고 조정합니다.<br>
            <strong>단자 구성:</strong> 1번(시작단), 2번(가변 슬라이더 접점), 3번(종단). 가변 저항으로 사용 시 1-2번 또는 2-3번 단자를 사용합니다.
          </p>
        </div>

        <div class="guide-card" style="background:#1e293b; border:1px solid #334155;">
          <h4 style="color:#38bdf8;">IEG-6030-02 기동 가변저항기 (Starting Rheostat)</h4>
          <p style="font-size:12.5px; color:#cbd5e1; line-height:1.6;">
            <strong>정격 사양:</strong> 0 ~ 50Ω 다단계 탭 권선형 저항기, 과전류 보호 접점 내장<br>
            <strong>구조 및 기능:</strong> 직류 전동기는 정지 상태에서 역기전력이 0V(\(E_c = 0\))이므로 전원을 직접 인가하면 수십 배의 위험한 기동 대전류(\(I_s = V / R_a\))가 흘러 권선이 소손됩니다. 기동 시에는 저항을 최대로 투입하여 기동 전류를 정격의 1.5~2배 이내로 제한하고, 회전 속도가 상승함에 따라 단계적으로 저항을 절체하여 운전 상태로 전환합니다.
          </p>
        </div>

        <div class="guide-card" style="background:#1e293b; border:1px solid #334155;">
          <h4 style="color:#38bdf8;">IEG-6030-03 AC/DC 부하 장치 (Load Unit)</h4>
          <p style="font-size:12.5px; color:#cbd5e1; line-height:1.6;">
            <strong>정격 사양:</strong> 백열 램프 100W × 3구 (독립 토글스위치 3개 장착)<br>
            <strong>구조 및 기능:</strong> 직류 발전기 및 단상 교류 발전기의 외부 부하 특성 시험에 사용됩니다. 3개의 램프를 병렬로 투입할 때마다 부하 저항이 감소하여 부하 전류(\(I_L\))가 0A \(\to\) 0.5A \(\to\) 1.0A \(\to\) 1.5A로 단계별 증가하며, 이에 따른 단자 전압 강하와 전기자 반작용 효과를 직관적인 램프 발광 밝기와 메타 지침으로 관측할 수 있습니다.
          </p>
        </div>

        <div class="guide-card" style="background:#1e293b; border:1px solid #334155;">
          <h4 style="color:#38bdf8;">IEG-6030-04 3상 부하 장치 (3-Phase Load Unit)</h4>
          <p style="font-size:12.5px; color:#cbd5e1; line-height:1.6;">
            <strong>정격 사양:</strong> R, S, T 각 상 100W 램프 부하 세트 (3상 평형 부하)<br>
            <strong>구조 및 기능:</strong> 3상 동기 발전기의 부하 시험을 위한 장치로, Y(성형) 결선 또는 \(\Delta\)(델타) 결선 부하 회로를 구성할 수 있습니다. 각 상의 전류와 중성선 전류를 측정하여 3상 평형 운전 특성과 비평형 부하 시의 전압 왜곡을 검증합니다.
          </p>
        </div>

        <div class="guide-card" style="background:#1e293b; border:1px solid #334155;">
          <h4 style="color:#38bdf8;">IEG-6030-05 가변 RLC 부하 장치 (RLC Load Unit)</h4>
          <p style="font-size:12.5px; color:#cbd5e1; line-height:1.6;">
            <strong>정격 사양:</strong> R(순저항 부하), L(철심 인덕터 유도성 리액턴스), C(진상 커패시터)<br>
            <strong>구조 및 기능:</strong> 교류 동기 발전기의 역률(\(\cos\theta\)) 변화에 따른 단자 전압 특성을 실습합니다. 지상 역률(L 부하) 투입 시 감자 작용으로 단자 전압이 급격히 강하하고, 진상 역률(C 부하) 투입 시 증자 작용(페란티 효과)으로 단자 전압이 상승하는 전기자 반작용 현상을 규명합니다.
          </p>
        </div>

        <div class="guide-card" style="background:#1e293b; border:1px solid #334155;">
          <h4 style="color:#38bdf8;">IEG-6030-06 전원 공급 장치 (Power Supply Unit)</h4>
          <p style="font-size:12.5px; color:#cbd5e1; line-height:1.6;">
            <strong>정격 사양:</strong> 단상 AC 220V 입력 / DC 100V 고정 출력(단자 1-2) / DC 0~120V 가변 출력(단자 3-4)<br>
            <strong>구조 및 기능:</strong> 실습 장비의 주 전원 공급원입니다. 고정 직류 전원은 구동 모터 전원 및 여자 코일 전원으로 활용되며, 슬라이닥스 기반의 가변 직류 전원은 타여자 발전기의 여자 전압 제어 및 전동기 속도 조절 전원으로 사용됩니다. 전면 배선용 차단기(NFB)와 전원 표시 램프가 탑재되어 있습니다.
          </p>
        </div>

        <div class="guide-card" style="background:#1e293b; border:1px solid #334155;">
          <h4 style="color:#38bdf8;">IEG-6030-07 교류 전압/전류계 (AC Meter)</h4>
          <p style="font-size:12.5px; color:#cbd5e1; line-height:1.6;">
            <strong>정격 사양:</strong> AC 0 ~ 300V / AC 0 ~ 5A 디지털 멀티메타 (주파수 Hz 동시 측정)<br>
            <strong>구조 및 기능:</strong> 3상 동기 발전기의 선간 전압(\(V_L\)), 상 전압(\(V_p\)), 부하 전류 및 발전 주파수를 정밀 계측합니다. 캠스위치를 통해 R-S, S-T, T-R 간의 전압을 순차 전환 측정할 수 있습니다.
          </p>
        </div>

        <div class="guide-card" style="background:#1e293b; border:1px solid #334155;">
          <h4 style="color:#38bdf8;">IEG-6030-08 직류 전압/전류계 (DC Meter)</h4>
          <p style="font-size:12.5px; color:#cbd5e1; line-height:1.6;">
            <strong>정격 사양:</strong> DC 0 ~ 150V 전압계(상단), DC 0 ~ 3A 전류계(하단) 가동 코일형 듀얼 아날로그 미터<br>
            <strong>구조 및 기능:</strong> 영구자석 가동코일형(PMMC) 계측기로 직류 평균값을 지침의 각도로 직관 표시합니다. 직류 발전기의 전기자 출력 전압과 부하 전류를 실시간 모니터링합니다.
          </p>
        </div>

        <div class="guide-card" style="background:#1e293b; border:1px solid #334155;">
          <h4 style="color:#38bdf8;">IEG-6030-09 직류 검류계 (DC Galvanometer)</h4>
          <p style="font-size:12.5px; color:#cbd5e1; line-height:1.6;">
            <strong>정격 사양:</strong> Center-Zero (-50 ~ 0 ~ +50 µA/mV) 고감도 센터 영점 지침계<br>
            <strong>구조 및 기능:</strong> 코일이 자속을 끊을 때 유도되는 미세 기전력의 극성(+ 또는 -)을 검출합니다. 플레밍의 오른손 법칙 및 렌츠의 법칙 검증 시 회전 방향과 자극 극성에 따른 기전력의 방향 변화를 확인합니다.
          </p>
        </div>

        <div class="guide-card" style="background:#1e293b; border:1px solid #334155;">
          <h4 style="color:#38bdf8;">IEG-6030-10 계철 프레임 모듈 (Field Frame Module)</h4>
          <p style="font-size:12.5px; color:#cbd5e1; line-height:1.6;">
            <strong>정격 사양:</strong> Φ190 고투자율 규소강 원형 계철, 8개 자극 슬롯(P1~P8), 외부 단자대 5조(A1-A2 ~ E1-E2)<br>
            <strong>구조 및 기능:</strong> 전기기계의 회전자와 계자극을 자유자재로 조립하는 핵심 기계 프레임입니다. 회전자를 지지하는 정밀 베어링 축과 카본 브러시 홀더 가이드가 구비되어 직류기, 동기기, 유도기 구조를 모듈러 방식으로 직접 조립 실습할 수 있습니다.
          </p>
        </div>

        <div class="guide-card" style="background:#1e293b; border:1px solid #334155;">
          <h4 style="color:#38bdf8;">IEG-6030-11 자동 구동 장치 (Auto Driving Unit)</h4>
          <p style="font-size:12.5px; color:#cbd5e1; line-height:1.6;">
            <strong>정격 사양:</strong> DC 90V 0.4A 3000RPM 원동기 모터, PWM 전자식 속도 조절기, 4자리 디지털 RPM 미터<br>
            <strong>구조 및 기능:</strong> 발전기 실습 시 기계적 동력을 공급하는 원동기(Prime Mover) 역할을 수행합니다. 우측 풀리에 구동 벨트를 연결하여 10번 프레임의 발전기 축을 회전시키며, SPEED 노브로 0~3500 RPM까지 무단 연속 속도 조절이 가능합니다.
          </p>
        </div>

        <div class="guide-card" style="background:#1e293b; border:1px solid #334155;">
          <h4 style="color:#38bdf8;">IEG-6030-12 극수 변환 제어기 (Pole Changing Controller)</h4>
          <p style="font-size:12.5px; color:#cbd5e1; line-height:1.6;">
            <strong>정격 사양:</strong> 2극(2P), 4극(4P), 6극(6P), 8극(8P) 계자 코일 극성 절환 스위치<br>
            <strong>구조 및 기능:</strong> 8개의 자극 코일에 인가되는 전류 방향을 절환하여 유효 자극 수를 변환합니다. 교류 전원의 주파수가 일정할 때 극수(\(P\))를 변경하여 동기 회전 속도(\(N_s = 120f / P\))를 제어하는 원리를 실습합니다.
          </p>
        </div>
      </div>

      <h3>2) 기계 조립 부속품 상세 구조</h3>
      <ul>
        <li><strong>Disk-A (단락 환 슬롯 회전자):</strong> 황동 디스크 원판에 8개 슬롯 권선이 장착된 기본 직류/교류 전기자 회전자.</li>
        <li><strong>Disk-B (다권선 정류자 회전자):</strong> 세밀한 분할 정류자편과 정밀 전기자 코일이 권선되어 리플이 적은 직류 기전력을 인출하는 정밀 회전자.</li>
        <li><strong>농형 회전자 (Squirrel Cage Rotor):</strong> 양단이 단락 환(End Ring)으로 연결된 구리/알루미늄 도체 바 구조로, 3상 유도 전동기 원리 실습에 사용.</li>
        <li><strong>돌극형 전자석 회전자 (Salient Pole Rotor):</strong> 돌출된 자극 철심에 계자 권선이 감겨 직류 여자 시 강력한 전자석 N/S극을 형성하는 동기기용 회전자.</li>
        <li><strong>계자 자극 세트:</strong> 영구자석 자극(적색 N극, 청색 S극) 및 100T/300T/1300T 권선형 전자석 자극 코일.</li>
      </ul>
    `
  },
  {
    id: 'th_01',
    category: '발전기 기본 이론',
    title: '1. 발전기의 기본 원리 및 유도 기전력 공식',
    summary: '패러데이 전자유도 법칙, 렌츠의 법칙, 플레밍의 오른손 법칙 및 기전력 유도 수식',
    content: `
      <h3>1) 전자기 유도 현상과 기본 법칙</h3>
      <p>발전기(Generator)는 기계적 회전 에너지를 전자기 유도 현상을 통해 전기 에너지로 변환하는 기기입니다.</p>
      <ul>
        <li><strong>패러데이의 전자유도 법칙 (Faraday's Law):</strong> 자계 내에서 코일이 쇄교하는 자속(\(\Phi\))이 시간에 따라 변화할 때, 코일 양단에 자속 변화율에 비례하는 유도 기전력이 발생합니다.
          <div class="formula-box">\( e = -N \frac{d\Phi}{dt} \quad [V] \)</div>
        </li>
        <li><strong>렌츠의 법칙 (Lenz's Law):</strong> 유도 기전력에 의해 흐르는 유도 전류의 방향은 항상 자속의 변화를 방해하려는 방향으로 형성됩니다 (식의 음의 부호 \(-\)의 물리적 의미).</li>
        <li><strong>플레밍의 오른손 법칙 (Fleming's Right-Hand Rule):</strong> 자기장 속에서 도체가 운동할 때 도체 내부에 발생하는 유도 기전력과 유도 전류의 방향을 결정합니다 (우발좌동: 오른손은 발전기, 왼손은 전동기).
          <ul>
            <li><strong>엄지 (Thumb):</strong> 도체의 운동 방향 (\(\vec{v}\))</li>
            <li><strong>검지 (Index):</strong> 자기장의 방향 (\(\vec{B}\), N \(\to\) S)</li>
            <li><strong>중지 (Middle):</strong> 유도 기전력 및 유도 전류의 방향 (\(\vec{e}\))</li>
          </ul>
          <div class="formula-box">\( e = B \cdot l \cdot v \cdot \sin\theta \quad [V] \)</div>
          (여기서 \(B\): 자속밀도 [\(Wb/m^2\)], \(l\): 도체의 유효 길이 [\(m\)], \(v\): 도체의 이동 속도 [\(m/s\)], \(\theta\): 도체 운동 방향과 자속선 사이의 각도)
        </li>
      </ul>

      <h3>2) 교류 기전력의 정현파 생성과 직류 정류 원리</h3>
      <p>균일한 자계 속에서 1턴 코일이 각속도 \(\omega = 2\pi n\) [rad/s]으로 회전하면 시간에 따라 쇄교 면적이 변화하여 <strong>정현파 교류 기전력 \(e(t) = E_m \sin(\omega t)\)</strong>이 발생합니다.</p>
      <ul>
        <li><strong>교류 발전기:</strong> 코일 양단을 연속된 원형 <strong>슬립링(Slip Ring)</strong>에 연결하여 브러시를 통해 인출하면 외부 회로에 교류(AC)가 공급됩니다.</li>
        <li><strong>직류 발전기:</strong> 코일 양단을 반원형 <strong>정류자편(Commutator Segments)</strong>에 연결하면, 기전력의 방향이 반전되는 순간 브러시 접촉면이 교번되어 외부 회로에는 항상 한 방향으로 흐르는 맥동 직류(Pulsating DC)가 인출됩니다.</li>
      </ul>
    `
  },
  {
    id: 'th_02',
    category: '직류 발전기 이론',
    title: '2. 직류 발전기의 여자 방식 및 전압 확립 메커니즘',
    summary: '타여자, 자여자(분권/직권/복권) 발전기 분류 및 잔류자기를 통한 전압 확립 3대 조건',
    content: `
      <h3>1) 여자(Excitation) 방식에 따른 발전기 분류</h3>
      <p>계자 권선에 자속을 형성하기 위한 여자 전류(\(I_f\))를 공급하는 방식에 따라 다음과 같이 분류됩니다:</p>
      <ul>
        <li><strong>타여자 발전기 (Separately-Excited Generator):</strong> 외부의 독립된 직류 전원(배터리, 정류기)으로부터 계자 권선에 전류를 공급하는 방식. 전기자 부하 전류와 계자 전류가 서로 독립적이므로 단자 전압 제어가 용이하고 전압 변동이 적습니다.</li>
        <li><strong>자여자 분권 발전기 (Self-Excited Shunt Generator):</strong> 발전기 자체 전기자에서 발생한 전압을 전기자와 병렬로 연결된 계자 권선에 인가하여 여자 전류를 공급하는 방식입니다.</li>
        <li><strong>자여자 직권 발전기 (Series Generator):</strong> 계자 권선이 전기자 권선 및 부하와 직렬로 연결되어, 부하 전류가 곧 계자 전류가 되는 방식입니다.</li>
        <li><strong>복권 발전기 (Compound Generator):</strong> 분권 계자 권선과 직권 계자 권선을 함께 구비하여 부하 증가 시 직권 코일의 자속 보상으로 전압 강하를 방지하는 방식입니다 (가동 복권, 차동 복권).</li>
      </ul>

      <h3>2) 자여자 분권 발전기의 전압 확립 (Voltage Building-Up) 과정</h3>
      <p>자여자 발전기는 기동 초기 외부 전원이 없음에도 불구하고 스스로 정격 전압을 만들어냅니다. 이 과정을 <strong>전압 확립</strong>이라 하며 다음과 같은 양의 피드백 메커니즘을 거칩니다:</p>
      <ol>
        <li><strong>잔류 자기:</strong> 정지 상태에서도 계자 철심에 남아있는 미약한 잔류 자속(\(\Phi_{res}\))이 존재해야 합니다.</li>
        <li><strong>초기 기전력:</strong> 전기자가 회전하면 잔류 자속을 끊어 약 2~5V 내외의 작은 초기 기전력(\(E_0\))이 유도됩니다.</li>
        <li><strong>여자 전류 공급:</strong> 초기 기전력에 의해 병렬 연결된 계자 권선에 미세한 계자 전류(\(I_f = E_0 / R_f\))가 흐릅니다.</li>
        <li><strong>자속 증강:</strong> 계자 전류가 만드는 자속이 잔류 자속과 같은 방향으로 더해져 총 자속 \(\Phi\)가 증가합니다.</li>
        <li><strong>기전력 급상승:</strong> 증가한 자속에 의해 유도 기전력이 더 커지고, 이는 다시 계자 전류를 증가시키는 급격한 상승 루프가 작동합니다.</li>
        <li><strong>동작점 안정:</strong> 철심이 <strong>자기 포화(Magnetic Saturation)</strong>점에 도달하면 계자 저항선(\(V = I_f \cdot R_f\))과 무부하 포화 곡선이 교차하는 지점에서 안정된 정격 전압이 확립됩니다.</li>
      </ol>

      <div class="formula-box">
        <strong>전압 확립의 3대 필수 조건:</strong><br>
        1. 계자 철심에 잔류 자기(Residual Magnetism)가 존재할 것.<br>
        2. 계자 권선의 접속 극성이 잔류 자기를 강화하는 방향일 것 (회전 방향과 결선 극성 일치).<br>
        3. 계자 회로의 총 저항(\(R_f\))이 <strong>임계 저항(Critical Resistance)</strong>보다 작을 것 (\(R_f < R_c\)).
      </div>
    `
  },
  {
    id: 'th_03',
    category: '직류 발전기 특성',
    title: '3. 무부하 포화 특성 및 외부 부하 특성 곡선',
    summary: '공극선과 자기 포화, 부하 전류 증가 시 전압 강하 원인 및 전압 변동률 수식',
    content: `
      <h3>1) 무부하 포화 곡선 (No-Load Saturation Curve)</h3>
      <p>발전기를 정격 회전수(\(N\))로 일정하게 구동하고 무부하(\(I_L = 0\)) 상태에서 계자 전류(\(I_f\))를 0부터 서서히 증가시킬 때, 단자 유도 기전력(\(E\))의 변화를 나타낸 곡선입니다.</p>
      <ul>
        <li><strong>공극선 (Air Gap Line):</strong> 초기에는 공극의 자기 저항이 지배적이므로 기전력이 계자 전류에 정확히 비례하여 직선적으로 상승합니다.</li>
        <li><strong>포화 영역 (Saturation Region):</strong> 계자 철심의 자기 포화로 인해 자속의 증가율이 둔화되면서 곡선이 완만하게 누워 정격 기전력에 도달합니다.</li>
      </ul>
      <div class="formula-box">
        직류 발전기 총 유도 기전력 공식: 
        \( E = \frac{P \cdot Z}{60 \cdot a} \cdot \Phi \cdot N = K \cdot \Phi \cdot N \quad [V] \)
        <br>(P: 극수, Z: 총 전기자 도체수, a: 병렬 회로수, \(\Phi\): 극당 자속 [Wb], N: 회전수 [RPM])
      </div>

      <h3>2) 외부 부하 특성 곡선 (External Characteristic Curve)</h3>
      <p>회전수와 계자 저항을 일정하게 유지한 상태에서 부하 저항을 감소시켜 부하 전류(\(I_L\))를 증가시킬 때, 단자 전압(\(V\))이 변화하는 관계 곡선입니다.</p>
      <div class="formula-box">\( V = E - I_a R_a - \Delta V_b \quad [V] \)</div>
      <p><strong>부하 증가 시 단자 전압 강하의 3대 요인:</strong></p>
      <ul>
        <li><strong>전기자 권선 내부 저항 강하 (\(I_a \cdot R_a\)):</strong> 부하 전류 증가에 정비례하여 전기자 내부에서 전압 손실 발생.</li>
        <li><strong>전기자 반작용 (Armature Reaction):</strong> 부하 전류가 형성한 자속이 계자 주자속을 깎아먹는 감자 작용으로 인해 유도 기전력 \(E\) 자체가 감소.</li>
        <li><strong>분권 계자 전류 감소:</strong> 단자 전압 \(V\)가 떨어짐에 따라 분권 계자 코일로 유입되는 여자 전류(\(I_f = V / R_f\))가 동반 감소하여 자속이 추가 감소하는 2차 연쇄 전압 강하.</li>
      </ul>
      <div class="formula-box">
        전압 변동률 (Voltage Regulation):
        \( \epsilon = \frac{V_0 - V_n}{V_n} \times 100 \quad [\%] \)
        <br>(\(V_0\): 무부하 단자 전압, \(V_n\): 정격 전부하 단자 전압)
      </div>
    `
  },
  {
    id: 'th_04',
    category: '정류 및 전기자 이론',
    title: '4. 정류 작용과 전기자 반작용 (Armature Reaction)',
    summary: '전기자 전류에 의한 주자속 왜곡, 중성축 이동, 감자/편자 작용 및 보극/보상권선 대책',
    content: `
      <h3>1) 전기자 반작용 (Armature Reaction)의 발생 원리</h3>
      <p>무부하 시에는 계자극에 의한 주자속(\(\Phi_f\))만이 존재하여 자속선이 대칭을 이룹니다. 그러나 부하가 연결되어 전기자 권선에 부하 전류(\(I_a\))가 흐르면, <strong>전기자 권선 자체가 전자석이 되어 독자적인 전기자 자속(\(\Phi_a\))을 발생</strong>시킵니다. 이 전기자 자속이 계자 주자속에 중첩되어 합성 자속의 분포를 심각하게 왜곡시키는 현상을 전기자 반작용이라 합니다.</p>

      <h3>2) 전기자 반작용이 기계에 미치는 영향</h3>
      <ul>
        <li><strong>편자 작용 (Cross-Magnetizing Effect):</strong> 계자극의 한쪽 모서리(발전기 회전 진입측)는 자속이 약해지고, 반대편 모서리(진출측)는 자속이 밀집되어 자속 분포가 심하게 찌그러집니다. 이로 인해 기하학적 중성축에서 <strong>전기적 중성축(Magnetic Neutral Axis)이 회전 방향으로 이동</strong>합니다.</li>
        <li><strong>감자 작용 (Demagnetizing Effect):</strong> 자속이 밀집된 극편 끝단 철심의 자기 포화 현상으로 인해, 밀집에 의한 자속 증가분보다 희박해진 쪽의 자속 감소분이 훨씬 커서 <strong>극당 순 자속 \(\Phi\)가 전체적으로 감소</strong>합니다. 그 결과 유도 기전력 \(E\)가 떨어집니다.</li>
        <li><strong>정류 불량 및 불꽃(Spark) 발생:</strong> 기하학적 중성축에 놓인 브러시 위치에서 권선이 단락될 때 전압이 0이어야 하나, 중성축이 이동하여 브러시가 단락시키는 코일에 유기 기전력이 남아 정류자편 사이에 강한 스파크와 플래시오버(섬락)가 발생합니다.</li>
      </ul>

      <h3>3) 전기자 반작용 방지 대책</h3>
      <ul>
        <li><strong>브러시 이동:</strong> 브러시 홀더를 이동된 새로운 전기적 중성축 위치로 회전 방향(발전기 기준)으로 전진 이동시킵니다.</li>
        <li><strong>보극 (Interpole):</strong> 주자극 사이의 중성축 위치에 작은 자극(보극)을 설치하고 <strong>전기자 권선과 직렬</strong>로 연결하여, 부하 전류 크기에 비례하는 역방향 자속을 실시간 발생시켜 전기자 기전력을 상쇄합니다 (전압 정류).</li>
        <li><strong>보상 권선 (Compensating Winding):</strong> 주자극 표면에 홈(Slot)을 파고 도체를 넣어 <strong>전기자 전류와 반대 방향</strong>의 전류가 흐르도록 전기자와 직렬 연결합니다. 전기자 반작용을 가장 완벽하게 100% 상쇄하는 최고급 대책입니다.</li>
      </ul>
    `
  },
  {
    id: 'th_05',
    category: '직류 전동기 이론',
    title: '5. 직류 전동기의 원리, 역기전력 및 기동 저항기',
    summary: '플레밍의 왼손 법칙, 역기전력과 속도/토크 관계, 과대 기동 전류 방지 메커니즘',
    content: `
      <h3>1) 직류 전동기 회전 토크의 기본 법칙</h3>
      <p>전동기는 전기 에너지를 기계적 회전 에너지로 변환하는 장치입니다.</p>
      <ul>
        <li><strong>플레밍의 왼손 법칙 (Fleming's Left-Hand Rule):</strong> 자기장 속에서 전류가 흐르는 도체가 받는 전자기력(전자력, Lorentz Force)의 방향을 결정합니다.
          <ul>
            <li><strong>엄지 (Thumb):</strong> 도체가 받는 힘/토크의 방향 (\(\vec{F}\))</li>
            <li><strong>검지 (Index):</strong> 자기장의 방향 (\(\vec{B}\))</li>
            <li><strong>중지 (Middle):</strong> 공급 전류의 방향 (\(\vec{I}\))</li>
          </ul>
          <div class="formula-box">\( F = B \cdot I \cdot l \cdot \sin\theta \quad [N] \)</div>
        </li>
        <li><strong>전동기 발생 토크 공식:</strong>
          <div class="formula-box">\( T = \frac{P \cdot Z}{2\pi \cdot a} \cdot \Phi \cdot I_a = K_t \cdot \Phi \cdot I_a \quad [N\cdot m] \)</div>
          (토크는 계자 자속 \(\Phi\)와 전기자 전류 \(I_a\)의 곱에 정비례합니다.)
        </li>
      </ul>

      <h3>2) 역기전력 (Counter EMF)과 전동기 회전 속도</h3>
      <p>전동기 전기자가 회전하면 발전기 원리에 의해 인가 전압 \(V\)와 반대 방향의 <strong>역기전력 \(E_c\)</strong>가 자체 유도됩니다.</p>
      <div class="formula-box">
        \( E_c = K \cdot \Phi \cdot N = V - I_a \cdot R_a \quad [V] \)
      </div>
      <p>이 식을 회전수 \(N\)에 관해 정리하면 직류 전동기 기본 속도 공식이 유도됩니다:</p>
      <div class="formula-box">
        \( N = \frac{V - I_a R_a}{K \cdot \Phi} \quad [RPM] \)
      </div>
      <p><strong>속도 제어 핵심:</strong> 계자 가변저항기(IEG-6030-01)의 저항을 증가시키면 계자 전류 \(I_f\)가 감소하여 자속 \(\Phi\)가 줄어들고, 따라서 <strong>전동기 회전 속도 \(N\)이 상승</strong>합니다 (약계자 속도 제어).</p>

      <h3>3) 기동 가변저항기 (Starting Rheostat)의 필수성</h3>
      <p>전동기가 정지해 있는 기동 순간(\(N = 0\))에는 회전이 없으므로 <strong>역기전력이 0V (\(E_c = 0\))</strong>입니다.</p>
      <div class="formula-box">
        기동 전류: \( I_{start} = \frac{V - 0}{R_a} = \frac{V}{R_a} \)
      </div>
      <p>전기자 권선 저항(\(R_a\))은 수 Ω 이하로 매우 작기 때문에, 기동 저항기 없이 전원을 직접 투입하면 정격 전류의 10~20배에 달하는 위험한 대전류가 흘러 <strong>권선 소손, 정류자 폭발, 차단기 트립</strong>이 발생합니다.</p>
      <p>따라서 기동 시에는 <strong>기동 가변저항기(IEG-6030-02)의 저항을 최대로 삽입</strong>하여 기동 전류를 안전 범위로 억제한 뒤, 전동기가 가속되어 역기전력 \(E_c\)가 충분히 상승함에 따라 단계별로 저항을 차단하여 정상 운전 상태로 진입해야 합니다.</p>
    `
  },
  {
    id: 'th_06',
    category: '교류기 및 동기기 이론',
    title: '6. 교류 동기 발전기 및 3상 유도 전동기 원리',
    summary: '3상 회전자계 생성, 동기 속도 공식 Ns=120f/P, 슬립(Slip)의 정의 및 극수 변환 속도제어',
    content: `
      <h3>1) 3상 교류와 회전자계 (Rotating Magnetic Field)</h3>
      <p>공간적으로 120° 간격으로 배치된 3상 고정자 권선(U-V-W)에 시간적으로 120° 위상차를 갖는 3상 평형 교류 전류를 인가하면, 고정자 내부 공극에 일정한 크기를 유지하면서 일정한 속도로 회전하는 <strong>원형 회전자계</strong>가 합성됩니다.</p>
      <div class="formula-box">
        동기 속도 (Synchronous Speed):
        \( N_s = \frac{120 \cdot f}{P} \quad [RPM] \)
        <br>(\(f\): 전원 주파수 [Hz], \(P\): 계자 극수 [Poles])
        <br>※ 예: 상용 60Hz 전원 기준, 2극기 = 3,600 RPM, 4극기 = 1,800 RPM, 8극기 = 900 RPM
      </div>

      <h3>2) 3상 유도 전동기의 동작 원리와 슬립 (Slip)</h3>
      <p>회전자계 속에 농형 회전자(도체 바가 양단 단락환으로 연결된 원통)를 놓으면, 회전자계의 자속선이 도체 바를 끊으면서 전자유도 법칙에 의해 회전자에 유도 전류가 흐르고, 이 유도 전류와 회전자계 사이의 플레밍 왼손 법칙 전자력에 의해 회전자가 회전자계를 뒤따라 회전합니다 (아라고 원판의 원리).</p>
      <ul>
        <li><strong>슬립 (Slip, \(s\)):</strong> 회전자계의 속도(\(N_s\))와 실제 회전자의 회전 속도(\(N\)) 사이의 상대적인 속도 차 비율을 나타내는 유도 전동기의 핵심 파라미터입니다.
          <div class="formula-box">
            \( s = \frac{N_s - N}{N_s} \quad \Longleftrightarrow \quad N = N_s (1 - s) \quad [RPM] \)
          </div>
        </li>
        <li><strong>슬립의 물리적 범위:</strong>
          <ul>
            <li>정지 상태 (기동 순간): \(N = 0 \implies s = 1\) (100%)</li>
            <li>정상 전부하 운전 시: \(s = 0.02 \sim 0.05\) (2~5% 내외로 동기속도보다 약간 느림)</li>
            <li>이상적 무부하 운전 시: \(s \approx 0 \implies N \approx N_s\)</li>
            <li>※ 회전자가 동기 속도(\(N = N_s\))에 도달하면 자속을 끊을 수 없어 유도 기전력이 0이 되므로 토크가 소멸합니다. 따라서 유도 전동기는 반드시 \(s > 0\)인 비동기 상태에서만 회전 토크를 발생시킵니다.</li>
          </ul>
        </li>
      </ul>

      <h3>3) 극수 변환 제어기 (IEG-6030-12)를 통한 속도 제어</h3>
      <p>교류 전원의 주파수 \(f\)가 60Hz로 고정되어 있을 때, 전동기의 속도를 조절하는 고효율 방식 중 하나가 바로 <strong>극수 변환(Pole Changing)</strong>입니다.</p>
      <p>12번 극수 변환 제어기를 통해 고정자 코일 결선을 변경하여 8극(\(N_s = 900\) RPM) \(\to\) 4극(\(N_s = 1800\) RPM)으로 절환하면, 동기 속도가 2배로 상승하여 모터의 회전 속도를 계단형으로 신속하고 안정되게 제어할 수 있습니다.</p>
    `
  }
];
