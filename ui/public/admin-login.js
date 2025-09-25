// Admin Login JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminBtnText = document.getElementById('adminBtnText');
    const adminBtnIcon = document.getElementById('adminBtnIcon');
    
    // Check if already logged in as admin
    checkAdminAuth();
    
    adminLoginForm.addEventListener('submit', handleAdminLogin);
});

// Check if admin is already authenticated
function checkAdminAuth() {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
        // Verify token is still valid
        verifyAdminToken(adminToken);
    }
}

// Verify admin token
async function verifyAdminToken(token) {
    try {
        const response = await fetch('/api/admin/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Token is valid, redirect to admin dashboard
            window.location.href = 'admin-dashboard.html';
        } else {
            // Token is invalid, remove it
            localStorage.removeItem('adminToken');
        }
    } catch (error) {
        console.error('Error verifying admin token:', error);
        localStorage.removeItem('adminToken');
    }
}

// Handle admin login
async function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    // Show loading state
    setLoadingState(true);
    hideMessages();
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login successful
            localStorage.setItem('adminToken', data.data.token);
            showSuccessMessage('Login successful! Redirecting...');
            
            // Redirect to admin dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1000);
        } else {
            // Login failed
            showErrorMessage(data.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showErrorMessage('Network error. Please try again.');
    } finally {
        setLoadingState(false);
    }
}

// Set loading state
function setLoadingState(loading) {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminBtnText = document.getElementById('adminBtnText');
    const adminBtnIcon = document.getElementById('adminBtnIcon');
    
    if (loading) {
        adminLoginBtn.classList.add('loading');
        adminBtnText.textContent = 'Signing In...';
        adminBtnIcon.textContent = '⟳';
        adminLoginBtn.disabled = true;
    } else {
        adminLoginBtn.classList.remove('loading');
        adminBtnText.textContent = 'Sign In';
        adminBtnIcon.textContent = '→';
        adminLoginBtn.disabled = false;
    }
}

// Show error message
function showErrorMessage(message) {
    hideMessages();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message show';
    errorDiv.textContent = message;
    
    const form = document.getElementById('adminLoginForm');
    form.insertBefore(errorDiv, form.firstChild);
}

// Show success message
function showSuccessMessage(message) {
    hideMessages();
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message show';
    successDiv.textContent = message;
    
    const form = document.getElementById('adminLoginForm');
    form.insertBefore(successDiv, form.firstChild);
}

// Hide all messages
function hideMessages() {
    const messages = document.querySelectorAll('.error-message, .success-message');
    messages.forEach(msg => msg.remove());
}

// Toggle password visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🙈';
    } else {
        input.type = 'password';
        toggle.textContent = '👁️';
    }
}
