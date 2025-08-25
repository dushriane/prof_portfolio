import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContextType } from '../App'
import './Register.css'

interface RegisterProps {
  authContext?: AuthContextType
}

const Register: React.FC<RegisterProps> = ({ authContext }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    // Password match check
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.')
      setMessageType('error')
      setIsLoading(false)
      return
    }
    
    try {
      const API_BASE_URL = 'http://localhost:3000'
      //const API_BASE_URL = 'https://arn-portfolio-backend.onrender.com'
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Store token and user data
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Update auth context
        if (authContext) {
          authContext.login(data.token, data.user)
        }
        
        setMessage('Registration successful! Redirecting...')
        setMessageType('success')
        
        // Redirect to blog
        setTimeout(() => {
          navigate('/blog')
        }, 1200)
      } else {
        setMessage(data.error || 'Registration failed')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>User Registration</h1>
          <p>Fill the form to create your account</p>
        </div>
        
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button 
            type="submit" 
            className="register-btn" 
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
        
        <div className="back-links">
          <Link to="/login">Already have an account? Login</Link>
          <Link to="/">← Back to Portfolio</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
