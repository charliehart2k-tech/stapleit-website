import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

const mount = document.querySelector('[data-shadergradient-root]');

const homepageLiquidProfile = {
  shader: 'cosmic',
  type: 'waterPlane',
  color1: '#02040b',
  color2: '#183956',
  color3: '#749cb8',
  uSpeed: 0.11,
  uStrength: 1.05,
  uDensity: 1.15,
  uFrequency: 5.5,
  uAmplitude: 0,
  positionX: -0.38,
  positionY: 0.1,
  positionZ: 0,
  rotationX: 64,
  rotationY: 0,
  rotationZ: -50,
  cAzimuthAngle: 194,
  cPolarAngle: 70,
  cDistance: 2.8,
  lightType: '3d',
  envPreset: 'city',
  brightness: 0.24,
  reflection: 0.8,
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
    mount.dataset.shadergradientProfile = 'homepage-liquid-cosmic-waterplane';
  }, [reduced]);

  const props = useMemo(() => ({
    ...homepageLiquidProfile,
    animate: reduced ? 'off' : 'on',
    uTime: reduced ? 4.6 : 0,
    wireframe: false,
    zoomOut: false,
    toggleAxis: false,
    loop: 'on',
    loopDuration: 12
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
