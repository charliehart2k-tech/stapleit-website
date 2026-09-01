(() => {
  'use strict';

  const timeZone = 'Europe/London';
  const holidayCache = new Map();
  const londonParts = date => Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year:'numeric', month:'2-digit', day:'2-digit', weekday:'long',
      hour:'2-digit', minute:'2-digit', hourCycle:'h23'
    }).formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, part.value])
  );
  const utcDate = (year, month, day) => new Date(Date.UTC(year, month - 1, day, 12));
  const addDays = (date, days) => new Date(date.getTime() + days * 86400000);
  const key = date => [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0')
  ].join('-');

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

  const holidayMapForYear = year => {
    if(holidayCache.has(year)) return holidayCache.get(year);
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
        add(substitute,name+' substitute day');
        occupied.add(key(substitute));
      }
    }
    holidayCache.set(year,holidays);
    return holidays;
  };

  const bankHolidaysForYear = year => new Map(holidayMapForYear(year));
  const holidayForDate = date => holidayMapForYear(date.getUTCFullYear()).get(key(date)) || '';
  const isBusinessDay = date => {
    const dow=date.getUTCDay();
    return dow>=1 && dow<=5 && !holidayForDate(date);
  };
  const currentLondonDate = now => {
    const parts=londonParts(now);
    return {
      parts,
      date:utcDate(Number(parts.year),Number(parts.month),Number(parts.day))
    };
  };
  const nextOpenDate = now => {
    const current=currentLondonDate(now);
    const hour=Number(current.parts.hour), minute=Number(current.parts.minute);
    if(isBusinessDay(current.date) && (hour<9 || (hour===9 && minute===0))) return current.date;
    let candidate=addDays(current.date,1);
    while(!isBusinessDay(candidate)) candidate=addDays(candidate,1);
    return candidate;
  };
  const formatDate = date => new Intl.DateTimeFormat('en-GB', {
    timeZone:'UTC', weekday:'long', day:'numeric', month:'long'
  }).format(date);

  const statusAt = now => {
    const current=currentLondonDate(now);
    const hour=Number(current.parts.hour), minute=Number(current.parts.minute);
    const holiday=holidayForDate(current.date);
    const weekend=current.date.getUTCDay()===0 || current.date.getUTCDay()===6;
    const online=isBusinessDay(current.date) && (hour>9 || (hour===9 && minute>=0)) && hour<17;

    if(online){
      return {
        online,
        holiday,
        message:'We’re online — the support team is available until 5:00 PM.',
        availability:'Now · until 5:00 PM',
        contactState:'Open now',
        contactDetail:'Until 5:00 PM today'
      };
    }

    const next=nextOpenDate(now);
    const nextText=formatDate(next)+' at 9:00 AM';
    if(holiday){
      return {
        online,
        holiday,
        message:'It’s the '+holiday+' — we’ll be back '+nextText+'.',
        availability:formatDate(next)+' · 9:00 AM',
        contactState:'Closed today',
        contactDetail:holiday+' · Back '+nextText
      };
    }
    if(weekend){
      return {
        online,
        holiday,
        message:'It’s the weekend — we’ll be back '+nextText+'.',
        availability:formatDate(next)+' · 9:00 AM',
        contactState:'Closed today',
        contactDetail:'Weekend · Back '+nextText
      };
    }
    if(hour<9){
      return {
        online,
        holiday,
        message:'We’re not open just yet — support starts '+formatDate(current.date)+' at 9:00 AM.',
        availability:formatDate(current.date)+' · 9:00 AM',
        contactState:'Closed now',
        contactDetail:'Opens today at 9:00 AM'
      };
    }
    return {
      online,
      holiday,
      message:'We’re offline for the day — we’ll be back '+nextText+'.',
      availability:formatDate(next)+' · 9:00 AM',
      contactState:'Closed now',
      contactDetail:'Back '+nextText
    };
  };

  window.StapleSupportSchedule={
    timeZone,
    bankHolidaysForYear,
    nextOpenDate,
    statusAt
  };

  const contactRows=[...document.querySelectorAll('[data-contact-hours]')];
  if(!contactRows.length) return;
  const updateContactHours = () => {
    const status=statusAt(new Date());
    contactRows.forEach(row => {
      const state=row.querySelector('[data-contact-hours-state]');
      const detail=row.querySelector('[data-contact-hours-detail]');
      row.dataset.state=status.online?'online':'offline';
      if(state && state.textContent!==status.contactState) state.textContent=status.contactState;
      if(detail && detail.textContent!==status.contactDetail) detail.textContent=status.contactDetail;
      row.setAttribute('aria-label',status.contactState+'. '+status.contactDetail);
    });
  };
  updateContactHours();
  window.setInterval(updateContactHours,60000);
})();
