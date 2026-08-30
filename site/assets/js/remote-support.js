(() => {
  const card = document.querySelector('[data-support-status]');
  if (!card) return;

  const pill = card.querySelector('[data-support-state]');
  const message = card.querySelector('[data-support-message]');
  const availability = card.querySelector('[data-support-availability]');
  const checked = card.querySelector('[data-support-checked]');
  const timeZone = 'Europe/London';

  const londonParts = date => Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year:'numeric', month:'2-digit', day:'2-digit', weekday:'long',
      hour:'2-digit', minute:'2-digit', hourCycle:'h23'
    }).formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, part.value])
  );

  const utcDate = (year, month, day) => new Date(Date.UTC(year, month - 1, day, 12));
  const addDays = (date, days) => new Date(date.getTime() + days * 86400000);
  const key = date => `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`;

  const easterSunday = year => {
    const a=year%19, b=Math.floor(year/100), c=year%100, d=Math.floor(b/4), e=b%4;
    const f=Math.floor((b+8)/25), g=Math.floor((b-f+1)/3), h=(19*a+b-d-g+15)%30;
    const i=Math.floor(c/4), k=c%4, l=(32+2*e+2*i-h-k)%7, m=Math.floor((a+11*h+22*l)/451);
    const month=Math.floor((h+l-7*m+114)/31), day=((h+l-7*m+114)%31)+1;
    return utcDate(year,month,day);
  };

  const firstMonday = (year, month) => {
    let date=utcDate(year,month,1);
    while(date.getUTCDay()!==1) date=addDays(date,1);
    return date;
  };
  const lastMonday = (year, month) => {
    let date=utcDate(year,month+1,0);
    while(date.getUTCDay()!==1) date=addDays(date,-1);
    return date;
  };

  const bankHolidaysForYear = year => {
    const holidays=new Map();
    const add=(date,name)=>holidays.set(key(date),name);

    let newYear=utcDate(year,1,1);
    if(newYear.getUTCDay()===6) newYear=utcDate(year,1,3);
    else if(newYear.getUTCDay()===0) newYear=utcDate(year,1,2);
    add(newYear,"New Year’s Day");

    const easter=easterSunday(year);
    add(addDays(easter,-2),'Good Friday');
    add(addDays(easter,1),'Easter Monday');
    add(firstMonday(year,5),'Early May bank holiday');
    add(lastMonday(year,5),'Spring bank holiday');
    add(lastMonday(year,8),'Summer bank holiday');

    const occupied=new Set();
    const christmas=utcDate(year,12,25), boxing=utcDate(year,12,26);
    for(const [date,name] of [[christmas,'Christmas Day'],[boxing,'Boxing Day']]){
      const dow=date.getUTCDay();
      if(dow!==0 && dow!==6){ add(date,name); occupied.add(key(date)); }
    }
    for(const [date,name] of [[christmas,'Christmas Day'],[boxing,'Boxing Day']]){
      const dow=date.getUTCDay();
      if(dow===0 || dow===6){
        let substitute=addDays(date,1);
        while(substitute.getUTCDay()===0 || substitute.getUTCDay()===6 || occupied.has(key(substitute))) substitute=addDays(substitute,1);
        add(substitute,`${name} substitute day`); occupied.add(key(substitute));
      }
    }
    return holidays;
  };

  const holidayMap = new Map();
  const nowYear = Number(londonParts(new Date()).year);
  for(let year=nowYear-1; year<=nowYear+5; year++){
    for(const [date,name] of bankHolidaysForYear(year)) holidayMap.set(date,name);
  }

  const isBusinessDay = date => {
    const dow=date.getUTCDay();
    return dow>=1 && dow<=5 && !holidayMap.has(key(date));
  };

  const nextOpenDate = now => {
    const p=londonParts(now);
    const current=utcDate(Number(p.year),Number(p.month),Number(p.day));
    const hour=Number(p.hour), minute=Number(p.minute);
    if(isBusinessDay(current) && (hour<9 || (hour===9 && minute===0))) return current;
    let candidate=addDays(current,1);
    while(!isBusinessDay(candidate)) candidate=addDays(candidate,1);
    return candidate;
  };

  const formatDate = date => new Intl.DateTimeFormat('en-GB', {
    timeZone:'UTC', weekday:'long', day:'numeric', month:'long'
  }).format(date);

  const update = () => {
    const now=new Date();
    const p=londonParts(now);
    const current=utcDate(Number(p.year),Number(p.month),Number(p.day));
    const hour=Number(p.hour), minute=Number(p.minute);
    const holiday=holidayMap.get(key(current));
    const online=isBusinessDay(current) && (hour>9 || (hour===9 && minute>=0)) && hour<17;

    card.dataset.state=online?'online':'offline';
    pill.textContent=online?'Online':'Offline';

    if(online){
      message.textContent='We’re online — the support team is available until 5:00 PM.';
      availability.textContent='Now · until 5:00 PM';
    }else{
      const next=nextOpenDate(now);
      const nextText=`${formatDate(next)} at 9:00 AM`;
      availability.textContent=`${formatDate(next)} · 9:00 AM`;
      if(holiday) message.textContent=`It’s the ${holiday} — we’ll be back ${nextText}.`;
      else if(current.getUTCDay()===0 || current.getUTCDay()===6) message.textContent=`It’s the weekend — we’ll be back ${nextText}.`;
      else if(hour<9) message.textContent=`We’re not open just yet — support starts ${formatDate(current)} at 9:00 AM.`;
      else message.textContent=`We’re offline for the day — we’ll be back ${nextText}.`;
    }

    checked.textContent=`Updated ${new Intl.DateTimeFormat('en-GB',{timeZone,hour:'numeric',minute:'2-digit'}).format(now)}`;
  };

  window.StapleSupportSchedule={bankHolidaysForYear,nextOpenDate};
  update();
  window.setInterval(update,60000);
})();

(() => {
  const root=document.querySelector('[data-shadergradient-root]');
  if(!root) return;
  let requested=false;
  const load=()=>{
    if(requested) return;
    requested=true;
    const script=document.createElement('script');
    script.src='/assets/js/remote-support-gradient.bundle.js';
    script.async=true;
    script.dataset.shadergradientLoader='';
    script.onerror=()=>{root.dataset.shadergradientState='fallback';};
    document.head.appendChild(script);
  };
  if(!('IntersectionObserver' in window)){load();return;}
  const observer=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();load();}
  },{rootMargin:'420px 0px',threshold:0.01});
  observer.observe(root);
})();

