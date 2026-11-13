import Modal from '../ui/Modal';
import {wedding,type WeddingEvent} from '../../data/weddingInfo';
import {useCountdown} from '../../hooks/useCountdown';
import {calendarUrl} from '../../services/calendar';
import DressCode from '../DressCode';
function EventCard({e,blessing}:{e:WeddingEvent;blessing:boolean}) {
  return <article className="overflow-hidden rounded-xl border border-wood-400 bg-parchment-100">
    <div className="h-1 bg-emerald-500"/>
    <div className="p-5">
      <p className="label-cap">{blessing?'PEMBERKATAN · 婚礼祝福仪式':'RESEPSI · 婚宴'}</p>
      <p className="mb-1 mt-4 font-display text-[31px] leading-10 text-ink-900">{blessing?'15.00':'17.00–20.00'} <span className="text-[14px]">WIB</span></p>
      {blessing&&<p className="text-[12px] text-ink-600">Hingga selesai · 至仪式结束</p>}
      <p className="mt-4 text-[13px] leading-6 text-ink-900">Minggu, 20 Desember 2026<br/><span lang="zh-Hans" className="text-ink-600">2026年12月20日 · 星期日</span></p>
      <hr className="my-4 border-0 border-t border-wood-400"/>
      <h3 className="font-display text-[22px] text-ink-900">{e.venue}</h3><p className="mt-2 text-[12px] leading-6 text-ink-600">{e.address}</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center justify-center px-2 text-center text-[12px]">Maps · 查看地图 ↗</a>
        <a href={calendarUrl(e)} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center justify-center px-2 text-center text-[12px]">Kalender · 日历</a>
      </div>
    </div>
  </article>;
}
export default function EventsModal({onClose}:{onClose:()=>void}) {
  const rem=useCountdown(wedding.ceremonyStart);
  return <Modal title="Acara · 婚礼流程" icon="◷" onClose={onClose}>
    <div className="mb-6 text-center"><p className="label-cap">MENUJU HARI BAHAGIA · 婚礼倒计时</p>
      {rem.past?<p className="mt-3 text-[15px] text-ink-900">Hari bahagia telah tiba · 幸福的日子到来了</p>:<div className="mt-4 grid grid-cols-4 gap-2">{[[rem.days,'Hari','天'],[rem.hours,'Jam','时'],[rem.mins,'Menit','分'],[rem.secs,'Detik','秒']].map(([n,id,zh])=><div key={id} className="rounded-lg border border-wood-400 bg-parchment-100 py-3"><b className="block font-display text-[25px] text-ink-900">{String(n).padStart(2,'0')}</b><span className="mt-1 block text-[10px] text-ink-600">{id} · {zh}</span></div>)}</div>}
    </div>
    <div className="grid gap-4"><EventCard e={wedding.events.akad} blessing/><EventCard e={wedding.events.resepsi} blessing={false}/></div>
    <DressCode/>
  </Modal>;
}
