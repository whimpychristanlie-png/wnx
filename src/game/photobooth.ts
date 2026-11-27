import { CELL_W, CELL_H } from '../services/assets';
import type { Look } from '../data/outfits';
import type { Gender } from './types';

/**
 * The character photobooth: the guest's own outfit in front of a backdrop,
 * with a pose and a prop. Drawn here onto a plain canvas, which the photobox
 * then frames and saves exactly like a camera photo, so the preview and the
 * saved image are the same picture. Nothing is uploaded.
 *
 * There is no pose art, so poses are made from what exists: a tilt, a peace
 * sign, a little rain of hearts.
 */
export const SCENE_W = 960;
export const SCENE_H = 1040; // the frames' photo windows are close to this 12:13
const FLOOR = 1000;
/**
 * Whole-number scales keep the pixel art crisp: a 150 x 224 cell is drawn at
 * 4x alone, and at 3x when the couple stand either side of the guest.
 */
const SOLO_K = 4;
const GROUP_K = 3;
/** Groom and bride stand this far either side of the guest. */
const GROUP_GAP = 262;

/**
 * Who stands where when the couple are in the shot.
 *
 * A guest stands beside their own — a man next to the groom, a woman next to
 * the bride — and never between the bride and groom. Putting the guest in the
 * middle separates the couple in their own wedding photo, which is exactly
 * what nobody does at a real resepsi. Same etiquette the salaman follows.
 *
 * Offsets from the centre of the scene, in scene pixels.
 */
export function groupLayout(body: Gender): { guest: number; groom: number; bride: number } {
  return body === 'pria'
    ? { guest: -GROUP_GAP, groom: 0, bride: GROUP_GAP }
    : { groom: -GROUP_GAP, bride: 0, guest: GROUP_GAP };
}

/**
 * public/assets/photobooth/couple-whimpy-xinxin.png (built by scripts/prep-art.swift): the
 * couple standing on the guests' own body scale, groom in column 0, bride in
 * column 1, one row per pose — so they join whatever pose the guest strikes.
 */
export const COUPLE_SHEET = '/assets/photobooth/couple-whimpy-xinxin.png';
const COUPLE_ROW: Record<PoseId, number> = { formal: 0, peace: 1, heart: 2, funny: 3 }; // funny: they wave
const COUPLE_FEET_Y = 200;

export type BackgroundId = 'pelaminan' | 'garden' | 'booth';
export const BACKGROUNDS: { id: BackgroundId; name: string; src: string }[] = [
  { id: 'pelaminan', name: 'Pelaminan · 主舞台', src: '/assets/rumah30/pelaminan.png' },
  { id: 'garden', name: 'Rumah 30 · 花园', src: '/assets/rumah30/courtyard.png' },
];

export type PoseId = 'formal' | 'peace' | 'heart' | 'funny';
export const POSES: { id: PoseId; name: string; icon: string }[] = [
  { id: 'formal', name: 'Formal · 正式', icon: '🤵' },
  { id: 'peace', name: 'Peace · 耶', icon: '✌️' },
  { id: 'heart', name: 'Finger heart · 比心', icon: '💕' },
  { id: 'funny', name: 'Kocak · 俏皮', icon: '🤪' },
];

export type AccessoryId = 'none' | 'glasses' | 'crown' | 'moustache' | 'bowtie' | 'bouquet' | 'sign';
export const ACCESSORY_SHEET = '/assets/photobooth/accessories.png';
export const ACCESSORY_SHEET_SIZE = [688, 384] as const;
/** `src` is the prop's opaque bounds in the sheet. */
export const ACCESSORIES: { id: AccessoryId; name: string; src?: [number, number, number, number] }[] = [
  { id: 'none', name: 'Tanpa · 无' },
  { id: 'glasses', name: 'Kacamata hati · 爱心眼镜', src: [23, 56, 183, 80] },
  { id: 'crown', name: 'Mahkota bunga · 花冠', src: [244, 53, 199, 80] },
  { id: 'moustache', name: 'Kumis · 胡子', src: [493, 45, 160, 131] },
  { id: 'bowtie', name: 'Dasi kupu · 领结', src: [29, 245, 171, 85] },
  { id: 'bouquet', name: 'Buket · 花束', src: [287, 222, 113, 131] },
  { id: 'sign', name: 'Papan "Ciee" · 祝福牌', src: [499, 205, 145, 165] },
];

/**
 * Landmarks on the front idle frame, in cell pixels, measured off the base
 * sheet. Outfit sheets are built to the same body, so they share these.
 */
const ANCHORS: Record<Gender, { cx: number; headTop: number; eyeY: number; mouthY: number; neckY: number; handY: number; feetY: number }> = {
  pria: { cx: 78, headTop: 30, eyeY: 71, mouthY: 83, neckY: 95, handY: 147, feetY: 200 },
  wanita: { cx: 78, headTop: 33, eyeY: 72, mouthY: 84, neckY: 95, handY: 152, feetY: 211 },
};


const ready = (img: HTMLImageElement | null): img is HTMLImageElement => !!img && img.complete && img.naturalWidth > 0;

export interface Scene {
  background: HTMLImageElement | null;
  accessories: HTMLImageElement | null;
  /** The couple's sheet, when they are in the picture. */
  couple: HTMLImageElement | null;
  look: Look;
  body: Gender;
  pose: PoseId;
  accessory: AccessoryId;
}

export function renderScene(ctx: CanvasRenderingContext2D, s: Scene): void {
  if (ready(s.background)) {
    const k = Math.max(SCENE_W / s.background.naturalWidth, SCENE_H / s.background.naturalHeight);
    const w = s.background.naturalWidth * k;
    const h = s.background.naturalHeight * k;
    ctx.drawImage(s.background, (SCENE_W - w) / 2, (SCENE_H - h) / 2, w, h);
  } else {
    ctx.fillStyle = '#f4e9ce';
    ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  }

  const a = ANCHORS[s.body];
  const group = ready(s.couple);
  const K = group ? GROUP_K : SOLO_K;
  const spots = groupLayout(s.body);
  // Alone, the guest is centred; with the couple they step to their own side.
  const guestX = SCENE_W / 2 + (group ? spots.guest : 0);
  // Cell point -> scene point, with the feet on the floor and the body centred.
  const X = (x: number) => guestX + (x - a.cx) * K;
  const Y = (y: number) => FLOOR - (a.feetY - y) * K;

  const shadow = (x: number) => {
    ctx.fillStyle = 'rgba(27, 17, 13, 0.28)';
    ctx.beginPath();
    ctx.ellipse(x, FLOOR - 4, 38 * K, 6 * K, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  // The couple first, standing together, with the guest to one side of them.
  if (group) {
    ctx.imageSmoothingEnabled = false;
    for (const [col, x] of [
      [0, SCENE_W / 2 + spots.groom],
      [1, SCENE_W / 2 + spots.bride],
    ] as const) {
      shadow(x);
      ctx.drawImage(s.couple!, col * s.couple!.naturalWidth / 2, COUPLE_ROW[s.pose] * s.couple!.naturalHeight / 4, s.couple!.naturalWidth / 2, s.couple!.naturalHeight / 4,
        x - (CELL_W / 2) * K, FLOOR - COUPLE_FEET_Y * K, CELL_W * K, CELL_H * K);
    }
  }

  ctx.save();
  shadow(guestX);
  if (s.pose === 'funny') {
    // Leaning off one foot, the whole body and its prop together.
    ctx.translate(guestX, FLOOR);
    ctx.rotate(s.body === 'pria' ? 0.035 : -0.035);
    ctx.translate(-guestX, -FLOOR);
  }

  ctx.imageSmoothingEnabled = false;
  const raised = s.pose !== 'formal';
  const male = s.body === 'pria';
  const elbowX = male ? 50 : 51;
  const elbowY = male ? 126 : 127;
  ctx.save();
  if (raised) {
    // Remove the resting forearm while preserving the torso and dress.
    ctx.beginPath();
    ctx.rect(X(0), Y(0), CELL_W*K, CELL_H*K);
    ctx.rect(X(30), Y(elbowY), (male ? 26 : 25)*K, 31*K);
    ctx.clip('evenodd');
  }
  ctx.drawImage(s.look.sheet, 0, s.look.base * CELL_H, CELL_W, CELL_H, X(0), Y(0), CELL_W * K, CELL_H * K);
  ctx.restore();
  if (raised) {
    ctx.save();
    ctx.translate(X(elbowX), Y(elbowY));
    ctx.scale(K,K);
    ctx.lineCap = 'round';
    const stroke = (x:number,y:number,u:number,v:number,width:number,color:string) => {
      ctx.lineWidth=width; ctx.strokeStyle=color; ctx.beginPath();
      ctx.moveTo(x,y); ctx.lineTo(u,v); ctx.stroke();
    };
    const skin = '#f2bc93';
    const sleeve = male ? '#8d796b' : skin;
    stroke(0,0,-10,-19,11,'#44382f');
    stroke(0,0,-10,-19,8,sleeve);
    stroke(-10,-19,-11,-24,8,skin);
    const finger = (x:number,y:number,u:number,v:number) => {
      stroke(x,y,u,v,3.6,'#795341'); stroke(x,y,u,v,2.4,skin);
    };
    if (s.pose === 'peace') {
      finger(-13,-25,-17,-33); finger(-10,-25,-8,-34);
    } else if (s.pose === 'heart') {
      finger(-13,-25,-9,-30); finger(-8,-25,-13,-29);
    } else {
      for (let n=0;n<4;n++) finger(-15+n*2.5,-25,-17+n*3.5,-30-Math.sin(n)*2);
      finger(-8,-23,-5,-26);
    }
    ctx.restore();
  }

  ctx.imageSmoothingEnabled = true;
  const prop = ACCESSORIES.find((p) => p.id === s.accessory)?.src;
  if (prop && ready(s.accessories)) {
    const [sx, sy, sw, sh] = prop;
    // Width in cell pixels, and where the prop's centre (cx, cy) or edge goes.
    const put = (w: number, cx: number, cy: number) => {
      const dw = w * K;
      const dh = (sh / sw) * dw;
      ctx.drawImage(s.accessories!, sx, sy, sw, sh, X(cx) - dw / 2, Y(cy) - dh / 2, dw, dh);
      return { x: X(cx) - dw / 2, y: Y(cy) - dh / 2, w: dw, h: dh };
    };
    const ratio = sh / sw;
    switch (s.accessory) {
      case 'glasses': put(46, a.cx, a.eyeY + 1); break;
      case 'crown': put(58, a.cx, a.headTop + 12 - (58 * ratio) / 2); break;
      case 'moustache': put(38, a.cx, a.mouthY - 8 + (38 * ratio) / 2); break;
      case 'bowtie': put(30, a.cx, a.neckY + 3); break;
      case 'bouquet': put(33, male ? 107 : 103, a.handY - 15); break;
      case 'sign': {
        // Held up beside the head — or overhead in a group photo, where the
        // bride stands on that side. The board is left blank in the art and
        // lettered here, because image models misspell text.
        const width = 43;
        const r = put(width, male ? 107 : 103, a.handY - width * ratio * 0.44);
        ctx.fillStyle = '#2d1e18';
        ctx.font = `${Math.round(r.w * 0.17)}px "Press Start 2P", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CIEE', r.x + r.w / 2, r.y + r.h * 0.3);
        break;
      }
    }
  }

  if (s.accessory === 'bouquet' || s.accessory === 'sign') {
    // Restore the original knuckles in front of the stem or handle.
    const handX = male ? 103 : 100;
    const handY = male ? 144 : 147;
    ctx.drawImage(s.look.sheet, handX, s.look.base * CELL_H + handY, 7, 6,
      X(handX), Y(handY), 7*K, 6*K);
  }
  ctx.restore();
}
