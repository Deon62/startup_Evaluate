// My Projects page JavaScript functionality

let projects = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    initializeProfile();
    setupEventListeners();
});

// Load projects from localStorage
function loadProjects() {
    try {
        const storedProjects = localStorage.getItem('userProjects');
        if (storedProjects) {
            projects = JSON.parse(storedProjects);
        }
        renderProjects();
        updateStats();
    } catch (error) {
        console.error('Error loading projects:', error);
        projects = [];
    }
}

// Render projects in the grid
function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    const noProjects = document.getElementById('noProjects');
    
    if (projects.length === 0) {
        noProjects.style.display = 'block';
        projectsGrid.innerHTML = '';
        projectsGrid.appendChild(noProjects);
        return;
    }
    
    noProjects.style.display = 'none';
    
    projectsGrid.innerHTML = projects.map((project, index) => `
        <div class="project-card" onclick="viewProject(${index})">
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
                    <button class="action-btn" onclick="event.stopPropagation(); viewProject(${index})" title="View Details">
                        👁️
                    </button>
                    <button class="action-btn" onclick="event.stopPropagation(); exportProject(${index})" title="Export">
                        📄
                    </button>
                    <button class="action-btn" onclick="event.stopPropagation(); deleteProject(${index})" title="Delete">
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
function viewProject(index) {
    const project = projects[index];
    if (project) {
        // Store the project data for the dashboard
        localStorage.setItem('currentProject', JSON.stringify(project));
        // Redirect to dashboard
        window.location.href = '/dashboard.html';
    }
}

// Export project as PDF
function exportProject(index) {
    const project = projects[index];
    if (!project) return;
    
    // Create a simple text export for now
    const exportData = {
        name: project.name || 'Untitled Project',
        description: project.description || 'No description',
        overallScore: project.overallScore || 0,
        createdAt: formatDate(project.createdAt),
        answers: project.answers || [],
        evaluation: project.evaluation || {}
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_evaluation.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Delete project
function deleteProject(index) {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        projects.splice(index, 1);
        saveProjects();
        renderProjects();
        updateStats();
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

// Initialize authentication check
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuthentication()) {
        return;
    }
});
