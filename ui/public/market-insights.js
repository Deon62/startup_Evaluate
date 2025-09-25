// Market Insights page JavaScript functionality

let isLoading = false;

// Get evaluation data from localStorage
function getEvaluationData() {
    try {
        const stored = localStorage.getItem('evaluationData');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error parsing evaluation data:', error);
    }
    return null;
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

// Get answers from localStorage
function getAnswers() {
    try {
        const stored = localStorage.getItem('startupAnswers');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error parsing answers:', error);
    }
    return [];
}

document.addEventListener('DOMContentLoaded', function() {
    loadMarketInsights();
});

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

// Load market insights
async function loadMarketInsights() {
    const loadingState = document.getElementById('loadingState');
    const insightsGrid = document.getElementById('insightsGrid');
    const noInsights = document.getElementById('noInsights');
    
    // Check if we have evaluation data
    const evaluationData = getEvaluationData();
    if (!evaluationData || !evaluationData.evaluation) {
        loadingState.style.display = 'none';
        noInsights.style.display = 'flex';
        return;
    }
    
    try {
        loadingState.style.display = 'flex';
        insightsGrid.style.display = 'none';
        noInsights.style.display = 'none';
        
        // Get answers for API calls
        const answers = getAnswers();
        
        // Load real-time insights from API
        let insights;
        try {
            console.log('Fetching real-time insights with answers:', answers);
            console.log('Evaluation data:', evaluationData);
            
            const insightsResponse = await fetch('/api/market-insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answers: answers,
                    evaluationData: evaluationData
                })
            });
            
            const insightsResult = await insightsResponse.json();
            console.log('Insights API response:', insightsResult);
            
            insights = insightsResult.success ? insightsResult.insights : await fetchMarketInsights(evaluationData);
        } catch (error) {
            console.error('Error fetching real-time insights:', error);
            insights = await fetchMarketInsights(evaluationData);
        }
        
        if (insights && insights.length > 0) {
            displayInsights(insights);
            loadingState.style.display = 'none';
            insightsGrid.style.display = 'grid';
            
            // Load real-time market news
            await loadMarketNews(answers, evaluationData);
        } else {
            loadingState.style.display = 'none';
            noInsights.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Error loading market insights:', error);
        loadingState.style.display = 'none';
        noInsights.style.display = 'flex';
    }
}

// Fetch market insights (simulated API call)
async function fetchMarketInsights(evaluationData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock insights based on evaluation data
    const insights = generateMockInsights(evaluationData);
    return insights;
}

// Generate mock market insights
function generateMockInsights(evaluationData) {
    const evaluation = evaluationData.evaluation;
    const insights = [];
    
    // Generate insights based on the startup's characteristics
    if (evaluation.individualScores.clarity > 60) {
        insights.push({
            startupName: "ClearVision AI",
            fundingRound: "Series A",
            amount: "$12M",
            insight: "Your startup shows strong clarity like ClearVision AI, which just raised $12M Series A. They succeeded by focusing on a single, well-defined problem and building a clear value proposition that resonated with enterprise customers."
        });
    }
    
    if (evaluation.individualScores.marketFit > 60) {
        insights.push({
            startupName: "MarketFit Solutions",
            fundingRound: "Seed",
            amount: "$3.5M",
            insight: "Similar to MarketFit Solutions' recent $3.5M seed round, your startup demonstrates strong market understanding. They won by deeply understanding their customer's pain points and building features that directly addressed those needs."
        });
    }
    
    if (evaluation.individualScores.feasibility > 50) {
        insights.push({
            startupName: "FeasibleTech",
            fundingRound: "Series B",
            amount: "$25M",
            insight: "FeasibleTech's $25M Series B success mirrors your feasibility score. They focused on building a robust technical foundation and proving scalability before seeking major funding rounds."
        });
    }
    
    if (evaluation.individualScores.differentiation < 40) {
        insights.push({
            startupName: "DifferentiateNow",
            fundingRound: "Series A",
            amount: "$8M",
            insight: "DifferentiateNow faced similar differentiation challenges but raised $8M Series A by pivoting to a niche market and building proprietary technology that competitors couldn't easily replicate."
        });
    }
    
    // Add some general insights
    insights.push({
        startupName: "StartupFlow",
        fundingRound: "Seed",
        amount: "$2.8M",
        insight: "StartupFlow's recent $2.8M seed round shows the importance of early customer validation. They succeeded by getting 100+ paying customers before raising their seed round, proving product-market fit."
    });
    
    insights.push({
        startupName: "InnovateCorp",
        fundingRound: "Series A",
        amount: "$15M",
        insight: "InnovateCorp's $15M Series A demonstrates the value of strong founding team experience. They leveraged their previous startup exits to build credibility with investors and accelerate their funding timeline."
    });
    
    return insights.slice(0, 4); // Return max 4 insights
}

// Display insights in the grid
function displayInsights(insights) {
    const insightsGrid = document.getElementById('insightsGrid');
    insightsGrid.innerHTML = '';
    
    insights.forEach(insight => {
        const insightCard = createInsightCard(insight);
        insightsGrid.appendChild(insightCard);
    });
}

// Create an insight card element
function createInsightCard(insight) {
    const card = document.createElement('div');
    card.className = 'insight-card';
    
    card.innerHTML = `
        <div class="insight-header">
            <h3 class="startup-name">${insight.startupName}</h3>
            <span class="funding-badge">${insight.fundingRound}</span>
        </div>
        <div class="funding-amount">${insight.amount}</div>
        <div class="funding-round">${insight.fundingRound} Funding</div>
        <div class="insight-highlight">
            <p class="insight-text">${insight.insight}</p>
        </div>
    `;
    
    return card;
}

// Refresh insights
async function refreshInsights() {
    if (isLoading) return;
    
    const refreshButton = document.querySelector('.refresh-button');
    const refreshIcon = document.querySelector('.refresh-icon');
    
    isLoading = true;
    refreshButton.classList.add('loading');
    refreshIcon.style.animation = 'spin 1s linear infinite';
    
    try {
        await loadMarketInsights();
    } finally {
        isLoading = false;
        refreshButton.classList.remove('loading');
        refreshIcon.style.animation = '';
    }
}

// Load market news
async function loadMarketNews(answers, evaluationData) {
    const marketNewsSection = document.getElementById('marketNewsSection');
    const newsGrid = document.getElementById('newsGrid');
    
    try {
        let news;
        
        // Try to get real-time news from API
        if (answers && evaluationData) {
            try {
                const newsResponse = await fetch('/api/market-news', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        answers: answers,
                        evaluationData: evaluationData
                    })
                });
                
                const newsResult = await newsResponse.json();
                news = newsResult.success ? newsResult.news : generateMockNews();
            } catch (error) {
                console.error('Error fetching real-time news:', error);
                news = generateMockNews();
            }
        } else {
            news = generateMockNews();
        }
        
        displayNews(news);
        marketNewsSection.style.display = 'block';
    } catch (error) {
        console.error('Error loading market news:', error);
    }
}

// Generate mock market news
function generateMockNews() {
    return [
        {
            source: "TechCrunch",
            date: "2 hours ago",
            title: "AI Health Startup Raises $50M Series B for Predictive Medicine Platform",
            summary: "MedPredict AI secured $50M in Series B funding to expand its AI-powered disease prediction platform. The startup has shown 85% accuracy in predicting chronic diseases 6 months before clinical symptoms appear.",
            tags: ["funding", "healthcare", "AI"]
        },
        {
            source: "Forbes",
            date: "4 hours ago", 
            title: "YC-Backed Startup Closes $12M Seed Round for Biomarker Monitoring",
            summary: "BioSense Technologies, a Y Combinator graduate, raised $12M to develop continuous biomarker monitoring devices. The funding will accelerate FDA approval for their glucose and cortisol tracking platform.",
            tags: ["funding", "healthcare", "biotech"]
        },
        {
            source: "VentureBeat",
            date: "6 hours ago",
            title: "Preventive Health Market Sees 40% Growth as Consumers Embrace Proactive Care",
            summary: "The preventive healthcare market reached $280B globally, driven by increased consumer awareness and AI-powered health optimization tools. Startups focusing on early disease detection are seeing record funding rounds.",
            tags: ["market", "healthcare", "trends"]
        },
        {
            source: "Crunchbase",
            date: "8 hours ago",
            title: "HealthTech Unicorn Valued at $2.8B After Latest Funding Round",
            summary: "WellnessAI, a preventive health platform, achieved unicorn status with a $2.8B valuation. The company's AI-driven health optimization has helped 1M+ users prevent chronic diseases through early intervention.",
            tags: ["funding", "healthcare", "unicorn"]
        },
        {
            source: "PitchBook",
            date: "12 hours ago",
            title: "FDA Fast-Tracks Approval for AI Health Prediction Tools",
            summary: "The FDA announced streamlined approval pathways for AI-powered health prediction tools, reducing approval time from 3 years to 18 months. This accelerates innovation in preventive healthcare technology.",
            tags: ["regulatory", "healthcare", "AI"]
        },
        {
            source: "Startup Weekly",
            date: "1 day ago",
            title: "Biomarker Sensing Technology Costs Drop 60% in 2024",
            summary: "Advances in sensor technology have reduced biomarker monitoring costs by 60%, making continuous health tracking accessible to mainstream consumers. This trend is driving rapid adoption of preventive health platforms.",
            tags: ["technology", "healthcare", "costs"]
        }
    ];
}

// Display news in the grid
function displayNews(news) {
    const newsGrid = document.getElementById('newsGrid');
    newsGrid.innerHTML = '';
    
    news.forEach(article => {
        const newsCard = createNewsCard(article);
        newsGrid.appendChild(newsCard);
    });
}

// Create a news card element
function createNewsCard(article) {
    const card = document.createElement('div');
    card.className = 'news-card';
    
    const tagsHtml = article.tags.map(tag => 
        `<span class="news-tag ${tag}">${tag}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="news-header">
            <span class="news-source">${article.source}</span>
            <span class="news-date">${article.date}</span>
        </div>
        <h3 class="news-title">${article.title}</h3>
        <p class="news-summary">${article.summary}</p>
        <div class="news-tags">
            ${tagsHtml}
        </div>
    `;
    
    return card;
}

// Get evaluation data from localStorage
function getEvaluationData() {
    try {
        const stored = localStorage.getItem('evaluationData');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error parsing evaluation data:', error);
    }
    return null;
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
