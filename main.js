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
    
    if (hamburger && mobileMenu && !hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
    }
});

// Close mobile menu when clicking on nav links
document.addEventListener('DOMContentLoaded', function() {
    const mobileNavLinks = document.querySelectorAll('.mobile-menu .nav a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            const hamburger = document.querySelector('.hamburger');
            const mobileMenu = document.getElementById('mobileMenu');
            if (hamburger && mobileMenu) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        });
    });
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

    // Filter and search functionality for blog page
    function filterAndSearchBlog() {
    const filterTags = document.querySelectorAll('.filter-tags span');
    const thoughtCards = document.querySelectorAll('.thought-card');
        const searchInput = document.getElementById('search-input');
        let activeCategory = 'all';
        let searchTerm = '';

        function updateCards() {
            thoughtCards.forEach(card => {
                const cardCategories = (card.getAttribute('data-category') || '').toLowerCase();
                const cardText = card.innerText.toLowerCase();
                const matchesCategory = activeCategory === 'all' || cardCategories.includes(activeCategory);
                const matchesSearch = !searchTerm || cardText.includes(searchTerm);
                if (matchesCategory && matchesSearch) {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        filterTags.forEach(tag => {
            tag.addEventListener('click', function() {
                activeCategory = this.getAttribute('data-category').toLowerCase();
                filterTags.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                updateCards();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchTerm = this.value.toLowerCase();
                updateCards();
            });
        }

        // Set initial state
        if (filterTags.length) filterTags[0].classList.add('active');
        updateCards();
    }

    filterAndSearchBlog();

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
    
    // Initialize filter tags
    const firstFilterTag = document.querySelector('.filter-tags span');
    if (firstFilterTag && !document.querySelector('.filter-tags span.active')) {
        firstFilterTag.classList.add('active');
    }

    // Mobile menu close icon logic (event delegation for robustness)
    document.body.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'closeMobileMenu') {
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu) {
                mobileMenu.classList.remove('active');
                const hamburger = document.querySelector('.hamburger');
                if (hamburger) hamburger.classList.remove('active');
            }
        }
    });

    // Utility: Check if user is logged in
    function isLoggedIn() {
        return !!localStorage.getItem('authToken');
    }
    // Hide dashboard link if not logged in
    function updateDashboardLinkVisibility() {
        const dashboardLink = document.querySelector('.nav a[href="dashboard.html"]');
        if (dashboardLink) {
            dashboardLink.style.display = isLoggedIn() ? 'inline-block' : 'none';
        }
    }
    document.addEventListener('DOMContentLoaded', updateDashboardLinkVisibility);
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


// Add CSS for loading state
const style = document.createElement('style');
style.textContent = `
    body:not(.loaded) {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    body.loaded {
        opacity: 1;
    }
    
    .section {
        opacity: 1;
        transform: none;
        transition: none;
    }
    
    .section.visible {
        opacity: 1;
        transform: none;
    }
    
    .fade-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @media (prefers-reduced-motion: reduce) {
        .section {
            transition: none;
        }
        
        .fade-in {
            animation: none;
        }
    }
`;
document.head.appendChild(style);
