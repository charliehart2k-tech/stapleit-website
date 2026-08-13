/* Staple IT liquidGL progressive enhancement — one optical surface per page. */
(function(){
  'use strict';
  const root=document.documentElement;
  const params=new URLSearchParams(location.search);
  const mode=(params.get('liquid')||'on').toLowerCase();
  if(mode==='off'){root.dataset.liquidgl='disabled';return;}
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){root.dataset.liquidgl='reduced-motion';return;}

  const target=
    document.querySelector('.audit-gl-lens.js-liquid-surface') ||
    document.querySelector('.service-hero-lens.js-liquid-surface') ||
    document.querySelector('.support-hero-gl-lens.js-liquid-surface');

  if(!target){root.dataset.liquidgl='css-only';return;}
  const stageSelector=target.dataset.liquidSnapshot;
  const stage=stageSelector?document.querySelector(stageSelector):null;
  if(!stage){root.dataset.liquidgl='no-stage';return;}

  try{
    const c=document.createElement('canvas');
    if(!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')||c.getContext('experimental-webgl')))){
      root.dataset.liquidgl='no-webgl';return;
    }
  }catch(_){root.dataset.liquidgl='no-webgl';return;}

  target.setAttribute('data-liquid-ignore','');
  const originalStyle=target.getAttribute('style');

  function restore(reason){
    root.dataset.liquidgl='fallback';
    if(originalStyle===null)target.removeAttribute('style');
    else target.setAttribute('style',originalStyle);
    const renderer=window.__liquidGLRenderer__;
    if(renderer?.canvas)renderer.canvas.style.display='none';
    console.warn('Staple liquidGL fallback:',reason);
  }

  let started=false;
  async function init(){
    if(started)return;
    started=true;
    let watchdog;
    try{
      root.dataset.liquidgl='loading';
      const scriptURL=document.currentScript?new URL(document.currentScript.src,document.baseURI):new URL('assets/js/liquid-enhance.js',document.baseURI);
      const mod=await import(new URL('vendor/liquidGL-2.0.1.js',scriptURL).href);
      const liquidGL=mod.default||window.liquidGL;
      if(typeof liquidGL!=='function')throw new Error('liquidGL module unavailable');

      const activeClass='js-liquid-active-primary';
      target.classList.add(activeClass);
      let ready=false;
      watchdog=setTimeout(()=>{if(!ready)restore('initialisation timeout');},7000);

      liquidGL({
        target:`.${activeClass}`,
        snapshot:stageSelector,
        resolution:Number(target.dataset.liquidResolution||0.9),
        refraction:Number(target.dataset.liquidRefraction||0.0032),
        aberration:Number(target.dataset.liquidAberration||0),
        bevelDepth:Number(target.dataset.liquidBevelDepth||0.022),
        bevelWidth:Number(target.dataset.liquidBevelWidth||0.11),
        frost:Number(target.dataset.liquidFrost||0.14),
        shadow:false,
        specular:false,
        reveal:'fade',
        tilt:false,
        magnify:Number(target.dataset.liquidMagnify||1),
        on:{init(){ready=true;clearTimeout(watchdog);root.dataset.liquidgl='active';}}
      });
    }catch(err){clearTimeout(watchdog);restore(String(err));}
  }

  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();init();}
    },{rootMargin:'260px 0px'});
    observer.observe(stage);
  }else init();
})();
