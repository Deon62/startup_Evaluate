const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const StartupEvaluator = require('./ai-evaluator');

// Load .env from root directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors());

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Initialize AI evaluator
const evaluator = new StartupEvaluator();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.post('/api/evaluate', async (req, res) => {
    try {
        const { answers } = req.body;
        
        // Validate input
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid answers format'
            });
        }

        const filledAnswersCount = answers.filter(answer => answer.trim().length > 0).length;
        
        if (filledAnswersCount < 7) {
            return res.status(400).json({
                success: false,
                error: 'Please answer at least 7 questions'
            });
        }

        console.log(`Evaluating startup with ${filledAnswersCount} answered questions...`);
        console.log('Answers:', answers);
        console.log('DeepSeek API Key configured:', !!process.env.DEEPSEEK_API_KEY);
        console.log('Tavily API Key configured:', !!process.env.TAVILY_API_KEY);

        // Get AI evaluation
        const aiEvaluation = await evaluator.evaluateStartup(answers);
        console.log('AI Evaluation result:', aiEvaluation);

        // Structure response for frontend
        const response = {
            success: true,
            evaluation: {
                overallScore: aiEvaluation.overallScore,
                individualScores: aiEvaluation.individualScores,
                strengths: aiEvaluation.strengths,
                concerns: aiEvaluation.weaknesses,
                opportunities: aiEvaluation.opportunities,
                threats: aiEvaluation.threats,
                recommendations: aiEvaluation.recommendations,
                nextSteps: [aiEvaluation.nextQuestion], // Convert to array format
                patternMatch: aiEvaluation.patternMatch,
                businessValuation: aiEvaluation.businessValuation,
                fundingReadiness: aiEvaluation.fundingReadiness,
                marketMomentum: aiEvaluation.marketMomentum,
                riskExposure: aiEvaluation.riskExposure,
                executiveSnapshot: aiEvaluation.executiveSnapshot
            }
        };

        console.log('Evaluation completed successfully');
        res.json(response);

    } catch (error) {
        console.error('Evaluation error:', error);
        
        // Fallback to mock data if AI fails
        const { answers } = req.body;
        const filledAnswersCount = answers.filter(answer => answer.trim().length > 0).length;
        let overallScore = Math.min(100, filledAnswersCount * 10 + Math.floor(Math.random() * 20));
        if (overallScore < 50) overallScore += 20;

        const fallbackEvaluation = {
            success: true,
            evaluation: {
                overallScore: overallScore,
                individualScores: {
                    clarity: Math.min(100, overallScore + Math.floor(Math.random() * 10)),
                    marketFit: Math.min(100, overallScore + Math.floor(Math.random() * 10)),
                    feasibility: Math.min(100, overallScore + Math.floor(Math.random() * 10)),
                    differentiation: Math.min(100, overallScore + Math.floor(Math.random() * 10))
                },
                strengths: [
                    "Clear value proposition identified",
                    "Strong market timing awareness",
                    "Well-defined customer persona"
                ],
                concerns: [
                    "Competitive advantage needs more clarity",
                    "Revenue model could be more specific",
                    "Risk mitigation strategies need development"
                ],
                opportunities: [
                    "Market expansion potential",
                    "Technology advancement opportunities"
                ],
                threats: [
                    "Competitive pressure",
                    "Market saturation risk"
                ],
                recommendations: [
                    "Focus on building stronger moats around your competitive advantage",
                    "Develop more detailed financial projections",
                    "Create a comprehensive risk management plan"
                ],
                nextSteps: [
                    "Conduct customer interviews to validate assumptions",
                    "Build a minimum viable product (MVP)",
                    "Develop a go-to-market strategy"
                ],
                patternMatch: {
                    successful: {
                        name: "TechFlow (Series A, $15M raised)",
                        reason: "Similar clarity score and market timing. Strong execution focus led to successful Series A."
                    },
                    failed: {
                        name: "DataSync (Failed in 2 years)",
                        reason: "Weak go-to-market strategy despite good product. Poor customer acquisition led to failure."
                    }
                },
                businessValuation: {
                    level: "yellow",
                    text: "40-70%",
                    description: "Needs more validation"
                },
                fundingReadiness: {
                    level: "yellow",
                    text: "40-70%",
                    description: "Needs more validation"
                },
                marketMomentum: {
                    level: "green",
                    text: ">15% CAGR",
                    description: "Fast-growing sector, hot"
                },
                riskExposure: {
                    level: "red",
                    text: "High",
                    description: "4+ risks, high fragility"
                },
                executiveSnapshot: "AI evaluation temporarily unavailable. Using fallback analysis."
            }
        };

        res.json(fallbackEvaluation);
    }
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, evaluationData } = req.body;
        
        if (!message || !evaluationData) {
            return res.status(400).json({
                success: false,
                error: 'Message and evaluation data are required'
            });
        }

        console.log('AI Chat request:', message);

        // Get AI chat response
        const chatResponse = await evaluator.generateChatResponse(message, evaluationData);

        res.json({
            success: true,
            response: chatResponse
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.json({
            success: false,
            response: "I'm having trouble processing your request right now. Please try again."
        });
    }
});

// Market Insights endpoint
app.post('/api/market-insights', async (req, res) => {
    try {
        const { answers, evaluationData } = req.body;
        
        if (!answers || !evaluationData) {
            return res.status(400).json({
                success: false,
                error: 'Answers and evaluation data are required'
            });
        }

        console.log('Generating market insights...');
        console.log('Answers received:', answers);
        console.log('Evaluation data received:', evaluationData);

        // Get AI market insights
        const marketInsights = await evaluator.generateMarketInsights(answers, evaluationData);
        console.log('Generated insights:', marketInsights);

        res.json({
            success: true,
            insights: marketInsights
        });

    } catch (error) {
        console.error('Market insights error:', error);
        res.json({
            success: false,
            insights: evaluator.getFallbackMarketInsights(answers)
        });
    }
});

// Market News endpoint
app.post('/api/market-news', async (req, res) => {
    try {
        const { answers, evaluationData } = req.body;
        
        if (!answers || !evaluationData) {
            return res.status(400).json({
                success: false,
                error: 'Answers and evaluation data are required'
            });
        }

        console.log('Generating market news...');

        // Get AI market news
        const marketNews = await evaluator.generateMarketNews(answers, evaluationData);

        res.json({
            success: true,
            news: marketNews
        });

    } catch (error) {
        console.error('Market news error:', error);
        res.json({
            success: false,
            news: evaluator.getFallbackMarketNews()
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        aiConfigured: !!process.env.DEEPSEEK_API_KEY
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`AI Evaluation: ${process.env.DEEPSEEK_API_KEY ? 'Configured' : 'Not configured - using fallback'}`);
});