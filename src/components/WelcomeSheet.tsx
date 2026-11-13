import { useRef } from 'react';
import { audio } from '../services/audio';
import { useFocusTrap } from '../hooks/useFocusTrap';
const ROWS = [
  {icon:'↔',id:'Geser joystick untuk berjalan. Di komputer, gunakan WASD atau tombol panah.',zh:'拖动左下方摇杆行走；电脑可使用方向键或 WASD。'},
  {icon:'⌖',id:'Dekati penanda atau ketuk tempat tujuan untuk berinteraksi.',zh:'靠近指示牌，或点击想去的地方进行互动。'},
  {icon:'♡',id:'Sapa kami, tinggalkan ucapan, atau simpan foto kenang-kenangan.',zh:'与我们打招呼、留下祝福，或拍一张纪念照。'},
];
export default function WelcomeSheet({onClose}:{onClose:()=>void}) {
  const ref=useRef<HTMLDivElement>(null);useFocusTrap(ref,onClose);
  return <div className="fixed inset-x-0 z-[60] flex items-center justify-center px-4" style={{background:'var(--veil-strong)',top:'var(--vv-top,0px)',height:'var(--vv-height,100svh)',paddingTop:'max(16px,env(safe-area-inset-top))',paddingBottom:'max(16px,env(safe-area-inset-bottom))'}}>
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Selamat datang · 欢迎" tabIndex={-1} className="max-h-full w-full max-w-[400px] overflow-y-auto rounded-xl border border-wood-400 bg-parchment-200 p-6 shadow-modal">
      <p className="label-cap">RUMAH 30 · BOGOR</p>
      <h2 className="mb-1 mt-2 font-display text-[27px] text-ink-900">Selamat datang</h2><p lang="zh-Hans" className="mb-5 text-[15px] text-ink-600">欢迎来到我们的婚礼花园</p>
      <ul className="grid gap-4">{ROWS.map(r=><li key={r.icon} className="flex gap-3"><span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-parchment-300 text-emerald-500">{r.icon}</span><div><p className="text-[13px] leading-6 text-ink-900">{r.id}</p><p lang="zh-Hans" className="mt-1 text-[12px] leading-5 text-ink-600">{r.zh}</p></div></li>)}</ul>
      <button type="button" onClick={()=>{audio.play('click');onClose();}} className="btn-primary mt-6 w-full">Mulai Jelajahi · 开始探索 →</button>
      <a href={`/undangan/${window.location.search}`} className="mt-3 flex min-h-tap items-center justify-center text-center text-[12px] text-emerald-500 underline underline-offset-4">Langsung lihat undangan · 直接阅读邀请</a>
    </div>
  </div>;
}
