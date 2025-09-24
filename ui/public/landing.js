// Landing page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize pricing toggle
    initializePricingToggle();
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
