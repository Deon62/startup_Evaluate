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
        
        // Store evaluation data in localStorage and redirect to dashboard
        localStorage.setItem('evaluationData', JSON.stringify(result));
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('Error evaluating startup:', error);
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
