import { useEffect, useRef, type ReactNode } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { audio } from '../../services/audio';
interface Props {title:string;icon:string;onClose:()=>void;children:ReactNode;footer?:ReactNode;tall?:boolean}
export default function Modal({title,icon,onClose,children,footer,tall}:Props) {
  const ref=useRef<HTMLDivElement>(null);useFocusTrap(ref,onClose);
  useEffect(()=>{audio.duck(true);return()=>audio.duck(false);},[]);
  const startY=useRef<number|null>(null);
  return <div className="fixed inset-x-0 z-50 flex items-center justify-center px-3 sm:px-5" style={{background:'var(--veil-strong)',top:'var(--vv-top,0px)',height:'var(--vv-height,100svh)',paddingTop:'max(12px,env(safe-area-inset-top))',paddingBottom:'max(12px,env(safe-area-inset-bottom))'}} onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={`flex max-h-full w-full max-w-stage flex-col overflow-hidden rounded-xl border border-wood-400 bg-parchment-100 shadow-modal outline-none ${tall?'h-full':''}`} style={{animation:'wq-rise 180ms ease-out'}}>
      <header className="flex min-h-[60px] shrink-0 items-center gap-3 border-b border-wood-400 bg-parchment-100 px-4 py-3" onTouchStart={e=>{startY.current=e.touches[0].clientY;}} onTouchEnd={e=>{if(startY.current!==null&&e.changedTouches[0].clientY-startY.current>90)onClose();startY.current=null;}}>
        <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-parchment-300 text-[17px] text-emerald-500">{icon}</span>
        <h2 className="min-w-0 flex-1 font-display text-[18px] leading-6 text-ink-900">{title}</h2>
        <button type="button" aria-label="Tutup · 关闭" onClick={()=>{audio.play('close');onClose();}} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-wood-400 text-xl text-ink-900 hover:bg-parchment-300">×</button>
      </header>
      <div className="grow overflow-y-auto overscroll-contain bg-parchment-200 px-5 py-6">{children}</div>
      {footer&&<div className="shrink-0 border-t border-wood-400 bg-parchment-100 px-4 py-3">{footer}</div>}
    </div>
  </div>;
}
