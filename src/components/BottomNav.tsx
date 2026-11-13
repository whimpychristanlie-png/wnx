import type { Destination } from '../game/types';
import { audio } from '../services/audio';
interface Props { active: Destination | null; unread: number; onPick: (d: Destination) => void }
const ITEMS: { id: Destination; label: string; zh: string; icon: string }[] = [
  { id: 'pasangan', label: 'Mempelai', zh: '新人', icon: '♡' },
  { id: 'acara', label: 'Acara', zh: '婚礼流程', icon: '◷' },
  { id: 'rsvp', label: 'RSVP', zh: '出席回复', icon: '✉' },
  { id: 'photobox', label: 'Photobooth', zh: '合影', icon: '▣' },
];
export default function BottomNav({ active, unread, onPick }: Props) {
  return <nav aria-label="Menu undangan · 邀请菜单" className="absolute inset-x-0 bottom-0 z-30 px-3" style={{paddingBottom:'max(12px, env(safe-area-inset-bottom))'}}>
    <ul className="grid grid-cols-4 gap-1 rounded-xl border border-wood-400 bg-parchment-100 p-1.5 shadow-modal">
      {ITEMS.map(it => <li key={it.id} className="min-w-0">
        <button type="button" aria-current={active === it.id ? 'page' : undefined} onClick={() => {audio.play('click');onPick(it.id);}}
          className={`relative flex min-h-[68px] w-full flex-col items-center justify-center rounded-lg px-1 py-2 transition-colors ${active === it.id ? 'bg-emerald-500 text-parchment-100' : 'text-ink-900 hover:bg-parchment-300'}`}>
          <span aria-hidden="true" className="text-[21px] leading-6">{it.icon}</span>
          <span className="mt-1 text-[10px] font-semibold leading-4 sm:text-[11px]">{it.label}</span>
          <span lang="zh-Hans" className="text-[10px] leading-4 opacity-75">{it.zh}</span>
          {it.id === 'rsvp' && unread > 0 && <span className="absolute right-1 top-1 rounded-full bg-emerald-500 px-1.5 text-[9px] text-white">{unread > 99 ? '99+' : unread}</span>}
        </button>
      </li>)}
    </ul>
  </nav>;
}
