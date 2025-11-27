import { Route, Routes } from 'react-router-dom';
// import Education from './components/resume/Education';

import Blog from './components/blog/Blog';
import BlogDetail from './components/blog/page/BlogDetail2';
import Home from './Home';
import Admin from './components/admin/Admin';
import { ServiceDetail } from './components/Portfolio/Services';

const App =() => {
  

  return (
    
    
    <>
    
      
      <Routes>
        <Route path='/' element = {< Home/>}/>
        <Route path='/blog/*' element = {< Blog/>}/>
        <Route path='/blog/blog-detail/:id' element={<BlogDetail/>} />
        <Route path='/admin' element = {< Admin/>}/>
        <Route path='/services/:slug' element={<ServiceDetail />} />
        {/* <Route path='/login' element = {< Blog/>}/> */}
      </Routes>
    </>
    
      
    
  )
}

export default App
