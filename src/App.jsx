import { Route, Routes } from 'react-router-dom';
// import Education from './components/resume/Education';

import Blog from './components/blog/Blog';
import BlogDetail from './components/blog/page/BlogDetail';
import Home from './Home';
import Admin from './components/admin/Admin';

const App =() => {
  

  return (
    
    
    <>
    
      
      <Routes>
        <Route path='/react' element = {< Home/>}/>
        <Route path='/react/blog' element = {< Blog/>}/>
        <Route path='/react/blog/blog-detail/:id' element={<BlogDetail/>} />
        <Route path='/react/admin' element = {< Admin/>}/>
        {/* <Route path='/react/login' element = {< Blog/>}/> */}
      </Routes>
    </>
    
      
    
  )
}

export default App
