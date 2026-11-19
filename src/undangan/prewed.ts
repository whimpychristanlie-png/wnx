import { PREWED_HIGHLIGHTS, PREWED_PHOTOS, type PhotoCategory, type PrewedPhoto } from '../data/prewed';

/** Album images are attached only as needed. The native dialog handles focus
 * trapping, Escape and returning keyboard focus to the control that opened it.
 */
export function initPrewed(hooks:{onVideoPlay:()=>void;onVideoStop:()=>void}) {
  const grid=document.querySelector<HTMLElement>('#albumGrid')!;
  const dialog=document.querySelector<HTMLDialogElement>('#photoViewer')!;
  const viewerImage=document.querySelector<HTMLImageElement>('#viewerImage')!;
  const viewerCaption=document.querySelector<HTMLElement>('#viewerCaption')!;
  const viewerCount=document.querySelector<HTMLElement>('#viewerCount')!;
  const allButton=document.querySelector<HTMLButtonElement>('#openAlbum')!;
  const video=document.querySelector<HTMLVideoElement>('#prewedVideo')!;
  const filters=[...document.querySelectorAll<HTMLButtonElement>('[data-album-filter]')];
  let category:PhotoCategory|'Semua'='Semua';
  let collection=PREWED_PHOTOS;
  let current=0;
  let opener:HTMLElement|null=null;

  const selected=()=>category==='Semua' ? PREWED_PHOTOS : PREWED_PHOTOS.filter(p=>p.category===category);
  const show=(index:number)=>{
    current=(index+collection.length)%collection.length;
    const photo=collection[current];
    viewerImage.src=photo.src;
    viewerImage.alt=photo.alt;
    viewerImage.width=photo.width;
    viewerImage.height=photo.height;
    viewerCaption.textContent=photo.alt;
    viewerCount.textContent=`${current+1} / ${collection.length}`;
    // One adjacent image, rather than downloading an entire hidden album.
    if(collection.length>1) { const next=new Image();next.src=collection[(current+1)%collection.length].src; }
  };
  const open=(id?:string)=>{
    collection=selected();
    opener=document.activeElement instanceof HTMLElement ? document.activeElement : null;
    show(Math.max(0,collection.findIndex(p=>p.id===id)));
    dialog.showModal();
    document.body.classList.add('album-open');
  };
  const tile=(photo:PrewedPhoto)=>{
    const button=document.createElement('button');
    button.type='button';button.className='album-tile';
    button.setAttribute('aria-label',`Perbesar foto: ${photo.alt}`);
    const image=new Image();image.src=photo.src;image.alt=photo.alt;
    image.width=photo.width;image.height=photo.height;
    image.loading='lazy';image.decoding='async';
    button.append(image);
    button.addEventListener('click',()=>open(photo.id));
    return button;
  };
  const render=()=>{
    const photos=selected();
    const highlights=category==='Semua' ? PREWED_HIGHLIGHTS.map(id=>photos.find(p=>p.id===id)!) : photos;
    grid.replaceChildren(...highlights.map(tile));
    allButton.textContent=`Buka ${photos.length} foto · 查看相册`;
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.albumFilter===category)));
  };
  filters.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.albumFilter as typeof category;render();
  }));
  allButton.addEventListener('click',()=>open());
  document.querySelector('#viewerClose')!.addEventListener('click',()=>dialog.close());
  document.querySelector('#viewerPrev')!.addEventListener('click',()=>show(current-1));
  document.querySelector('#viewerNext')!.addEventListener('click',()=>show(current+1));
  dialog.addEventListener('close',()=>{
    document.body.classList.remove('album-open');opener?.focus({preventScroll:true});
  });
  dialog.addEventListener('click',event=>{ if(event.target===dialog) dialog.close(); });
  dialog.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight') {
      event.preventDefault();show(current+(event.key==='ArrowLeft'?-1:1));
    }
  });
  let start:{x:number;y:number}|null=null;
  viewerImage.addEventListener('pointerdown',event=>{start={x:event.clientX,y:event.clientY};});
  viewerImage.addEventListener('pointerup',event=>{
    if(!start)return;
    const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;
    if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.3) show(current+(dx<0?1:-1));
  });
  viewerImage.addEventListener('pointercancel',()=>{start=null;});
  document.querySelectorAll<HTMLElement>('[data-prewed-photo]').forEach(button=>{
    button.addEventListener('click',()=>{
      category='Semua';render();open(button.dataset.prewedPhoto);
    });
  });
  video.addEventListener('play',hooks.onVideoPlay);
  video.addEventListener('pause',hooks.onVideoStop);
  video.addEventListener('ended',hooks.onVideoStop);
  video.addEventListener('error',()=>{
    document.querySelector<HTMLElement>('#videoFallback')!.hidden=false;
    hooks.onVideoStop();
  });
  render();
  return {pauseVideo:()=>video.pause(),videoPlaying:()=>!video.paused&&!video.ended};
}
