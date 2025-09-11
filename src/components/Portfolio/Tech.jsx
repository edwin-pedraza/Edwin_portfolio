

import { useEffect, useMemo, useState } from "react";
import { BallCanvas } from "./canvas";
import { SectionWrapper } from "./hoc";
import { technologies } from "./constants";
import { useSupabaseQuery } from "../../supabase/hooks";

// Render all as individual balls, but only when visible
const MAX_CANVASES = 100

function canUseWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    )
  } catch (_) {
    return false
  }
}

const Tech = () => {
  const { data: techRows } = useSupabaseQuery('technology', { orderBy: 'order' })
  const techList = useMemo(() => (
    Array.isArray(techRows) && techRows.length > 0
      ? techRows.map((t) => ({ name: t.name, icon: t.icon_url || undefined }))
      : technologies
  ), [techRows])

  const [webgl, setWebgl] = useState(true)
  useEffect(() => { setWebgl(canUseWebGL()) }, [])

  return (
    <div id='tech' className='mx-auto max-w-6xl flex flex-wrap justify-center gap-8'>
      {techList.map((technology, idx) => (
        <div key={technology.name} className='w-24 h-24 sm:w-28 sm:h-28'>
          {webgl && idx < MAX_CANVASES ? (
            <BallCanvas icon={technology.icon} />
          ) : (
            <div className='w-full h-full rounded-full bg-black-200 flex items-center justify-center'>
              {technology.icon && (
                <img src={technology.icon} alt={technology.name} className='w-3/4 h-3/4 object-contain rounded-full' />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SectionWrapper(Tech, "tech");
