import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import './Post.css'

interface Post {
  _id: string
  title: string
  content: string
  excerpt: string
  author: {
    id: string
    username: string
    profilePic?: string
  }
  category: string
  tags: string[]
  imageUrl?: string
  publishedAt: string
  createdAt: string
  likes: string[]
  comments: Comment[]
}

interface Comment {
  _id: string
  content: string
  author: {
    id: string
    username: string
    profilePic?: string
  }
  createdAt: string
  replies?: Reply[]
}

interface Reply {
  _id: string
  content: string
  author: {
    id: string
    username: string
    profilePic?: string
  }
  createdAt: string
}

const Post: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({})
  const [showReplyBoxes, setShowReplyBoxes] = useState<{ [key: string]: boolean }>({})
  const [likeCount, setLikeCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const API_BASE_URL = 'https://arn-portfolio-backend.onrender.com'

  const isLoggedIn = () => !!localStorage.getItem('authToken')
  
  const getCurrentUser = () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }

  useEffect(() => {
    if (id) {
      fetchPost(id)
      incrementViewCount(id)
      if (isLoggedIn()) {
        fetchComments(id)
      }
    }
  }, [id])

  const incrementViewCount = async (postId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/posts/${postId}/view`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  const fetchPost = async (postId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`)
      
      if (response.ok) {
        const data = await response.json()
        setPost(data)
        setLikeCount(data.likes ? data.likes.length : 0)
        
        // Check if current user liked this post
        const currentUser = getCurrentUser()
        if (currentUser && data.likes) {
          setIsLiked(data.likes.includes(currentUser.id))
        }
      } else {
        setError('Post not found')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Error loading post')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleLike = async () => {
    if (!isLoggedIn()) return
    
    const token = localStorage.getItem('authToken')
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLikeCount(data.likesCount)
        setIsLiked(!isLiked)
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleBookmark = async () => {
    if (!isLoggedIn()) return
    
    const token = localStorage.getItem('authToken')
    const user = getCurrentUser()
    if (!user?.id) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me/bookmarks/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        setIsBookmarked(!isBookmarked)
        alert('Bookmark updated!')
      }
    } catch (error) {
      console.error('Error bookmarking post:', error)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn() || !newComment.trim()) return
    
    const token = localStorage.getItem('authToken')
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      })
      
      if (response.ok) {
        setNewComment('')
        fetchComments(id!)
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const handleReplySubmit = async (commentId: string) => {
    const replyContent = replyInputs[commentId]
    if (!isLoggedIn() || !replyContent?.trim()) return
    
    const token = localStorage.getItem('authToken')
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${id}/comments/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyContent })
      })
      
      if (response.ok) {
        setReplyInputs({ ...replyInputs, [commentId]: '' })
        setShowReplyBoxes({ ...showReplyBoxes, [commentId]: false })
        fetchComments(id!)
      }
    } catch (error) {
      console.error('Error posting reply:', error)
    }
  }

  const toggleReplyBox = (commentId: string) => {
    setShowReplyBoxes({
      ...showReplyBoxes,
      [commentId]: !showReplyBoxes[commentId]
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="post-page">
        <div className="loading">Loading post...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="post-page">
        <div className="error">
          <h2>Post Not Found</h2>
          <p>{error}</p>
          <Link to="/blog" className="back-to-blog">← Back to Blog</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="post-page">
      <Link to="/blog" className="back-button">
        <i className="fas fa-arrow-left"></i>
        Back to Blog
      </Link>

      <section className="post-detail section">
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta">
          <span>By {post.author?.username || 'Unknown'}</span> |
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
        </div>
        {post.imageUrl && (
          <div className="post-image">
            <img src={post.imageUrl} alt={post.title} />
          </div>
        )}
        <div 
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </section>

      {isLoggedIn() && (
        <>
          <section className="post-interactions section">
            <button 
              onClick={handleLike}
              className={`interaction-btn ${isLiked ? 'liked' : ''}`}
            >
              <i className={`fa${isLiked ? 's' : 'r'} fa-heart`}></i>
              <span>{likeCount}</span> Like{likeCount !== 1 ? 's' : ''}
            </button>
            <button 
              onClick={handleBookmark}
              className={`interaction-btn ${isBookmarked ? 'bookmarked' : ''}`}
            >
              <i className={`fa${isBookmarked ? 's' : 'r'} fa-bookmark`}></i>
              Bookmark
            </button>
          </section>

          <section className="comments section modern-comments">
            <h2 className="comments-title">Comments</h2>
            
            <div className="comment-form-container">
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <textarea
                  className="comment-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  required
                />
                <button 
                  type="submit" 
                  className="comment-submit"
                  disabled={!newComment.trim()}
                >
                  Post Comment
                </button>
              </form>
            </div>

            <div className="comments-list">
              {comments.length === 0 ? (
                <div>No comments yet.</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <div className="comment-header">
                      <img 
                        src={comment.author?.profilePic || '/images/profiles/default.jpg'} 
                        alt={comment.author?.username}
                        className="comment-author-pic"
                      />
                      <div className="comment-meta">
                        <span className="comment-author-name">
                          {comment.author?.username || 'User'}
                        </span>
                        <span className="comment-date">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="comment-content">{comment.content}</div>
                    
                    <button 
                      className="reply-btn"
                      onClick={() => toggleReplyBox(comment._id)}
                    >
                      Reply
                    </button>
                    
                    {showReplyBoxes[comment._id] && (
                      <div className="reply-box">
                        <textarea
                          value={replyInputs[comment._id] || ''}
                          onChange={(e) => setReplyInputs({
                            ...replyInputs,
                            [comment._id]: e.target.value
                          })}
                          placeholder="Write a reply..."
                        />
                        <button 
                          onClick={() => handleReplySubmit(comment._id)}
                          disabled={!replyInputs[comment._id]?.trim()}
                        >
                          Post Reply
                        </button>
                      </div>
                    )}
                    
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="replies">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="reply">
                            <div className="reply-header">
                              <img 
                                src={reply.author?.profilePic || '/images/profiles/default.jpg'} 
                                alt={reply.author?.username}
                                className="reply-author-pic"
                              />
                              <span className="reply-author-name">
                                {reply.author?.username || 'User'}
                              </span>
                              <span className="reply-date">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <div className="reply-content">{reply.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

      {!isLoggedIn() && (
        <section className="login-prompt section">
          <p>
            Please <Link to="/login" className="login-link">login</Link> to like, comment and bookmark posts.
          </p>
        </section>
      )}
    </div>
  )
}

export default Post
