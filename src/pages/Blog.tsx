import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import './Blog.css'

interface Post {
  _id: string
  title: string
  excerpt: string
  content: string
  author: {
    username: string
    profilePic?: string
  }
  category: string
  tags: string[]
  imageUrl?: string
  publishedAt: string
  createdAt: string
  likes: string[]
  commentsCount: number
}

interface Category {
  name: string
}
const getDisplayAuthorName = (author: any) => {
  if (author.username === 'admin') {
    return 'Ariane Dushime'
  }
  return author.username
}
const Blog: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchCategories()
    fetchPosts()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.categories)
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchPosts = async (search = '', category = '') => {
    setLoading(true)
    try {
      let url = API_ENDPOINTS.posts
      
      if (search) {
        url = `${API_ENDPOINTS.posts}/search?q=${encodeURIComponent(search)}`
      }
      
      if (category && category !== 'all') {
        url += (url.includes('?') ? '&' : '?') + `category=${encodeURIComponent(category)}`
      }

      const data = await apiRequest(url)
      setPosts(data.posts || data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPosts(searchTerm, selectedCategory)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    fetchPosts(searchTerm, category)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <main className="blog-page">
      <section className="hero section">
        <h1>BLOG</h1>
        <p className="intro">
          Just some thoughts. I love opinions and think that sharing them is important to grow in understanding.
        </p>
        
        <form id="search-form" onSubmit={handleSearch}>
          <input 
            type="text" 
            id="search-input" 
            placeholder="Search blog posts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        
        <div className="filter-tags">
          <span 
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => handleCategoryFilter('all')}
          >
            ALL
          </span>
          {categories.map((category) => (
            <span
              key={category.name}
              className={selectedCategory === category.name.toLowerCase() ? 'active' : ''}
              onClick={() => handleCategoryFilter(category.name.toLowerCase())}
            >
              {category.name.toUpperCase()}
            </span>
          ))}
        </div>
      </section>

      <section className="thoughts-grid section">
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="no-posts">No posts found.</div>
        ) : (
          posts.map((post) => (
            <div 
              key={post._id} 
              className="thought-card clickable"
              data-category={post.category}
            >
              <div className="thought-date">
                {formatDate(post.publishedAt || post.createdAt)}
              </div>
              
              <div className="post-image">
                <img src={post.imageUrl || '/images/blogone.jpeg'} alt={post.title} />
              </div>
              
              <div className="card-content">
                <div className="author-info">
                  <img 
                    src={post.author?.profilePic || '/images/profiles/default.jpg'} 
                    className="author-pic" 
                    alt="Author" 
                  />
                  <span className="author-name">
                    {/* {post.author?.username || 'Unknown'} */}
                    {getDisplayAuthorName(post.author)}
                  </span>
                </div>
                
                <h2 className="thought-title">{post.title}</h2>
                <p className="thought-description">{post.excerpt}</p>
                
                <div className="thought-tags">
                  {post.tags.map((tag, index) => (
                    <span key={index}>{tag}</span>
                  ))}
                </div>
                
                <div className="blog-interactions">
                  <div className="likes">
                    <i className="far fa-heart"></i>
                    <span>{post.likes ? post.likes.length : 0}</span>
                  </div>
                  <div className="comments">
                    <i className="far fa-comment"></i>
                    <span>{post.commentsCount || 0}</span>
                  </div>
                </div>
              </div>
              
              <Link to={`/post/${post._id}`} className="read-more">
                READ MORE
              </Link>
            </div>
          ))
        )}
      </section>
    </main>
  )
}

export default Blog
