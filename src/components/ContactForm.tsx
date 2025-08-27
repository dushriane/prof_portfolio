import React, { useState } from 'react'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { validateEmail, validateRequired } from '../utils/helpers'

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await apiRequest(API_ENDPOINTS.contact, {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      
      // Show success message
      setTimeout(() => {
        alert('Thank you for your message! I\'ll get back to you soon.')
      }, 100)
      
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus('error')
      alert('Sorry, there was an error sending your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contact-section">
      <h2 className="contact-title">
        LET'S BUILD SOMETHING <br />
        AMAZING TOGETHER
      </h2>
      
      <form className="contact-form" onSubmit={handleSubmit}>
        {submitStatus === 'success' && (
          <div className="success-message">
            Message sent successfully! I'll get back to you soon.
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="error">
            Error sending message. Please try again or contact me directly.
          </div>
        )}

        <div className="form-group">
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="text"
            id="subject"
            name="subject"
            placeholder="Subject of Message"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <textarea
            id="message"
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}

export default ContactForm
