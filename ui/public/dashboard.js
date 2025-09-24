// Mock evaluation data
const mockEvaluationData = {
    success: true,
    evaluation: {
        overallScore: 78,
        strengths: [
            "Clear value proposition identified",
            "Strong market timing awareness", 
            "Well-defined customer persona",
            "Solid monetization strategy"
        ],
        concerns: [
            "Competitive advantage needs more clarity",
            "Revenue model could be more specific",
            "Risk mitigation strategies need development"
        ],
        recommendations: [
            "Focus on building stronger moats around your competitive advantage",
            "Develop more detailed financial projections",
            "Create a comprehensive risk management plan",
            "Conduct additional customer validation interviews"
        ],
        nextSteps: [
            "Conduct customer interviews to validate assumptions",
            "Build a minimum viable product (MVP)",
            "Develop a go-to-market strategy",
            "Secure initial funding or partnerships"
        ]
    },
    timestamp: new Date().toISOString()
};

// Mock detailed scores for the chart
const mockScores = {
    clarity: 82,
    feasibility: 75,
    differentiation: 68,
    marketReadiness: 85,
    monetization: 79,
    riskLevel: 72
};

// New metric cards data
const metricData = {
    businessValuation: {
        level: 'green',
        text: 'Above $2M',
        description: 'Strong early traction signal'
    },
    fundingReadiness: {
        level: 'yellow',
        text: '40-70%',
        description: 'Needs more validation'
    },
    marketMomentum: {
        level: 'green',
        text: '>15% CAGR',
        description: 'Fast-growing sector, hot'
    },
    riskExposure: {
        level: 'red',
        text: 'High',
        description: '4+ risks, high fragility'
    }
};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get evaluation data from localStorage or use mock data
    const evaluationData = getEvaluationData();
    
    // Populate the dashboard
    populateDashboard(evaluationData);
    
    // Create charts
    createOverallScoreChart(evaluationData.evaluation.overallScore);
    populateMetricCards();
    createScoresChart();
});

function getEvaluationData() {
    try {
        const stored = localStorage.getItem('evaluationData');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error parsing evaluation data:', error);
    }
    
    // Return mock data if no stored data
    return mockEvaluationData;
}

function populateDashboard(data) {
    if (!data || !data.evaluation) {
        console.error('No evaluation data available');
        return;
    }

    const evaluation = data.evaluation;

    // Update overall score
    document.getElementById('overallScoreValue').textContent = evaluation.overallScore;
    
    // Individual scores are now handled by populateMetricCards()

    // Populate lists
    populateList('strengthsList', evaluation.strengths);
    populateList('improvementsList', evaluation.concerns);
    populateList('recommendationsList', evaluation.recommendations);
    populateList('nextStepsList', evaluation.nextSteps);
    
}

function populateList(listId, items) {
    const listElement = document.getElementById(listId);
    if (!listElement || !items) return;

    listElement.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        listElement.appendChild(li);
    });
}

function createOverallScoreChart(score) {
    const ctx = document.getElementById('overallScoreChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [score, 100 - score],
                backgroundColor: ['#6C5BFF', '#E5E7EB'],
                borderWidth: 0,
                cutout: '80%'
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function populateMetricCards() {
    // Business Valuation
    const businessValuationBadge = document.getElementById('businessValuationBadge');
    businessValuationBadge.innerHTML = `
        <span class="badge-dot ${metricData.businessValuation.level}"></span>
        <span class="badge-text">${metricData.businessValuation.text}</span>
    `;
    businessValuationBadge.nextElementSibling.textContent = metricData.businessValuation.description;

    // Funding Readiness
    const fundingReadinessBadge = document.getElementById('fundingReadinessBadge');
    fundingReadinessBadge.innerHTML = `
        <span class="badge-dot ${metricData.fundingReadiness.level}"></span>
        <span class="badge-text">${metricData.fundingReadiness.text}</span>
    `;
    fundingReadinessBadge.nextElementSibling.textContent = metricData.fundingReadiness.description;

    // Market Momentum
    const marketMomentumBadge = document.getElementById('marketMomentumBadge');
    marketMomentumBadge.innerHTML = `
        <span class="badge-dot ${metricData.marketMomentum.level}"></span>
        <span class="badge-text">${metricData.marketMomentum.text}</span>
    `;
    marketMomentumBadge.nextElementSibling.textContent = metricData.marketMomentum.description;

    // Risk Exposure
    const riskExposureBadge = document.getElementById('riskExposureBadge');
    riskExposureBadge.innerHTML = `
        <span class="badge-dot ${metricData.riskExposure.level}"></span>
        <span class="badge-text">${metricData.riskExposure.text}</span>
    `;
    riskExposureBadge.nextElementSibling.textContent = metricData.riskExposure.description;
}

function createScoresChart() {
    const ctx = document.getElementById('scoresChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                'Clarity',
                'Feasibility', 
                'Differentiation',
                'Market',
                'Monetization',
                'Risk'
            ],
            datasets: [{
                label: 'Score',
                data: [
                    mockScores.clarity,
                    mockScores.feasibility,
                    mockScores.differentiation,
                    mockScores.marketReadiness,
                    mockScores.monetization,
                    mockScores.riskLevel
                ],
                backgroundColor: [
                    '#6C5BFF',
                    '#6C5BFF',
                    '#6C5BFF',
                    '#16A34A',
                    '#6C5BFF',
                    '#6C5BFF'
                ],
                borderRadius: 2,
                borderSkipped: false,
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
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: '#E5E7EB',
                        display: false
                    },
                    ticks: {
                        color: '#6B7280',
                        font: {
                            size: 10
                        },
                        maxTicksLimit: 4
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6B7280',
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// AI Chat functionality
function openAIChat() {
    // In a real implementation, this would open a modal or redirect to a chat page
    alert('AI Chat feature coming soon! This will integrate with DeepSeek API for personalized startup advice.');
}

function goBack() {
    window.location.href = '/questions.html';
}
