import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  TextInput, 
  PasswordInput, 
  Button, 
  Stack, 
  Anchor, 
  Alert,
  LoadingOverlay,
  Box
} from '@mantine/core'
import { IconAlertCircle, IconCheck, IconLock, IconUser, IconMail } from '@tabler/icons-react'
import { AuthContextType } from '../App'

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
    <Container size="sm" py={60}>
      <Paper shadow="md" p={40} radius="md" withBorder pos="relative">
        <LoadingOverlay visible={isLoading} />
        
        <Stack gap="md">
          <Box ta="center">
            <Title order={2} c="violet.6">User Registration</Title>
            <Text c="dimmed" size="sm" mt={5}>
              Fill the form to create your account
            </Text>
          </Box>
          
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Username"
                placeholder="Enter your username"
                leftSection={<IconUser size={16} />}
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              
              <TextInput
                label="Email"
                placeholder="Enter your email"
                leftSection={<IconMail size={16} />}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                leftSection={<IconLock size={16} />}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              
              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                leftSection={<IconLock size={16} />}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              
              <Button 
                type="submit" 
                variant="filled"
                size="md"
                fullWidth
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </Button>
            </Stack>
          </form>
          
          {message && (
            <Alert 
              icon={messageType === 'success' ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
              color={messageType === 'success' ? 'green' : 'red'}
              variant="light"
            >
              {message}
            </Alert>
          )}
          
          <Stack gap="xs" ta="center">
            <Anchor component={Link} to="/login" size="sm" c="violet.6">
              Already have an account? Login
            </Anchor>
            <Anchor component={Link} to="/" size="sm" c="gray.6">
              ← Back to Portfolio
            </Anchor>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}

export default Register
