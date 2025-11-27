import App from './App.jsx'; // <-- Add this import

import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AuthContexProvider } from './components/blog/context/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <AuthContexProvider>
      <App/>
    </AuthContexProvider>
  </BrowserRouter>
)
