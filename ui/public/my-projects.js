// My Projects page JavaScript functionality

let projects = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    initializeProfile();
    setupEventListeners();
});

// Load projects from backend
async function loadProjects() {
    try {
        // Check if user is authenticated
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('User not authenticated, showing empty state');
            projects = [];
            renderProjects();
            updateStats();
            return;
        }

        console.log('Loading projects from backend...');
        
        const response = await fetch('/api/projects/my-projects', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load projects: ${response.statusText}`);
        }
        
        const result = await response.json();
        projects = result.projects || [];
        
        console.log('Loaded projects from backend:', projects);
        renderProjects();
        updateStats();
        
    } catch (error) {
        console.error('Error loading projects from backend:', error);
        projects = [];
        renderProjects();
        updateStats();
    }
}

// Render projects in the grid
function renderProjects() {
    console.log('Rendering projects, count:', projects.length);
    console.log('Projects data:', projects);
    
    const projectsGrid = document.getElementById('projectsGrid');
    const noProjects = document.getElementById('noProjects');
    
    if (projects.length === 0) {
        noProjects.style.display = 'block';
        projectsGrid.innerHTML = '';
        projectsGrid.appendChild(noProjects);
        return;
    }
    
    noProjects.style.display = 'none';
    
    projectsGrid.innerHTML = projects.map((project) => `
        <div class="project-card" data-project-id="${project.id}">
            <div class="project-header">
                <div>
                    <h3 class="project-title">${project.name || 'Untitled Project'}</h3>
                    <p class="project-date">${formatDate(project.createdAt)}</p>
                </div>
                <div class="project-score">${project.overallScore || 0}</div>
            </div>
            <p class="project-description">${project.description || 'No description available'}</p>
            <div class="project-meta">
                <div class="project-status">
                    <span class="status-dot"></span>
                    <span>Completed</span>
                </div>
                <div class="project-actions">
                    <button class="action-btn view-btn" data-project-id="${project.id}" title="View Details">
                        👁️
                    </button>
                    <button class="action-btn export-btn" data-project-id="${project.id}" title="Export">
                        📄
                    </button>
                    <button class="action-btn delete-btn" data-project-id="${project.id}" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    const totalProjects = document.getElementById('totalProjects');
    const avgScore = document.getElementById('avgScore');
    
    totalProjects.textContent = projects.length;
    
    if (projects.length > 0) {
        const totalScore = projects.reduce((sum, project) => sum + (project.overallScore || 0), 0);
        const average = Math.round(totalScore / projects.length);
        avgScore.textContent = average;
    } else {
        avgScore.textContent = '0';
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// View project details
async function viewProject(projectId) {
    console.log('viewProject called with projectId:', projectId);
    
    try {
        // Check if user is authenticated
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Please log in to view projects');
            return;
        }

        // Fetch project details from backend
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load project: ${response.statusText}`);
        }
        
        const result = await response.json();
        const project = result.project;
        
        console.log('Fetched project from backend:', project);
        
        // Store the project data for the dashboard
        localStorage.setItem('currentProject', JSON.stringify(project));
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('Error loading project:', error);
        alert('Failed to load project details');
    }
}

// Export project as PDF
async function exportProject(projectId) {
    console.log('exportProject called with projectId:', projectId);
    
    try {
        // Check if user is authenticated
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Please log in to export projects');
            return;
        }

        // Fetch project details from backend
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load project: ${response.statusText}`);
        }
        
        const result = await response.json();
        const project = result.project;
        
        console.log('Project found for export from backend:', project);
    
    // Check if jsPDF is available
    if (typeof window.jsPDF === 'undefined') {
        console.error('jsPDF is not loaded, using fallback export');
        exportProjectAsText(project);
        return;
    }
    
    try {
        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();
    
    // Set up colors
    const primaryColor = '#F97316';
    const textColor = '#1F2937';
    const mutedColor = '#6B7280';
    
    // Page setup
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.text('Evalio - Startup Evaluation Report', margin, yPosition);
    yPosition += 15;
    
    // Project name
    doc.setFontSize(18);
    doc.setTextColor(textColor);
    doc.text(project.name || 'Untitled Project', margin, yPosition);
    yPosition += 10;
    
    // Date and score
    doc.setFontSize(12);
    doc.setTextColor(mutedColor);
    doc.text(`Generated on: ${formatDate(project.createdAt)}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Overall Score: ${project.overallScore || 0}/100`, margin, yPosition);
    yPosition += 15;
    
    // Description
    if (project.description && project.description !== 'No description available') {
        doc.setFontSize(14);
        doc.setTextColor(textColor);
        doc.text('Project Description:', margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(11);
        doc.setTextColor(mutedColor);
        const descriptionLines = doc.splitTextToSize(project.description, pageWidth - 2 * margin);
        doc.text(descriptionLines, margin, yPosition);
        yPosition += descriptionLines.length * 5 + 10;
    }
    
    // Answers section
    if (project.answers && project.answers.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(textColor);
        doc.text('Your Answers:', margin, yPosition);
        yPosition += 10;
        
        const questions = [
            "What is your unique value proposition?",
            "What's your unfair competitive advantage?",
            "Who is your customer, really?",
            "Why now? What market shifts make this the right moment?",
            "What critical problem are you solving?",
            "What would stop this idea from succeeding?",
            "If your product disappeared tomorrow, what would customers miss?",
            "How will you make money?",
            "What is your long-term vision?",
            "Why you? What makes you the right team?"
        ];
        
        project.answers.forEach((answer, index) => {
            if (answer && answer.trim()) {
                // Check if we need a new page
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = margin;
                }
                
                doc.setFontSize(12);
                doc.setTextColor(textColor);
                doc.text(`${index + 1}. ${questions[index] || `Question ${index + 1}`}`, margin, yPosition);
                yPosition += 6;
                
                doc.setFontSize(10);
                doc.setTextColor(mutedColor);
                const answerLines = doc.splitTextToSize(answer, pageWidth - 2 * margin);
                doc.text(answerLines, margin, yPosition);
                yPosition += answerLines.length * 4 + 8;
            }
        });
    }
    
    // Evaluation results
    if (project.evaluation && project.evaluation.evaluation) {
        const evaluation = project.evaluation.evaluation;
        
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = margin;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(textColor);
        doc.text('Evaluation Results:', margin, yPosition);
        yPosition += 10;
        
        // Strengths
        if (evaluation.strengths && evaluation.strengths.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(primaryColor);
            doc.text('Strengths:', margin, yPosition);
            yPosition += 6;
            
            doc.setFontSize(10);
            doc.setTextColor(mutedColor);
            evaluation.strengths.forEach(strength => {
                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = margin;
                }
                doc.text(`• ${strength}`, margin + 5, yPosition);
                yPosition += 5;
            });
            yPosition += 5;
        }
        
        // Concerns
        if (evaluation.concerns && evaluation.concerns.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor('#DC2626');
            doc.text('Areas for Improvement:', margin, yPosition);
            yPosition += 6;
            
            doc.setFontSize(10);
            doc.setTextColor(mutedColor);
            evaluation.concerns.forEach(concern => {
                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = margin;
                }
                doc.text(`• ${concern}`, margin + 5, yPosition);
                yPosition += 5;
            });
            yPosition += 5;
        }
        
        // Recommendations
        if (evaluation.recommendations && evaluation.recommendations.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor('#059669');
            doc.text('Recommendations:', margin, yPosition);
            yPosition += 6;
            
            doc.setFontSize(10);
            doc.setTextColor(mutedColor);
            evaluation.recommendations.forEach(recommendation => {
                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = margin;
                }
                doc.text(`• ${recommendation}`, margin + 5, yPosition);
                yPosition += 5;
            });
        }
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(mutedColor);
    doc.text('Generated by Evalio - Startup Validation Platform', margin, pageHeight - 10);
    doc.text('Visit us at your-domain.com', pageWidth - margin - 30, pageHeight - 10);
    
        // Save the PDF
        const fileName = `${(project.name || 'Untitled Project').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_evaluation.pdf`;
        doc.save(fileName);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Using text export instead.');
        exportProjectAsText(project);
    }
    
    } catch (error) {
        console.error('Error loading project for export:', error);
        alert('Failed to load project for export');
    }
}

// Fallback text export function
function exportProjectAsText(project) {
    const questions = [
        "What is your unique value proposition?",
        "What's your unfair competitive advantage?",
        "Who is your customer, really?",
        "Why now? What market shifts make this the right moment?",
        "What critical problem are you solving?",
        "What would stop this idea from succeeding?",
        "If your product disappeared tomorrow, what would customers miss?",
        "How will you make money?",
        "What is your long-term vision?",
        "Why you? What makes you the right team?"
    ];
    
    let textContent = `EVALIO - STARTUP EVALUATION REPORT\n`;
    textContent += `=====================================\n\n`;
    textContent += `Project: ${project.name || 'Untitled Project'}\n`;
    textContent += `Date: ${formatDate(project.createdAt)}\n`;
    textContent += `Overall Score: ${project.overallScore || 0}/100\n\n`;
    
    if (project.description && project.description !== 'No description available') {
        textContent += `DESCRIPTION:\n${project.description}\n\n`;
    }
    
    if (project.answers && project.answers.length > 0) {
        textContent += `YOUR ANSWERS:\n`;
        textContent += `=============\n\n`;
        
        project.answers.forEach((answer, index) => {
            if (answer && answer.trim()) {
                textContent += `${index + 1}. ${questions[index] || `Question ${index + 1}`}\n`;
                textContent += `Answer: ${answer}\n\n`;
            }
        });
    }
    
    if (project.evaluation && project.evaluation.evaluation) {
        const evaluation = project.evaluation.evaluation;
        textContent += `EVALUATION RESULTS:\n`;
        textContent += `==================\n\n`;
        
        if (evaluation.strengths && evaluation.strengths.length > 0) {
            textContent += `STRENGTHS:\n`;
            evaluation.strengths.forEach(strength => {
                textContent += `• ${strength}\n`;
            });
            textContent += `\n`;
        }
        
        if (evaluation.concerns && evaluation.concerns.length > 0) {
            textContent += `AREAS FOR IMPROVEMENT:\n`;
            evaluation.concerns.forEach(concern => {
                textContent += `• ${concern}\n`;
            });
            textContent += `\n`;
        }
        
        if (evaluation.recommendations && evaluation.recommendations.length > 0) {
            textContent += `RECOMMENDATIONS:\n`;
            evaluation.recommendations.forEach(recommendation => {
                textContent += `• ${recommendation}\n`;
            });
            textContent += `\n`;
        }
    }
    
    textContent += `\nGenerated by Evalio - Startup Validation Platform\n`;
    textContent += `Visit us at your-domain.com\n`;
    
    // Create and download text file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(project.name || 'Untitled Project').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_evaluation.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Delete project
async function deleteProject(projectId) {
    console.log('deleteProject called with projectId:', projectId);
    
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        try {
            // Check if user is authenticated
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Please log in to delete projects');
                return;
            }

            // Delete from backend
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to delete project: ${response.statusText}`);
            }
            
            console.log('Project deleted from backend successfully');
            
            // Remove from local projects array
            const projectIndex = projects.findIndex(p => p.id === projectId);
            if (projectIndex !== -1) {
                projects.splice(projectIndex, 1);
                renderProjects();
                updateStats();
            }
            
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    }
}

// Save projects to localStorage
function saveProjects() {
    localStorage.setItem('userProjects', JSON.stringify(projects));
}

// Start new evaluation
function startNewEvaluation() {
    // Clear any existing evaluation data
    localStorage.removeItem('evaluationData');
    localStorage.removeItem('startupAnswers');
    localStorage.removeItem('currentProject');
    
    // Redirect to questions page
    window.location.href = '/questions.html';
}

// Sidebar functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('sidebar-open');
}

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

// Initialize profile data
function initializeProfile() {
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
}

// Setup event listeners
function setupEventListeners() {
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
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const profileSection = document.getElementById('sidebarProfile');
        const dropdown = document.getElementById('profileDropdown');
        
        if (profileSection && dropdown && !profileSection.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });
    
    // Handle project card clicks and button clicks
    document.addEventListener('click', function(event) {
        console.log('Click event detected:', event.target);
        
        // Handle project card clicks
        if (event.target.closest('.project-card')) {
            const card = event.target.closest('.project-card');
            const projectId = card.getAttribute('data-project-id');
            console.log('Project card clicked, ID:', projectId);
            
            // If clicking on the card itself (not on buttons), view the project
            if (!event.target.closest('.project-actions')) {
                console.log('Card body clicked, viewing project');
                viewProject(projectId);
            }
        }
        
        // Handle view button clicks
        if (event.target.classList.contains('view-btn')) {
            event.stopPropagation();
            const projectId = event.target.getAttribute('data-project-id');
            console.log('View button clicked, ID:', projectId);
            viewProject(projectId);
        }
        
        // Handle export button clicks
        if (event.target.classList.contains('export-btn')) {
            event.stopPropagation();
            const projectId = event.target.getAttribute('data-project-id');
            console.log('Export button clicked, ID:', projectId);
            exportProject(projectId);
        }
        
        // Handle delete button clicks
        if (event.target.classList.contains('delete-btn')) {
            event.stopPropagation();
            const projectId = event.target.getAttribute('data-project-id');
            console.log('Delete button clicked, ID:', projectId);
            deleteProject(projectId);
        }
    });
}

// Check if user is authenticated
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// Check if jsPDF is loaded
function checkJsPDF() {
    if (typeof window.jsPDF === 'undefined') {
        console.warn('jsPDF not loaded yet, retrying...');
        setTimeout(checkJsPDF, 1000);
    } else {
        console.log('jsPDF loaded successfully');
    }
}

// Initialize authentication check
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuthentication()) {
        return;
    }
    
    // Initialize page components
    loadProjects();
    initializeProfile();
    setupEventListeners();
    checkJsPDF();
});
