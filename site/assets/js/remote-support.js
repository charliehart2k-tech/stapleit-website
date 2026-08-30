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
  const canvas=document.querySelector('[data-support-liquid]');
  if(!(canvas instanceof HTMLCanvasElement)) return;
  const panel=canvas.closest('.support-save-panel');
  if(!panel) return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
  if(!gl){canvas.dataset.liquidState='fallback';return;}

  const vertex='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const fragment=`
    precision mediump float;
    uniform vec2 r;
    uniform float t;

    vec3 palette(float q){
      vec3 navy=vec3(.012,.025,.070);
      vec3 steel=vec3(.115,.285,.520);
      vec3 cyan=vec3(.235,.610,.860);
      vec3 violet=vec3(.205,.170,.390);
      q=clamp(q,0.,1.);
      return q<.48?mix(navy,steel,q/.48):mix(steel,mix(cyan,violet,.28),(q-.48)/.52);
    }

    vec3 sheet(vec2 p,float off,float ph,float amp,float freq,float thick,float speed,vec3 base){
      float y=off+amp*sin(p.x*freq+ph+t*speed)
        +amp*.23*sin(p.x*freq*2.08-ph*.7-t*speed*.54)
        +amp*.10*sin(p.x*freq*.53+ph*1.8+t*speed*.31);
      float slope=amp*freq*cos(p.x*freq+ph+t*speed)
        +amp*.23*freq*2.08*cos(p.x*freq*2.08-ph*.7-t*speed*.54)
        +amp*.10*freq*.53*cos(p.x*freq*.53+ph*1.8+t*speed*.31);
      float cross=(p.y-y)/thick;
      float mask=1.-smoothstep(.88,1.04,abs(cross));
      float edge=exp(-pow((abs(cross)-.78)*5.0,2.0));
      vec3 n=normalize(vec3(-slope,1.,.62+.22*sin(cross*2.7+t*.15)));
      vec3 l=normalize(vec3(-.48,.78,.88));
      vec3 v=vec3(0.,0.,1.);
      float diffuse=.27+.73*max(dot(n,l),0.);
      float spec=pow(max(dot(reflect(-l,n),v),0.),18.);
      float sheen=pow(max(0.,1.-abs(cross+.16+.13*sin(p.x*2.2-t*.24))),8.);
      float ir=.5+.5*sin(p.x*1.15+t*.12+cross*1.8+ph);
      vec3 col=mix(base,palette(.38+.48*ir),.34);
      col*=.38+.72*diffuse;
      col+=vec3(.62,.80,1.0)*spec*.92;
      col+=vec3(.22,.56,.92)*sheen*.34;
      col+=vec3(.22,.48,.82)*edge*.14;
      return col*mask;
    }

    void main(){
      vec2 uv=gl_FragCoord.xy/r;
      vec2 p=uv*2.-1.;
      p.x*=r.x/r.y;
      p.x+=.075*sin(p.y*1.45+t*.10)+.025*sin(p.y*3.1-t*.07);
      p.y+=.035*sin(p.x*1.75-t*.08);

      vec3 bg=vec3(.003,.007,.018);
      float aura=exp(-dot(p-vec2(.25,.04),p-vec2(.25,.04))*.55);
      bg+=vec3(.018,.060,.125)*aura*.55;

      vec3 c=bg;
      vec3 s1=sheet(p,-.28,.7,.29,1.28,.31,.19,vec3(.035,.115,.270));
      vec3 s2=sheet(p,.18,2.5,.24,1.58,.25,-.15,vec3(.055,.095,.245));
      vec3 s3=sheet(p,.03,4.6,.17,2.08,.135,.11,vec3(.075,.205,.400));
      float m1=step(.001,length(s1)),m2=step(.001,length(s2)),m3=step(.001,length(s3));
      c=mix(c,s1,m1*.92);
      c=mix(c,s2,m2*.86);
      c=mix(c,s3,m3*.72);

      float glow=.018/(.055+abs(p.y-(.06+.21*sin(p.x*1.4+t*.13))));
      c+=vec3(.055,.19,.38)*min(glow,.20);
      float vignette=1.-smoothstep(.65,1.7,length(p));
      c*=.58+.42*vignette;
      c=pow(max(c,0.),vec3(.88));
      gl_FragColor=vec4(c,1.);
    }`;

  const compile=(type,src)=>{const shader=gl.createShader(type);gl.shaderSource(shader,src);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||'compile');return shader;};
  let program;
  try{
    program=gl.createProgram();
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));
    gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'link');
  }catch(error){canvas.dataset.liquidState='fallback';console.warn('Liquid ribbon shader unavailable',error);return;}

  gl.useProgram(program);
  const buf=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'a');
  gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const res=gl.getUniformLocation(program,'r'),time=gl.getUniformLocation(program,'t');
  let visible=false,raf=0,last=0;
  const born=performance.now();
  const resize=()=>{
    const box=canvas.getBoundingClientRect();
    const mobile=innerWidth<=700;
    const dpr=Math.min(devicePixelRatio||1,mobile?1:1.15);
    const w=Math.max(1,Math.round(box.width*dpr)),h=Math.max(1,Math.round(box.height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
  };
  const draw=stamp=>{
    raf=0;
    if(!visible&&!reduced.matches)return;
    if(!reduced.matches&&stamp-last<33){raf=requestAnimationFrame(draw);return;}
    last=stamp;resize();
    gl.uniform2f(res,canvas.width,canvas.height);
    gl.uniform1f(time,reduced.matches?5.6:(stamp-born)/1000);
    gl.drawArrays(gl.TRIANGLES,0,6);
    canvas.dataset.liquidState=reduced.matches?'static':'active';
    if(visible&&!reduced.matches)raf=requestAnimationFrame(draw);
  };
  const refresh=()=>{cancelAnimationFrame(raf);raf=0;if(visible||reduced.matches)raf=requestAnimationFrame(draw);};
  new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting===true;refresh();},{rootMargin:'220px 0px',threshold:.01}).observe(panel);
  new ResizeObserver(()=>{resize();refresh();}).observe(panel);
  reduced.addEventListener?.('change',refresh);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else refresh();},{passive:true});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(raf);canvas.dataset.liquidState='fallback';},{passive:false});
  resize();canvas.dataset.liquidState='ready';
})();

