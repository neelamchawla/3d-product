import { lazy, Suspense } from 'react';
import Customizer from './pages/Customizer';
import Home from './pages/Home';

const Canvas = lazy(() => import('./canvas'));

function App() {
  return (
    <main id="main-content" className="app transition-all ease-in">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Home />
      <Suspense fallback={null}>
        <Canvas />
      </Suspense>
      <Customizer />
    </main>
  );
}

export default App;
