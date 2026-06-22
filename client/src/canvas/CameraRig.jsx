import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { useSnapshot } from 'valtio';

import state from '../store';

// eslint-disable-next-line react/prop-types
const CameraRig = ({ children }) => {
  const group = useRef();
  const snap = useSnapshot(state);
  const [viewport, setViewport] = useState(() => ({
    isBreakpoint: window.innerWidth <= 1260,
    isMobile: window.innerWidth <= 600,
  }));

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        isBreakpoint: window.innerWidth <= 1260,
        isMobile: window.innerWidth <= 600,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useFrame((frameState, delta) => {
    if (!group.current) return;

    const { isBreakpoint, isMobile } = viewport;

    let targetPosition = [-0.4, 0, 2];
    if (snap.intro) {
      if (isBreakpoint) targetPosition = [0, 0, 2];
      if (isMobile) targetPosition = [0, 0.2, 2.5];
    } else if (isMobile) {
      targetPosition = [0, 0, 2.5];
    } else {
      targetPosition = [0, 0, 2];
    }

    easing.damp3(frameState.camera.position, targetPosition, 0.25, delta);

    easing.dampE(
      group.current.rotation,
      [
        -frameState.pointer.y / 5,
        frameState.pointer.x / 2,
        0,
      ],
      0.25,
      delta
    );
  });

  return <group ref={group}>{children}</group>;
};

export default CameraRig;
