import { useState } from 'react';
import { audio, haptic } from '../services/audio';
import { wedding, coupleNames } from '../data/weddingInfo';

interface Props { guestName: string; onOpened: () => void }

export function CoverLeaves({ position }: { position: 'top' | 'bottom' }) {
  return <span className={`cover-leaves ${position}`} aria-hidden="true"><svg viewBox="0 0 100 115" fill="none">
    <path d="M9 105 Q20 40 85 9" stroke="#829175" strokeWidth="1" />
    <g fill="#a3b092"><ellipse cx="17" cy="83" rx="6" ry="16" transform="rotate(-26 17 83)" />
      <ellipse cx="34" cy="67" rx="7" ry="17" transform="rotate(44 34 67)" />
      <ellipse cx="43" cy="43" rx="6" ry="15" transform="rotate(-30 43 43)" />
      <ellipse cx="66" cy="32" rx="6" ry="16" transform="rotate(49 66 32)" /></g>
    <g fill="#fffef9" stroke="#c9c6ab" strokeWidth=".6"><circle cx="27" cy="46" r="7"/><circle cx="74" cy="14" r="6"/></g>
  </svg></span>;
}

export default function CoverOpening({ guestName, onOpened }: Props) {
  const [opening, setOpening] = useState(false);
  const open = () => {
    if (opening) return;
    setOpening(true);
    haptic(18);
    void audio.unlock().then(() => { audio.play('seal'); void audio.startBgm(wedding.bgmUrl); });
    window.setTimeout(onOpened, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
  };
  return <section className={`opening-screen ${opening ? 'opening-leave' : ''}`} aria-label="Undangan pernikahan · 婚礼邀请">
    <div className="invitation-cover">
      <CoverLeaves position="top"/><CoverLeaves position="bottom"/>
      <p className="cover-kicker">THE WEDDING OF</p>
      <p className="cover-monogram" aria-hidden="true">{wedding.couple.groom.name[0]} &amp; {wedding.couple.bride.name[0]}</p>
      <h1 className="cover-names">{coupleNames}</h1>
      <p className="cover-date">20 DESEMBER 2026 · RUMAH 30</p>
      <hr className="cover-divider"/>
      <p className="cover-to">Kepada tamu terhormat<span lang="zh-Hans" className="cover-to-zh">致亲爱的来宾</span></p>
      <p className="cover-guest">{guestName || 'Tamu Undangan'}</p>
      <button type="button" className="cover-open" onClick={open} disabled={opening}>Buka Undangan · 开启邀请 <span aria-hidden="true">→</span></button>
      <p className="cover-footer">20 · 12 · 2026</p>
    </div>
  </section>;
}
