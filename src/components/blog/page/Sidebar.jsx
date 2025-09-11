import { useMemo } from 'react'
import { supabase } from '../../../supabase/client'

export default function Sidebar({ posts = [], onSelectTag }) {
  const { data } = supabase.storage.from('Postimg').getPublicUrl('avatar/blog-author.png')
  const profile = null // could fetch from Supabase profile later
  const avatar = data?.publicUrl
  const tags = useMemo(() => Array.from(new Set(posts.map(p=>p.tag).filter(Boolean))), [posts])

  return (
    <aside className='space-y-6'>
      <div className='bg-white/5 border border-white/10 rounded-2xl p-5'>
        <div className='flex items-center gap-3'>
          {avatar ? <img src={avatar} alt='author' className='w-12 h-12 rounded-full object-cover'/> : <div className='w-12 h-12 rounded-full bg-white/10'/>}
          <div>
            <div className='text-sm opacity-80'>Author</div>
            <div className='font-semibold'>Edwin Pedraza</div>
          </div>
        </div>
        <p className='text-sm opacity-80 mt-3'>Thoughts on web, data and product. Tutorials, notes and experiments.</p>
      </div>

      <div className='bg-white/5 border border-white/10 rounded-2xl p-5'>
        <div className='font-semibold mb-3'>Categories</div>
        <div className='flex flex-wrap gap-2'>
          {tags.map(t => (
            <button key={t} onClick={()=>onSelectTag?.(t)} className='px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-sm'>{t}</button>
          ))}
        </div>
      </div>

      <div className='bg-white/5 border border-white/10 rounded-2xl p-5'>
        <div className='font-semibold mb-2'>Newsletter</div>
        <p className='text-sm opacity-80'>Get new posts in your inbox.</p>
        <input className='w-full mt-3 px-3 py-2 rounded bg-white/10 border border-white/10' placeholder='you@example.com' />
        <button className='mt-2 w-full px-3 py-2 rounded bg-blue-600'>Subscribe</button>
      </div>
    </aside>
  )
}

