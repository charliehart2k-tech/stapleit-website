import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

const mount = document.querySelector('[data-shadergradient-root]');

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

  const urlString = useMemo(() => {
    const params = new URLSearchParams({
      animate: reduced ? 'off' : 'on',
      axesHelper: 'off',
      bgColor1: '#03040a',
      bgColor2: '#03040a',
      brightness: '1.15',
      cAzimuthAngle: '175',
      cDistance: '4.1',
      cPolarAngle: '92',
      cameraZoom: '1',
      color1: '#315cff',
      color2: '#a855f7',
      color3: '#ff55c8',
      embedMode: 'off',
      envPreset: 'city',
      fov: '45',
      gizmoHelper: 'hide',
      grain: 'off',
      lightType: '3d',
      pixelDensity: mobile ? '1' : '1.2',
      positionX: '-0.35',
      positionY: '0.1',
      positionZ: '0',
      reflection: '0.08',
      rotationX: '48',
      rotationY: '0',
      rotationZ: '-58',
      shader: 'defaults',
      type: 'waterPlane',
      uAmplitude: '0',
      uDensity: '1.25',
      uFrequency: '5.5',
      uSpeed: '0.24',
      uStrength: '3.2',
      uTime: '0',
      wireframe: 'false',
      zoomOut: 'false'
    });
    return `https://www.shadergradient.co/customize?${params.toString()}`;
  }, [mobile, reduced]);

  useEffect(() => {
    if (mount) mount.dataset.shadergradientState = reduced ? 'static' : 'active';
  }, [reduced]);

  return (
    <ShaderGradientCanvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      pixelDensity={mobile ? 1 : 1.2}
      fov={45}
      lazyLoad={true}
      threshold={0.01}
      rootMargin="220px 0px"
      powerPreference="low-power"
    >
      <ShaderGradient control="query" urlString={urlString} />
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
