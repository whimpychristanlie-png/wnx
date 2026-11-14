/** Modern garden assets: normalize map and sprite coordinates at load time. */

export interface SpriteRect { x:number; y:number; w:number; h:number }

export interface LoadedAssets {
  map: ImageBitmap;
  sprites: ImageBitmap;
  couple: ImageBitmap;
  /** The couple as standing chibi characters, 2 cols × 4 rows of 150×224 cells.
   *  Rows: 0 standing, 1 peace, 2 finger heart, 3 waving. Col 0 groom, col 1 bride. */
  coupleStand: ImageBitmap;
  coupleFrames: SpriteRect[];
  /** Painted body fraction, excluding transparent cell margins. */
  guestBodyRatio: number;
  bakedCouple?: boolean;
}

/** Measure alpha once at load time. Empty cell margins must not make one
 * character look larger than another even when their draw boxes are equal.
 */
function bodyFrames(bitmap: ImageBitmap, cols: number, rows: number): SpriteRect[] {
  const canvas = document.createElement('canvas');
  canvas.width=bitmap.width;canvas.height=bitmap.height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true})!;
  ctx.drawImage(bitmap,0,0);
  const {data}=ctx.getImageData(0,0,canvas.width,canvas.height);
  const frames: SpriteRect[]=[];
  for(let row=0;row<rows;row++) for(let col=0;col<cols;col++) {
    const x0=Math.round(col*bitmap.width/cols),x1=Math.round((col+1)*bitmap.width/cols);
    const y0=Math.round(row*bitmap.height/rows),y1=Math.round((row+1)*bitmap.height/rows);
    let left=x1,top=y1,right=x0,bottom=y0;
    for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++) {
      if(data[(y*bitmap.width+x)*4+3]<=24) continue;
      left=Math.min(left,x);top=Math.min(top,y);
      right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);
    }
    frames.push(right>left && bottom>top ? {x:left,y:top,w:right-left,h:bottom-top} : {x:x0,y:y0,w:x1-x0,h:y1-y0});
  }
  return frames;
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
    loadBitmap('/assets/rumah30/map-v6.png', bump, [768, 1152]),
    loadBitmap('/assets/characters/guests-garden-v3.png', bump, [1200, 896]),
    loadBitmap('/assets/photobooth/couple-whimpy-xinxin.png', bump),
    loadBitmap('/assets/photobooth/couple-whimpy-xinxin.png', bump),
  ]);

  // Yield a frame so the bar paints before the (blocking) pixel pass.
  await new Promise(requestAnimationFrame);
  const sprites = await createImageBitmap(rawSprites);
  const coupleFrames=bodyFrames(coupleStand,2,4);
  const guestBodyRatio=bodyFrames(sprites,8,4)[0].h/CELL_H;

  await document.fonts.ready.catch(() => undefined);
  onProgress(1);
  return { map, sprites, couple, coupleStand, coupleFrames, guestBodyRatio, bakedCouple:false };
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
