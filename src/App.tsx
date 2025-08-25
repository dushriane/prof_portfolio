import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { MantineProvider, AppShell } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { theme } from './theme/mantineTheme'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './App.css'

// Components
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Blog from './pages/Blog'
import Post from './pages/Post'

// Hooks
import { useSmoothScroll, usePageLoading, useHoverEffects } from './hooks/useAnimations'

// Context for authentication
export interface User {
  id: string
  username: string
  email: string
  bio?: string
  profilePicture?: string
  role: string
  phone: string
  gender: string
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Initialize animation hooks
  useSmoothScroll()
  usePageLoading()
  useHoverEffects()

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (authToken: string, userData: User) => {
    setToken(authToken)
    setUser(userData)
    localStorage.setItem('authToken', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  const authContext: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token
  }

  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <Router>
        <AppShell header={{ height: 70 }} padding="md">
          <Header authContext={authContext} />
          <AppShell.Main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login authContext={authContext} />} />
              <Route path="/register" element={<Register authContext={authContext} />} />
              <Route path="/dashboard" element={<Dashboard authContext={authContext} />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/post/:id" element={<Post />} />
            </Routes>
          </AppShell.Main>
        </AppShell>
      </Router>
    </MantineProvider>
  )
}

export default App
