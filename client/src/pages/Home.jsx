import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';

import state from '../store';
import { CustomButton } from '../components';
import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation
} from '../config/motion';

const Home = () => {
  const snap = useSnapshot(state);

  return (
    <AnimatePresence>
      {snap.intro && (
        <motion.section className="home" aria-labelledby="home-heading" {...slideAnimation('left')}>
          <motion.header {...slideAnimation("down")}>
            <img
              src="./threejs.png"
              alt="Three.js logo"
              className="w-8 h-8 object-contain"
              width={32}
              height={32}
            />
          </motion.header>

          <motion.div className="home-content" {...headContainerAnimation}>
            <motion.div {...headTextAnimation}>
              <h1 id="home-heading" className="head-text">
                LET&apos;S <br className="xl:block hidden" /> DO IT.
              </h1>
            </motion.div>
            <motion.div
              {...headContentAnimation}
              className="flex flex-col gap-5"
            >
              <p className="max-w-md font-normal text-ink-muted text-base leading-relaxed">
                Create your unique and exclusive shirt with our brand-new 3D customization tool. <strong className="text-ink font-semibold">Unleash your imagination</strong> and define your own style.
              </p>

              <CustomButton
                type="filled"
                title="Customize It"
                handleClick={() => { state.intro = false; }}
                customStyles="w-fit px-4 py-2.5 font-bold text-sm"
              />
            </motion.div>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default Home;
