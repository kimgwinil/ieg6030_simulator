/**
 * IEG-6030 회로망 해석기 (Modified Nodal Analysis, 복소 페이저)
 *
 * - 단자 연결(전선 + 모듈 내부 도통)을 Union-Find로 묶어 전기적 노드를 만든다.
 * - 저항 R, 인덕턴스 L, 커패시턴스 C 직렬 임피던스 소자와
 *   내부 임피던스를 가진 전압원(Norton 등가)을 노드 어드미턴스 행렬로 조립한다.
 * - 같은 주파수의 전원끼리 한 "그룹"으로 묶어 중첩의 원리로 그룹별 해석한다.
 *   (직류 = 0 Hz, 전원공급기 교류 = 60 Hz, 발전기 교류 = 회전수에 따른 주파수)
 */

// ---------- 복소수 헬퍼 ([re, im]) ----------
export const C = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
  mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
  div: (a, b) => {
    const d = b[0] * b[0] + b[1] * b[1];
    if (d < 1e-300) return [0, 0];
    return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
  },
  abs: (a) => Math.hypot(a[0], a[1]),
  arg: (a) => Math.atan2(a[1], a[0]),
  polar: (mag, rad) => [mag * Math.cos(rad), mag * Math.sin(rad)],
  scale: (a, k) => [a[0] * k, a[1] * k]
};

/** 직렬 R-L-C 소자의 임피던스 (ω=0 이면 직류) */
export function seriesImpedance(el, omega) {
  const R = el.R || 0;
  let X = 0;
  if (el.L) X += omega * el.L;
  if (el.C) {
    if (omega <= 0) return null; // 직류에서 커패시터는 개방
    X -= 1 / (omega * el.C);
  }
  const z = [Math.max(R, 1e-4), X];
  return z;
}

export class UnionFind {
  constructor() { this.parent = new Map(); }
  find(k) {
    if (!this.parent.has(k)) this.parent.set(k, k);
    let r = k;
    while (this.parent.get(r) !== r) r = this.parent.get(r);
    let c = k;
    while (this.parent.get(c) !== r) { const n = this.parent.get(c); this.parent.set(c, r); c = n; }
    return r;
  }
  union(a, b) {
    const ra = this.find(a), rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
  same(a, b) { return this.find(a) === this.find(b); }
}

/**
 * 한 번의 해석 사이클에서 사용하는 회로망
 *  - branches: { id, a, b, R, L, C }       (a, b = 단자 키)
 *  - sources : { id, a, b, group, V:[re,im], R, L } a(-) → b(+) 방향 기전력
 */
export class Netlist {
  constructor(uf) {
    this.uf = uf;
    this.branches = [];
    this.sources = [];
  }

  addBranch(id, a, b, imp) {
    this.branches.push({ id, a, b, ...imp });
  }

  /** 전압원: b 단자가 a 단자보다 V 만큼 높다 (내부 임피던스 R + jωL 직렬) */
  addSource(id, a, b, group, V, R = 0.5, L = 0) {
    this.sources.push({ id, a, b, group, V, R, L });
  }

  /**
   * 그룹별 해석
   * @param {string} group  그룹 이름
   * @param {number} freq   주파수 [Hz] (0 = 직류)
   * @returns {{ v:(key)=>[re,im], branchI:(id)=>[re,im], sourceI:(id)=>[re,im] }}
   */
  solve(group, freq) {
    const omega = 2 * Math.PI * freq;
    const nodeIndex = new Map();
    const idx = (key) => {
      const root = this.uf.find(key);
      if (!nodeIndex.has(root)) nodeIndex.set(root, nodeIndex.size);
      return nodeIndex.get(root);
    };

    // 관련 소자 수집 (직류는 커패시터 개방)
    const elems = [];
    for (const br of this.branches) {
      const z = seriesImpedance(br, omega);
      if (!z) continue;
      elems.push({ kind: 'Z', id: br.id, na: idx(br.a), nb: idx(br.b), y: C.div([1, 0], z) });
    }
    for (const s of this.sources) {
      const z = [Math.max(s.R, 1e-4), omega * (s.L || 0)];
      const y = C.div([1, 0], z);
      const active = s.group === group;
      // Norton 등가: a→b 방향으로 V/Z 전류원 + 병렬 어드미턴스
      elems.push({ kind: 'S', id: s.id, na: idx(s.a), nb: idx(s.b), y, Ieq: active ? C.mul(s.V, y) : [0, 0], V: active ? s.V : [0, 0] });
    }

    const n = nodeIndex.size;
    const result = { nodeIndex, volts: [], elems, uf: this.uf };
    if (n === 0) return this._wrap(result);

    // 행렬 조립 (각 노드에 미소 누설 컨덕턴스로 기준 전위 부여)
    const Y = Array.from({ length: n }, () => Array.from({ length: n }, () => [0, 0]));
    const I = Array.from({ length: n }, () => [0, 0]);
    for (let i = 0; i < n; i++) Y[i][i] = [1e-9, 0];

    for (const e of elems) {
      const { na, nb, y } = e;
      if (na === nb) continue;
      Y[na][na] = C.add(Y[na][na], y);
      Y[nb][nb] = C.add(Y[nb][nb], y);
      Y[na][nb] = C.sub(Y[na][nb], y);
      Y[nb][na] = C.sub(Y[nb][na], y);
      if (e.kind === 'S') {
        // 전류원이 a에서 뽑아 b로 주입
        I[na] = C.sub(I[na], e.Ieq);
        I[nb] = C.add(I[nb], e.Ieq);
      }
    }

    result.volts = gaussSolve(Y, I);
    return this._wrap(result);
  }

  _wrap(res) {
    const { nodeIndex, volts, elems, uf } = res;
    const v = (key) => {
      const i = nodeIndex.get(uf.find(key));
      return (i === undefined || !volts[i]) ? [0, 0] : volts[i];
    };
    const vIdx = (i) => volts[i] || [0, 0];
    const byId = new Map(elems.map(e => [e.id, e]));
    // 소자 전류: a → b 방향 (소자 내부를 흐르는 전류)
    const branchI = (id) => {
      const e = byId.get(id);
      if (!e) return [0, 0];
      if (e.kind === 'Z') return C.mul(C.sub(vIdx(e.na), vIdx(e.nb)), e.y);
      // 전원 내부 전류 (a→b): (V - (Vb - Va)) / Z
      const vab = C.sub(vIdx(e.nb), vIdx(e.na));
      return C.mul(C.sub(e.V, vab), e.y);
    };
    return { v, branchI, nodeCount: nodeIndex.size };
  }
}

/** 부분 피벗 가우스 소거 (복소수) */
function gaussSolve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row.map(c => [c[0], c[1]]), [b[i][0], b[i][1]]]);
  for (let col = 0; col < n; col++) {
    let piv = col, best = C.abs(M[col][col]);
    for (let r = col + 1; r < n; r++) {
      const m = C.abs(M[r][col]);
      if (m > best) { best = m; piv = r; }
    }
    if (best < 1e-18) continue;
    if (piv !== col) { const t = M[piv]; M[piv] = M[col]; M[col] = t; }
    const p = M[col][col];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = C.div(M[r][col], p);
      if (f[0] === 0 && f[1] === 0) continue;
      for (let c = col; c <= n; c++) M[r][c] = C.sub(M[r][c], C.mul(f, M[col][c]));
    }
  }
  const x = [];
  for (let i = 0; i < n; i++) {
    const p = M[i][i];
    x.push(C.abs(p) < 1e-18 ? [0, 0] : C.div(M[i][n], p));
  }
  return x;
}
