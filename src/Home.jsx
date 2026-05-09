import { lazy, Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { 
  About,
  Contact,
  Hero,
  Navbar,
  Tech,
  Works,
} from './components/Portfolio';
import Resume from './components/Portfolio/Resume';

const StarsCanvas = lazy(() => import('./components/Portfolio/canvas/Stars'));

const Home =() => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const timeout = setTimeout(() => {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [location]);

  return (

    <>
    <div className='relative z-0 bg-primary'>
        <div > 
          <Navbar />
          <Hero />
          
        </div>

        <About />
        <Resume/>
        <Tech />
        <Works />
     
      </div>
      <div className='relative'>
        <Contact />
        <Suspense fallback={null}>
          <StarsCanvas />
        </Suspense>
      </div>
    </>
    
    
    
  )
}

export default Home
