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
  const canvas=document.querySelector('[data-support-shader]');
  if(!(canvas instanceof HTMLCanvasElement)) return;
  const panel=canvas.closest('.support-save-panel');
  if(!panel) return;

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
  if(!gl){canvas.dataset.shaderState='fallback';return;}

  const vertex='attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}';
  const fragment=`
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;
    float blob(vec2 p, vec2 c, float softness){vec2 d=p-c;return exp(-dot(d,d)*softness);}
    void main(){
      vec2 uv=gl_FragCoord.xy/u_resolution.xy;
      vec2 p=uv*2.0-1.0;
      p.x*=u_resolution.x/u_resolution.y;
      float t=u_time*0.23;
      vec2 c1=vec2(-0.72+0.34*sin(t*0.73),0.24+0.42*cos(t*0.61));
      vec2 c2=vec2(0.62+0.31*cos(t*0.57),-0.20+0.37*sin(t*0.81));
      vec2 c3=vec2(0.05+0.48*sin(t*0.41+1.6),0.08+0.34*cos(t*0.69+2.2));
      float b1=blob(p,c1,2.15),b2=blob(p,c2,2.35),b3=blob(p,c3,2.00);
      float wave=0.5+0.5*sin((p.x*1.35+p.y*1.08+sin(p.y*2.25+t)*0.42)*3.1+t*1.22);
      float cycle=0.5+0.5*sin(t*0.27),cycle2=0.5+0.5*sin(t*0.19+2.1);
      vec3 blue=mix(vec3(0.055,0.15,0.95),vec3(0.10,0.56,1.0),cycle2);
      vec3 violet=mix(vec3(0.45,0.12,0.95),vec3(0.70,0.20,0.96),cycle);
      vec3 pink=mix(vec3(0.92,0.18,0.78),vec3(1.0,0.34,0.58),cycle2);
      vec3 cyan=mix(vec3(0.06,0.72,0.92),vec3(0.20,0.42,1.0),cycle);
      vec3 col=vec3(0.006,0.009,0.025);
      col+=blue*b1*0.72+violet*b2*0.62+mix(pink,cyan,cycle)*b3*0.52;
      col+=mix(violet,pink,wave)*wave*(b1+b2+b3)*0.085;
      float vignette=1.0-smoothstep(0.65,1.55,length(p));
      col*=0.48+0.52*vignette;
      col=pow(col,vec3(0.92));
      gl_FragColor=vec4(col,1.0);
    }`;

  const shader=(type,source)=>{const item=gl.createShader(type);gl.shaderSource(item,source);gl.compileShader(item);if(!gl.getShaderParameter(item,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(item)||'Shader compile failed');return item;};
  let program;
  try{
    program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program)||'Shader link failed');
  }catch(error){canvas.dataset.shaderState='fallback';console.warn('Support shader unavailable',error);return;}

  gl.useProgram(program);
  const buffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const resolution=gl.getUniformLocation(program,'u_resolution');
  const time=gl.getUniformLocation(program,'u_time');
  let visible=false,raf=0,lastFrame=0;
  const start=performance.now();

  const resize=()=>{
    const rect=canvas.getBoundingClientRect();
    const mobile=window.matchMedia('(max-width: 700px)').matches;
    const dpr=Math.min(window.devicePixelRatio||1,mobile?1:1.2);
    const width=Math.max(1,Math.round(rect.width*dpr)),height=Math.max(1,Math.round(rect.height*dpr));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
  };
  const draw=stamp=>{
    raf=0;
    if(!visible&&!reduced.matches)return;
    if(!reduced.matches&&stamp-lastFrame<33){raf=requestAnimationFrame(draw);return;}
    lastFrame=stamp;resize();
    gl.uniform2f(resolution,canvas.width,canvas.height);
    gl.uniform1f(time,reduced.matches?7.0:(stamp-start)/1000);
    gl.drawArrays(gl.TRIANGLES,0,6);
    canvas.dataset.shaderState=reduced.matches?'static':'active';
    if(visible&&!reduced.matches)raf=requestAnimationFrame(draw);
  };
  const refresh=()=>{cancelAnimationFrame(raf);raf=0;if(visible||reduced.matches)raf=requestAnimationFrame(draw);};
  new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting===true;refresh();},{rootMargin:'180px 0px',threshold:0.01}).observe(panel);
  new ResizeObserver(()=>{resize();if(visible||reduced.matches)refresh();}).observe(panel);
  reduced.addEventListener?.('change',refresh);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else refresh();},{passive:true});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();canvas.dataset.shaderState='fallback';cancelAnimationFrame(raf);},{passive:false});
  resize();canvas.dataset.shaderState='ready';
})();
