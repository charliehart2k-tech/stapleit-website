/* Staple IT liquidGL enhancement — multi-target, shared renderer, max three lenses. */
(function(){
  'use strict';

  const root=document.documentElement;
  const params=new URLSearchParams(location.search);
  const mode=(params.get('liquid')||'on').toLowerCase();
  const debug=params.get('liquiddebug')==='1';
  if(mode==='off'){root.dataset.liquidgl='disabled';return;}
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){root.dataset.liquidgl='reduced-motion';return;}

  const supportsWebGL=(()=>{
    try{
      const c=document.createElement('canvas');
      return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')||c.getContext('experimental-webgl')));
    }catch(_){return false;}
  })();
  if(!supportsWebGL){root.dataset.liquidgl='no-webgl';return;}

  const candidates=[...document.querySelectorAll('.js-liquid-surface')];
  const renderable=candidates.filter((el)=>{
    const style=getComputedStyle(el);
    const rect=el.getBoundingClientRect();
    return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>4&&rect.height>4;
  }).slice(0,3);

  if(!renderable.length){root.dataset.liquidgl='css-only';return;}

  /* liquidGL 2.0.1 deliberately has one renderer/canvas per page. The first
     call owns the snapshot target and resolution, so every Staple lens on a
     page is normalised to the same page-level snapshot instead of pretending
     later calls can use a different renderer snapshot. */
  const requestedSnapshots=renderable.map(el=>el.dataset.liquidSnapshot||'body');
  const sharedSnapshot=requestedSnapshots[0]||'body';
  const sharedResolution=Number(renderable[0].dataset.liquidResolution||1.5);
  if(requestedSnapshots.some(s=>s!==sharedSnapshot)){
    console.warn('Staple liquidGL: multiple snapshot selectors requested; using shared renderer snapshot:',sharedSnapshot);
  }

  const bool=(value,fallback)=>value==null?fallback:String(value).toLowerCase()!=='false';

  function debugBox(message){
    if(!debug)return;
    let box=document.getElementById('staple-liquid-debug');
    if(!box){
      box=document.createElement('div');
      box.id='staple-liquid-debug';
      Object.assign(box.style,{position:'fixed',right:'14px',bottom:'14px',zIndex:'99999',maxWidth:'430px',padding:'10px 12px',border:'1px solid rgba(255,255,255,.18)',borderRadius:'12px',background:'rgba(0,0,0,.88)',color:'#dce7ff',font:'12px/1.45 monospace',pointerEvents:'none',whiteSpace:'pre-wrap'});
      document.body.appendChild(box);
    }
    box.textContent=message;
  }

  (async()=>{
    root.dataset.liquidgl='loading';
    try{
      const scriptURL=document.currentScript?new URL(document.currentScript.src,document.baseURI):new URL('assets/js/liquid-enhance.js',document.baseURI);
      const localVendor=new URL('vendor/liquidGL-2.0.1.js',scriptURL).href;
      const mod=await import(localVendor);
      const liquidGL=mod.default||window.liquidGL;
      if(typeof liquidGL!=='function')throw new Error('Local liquidGL module did not expose a callable function.');

      let ready=0;
      renderable.forEach((surface,index)=>{
        const targetClass=`staple-liquid-target-${index+1}`;
        surface.classList.add(targetClass);
        liquidGL({
          target:`.${targetClass}`,
          snapshot:sharedSnapshot,
          resolution:sharedResolution,
          refraction:Number(surface.dataset.liquidRefraction||0.0048),
          aberration:Number(surface.dataset.liquidAberration||0.001),
          bevelDepth:Number(surface.dataset.liquidBevelDepth||0.055),
          bevelWidth:Number(surface.dataset.liquidBevelWidth||0.17),
          frost:Number(surface.dataset.liquidFrost||0.10),
          shadow:false,
          specular:bool(surface.dataset.liquidSpecular,true),
          reveal:'none',
          tilt:false,
          magnify:Number(surface.dataset.liquidMagnify||1),
          on:{init(){
            ready+=1;
            root.dataset.liquidgl='active';
            root.dataset.liquidglCount=String(ready);
            debugBox(`liquidGL active\n${ready}/${renderable.length} surfaces\nshared snapshot: ${sharedSnapshot}\nresolution: ${sharedResolution}\nvendor: 2.0.1 local`);
          }}
        });
      });
    }catch(err){
      root.dataset.liquidgl='fallback';
      debugBox(`liquidGL fallback\n${String(err)}`);
      console.warn('Staple liquidGL enhancement failed; plain black fallback remains.',err);
    }
  })();
})();
