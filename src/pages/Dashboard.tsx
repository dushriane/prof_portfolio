import React, { useState, useEffect } from 'react'
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
  PasswordInput
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
  IconUpload
} from '@tabler/icons-react'
import { AuthContextType } from '../App'

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
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
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
  
  // Profile State
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    bio: '',
    phone: '',
    gender: 'male'
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  
  // Add time range state
  const [timeRange, setTimeRange] = useState('30')
  const [analyticsData, setAnalyticsData] = useState({
    totalViews: 2847,
    engagementRate: 68,
    newReaders: 124,
    topPosts: []
  })

  const API_BASE_URL = 'http://localhost:3000'
  //const API_BASE_URL = 'https://arn-portfolio-backend.onrender.com'

  const isAdmin = () => {
    return authContext?.user?.role === 'admin'
  }

  useEffect(() => {
    if (authContext?.isAuthenticated) {
      loadDashboardData()
      loadUserPosts()
      loadCategories()
      
      // Initialize profile form with user data
      if (authContext.user) {
        setProfileForm({
          username: authContext.user.username || '',
          email: authContext.user.email || '',
          bio: authContext.user.bio || '',
          phone: authContext.user.phone || '',
          gender: authContext.user.gender || 'male'
        })
      }
    }
  }, [authContext])

  const loadDashboardData = async () => {
    if (!isAdmin()) return
    
    const token = localStorage.getItem('authToken')
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    }
  }

  const loadUserPosts = async () => {
    setLoading(true)
    const token = localStorage.getItem('authToken')
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPosts(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    const token = localStorage.getItem('authToken')
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        loadUserPosts()
      }
    } catch (error) {
      console.error('Error deleting post:', error)
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
    const token = localStorage.getItem('authToken')
    const url = editingPostId 
      ? `${API_BASE_URL}/api/posts/${editingPostId}`
      : `${API_BASE_URL}/api/posts`
    const method = editingPostId ? 'PUT' : 'POST'
    
    try {
      const formData = new FormData()
      formData.append('title', postForm.title)
      formData.append('content', postForm.content)
      formData.append('excerpt', postForm.excerpt)
      formData.append('category', postForm.category)
      formData.append('tags', JSON.stringify(postForm.tags.split(',').map(tag => tag.trim())))
      formData.append('published', (!isDraft).toString())
      
      if (selectedFile) {
        formData.append('image', selectedFile)
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData
        },
        body: formData
      })
      
      if (response.ok) {
        alert(editingPostId ? 'Post updated!' : (isDraft ? 'Draft saved!' : 'Post published!'))
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
        loadUserPosts()
      }
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Error saving post')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    if (authContext?.logout) {
      authContext.logout()
    }
    window.location.href = '/login'
  }

  const handleDeleteCategory = async (categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the "${categoryName}" category?`)) return
    
    const token = localStorage.getItem('authToken')
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryName}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        loadCategories()
        alert('Category deleted successfully!')
      } else {
        alert('Failed to delete category. It may have posts associated with it.')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category')
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || post.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

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
      padding="md"
    >
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
            />
          </Stack>
        </AppShell.Section>

        {/* Update the sidebar user section */}
        <AppShell.Section>
          <Box p="sm" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
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

      <AppShell.Main>
        <Container size="xl">
          {/* Header */}
          <Group justify="space-between" align="center" mb="lg">
            <Title order={2} c="violet.6">
              {currentView === 'dashboard' ? 'Dashboard Overview' :
               currentView === 'create' ? 'Create New Post' :
               currentView === 'analytics' ? 'Analytics' :
               currentView === 'categories' ? 'Manage Categories' :
               currentView === 'export' ? 'Export Data' :
               currentView === 'profile' ? 'Profile Settings' : 
               currentView.charAt(0).toUpperCase() + currentView.slice(1)}
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
            {loading ? (
              <Group justify="center" p="xl">
                <Loader size="lg" />
              </Group>
            ) : filteredPosts.length === 0 ? (
              <Paper p="xl" ta="center" c="dimmed">
                <Text>No posts found.</Text>
              </Paper>
            ) : (
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                {filteredPosts.map((post) => (
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
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Stack>
        )}
        
        {/* Other views */}
        {currentView === 'create' && (
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
                <Textarea
                  placeholder="Write your post content here..."
                  minRows={12}
                  value={postForm.content}
                  onChange={(e) => setPostForm(prev => ({ ...prev, content: e.currentTarget.value }))}
                  description="Rich text editor can be integrated here (Quill, TinyMCE, etc.)"
                />
              </div>

              <Group justify="flex-end">
                <Button 
                  variant="outline" 
                  onClick={() => handleCreatePost(true)}
                >
                  Save as Draft
                </Button>
                <Button 
                  leftSection={<IconUpload size={16} />}
                  onClick={() => handleCreatePost(false)}
                >
                  Publish Post
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}
        
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
            
            {/* Charts Placeholder */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">Views Over Time</Title>
                <Box h={300} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--mantine-color-gray-1)' }}>
                  <Text c="dimmed">Chart will be implemented with Chart.js or Recharts</Text>
                </Box>
              </Paper>
              
              <Paper p="lg" withBorder>
                <Title order={4} mb="md">Top Performing Posts</Title>
                <Stack gap="sm">
                  {posts.slice(0, 5).map((post, index) => (
                    <Group key={post._id} justify="space-between" p="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                      <div>
                        <Text size="sm" fw={500}>{post.title}</Text>
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
                >
                  Add Category
                </Button>
              </Group>
            </Paper>
            
            <Paper p="lg" withBorder>
              <Title order={4} mb="md">Existing Categories ({categories.length})</Title>
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
            </Paper>
          </Stack>
        )}
        
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
                >
                  Change Password
                </Button>
              </Stack>
            </Paper>
          </Stack>
        )}
        
        {(currentView === 'export' && !isAdmin()) || (currentView === 'categories' && !isAdmin()) ? (
          <Alert color="yellow" title="Access Restricted">
            This feature is only available for administrators.
          </Alert>
        ) : currentView === 'export' && isAdmin() && (
          <Paper p="lg" withBorder>
            <Stack gap="md">
              <Title order={4} mb="md">Export Data</Title>
              <Group>
                <Button leftSection={<IconFileExport size={16} />}>
                  Export Posts (JSON)
                </Button>
                <Button leftSection={<IconFileExport size={16} />} variant="outline">
                  Export Analytics (CSV)
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default Dashboard
