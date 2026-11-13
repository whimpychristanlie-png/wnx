/** Modern garden assets: normalize map and sprite coordinates at load time. */

export interface LoadedAssets {
  map: ImageBitmap;
  sprites: ImageBitmap;
  couple: ImageBitmap;
  /** The couple as standing chibi characters, 2 cols × 4 rows of 150×224 cells.
   *  Rows: 0 standing, 1 peace, 2 finger heart, 3 waving. Col 0 groom, col 1 bride. */
  coupleStand: ImageBitmap;
  bakedCouple?: boolean;
}

async function loadBitmap(url: string, onBytes: (n: number) => void, size?: [number, number]): Promise<ImageBitmap> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const blob = await res.blob();
  onBytes(blob.size);
  return size ? createImageBitmap(blob, { resizeWidth: size[0], resizeHeight: size[1], resizeQuality: "pixelated" }) : createImageBitmap(blob);
}

export async function preloadAssets(onProgress: (pct: number) => void): Promise<LoadedAssets> {
  // Rough weights so the bar moves proportionally to real work, not file count.
  const total = 560_568 + 743_810 + 627_321 + 211_900;
  let done = 0;
  const bump = (n: number) => {
    done += n;
    onProgress(Math.min(0.92, done / total));
  };

  // Alpha sprites preserve the bride's white dress and veil without chroma keying.
  const [map, rawSprites, couple, coupleStand] = await Promise.all([
    loadBitmap('/assets/rumah30/map-v5.png', bump, [768, 1152]),
    loadBitmap('/assets/characters/guests-garden-v3.png', bump, [1200, 896]),
    loadBitmap('/assets/photobooth/couple-whimpy-xinxin.png', bump),
    loadBitmap('/assets/photobooth/couple-whimpy-xinxin.png', bump),
  ]);

  // Yield a frame so the bar paints before the (blocking) pixel pass.
  await new Promise(requestAnimationFrame);
  const sprites = await createImageBitmap(rawSprites);

  await document.fonts.ready.catch(() => undefined);
  onProgress(1);
  return { map, sprites, couple, coupleStand, bakedCouple:true };
}

/**
 * An outfit's own sheet, loaded once the guest has picked it. These already
 * carry real transparency, so there is no keying. Null on any failure: the
 * guest keeps the base body rather than losing their character.
 */
export async function loadSheet(url: string): Promise<ImageBitmap | null> {
  try {
    const res = await fetch(url);
    return res.ok ? await createImageBitmap(await res.blob()) : null;
  } catch {
    return null;
  }
}

/** Spritesheet is 8 columns x 4 rows at 150x224 — NOT the 8x8/150x112 in prd.md. */
export const CELL_W = 150;
export const CELL_H = 224;
export const COLS = 8;
