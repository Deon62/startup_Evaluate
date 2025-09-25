// Admin Dashboard JavaScript
let dashboardData = {};
let charts = {};

document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    checkAdminAuth();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboardData();
});

// Check admin authentication
function checkAdminAuth() {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Verify token
    verifyAdminToken(adminToken);
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
        
        if (!response.ok) {
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-login.html';
        }
    } catch (error) {
        console.error('Error verifying admin token:', error);
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    }
}

// Initialize dashboard
function initializeDashboard() {
    // Set up navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
    
    // Initialize charts
    initializeCharts();
}

// Set up event listeners
function setupEventListeners() {
    // Analytics range change
    const analyticsRange = document.getElementById('analyticsRange');
    if (analyticsRange) {
        analyticsRange.addEventListener('change', function() {
            loadAnalyticsData(this.value);
        });
    }
}

// Switch between sections
function switchSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.content-section').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        users: 'User Management',
        analytics: 'Analytics',
        settings: 'Settings'
    };
    
    const subtitles = {
        dashboard: 'Site overview and metrics',
        users: 'Manage user accounts and permissions',
        analytics: 'Detailed performance metrics',
        settings: 'System configuration and maintenance'
    };
    
    document.getElementById('pageTitle').textContent = titles[section];
    document.getElementById('pageSubtitle').textContent = subtitles[section];
    
    // Load section-specific data
    if (section === 'users') {
        loadUsersData();
    } else if (section === 'analytics') {
        loadAnalyticsData();
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            dashboardData = await response.json();
            updateDashboardMetrics();
            updateCharts();
            updateRecentActivity();
            updateLastUpdated();
        } else {
            console.error('Failed to load dashboard data');
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Update dashboard metrics
function updateDashboardMetrics() {
    const metrics = dashboardData.metrics || {};
    
    document.getElementById('totalUsers').textContent = metrics.totalUsers || 0;
    document.getElementById('totalEvaluations').textContent = metrics.totalEvaluations || 0;
    document.getElementById('avgScore').textContent = (metrics.avgScore || 0).toFixed(1);
    document.getElementById('revenue').textContent = `$${metrics.revenue || 0}`;
    
    // Update changes
    document.getElementById('userChange').textContent = `+${metrics.userGrowth || 0}%`;
    document.getElementById('evaluationChange').textContent = `+${metrics.evaluationGrowth || 0}%`;
    document.getElementById('scoreChange').textContent = `${metrics.scoreChange || 0}%`;
    document.getElementById('revenueChange').textContent = `+${metrics.revenueGrowth || 0}%`;
}

// Initialize charts
function initializeCharts() {
    // User Growth Chart
    const userGrowthCtx = document.getElementById('userGrowthChart');
    if (userGrowthCtx) {
        charts.userGrowth = new Chart(userGrowthCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'New Users',
                    data: [],
                    borderColor: '#F97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10
                    }
                }
            }
        });
    }
    
    // Evaluations Chart
    const evaluationsCtx = document.getElementById('evaluationsChart');
    if (evaluationsCtx) {
        charts.evaluations = new Chart(evaluationsCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Evaluations',
                    data: [],
                    backgroundColor: '#F97316',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10
                    }
                }
            }
        });
    }
}

// Update charts
function updateCharts() {
    const chartData = dashboardData.charts || {};
    
    // Update user growth chart
    if (charts.userGrowth && chartData.userGrowth) {
        charts.userGrowth.data.labels = chartData.userGrowth.labels;
        charts.userGrowth.data.datasets[0].data = chartData.userGrowth.data;
        charts.userGrowth.update();
    }
    
    // Update evaluations chart
    if (charts.evaluations && chartData.evaluations) {
        charts.evaluations.data.labels = chartData.evaluations.labels;
        charts.evaluations.data.datasets[0].data = chartData.evaluations.data;
        charts.evaluations.update();
    }
}

// Update recent activity
function updateRecentActivity() {
    const activities = dashboardData.recentActivity || [];
    const activityContainer = document.getElementById('recentActivity');
    
    if (activities.length === 0) {
        activityContainer.innerHTML = '<p class="no-activity">No recent activity</p>';
        return;
    }
    
    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-content">
                <p>${activity.message}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `).join('');
}

// Update last updated time
function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('lastUpdated').textContent = timeString;
}

// Load users data
async function loadUsersData() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            updateUsersTable(users);
        } else {
            console.error('Failed to load users data');
        }
    } catch (error) {
        console.error('Error loading users data:', error);
    }
}

// Update users table
function updateUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name || 'N/A'}</td>
            <td>${user.email}</td>
            <td>${user.evaluationCount || 0}</td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
            <td><span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-secondary" onclick="viewUser('${user.id}')">View</button>
                    <button class="btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load analytics data
async function loadAnalyticsData(range = 30) {
    try {
        const response = await fetch(`/api/admin/analytics?range=${range}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const analytics = await response.json();
            updateAnalyticsCharts(analytics);
        } else {
            console.error('Failed to load analytics data');
        }
    } catch (error) {
        console.error('Error loading analytics data:', error);
    }
}

// Update analytics charts
function updateAnalyticsCharts(analytics) {
    // This would update the detailed analytics charts
    console.log('Analytics data:', analytics);
}

// Refresh users
function refreshUsers() {
    loadUsersData();
}

// View user details
function viewUser(userId) {
    console.log('View user:', userId);
    // Implement user details modal
}

// Delete user
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        console.log('Delete user:', userId);
        // Implement user deletion
    }
}

// Export data
function exportData() {
    console.log('Export data');
    // Implement data export
}

// Clear cache
function clearCache() {
    console.log('Clear cache');
    // Implement cache clearing
}

// Reset system
function resetSystem() {
    if (confirm('Are you sure you want to reset the system? This action cannot be undone.')) {
        console.log('Reset system');
        // Implement system reset
    }
}

// Handle admin logout
function handleAdminLogout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
}

// Auto-refresh dashboard data every 30 seconds
setInterval(() => {
    if (document.querySelector('#dashboard-section').classList.contains('active')) {
        loadDashboardData();
    }
}, 30000);
