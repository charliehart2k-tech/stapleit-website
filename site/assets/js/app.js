(function(){
  const toggle=document.getElementById('menu-toggle');
  const mobile=document.getElementById('mobile-menu');
  function closeMobile(){
    if(!toggle||!mobile)return;
    mobile.hidden=true;
    toggle.setAttribute('aria-expanded','false');
  }
  toggle?.addEventListener('click',()=>{
    const open=toggle.getAttribute('aria-expanded')==='true';
    mobile.hidden=open;
    toggle.setAttribute('aria-expanded',String(!open));
  });
  mobile?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMobile));

  const details=[...document.querySelectorAll('.nav-details')];
  details.forEach(d=>d.addEventListener('toggle',()=>{if(d.open)details.forEach(o=>{if(o!==d)o.open=false})}));
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.nav-details'))details.forEach(d=>d.open=false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){details.forEach(d=>d.open=false);closeMobile()}});

  document.querySelectorAll('.nav-pill').forEach(pill=>{
    const tap=()=>{pill.classList.remove('is-tapped'); void pill.offsetWidth; pill.classList.add('is-tapped');};
    pill.addEventListener('click',tap);
    pill.addEventListener('keydown',e=>{if(e.key==='Enter' || e.key===' '){tap();}});
  });

  const bankHolidays=new Set([
    '2026-01-01','2026-04-03','2026-04-06','2026-05-04','2026-05-25','2026-08-31','2026-12-25','2026-12-28',
    '2027-01-01','2027-03-26','2027-03-29','2027-05-03','2027-05-31','2027-08-30','2027-12-27','2027-12-28'
  ]);
  function parts(now=new Date()){
    const a=new Intl.DateTimeFormat('en-GB',{
      timeZone:'Europe/London',weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false
    }).formatToParts(now);
    const m=Object.fromEntries(a.map(p=>[p.type,p.value]));
    return {weekday:m.weekday,date:`${m.year}-${m.month}-${m.day}`,hour:Number(m.hour)};
  }
  function datePlus(dateString,n){const d=new Date(dateString+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10);}
  function dayName(dateString){return new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',weekday:'long'}).format(new Date(dateString+'T12:00:00Z'));}
  function businessDay(dateString){const d=dayName(dateString); return d!=='Saturday'&&d!=='Sunday'&&!bankHolidays.has(dateString);}
  function nextBusiness(dateString){for(let i=1;i<10;i++){const d=datePlus(dateString,i); if(businessDay(d))return {offset:i,day:dayName(d)};} return null;}
  function updateStatus(){
    const panel=document.getElementById('support-status');
    const title=document.getElementById('status-title');
    const msg=document.getElementById('status-message');
    if(!panel||!title||!msg)return;
    const p=parts();
    const weekday=['Mon','Tue','Wed','Thu','Fri'].includes(p.weekday);
    const open=weekday&&!bankHolidays.has(p.date)&&p.hour>=9&&p.hour<17;
    panel.classList.toggle('offline',!open);
    title.textContent=open?"We're online":"We're offline";
    if(open){msg.textContent='Support is open — Monday to Friday, 9am–5pm.';return}
    if(weekday&&!bankHolidays.has(p.date)&&p.hour<9){msg.textContent='Back at 9am today.';return}
    const next=nextBusiness(p.date);
    msg.textContent=next?(next.offset===1?'Back tomorrow at 9am.':`Back ${next.day} at 9am.`):'Back during our next support window.';
  }
  updateStatus();
  setInterval(updateStatus,60000);
})();
