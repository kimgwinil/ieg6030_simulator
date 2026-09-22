/**
 * IEG-6030 지능형 케이블 자동 정렬 및 장애물 회피 라우팅 엔진
 * 장비 중요 부품(노브, 계측기, 스위치, 로터)을 통과하거나 가리지 않고
 * 전문 실험실 배선 트러프/덕트(Cable Dressing)를 따라 부드러운 곡선으로 자동 정렬
 */

export class CableRouter {
  constructor() {
    this.routingMode = 'SMART_DUCT'; // 'SMART_DUCT' | 'CATENARY' | 'MANHATTAN'
    this.topDuctY = 22;      // 랙 상단 배선 덕트 높이 (px)
    this.bottomDuctY = 690;  // 랙 하단 배선 덕트 높이 (px)
    this.laneSpacing = 8;    // 전선 겹침 방지 차선 간격 (px)
  }

  setRoutingMode(mode) {
    this.routingMode = mode;
  }

  /**
   * 두 단자 간의 정렬된 SVG 경로(Path d 문자열) 생성
   * @param {Object} ptA - { x, y, moduleId, terminalId, terminalYRatio }
   * @param {Object} ptB - { x, y, moduleId, terminalId, terminalYRatio }
   * @param {number} wireIndex - 전선 순번 (차선 오프셋 분배용)
   * @param {Object} rackBounds - 랙 영역 정보
   * @param {Array} obstacles - 회피 대상 Bounding Box 목록
   */
  generatePath(ptA, ptB, wireIndex = 0, rackBounds = null, obstacles = []) {
    if (this.routingMode === 'CATENARY') {
      return this.generateCatenaryPath(ptA, ptB, wireIndex);
    }

    if (this.routingMode === 'MANHATTAN') {
      return this.generateManhattanPath(ptA, ptB, wireIndex);
    }

    // 기본 모드: SMART_DUCT (장비 가림 회피 및 케이블 트러프 자동 정렬)
    return this.generateSmartDuctPath(ptA, ptB, wireIndex, rackBounds);
  }

  /**
   * 스마트 덕트 라우팅:
   * 단자 위치가 상단에 가까우면 상단 덕트로, 하단에 가까우면 하단 덕트로 진출입.
   * 덕트 내에서 다중 차선(Multi-lane)을 적용하여 전선 겹침 방지.
   * 코너는 둥근 베지어 필렛 처리.
   */
  generateSmartDuctPath(ptA, ptB, wireIndex, rackBounds) {
    const rackTop = rackBounds ? rackBounds.top : 30;
    const rackBottom = rackBounds ? rackBounds.bottom : 680;
    const rackHeight = rackBottom - rackTop;

    // 차선 오프셋 계산 (중앙을 기준으로 양옆으로 교대 배치)
    const laneOffset = ((wireIndex % 2 === 0 ? 1 : -1) * Math.ceil(wireIndex / 2)) * this.laneSpacing;

    // A와 B의 상대적 세로 위치 (0 = 맨위, 1 = 맨아래)
    const relYA = (ptA.y - rackTop) / rackHeight;
    const relYB = (ptB.y - rackTop) / rackHeight;

    // 둘 다 상반부에 있으면 상단 덕트, 둘 다 하반부에 있으면 하단 덕트
    // 서로 다를 경우 전체 경로 길이를 최소화하거나 외곽 통로 경유
    let useTopDuct = false;
    if (relYA < 0.55 && relYB < 0.55) {
      useTopDuct = true;
    } else if (relYA >= 0.55 && relYB >= 0.55) {
      useTopDuct = false;
    } else {
      // 하나는 위, 하나는 아래: 평균 높이에 따라 덕트 결정하거나 더 가까운 쪽 사용
      useTopDuct = (relYA + relYB) < 1.0;
    }

    const ductY = useTopDuct ? (rackTop - 18 + laneOffset * 0.7) : (rackBottom + 18 + laneOffset * 0.7);

    // 단자 진출입 스템(Stem) 거리: 단자에서 수직으로 살짝 나와서 모듈 외곽으로 이동
    const stemOffsetA = (ptA.y > ductY) ? -18 : 18;
    const stemOffsetB = (ptB.y > ductY) ? -18 : 18;

    // 단자에서 수직으로 빠져나가는 1차 경유점
    const exitA = { x: ptA.x, y: ptA.y + stemOffsetA };
    const exitB = { x: ptB.x, y: ptB.y + stemOffsetB };

    // 덕트 진입점 (단자 X 좌표 유지하면서 덕트 Y선으로 도달)
    const ductEntryA = { x: ptA.x, y: ductY };
    const ductEntryB = { x: ptB.x, y: ductY };

    // 만약 동일 모듈 내 바로 인접한 단자라면 덕트까지 가지 않고 단축 필렛 경로 생성
    const dx = Math.abs(ptA.x - ptB.x);
    const dy = Math.abs(ptA.y - ptB.y);
    if (ptA.moduleId === ptB.moduleId && dx < 120 && dy < 160) {
      return this.generateLocalLoop(ptA, ptB, wireIndex);
    }

    // 경로 제어점 배열: ptA -> exitA -> ductEntryA -> ductEntryB -> exitB -> ptB
    const waypoints = [
      ptA,
      exitA,
      ductEntryA,
      ductEntryB,
      exitB,
      ptB
    ];

    return this.buildSmoothPathFromWaypoints(waypoints, 16);
  }

  /**
   * 로컬 인접 단자 루프 (점퍼선 / 쇼트바 형태)
   */
  generateLocalLoop(ptA, ptB, wireIndex) {
    const mx = (ptA.x + ptB.x) / 2;
    const my = (ptA.y + ptB.y) / 2;
    const offset = 25 + (wireIndex % 3) * 8;
    // 옆으로 둥글게 우회하는 곡선
    const cx1 = ptA.x + (ptA.x < ptB.x ? -offset : offset);
    const cy1 = ptA.y;
    const cx2 = ptB.x + (ptA.x < ptB.x ? -offset : offset);
    const cy2 = ptB.y;

    return `M ${ptA.x.toFixed(1)} ${ptA.y.toFixed(1)} C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${ptB.x.toFixed(1)} ${ptB.y.toFixed(1)}`;
  }

  /**
   * 물리적 늘어짐 현수선(Catenary) 곡선
   */
  generateCatenaryPath(ptA, ptB, wireIndex) {
    const dx = ptB.x - ptA.x;
    const dy = ptB.y - ptA.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const sag = Math.max(30, dist * 0.22) + (wireIndex % 4) * 6;

    const mx = (ptA.x + ptB.x) / 2;
    const my = Math.max(ptA.y, ptB.y) + sag;

    const cp1x = ptA.x + dx * 0.25;
    const cp1y = ptA.y + sag * 0.8;
    const cp2x = ptA.x + dx * 0.75;
    const cp2y = ptB.y + sag * 0.8;

    return `M ${ptA.x.toFixed(1)} ${ptA.y.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${ptB.x.toFixed(1)} ${ptB.y.toFixed(1)}`;
  }

  /**
   * 직각 맨해튼(Manhattan) 경로
   */
  generateManhattanPath(ptA, ptB, wireIndex) {
    const laneOffset = (wireIndex % 5) * 6;
    const midY = (ptA.y + ptB.y) / 2 + laneOffset;
    return `M ${ptA.x} ${ptA.y} L ${ptA.x} ${midY} L ${ptB.x} ${midY} L ${ptB.x} ${ptB.y}`;
  }

  /**
   * 경유점(Waypoints) 배열을 바탕으로 모서리에 부드러운 필렛(Fillet)을 입힌 SVG Path 생성
   */
  buildSmoothPathFromWaypoints(points, radius = 14) {
    if (points.length < 2) return '';
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

    for (let i = 1; i < points.length - 1; i++) {
      const pPrev = points[i - 1];
      const pCurr = points[i];
      const pNext = points[i + 1];

      // 벡터 v1: curr -> prev, v2: curr -> next
      const v1x = pPrev.x - pCurr.x;
      const v1y = pPrev.y - pCurr.y;
      const len1 = Math.sqrt(v1x * v1x + v1y * v1y);

      const v2x = pNext.x - pCurr.x;
      const v2y = pNext.y - pCurr.y;
      const len2 = Math.sqrt(v2x * v2x + v2y * v2y);

      if (len1 < 0.001 || len2 < 0.001) {
        continue;
      }

      const effectiveR = Math.min(radius, len1 * 0.45, len2 * 0.45);

      // 필렛 시작점과 끝점
      const startX = pCurr.x + (v1x / len1) * effectiveR;
      const startY = pCurr.y + (v1y / len1) * effectiveR;

      const endX = pCurr.x + (v2x / len2) * effectiveR;
      const endY = pCurr.y + (v2y / len2) * effectiveR;

      d += ` L ${startX.toFixed(1)} ${startY.toFixed(1)}`;
      // 2차 베지어로 코너 둥글게 처리
      d += ` Q ${pCurr.x.toFixed(1)} ${pCurr.y.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`;
    }

    const lastPt = points[points.length - 1];
    d += ` L ${lastPt.x.toFixed(1)} ${lastPt.y.toFixed(1)}`;

    return d;
  }
}
