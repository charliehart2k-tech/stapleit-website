import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

const mount = document.querySelector('[data-shadergradient-root]');

const homepageLiquidProfile = {
  // ShaderGradient "Universe"-style waterPlane: broad, continuous folds with
  // black negative space rather than the noisy/crystalline cosmic shader.
  shader: 'defaults',
  type: 'waterPlane',
  color1: '#2738ff',
  color2: '#ff3bd4',
  color3: '#000000',
  uSpeed: 0.085,
  uStrength: 2.55,
  uDensity: 1.02,
  uFrequency: 5.5,
  uAmplitude: 0,
  positionX: -0.52,
  positionY: 0.08,
  positionZ: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 232,
  cAzimuthAngle: 180,
  cPolarAngle: 116,
  cDistance: 3.75,
  lightType: '3d',
  envPreset: 'city',
  brightness: 0.92,
  reflection: 0.12,
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
    mount.dataset.shadergradientProfile = 'universe-ribbon-waterplane';
  }, [reduced]);

  const props = useMemo(() => ({
    ...homepageLiquidProfile,
    animate: reduced ? 'off' : 'on',
    uTime: reduced ? 4.6 : 0,
    wireframe: false,
    zoomOut: false,
    toggleAxis: false,
    loop: 'on',
    loopDuration: 18
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
