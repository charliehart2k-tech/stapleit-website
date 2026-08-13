/* Staple IT liquidGL progressive enhancement — glossy micro-surfaces only. */
(function(){
  'use strict';

  const surfaces=[...document.querySelectorAll('.js-liquid-surface')];
  if(!surfaces.length)return;

  const root=document.documentElement;
  const params=new URLSearchParams(location.search);
  const mode=(params.get('liquid')||'on').toLowerCase();
  const debug=params.get('liquiddebug')==='1';
  if(mode==='off'){root.dataset.liquidgl='disabled';return;}
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){root.dataset.liquidgl='reduced-motion';return;}

  const supportsWebGL=(()=>{
    try{
      const c=document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2')||c.getContext('webgl')||c.getContext('experimental-webgl')));
    }catch(_){
      return false;
    }
  })();
  if(!supportsWebGL){root.dataset.liquidgl='no-webgl';return;}

  surfaces.forEach((surface)=>surface.setAttribute('data-liquid-ignore',''));

  function showDebug(message){
    if(!debug)return;
    let box=document.getElementById('staple-liquid-debug');
    if(!box){
      box=document.createElement('div');
      box.id='staple-liquid-debug';
      box.setAttribute('data-liquid-ignore','');
      Object.assign(box.style,{
        position:'fixed',right:'14px',bottom:'14px',zIndex:'99999',maxWidth:'420px',padding:'10px 12px',
        border:'1px solid rgba(255,255,255,.18)',borderRadius:'12px',background:'rgba(0,0,0,.84)',color:'#dce7ff',
        font:'12px/1.45 monospace',pointerEvents:'none',whiteSpace:'pre-wrap'
      });
      document.body.appendChild(box);
    }
    box.textContent=message;
  }

  let initialising=false;
  let initialisedCount=0;

  async function init(){
    if(initialising)return;
    initialising=true;
    root.dataset.liquidgl='loading';

    try{
      const scriptURL=document.currentScript ? new URL(document.currentScript.src,document.baseURI) : new URL('assets/js/liquid-enhance.js',document.baseURI);
      const localVendor=new URL('vendor/liquidGL-2.0.1.js',scriptURL).href;
      const mod=await import(localVendor);
      const liquidGL=mod.default || window.liquidGL;
      if(typeof liquidGL!=='function')throw new Error('Local liquidGL module did not expose a callable function.');

      const runnable=surfaces.filter((surface)=>{
        const stageSelector=surface.dataset.liquidSnapshot;
        if(!stageSelector)return false;
        const stage=document.querySelector(stageSelector);
        if(!stage)return false;
        return true;
      });

      if(!runnable.length){
        root.dataset.liquidgl='no-stage';
        return;
      }

      runnable.forEach((surface,index)=>{
        const targetClass=`js-liquid-active-${index+1}`;
        const stageSelector=surface.dataset.liquidSnapshot;
        surface.classList.add(targetClass);
        liquidGL({
          target:`.${targetClass}`,
          snapshot:stageSelector,
          resolution:Number(surface.dataset.liquidResolution||1),
          refraction:Number(surface.dataset.liquidRefraction||0.0038),
          aberration:Number(surface.dataset.liquidAberration||0),
          bevelDepth:Number(surface.dataset.liquidBevelDepth||0.022),
          bevelWidth:Number(surface.dataset.liquidBevelWidth||0.12),
          frost:Number(surface.dataset.liquidFrost||0.18),
          shadow:false,
          specular:false,
          reveal:'none',
          tilt:false,
          magnify:Number(surface.dataset.liquidMagnify||1),
          on:{
            init(){
              initialisedCount += 1;
              root.dataset.liquidgl='active';
              showDebug(`liquidGL: active\nsurfaces: ${initialisedCount}/${runnable.length}\nmode: ${mode}\nvendor: self-hosted 2.0.1`);
            }
          }
        });
      });
    }catch(err){
      root.dataset.liquidgl='fallback';
      showDebug(`liquidGL: fallback\n${String(err)}`);
      console.warn('Staple liquidGL enhancement skipped; CSS glass remains active.',err);
    }
  }

  const stageNodes=[...new Set(surfaces.map((surface)=>surface.dataset.liquidSnapshot).filter(Boolean).map((selector)=>document.querySelector(selector)).filter(Boolean))];

  if('IntersectionObserver' in window && stageNodes.length){
    const observer=new IntersectionObserver((entries)=>{
      if(entries.some((entry)=>entry.isIntersecting)){
        observer.disconnect();
        init();
      }
    },{rootMargin:'240px 0px'});
    stageNodes.forEach((node)=>observer.observe(node));
  }else{
    init();
  }
})();
