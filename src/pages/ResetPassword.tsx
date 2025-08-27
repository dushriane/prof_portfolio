import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
  Box,
  Stepper
} from '@mantine/core'
import { IconAlertCircle, IconCheck, IconMail, IconLock, IconArrowLeft } from '@tabler/icons-react'


const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [currentStep, setCurrentStep] = useState(token ? 1 : 0) // 0: Request reset, 1: Reset password
  
  // Request reset form
  const [email, setEmail] = useState('')
  
  // Reset password form
  const [resetData, setResetData] = useState({
    password: '',
    confirmPassword: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  
  const navigate = useNavigate()

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    try {
      const API_BASE_URL = 'http://localhost:3000'
      const response = await fetch(`${API_BASE_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage('Password reset link has been sent to your email!')
        setMessageType('success')
        setCurrentStep(1)
      } else {
        setMessage(data.error || 'Failed to send reset email')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (resetData.password !== resetData.confirmPassword) {
      setMessage('Passwords do not match')
      setMessageType('error')
      return
    }
    
    if (resetData.password.length < 6) {
      setMessage('Password must be at least 6 characters long')
      setMessageType('error')
      return
    }
    
    setIsLoading(true)
    setMessage('')
    
    try {
      const API_BASE_URL = 'http://localhost:3000'
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token || '', 
          password: resetData.password 
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...')
        setMessageType('success')
        
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setMessage(data.error || 'Failed to reset password')
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
            <Title order={2} c="violet.6">Reset Password</Title>
            <Text c="dimmed" size="sm" mt={5}>
              {currentStep === 0 ? 
                'Enter your email to receive a password reset link' : 
                'Enter your new password'
              }
            </Text>
          </Box>

          <Stepper active={currentStep} size="sm" mb="md">
            <Stepper.Step label="Request Reset" description="Enter email address" />
            <Stepper.Step label="Reset Password" description="Set new password" />
          </Stepper>
          
          {currentStep === 0 ? (
            <form onSubmit={handleRequestReset}>
              <Stack gap="md">
                <TextInput
                  label="Email Address"
                  placeholder="Enter your email address"
                  leftSection={<IconMail size={16} />}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
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
                  Send Reset Link
                </Button>
              </Stack>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <Stack gap="md">
                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
                  leftSection={<IconLock size={16} />}
                  value={resetData.password}
                  onChange={(e) => setResetData(prev => ({ 
                    ...prev, 
                    password: e.currentTarget.value 
                  }))}
                  required
                  disabled={isLoading}
                />
                
                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  leftSection={<IconLock size={16} />}
                  value={resetData.confirmPassword}
                  onChange={(e) => setResetData(prev => ({ 
                    ...prev, 
                    confirmPassword: e.currentTarget.value 
                  }))}
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
                  Reset Password
                </Button>
              </Stack>
            </form>
          )}
          
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
              <IconArrowLeft size={14} style={{ marginRight: 4 }} />
              Back to Login
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

export default ResetPassword