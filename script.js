// Interactive functionality for the website
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Rule toggle functionality
    const ruleToggles = document.querySelectorAll('.rule-toggle');
    ruleToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const ruleItem = this.parentElement;
            const isExpanded = ruleItem.classList.contains('expanded');
            
            if (isExpanded) {
                ruleItem.classList.remove('expanded');
                this.textContent = 'Details';
            } else {
                ruleItem.classList.add('expanded');
                this.textContent = 'Close';
            }
        });
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.member-card, .rank-card, .benefit-item, .rule-item, .team-card, .award-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 10px 30px rgba(74, 158, 255, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });

    // Mobile menu toggle (for future enhancement)
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '☰';
    mobileMenuToggle.style.display = 'none';
    
    // Add mobile menu functionality
    function toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        navMenu.classList.toggle('mobile-active');
    }
    
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Check if mobile view
    function checkMobileView() {
        if (window.innerWidth <= 768) {
            mobileMenuToggle.style.display = 'block';
            document.querySelector('.nav-container').appendChild(mobileMenuToggle);
        } else {
            mobileMenuToggle.style.display = 'none';
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.remove('mobile-active');
        }
    }
    
    // Initial check and resize listener
    checkMobileView();
    window.addEventListener('resize', checkMobileView);

    // Add scroll effect to header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(42, 42, 42, 0.95)';
        } else {
            header.style.backgroundColor = '#2a2a2a';
        }
    });

    // Animate cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards for animation
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});
