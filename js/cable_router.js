/**
 * IEG-6030 케이블 자동 정렬 및 장애물 회피 라우팅 엔진
 *
 * SMART_DUCT: 단자 → (필요 시 계측기 표시창·노브·다른 단자를 옆으로 비켜) → 상/하단 케이블 덕트 → 목적 단자
 *   - 두 덕트 경로의 장애물 교차 수를 비교해 가리는 부품이 적은 쪽을 선택
 *   - 전선별 차선(lane)을 달리해 덕트 안에서 겹치지 않게 적층
 */

export class CableRouter {
  constructor() {
    this.routingMode = 'SMART_DUCT'; // 'SMART_DUCT' | 'CATENARY' | 'MANHATTAN'
  }

  setRoutingMode(mode) {
    this.routingMode = mode;
  }

  generatePath(ptA, ptB, wireIndex = 0, rackBounds = null, obstacles = []) {
    if (this.routingMode === 'CATENARY') return this.generateCatenaryPath(ptA, ptB, wireIndex, rackBounds);
    if (this.routingMode === 'MANHATTAN') return this.generateManhattanPath(ptA, ptB, wireIndex);
    return this.generateSmartDuctPath(ptA, ptB, wireIndex, rackBounds, obstacles);
  }

  /** 수직 선분(x, y1→y2, 폭 w)과 교차하는 장애물 목록 */
  hitsOnVertical(x, y1, y2, obstacles, exclude, halfW = 4) {
    const top = Math.min(y1, y2), bot = Math.max(y1, y2);
    return obstacles.filter(o =>
      !exclude(o) && x + halfW > o.x1 && x - halfW < o.x2 && bot > o.y1 && top < o.y2);
  }

  /**
   * 단자에서 덕트까지의 진출 경로(경유점) 계산
   * @returns {{ points: Array<{x,y}>, cost: number }}
   */
  exitRoute(pt, ductY, obstacles) {
    const dir = ductY < pt.y ? -1 : 1;
    const stem = 11;
    const self = (o) => o.kind === 'terminal' && Math.abs((o.x1 + o.x2) / 2 - pt.x) < 1 && Math.abs((o.y1 + o.y2) / 2 - pt.y) < 1;
    const startY = pt.y + dir * stem;
    const hits = this.hitsOnVertical(pt.x, startY, ductY, obstacles, self);
    if (hits.length === 0) {
      return { points: [pt, { x: pt.x, y: ductY }], cost: 0 };
    }
    // 가장 가까운 장애물 기준으로 좌/우 비켜가기
    const nearest = hits.reduce((a, b) => (Math.abs(((a.y1 + a.y2) / 2) - pt.y) < Math.abs(((b.y1 + b.y2) / 2) - pt.y) ? a : b));
    const sameModule = hits.filter(o => o.moduleId === nearest.moduleId && o.kind !== 'terminal');
    const blockX1 = Math.min(nearest.x1, ...sameModule.map(o => o.x1));
    const blockX2 = Math.max(nearest.x2, ...sameModule.map(o => o.x2));
    const margin = 7;
    const cands = [blockX2 + margin, blockX1 - margin].map(jx => {
      const rest = this.hitsOnVertical(jx, startY, ductY, obstacles, self);
      // 비켜가는 수평 구간이 다른 단자 중심을 지나지 않는지
      const horiz = obstacles.filter(o => o.kind === 'terminal' && !self(o) &&
        startY > o.y1 && startY < o.y2 && Math.max(pt.x, jx) > o.x1 && Math.min(pt.x, jx) < o.x2);
      return { jx, cost: rest.length * 3 + horiz.length * 2 + Math.abs(jx - pt.x) / 200 };
    });
    cands.sort((a, b) => a.cost - b.cost);
    const best = cands[0];
    return {
      points: [pt, { x: pt.x, y: startY }, { x: best.jx, y: startY }, { x: best.jx, y: ductY }],
      cost: best.cost + 0.5
    };
  }

  generateSmartDuctPath(ptA, ptB, wireIndex, rackBounds, obstacles = []) {
    const topBase = rackBounds?.topDuct ?? 40;
    const botBase = rackBounds?.bottomDuct ?? 520;
    const canvasH = rackBounds?.canvasHeight ?? 600;

    // 같은 모듈 내 가까운 단자: 점퍼선 형태의 짧은 곡선
    const dx = Math.abs(ptA.x - ptB.x);
    const dy = Math.abs(ptA.y - ptB.y);
    if (ptA.moduleId === ptB.moduleId && dx < 90 && dy < 90) {
      return this.generateLocalLoop(ptA, ptB, wireIndex, rackBounds?.midY);
    }

    const lane = (wireIndex % 12) * 3.5;
    const topY = Math.max(10, topBase - lane);
    const botY = Math.min(canvasH - 10, botBase + lane);

    const plan = (ductY) => {
      const a = this.exitRoute(ptA, ductY, obstacles);
      const b = this.exitRoute(ptB, ductY, obstacles);
      const len = Math.abs(ptA.y - ductY) + Math.abs(ptB.y - ductY);
      return { a, b, cost: a.cost + b.cost + len / 400 };
    };
    const up = plan(topY);
    const dn = plan(botY);
    const best = up.cost <= dn.cost ? up : dn;

    const waypoints = [...best.a.points, ...best.b.points.slice().reverse()];
    return this.buildSmoothPathFromWaypoints(waypoints, 10);
  }

  /** 로컬 인접 단자 루프 (점퍼선) */
  generateLocalLoop(ptA, ptB, wireIndex, midY = null) {
    const offset = 16 + (wireIndex % 3) * 5;
    const horizontal = Math.abs(ptA.x - ptB.x) >= Math.abs(ptA.y - ptB.y);
    let c1x, c1y, c2x, c2y;
    if (horizontal) {
      // 모듈 하단 단자끼리는 아래로, 상단 단자끼리는 위로 휘게 하여 패널 그림을 가리지 않음
      const down = midY !== null && (ptA.y + ptB.y) / 2 > midY;
      const o = down ? offset : -offset;
      c1x = ptA.x; c1y = ptA.y + o; c2x = ptB.x; c2y = ptB.y + o;
    } else {
      const side = ptA.x <= ptB.x ? -1 : 1;
      c1x = ptA.x + side * offset; c1y = ptA.y; c2x = ptB.x + side * offset; c2y = ptB.y;
    }
    return `M ${ptA.x.toFixed(1)} ${ptA.y.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${ptB.x.toFixed(1)} ${ptB.y.toFixed(1)}`;
  }

  /** 현수선(Catenary) 곡선 */
  generateCatenaryPath(ptA, ptB, wireIndex, rackBounds) {
    const dx = ptB.x - ptA.x;
    const dist = Math.hypot(dx, ptB.y - ptA.y);
    let sag = Math.max(25, dist * 0.2) + (wireIndex % 4) * 5;
    const canvasH = rackBounds?.canvasHeight ?? 600;
    if (Math.max(ptA.y, ptB.y) + sag > canvasH - 12) sag = Math.max(10, canvasH - 12 - Math.max(ptA.y, ptB.y));
    const cp1x = ptA.x + dx * 0.25, cp1y = ptA.y + sag * 0.8;
    const cp2x = ptA.x + dx * 0.75, cp2y = ptB.y + sag * 0.8;
    return `M ${ptA.x.toFixed(1)} ${ptA.y.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${ptB.x.toFixed(1)} ${ptB.y.toFixed(1)}`;
  }

  /** 직각 맨해튼 경로 */
  generateManhattanPath(ptA, ptB, wireIndex) {
    const laneOffset = ((wireIndex % 2 === 0 ? 1 : -1) * Math.ceil(wireIndex / 2)) * 6;
    const midY = (ptA.y + ptB.y) / 2 + laneOffset;
    return `M ${ptA.x.toFixed(1)} ${ptA.y.toFixed(1)} L ${ptA.x.toFixed(1)} ${midY.toFixed(1)} L ${ptB.x.toFixed(1)} ${midY.toFixed(1)} L ${ptB.x.toFixed(1)} ${ptB.y.toFixed(1)}`;
  }

  /** 경유점 사이 모서리를 둥글게 처리한 SVG Path */
  buildSmoothPathFromWaypoints(points, radius = 12) {
    // 중복/일직선 경유점 정리
    const pts = [];
    for (const p of points) {
      const last = pts[pts.length - 1];
      if (last && Math.abs(last.x - p.x) < 0.5 && Math.abs(last.y - p.y) < 0.5) continue;
      pts.push(p);
    }
    if (pts.length < 2) return '';
    if (pts.length === 2) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} L ${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}`;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
      const v1x = p0.x - p1.x, v1y = p0.y - p1.y, l1 = Math.hypot(v1x, v1y);
      const v2x = p2.x - p1.x, v2y = p2.y - p1.y, l2 = Math.hypot(v2x, v2y);
      if (l1 < 0.001 || l2 < 0.001) continue;
      const r = Math.min(radius, l1 * 0.45, l2 * 0.45);
      d += ` L ${(p1.x + v1x / l1 * r).toFixed(1)} ${(p1.y + v1y / l1 * r).toFixed(1)}`;
      d += ` Q ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}, ${(p1.x + v2x / l2 * r).toFixed(1)} ${(p1.y + v2y / l2 * r).toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
    return d;
  }
}
