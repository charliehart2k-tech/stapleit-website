import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

const mount = document.querySelector('[data-shadergradient-root]');

const homepageLiquidProfile = {
  shader: 'cosmic',
  type: 'waterPlane',
  color1: '#080018',
  color2: '#3130e8',
  color3: '#e65af3',
  uSpeed: 0.075,
  uStrength: 0.62,
  uDensity: 0.58,
  uFrequency: 3.8,
  uAmplitude: 0,
  positionX: -0.22,
  positionY: 0.06,
  positionZ: 0,
  rotationX: 78,
  rotationY: 0,
  rotationZ: -38,
  cAzimuthAngle: 198,
  cPolarAngle: 59,
  cDistance: 3.15,
  lightType: '3d',
  envPreset: 'city',
  brightness: 0.43,
  reflection: 0.64,
  grain: 'off'
};

function SupportGradient() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 700px)').matches);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const phone = window.matchMedia('(max-width: 700px)');
    const onMotion = event => setReduced(event.matches);
    const onPhone = event => setMobile(event.matches);
    motion.addEventListener?.('change', onMotion);
    phone.addEventListener?.('change', onPhone);
    return () => {
      motion.removeEventListener?.('change', onMotion);
      phone.removeEventListener?.('change', onPhone);
    };
  }, []);

  useEffect(() => {
    if (!mount) return;
    mount.dataset.shadergradientState = reduced ? 'static' : 'active';
    mount.dataset.shadergradientProfile = 'neon-ribbon-cosmic-waterplane';
  }, [reduced]);

  const props = useMemo(() => ({
    ...homepageLiquidProfile,
    animate: reduced ? 'off' : 'on',
    uTime: reduced ? 4.6 : 0,
    wireframe: false,
    zoomOut: false,
    toggleAxis: false,
    loop: 'on',
    loopDuration: 16
  }), [reduced]);

  return (
    <ShaderGradientCanvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      pixelDensity={mobile ? 1 : 1.15}
      fov={45}
      lazyLoad={true}
      threshold={0.01}
      rootMargin="220px 0px"
      powerPreference="low-power"
    >
      <ShaderGradient control="props" {...props} />
    </ShaderGradientCanvas>
  );
}

if (mount) {
  try {
    createRoot(mount).render(<SupportGradient />);
  } catch (error) {
    mount.dataset.shadergradientState = 'fallback';
    console.warn('ShaderGradient unavailable', error);
  }
}
