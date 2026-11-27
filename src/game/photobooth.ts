import { CELL_W, CELL_H } from '../services/assets';
import type { Gender } from './types';

/**
 * The character photobooth: the guest's own outfit in front of a backdrop,
 * with a pose and a prop. Drawn here onto a plain canvas, which the photobox
 * then frames and saves exactly like a camera photo, so the preview and the
 * saved image are the same picture. Nothing is uploaded.
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

// Each row is one accessory. Each pose has a pair of cells, man then woman.
// Each 320 × 480 master has its foot pivot at (160, 464). The web atlas
// scales that master to 240 × 360; the scene uses 128 × 192 per game unit.
export const GUEST_SHEET = '/assets/photobooth/guest-poses-v1.webp';
const GUEST_WIDTH = 128;
const GUEST_HEIGHT = 192;
const GUEST_FEET = GUEST_HEIGHT * 464 / 480;

export interface Scene {
  background: HTMLImageElement;
  guests: HTMLImageElement;
  couple: ImageBitmap | null;
  body: Gender;
  pose: PoseId;
  accessory: AccessoryId;
}

export function renderScene(ctx: CanvasRenderingContext2D, s: Scene): void {
  const fit = Math.max(SCENE_W / s.background.naturalWidth, SCENE_H / s.background.naturalHeight);
  const w = s.background.naturalWidth * fit;
  const h = s.background.naturalHeight * fit;
  ctx.drawImage(s.background, (SCENE_W - w) / 2, (SCENE_H - h) / 2, w, h);

  const scale = s.couple ? GROUP_K : SOLO_K;
  const spots = groupLayout(s.body);
  const guestX = SCENE_W / 2 + (s.couple ? spots.guest : 0);
  const poseIndex = POSES.findIndex(p => p.id === s.pose);
  const accessoryIndex = ACCESSORIES.findIndex(a => a.id === s.accessory);
  const shadow = (x: number) => {
    ctx.fillStyle = 'rgba(27, 17, 13, 0.28)';
    ctx.beginPath();
    ctx.ellipse(x, FLOOR - 4, 38 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  ctx.imageSmoothingEnabled = false;
  if (s.couple) {
    const cw = s.couple.width / 2;
    const ch = s.couple.height / POSES.length;
    for (const [col, offset] of [spots.groom, spots.bride].entries()) {
      const x = SCENE_W / 2 + offset;
      shadow(x);
      ctx.drawImage(s.couple, col * cw, poseIndex * ch, cw, ch,
        x - CELL_W * scale / 2, FLOOR - COUPLE_FEET_Y * scale, CELL_W * scale, CELL_H * scale);
    }
  }

  shadow(guestX);
  const cw = s.guests.naturalWidth / (2 * POSES.length);
  const ch = s.guests.naturalHeight / ACCESSORIES.length;
  const col = poseIndex * 2 + (s.body === 'wanita' ? 1 : 0);
  ctx.drawImage(s.guests, col * cw, accessoryIndex * ch, cw, ch,
    guestX - GUEST_WIDTH * scale / 2, FLOOR - GUEST_FEET * scale, GUEST_WIDTH * scale, GUEST_HEIGHT * scale);
}
