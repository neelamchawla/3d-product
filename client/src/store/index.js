import { proxy } from 'valtio';

const state = proxy({
  intro: true,
  color: '#EFBD48',
  isLogoReact: true,
  isLogoThree: false,
  isLogoPmndrs: false,
  isLogoTexture: false,
  isFullTexture: false,
  decals: ['react', 'threejs', 'pmndrs'],
  logoDecal: './logo-tshirt.png',
  fullDecal: './vite.svg',
  isGenerating: false,
  generatingType: 'logo',
});

export default state;