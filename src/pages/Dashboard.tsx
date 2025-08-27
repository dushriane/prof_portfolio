import React, { useState, useEffect, useRef } from 'react'
import './Dashboard.css'
import { API_BASE_URL, API_ENDPOINTS, apiRequest } from '../config/api'
import { formatDate, timeAgo, validateEmail, handleApiError, truncateText, getAuthToken, clearAuthData } from '../utils/helpers'
import { 
  Container,  
  Card, 
  Title, 
  Text, 
  Group, 
  Button, 
  TextInput, 
  Select, 
  Loader, 
  Stack, 
  Paper,
  SimpleGrid,
  Badge,
  ActionIcon,
  Menu,
  Alert,
  AppShell,
  NavLink,
  Box,
  ScrollArea,
  Textarea,
  FileInput,
  PasswordInput,
  Pagination,
  LoadingOverlay,
  Notification as MantineNotification,
  useMantineColorScheme
} from '@mantine/core'
import { 
  IconDashboard, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye, 
  IconDotsVertical,
  IconSearch,
  IconFilter,
  IconAlertCircle,
  IconChartBar,
  IconCategory,
  IconFileExport,
  IconUser,
  IconPhoto,
  IconUpload,
  IconCheck,
  IconX,
  IconSun,
  IconMoon
} from '@tabler/icons-react'
import { AuthContextType } from '../App'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import Resizer from 'react-image-file-resizer'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  BarElement
)

interface Post {
  _id: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  imageUrl?: string
  published: boolean
  publishedAt?: string
  createdAt: string
  views: number
  author: {
    id: string
    username: string
  }
}

interface Category {
  name: string
  postCount?: number
}

interface DashboardStats {
  totalPosts: number
  totalViews: number
  totalCategories: number
  engagementRate: string
}

interface DashboardProps {
  authContext?: AuthContextType
}

const Dashboard: React.FC<DashboardProps> = ({ authContext }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'edit' | 'analytics' | 'categories' | 'export' | 'profile'>('dashboard')
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [postsPerPage] = useState(6)
  
  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    posts: false,
    categories: false,
    analytics: false,
    creating: false,
    updating: false,
    deleting: false,
    exporting: false
  })
  
  // Notification state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    show: boolean
  }>({ type: 'info', message: '', show: false })
  
  // Create Post Form State
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    published: false
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  
  // Category Management State
  const [newCategoryName, setNewCategoryName] = useState('')
  
  // Export State
  const [exportStep, setExportStep] = useState(0)
  const [exportOptions, setExportOptions] = useState({
    posts: true,
    comments: false,
    analytics: false
  })
  const [exportFormat, setExportFormat] = useState('json')
  
  const handleExportData = async () => {
    setLoadingStates(prev => ({ ...prev, exporting: true }))
    try {
      let dataToExport: any = {}
      if (exportOptions.posts) dataToExport.posts = posts
      if (exportOptions.analytics) dataToExport.analytics = analyticsData

      let fileContent = ''
      let mimeType = ''
      let fileName = ''

      if (exportFormat === 'json') {
          fileContent = JSON.stringify(dataToExport, null, 2)
          mimeType = 'application/json'
      } else if (exportFormat === 'csv') {
          if (exportOptions.posts && posts.length > 0) {
          // Create proper CSV headers
          const headers = ['Title', 'Category', 'Author', 'Views', 'Published', 'Created Date', 'Tags']
          const csvRows = [headers.join(',')]
          
          // Add data rows
          posts.forEach(post => {
            const row = [
              `"${post.title.replace(/"/g, '""')}"`, // Escape quotes in title
              `"${post.category}"`,
              `"${post.author.username}"`,
              post.views || 0,
              post.published ? 'Yes' : 'No',
              // `"${new Date(post.createdAt).toLocaleDateString()}"`,
              `"${formatDate(post.createdAt)}"`,
              `"${post.tags.join('; ')}"`
            ]
            csvRows.push(row.join(','))
          })
          
          fileContent = csvRows.join('\n')
          mimeType = 'text/csv'
          fileName = `blog-posts-${new Date().toISOString().split('T')[0]}.csv`
        } else {
          throw new Error('No posts data available for CSV export')
        }
      }

      const blob = new Blob([fileContent], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a) // Add to DOM
      a.click()
      document.body.removeChild(a) // Remove from DOM
      URL.revokeObjectURL(url)

      showNotification('success', 'Data exported successfully!')
      setExportStep(0)
    } catch (error) {
      handleApiError(error, 'Error exporting data')
    } finally {
      setLoadingStates(prev => ({ ...prev, exporting: false }))
    }
  }

  // Profile State
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    bio: '',
    phone: '',
    gender: 'male',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  
  // Analytics state
  const [timeRange, setTimeRange] = useState('30')
  const [analyticsData, setAnalyticsData] = useState<{
    totalViews: number
    engagementRate: number
    newReaders: number
    topPosts: any[]
    chartData: {
      labels: string[]
      datasets: {
        label: string
        data: number[]
        borderColor: string
        backgroundColor: string
      }[]
    }
  }>({
    totalViews: 0,
    engagementRate: 0,
    newReaders: 0,
    topPosts: [],
    chartData: {
      labels: [],
      datasets: []
    }
  })

  //const API_BASE_URL = 'http://localhost:3000'
  //const API_BASE_URL = 'https://arn-portfolio-backend.onrender.com'

  // Rich Text Editor modules
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  }

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'link', 'image'
  ]

  const isAdmin = () => {
    return authContext?.user?.role === 'admin'
  }

  // Show notification helper
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, show: true })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 5000)
  }

  // Error handling wrapper
  const handleApiError = (error: any, defaultMessage: string) => {
    console.error(error)
    const message = error?.message || defaultMessage
    showNotification('error', message)
  }

  // Image optimization function
  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        800, // maxWidth
        600, // maxHeight
        'JPEG', // compressFormat
        80, // quality
        0, // rotation
        (uri) => {
          const resizedFile = new File([uri as Blob], file.name, {
            type: 'image/jpeg',
          })
          resolve(resizedFile)
        },
        'blob'
      )
    })
  }

  useEffect(() => {
    console.log('Auth context:', authContext?.isAuthenticated, authContext?.user)
    if (authContext?.isAuthenticated) {
      console.log('Loading dashboard data...')
      loadDashboardData()
      loadUserPosts()
      loadCategories()
      loadAnalyticsData()

      if (authContext.user) {
        setProfileForm({
          username: authContext.user.username || '',
          email: authContext.user.email || '',
          bio: authContext.user.bio || '',
          phone: authContext.user.phone || '',
          gender: authContext.user.gender || 'male',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    }
  }, [authContext])


  const loadDashboardData = async () => {
    if (!isAdmin()) return
    
    setLoadingStates(prev => ({ ...prev, posts: true }))
    try {
      const data = await apiRequest(`${API_BASE_URL}/api/admin/dashboard/stats`)
      setStats(data)
    } catch (error) {
      console.error('Dashboard stats error:', error)
      showNotification('error', handleApiError(error))
    } finally {
      setLoadingStates(prev => ({ ...prev, posts: false }))
    }
  }

  const loadUserPosts = async (page = 1) => {
    setLoadingStates(prev => ({ ...prev, posts: true }))
    try {
      console.log('Loading posts - page:', page, 'search:', searchTerm, 'category:', selectedCategory)
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: postsPerPage.toString(),
        search: searchTerm,
        category: selectedCategory
      })
      
      const url = `${API_BASE_URL}/api/users/me/posts?${params}`
      console.log('Request URL:', url)
      
      const data = await apiRequest(url)
      console.log('Posts response:', data)
      
      if (data && data.posts) {
        setPosts(Array.isArray(data.posts) ? data.posts : [])
        setTotalPages(Math.ceil((data.total || 0) / postsPerPage))
        setCurrentPage(page)
      } else if (Array.isArray(data)) {
        // Handle case where API returns posts directly
        setPosts(data)
        setTotalPages(1)
        setCurrentPage(1)
      } else {
        console.warn('Unexpected posts response format:', data)
        setPosts([])
      }
    } catch (error) {
      console.error('Load posts error:', error)
      showNotification('error', handleApiError(error))
      setPosts([])
    } finally {
      setLoadingStates(prev => ({ ...prev, posts: false }))
    }
  }

  useEffect(() => {
    // Example: Update analytics data when timeRange changes
    if (authContext?.isAuthenticated) {
      loadAnalyticsData()
    }
  }, [timeRange, authContext])

  const loadAnalyticsData = async () => {
    setLoadingStates(prev => ({ ...prev, analytics: true }))
    try {
      const data = await apiRequest(`${API_BASE_URL}/api/analytics?timeRange=${timeRange}`)
      setAnalyticsData({
        totalViews: data.totalViews || 0,
        engagementRate: data.engagementRate || 0,
        newReaders: data.newReaders || 0,
        topPosts: data.topPosts || [],
        chartData: {
          labels: data.chartLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Views',
            data: data.chartData || [65, 59, 80, 81, 56, 55, 40],
            borderColor: 'rgb(139, 69, 19)',
            backgroundColor: 'rgba(139, 69, 19, 0.2)',
          }]
        }
      })
    } catch (error) {
      console.error('Analytics error:', error)
      // Generate analytics from existing posts data as fallback
      const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0)
      setAnalyticsData({
        totalViews,
        engagementRate: 0,
        newReaders: 0,
        topPosts: posts.slice(0, 5),
        chartData: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Views',
            data: generateMockChartData(totalViews),
            borderColor: 'rgb(139, 69, 19)',
            backgroundColor: 'rgba(139, 69, 19, 0.2)',
          }]
        }
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, analytics: false }))
    }
  }
  
  // Helper function for mock chart data
  const generateMockChartData = (totalViews: number) => {
    const base = Math.floor(totalViews / 7)
    return Array.from({ length: 7 }, () => base + Math.floor(Math.random() * base))
  }

  const loadCategories = async () => {
    setLoadingStates(prev => ({ ...prev, categories: true }))
    try {
      const data = await apiRequest(API_ENDPOINTS.categories)
      console.log('Categories loaded:', data)
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Categories error:', error)
      showNotification('error', handleApiError(error))
      setCategories([])
    } finally {
      setLoadingStates(prev => ({ ...prev, categories: false }))
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    setLoadingStates(prev => ({ ...prev, deleting: true }))
    try {
      await apiRequest(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE'
      })
      showNotification('success', 'Post deleted successfully')
      loadUserPosts(currentPage)
    } catch (error) {
      console.error('Delete post error:', error)
      showNotification('error', handleApiError(error))
    } finally {
      setLoadingStates(prev => ({ ...prev, deleting: false }))
    }
  }

  const handleEditPost = async (post: Post) => {
    setEditingPostId(post._id)
    setPostForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags.join(', '),
      published: post.published
    })
    setCurrentView('edit')
  }

  const handleCreatePost = async (isDraft = false) => {
    setLoadingStates(prev => ({ ...prev, creating: true }))
    
    try {
      // Validate required fields
      if (!postForm.title.trim()) {
        throw new Error('Post title is required')
      }
      if (!postForm.content.trim()) {
        throw new Error('Post content is required')
      }
      if (!postForm.category.trim()) {
        throw new Error('Post category is required')
      }

      const formData = new FormData()
      formData.append('title', postForm.title.trim())
      formData.append('content', postForm.content)
      formData.append('excerpt', postForm.excerpt.trim())
      formData.append('category', postForm.category.trim())
      
      // Handle tags
      const tagsArray = postForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      formData.append('tags', JSON.stringify(tagsArray))
      formData.append('published', (!isDraft).toString())
      
      if (selectedFile) {
        const optimizedFile = await resizeImage(selectedFile)
        formData.append('image', optimizedFile)
      }
      
      const url = editingPostId 
        ? `${API_BASE_URL}/api/posts/${editingPostId}`
        : API_ENDPOINTS.posts
      
      const method = editingPostId ? 'PUT' : 'POST'
      
      console.log('Creating/updating post:', { url, method, isDraft })
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to save post')
      }
      
      const message = editingPostId ? 'Post updated!' : (isDraft ? 'Draft saved!' : 'Post published!')
      showNotification('success', message)
      
      // Reset form
      setPostForm({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: '',
        published: false
      })
      setSelectedFile(null)
      setEditingPostId(null)
      setCurrentView('dashboard')
      loadUserPosts(currentPage)
      
    } catch (error) {
      console.error('Create post error:', error)
      showNotification('error', handleApiError(error))
    } finally {
      setLoadingStates(prev => ({ ...prev, creating: false }))
    }
  }

  const getDisplayAuthorName = (post: Post) => {
    // If the author is admin, show the portfolio owner's name
    if (post.author.username === 'admin' ) {
      return 'Ariane Dushime'
    }
    return post.author.username
  }

  const handleLogout = () => {
    clearAuthData()
    if (authContext?.logout) {
      authContext.logout()
    }
    window.location.href = '/login'
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    
    setLoadingStates(prev => ({ ...prev, categories: true }))
    try {
      await apiRequest(API_ENDPOINTS.categories, {
        method: 'POST',
        body: JSON.stringify({ name: newCategoryName.trim() })
      })
      
      setNewCategoryName('')
      loadCategories()
      showNotification('success', 'Category added successfully!')
    } catch (error) {
      console.error('Add category error:', error)
      showNotification('error', handleApiError(error))
    } finally {
      setLoadingStates(prev => ({ ...prev, categories: false }))
    }
  }

  const handleUpdateProfile = async () => {
    setLoadingStates(prev => ({ ...prev, updating: true }))
    try {
      const formData = new FormData()
      formData.append('bio', profileForm.bio)
      if (profileImage) {
        const optimizedImage = await resizeImage(profileImage)
        formData.append('profilePic', optimizedImage)
      }
      
      const response = await fetch(`${API_BASE_URL}/api/users/me/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      showNotification('success', 'Profile updated successfully!')
    } catch (error) {
      console.error('Update profile error:', error)
      showNotification('error', handleApiError(error))
    } finally {
      setLoadingStates(prev => ({ ...prev, updating: false }))
    }
  }

  const handleChangePassword = async () => {
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      showNotification('error', 'Passwords do not match')
      return
    }
    
    setLoadingStates(prev => ({ ...prev, updating: true }))
    try {
      await apiRequest(`${API_BASE_URL}/api/users/me/password`, {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword
        })
      })
      
      showNotification('success', 'Password changed successfully!')
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      console.error('Change password error:', error)
      showNotification('error', handleApiError(error))
    } finally {
      setLoadingStates(prev => ({ ...prev, updating: false }))
    }
  }

  const handleDeleteCategory = async (categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the "${categoryName}" category?`)) return
    
    setLoadingStates(prev => ({ ...prev, categories: true }))
    try {
      await apiRequest(`${API_BASE_URL}/api/categories/${categoryName}`, {
        method: 'DELETE'
      })
      
      loadCategories()
      showNotification('success', 'Category deleted successfully!')
    } catch (error) {
      console.error('Delete category error:', error)
      showNotification('error', handleApiError(error))
    } finally {
      setLoadingStates(prev => ({ ...prev, categories: false }))
    }
  }

  // Or if you don't have dynamic imports, wrap ReactQuill:
  const QuillWrapper = ({ value, onChange, ...props }: { 
    value: string; 
    onChange: (content: string) => void; 
    [key: string]: any 
  }) => {
    const quillRef = useRef<any>(null)
    
    return (
      <div>
        <ReactQuill
          ref={quillRef}
          value={value}
          onChange={onChange}
          {...props}
        />
      </div>
    )
  }

  // Handle search and filter changes
  useEffect(() => {
    if (authContext?.isAuthenticated) {
      loadUserPosts(1) // Reset to page 1 when search/filter changes
    }
  }, [searchTerm, selectedCategory])

  // Add debugging useEffect
  useEffect(() => {
    console.log('Posts state updated:', posts)
  }, [posts])

  // Redirect if not authenticated
  if (!authContext?.isAuthenticated) {
    return (
      <Container size="md" py={60}>
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          <Title order={3}>Access Denied</Title>
          <Text>Please log in to access the dashboard.</Text>
        </Alert>
      </Container>
    )
  }

  return (
    <AppShell
      navbar={{
        width: 300,
        breakpoint: 'sm',
      }}
      padding={0}
    >
      {/* Notification */}
      {notification.show && (
      <MantineNotification
        icon={notification.type === 'success' ? <IconCheck size={18} /> : <IconX size={18} />}
        color={notification.type === 'success' ? 'green' : 'red'}
        title={notification.type === 'success' ? 'Success' : 'Error'}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        {notification.message}
      </MantineNotification>
      )}

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Title order={3} c="violet.6" mb="md">Dashboard</Title>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea}>
          <Stack gap="xs">
            <NavLink
              href="#"
              label="Dashboard"
              leftSection={<IconDashboard size="1rem" />}
              active={currentView === 'dashboard'}
              onClick={(e) => {
                e.preventDefault()
                setCurrentView('dashboard')
              }}
              variant="filled"
            />
            
            <NavLink
              href="#"
              label="Create Post"
              leftSection={<IconPlus size="1rem" />}
              active={currentView === 'create'}
              onClick={(e) => {
                e.preventDefault()
                setCurrentView('create')
              }}
              className="dashboard-nav-link"
            />
            
            <NavLink
              href="#"
              label="Analytics"
              leftSection={<IconChartBar size="1rem" />}
              active={currentView === 'analytics'}
              onClick={(e) => {
                e.preventDefault()
                setCurrentView('analytics')
              }}
              className="dashboard-nav-link"
            />
            
            {isAdmin() && (
              <>
                <NavLink
                  href="#"
                  label="Categories"
                  leftSection={<IconCategory size="1rem" />}
                  active={currentView === 'categories'}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentView('categories')
                  }}
                  className="dashboard-nav-link"
                />
                
                <NavLink
                  href="#"
                  label="Export Data"
                  leftSection={<IconFileExport size="1rem" />}
                  active={currentView === 'export'}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentView('export')
                  }}
                  className="dashboard-nav-link"
                />
              </>
            )}
            
            <NavLink
              href="#"
              label="Profile"
              leftSection={<IconUser size="1rem" />}
              active={currentView === 'profile'}
              onClick={(e) => {
                e.preventDefault()
                setCurrentView('profile')
              }}
              className="dashboard-nav-link"
            />

            <NavLink
              href="#"
              label={`${colorScheme === 'dark' ? 'Light' : 'Dark'} Mode`}
              leftSection={colorScheme === 'dark' ? <IconSun size="1rem" /> : <IconMoon size="1rem" />}
              onClick={(e) => {
                e.preventDefault()
                toggleColorScheme()
              }}
              className="dashboard-nav-link"
            />
          </Stack>
        </AppShell.Section>

        {/* the sidebar user section */}
        <AppShell.Section>
          <Box p="sm" className='dashboard-user-section'>
            <Group justify="space-between">
              <Group gap="xs">
                <IconUser size="1rem" />
                <Text size="sm" c="dimmed">
                  {authContext?.user?.username}
                </Text>
              </Group>
              <Button 
                size="xs" 
                variant="subtle" 
                color="red"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Group>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main style={{paddingLeft: 0}}>
        <Container size="100%" px="md" py="md">
          {/* Header */}
          <Group justify="space-between" align="center" mb="lg">
            <Title order={2} c="violet.6">
              {currentView === 'dashboard' ? 'Dashboard Overview' :
               currentView === 'create' ? 'Create New Post' :
               currentView === 'edit' ? 'Edit Post' :
               currentView === 'analytics' ? 'Analytics' :
               currentView === 'categories' ? 'Manage Categories' :
               currentView === 'export' ? 'Export Data' :
               currentView === 'profile' ? 'Profile Settings' : 
               'Dashboard'}
            </Title>
            {currentView === 'dashboard' && (
              <Button 
                leftSection={<IconPlus size={16} />} 
                onClick={() => setCurrentView('create')}
                variant="filled"
              >
                Create Post
              </Button>
            )}
          </Group>

          {/* Dashboard Content */}
          {currentView === 'dashboard' && (
            <Stack gap="lg">
              {isAdmin() && stats && (
                <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
                  <Paper withBorder p="md" radius="md">
                    <Group justify="apart">
                      <div>
                        <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
                          Total Posts
                        </Text>
                        <Text fw={700} fz="xl">
                          {stats.totalPosts}
                        </Text>
                      </div>
                      <IconDashboard size={22} color="var(--mantine-color-violet-6)" />
                    </Group>
                  </Paper>
                  
                  <Paper withBorder p="md" radius="md">
                    <Group justify="apart">
                      <div>
                        <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
                          Total Views
                        </Text>
                        <Text fw={700} fz="xl">
                          {stats.totalViews}
                        </Text>
                      </div>
                      <IconEye size={22} color="var(--mantine-color-violet-6)" />
                    </Group>
                  </Paper>
                  
                  <Paper withBorder p="md" radius="md">
                    <Group justify="apart">
                      <div>
                        <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
                          Categories
                        </Text>
                        <Text fw={700} fz="xl">
                          {stats.totalCategories}
                        </Text>
                      </div>
                      <IconFilter size={22} color="var(--mantine-color-violet-6)" />
                    </Group>
                  </Paper>
                  
                  <Paper withBorder p="md" radius="md">
                    <Group justify="apart">
                      <div>
                        <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
                          Engagement Rate
                        </Text>
                        <Text fw={700} fz="xl">
                          {stats.engagementRate}
                        </Text>
                      </div>
                      <IconPlus size={22} color="var(--mantine-color-violet-6)" />
                    </Group>
                  </Paper>
                </SimpleGrid>
              )}

              {/* Search and Filter */}
              <Group grow>
                <TextInput
                  placeholder="Search posts..."
                  leftSection={<IconSearch size={16} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.currentTarget.value)}
                />
                <Select
                  placeholder="Filter by category"
                  data={[
                    { value: 'all', label: 'All Categories' },
                    ...categories.map(cat => ({ value: cat.name.toLowerCase(), label: cat.name }))
                  ]}
                  value={selectedCategory}
                  onChange={(value) => setSelectedCategory(value || 'all')}
                />
              </Group>

              {/* Posts Grid */}
              {loadingStates.posts ? (
                <Group justify="center" p="xl">
                  <Loader size="lg" />
                  <Text>Loading posts...</Text>
                </Group>
              ) : posts.length === 0 ? (
                <Paper p="xl" ta="center" c="dimmed">
                  <Text>No posts found.</Text>
                  <Text size="sm" c="dimmed" mt="xs">
                    Search: "{searchTerm}" | Category: "{selectedCategory}" | User: {authContext?.user?.username}
                  </Text>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    mt="md"
                    onClick={() => {
                      console.log('Retry loading posts...')
                      loadUserPosts(1)
                    }}
                  >
                    Retry Loading Posts
                  </Button>
                </Paper>
              ) : (
                <>
                  <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                    {posts.map((post) => (
                      <Card key={post._id} shadow="sm" padding="lg" radius="md" withBorder>
                        <Stack gap="sm">
                          <Group justify="space-between" align="flex-start">
                            <Title order={4} lineClamp={2}>{post.title}</Title>
                            <Menu shadow="md" width={200}>
                              <Menu.Target>
                                <ActionIcon variant="subtle" size="sm">
                                  <IconDotsVertical size={16} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item 
                                  leftSection={<IconEdit size={14} />}
                                  onClick={() => handleEditPost(post)}
                                >
                                  Edit
                                </Menu.Item>
                                <Menu.Item 
                                  leftSection={<IconTrash size={14} />}
                                  color="red"
                                  onClick={() => handleDeletePost(post._id)}
                                >
                                  Delete
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Group>
                          
                          <Text size="sm" c="dimmed" lineClamp={3}>
                            {post.excerpt || post.content.substring(0, 100) + '...'}
                          </Text>

                          <Text size="sm" c="gray.6" mt="xs">
                            By: {getDisplayAuthorName(post)}
                          </Text>
                          
                          <Text size="sm" c="dimmed">
                            Category: {post.category}
                          </Text>
                          
                          <Group justify="space-between">
                            <Badge color={post.published ? 'green' : 'yellow'} variant="light">
                              {post.published ? 'Published' : 'Draft'}
                            </Badge>
                            <Group gap="xs">
                              <IconEye size={14} />
                              <Text size="sm">{post.views || 0}</Text>
                            </Group>
                          </Group>
                          
                          <Text size="xs" c="dimmed">
                            {/* {new Date(post.createdAt).toLocaleDateString()} */}
                            {formatDate(post.createdAt)}
                          </Text>
                        </Stack>
                      </Card>
                    ))}
                  </SimpleGrid>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Group justify="center" mt="lg">
                      <Pagination
                        total={totalPages}
                        value={currentPage}
                        onChange={(page) => loadUserPosts(page)}
                      />
                    </Group>
                  )}
                </>
              )}
            </Stack>
          )}

        {/* Other views */}
        {(currentView === 'create' || currentView === 'edit') && (
          <Paper p="lg" withBorder>
            <Stack gap="md">
              <TextInput
                label="Post Title"
                placeholder="Enter post title"
                required
                value={postForm.title}
                onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                label="Excerpt"
                placeholder="Brief description of your post"
                minRows={3}
                value={postForm.excerpt}
                onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.currentTarget.value }))}
              />
              <Select
                label="Category"
                placeholder="Select category"
                data={categories.map(cat => ({ value: cat.name, label: cat.name }))}
                value={postForm.category}
                onChange={(value) => setPostForm(prev => ({ ...prev, category: value || '' }))}
                required
              />
              <TextInput
                label="Tags"
                placeholder="Enter tags separated by commas"
                value={postForm.tags}
                onChange={(e) => setPostForm(prev => ({ ...prev, tags: e.currentTarget.value }))}
              />
              {/* Featured Image Upload */}
              <FileInput
                label="Featured Image"
                placeholder="Choose image file"
                leftSection={<IconPhoto size={16} />}
                accept="image/*"
                value={selectedFile}
                onChange={setSelectedFile}
              />
              
              {/* Image Preview */}
              {selectedFile && (
                <Paper p="sm" withBorder>
                  <Text size="sm" mb="xs">Image Preview:</Text>
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="Preview" 
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                  />
                </Paper>
              )}

              {/* Rich Text Content Area */}
              <div>
                <Text size="sm" fw={500} mb="xs">Content</Text>
                <QuillWrapper
                  theme="snow"
                  value={postForm.content}
                  onChange={(content) => setPostForm(prev => ({ ...prev, content }))}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ minHeight: '300px' }}
                /> 
              </div>

              <Group justify="flex-end">
                <Button 
                  variant="outline" 
                  onClick={() => handleCreatePost(true)}
                  loading={loadingStates.creating}
                >
                  Save as Draft
                </Button>
                <Button 
                  leftSection={<IconUpload size={16} />}
                  onClick={() => handleCreatePost(false)}
                  loading={loadingStates.creating}
                >
                  {editingPostId ? 'Update Post' : 'Publish Post'}
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}
        
        {/* Analytics view */}
        {currentView === 'analytics' && (
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Title order={3}>Blog Analytics</Title>
              <Select
                value={timeRange}
                onChange={(value) => setTimeRange(value || '30')}
                data={[
                  { value: '7', label: 'Last 7 Days' },
                  { value: '30', label: 'Last 30 Days' },
                  { value: '90', label: 'Last 90 Days' },
                  { value: '365', label: 'Last Year' }
                ]}
                w={150}
              />
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={500}>Total Views</Text>
                    <IconChartBar size={20} color="var(--mantine-color-violet-6)" />
                  </Group>
                  <Text size="xl" fw={700} c="violet.6">{analyticsData.totalViews.toLocaleString()}</Text>
                  <Text size="sm" c="green">+12% from last month</Text>
                </Stack>
              </Card>
              
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={500}>Engagement Rate</Text>
                    <IconEye size={20} color="var(--mantine-color-violet-6)" />
                  </Group>
                  <Text size="xl" fw={700} c="violet.6">{analyticsData.engagementRate}%</Text>
                  <Text size="sm" c="blue">↑ 5% from last month</Text>
                </Stack>
              </Card>
              
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={500}>New Readers</Text>
                    <IconUser size={20} color="var(--mantine-color-violet-6)" />
                  </Group>
                  <Text size="xl" fw={700} c="violet.6">{analyticsData.newReaders}</Text>
                  <Text size="sm" c="orange">+8% from last month</Text>
                </Stack>
              </Card>

              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={500}>Posts Published</Text>
                    <IconPlus size={20} color="var(--mantine-color-violet-6)" />
                  </Group>
                  <Text size="xl" fw={700} c="violet.6">{posts.filter(p => p.published).length}</Text>
                  <Text size="sm" c="blue">This period</Text>
                </Stack>
              </Card>
            </SimpleGrid>
            
            {/* Charts */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">Views Over Time</Title>
                {loadingStates.analytics ? (
                    <Group justify="center" h={300}>
                      <Loader />
                    </Group>
                  ) : (
                    <Box h={300}>
                      <Line 
                        data={analyticsData.chartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                            },
                            title: {
                              display: true,
                              text: 'Daily Views'
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
              </Paper>
              
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">Top Performing Posts</Title>
                <Stack gap="sm">
                  {posts.slice(0, 5).map((post, index) => (
                    <Group key={post._id} justify="space-between" p="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                      <div>
                        <Text size="sm" fw={500}>{index + 1}. {post.title}</Text>
                        <Text size="xs" c="dimmed">{post.category}</Text>
                      </div>
                      <Group gap="xs">
                        <IconEye size={14} />
                        <Text size="sm">{post.views || Math.floor(Math.random() * 1000)}</Text>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </SimpleGrid>
          </Stack>
        )}
        
        {/* Categories view */}
        {currentView === 'categories' && isAdmin() && (
          <Stack gap="lg">
            <Paper p="lg" withBorder>
              <Title order={4} mb="md">Add New Category</Title>
              <Group>
                <TextInput
                  placeholder="Category name"
                  style={{ flex: 1 }}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.currentTarget.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button 
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  leftSection={<IconPlus size={16} />}
                  loading={loadingStates.categories}
                >
                  Add Category
                </Button>
              </Group>
            </Paper>
            
            <Paper p="lg" withBorder>
              <Title order={4} mb="md">Existing Categories ({categories.length})</Title>
              {loadingStates.categories ? (
                  <Group justify="center" py="xl">
                    <Loader />
                  </Group>
                ) : (
                  <Stack gap="sm">
                    {categories.length === 0 ? (
                      <Text c="dimmed" ta="center" py="xl">No categories found</Text>
                    ) : (
                      categories.map((category) => (
                        <Group key={category.name} justify="space-between" p="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                          <Group gap="sm">
                            <IconCategory size={16} color="var(--mantine-color-violet-6)" />
                            <Text>{category.name}</Text>
                          </Group>
                          <Group gap="sm">
                            <Badge variant="light" size="sm">
                              {category.postCount || posts.filter(p => p.category === category.name).length} posts
                            </Badge>
                            <ActionIcon 
                              variant="subtle" 
                              color="red" 
                              size="sm"
                              onClick={() => handleDeleteCategory(category.name)}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      ))
                    )}
                  </Stack>
                )}
            </Paper>
          </Stack>
        )}

        {/* Profile view */}
        {currentView === 'profile' && (
          <Stack gap="lg">
            <Paper p="lg" withBorder>
              <Title order={4} mb="md">Profile Information</Title>
              <Stack gap="md">
                {/* Profile Picture Section */}
                <Group align="flex-start">
                  <div>
                    <Text size="sm" fw={500} mb="xs">Profile Picture</Text>
                    {profileImage ? (
                      <img 
                        src={URL.createObjectURL(profileImage)} 
                        alt="Profile Preview" 
                        style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: '50%', 
                        background: 'var(--mantine-color-gray-3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconUser size={32} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <FileInput
                      placeholder="Choose profile picture"
                      accept="image/*"
                      leftSection={<IconPhoto size={16} />}
                      value={profileImage}
                      onChange={setProfileImage}
                    />
                  </div>
                </Group>
                
                <TextInput
                  label="Username"
                  value={authContext?.user?.username || ''}
                  disabled
                />
                <TextInput
                  label="Email"
                  value={authContext?.user?.email || ''}
                  disabled
                />
                <Textarea
                  label="Bio"
                  placeholder="Tell us about yourself..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.currentTarget.value }))}
                  minRows={3}
                />
                <Button 
                  onClick={handleUpdateProfile}
                  leftSection={<IconUser size={16} />}
                  loading={loadingStates.updating}
                >
                  Update Profile
                </Button>
              </Stack>
            </Paper>
            
            <Paper p="lg" withBorder>
              <Title order={4} mb="md">Change Password</Title>
              <Stack gap="md">
                <PasswordInput
                  label="Current Password"
                  placeholder="Enter current password"
                  value={profileForm.currentPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.currentTarget.value }))}
                />
                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.currentTarget.value }))}
                />
                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  value={profileForm.confirmPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.currentTarget.value }))}
                />
                <Button 
                  onClick={handleChangePassword}
                  color="orange"
                  disabled={!profileForm.currentPassword || !profileForm.newPassword || profileForm.newPassword !== profileForm.confirmPassword}
                  loading={loadingStates.updating}
                >
                  Change Password
                </Button>
              </Stack>
            </Paper>
          </Stack>
        )}

        {/* Export view */}
        {currentView === 'export' && isAdmin() && (
          <Paper p="lg" withBorder>
            <LoadingOverlay visible={loadingStates.exporting} />
            <Stack gap="md">
              <Title order={4} mb="md">Export Data</Title>
              {/* Step 1: Choose what to export */}
              {exportStep === 0 && (
                <>
                  <Text fw={500}>Select Data to Export:</Text>
                  <Group>
                    <Button
                      variant={exportOptions.posts ? 'filled' : 'outline'}
                      onClick={() => setExportOptions(prev => ({ ...prev, posts: !prev.posts }))}
                    >
                      Posts
                    </Button>
                    <Button
                      variant={exportOptions.comments ? 'filled' : 'outline'}
                      onClick={() => setExportOptions(prev => ({ ...prev, comments: !prev.comments }))}
                    >
                      Comments
                    </Button>
                    <Button
                      variant={exportOptions.analytics ? 'filled' : 'outline'}
                      onClick={() => setExportOptions(prev => ({ ...prev, analytics: !prev.analytics }))}
                    >
                      Analytics
                    </Button>
                  </Group>
                  <Button mt="md" onClick={() => setExportStep(1)}>
                    Next
                  </Button>
                </>
              )}
              {/* Step 2: Choose format */}
              {exportStep === 1 && (
                <>
                  <Text fw={500}>Select Export Format:</Text>
                  <Group>
                    <Button
                      variant={exportFormat === 'json' ? 'filled' : 'outline'}
                      onClick={() => setExportFormat('json')}
                    >
                      JSON
                    </Button>
                    <Button
                      variant={exportFormat === 'csv' ? 'filled' : 'outline'}
                      onClick={() => setExportFormat('csv')}
                    >
                      CSV
                    </Button>
                  </Group>
                  <Group mt="md">
                    <Button variant="default" onClick={() => setExportStep(0)}>
                      Back
                    </Button>
                    <Button 
                      color="violet" 
                      onClick={handleExportData}
                      loading={loadingStates.exporting}
                    >
                      Export
                    </Button>
                  </Group>
                </>
              )}
            </Stack>
          </Paper>
        )}
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default Dashboard
