/* eslint-disable react/no-unknown-property */
// import React from 'react'
import { easing } from 'maath';
import { useSnapshot } from 'valtio';
import { useFrame } from '@react-three/fiber';
import { Decal, useGLTF, useTexture, Html } from '@react-three/drei';

import state from '../store';
import { LOADING_GIF_URL } from '../config/constants';

const Shirt = () => {
  const snap = useSnapshot(state);
  const { nodes, materials } = useGLTF('/shirt_baked.glb');
  // console.log(state);

  const logoTextureReact = useTexture(`/${snap.decals[0]}.png`);
  const logoTextureThree = useTexture(`/${snap.decals[1]}.png`);
  const logoTexturePmndrs = useTexture(`/${snap.decals[2]}.png`);

  const logoTexture = useTexture(snap.logoDecal);
  const fullTexture = useTexture(snap.fullDecal);

  useFrame((state, delta) => easing.dampC(materials.lambert1.color, snap.color, 0.25, delta));

  const stateString = JSON.stringify(snap);
  const loadingPosition = snap.generatingType === 'full' ? [0, 0, 0.15] : [0, 0.04, 0.15];
  const loadingSize = snap.generatingType === 'full' ? 54 : 54;

  return (
    <group key={stateString}>
      <mesh
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={materials.lambert1}
        material-roughness={1}
        dispose={null}
      >
        {!snap.isGenerating && snap.isFullTexture && (
          <Decal
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={1}
            map={fullTexture}
          />
        )}

        {!snap.isGenerating && snap.isLogoReact && (
          <Decal
            position={[0, 0.04, 0.15]}
            rotation={[0, 0, 0]}
            scale={0.15}
            map={logoTextureReact}
            map-anisotropy={16}
            depthTest={false}
            depthWrite={true}
          />
        )}
        {!snap.isGenerating && snap.isLogoThree && (
          <Decal
            position={[0, 0.04, 0.15]}
            rotation={[0, 0, 0]}
            scale={0.15}
            map={logoTextureThree}
            map-anisotropy={16}
            depthTest={false}
            depthWrite={true}
          />
        )}
        {!snap.isGenerating && snap.isLogoPmndrs && (
          <Decal
            position={[0, 0.04, 0.15]}
            rotation={[0, 0, 0]}
            scale={0.15}
            map={logoTexturePmndrs}
            map-anisotropy={16}
            depthTest={false}
            depthWrite={true}
          />
        )}

        {!snap.isGenerating && snap.isLogoTexture && (
          <Decal
            position={[0, 0.04, 0.15]}
            rotation={[0, 0, 0]}
            scale={0.15}
            map={logoTexture}
            map-anisotropy={16}
            depthTest={false}
            depthWrite={true}
          />
        )}
      </mesh>

      {snap.isGenerating && (
        <Html
          position={loadingPosition}
          center
          transform
          sprite
          distanceFactor={1.2}
          zIndexRange={[100, 0]}
        >
          <img
            src={LOADING_GIF_URL}
            alt="Generating logo..."
            width={loadingSize}
            height={loadingSize}
            className="pointer-events-none select-none"
          />
        </Html>
      )}
    </group>
  )
}

export default Shirt