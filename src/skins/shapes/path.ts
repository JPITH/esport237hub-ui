/**
 * Petite algèbre de chemins SVG — SANS DÉPENDANCE, pour l'outillage et les tests.
 *
 * Le rendu n'en a pas besoin : les formes de carte arrivent déjà optimisées
 * dans `generated.ts` (chaînes `d` prêtes à poser sur un `<path>`). Ce module
 * sert au script `scripts/card-shapes.ts`, qui en tire le chemin de découpe
 * en unités de boîte (`clip-path` CSS), et aux tests, qui vérifient qu'une
 * zone sûre ou un ancrage tombe bien DANS la silhouette.
 *
 * Tout chemin est d'abord ramené à quatre commandes absolues — `M`, `L`, `C`,
 * `Z` : les lignes `H`/`V` deviennent des `L`, les quadratiques et les arcs
 * deviennent des cubiques. Une transformation affine (mise à l'échelle,
 * translation) s'applique alors point par point, sans cas particulier.
 */

export type PathSeg =
  | { type: 'M'; x: number; y: number }
  | { type: 'L'; x: number; y: number }
  | { type: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { type: 'Z' };

export type Point = readonly [number, number];

type CubicSeg = Extract<PathSeg, { type: 'C' }>;

/** Nombre de paramètres par commande (en minuscules). */
const ARITY: Record<string, number> = {
  m: 2,
  l: 2,
  h: 1,
  v: 1,
  c: 6,
  s: 4,
  q: 4,
  t: 2,
  a: 7,
  z: 0,
};

/**
 * Découpe une chaîne `d` en commandes et nombres. Les drapeaux d'arc sont lus
 * caractère par caractère : SVGO les écrit collés (`a14 14 0 000 28`), ce
 * qu'une simple expression régulière de nombres lirait comme « 0 » puis « 0 ».
 */
function tokenize(d: string): Array<{ cmd: string; args: number[] }> {
  const out: Array<{ cmd: string; args: number[] }> = [];
  let i = 0;
  const n = d.length;
  let current: { cmd: string; args: number[] } | null = null;

  const skip = () => {
    while (i < n && /[\s,]/.test(d[i])) i++;
  };
  const readNumber = (): number => {
    skip();
    const m = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/.exec(d.slice(i));
    if (!m) throw new Error(`Chemin SVG illisible près de « ${d.slice(i, i + 12)} »`);
    i += m[0].length;
    return Number(m[0]);
  };
  const readFlag = (): number => {
    skip();
    const c = d[i];
    if (c !== '0' && c !== '1') throw new Error(`Drapeau d'arc attendu près de « ${d.slice(i, i + 12)} »`);
    i++;
    return c === '1' ? 1 : 0;
  };

  while (i < n) {
    skip();
    if (i >= n) break;
    const c = d[i];
    if (/[a-z]/i.test(c)) {
      if (!(c.toLowerCase() in ARITY)) throw new Error(`Commande SVG inconnue « ${c} »`);
      current = { cmd: c, args: [] };
      out.push(current);
      i++;
      if (c.toLowerCase() === 'z') current = null;
      continue;
    }
    if (!current) throw new Error(`Nombre sans commande près de « ${d.slice(i, i + 12)} »`);
    const lower = current.cmd.toLowerCase();
    const arity = ARITY[lower];
    /* Répétition implicite : `L 1 2 3 4` = deux segments. Un `M` répété
       devient un `L` (règle SVG). */
    if (current.args.length === arity) {
      const nextCmd = lower === 'm' ? (current.cmd === 'm' ? 'l' : 'L') : current.cmd;
      current = { cmd: nextCmd, args: [] };
      out.push(current);
    }
    if (lower === 'a') {
      const k = current.args.length;
      current.args.push(k === 3 || k === 4 ? readFlag() : readNumber());
    } else {
      current.args.push(readNumber());
    }
  }
  for (const t of out) {
    if (t.args.length !== ARITY[t.cmd.toLowerCase()]) {
      throw new Error(`Commande « ${t.cmd} » incomplète`);
    }
  }
  return out;
}

/**
 * Arc elliptique (paramétrage par extrémités, SVG 1.1 §F.6) → cubiques.
 * Chaque tranche couvre au plus 90°, approximée avec k = 4/3·tan(θ/4).
 */
function arcToCubics(
  x0: number,
  y0: number,
  rxIn: number,
  ryIn: number,
  phiDeg: number,
  largeArc: number,
  sweep: number,
  x: number,
  y: number,
): PathSeg[] {
  if (x0 === x && y0 === y) return [];
  let rx = Math.abs(rxIn);
  let ry = Math.abs(ryIn);
  if (rx === 0 || ry === 0) return [{ type: 'L', x, y }];
  const phi = (phiDeg * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x0 - x) / 2;
  const dy = (y0 - y) / 2;
  const x1p = cos * dx + sin * dy;
  const y1p = -sin * dx + cos * dy;
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const s = Math.sqrt(lambda);
    rx *= s;
    ry *= s;
  }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  let coef = Math.sqrt(Math.max(0, num / den));
  if (largeArc === sweep) coef = -coef;
  const cxp = (coef * rx * y1p) / ry;
  const cyp = (-coef * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (x0 + x) / 2;
  const cy = sin * cxp + cos * cyp + (y0 + y) / 2;

  const angle = (ux: number, uy: number, vx: number, vy: number) => {
    const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    return a;
  };
  const theta1 = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let delta = angle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;

  const parts = Math.max(1, Math.ceil(Math.abs(delta) / (Math.PI / 2) - 1e-9));
  const step = delta / parts;
  const k = (4 / 3) * Math.tan(step / 4);
  const point = (t: number): [number, number] => {
    const ex = rx * Math.cos(t);
    const ey = ry * Math.sin(t);
    return [cos * ex - sin * ey + cx, sin * ex + cos * ey + cy];
  };
  const deriv = (t: number): [number, number] => {
    const ex = -rx * Math.sin(t);
    const ey = ry * Math.cos(t);
    return [cos * ex - sin * ey, sin * ex + cos * ey];
  };
  const out: PathSeg[] = [];
  for (let p = 0; p < parts; p++) {
    const t1 = theta1 + p * step;
    const t2 = t1 + step;
    const [ax, ay] = point(t1);
    const [bx, by] = p === parts - 1 ? [x, y] : point(t2);
    const [d1x, d1y] = deriv(t1);
    const [d2x, d2y] = deriv(t2);
    out.push({
      type: 'C',
      x1: ax + k * d1x,
      y1: ay + k * d1y,
      x2: bx - k * d2x,
      y2: by - k * d2y,
      x: bx,
      y: by,
    });
  }
  return out;
}

/** Lit une chaîne `d` et la ramène à `M` / `L` / `C` / `Z` absolus. */
export function parsePath(d: string): PathSeg[] {
  const out: PathSeg[] = [];
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  /* Dernier point de contrôle, pour les raccourcis `S` et `T`. */
  let lastC: [number, number] | null = null;
  let lastQ: [number, number] | null = null;

  for (const { cmd, args } of tokenize(d)) {
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    const upper = cmd.toUpperCase();
    let nextC: [number, number] | null = null;
    let nextQ: [number, number] | null = null;

    switch (upper) {
      case 'M':
        x = ox + args[0];
        y = oy + args[1];
        startX = x;
        startY = y;
        out.push({ type: 'M', x, y });
        break;
      case 'L':
        x = ox + args[0];
        y = oy + args[1];
        out.push({ type: 'L', x, y });
        break;
      case 'H':
        x = (rel ? x : 0) + args[0];
        out.push({ type: 'L', x, y });
        break;
      case 'V':
        y = (rel ? y : 0) + args[0];
        out.push({ type: 'L', x, y });
        break;
      case 'C': {
        const seg: CubicSeg = {
          type: 'C',
          x1: ox + args[0],
          y1: oy + args[1],
          x2: ox + args[2],
          y2: oy + args[3],
          x: ox + args[4],
          y: oy + args[5],
        };
        out.push(seg);
        nextC = [seg.x2, seg.y2];
        x = seg.x;
        y = seg.y;
        break;
      }
      case 'S': {
        const [rx, ry]: [number, number] = lastC ? [2 * x - lastC[0], 2 * y - lastC[1]] : [x, y];
        const seg: CubicSeg = {
          type: 'C',
          x1: rx,
          y1: ry,
          x2: ox + args[0],
          y2: oy + args[1],
          x: ox + args[2],
          y: oy + args[3],
        };
        out.push(seg);
        nextC = [seg.x2, seg.y2];
        x = seg.x;
        y = seg.y;
        break;
      }
      case 'Q':
      case 'T': {
        let qx: number = x;
        let qy: number = y;
        if (upper === 'Q') {
          qx = ox + args[0];
          qy = oy + args[1];
        } else if (lastQ) {
          qx = 2 * x - lastQ[0];
          qy = 2 * y - lastQ[1];
        }
        const ex = upper === 'Q' ? ox + args[2] : ox + args[0];
        const ey = upper === 'Q' ? oy + args[3] : oy + args[1];
        out.push({
          type: 'C',
          x1: x + (2 / 3) * (qx - x),
          y1: y + (2 / 3) * (qy - y),
          x2: ex + (2 / 3) * (qx - ex),
          y2: ey + (2 / 3) * (qy - ey),
          x: ex,
          y: ey,
        });
        nextQ = [qx, qy];
        x = ex;
        y = ey;
        break;
      }
      case 'A': {
        const ex = ox + args[5];
        const ey = oy + args[6];
        out.push(...arcToCubics(x, y, args[0], args[1], args[2], args[3], args[4], ex, ey));
        x = ex;
        y = ey;
        break;
      }
      case 'Z':
        out.push({ type: 'Z' });
        x = startX;
        y = startY;
        break;
    }
    lastC = nextC;
    lastQ = nextQ;
  }
  return out;
}

/** Applique `fn` à chaque point (extrémités ET points de contrôle). */
export function mapPath(segs: readonly PathSeg[], fn: (x: number, y: number) => Point): PathSeg[] {
  return segs.map((s) => {
    if (s.type === 'Z') return s;
    if (s.type === 'C') {
      const [x1, y1] = fn(s.x1, s.y1);
      const [x2, y2] = fn(s.x2, s.y2);
      const [x, y] = fn(s.x, s.y);
      return { type: 'C', x1, y1, x2, y2, x, y };
    }
    const [x, y] = fn(s.x, s.y);
    return { type: s.type, x, y };
  });
}

/** Réécrit une chaîne `d` absolue, à `decimals` décimales, sans zéro inutile. */
export function serializePath(segs: readonly PathSeg[], decimals = 2): string {
  const f = (v: number) => {
    const s = Number(v.toFixed(decimals)).toString();
    return s === '-0' ? '0' : s;
  };
  return segs
    .map((s) => {
      switch (s.type) {
        case 'M':
        case 'L':
          return `${s.type}${f(s.x)} ${f(s.y)}`;
        case 'C':
          return `C${f(s.x1)} ${f(s.y1)} ${f(s.x2)} ${f(s.y2)} ${f(s.x)} ${f(s.y)}`;
        case 'Z':
          return 'Z';
      }
    })
    .join('');
}

/**
 * Aplatit le chemin en polylignes (une par sous-chemin), `steps` points par
 * cubique — assez pour des tests d'appartenance au demi-pixel près.
 */
export function flattenPath(segs: readonly PathSeg[], steps = 24): Point[][] {
  const polys: Point[][] = [];
  let poly: Point[] = [];
  let x = 0;
  let y = 0;
  for (const s of segs) {
    if (s.type === 'M') {
      if (poly.length) polys.push(poly);
      poly = [[s.x, s.y]];
      x = s.x;
      y = s.y;
    } else if (s.type === 'L') {
      poly.push([s.x, s.y]);
      x = s.x;
      y = s.y;
    } else if (s.type === 'C') {
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const u = 1 - t;
        const a = u * u * u;
        const b = 3 * u * u * t;
        const c = 3 * u * t * t;
        const d = t * t * t;
        poly.push([
          a * x + b * s.x1 + c * s.x2 + d * s.x,
          a * y + b * s.y1 + c * s.y2 + d * s.y,
        ]);
      }
      x = s.x;
      y = s.y;
    } else if (poly.length) {
      polys.push(poly);
      poly = [];
    }
  }
  if (poly.length) polys.push(poly);
  return polys;
}

/** Règle pair-impair : vrai si le point est à l'intérieur de la silhouette. */
export function pointInPolys(polys: readonly (readonly Point[])[], px: number, py: number): boolean {
  let inside = false;
  for (const poly of polys) {
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i];
      const [xj, yj] = poly[j];
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
  }
  return inside;
}

/** Distance du point au contour le plus proche. */
export function distanceToEdge(polys: readonly (readonly Point[])[], px: number, py: number): number {
  let best = Infinity;
  for (const poly of polys) {
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [ax, ay] = poly[j];
      const [bx, by] = poly[i];
      const vx = bx - ax;
      const vy = by - ay;
      const len = vx * vx + vy * vy;
      const t = len ? Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / len)) : 0;
      const dx = ax + t * vx - px;
      const dy = ay + t * vy - py;
      best = Math.min(best, Math.hypot(dx, dy));
    }
  }
  return best;
}

/** Boîte englobante des points (contrôles compris : majorant sûr). */
export function pathBounds(segs: readonly PathSeg[]): { x: number; y: number; width: number; height: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const poly of flattenPath(segs)) {
    for (const [x, y] of poly) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
