import { useEffect, useRef, useState } from 'react';
import { audio } from '../../services/audio';
import type { LoadedAssets } from '../../services/assets';
import { outfitOf, type OutfitId } from '../../data/outfits';
import type { Gender } from '../../game/types';
import {
  ACCESSORIES, ACCESSORY_SHEET, ACCESSORY_SHEET_SIZE, BACKGROUNDS, GUEST_SHEET, POSES, SCENE_H, SCENE_W, renderScene,
  type AccessoryId, type PoseId,
} from '../../game/photobooth';

interface Props {
  assets: LoadedAssets;
  outfit: OutfitId;
  /** A fresh scene, every time a choice changes or an image arrives. */
  onScene: (scene: HTMLCanvasElement | null) => void;
}

function useBoothImage(src: string, attempt: number) {
  const [asset, setAsset] = useState<{ src: string; image: HTMLImageElement | null }>();
  useEffect(() => {
    setAsset(undefined);
    const image = new Image();
    image.onload = () => setAsset({ src, image });
    image.onerror = () => setAsset({ src, image: null });
    image.src = src;
    return () => { image.onload = null; image.onerror = null; };
  }, [src, attempt]);
  return asset?.src === src ? asset.image : undefined;
}

/** The prop's own bounds from the sheet, fitted into a square tile. */
function PropIcon({ src, size }: { src: [number, number, number, number]; size: number }) {
  const [sx, sy, sw, sh] = src;
  const k = size / Math.max(sw, sh);
  return (
    <span aria-hidden className="grid place-items-center" style={{ width: size, height: size }}>
      <span
        style={{
          width: sw * k,
          height: sh * k,
          background: `url(${ACCESSORY_SHEET}) ${-sx * k}px ${-sy * k}px / ${ACCESSORY_SHEET_SIZE[0] * k}px ${ACCESSORY_SHEET_SIZE[1] * k}px no-repeat`,
        }}
      />
    </span>
  );
}

/** "With the bride and groom": the same switch in both photobox tabs. */
export function CoupleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`flex min-h-tap w-full items-center justify-between gap-3 rounded-md px-4 py-2 text-left ${
        on ? 'border border-gold-500 bg-parchment-300' : 'border border-wood-400 bg-parchment-100'
      }`}
    >
      <span>
        <b className="block text-[14px] text-ink-900">Bersama Pengantin · 与新人合影</b>
        <span className="block text-[12px] text-ink-600">Whimpy & Xinxin</span>
      </span>
      <span aria-hidden className={`grid h-7 w-12 shrink-0 items-center rounded-full border border-wood-800 px-[2px] ${on ? 'justify-items-end bg-emerald-500' : 'justify-items-start bg-parchment-400'}`}>
        <span className="block h-5 w-5 rounded-full border border-wood-800 bg-parchment-100" />
      </span>
    </button>
  );
}

const pill = (on: boolean) =>
  `grid justify-items-center gap-1 rounded-md px-1 py-2 text-[11px] font-semibold leading-3 text-ink-900 ${
    on ? 'border border-gold-500 bg-parchment-300' : 'border border-wood-400 bg-parchment-100'
  }`;

export default function CharacterBooth({ assets, outfit, onScene }: Props) {
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [body, setBody] = useState<Gender>(() => outfitOf(outfit).body);
  const [pose, setPose] = useState<PoseId>('formal');
  // No prop to start with. The couple are in the shot by default, and a
  // keepsake with the bride and groom should not arrive wearing novelty
  // glasses nobody asked for — the playful ones are one tap away.
  const [accessory, setAccessory] = useState<AccessoryId>('none');
  /** With the bride and groom either side: the photo a guest most wants to keep. */
  const [withCouple, setWithCouple] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const guests = useBoothImage(GUEST_SHEET, attempt);
  const backdrop = useBoothImage(background.src, attempt);
  const sceneRef = useRef(onScene);
  sceneRef.current = onScene;

  useEffect(() => {
    if (!guests || !backdrop) {
      sceneRef.current(null);
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = SCENE_W;
    canvas.height = SCENE_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderScene(ctx, {
      background: backdrop,
      guests,
      couple: withCouple ? assets.coupleStand : null,
      body,
      pose,
      accessory,
    });
    sceneRef.current(canvas);
  }, [guests, backdrop, assets.coupleStand, body, pose, accessory, withCouple]);

  const choose = <T,>(set: (v: T) => void, v: T) => () => { audio.play('click'); set(v); };

  return (
    <div className="grid gap-4">
      {(guests === null || backdrop === null) && (
        <div role="alert" className="grid gap-2 text-center text-sm">
          Foto belum bisa dimuat · 照片加载失败
          <button type="button" className="btn-secondary" onClick={() => setAttempt(n => n + 1)}>Coba lagi · 重试</button>
        </div>
      )}
      <CoupleSwitch on={withCouple} onToggle={choose(setWithCouple, !withCouple)} />

      <div role="group" aria-label="Karakter tamu · 宾客角色">
        <span className="label-cap mb-2 block">Karakter tamu · 宾客角色</span>
        <div className="grid grid-cols-2 gap-2">
          {([['pria', 'Pria · 男'], ['wanita', 'Wanita · 女']] as const).map(([id, label]) => (
            <button key={id} type="button" aria-pressed={body === id} onClick={choose(setBody, id)} className={pill(body === id) + ' min-h-tap items-center'}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="label-cap mb-2 block">Latar · 选择背景</span>
        <div className="grid grid-cols-2 gap-2">
          {BACKGROUNDS.map((b) => (
            <button key={b.id} type="button" aria-pressed={background.id === b.id} onClick={choose(setBackground, b)} className={pill(background.id === b.id)}>
              <span aria-hidden className="block h-12 w-full rounded-sm bg-cover bg-center" style={{ backgroundImage: `url(${b.src})` }} />
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="label-cap mb-2 block">Pose · 姿势</span>
        <div className="grid grid-cols-4 gap-2">
          {POSES.map((p) => (
            <button key={p.id} type="button" aria-pressed={pose === p.id} onClick={choose(setPose, p.id)} className={pill(pose === p.id)}>
              <span aria-hidden className="text-[22px] leading-7">{p.icon}</span>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="label-cap mb-2 block">Aksesori · 配饰</span>
        <div className="grid grid-cols-4 gap-2">
          {ACCESSORIES.map((p) => (
            <button key={p.id} type="button" aria-pressed={accessory === p.id} onClick={choose(setAccessory, p.id)} className={pill(accessory === p.id)}>
              {p.src ? <PropIcon src={p.src} size={36} /> : <span aria-hidden className="grid h-9 place-items-center text-[18px]">∅</span>}
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
