import { useMemo } from 'react'
import bannerFallback from '../../../assets/banner.jpg'
import { supabase } from '../../../supabase/client'

export default function BlogHero() {
  // Get a public URL from Supabase storage if available
  const { data } = supabase.storage.from('Postimg').getPublicUrl('BanerPost/banner1.jpeg')
  const url = useMemo(() => data?.publicUrl || bannerFallback, [data])
  return (
    <div className='relative w-full overflow-hidden rounded-2xl mt-4'>
      <img src={url} alt='Blog banner' className='w-full h-[220px] md:h-[300px] object-cover' />
      <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
      <div className='absolute bottom-4 left-6 text-white'>
        <div className='text-sm opacity-80'>Insights & Updates</div>
        <h1 className='text-2xl md:text-3xl font-semibold'>Edwin Pedraza — Blog</h1>
      </div>
    </div>
  )
}

