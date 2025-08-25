import { Link, useNavigate } from 'react-router-dom'
import { 
  AppShell, 
  Group, 
  Button, 
  Text, 
  Burger, 
  Box, 
  Stack,
  Anchor
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconLogout, IconDashboard, IconBook, IconUser } from '@tabler/icons-react'
import { AuthContextType } from '../App'

interface HeaderProps {
  authContext: AuthContextType
}

const Header = ({ authContext }: HeaderProps) => {
  const navigate = useNavigate()
  const [opened, { toggle, close }] = useDisclosure()

  const handleLogout = () => {
    authContext.logout()
    close()
    navigate('/')
  }

  const handleNavClick = () => {
    close()
  }

  return (
    <AppShell.Header h={70}>
      <Group h="100%" px="lg" justify="space-between">
        {/* Logo */}
        <Anchor component={Link} to="/" size="xl" fw={700} c="violet.6" td="none">
          DUSH
        </Anchor>
        
        {/* Desktop Navigation */}
        <Group gap="md" visibleFrom="sm">
          <Anchor component={Link} to="/blog" c="violet.6" fw={500} td="none">
            BLOG
          </Anchor>
          
          {authContext.isAuthenticated ? (
            <>
              <Anchor component={Link} to="/dashboard" c="violet.6" fw={500} td="none">
                DASHBOARD
              </Anchor>
              <Text size="sm" c="violet.6">
                Welcome, {authContext.user?.username}
              </Text>
              <Button 
                variant="outline" 
                size="sm" 
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
              >
                LOGOUT
              </Button>
            </>
          ) : (
            <>
              <Button 
                component={Link} 
                to="/login" 
                variant="filled" 
                size="sm"
                leftSection={<IconUser size={16} />}
              >
                LOGIN
              </Button>
              <Button 
                component={Link} 
                to="/register" 
                variant="outline" 
                size="sm"
              >
                REGISTER
              </Button>
            </>
          )}
        </Group>

        {/* Mobile Menu Burger */}
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      </Group>

      {/* Mobile Navigation */}
      {opened && (
        <Box hiddenFrom="sm" p="md" bg="white" style={{ borderTop: '1px solid #e9ecef' }}>
          <Stack gap="sm">
            <Anchor component={Link} to="/blog" c="violet.6" fw={500} td="none" onClick={handleNavClick}>
              <Group gap="xs">
                <IconBook size={16} />
                BLOG
              </Group>
            </Anchor>
            
            {authContext.isAuthenticated ? (
              <>
                <Anchor component={Link} to="/dashboard" c="violet.6" fw={500} td="none" onClick={handleNavClick}>
                  <Group gap="xs">
                    <IconDashboard size={16} />
                    DASHBOARD
                  </Group>
                </Anchor>
                <Text size="sm" c="violet.6">
                  Welcome, {authContext.user?.username}
                </Text>
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftSection={<IconLogout size={16} />}
                  onClick={handleLogout}
                  fullWidth
                >
                  LOGOUT
                </Button>
              </>
            ) : (
              <>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="filled" 
                  size="sm"
                  leftSection={<IconUser size={16} />}
                  onClick={handleNavClick}
                  fullWidth
                >
                  LOGIN
                </Button>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="outline" 
                  size="sm"
                  onClick={handleNavClick}
                  fullWidth
                >
                  REGISTER
                </Button>
              </>
            )}
          </Stack>
        </Box>
      )}
    </AppShell.Header>
  )
}

export default Header
