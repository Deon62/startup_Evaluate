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

        // Metric cards data will be populated from AI evaluation
        let metricData = {
            businessValuation: {
                level: 'yellow',
                text: '40-70%',
                description: 'Needs more validation'
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
    
    // Create initial chart with mock data, then update with real data if available
    createScoresChart();
    
    // Force update chart with AI data if available
    if (evaluationData.evaluation.individualScores) {
        console.log('Force updating chart with AI data:', evaluationData.evaluation.individualScores);
        setTimeout(() => {
            updateScoresChart(evaluationData.evaluation.individualScores);
        }, 100);
    }
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
    
    // Update individual scores in the bar chart
    if (evaluation.individualScores) {
        console.log('Updating chart with AI scores:', evaluation.individualScores);
        updateScoresChart(evaluation.individualScores);
    }

    // Update metric cards with AI data if available
    if (evaluation.businessValuation) {
        metricData.businessValuation = evaluation.businessValuation;
    }
    if (evaluation.fundingReadiness) {
        metricData.fundingReadiness = evaluation.fundingReadiness;
    }
    if (evaluation.marketMomentum) {
        metricData.marketMomentum = evaluation.marketMomentum;
    }
    if (evaluation.riskExposure) {
        metricData.riskExposure = evaluation.riskExposure;
    }

    // Populate lists
    populateList('strengthsList', evaluation.strengths);
    populateList('improvementsList', evaluation.concerns);
    populateList('recommendationsList', evaluation.recommendations);
    
    // Handle next steps - convert nextQuestion to array format if needed
    const nextSteps = evaluation.nextSteps || (evaluation.nextQuestion ? [evaluation.nextQuestion] : []);
    populateList('nextStepsList', nextSteps);
    
    // Update pattern match if available
    if (evaluation.patternMatch) {
        updatePatternMatch(evaluation.patternMatch);
    }
    
    // Update similar startups if available
    if (evaluation.similarStartups) {
        updateSimilarStartups(evaluation.similarStartups);
    } else if (evaluation.patternMatch) {
        // Fallback to pattern match if similar startups not available
        updateSimilarStartupsFromPatternMatch(evaluation.patternMatch);
    }
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

// Global chart variable to store the chart instance
let scoresChart = null;

function createScoresChart() {
    const ctx = document.getElementById('scoresChart').getContext('2d');
    
    scoresChart = new Chart(ctx, {
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

function updateScoresChart(individualScores) {
    console.log('Updating chart with scores:', individualScores);
    
    // Calculate new data
    const newData = [
        individualScores.clarity || 0,
        individualScores.feasibility || 0,
        individualScores.differentiation || 0,
        individualScores.marketFit || 0,
        75, // Default monetization score
        100 - (individualScores.feasibility || 50) // Risk as inverse of feasibility
    ];
    
    console.log('New chart data:', newData);
    
    if (!scoresChart) {
        console.log('Chart not initialized yet, creating new chart...');
        createScoresChart();
        // Wait for chart to be created, then update
        setTimeout(() => {
            if (scoresChart) {
                scoresChart.data.datasets[0].data = newData;
                scoresChart.update();
            }
        }, 50);
        return;
    }
    
    // Update existing chart
    scoresChart.data.datasets[0].data = newData;
    scoresChart.update();
    
    console.log('Chart updated successfully');
}

// AI Chat functionality
function updatePatternMatch(patternMatch) {
    // Update the benchmark section with AI-generated pattern match data
    const benchmarkItems = document.querySelectorAll('.benchmark-item');
    
    if (benchmarkItems.length >= 2 && patternMatch.successful && patternMatch.failed) {
        // Update successful startup
        const successItem = benchmarkItems[0];
        const successTitle = successItem.querySelector('h4');
        const successReason = successItem.querySelector('p');
        
        if (successTitle && successReason) {
            successTitle.textContent = patternMatch.successful.name;
            successReason.textContent = patternMatch.successful.reason;
        }
        
        // Update failed startup
        const failedItem = benchmarkItems[1];
        const failedTitle = failedItem.querySelector('h4');
        const failedReason = failedItem.querySelector('p');
        
        if (failedTitle && failedReason) {
            failedTitle.textContent = patternMatch.failed.name;
            failedReason.textContent = patternMatch.failed.reason;
        }
    }
}

function updateSimilarStartups(similarStartups) {
    const benchmarkScroll = document.querySelector('.benchmark-scroll');
    if (!benchmarkScroll || !similarStartups) return;
    
    // Clear existing content
    benchmarkScroll.innerHTML = '';
    
    // Add new startup items
    similarStartups.forEach(startup => {
        const item = document.createElement('div');
        item.className = 'benchmark-item';
        
        // Determine icon based on status
        let iconClass = 'warning';
        let iconText = '⚠';
        if (startup.status === 'successful') {
            iconClass = 'success';
            iconText = '✓';
        } else if (startup.status === 'failed') {
            iconClass = 'danger';
            iconText = '✗';
        }
        
        item.innerHTML = `
            <div class="benchmark-icon ${iconClass}">${iconText}</div>
            <div class="benchmark-content">
                <h4>${startup.name}</h4>
                <p>${startup.reason}</p>
            </div>
        `;
        
        benchmarkScroll.appendChild(item);
    });
}

function updateSimilarStartupsFromPatternMatch(patternMatch) {
    const benchmarkScroll = document.querySelector('.benchmark-scroll');
    if (!benchmarkScroll || !patternMatch) return;
    
    // Clear existing content
    benchmarkScroll.innerHTML = '';
    
    // Add successful startup
    if (patternMatch.successful) {
        const successItem = document.createElement('div');
        successItem.className = 'benchmark-item';
        successItem.innerHTML = `
            <div class="benchmark-icon success">✓</div>
            <div class="benchmark-content">
                <h4>${patternMatch.successful.name}</h4>
                <p>${patternMatch.successful.reason}</p>
            </div>
        `;
        benchmarkScroll.appendChild(successItem);
    }
    
    // Add failed startup
    if (patternMatch.failed) {
        const failedItem = document.createElement('div');
        failedItem.className = 'benchmark-item';
        failedItem.innerHTML = `
            <div class="benchmark-icon danger">✗</div>
            <div class="benchmark-content">
                <h4>${patternMatch.failed.name}</h4>
                <p>${patternMatch.failed.reason}</p>
            </div>
        `;
        benchmarkScroll.appendChild(failedItem);
    }
}

function openAIChat() {
    // Create AI chat modal
    const modal = document.createElement('div');
    modal.className = 'ai-chat-modal';
    modal.innerHTML = `
        <div class="ai-chat-content">
            <div class="ai-chat-header">
                <h3>AI Startup Advisor</h3>
                <button class="close-chat" onclick="closeAIChat()">&times;</button>
            </div>
            <div class="ai-chat-messages" id="chatMessages">
                <div class="ai-message">
                    <div class="message-content">
                        Hello! I'm your AI startup advisor. I've analyzed your evaluation results. 
                        What specific aspect of your startup would you like to discuss?
                    </div>
                </div>
            </div>
            <div class="ai-chat-input">
                <input type="text" id="chatInput" placeholder="Ask me anything about your startup..." />
                <button onclick="sendChatMessage()">Send</button>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .ai-chat-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        .ai-chat-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            height: 70%;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .ai-chat-header {
            padding: 1rem;
            border-bottom: 1px solid #E5E7EB;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .ai-chat-header h3 {
            margin: 0;
            color: #0F172A;
        }
        .close-chat {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6B7280;
        }
        .ai-chat-messages {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .ai-message, .user-message {
            max-width: 80%;
            padding: 0.75rem;
            border-radius: 8px;
        }
        .ai-message {
            background: #F3F4F6;
            align-self: flex-start;
        }
        .user-message {
            background: #6C5BFF;
            color: white;
            align-self: flex-end;
        }
        .ai-chat-input {
            padding: 1rem;
            border-top: 1px solid #E5E7EB;
            display: flex;
            gap: 0.5rem;
        }
        .ai-chat-input input {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
        }
        .ai-chat-input button {
            padding: 0.5rem 1rem;
            background: #6C5BFF;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Focus on input
    document.getElementById('chatInput').focus();
    
    // Handle Enter key
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

function closeAIChat() {
    const modal = document.querySelector('.ai-chat-modal');
    if (modal) {
        modal.remove();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messagesContainer = document.getElementById('chatMessages');
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `<div class="message-content">${message}</div>`;
    messagesContainer.appendChild(userMessage);
    
    // Clear input and disable it
    input.value = '';
    input.disabled = true;
    
    // Add loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'ai-message';
    loadingMessage.innerHTML = `<div class="message-content">🤔 Thinking...</div>`;
    messagesContainer.appendChild(loadingMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        // Get evaluation data from localStorage
        const evaluationData = getEvaluationData();
        
        // Call AI chat API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                evaluationData: evaluationData
            })
        });
        
        const result = await response.json();
        
        // Remove loading message
        loadingMessage.remove();
        
        // Add AI response
        const aiMessage = document.createElement('div');
        aiMessage.className = 'ai-message';
        aiMessage.innerHTML = `<div class="message-content">${result.response || 'I apologize, but I had trouble processing your request. Please try again.'}</div>`;
        messagesContainer.appendChild(aiMessage);
        
    } catch (error) {
        console.error('Chat error:', error);
        
        // Remove loading message
        loadingMessage.remove();
        
        // Add error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'ai-message';
        errorMessage.innerHTML = `<div class="message-content">I'm having trouble connecting right now. Please try again later.</div>`;
        messagesContainer.appendChild(errorMessage);
    }
    
    // Re-enable input
    input.disabled = false;
    input.focus();
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getAIResponse(userMessage) {
    // Simple mock responses based on keywords
    const message = userMessage.toLowerCase();
    
    if (message.includes('market') || message.includes('competition')) {
        return 'your market positioning needs strengthening. The competitive landscape is quite crowded';
    } else if (message.includes('funding') || message.includes('investment')) {
        return 'your funding readiness is moderate. You need more validation before seeking investment';
    } else if (message.includes('risk') || message.includes('problem')) {
        return 'risk mitigation should be your top priority. Several critical risks were identified';
    } else if (message.includes('revenue') || message.includes('monetization')) {
        return 'your revenue model needs more clarity. The monetization strategy could be stronger';
    } else {
        return 'there are several areas for improvement in your startup concept';
    }
}

function goBack() {
    window.location.href = '/questions.html';
}
