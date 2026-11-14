import type { Landmark, Vec2 } from './types';

export const WORLD_W = 768;
export const WORLD_H = 1152;

/** Landmarks measured on the Rumah 30 map; the couple is drawn separately. */
export const LANDMARKS: Landmark[] = [
  {id:'pelaminan',label:'MEMPELAI',target:'pasangan',x:390,y:230,sx:390,sy:292,radius:58,signOffset:49},
  {id:'panggung',label:'ACARA',target:'acara',x:140,y:565,sx:218,sy:620,radius:52,signOffset:40},
  {id:'pohon-harapan',label:'RSVP',target:'rsvp',x:476,y:1030,sx:432,sy:1105,radius:48,signOffset:40},
  {id:'kios-photobox',label:'PHOTOBOOTH',target:'photobox',x:105,y:800,sx:200,sy:848,radius:52,signOffset:45},
  {id:'meja-hadiah',label:'HADIAH',target:'hadiah',x:560,y:1030,sx:600,sy:1105,radius:48,signOffset:40},
  {id:'prasmanan',label:'BUFFET',target:'buffet',x:660,y:610,sx:580,sy:650,radius:52,signOffset:40},
];

export const SPAWN: Vec2 = {x:384,y:1105};

export type FloorRect = readonly [x:number,y:number,w:number,h:number];

/** The only entrance to the stage is the open central door and stairway. */
export const STAGE_DOOR = { x:350, y:300, w:70, h:155 };

/** Continuous floor areas. Roof edges, flower beds and the stage's sides are
 * scenery, not shortcuts. The lower gate remains an underpass below its roof.
 */
export const WALK_AREAS: readonly FloorRect[] = [
  [176,440,414,415],              // lawn
  [118,449,97,481],             // clear paving in front of the left columns
  [575,449,48,391],             // right veranda ends before the lower roof wing
  [175,246,430,66],             // stage floor, inside its walls
  [STAGE_DOOR.x,STAGE_DOOR.y,STAGE_DOOR.w,STAGE_DOOR.h],
  [315,840,125,288],             // entrance underpass
  [170,1092,515,42],             // forecourt in front of both planted walls
];

/** Keep the guest's feet and shoulders clear of walls; paths and NPCs use the
 * same footprint, so keyboard, joystick and tap-to-walk agree at every edge.
 */
const HALF_W = 9;
const HALF_H = 5;

/** Solid walls, planters and furniture, in the map's 768 × 1152 coordinates. */
export const BLOCKERS: readonly [number,number,number,number][] = [
  [210,145,350,100],
  [342,205,103,61],              // bride and groom; guests greet from beside them
  [0,312,350,137], [420,312,348,137], // facade is closed on both sides of the central door
  [210,850,105,85], [440,850,155,85], // roof wings beside the open passage
  [0,930,315,107],               // entrance wall left of the doorway
  [440,930,150,145],             // entrance wall right of the doorway
  [35,1030,190,57],              // planted hedge in the left forecourt
  [245,1020,95,68],              // flower pot and column left of the lower doorway
  [585,1014,160,74],             // right forecourt wall and raised flower bed
  [0,1100,190,52],               // front perimeter planting
  [249,453,25,38], [485,453,25,38], // upper tree bases
  [212,795,36,48], [537,795,36,48], // lower tree bases
  [93,473,64,49],                // left cafe table and chairs
  [85,540,85,66],                // musical instruments
  [600,535,109,157],             // buffet table, including its front edge
  [645,700,70,50],               // right cafe table
  [35,730,130,147],              // photobooth backdrop and camera
  [440,1000,145,82],
];

/** Opaque roof and ivy above the entrance's open floor. */
export const ENTRY_CANOPY = {
  x:206,y:846,w:390,h:116,
  outline:[
    {x:206,y:919},{x:250,y:861},{x:267,y:846},{x:541,y:849},
    {x:552,y:862},{x:596,y:921},{x:584,y:949},{x:210,y:949},
  ] satisfies Vec2[],
};

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
  // Sampling the footprint (rather than just its centre) also rejects walking
  // across the joins of two walls, where one corner used to slip through.
  for (const dx of [-HALF_W,0,HALF_W]) {
    for (const dy of [-HALF_H,0,HALF_H]) {
      const px=x+dx,py=y+dy;
      if (!WALK_AREAS.some(([rx,ry,rw,rh]) => px>=rx && px<=rx+rw && py>=ry && py<=ry+rh)) return true;
    }
  }
  for (const [bx, by, bw, bh] of BLOCKERS) {
    if (x+HALF_W > bx && x-HALF_W < bx+bw && y+HALF_H > by && y-HALF_H < by+bh) return true;
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
