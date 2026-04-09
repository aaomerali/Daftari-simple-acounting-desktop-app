import { HashRouter } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './views/Login'
import { useAuthStore } from './store/authStore'

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  return (
    <HashRouter>
      {isAuthenticated ? <Layout /> : <Login />}
    </HashRouter>
  )
}

export default App
