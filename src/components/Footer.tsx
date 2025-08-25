import React from 'react'
import './Footer.css'

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-social">
        <a 
          href="https://linkedin.com/in/ariane-dushime" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <i className="fab fa-linkedin-in"></i>
        </a>
        <a 
          href="https://github.com/dushriane" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <i className="fab fa-github"></i>
        </a>
        <a 
          href="mailto:arianedushime941@gmail.com" 
          aria-label="Email"
        >
          <i className="fas fa-envelope"></i>
        </a>
      </div>
      
      <div className="copyright">
        <p>&copy; 2025 Ariane Dushime. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
