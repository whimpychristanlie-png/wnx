import Modal from '../ui/Modal';
import { GiftIcon } from './GiftModal';
import { coupleNames, wedding, type Person } from '../../data/weddingInfo';
import { giftName } from '../../data/gifts';
import type { LoadedAssets } from '../../services/assets';
import type { GiftItem } from '../../game/types';
export type Moment = {kind:'greet'}|{kind:'gift';item:GiftItem};
function PersonCard({p,groom}:{p:Person;groom:boolean}) {
  return <article className="doc-card">
    <p className="label-cap">{groom?'THE GROOM · 新郎':'THE BRIDE · 新娘'}</p>
    <h3 className="mb-2 mt-2 font-display text-[25px] leading-8 text-ink-900">{p.fullName}</h3>
    <p className="mb-4 text-[12px] leading-6 text-ink-600">{p.orderInFamily}</p>
    <dl className="grid gap-3 rounded-lg bg-parchment-300 p-4 text-[13px]">
      <div className="grid grid-cols-[74px_1fr] gap-2"><dt className="text-ink-600">Ayah · 父亲</dt><dd className="font-semibold text-ink-900">{p.fatherName}</dd></div>
      <div className="grid grid-cols-[74px_1fr] gap-2"><dt className="text-ink-600">Ibu · 母亲</dt><dd className="font-semibold text-ink-900">{p.motherName}</dd></div>
    </dl>
    {p.instagram&&<a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-tap items-center text-[13px] text-emerald-500">@{p.instagram}</a>}
  </article>;
}
export default function CoupleModal({assets:_assets,moment,onPhoto,onClose}:{assets:LoadedAssets;moment?:Moment|null;onPhoto:()=>void;onClose:()=>void}) {
  return <Modal title="Mempelai · 新人" icon="♡" onClose={onClose}>
    {moment&&<section className="mb-5 rounded-xl border border-wood-400 bg-parchment-300 p-5 text-center">
      {moment.kind==='gift'&&<div className="mb-3 flex justify-center"><GiftIcon item={moment.item} size={48}/></div>}
      <h3 className="font-display text-[22px] leading-7 text-ink-900">{moment.kind==='gift'?`${giftName(moment.item)} sudah sampai`:'Terima kasih sudah hadir!'}</h3>
      <p lang="zh-Hans" className="mt-2 text-[13px] text-ink-600">感谢你与我们分享这份喜悦！</p>
      <button type="button" onClick={onPhoto} className="btn-primary mt-4 w-full">Foto Bersama · 一起合影</button>
      <button type="button" onClick={onClose} className="btn-ghost mt-2 w-full">Lanjut Jelajah · 继续探索</button>
    </section>}
    <div className="mb-6 overflow-hidden rounded-xl border border-wood-400 bg-parchment-100">
      <img src="/assets/couple-whimpy-xinxin.png" alt="Ilustrasi Whimpy dan Xinxin · 新人插画" className="aspect-[4/5] w-full object-cover object-top"/>
      <div className="px-4 py-5 text-center"><p className="label-cap">20 DESEMBER 2026 · RUMAH 30</p><h3 className="mt-2 font-display text-[27px] text-ink-900">{coupleNames}</h3></div>
    </div>
    <div className="grid gap-4"><PersonCard p={wedding.couple.groom} groom/><PersonCard p={wedding.couple.bride} groom={false}/></div>
    <section className="bible-card mt-6" aria-label="Kolose 3:14 · 歌罗西书 3:14">
      <p className="label-cap mb-4">KASIH YANG MEMPERSATUKAN · 以爱相连</p>
      <p lang="zh-Hans" className="text-ink-900">{wedding.quote.arabic}</p>
      <hr className="mx-auto my-5 w-12 border-0 border-t border-gold-500"/>
      <p className="text-[14px] leading-7 text-ink-600">{wedding.quote.translation}</p>
      <p className="mt-4 text-[11px] leading-5 text-ink-600">{wedding.quote.source}</p>
    </section>
  </Modal>;
}
