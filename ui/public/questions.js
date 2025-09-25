// Questions page JavaScript functionality

const STARTUP_QUESTIONS = [
    "What is your unique value proposition? What's genuinely new or different about what you're building?",
    "What's your unfair competitive advantage? Why can't others easily copy you?",
    "Who is your customer, really? Describe the exact persona (pain points, alternatives).",
    "Why now? What market/tech/regulatory shifts make this the right moment?",
    "What critical problem are you solving, and how painful is it?",
    "What would stop this idea from succeeding? List the biggest risks.",
    "If your product disappeared tomorrow, what would customers miss most?",
    "How will you make money, and why will customers actually pay?",
    "What is your long-term vision (5–10 years) if everything goes right?",
    "Why you? What in your background/network makes you the right team?"
];

let answers = Array(10).fill('');
let isLoading = false;

document.addEventListener('DOMContentLoaded', function() {
    initializeQuestions();
    updateProgress();
});

function initializeQuestions() {
    const container = document.getElementById('questionsContainer');
    
    STARTUP_QUESTIONS.forEach((question, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.innerHTML = `
            <label class="question-label">
                <span class="question-number">${index + 1}</span>
                ${question}
            </label>
            <textarea
                class="answer-textarea"
                placeholder="Share your thoughts here..."
                rows="4"
                data-index="${index}"
            ></textarea>
        `;
        
        container.appendChild(questionCard);
    });
    
    // Add event listeners to all textareas
    const textareas = document.querySelectorAll('.answer-textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            const index = parseInt(this.dataset.index);
            answers[index] = this.value;
            updateProgress();
        });
    });
}

function updateProgress() {
    const filledCount = answers.filter(answer => answer.trim().length > 0).length;
    const progressPercentage = (filledCount / 10) * 100;
    
    // Update progress text
    document.getElementById('filledCount').textContent = filledCount;
    
    // Update progress bar
    document.getElementById('progressFill').style.width = `${progressPercentage}%`;
    
    // Update button state
    const evaluateButton = document.getElementById('evaluateButton');
    const validationMessage = document.getElementById('validationMessage');
    
    if (filledCount >= 7 && !isLoading) {
        evaluateButton.classList.remove('disabled');
        validationMessage.style.display = 'none';
    } else {
        evaluateButton.classList.add('disabled');
        if (filledCount < 7) {
            validationMessage.style.display = 'block';
        }
    }
}

async function handleEvaluate() {
    if (isLoading) return;
    
    const filledCount = answers.filter(answer => answer.trim().length > 0).length;
    if (filledCount < 7) return;
    
    isLoading = true;
    
    // Create loading overlay with progressive feedback
    createLoadingOverlay();
    
    // Update button to loading state
    const evaluateButton = document.getElementById('evaluateButton');
    const buttonText = document.getElementById('buttonText');
    const buttonIcon = document.getElementById('buttonIcon');
    
    evaluateButton.classList.add('loading');
    buttonText.textContent = 'Evaluating...';
    buttonIcon.textContent = '⟳';
    buttonIcon.classList.add('spinning');
    
    try {
        const response = await fetch('/api/evaluate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answers }),
        });

        const result = await response.json();
        
        // Store evaluation data and answers in localStorage
        localStorage.setItem('evaluationData', JSON.stringify(result));
        localStorage.setItem('startupAnswers', JSON.stringify(answers));
        
        // Show completion message before redirect
        showCompletionMessage();
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error evaluating startup:', error);
        hideLoadingOverlay();
        alert('Failed to evaluate your startup. Please try again.');
        
        // Reset button state
        evaluateButton.classList.remove('loading');
        buttonText.textContent = 'Evaluate';
        buttonIcon.textContent = '→';
        buttonIcon.classList.remove('spinning');
    } finally {
        isLoading = false;
    }
}

// Create engaging loading overlay with progressive feedback
function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-animation">
                <div class="loading-spinner"></div>
                <div class="loading-pulse"></div>
            </div>
            <h2 class="loading-title">Analyzing Your Startup</h2>
            <p class="loading-subtitle" id="loadingSubtitle">Initializing AI evaluation...</p>
            <div class="loading-progress">
                <div class="progress-bar" id="progressBar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">0%</div>
            </div>
            <div class="loading-tips" id="loadingTips">
                <div class="tip-item active">
                    <span class="tip-icon">•</span>
                    <span class="tip-text">Analyzing your unique value proposition...</span>
                </div>
            </div>
            <div class="estimated-time">
                <span class="time-icon">•</span>
                <span class="time-text">Estimated time: 15-30 seconds</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        #loadingOverlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #FFFFFF;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: #0F172A;
        }
        
        .loading-content {
            text-align: center;
            max-width: 500px;
            padding: 2rem;
        }
        
        .loading-animation {
            position: relative;
            margin-bottom: 2rem;
        }
        
        .loading-spinner {
            width: 80px;
            height: 80px;
            border: 4px solid #E5E7EB;
            border-top: 4px solid #F97316;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        
        .loading-pulse {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background: rgba(249, 115, 22, 0.1);
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.3; }
        }
        
        .loading-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #0F172A;
        }
        
        .loading-subtitle {
            font-size: 1.1rem;
            margin-bottom: 2rem;
            color: #6B7280;
        }
        
        .loading-progress {
            margin-bottom: 2rem;
            position: relative;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #E5E7EB;
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        }
        
        .progress-fill {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: #F97316 !important;
            border-radius: 4px;
            width: 0% !important;
            transition: width 0.8s ease-in-out;
            z-index: 1;
        }
        
        @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        
        .progress-text {
            position: absolute;
            top: -25px;
            right: 0;
            font-size: 0.9rem;
            font-weight: 600;
            color: #6B7280;
        }
        
        .loading-tips {
            margin-bottom: 2rem;
        }
        
        .tip-item {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem;
            background: #F9FAFB;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.5s ease;
            border: 1px solid #E5E7EB;
        }
        
        .tip-item.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        .tip-icon {
            font-size: 1.2rem;
            color: #F97316;
        }
        
        .tip-text {
            font-size: 0.9rem;
            color: #0F172A;
        }
        
        .estimated-time {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: #6B7280;
        }
        
        .time-icon {
            font-size: 1rem;
            color: #F97316;
        }
    `;
    
    document.head.appendChild(style);
    
    // Start progressive feedback
    startProgressiveFeedback();
    
    // Initialize progress bar to 0%
    setTimeout(() => {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        if (progressFill && progressText) {
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
        }
    }, 100);
}

// Progressive feedback messages
function startProgressiveFeedback() {
    const messages = [
        { text: "Analyzing your unique value proposition...", delay: 0, progress: 15 },
        { text: "Evaluating market timing and opportunity...", delay: 3000, progress: 30 },
        { text: "Assessing competitive advantages...", delay: 6000, progress: 45 },
        { text: "Calculating feasibility scores...", delay: 9000, progress: 60 },
        { text: "Generating personalized insights...", delay: 12000, progress: 75 },
        { text: "Finding similar startup patterns...", delay: 15000, progress: 90 },
        { text: "Finalizing your evaluation...", delay: 18000, progress: 100 },
        { text: "Polishing your results and cross-checking them...", delay: 21000, progress: 100, isPolishing: true }
    ];
    
    let currentMessageIndex = 0;
    
    function showNextMessage() {
        if (currentMessageIndex < messages.length) {
            const message = messages[currentMessageIndex];
            const tipsContainer = document.getElementById('loadingTips');
            
            // Update subtitle
            document.getElementById('loadingSubtitle').textContent = message.text;
            
            // Update progress bar and percentage
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            if (progressFill && progressText) {
                console.log('Updating progress to:', message.progress + '%');
                // Force a reflow to ensure the width change is applied
                progressFill.style.width = '0%';
                progressFill.offsetHeight; // Trigger reflow
                progressFill.style.width = message.progress + '%';
                progressText.textContent = message.progress + '%';
                console.log('Progress bar width set to:', progressFill.style.width);
            } else {
                console.log('Progress elements not found:', { progressFill, progressText });
            }
            
            // Add new tip
            const tipItem = document.createElement('div');
            tipItem.className = 'tip-item active';
            tipItem.innerHTML = `
                <span class="tip-icon">•</span>
                <span class="tip-text">${message.text}</span>
            `;
            
            tipsContainer.appendChild(tipItem);
            
            // Remove old tips (keep only last 3)
            const tips = tipsContainer.querySelectorAll('.tip-item');
            if (tips.length > 3) {
                tips[0].remove();
            }
            
            // Special handling for polishing step
            if (message.isPolishing) {
                // Add polishing animation to the progress bar
                progressFill.style.animation = 'polishing 1.5s ease-in-out infinite';
                
                // Add polishing styles
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes polishing {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.7; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            currentMessageIndex++;
            
            if (currentMessageIndex < messages.length) {
                setTimeout(showNextMessage, messages[currentMessageIndex].delay - (currentMessageIndex > 0 ? messages[currentMessageIndex - 1].delay : 0));
            }
        }
    }
    
    showNextMessage();
}

// Show completion message
function showCompletionMessage() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="completion-animation">
                    <div class="checkmark">✓</div>
                </div>
                <h2 class="loading-title">Evaluation Complete!</h2>
                <p class="loading-subtitle">Redirecting to your results...</p>
            </div>
        `;
        
        // Add completion styles
        const style = document.createElement('style');
        style.textContent = `
            .completion-animation {
                margin-bottom: 2rem;
            }
            
            .checkmark {
                width: 80px;
                height: 80px;
                background: white;
                color: #F97316;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5rem;
                font-weight: bold;
                margin: 0 auto;
                animation: checkmarkPop 0.6s ease-out;
            }
            
            @keyframes checkmarkPop {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Back to landing page function
function goToLanding() {
    window.location.href = 'index.html';
}

// Sidebar functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('sidebar-open');
}

// Close sidebar when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    
    if (sidebar.classList.contains('open') && 
        !sidebar.contains(event.target) && 
        !menuToggle.contains(event.target) && 
        !closeSidebar.contains(event.target)) {
        sidebar.classList.remove('open');
        document.getElementById('mainContent').classList.remove('sidebar-open');
    }
});

// Close sidebar on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            document.getElementById('mainContent').classList.remove('sidebar-open');
        }
    }
});

// Profile functions
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

function handleProfileLogout() {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Redirect to landing page
    window.location.href = '/index.html';
}

// Initialize profile data when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            
            // Update profile display
            const profileInitials = document.getElementById('profileInitials');
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            
            if (profileInitials && user.name) {
                profileInitials.textContent = user.name.charAt(0).toUpperCase();
            }
            
            if (profileName && user.name) {
                profileName.textContent = user.name;
            }
            
            if (profileEmail && user.email) {
                profileEmail.textContent = user.email;
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const profileSection = document.getElementById('sidebarProfile');
        const dropdown = document.getElementById('profileDropdown');
        
        if (profileSection && dropdown && !profileSection.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });
});