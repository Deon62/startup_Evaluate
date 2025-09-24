// Landing page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize pricing toggle
    initializePricingToggle();
    
    // Initialize testimonial carousel
    initializeCarousel();
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
