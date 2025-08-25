import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthContextType } from '../App'

interface HeaderProps {
  authContext: AuthContextType
}

const Header = ({ authContext }: HeaderProps) => {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    authContext.logout()
    setMobileMenuOpen(false)
    navigate('/')
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="header">
        <nav className="nav">
          <Link to="/" className="logo">
            DUSH
          </Link>
          
          <div className="nav-links">
            <Link to="/blog">BLOG</Link>
            {authContext.isAuthenticated ? (
              <>
                <Link to="/dashboard">DASHBOARD</Link>
                <span style={{ color: 'var(--accent-purple)', fontSize: '0.9rem' }}>
                  Welcome, {authContext.user?.username}
                </span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">
                  LOGIN
                </Link>
                <Link to="/register" className="btn btn-secondary">
                  REGISTER
                </Link>
              </>
            )}
          </div>

          <div className="hamburger" onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>
      </header>

      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <span className="close-menu" onClick={closeMobileMenu}>
          &times;
        </span>
        <Link to="/blog" onClick={closeMobileMenu}>BLOG</Link>
        {authContext.isAuthenticated ? (
          <>
            <Link to="/dashboard" onClick={closeMobileMenu}>DASHBOARD</Link>
            <span style={{ color: 'var(--accent-purple)' }}>
              Welcome, {authContext.user?.username}
            </span>
            <button onClick={handleLogout} className="btn btn-secondary">
              LOGOUT
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-primary" onClick={closeMobileMenu}>
              LOGIN
            </Link>
            <Link to="/register" className="btn btn-secondary" onClick={closeMobileMenu}>
              REGISTER
            </Link>
          </>
        )}
      </div>
    </>
  )
}

export default Header
