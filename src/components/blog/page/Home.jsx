import { useEffect, useState } from 'react'
import { supabase } from "../../../supabase/client";
import Search from './Search'
import IntroPost from './IntroPost';
// import IntroPost from '../Components/IntroPost'
// import Blogs from '../Components/Blogs'


function Home() {
    const [post,setPost]=useState([])
    const [orgPost,setOrgPost]=useState([])

    useEffect(()=>{
        getPost();
    },[])




    async function getPost() {
      const { data: post } = await supabase.from("post").select();
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

    // console.log(post)
  return (
    <div >
      
       
        <Search selectedTag={(tag)=>filterPost(tag)} />

        {/* {post.length>0? <IntroPost post={post[0]} />:null} */}
        {/* {post.length>0?  <Blogs posts={post}/>:null} */}
    
      
    </div>
  )
}

export default Home
