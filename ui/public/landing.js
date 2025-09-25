// Landing page JavaScript functionality

// Authentication state
let isLoginMode = true;
let currentUser = null;
let showUserDropdown = false;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize pricing toggle
    initializePricingToggle();
    
    // Initialize testimonial carousel
    initializeCarousel();
    
    // Initialize authentication
    initializeAuth();
    
    // Check if user is already logged in
    checkAuthStatus();
});

function initializePricingToggle() {
    const monthlyToggle = document.getElementById('monthlyToggle');
    const annuallyToggle = document.getElementById('annuallyToggle');
    
    monthlyToggle.addEventListener('click', function() {
        setActiveToggle(monthlyToggle, annuallyToggle);
        updatePricing('monthly');
    });
    
    annuallyToggle.addEventListener('click', function() {
        setActiveToggle(annuallyToggle, monthlyToggle);
        updatePricing('annually');
    });
}

function setActiveToggle(activeButton, inactiveButton) {
    activeButton.classList.add('active');
    inactiveButton.classList.remove('active');
}

function updatePricing(period) {
    const proAmount = document.querySelector('.pro .amount');
    const proPeriod = document.querySelector('.pro .period');
    
    if (period === 'monthly') {
        proAmount.textContent = '49';
        proPeriod.textContent = '/month';
    } else {
        proAmount.textContent = '29';
        proPeriod.textContent = '/month';
        // Add annual discount indicator
        const proCard = document.querySelector('.pricing-card.pro');
        if (!proCard.querySelector('.annual-discount')) {
            const discount = document.createElement('div');
            discount.className = 'annual-discount';
            discount.innerHTML = '<span style="color: #F97316; font-size: 0.8rem; font-weight: 600;">Save 40% annually</span>';
            proCard.querySelector('.card-header').appendChild(discount);
        }
    }
}

function handleStartEvaluation() {
    if (currentUser) {
        // User is logged in, proceed to evaluation
        window.location.href = '/questions.html';
    } else {
        // User is not logged in, show authentication modal with message
        showAuthModal();
        showError('Please sign in or create an account to start your evaluation');
    }
}

function startEvaluation() {
    // Redirect directly to the questions page
    window.location.href = '/questions.html';
}

function upgradeToPro() {
    // In a real implementation, this would redirect to payment processing
    alert('Pro upgrade coming soon! This will integrate with Stripe for secure payments.');
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'transparent';
        header.style.backdropFilter = 'none';
        header.style.boxShadow = 'none';
    }
});

// Testimonial Carousel functionality
let currentSlide = 0;
let totalSlides = 0;
let slidesToShow = 3;
let autoplayInterval;

function initializeCarousel() {
    const track = document.getElementById('carouselTrack');
    const cards = track.querySelectorAll('.testimonial-card');
    totalSlides = cards.length;
    
    // Set responsive slides to show
    updateSlidesToShow();
    
    // Generate dots
    generateDots();
    
    // Set initial position
    updateCarousel();
    
    // Start autoplay
    startAutoplay();
    
    // Handle window resize
    window.addEventListener('resize', updateSlidesToShow);
}

function updateSlidesToShow() {
    if (window.innerWidth <= 768) {
        slidesToShow = 1;
    } else if (window.innerWidth <= 1024) {
        slidesToShow = 2;
    } else {
        slidesToShow = 3;
    }
    
    // Update carousel if already initialized
    if (totalSlides > 0) {
        updateCarousel();
        generateDots();
    }
}

function generateDots() {
    const dotsContainer = document.getElementById('carouselDots');
    const totalDots = Math.ceil(totalSlides / slidesToShow);
    
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        if (i === Math.floor(currentSlide / slidesToShow)) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => goToSlide(i * slidesToShow));
        dotsContainer.appendChild(dot);
    }
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const cardWidth = 280 + 16; // card width (280px) + gap (16px)
    const translateX = -currentSlide * cardWidth;
    track.style.transform = `translateX(${translateX}px)`;
    
    // Update dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === Math.floor(currentSlide / slidesToShow));
    });
}

function moveSlide(direction) {
    const maxSlide = totalSlides - slidesToShow;
    
    if (direction === 1) {
        currentSlide = currentSlide >= maxSlide ? 0 : currentSlide + 1;
    } else {
        currentSlide = currentSlide <= 0 ? maxSlide : currentSlide - 1;
    }
    
    updateCarousel();
    resetAutoplay();
}

function goToSlide(slideIndex) {
    currentSlide = Math.min(slideIndex, totalSlides - slidesToShow);
    updateCarousel();
    resetAutoplay();
}

function startAutoplay() {
    autoplayInterval = setInterval(() => {
        moveSlide(1);
    }, 5000); // Change slide every 5 seconds
}

function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
}

// Pause autoplay on hover
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.testimonial-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });
        
        carousel.addEventListener('mouseleave', () => {
            startAutoplay();
        });
    }
});

// Authentication Functions
function initializeAuth() {
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }
}

function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        updateHeaderForLoggedInUser();
    }
}

function showAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        clearAuthForm();
    }
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    updateAuthModal();
}

function updateAuthModal() {
    const title = document.getElementById('authTitle');
    const subtitle = document.getElementById('authSubtitle');
    const submitBtn = document.getElementById('authSubmit');
    const switchText = document.getElementById('authSwitchText');
    const switchBtn = document.getElementById('authSwitchBtn');
    const nameGroup = document.getElementById('nameGroup');
    const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
    const passwordInput = document.getElementById('authPassword');
    
    if (isLoginMode) {
        title.textContent = 'Welcome Back';
        subtitle.textContent = 'Sign in to your account';
        submitBtn.textContent = 'Sign In';
        switchText.textContent = "Don't have an account?";
        switchBtn.textContent = 'Sign up';
        nameGroup.style.display = 'none';
        confirmPasswordGroup.style.display = 'none';
        passwordInput.placeholder = 'Enter your password';
    } else {
        title.textContent = 'Create Account';
        subtitle.textContent = 'Join Evalio and start evaluating your startup ideas';
        submitBtn.textContent = 'Create Account';
        switchText.textContent = 'Already have an account?';
        switchBtn.textContent = 'Sign in';
        nameGroup.style.display = 'block';
        confirmPasswordGroup.style.display = 'block';
        passwordInput.placeholder = 'Create a password (min 6 characters)';
    }
    
    clearAuthForm();
}

function clearAuthForm() {
    document.getElementById('authForm').reset();
    hideError();
}

function showError(message) {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    const errorDiv = document.getElementById('authError');
    errorDiv.style.display = 'none';
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    hideError();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Validate registration data
    if (!isLoginMode) {
        if (!data.name || data.name.trim().length < 2) {
            showError('Name must be at least 2 characters');
            return;
        }
        if (data.password !== data.confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        if (data.password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }
    }
    
    const submitBtn = document.getElementById('authSubmit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = isLoginMode ? 'Signing In...' : 'Creating Account...';
    submitBtn.disabled = true;
    
    try {
        const url = isLoginMode ? 
            'http://localhost:3001/api/auth/login' : 
            'http://localhost:3001/api/auth/register';
            
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Store user data
            currentUser = result.data.user;
            localStorage.setItem('authToken', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            
            // Update header
            updateHeaderForLoggedInUser();
            
            // Close modal
            hideAuthModal();
            
            // Show success message
            showSuccessMessage(isLoginMode ? 'Welcome back!' : 'Account created successfully!');
        } else {
            showError(result.error || 'An error occurred');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function updateHeaderForLoggedInUser() {
    const headerActions = document.getElementById('headerActions');
    if (headerActions && currentUser) {
        // Show user profile when logged in
        headerActions.innerHTML = `
            <div class="user-profile-container">
                <div class="user-avatar" onclick="toggleUserDropdown()">
                    ${getUserInitials(currentUser.name)}
                </div>
                <div class="user-dropdown" id="userDropdown" style="display: none;">
                    <div class="user-dropdown-item">${currentUser.name}</div>
                    <div class="user-dropdown-item" onclick="handleLogout()">Sign Out</div>
                </div>
            </div>
        `;
    } else if (headerActions) {
        // Show nothing when not logged in
        headerActions.innerHTML = '';
    }
}

function getUserInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 1);
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        showUserDropdown = !showUserDropdown;
        dropdown.style.display = showUserDropdown ? 'block' : 'none';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const profileContainer = document.querySelector('.user-profile-container');
    const dropdown = document.getElementById('userDropdown');
    
    if (profileContainer && dropdown && showUserDropdown) {
        if (!profileContainer.contains(event.target)) {
            showUserDropdown = false;
            dropdown.style.display = 'none';
        }
    }
});

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    currentUser = null;
    showUserDropdown = false;
    
    // Clear the header actions (no sign-in button)
    const headerActions = document.getElementById('headerActions');
    if (headerActions) {
        headerActions.innerHTML = '';
    }
    
    showSuccessMessage('Signed out successfully');
}

function showSuccessMessage(message) {
    // Create a temporary success message
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.password-toggle .eye-icon');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🙈';
    } else {
        input.type = 'password';
        toggle.textContent = '👁️';
    }
}
