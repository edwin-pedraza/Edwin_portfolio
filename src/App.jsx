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
        <Route path='/react' element = {< Home/>}/>
        <Route path='/react/blog/*' element = {< Blog/>}/>
        <Route path='/react/blog/blog-detail/:id' element={<BlogDetail/>} />
        <Route path='/react/admin' element = {< Admin/>}/>
        <Route path='/react/services/:slug' element={<ServiceDetail />} />
        {/* <Route path='/react/login' element = {< Blog/>}/> */}
      </Routes>
    </>
    
      
    
  )
}

export default App
