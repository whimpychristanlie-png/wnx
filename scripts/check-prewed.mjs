import './_register-ts.mjs';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const {PREWED_PHOTOS,PREWED_HIGHLIGHTS}=await import('../src/data/prewed.ts');
let checks=0;
const ok=(value,message)=>{assert.ok(value,message);checks++;};
ok(PREWED_PHOTOS.length===14,'all fourteen supplied photographs belong to the album');
ok(new Set(PREWED_PHOTOS.map(p=>p.id)).size===14,'each photo has a unique identity');
for(const photo of PREWED_PHOTOS) {
  ok(existsSync(`public${photo.src}`),`${photo.id}: file exists`);
  ok(photo.width>0 && photo.height>0 && photo.alt.includes('·'),`${photo.id}: dimensions and bilingual caption exist`);
}
ok(PREWED_HIGHLIGHTS.every(id=>PREWED_PHOTOS.some(p=>p.id===id)),'every highlight belongs to the album');
const html=readFileSync('undangan/index.html','utf8');
ok(html.indexOf('id="film"')<html.indexOf('id="mempelai"'),'film is near the top, before the couple profiles');
ok(html.includes('preload="none"') && !/<video[^>]*autoplay/.test(html),'film loads on demand and never autoplays');
ok(html.includes('/assets/prewed/cover.jpg') && html.includes('/assets/prewed/portrait.jpg'),'the two lead photos retain separate roles');
ok(existsSync('public/assets/prewed/prewed-film.mp4') && existsSync('public/assets/prewed/film-poster.jpg'),'video and poster exist');

let element;
class FakeAudio {
  paused=true;duration=57;currentTime=10;volume=0;
  constructor(src){this.src=src;element=this;}
  addEventListener(){}
  play(){this.paused=false;return Promise.resolve();}
  pause(){this.paused=true;}
}
class FakeContext {state='running';resume(){return Promise.resolve();}}
globalThis.Audio=FakeAudio;
globalThis.window={AudioContext:FakeContext,matchMedia:()=>({matches:false}),setInterval:()=>1,clearInterval:()=>undefined};
globalThis.requestAnimationFrame=(fn)=>{fn(performance.now()+3000);return 1;};
const {audio}=await import('../src/services/audio.ts');
const track='/assets/audio/test.mp3';
await audio.unlock();audio.prepareBgm(track);await audio.startBgm(track);
ok(audio.playing,'music begins after the user opens the invitation');
audio.pauseForVideo();ok(!audio.playing && element.paused,'video suspends the background track');
audio.pauseForHidden();audio.resumeFromVideo();
ok(element.paused,'ending a video in a hidden tab does not start the music');
audio.resumeFromHidden();await Promise.resolve();
ok(audio.playing,'music returns when both interruptions have ended');
audio.toggleBgm(track);ok(!audio.playing,'the user can switch music off');
audio.pauseForVideo();audio.resumeFromVideo();await Promise.resolve();
ok(!audio.playing,'ending a video preserves the user\'s OFF preference');
audio.pauseForVideo();await audio.startBgm(track);
ok(!audio.playing,'even a pending music start stays suspended during video');
audio.resumeFromVideo();await Promise.resolve();
ok(audio.playing && element.volume>0,'a track requested during video starts audibly afterwards');
audio.pauseForVideo();audio.pauseForVideo();audio.resumeFromVideo();await Promise.resolve();
ok(audio.playing,'duplicate media events do not leave music stuck on pause');
audio.pauseForHidden();audio.pauseForVideo();audio.resumeFromHidden();
ok(element.paused,'returning to the tab does not play music over an active video');
audio.resumeFromVideo();await Promise.resolve();
ok(audio.playing,'the track returns once the foreground video is paused');
console.log(`✓ prewed album + media audio: ${checks} checks passed`);
