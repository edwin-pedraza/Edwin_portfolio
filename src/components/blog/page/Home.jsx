import PropTypes from 'prop-types'

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../supabase/client'
import { listPosts } from '../../../supabase/posts'
import BlogHero from './BlogHero'
import PostsGrid from './PostsGrid'
import FeaturedPost from './FeaturedPost'
import Sidebar from './Sidebar'

function deriveCategory(post, strategy = 'tag') {
  if (strategy === 'title') {
    return post?.title ? post.title.split(' ')[0] : 'General'
  }
  return post?.tag || 'General'
}

export default function Home({ blogSettings, loading }) {
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [session, setSession] = useState(null)
  const navigate = useNavigate()
  const strategy = blogSettings?.categoryStrategy || 'tag'

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    fetchPosts()
  }, [])

  async function fetchPosts() {
    const data = await listPosts()
    setPosts(data)
    setFilteredPosts(data)
  }

  const categories = useMemo(() => {
    const base = new Set(['All'])
    posts.forEach((post) => base.add(deriveCategory(post, strategy)))
    return Array.from(base)
  }, [posts, strategy])

  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredPosts(posts)
    } else {
      setFilteredPosts(posts.filter((post) => deriveCategory(post, strategy) === activeCategory))
    }
  }, [activeCategory, posts, strategy])

  const featured = useMemo(() => (filteredPosts.length ? filteredPosts[0] : null), [filteredPosts])
  const rest = useMemo(() => (filteredPosts.length ? filteredPosts.slice(1) : []), [filteredPosts])

  return (
    <div className="space-y-10">
      <BlogHero blogSettings={blogSettings} loading={loading} />
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1 text-sm transition ${
                cat === activeCategory ? 'bg-slate-900 text-white border-slate-900 shadow' : 'border-white/60 text-slate-700 hover:border-white/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            <FeaturedPost post={featured} />
            <PostsGrid posts={rest} />
          </div>
          <Sidebar
            posts={posts}
            onSelectCategory={setActiveCategory}
            activeCategory={activeCategory}
            strategy={strategy}
            blogSettings={blogSettings}
          />
        </div>
      </div>

      {session && (
        <div className="fixed bottom-6 right-6">
          <button
            className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-400"
            onClick={() => navigate('/react/blog/create')}
          >
            New post
          </button>
        </div>
      )}
    </div>
  )
}
Home.propTypes = {
  blogSettings: PropTypes.shape({
    categoryStrategy: PropTypes.oneOf(['tag', 'title']),
  }),
  loading: PropTypes.bool,
}
