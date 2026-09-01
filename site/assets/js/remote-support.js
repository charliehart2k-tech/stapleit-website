(() => {
  const card = document.querySelector('[data-support-status]');
  const schedule = window.StapleSupportSchedule;
  if (!card || !schedule) return;

  const pill = card.querySelector('[data-support-state]');
  const message = card.querySelector('[data-support-message]');
  const availability = card.querySelector('[data-support-availability]');
  const checked = card.querySelector('[data-support-checked]');

  const update = () => {
    const now=new Date();
    const status=schedule.statusAt(now);
    card.dataset.state=status.online?'online':'offline';
    pill.textContent=status.online?'Online':'Offline';
    message.textContent=status.message;
    availability.textContent=status.availability;
    checked.textContent='Updated '+new Intl.DateTimeFormat('en-GB',{
      timeZone:schedule.timeZone,
      hour:'numeric',
      minute:'2-digit'
    }).format(now);
  };

  update();
  window.setInterval(update,60000);
})();

(() => {
  const video=document.querySelector('[data-support-save-video]');
  if(!video) return;
  const source=video.querySelector('source[data-src]');
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let loaded=false;
  let observer;

  const play=()=>{
    if(motion.matches) return;
    if(!loaded && source){
      source.src=source.dataset.src;
      video.load();
      loaded=true;
    }
    const promise=video.play();
    if(promise && typeof promise.catch==='function') promise.catch(()=>{});
  };

  const pause=()=>{
    video.pause();
    if(video.readyState>0) video.currentTime=0;
  };

  const watch=()=>{
    if(observer) observer.disconnect();
    if(motion.matches){pause();return;}
    if(!('IntersectionObserver' in window)){play();return;}
    observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting) play();
        else video.pause();
      }
    },{rootMargin:'180px 0px',threshold:0.01});
    observer.observe(video);
  };

  watch();
  if(typeof motion.addEventListener==='function') motion.addEventListener('change',watch);
  else if(typeof motion.addListener==='function') motion.addListener(watch);
})();

