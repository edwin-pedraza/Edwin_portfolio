import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from "../../../supabase/client";
import BlogHero from './BlogHero'
import Search from './Search'
import PostsGrid from './PostsGrid'
import FeaturedPost from './FeaturedPost'
import Sidebar from './Sidebar'
import IntroPost from './IntroPost';
// import IntroPost from '../Components/IntroPost'
// import Blogs from '../Components/Blogs'


function Home() {
    const [post,setPost]=useState([])
    const [orgPost,setOrgPost]=useState([])
    const [session, setSession] = useState(null)
    const navigate = useNavigate()

    useEffect(()=>{
        getPost();
        supabase.auth.getSession().then(({ data }) => setSession(data.session))
    },[])




    async function getPost() {
      const { data: post } = await supabase.from("post").select('*').order('published_at', { ascending: false })
      setPost(post);
      setOrgPost(post);
    }

    const filterPost=(tag)=>{
      if(tag=='All')
      {
        setPost(orgPost);
        return ;
      }
      const result=orgPost.filter(item=>item.tag==tag);
      setPost(result);
    }

    const featured = useMemo(()=> post && post.length ? post[0] : null, [post])
    const rest = useMemo(()=> post && post.length ? post.slice(1) : [], [post])
  return (
    <div className='relative'>
      <BlogHero />
      <div className='max-w-6xl mx-auto px-4'>
        <Search selectedTag={(tag)=>filterPost(tag)} />
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6'>
          <div className='lg:col-span-2 space-y-8'>
            <FeaturedPost post={featured} />
            <PostsGrid posts={rest} />
          </div>
          <Sidebar posts={post} onSelectTag={filterPost} />
        </div>
      </div>

      {session && (
        <button
          className='fixed bottom-6 right-6 px-4 py-2 rounded-full bg-emerald-600 text-white shadow-lg'
          onClick={()=>navigate('/react/admin')}
          title='Create a new post in Admin'
        >
          New Post
        </button>
      )}
    </div>
  )
}

export default Home
