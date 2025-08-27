import React, { useState } from 'react'
import { formatDate, truncateText, filterPosts } from '../utils/helpers'
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
  Group,
  Box
} from '@mantine/core'
import { IconAlertCircle, IconCheck, IconLock, IconUser } from '@tabler/icons-react'
import { AuthContextType } from '../App'
import { apiRequest, API_ENDPOINTS } from '../config/api'

interface LoginProps {
  authContext?: AuthContextType
}

const Login: React.FC<LoginProps> = ({ authContext }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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
    
    try {
      const API_BASE_URL = 'http://localhost:3000'
      //const API_BASE_URL = 'https://arn-portfolio-backend.onrender.com'
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      // const data = await response.json()
      const data = await apiRequest(API_ENDPOINTS.login, {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        // Store token and user data
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Update auth context
        if (authContext) {
          authContext.login(data.token, data.user)
        }
        
        setMessage('Login successful! Redirecting...')
        setMessageType('success')
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      } else {
        setMessage(data.error || 'Login failed')
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
            <Title order={2} c="violet.6">Login</Title>
            <Text c="dimmed" size="sm" mt={5}>
              Enter your credentials to access the admin dashboard
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
              
              <Group justify="flex-end">
                <Anchor component={Link} to="/reset-password" size="sm" c="violet.6">
                  Forgot your password?
                </Anchor>
              </Group>
              
              <Button 
                type="submit" 
                variant="filled"
                size="md"
                fullWidth
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
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
            <Anchor component={Link} to="/register" size="sm" c="violet.6">
              Don't have an account? Register
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

export default Login
