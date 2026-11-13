import type { Gender } from '../game/types';
export type OutfitId = 'suit' | 'floral';
export const OUTFITS: { id: OutfitId; label: string; sub: string; body: Gender; sheet?: string }[] = [
  { id: 'suit', label: 'SUIT', sub: 'Jas modern · 西装', body: 'pria' },
  { id: 'floral', label: 'DRESS', sub: 'Sage dress · 绿色礼裙', body: 'wanita' },
];
export const DEFAULT_OUTFIT: OutfitId = 'suit';
export const OUTFIT_PREVIEWS = '/assets/characters/guests-garden-v3.png';
export const outfitOf = (id: OutfitId) => OUTFITS.find((o) => o.id === id) ?? OUTFITS[0];
export const isOutfit = (v: unknown): v is OutfitId => OUTFITS.some((o) => o.id === v);
export const baseRow = (body: Gender): number => body === 'pria' ? 0 : 2;
export interface Look { sheet: CanvasImageSource; base: number }
export function outfitLook(id: OutfitId, baseSheet: CanvasImageSource, _onSheet: (look: Look) => void): Look {
  return { sheet: baseSheet, base: baseRow(outfitOf(id).body) };
}
