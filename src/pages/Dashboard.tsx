import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Grid, 
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
  Tabs,
  Alert
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
  IconAlertCircle
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
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  
  // Form states
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    imageUrl: ''
  })

  //const quillRef = useRef<any>(null)
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

  const handleCreatePost = async (isDraft = false) => {
    const token = localStorage.getItem('authToken')
    const postData = {
      ...postForm,
      tags: postForm.tags.split(',').map(tag => tag.trim()),
      published: !isDraft
    }

    try {
      const url = editingPost 
        ? `${API_BASE_URL}/api/posts/${editingPost._id}`
        : `${API_BASE_URL}/api/posts`
      
      const response = await fetch(url, {
        method: editingPost ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        alert(editingPost ? 'Post updated!' : 'Post created!')
        setCurrentView('dashboard')
        setEditingPost(null)
        setPostForm({
          title: '',
          content: '',
          excerpt: '',
          category: '',
          tags: '',
          imageUrl: ''
        })
        loadUserPosts()
      } else {
        alert('Error saving post')
      }
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Error saving post')
    }
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setPostForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags.join(', '),
      imageUrl: post.imageUrl || ''
    })
    setCurrentView('create')
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
        alert('Post deleted successfully!')
        loadUserPosts()
      } else {
        alert('Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post')
    }
  }

  const handleAddCategory = async (categoryName: string) => {
    const token = localStorage.getItem('authToken')
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: categoryName })
      })

      if (response.ok) {
        alert('Category added!')
        loadCategories()
      } else {
        alert('Failed to add category')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Error adding category')
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
      <div className="dashboard-error">
        <h2>Access Denied</h2>
        <p>Please log in to access the dashboard.</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => setCurrentView('dashboard')}>
          📊 Dashboard
        </button>
        <button className="quick-action-btn" onClick={() => setCurrentView('create')}>
          📝 Create New Post
        </button>
        <button className="quick-action-btn" onClick={() => setCurrentView('analytics')}>
          📈 View Analytics
        </button>
        {isAdmin() && (
          <>
            <button className="quick-action-btn" onClick={() => setCurrentView('categories')}>
              🏷️ Manage Categories
            </button>
            <button className="quick-action-btn" onClick={() => setCurrentView('export')}>
              📤 Export Data
            </button>
          </>
        )}
        <button className="quick-action-btn" onClick={() => setCurrentView('profile')}>
          👤 Edit Profile
        </button>
      </div>

      {/* Mobile FAB */}
      <div className="fab" onClick={() => setShowQuickActions(!showQuickActions)}>
        <i className="fas fa-plus"></i>
      </div>

      {showQuickActions && (
        <div className="quick-actions-modal active">
          <div className="quick-actions-modal-content">
            <button className="quick-action-btn" onClick={() => setCurrentView('dashboard')}>📊 Dashboard</button>
            <button className="quick-action-btn" onClick={() => setCurrentView('create')}>📝 Create New Post</button>
            <button className="quick-action-btn" onClick={() => setCurrentView('analytics')}>📈 View Analytics</button>
            {isAdmin() && (
              <>
                <button className="quick-action-btn" onClick={() => setCurrentView('categories')}>🏷️ Manage Categories</button>
                <button className="quick-action-btn" onClick={() => setCurrentView('export')}>📤 Export Data</button>
              </>
            )}
            <button className="quick-action-btn" onClick={() => setCurrentView('profile')}>👤 Edit Profile</button>
            <button className="close-modal" onClick={() => setShowQuickActions(false)}>&times;</button>
          </div>
        </div>
      )}

      <main className="dashboard">
        {currentView === 'dashboard' && (
          <>
            <div className="dashboard-header section">
              <div>
                <h1 className="dashboard-title">Blog Dashboard</h1>
                <p>Manage your blog posts and analytics</p>
              </div>
            </div>

            {isAdmin() && stats && (
              <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg" mb="xl">
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

            <div className="dashboard-filter">
              <span className="filter-label">Search:</span>
              <input 
                type="text" 
                placeholder="Search your posts..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="filter-label">Filter by Category:</span>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name.toLowerCase()}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="dashboard-posts">
              <h2>Your Posts</h2>
              {loading ? (
                <div>Loading posts...</div>
              ) : filteredPosts.length === 0 ? (
                <div>No posts found.</div>
              ) : (
                filteredPosts.map(post => (
                  <div key={post._id} className="dashboard-post">
                    <h3>{post.title}</h3>
                    <p>Category: {post.category}</p>
                    <p>Status: {post.published ? 'Published' : 'Draft'}</p>
                    <p>Views: {post.views || 0}</p>
                    <div className="admin-actions">
                      <button onClick={() => handleEditPost(post)}>Edit</button>
                      <button onClick={() => handleDeletePost(post._id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {currentView === 'create' && (
          <div className="full-page-view">
            <h1>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
            <form onSubmit={(e) => { e.preventDefault(); handleCreatePost(false); }}>
              <div className="form-group">
                <label htmlFor="post-title">Title</label>
                <input
                  type="text"
                  id="post-title"
                  value={postForm.title}
                  onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="excerpt">Excerpt</label>
                <textarea
                  id="excerpt"
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm({...postForm, excerpt: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={postForm.category}
                  onChange={(e) => setPostForm({...postForm, category: e.target.value})}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags (comma separated)</label>
                <input
                  type="text"
                  id="tags"
                  value={postForm.tags}
                  onChange={(e) => setPostForm({...postForm, tags: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">Featured Image URL</label>
                <input
                  type="url"
                  id="imageUrl"
                  value={postForm.imageUrl}
                  onChange={(e) => setPostForm({...postForm, imageUrl: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  rows={10}
                  value={postForm.content}
                  onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  <i className="fas fa-paper-plane"></i> {editingPost ? 'Update Post' : 'Publish Post'}
                </button>
                <button 
                  type="button" 
                  className="btn-draft"
                  onClick={() => handleCreatePost(true)}
                >
                  <i className="fas fa-save"></i> Save Draft
                </button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setCurrentView('dashboard')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {currentView === 'categories' && (
          <div className="full-page-view">
            <div className="section-header">
              <h2><i className="fas fa-tags"></i> Manage Categories</h2>
            </div>
            
            <div className="content-grid">
              <div className="card">
                <h3>Current Categories</h3>
                <ul className="category-list">
                  {categories.map(cat => (
                    <li key={cat.name}>
                      <span>{cat.name}</span>
                      <span className="post-count">{cat.postCount || 0} posts</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="card">
                <h3>Add New Category</h3>
                <div className="form-group">
                  <input 
                    type="text" 
                    id="newCategoryName" 
                    placeholder="Category name"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        handleAddCategory(input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <button onClick={() => {
                    const input = document.getElementById('newCategoryName') as HTMLInputElement;
                    handleAddCategory(input.value);
                    input.value = '';
                  }}>
                    Add Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="full-page-view">
            <h2><i className="fas fa-chart-bar"></i> Blog Analytics</h2>
            <p>Analytics functionality would be implemented here with charts and detailed metrics.</p>
            <div className="analytics-placeholder">
              <p>📊 Post Views Over Time</p>
              <p>📈 Engagement Metrics</p>
              <p>👥 Audience Demographics</p>
              <p>🔥 Top Performing Posts</p>
            </div>
          </div>
        )}

        {currentView === 'export' && (
          <div className="full-page-view">
            <h2><i className="fas fa-file-export"></i> Export Data</h2>
            <p>Data export functionality would be implemented here.</p>
            <div className="export-placeholder">
              <button className="export-btn">📄 Export Posts as JSON</button>
              <button className="export-btn">📊 Export Analytics as CSV</button>
              <button className="export-btn">💬 Export Comments as CSV</button>
            </div>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="full-page-view">
            <h2><i className="fas fa-user-edit"></i> Edit Profile</h2>
            <p>Profile editing functionality would be implemented here.</p>
            <div className="profile-placeholder">
              <p>✏️ Update Bio</p>
              <p>📷 Change Profile Picture</p>
              <p>🔐 Change Password</p>
              <p>⚙️ Account Settings</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
