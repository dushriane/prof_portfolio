// Scroll Animation Observer
// const observerOptions = {
//     threshold: 0.1,
//     rootMargin: '0px 0px -50px 0px'
// };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Mobile menu functionality
function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
    }
});

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add section class to all major sections (but don't animate them)
    const sections = document.querySelectorAll('section, .hero, .projects-section, .tech, .thoughts-grid, footer');
    
    sections.forEach(section => {
        section.classList.add('section');
        // Remove observer to prevent fade-in effects
        // observer.observe(section);
    });

    // Add staggered animation to cards (but make them visible immediately)
    const cards = document.querySelectorAll('.project-card, .thought-card, .tech-category');
    cards.forEach((card, index) => {
        card.style.transitionDelay = '0s';
        card.classList.add('section');
        // Remove observer to prevent fade-in effects
        // observer.observe(card);
    });

    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.project-card, .thought-card, .tech-category, .social-icon');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Form submission handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }
            
            // Simulate form submission
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                alert('Thank you for your message! I\'ll get back to you soon.');
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }

    // Filter functionality for blog page
    const filterTags = document.querySelectorAll('.filter-tags span');
    const thoughtCards = document.querySelectorAll('.thought-card');
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const filter = this.textContent.toLowerCase();
            
            // Update active state
            filterTags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards
            thoughtCards.forEach(card => {
                const cardTags = Array.from(card.querySelectorAll('.thought-tags span'))
                    .map(span => span.textContent.toLowerCase());
                
                if (filter === 'all' || cardTags.includes(filter)) {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Dashboard category filter logic
    // (This code will only run if the dashboard filter exists on the page)
    document.addEventListener('DOMContentLoaded', function () {
      const filterTags = document.querySelectorAll('.dashboard-filter-tag');
      const posts = document.querySelectorAll('.dashboard-post');

      if (filterTags.length && posts.length) {
        filterTags.forEach(tag => {
          tag.addEventListener('click', function () {
            // Remove active from all
            filterTags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-category');
            posts.forEach(post => {
              if (category === 'all' || post.getAttribute('data-category') === category) {
                post.style.display = '';
              } else {
                post.style.display = 'none';
              }
            });
          });
        });
      }
    });

    // Make dashboard posts clickable
    if (document.getElementById('dashboardPosts')) {
      document.getElementById('dashboardPosts').addEventListener('click', function(e) {
        let post = e.target.closest('.dashboard-post');
        if (post && post.dataset.id) {
          window.location.href = `post-${post.dataset.id}.html`;
        }
      });
    }
    // Dashboard filter by category
    if (document.getElementById('dashboardFilterTags')) {
      document.getElementById('dashboardFilterTags').addEventListener('click', function(e) {
        if (e.target.classList.contains('dashboard-filter-tag')) {
          document.querySelectorAll('.dashboard-filter-tag').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
          const category = e.target.dataset.category;
          document.querySelectorAll('.dashboard-post').forEach(post => {
            if (category === 'all' || post.dataset.category === category) {
              post.style.display = '';
            } else {
              post.style.display = 'none';
            }
          });
        }
      });
    }

    // Add loading animation
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
});

// Utility function for smooth animations
function animateOnScroll(element, animation) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(animation);
            }
        });
    });
    
    observer.observe(element);
}

