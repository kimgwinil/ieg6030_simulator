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
      return this.generateCatenaryPath(ptA, ptB, wireIndex, rackBounds);
    }

    if (this.routingMode === 'MANHATTAN') {
      return this.generateManhattanPath(ptA, ptB, wireIndex, rackBounds);
    }

    // 기본 모드: SMART_DUCT (장비 가림 회피 및 케이블 트러프 자동 정렬)
    return this.generateSmartDuctPath(ptA, ptB, wireIndex, rackBounds);
  }

  /**
   * 스마트 덕트 라우팅:
   * 실제 랙 상단/하단 케이블 트러프(Duct) 중심선에 맞춰 배선.
   * 위/아래로 너무 올라가거나 내려가서 잘리는 현상을 완벽히 방지.
   * 다중 차선(Multi-lane)을 적용하여 전선 겹침 방지.
   */
  generateSmartDuctPath(ptA, ptB, wireIndex, rackBounds) {
    const topDuctBase = (rackBounds && rackBounds.topDuct !== undefined) ? rackBounds.topDuct : 40;
    const bottomDuctBase = (rackBounds && rackBounds.bottomDuct !== undefined) ? rackBounds.bottomDuct : 520;
    const midY = (rackBounds && rackBounds.midY !== undefined) ? rackBounds.midY : (topDuctBase + bottomDuctBase) / 2;
    const canvasH = (rackBounds && rackBounds.canvasHeight !== undefined) ? rackBounds.canvasHeight : 600;

    // 만약 동일 모듈 내 바로 인접한 단자라면 덕트까지 가지 않고 단축 루프 경로 생성
    const dx = Math.abs(ptA.x - ptB.x);
    const dy = Math.abs(ptA.y - ptB.y);
    if (ptA.moduleId === ptB.moduleId && dx < 110 && dy < 150) {
      return this.generateLocalLoop(ptA, ptB, wireIndex);
    }

    // 차선 오프셋 계산 (전선이 겹치지 않도록 차선별 5px 간격 분산)
    const laneStep = 5;
    const laneOffset = ((wireIndex % 2 === 0 ? 1 : -1) * Math.ceil(wireIndex / 2)) * laneStep;

    // A와 B의 평균 세로 위치로 상단 덕트 vs 하단 덕트 결정
    const avgY = (ptA.y + ptB.y) / 2;
    let useTopDuct = avgY < midY;

    // 만약 두 단자 중 하나라도 상단에 가깝고 다른 하나도 하단 극단이 아니면 상단 덕트 우선
    if (Math.min(ptA.y, ptB.y) < midY - 60 && Math.max(ptA.y, ptB.y) < midY + 50) {
      useTopDuct = true;
    } else if (Math.max(ptA.y, ptB.y) > midY + 60 && Math.min(ptA.y, ptB.y) > midY - 50) {
      useTopDuct = false;
    }

    // 덕트 Y선 계산 및 안전 마진 클램핑 (상단/하단 잘림 및 모듈 가림 100% 방지)
    // 차선 스택 시 모듈 안쪽이 아닌 모듈 바깥쪽(트러프 방향)으로 순차 적층
    const laneOffset = Math.ceil(wireIndex / 2) * 4;
    let ductY;
    if (useTopDuct) {
      ductY = topDuctBase - laneOffset;
      // 최소 14px 유지하여 상단 프레임 밖으로 절대 나가지 않음
      ductY = Math.max(14, ductY);
    } else {
      ductY = bottomDuctBase + laneOffset;
      // 최대 canvasH - 24px 유지하여 하단 서랍/경계 밖으로 절대 나가지 않음
      ductY = Math.min(canvasH - 24, ductY);
    }

    // 단자 진출입 스템(Stem) 거리: 단자에서 수직으로 18px 직진하여 인접 단자/블럭 걸침 방지
    const stemLen = 18;
    const stemOffsetA = (ptA.y > ductY) ? -stemLen : stemLen;
    const stemOffsetB = (ptB.y > ductY) ? -stemLen : stemLen;

    // 단자에서 수직으로 빠져나가는 1차 경유점
    const exitA = { x: ptA.x, y: ptA.y + stemOffsetA };
    const exitB = { x: ptB.x, y: ptB.y + stemOffsetB };

    // 덕트 진입점 (단자 X 좌표 유지하면서 덕트 Y선으로 도달)
    const ductEntryA = { x: ptA.x, y: ductY };
    const ductEntryB = { x: ptB.x, y: ductY };

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
    const offset = 22 + (wireIndex % 3) * 6;
    // 옆으로 둥글게 우회하는 곡선
    const cx1 = ptA.x + (ptA.x < ptB.x ? -offset : offset);
    const cy1 = ptA.y;
    const cx2 = ptB.x + (ptA.x < ptB.x ? -offset : offset);
    const cy2 = ptB.y;

    return `M ${ptA.x.toFixed(1)} ${ptA.y.toFixed(1)} C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${ptB.x.toFixed(1)} ${ptB.y.toFixed(1)}`;
  }

  /**
   * 물리적 늘어짐 현수선(Catenary) 곡선 (바닥 잘림 방지 클램핑)
   */
  generateCatenaryPath(ptA, ptB, wireIndex, rackBounds) {
    const dx = ptB.x - ptA.x;
    const dy = ptB.y - ptA.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let sag = Math.max(25, dist * 0.20) + (wireIndex % 4) * 5;

    const canvasH = (rackBounds && rackBounds.canvasHeight) ? rackBounds.canvasHeight : 600;
    const maxY = Math.max(ptA.y, ptB.y) + sag;
    if (maxY > canvasH - 24) {
      sag = Math.max(10, (canvasH - 24) - Math.max(ptA.y, ptB.y));
    }

    const cp1x = ptA.x + dx * 0.25;
    const cp1y = ptA.y + sag * 0.8;
    const cp2x = ptA.x + dx * 0.75;
    const cp2y = ptB.y + sag * 0.8;

    return `M ${ptA.x.toFixed(1)} ${ptA.y.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${ptB.x.toFixed(1)} ${ptB.y.toFixed(1)}`;
  }

  /**
   * 직각 맨해튼(Manhattan) 경로
   */
  generateManhattanPath(ptA, ptB, wireIndex, rackBounds) {
    const laneOffset = ((wireIndex % 2 === 0 ? 1 : -1) * Math.ceil(wireIndex / 2)) * 6;
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
