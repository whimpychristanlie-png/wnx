import { DRESS_COLORS } from '../data/presentation';
export default function DressCode() {
  return <section aria-labelledby="dress-title" className="doc-card mt-5 text-center">
    <p className="label-cap">DRESS CODE · 着装建议</p>
    <h3 id="dress-title" className="mb-1 mt-2 font-display text-[23px] text-ink-900">Garden Semi-Formal</h3>
    <p lang="zh-Hans" className="mb-6 text-[13px] text-ink-600">花园半正式着装</p>
    <div className="dress-swatches">{DRESS_COLORS.map(c=><div key={c.name}><span className="dress-swatch" style={{backgroundColor:c.hex}} aria-hidden="true"/><b className="block text-[12px] font-semibold text-ink-900">{c.name}</b><span lang="zh-Hans" className="mt-1 block text-[10px] text-ink-600">{c.zh}</span></div>)}</div>
    <p className="mb-0 mt-5 text-[12px] leading-5 text-ink-600">Warna di atas merupakan saran, bukan kewajiban.<br/><span lang="zh-Hans">以上颜色仅供参考，不作强制要求。</span></p>
  </section>;
}
