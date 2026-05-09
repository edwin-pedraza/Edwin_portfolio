import { useEffect, useMemo, useState } from "react";
import { SectionWrapper } from "./hoc";
import { technologies } from "./constants";
import { useSupabaseQuery } from "../../supabase/hooks";
import { BallCanvas } from "./canvas";

function canUseWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch (_) {
    return false
  }
}

const Tech = () => {
  const { data: techRows } = useSupabaseQuery('technology', { orderBy: 'order' })
  const [webgl, setWebgl] = useState(true)

  useEffect(() => { setWebgl(canUseWebGL()) }, [])

  const techList = useMemo(() => (
    Array.isArray(techRows) && techRows.length > 0
      ? techRows.map((t) => ({ name: t.name, icon: t.icon_url || undefined }))
      : technologies
  ), [techRows])

  return (
    <div className='flex flex-wrap justify-center gap-8'>
      {techList.map((tech) => (
        <div key={tech.name} className='w-24 h-24 sm:w-28 sm:h-28'>
          {webgl ? (
            <BallCanvas icon={tech.icon} />
          ) : (
            <div className='w-full h-full rounded-full bg-black-200 flex items-center justify-center'>
              {tech.icon && <img src={tech.icon} alt={tech.name} className='w-3/4 h-3/4 object-contain' />}
            </div>
          )}
        </div>
      ))}
    </div>
  )
};

export default SectionWrapper(Tech, "tech");
