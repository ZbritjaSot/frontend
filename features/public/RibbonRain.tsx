import type { CSSProperties } from "react";

type ToneName = "lime" | "ivory" | "olive";

type Tone = {
  edge: string;
  shade: string;
  base: string;
  sheen: string;
  fold: string;
  foldSheen: string;
};

type Pt = { x: number; y: number };

const TONES: Record<ToneName, Tone> = {
  lime: {
    edge: "#4d6814",
    shade: "#7ea31a",
    base: "#c6f24a",
    sheen: "#e7ffb0",
    fold: "#5c7a16",
    foldSheen: "#d7f58a",
  },
  ivory: {
    edge: "#b7ad98",
    shade: "#e3d9c6",
    base: "#f4efe6",
    sheen: "#fffdf8",
    fold: "#cfc4ae",
    foldSheen: "#fffaf2",
  },
  olive: {
    edge: "#1a2820",
    shade: "#2d4336",
    base: "#4a6852",
    sheen: "#d7e6cc",
    fold: "#24382c",
    foldSheen: "#8eaa92",
  },
};

function mix(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function rot(p: Pt, origin: Pt, deg: number): Pt {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  return { x: origin.x + dx * c - dy * s, y: origin.y + dx * s + dy * c };
}

function centerline(rand: () => number): Pt[] {
  const amp = rand() < 0.28 ? 1.4 + rand() * 2.4 : 6 + rand() * 8;
  const phase = rand() * Math.PI * 2;
  const wobble = rand() * 2.2;
  const pts: Pt[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    pts.push({
      x: 24 + Math.sin(t * Math.PI + phase) * amp + Math.sin(t * Math.PI * 2 + phase) * wobble,
      y: 3 + t * 76,
    });
  }
  return pts;
}

function normals(pts: Pt[]): Pt[] {
  return pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)] ?? pts[0]!;
    const b = pts[Math.min(pts.length - 1, i + 1)] ?? pts[i]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { x: -(b.y - a.y) / len, y: (b.x - a.x) / len };
  });
}

function shift(pts: Pt[], norms: Pt[], half: number): Pt[] {
  return pts.map((p, i) => ({
    x: p.x + (norms[i]?.x ?? 0) * half,
    y: p.y + (norms[i]?.y ?? 0) * half,
  }));
}

function draw(pts: Pt[]): string {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("");
}

function outline(left: Pt[], right: Pt[], notch: Pt | null): string {
  let d = draw(left);
  if (notch) d += ` L${notch.x.toFixed(1)} ${notch.y.toFixed(1)}`;
  d += draw([...right].reverse()).replace("M", "L");
  return `${d} Z`;
}

function scrapPaths(rand: () => number): { body: string; sheen: string; fold: string | null } {
  const full = centerline(rand);
  const half = 5.6 + rand() * 1.4;
  const roll = rand();
  const folded = roll > 0.7;
  const norms = normals(full);
  const left = shift(full, norms, half);
  const right = shift(full, norms, -half);

  if (rand() > 0.5) left[0] = mix(left[0]!, left[1]!, 0.28);
  else right[0] = mix(right[0]!, right[1]!, 0.28);

  let fold: string | null = null;
  let bodyLeft = left;
  let bodyRight = right;
  let notch: Pt | null = null;
  let sheenCenter = full;

  if (folded) {
    const at = full.length - 5;
    const origin = full[at] ?? full[full.length - 1]!;
    const angle = (rand() > 0.5 ? 1 : -1) * (20 + rand() * 16);
    const turn = (pts: Pt[]) => pts.map((p, i) => (i <= at ? p : rot(p, origin, angle)));
    fold = outline(turn(left).slice(at), turn(right).slice(at), null);
    bodyLeft = left.slice(0, at + 1);
    bodyRight = right.slice(0, at + 1);
    sheenCenter = full.slice(0, at + 1);
  } else if (roll < 0.4) {
    const end = full.length - 1;
    notch = mix(full[end]!, full[Math.max(0, end - 3)]!, 0.7);
  } else {
    const end = left.length - 1;
    if (rand() > 0.5) left[end] = mix(left[end]!, left[end - 1]!, 0.36);
    else right[end] = mix(right[end]!, right[end - 1]!, 0.36);
  }

  const sheenNorms = normals(sheenCenter);
  const sheen = outline(
    shift(sheenCenter, sheenNorms, half * 0.14),
    shift(sheenCenter, sheenNorms, -half * 0.14),
    null,
  );
  return { body: outline(bodyLeft, bodyRight, notch), sheen, fold };
}

type Depth = "near" | "mid" | "far";

type Piece = {
  left: number;
  width: number;
  height: number;
  delay: number;
  duration: number;
  y0: number;
  x1: number;
  x2: number;
  x3: number;
  rx0: number;
  rx1: number;
  ry0: number;
  ry1: number;
  rz0: number;
  rz1: number;
  depth: number;
  alpha: number;
  tone: ToneName;
  flip: boolean;
  light: number;
  body: string;
  sheen: string;
  fold: string | null;
};

function ribbonRand(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makePieces(count: number): Piece[] {
  const rand = ribbonRand(20260926);
  const between = (min: number, max: number) => min + rand() * (max - min);
  const clusters = [12, 28, 46, 67, 84];

  return Array.from({ length: count }, () => {
    const depthRoll = rand();
    const depth: Depth = depthRoll < 0.24 ? "near" : depthRoll < 0.7 ? "mid" : "far";
    const height =
      depth === "near" ? between(52, 66) : depth === "mid" ? between(40, 52) : between(30, 40);
    const duration =
      depth === "near" ? between(3400, 4000) : depth === "mid" ? between(3600, 4300) : between(3900, 4500);
    const drift = rand() < 0.22 ? between(-10, 10) : between(-36, 36);
    const sway = rand() < 0.22 ? between(-6, 6) : between(-22, 22);
    const xAt = (t: number) => drift * t + sway * Math.sin(Math.PI * t);
    const spin = rand() > 0.5 ? 1 : -1;
    const yaw0 = between(-28, 28);
    const roll0 = between(-16, 16);
    const twist0 = between(-42, 42);
    const cloth = scrapPaths(rand);
    const left = rand() < 0.58
      ? between(2, 96)
      : Math.min(97, Math.max(2, (clusters[Math.floor(rand() * clusters.length)] ?? 46) + between(-16, 16)));

    return {
      left,
      width: height * (48 / 82),
      height,
      delay: between(0, 140),
      duration,
      y0: depth === "far" ? between(-30, -14) : between(-22, -6),
      x1: xAt(0.32),
      x2: xAt(0.68),
      x3: drift,
      rx0: roll0,
      rx1: roll0 + between(-22, 22),
      ry0: yaw0,
      ry1: yaw0 + between(100, 150) * spin,
      rz0: twist0,
      rz1: twist0 + between(50, 110) * spin,
      depth: depth === "near" ? between(1.02, 1.14) : depth === "mid" ? between(0.9, 1) : between(0.7, 0.84),
      alpha: depth === "far" ? between(0.64, 0.78) : depth === "near" ? 1 : between(0.9, 0.98),
      tone: (["lime", "lime", "ivory", "ivory", "olive"] as const)[Math.floor(rand() * 5)] ?? "lime",
      flip: rand() > 0.48,
      light: between(-0.25, 0.35),
      body: cloth.body,
      sheen: cloth.sheen,
      fold: cloth.fold,
    };
  });
}

const PIECES = makePieces(140);

function SatinScrap({ piece, index }: { piece: Piece; index: number }) {
  const tone = TONES[piece.tone];
  const fillId = `satin-${index}`;
  const foldId = `fold-${index}`;

  return (
    <svg className="ribbon-svg" viewBox="0 0 48 82" style={piece.flip ? { transform: "scaleX(-1)" } : undefined}>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="1" y2={piece.light} gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor={tone.edge} />
          <stop offset="18%" stopColor={tone.shade} />
          <stop offset="38%" stopColor={tone.base} />
          <stop offset="50%" stopColor={tone.sheen} />
          <stop offset="62%" stopColor={tone.base} />
          <stop offset="84%" stopColor={tone.shade} />
          <stop offset="100%" stopColor={tone.edge} />
        </linearGradient>
        {piece.fold ? (
          <linearGradient id={foldId} x1="0" y1="1" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor={tone.fold} />
            <stop offset="62%" stopColor={tone.fold} />
            <stop offset="84%" stopColor={tone.foldSheen} />
            <stop offset="100%" stopColor={tone.edge} />
          </linearGradient>
        ) : null}
      </defs>
      <path d={piece.body} fill={`url(#${fillId})`} />
      <path d={piece.sheen} fill={tone.sheen} opacity="0.38" />
      {piece.fold ? <path d={piece.fold} fill={`url(#${foldId})`} /> : null}
    </svg>
  );
}

export function RibbonRain() {
  return (
    <div className="ribbon-rain" aria-hidden>
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className="ribbon"
          style={
            {
              left: `${piece.left}%`,
              width: `${piece.width}px`,
              height: `${piece.height}px`,
              animationDelay: `${piece.delay}ms`,
              animationDuration: `${piece.duration}ms`,
              "--y0": piece.y0,
              "--x1": `${piece.x1}px`,
              "--x2": `${piece.x2}px`,
              "--x3": `${piece.x3}px`,
              "--rx0": piece.rx0,
              "--rx1": piece.rx1,
              "--ry0": piece.ry0,
              "--ry1": piece.ry1,
              "--rz0": piece.rz0,
              "--rz1": piece.rz1,
              "--depth": piece.depth,
              "--alpha": piece.alpha,
            } as CSSProperties
          }
        >
          <SatinScrap piece={piece} index={index} />
        </span>
      ))}
    </div>
  );
}
