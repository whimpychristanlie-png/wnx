import type { Landmark, Vec2 } from './types';

export const WORLD_W = 768;
export const WORLD_H = 1152;

/** Landmarks measured on the approved Rumah 30 illustration.
 * The couple is painted into this map, so Engine must not draw a second pair.
 */
export const LANDMARKS: Landmark[] = [
  {id:'pelaminan',label:'MEMPELAI',target:'pasangan',x:390,y:230,sx:390,sy:292,radius:58,signOffset:49},
  {id:'panggung',label:'ACARA',target:'acara',x:140,y:565,sx:218,sy:620,radius:52,signOffset:40},
  {id:'pohon-harapan',label:'RSVP',target:'rsvp',x:476,y:1030,sx:432,sy:1105,radius:48,signOffset:40},
  {id:'kios-photobox',label:'PHOTOBOOTH',target:'photobox',x:105,y:800,sx:200,sy:848,radius:52,signOffset:45},
  {id:'meja-hadiah',label:'HADIAH',target:'hadiah',x:560,y:1030,sx:600,sy:1105,radius:48,signOffset:40},
  {id:'prasmanan',label:'BUFFET',target:'buffet',x:660,y:610,sx:580,sy:650,radius:52,signOffset:40},
];

export const SPAWN: Vec2 = {x:384,y:1105};

/** Foot-level obstacles measured on the approved Rumah 30 drawing.
 * Roofs and floral canopies are overhead, not solid ground obstacles.
 */
export const BLOCKERS: readonly [number,number,number,number][] = [
  [0,0,768,145],
  [210,145,350,100],
  [0,320,65,620], [704,320,64,620],
  [190,325,138,100], [432,325,145,100],
  [220,462,22,35], [514,457,22,35],
  [185,700,24,42], [540,700,24,42],
  [86,550,105,65],
  [605,540,91,141],
  [40,735,117,133],
  [440,1000,145,82],
];

/**
 * Where a body may stand. The pathfinder needs these as much as the player
 * does: routed through a gap the player is clamped out of, it aims at a
 * waypoint that can never be reached and the guest stops dead.
 */
/**
 * Where the camera sits on one axis: follow `want`, but never past the edge of
 * the painting, so the stage is always full of map.
 */
export function camClamp(want: number, view: number, world: number): number {
  return Math.max(0, Math.min(want, world - view));
}

export const BOUNDS = { minX: 24, maxX: WORLD_W - 24, minY: 150, maxY: WORLD_H - 18 };

export function inBounds(x: number, y: number): boolean {
  return x >= BOUNDS.minX && x <= BOUNDS.maxX && y >= BOUNDS.minY && y <= BOUNDS.maxY;
}

export function blocked(x: number, y: number): boolean {
  for (const [bx, by, bw, bh] of BLOCKERS) {
    if (x > bx && x < bx + bw && y > by && y < by + bh) return true;
  }
  return false;
}

/**
 * The trigger zone is an ellipse flattened to the map's three-quarter view,
 * and it is exactly the ring the engine draws. It used to be a circle twice
 * the height of the drawn ring, so the prompt fired while the guest was
 * visibly standing outside it.
 */
export const ZONE_SQUASH = 0.5;

/**
 * The landmark whose scenery is at this point, if any. A tap on the stage or
 * the chests means "go there": walking to the open ground nearest the tap
 * stopped the guest just outside the ring, and the prompt never came up.
 */
export function landmarkAt(x: number, y: number): Landmark | null {
  // The floating sign boards read as buttons, so they act like them. Sized as
  // the engine draws them: 8px glyphs, a "+ " prefix, 16px padding, 20px tall,
  // on a 12px post.
  for (const l of LANDMARKS) {
    const half = ((l.label.length + 2) * 8 + 16) / 2;
    const base = l.y - l.signOffset;
    if (Math.abs(x - l.x) <= half && y >= base - 20 && y <= base + 12) return l;
  }
  const box = BLOCKERS.find(([bx, by, bw, bh]) => x > bx && x < bx + bw && y > by && y < by + bh);
  if (!box) return null;
  const [bx, by, bw, bh] = box;
  return LANDMARKS.filter(l => l.x > bx && l.x < bx + bw && l.y > by && l.y < by + bh).sort((a,b) => Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0] ?? null;
}

export function nearest(x: number, y: number): { lm: Landmark; dist: number } | null {
  let best: { lm: Landmark; dist: number } | null = null;
  for (const lm of LANDMARKS) {
    // 0 at the stand point, 1 on the ring.
    const d = Math.hypot((lm.sx - x) / lm.radius, (lm.sy - y) / (lm.radius * ZONE_SQUASH));
    if (d <= 1 && (!best || d < best.dist)) best = { lm, dist: d };
  }
  return best;
}
