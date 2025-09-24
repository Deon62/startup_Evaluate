const axios = require('axios');
const path = require('path');

// Load .env from root directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

class StartupEvaluator {
    constructor() {
        this.deepseekApiKey = process.env.DEEPSEEK_API_KEY;
        this.tavilyApiKey = process.env.TAVILY_API_KEY;
        this.deepseekBaseUrl = 'https://api.deepseek.com/v1/chat/completions';
        this.tavilyBaseUrl = 'https://api.tavily.com/search';
    }

    // Specialized prompts for each question
    getQuestionPrompts() {
        return {
            0: {
                title: "Value Proposition Analysis",
                prompt: `Analyze this value proposition critically: "{answer}". 
                - Is this genuinely innovative or just incremental improvement?
                - What existing solutions does this compete with?
                - Is the differentiation clear and defensible?
                - Rate innovation level: 1-10 (be harsh, most ideas are 3-4/10)`
            },
            1: {
                title: "Competitive Advantage Assessment", 
                prompt: `Evaluate this competitive advantage: "{answer}".
                - Is this truly defensible or easily copied?
                - What barriers to entry exist?
                - How long before competitors catch up?
                - Rate defensibility: 1-10 (most advantages are temporary)`
            },
            2: {
                title: "Customer Persona Validation",
                prompt: `Assess this customer description: "{answer}".
                - Is the persona specific enough or too broad?
                - Are pain points validated or assumed?
                - What's the total addressable market size?
                - Rate market clarity: 1-10 (be realistic about market size)`
            },
            3: {
                title: "Market Timing Analysis",
                prompt: `Evaluate market timing: "{answer}".
                - Is this trend real or hype?
                - What evidence supports "why now"?
                - Are there regulatory/economic headwinds?
                - Rate timing: 1-10 (most timing claims are weak)`
            },
            4: {
                title: "Problem-Solution Fit",
                prompt: `Analyze this problem statement: "{answer}".
                - Is this a real pain or nice-to-have?
                - How painful is it on a 1-10 scale?
                - Do people currently pay to solve this?
                - Rate problem severity: 1-10 (be critical)`
            },
            5: {
                title: "Risk Assessment",
                prompt: `Evaluate these risks: "{answer}".
                - Are major risks identified or ignored?
                - What could kill this business?
                - How likely are these risks?
                - Rate risk awareness: 1-10 (most founders underestimate risks)`
            },
            6: {
                title: "Customer Dependency Analysis",
                prompt: `Assess customer dependency: "{answer}".
                - Would customers actually miss this?
                - What's the switching cost?
                - How sticky is the solution?
                - Rate customer stickiness: 1-10 (be realistic)`
            },
            7: {
                title: "Monetization Model",
                prompt: `Evaluate monetization: "{answer}".
                - Is the revenue model clear and proven?
                - Will customers actually pay this amount?
                - What's the unit economics?
                - Rate monetization clarity: 1-10 (most models are unclear)`
            },
            8: {
                title: "Vision & Scalability",
                prompt: `Assess long-term vision: "{answer}".
                - Is the vision realistic or fantasy?
                - What's the path to scale?
                - Are there natural expansion opportunities?
                - Rate vision clarity: 1-10 (be harsh on unrealistic visions)`
            },
            9: {
                title: "Founder-Market Fit",
                prompt: `Evaluate founder fit: "{answer}".
                - Does the founder have relevant experience?
                - Do they have the right network?
                - Can they execute on this vision?
                - Rate founder-market fit: 1-10 (be critical)`
            }
        };
    }

    // Gather real-time market data using Tavily
    async gatherMarketData(answers) {
        try {
            const searchQueries = [
                `startup market trends ${new Date().getFullYear()}`,
                `startup failure rates statistics`,
                `venture capital funding trends`,
                `startup valuation benchmarks`
            ];

            const searchPromises = searchQueries.map(query => 
                this.searchWithTavily(query)
            );

            const results = await Promise.all(searchPromises);
            return results.flat();
        } catch (error) {
            console.error('Error gathering market data:', error);
            return [];
        }
    }

    // Generate dynamic similar startups using Tavily and DeepSeek
    async generateSimilarStartups(answers, evaluationData) {
        try {
            // Check if API keys are configured
            if (!this.deepseekApiKey || this.deepseekApiKey === 'your_deepseek_api_key_here') {
                return this.getFallbackSimilarStartups();
            }

            // Extract key terms from answers for search
            const keyTerms = this.extractKeyTerms(answers);
            
            // Search for similar startups using Tavily with specific startup databases
            const searchQueries = [
                `site:ycombinator.com/companies ${keyTerms.industry} startup funding`,
                `site:crunchbase.com ${keyTerms.technology} startup series A funding`,
                `site:techcrunch.com ${keyTerms.market} startup raised funding`,
                `${keyTerms.industry} startup success stories recent funding`,
                `${keyTerms.technology} startup case studies YC portfolio`
            ];

            const searchPromises = searchQueries.map(query => 
                this.searchWithTavily(query)
            );

            const searchResults = await Promise.all(searchPromises);
            const allResults = searchResults.flat();

            // Use DeepSeek to analyze and generate similar startup cases
            const similarStartups = await this.analyzeSimilarStartups(allResults, evaluationData);
            
            return similarStartups;
            
        } catch (error) {
            console.error('Error generating similar startups:', error);
            return this.getFallbackSimilarStartups();
        }
    }

    extractKeyTerms(answers) {
        const industryKeywords = ['fintech', 'healthtech', 'edtech', 'saas', 'ecommerce', 'ai', 'blockchain', 'iot'];
        const technologyKeywords = ['ai', 'machine learning', 'blockchain', 'mobile app', 'web platform', 'api'];
        const marketKeywords = ['b2b', 'b2c', 'enterprise', 'consumer', 'small business', 'startup'];

        const allText = answers.join(' ').toLowerCase();
        
        return {
            industry: industryKeywords.find(keyword => allText.includes(keyword)) || 'tech',
            technology: technologyKeywords.find(keyword => allText.includes(keyword)) || 'software',
            market: marketKeywords.find(keyword => allText.includes(keyword)) || 'business'
        };
    }

    async analyzeSimilarStartups(searchResults, evaluationData) {
        const prompt = `Based on these search results about similar startups, generate 3-4 realistic startup case studies that are relevant to the evaluated startup idea.

SEARCH RESULTS:
${searchResults.slice(0, 10).map(result => `${result.title}: ${result.content}`).join('\n')}

EVALUATION CONTEXT:
- Overall Score: ${evaluationData.evaluation.overallScore}/100
- Industry Focus: Based on the startup answers
- Key Strengths: ${evaluationData.evaluation.strengths?.join(', ')}
- Main Weaknesses: ${evaluationData.evaluation.concerns?.join(', ')}

Generate 3-4 startup case studies in this JSON format:
{
  "startups": [
    {
      "name": "Startup Name",
      "status": "successful|failed|struggling",
      "description": "Brief description of what they did",
      "reason": "Why they succeeded/failed (1-2 sentences)",
      "relevance": "How this relates to the evaluated startup"
    }
  ]
}

Make them realistic and relevant to the evaluated startup's industry and challenges.`;

        try {
            const response = await this.callDeepSeekAPI(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.startups || [];
            }
        } catch (error) {
            console.error('Error analyzing similar startups:', error);
        }
        
        return this.getFallbackSimilarStartups();
    }

    getFallbackSimilarStartups() {
        return [
            {
                name: "TechFlow (Series A, $15M raised)",
                status: "successful",
                description: "Similar clarity score and market timing",
                reason: "Strong execution focus led to successful Series A",
                relevance: "Shows importance of clear execution strategy"
            },
            {
                name: "DataSync (Failed in 2 years)",
                status: "failed", 
                description: "Weak go-to-market strategy despite good product",
                reason: "Poor customer acquisition led to failure",
                relevance: "Highlights need for strong customer acquisition"
            },
            {
                name: "CloudBase (Acquired for $50M)",
                status: "successful",
                description: "Strong differentiation and market fit",
                reason: "Focused on enterprise customers from day one",
                relevance: "Demonstrates value of clear market focus"
            },
            {
                name: "StartupX (Seed stage, struggling)",
                status: "struggling",
                description: "Good product but poor market timing",
                reason: "Failed to adapt to changing customer needs",
                relevance: "Shows importance of market timing and adaptability"
            }
        ];
    }

    // Generate real-time market insights using Tavily
    async generateMarketInsights(answers, evaluationData) {
        try {
            // Check if API keys are configured
            if (!this.deepseekApiKey || this.deepseekApiKey === 'your_deepseek_api_key_here') {
                return this.getFallbackMarketInsights(answers);
            }

            // Extract key terms from answers for search
            const keyTerms = this.extractKeyTerms(answers);
            
            // Search for real-time market data using Tavily
            const searchQueries = [
                `site:ycombinator.com/companies ${keyTerms.industry} startup funding 2024`,
                `site:crunchbase.com ${keyTerms.technology} startup series A B funding recent`,
                `site:techcrunch.com ${keyTerms.market} startup raised millions funding`,
                `site:forbes.com ${keyTerms.industry} startup unicorn funding`,
                `site:pitchbook.com ${keyTerms.technology} startup investment trends`,
                `${keyTerms.industry} startup funding news 2024 recent`
            ];

            const searchPromises = searchQueries.map(query => 
                this.searchWithTavily(query)
            );

            const searchResults = await Promise.all(searchPromises);
            const allResults = searchResults.flat();

            // Use DeepSeek to analyze and generate market insights
            const marketInsights = await this.analyzeMarketInsights(allResults, evaluationData);
            
            return marketInsights;
            
        } catch (error) {
            console.error('Error generating market insights:', error);
            return this.getFallbackMarketInsights(answers);
        }
    }

    // Generate real-time market news using Tavily
    async generateMarketNews(answers, evaluationData) {
        try {
            // Check if API keys are configured
            if (!this.deepseekApiKey || this.deepseekApiKey === 'your_deepseek_api_key_here') {
                return this.getFallbackMarketNews();
            }

            // Extract key terms from answers for search
            const keyTerms = this.extractKeyTerms(answers);
            
            // Search for real-time market news using Tavily
            const searchQueries = [
                `site:techcrunch.com startup funding news ${keyTerms.industry} 2024`,
                `site:forbes.com startup investment ${keyTerms.technology} recent`,
                `site:venturebeat.com startup funding ${keyTerms.market} latest`,
                `site:crunchbase.com startup news ${keyTerms.industry} funding`,
                `site:bloomberg.com startup investment ${keyTerms.technology}`,
                `startup funding news ${keyTerms.industry} ${keyTerms.technology} 2024`
            ];

            const searchPromises = searchQueries.map(query => 
                this.searchWithTavily(query)
            );

            const searchResults = await Promise.all(searchPromises);
            const allResults = searchResults.flat();

            // Use DeepSeek to analyze and generate market news
            const marketNews = await this.analyzeMarketNews(allResults, evaluationData);
            
            return marketNews;
            
        } catch (error) {
            console.error('Error generating market news:', error);
            return this.getFallbackMarketNews();
        }
    }

    // Analyze market insights from search results
    async analyzeMarketInsights(searchResults, evaluationData) {
        const prompt = `Based on these real-time search results about startup funding and market trends, generate 4-6 relevant market insights for a startup evaluation.

SEARCH RESULTS:
${searchResults.slice(0, 15).map(result => `${result.title}: ${result.content}`).join('\n')}

EVALUATION CONTEXT:
- Overall Score: ${evaluationData.evaluation.overallScore}/100
- Industry Focus: Based on the startup answers
- Key Strengths: ${evaluationData.evaluation.strengths?.join(', ')}
- Main Weaknesses: ${evaluationData.evaluation.concerns?.join(', ')}

Generate 4-6 market insights in this JSON format:
{
  "insights": [
    {
      "startupName": "Real Startup Name",
      "fundingRound": "Series A/Seed/Series B",
      "amount": "$X.XM",
      "insight": "Specific actionable insight about what they did right (1-2 sentences)"
    }
  ]
}

Focus on recent funding rounds (2024) and actionable insights that relate to the evaluated startup's challenges and opportunities.`;

        try {
            const response = await this.callDeepSeekAPI(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.insights || [];
            }
        } catch (error) {
            console.error('Error analyzing market insights:', error);
        }
        
        return this.getFallbackMarketInsights(answers);
    }

    // Analyze market news from search results
    async analyzeMarketNews(searchResults, evaluationData) {
        const prompt = `Based on these real-time search results about startup news and funding announcements, generate 6 relevant market news articles.

SEARCH RESULTS:
${searchResults.slice(0, 20).map(result => `${result.title}: ${result.content}`).join('\n')}

EVALUATION CONTEXT:
- Industry Focus: Based on the startup answers
- Technology Focus: Based on the startup answers

Generate 6 market news articles in this JSON format:
{
  "news": [
    {
      "source": "TechCrunch/Forbes/VentureBeat/etc",
      "date": "X hours ago",
      "title": "Actual news headline",
      "summary": "2-3 sentence summary of the news",
      "tags": ["funding", "healthcare", "AI", "tech", "market", "trends"]
    }
  ]
}

Focus on recent news (last 24-48 hours) and include a mix of funding announcements, market trends, and industry developments.`;

        try {
            const response = await this.callDeepSeekAPI(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.news || [];
            }
        } catch (error) {
            console.error('Error analyzing market news:', error);
        }
        
        return this.getFallbackMarketNews();
    }

    getFallbackMarketInsights(answers = []) {
        // Extract key terms from answers to make fallback data more relevant
        const allText = answers.join(' ').toLowerCase();
        const isHealthTech = allText.includes('health') || allText.includes('medical') || allText.includes('biomarker');
        const isAITech = allText.includes('ai') || allText.includes('artificial intelligence') || allText.includes('machine learning');
        const isSpaceTech = allText.includes('space') || allText.includes('orbital') || allText.includes('satellite');
        const isFinTech = allText.includes('fintech') || allText.includes('payment') || allText.includes('financial');
        
        if (isHealthTech) {
            return [
                {
                    startupName: "MedPredict AI",
                    fundingRound: "Series B",
                    amount: "$50M",
                    insight: "MedPredict AI's $50M Series B shows the potential in health prediction technology. They succeeded by focusing on specific, validated clinical use cases and building strong physician partnerships before expanding."
                },
                {
                    startupName: "BioSense Technologies",
                    fundingRound: "Seed",
                    amount: "$12M",
                    insight: "BioSense Technologies' $12M seed round demonstrates the value of continuous biomarker monitoring. They won by starting with one validated biomarker (glucose) before expanding to multiple health metrics."
                }
            ];
        } else if (isSpaceTech) {
            return [
                {
                    startupName: "SpaceAI Analytics",
                    fundingRound: "Series A",
                    amount: "$25M",
                    insight: "SpaceAI Analytics' $25M Series A shows how space-tech startups can succeed by focusing on specific, high-value use cases with clear ROI rather than trying to solve everything at once."
                },
                {
                    startupName: "NovaSpace Systems",
                    fundingRound: "Seed",
                    amount: "$8M",
                    insight: "NovaSpace Systems' $8M seed round demonstrates the power of modular, customer-focused space solutions. They succeeded by using lean startup methodology and iterating based on customer feedback."
                }
            ];
        } else if (isAITech) {
            return [
                {
                    startupName: "ClearVision AI",
                    fundingRound: "Series A",
                    amount: "$12M",
                    insight: "ClearVision AI's $12M Series A shows the importance of focusing on a single, well-defined problem. They succeeded by building a clear value proposition that resonated with enterprise customers before expanding."
                },
                {
                    startupName: "DataFlow Dynamics",
                    fundingRound: "Seed",
                    amount: "$5M",
                    insight: "DataFlow Dynamics' $5M seed round demonstrates the value of strong technical execution. They won by building a robust product first, then scaling their go-to-market strategy based on customer feedback."
                }
            ];
        } else if (isFinTech) {
            return [
                {
                    startupName: "PayFlow Solutions",
                    fundingRound: "Acquired",
                    amount: "$120M",
                    insight: "PayFlow Solutions' $120M acquisition shows the value of solving critical business problems. They succeeded by building strong partnerships with banks and focusing on regulatory compliance from day one."
                },
                {
                    startupName: "FinanceAI Pro",
                    fundingRound: "Series A",
                    amount: "$18M",
                    insight: "FinanceAI Pro's $18M Series A demonstrates the power of AI in financial services. They won by focusing on specific use cases with clear ROI and building strong customer relationships."
                }
            ];
        } else {
            // Generic fallback
            return [
                {
                    startupName: "ClearVision AI",
                    fundingRound: "Series A",
                    amount: "$12M",
                    insight: "ClearVision AI's $12M Series A shows the importance of focusing on a single, well-defined problem. They succeeded by building a clear value proposition that resonated with enterprise customers."
                },
                {
                    startupName: "MarketFit Solutions",
                    fundingRound: "Seed",
                    amount: "$3.5M",
                    insight: "MarketFit Solutions' $3.5M seed round demonstrates the value of early customer validation. They won by getting 100+ paying customers before raising their seed round, proving product-market fit."
                }
            ];
        }
    }

    getFallbackMarketNews() {
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
            }
        ];
    }

    async searchWithTavily(query) {
        if (!this.tavilyApiKey || this.tavilyApiKey === 'your_tavily_api_key_here') {
            console.warn('Tavily API key not configured. Skipping real-time search.');
            return [];
        }
        
        try {
            // Use Tavily search endpoint instead of QnA
            const searchUrl = 'https://api.tavily.com/search';
            const response = await axios.post(searchUrl, {
                query: query,
                search_depth: "basic",
                max_results: 5,
                include_answer: false,
                include_raw_content: false,
                include_images: false
            }, {
                headers: {
                    'Authorization': `Bearer ${this.tavilyApiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.data.results || [];
        } catch (error) {
            console.error('Tavily search error:', error);
            return [];
        }
    }

    // Generate comprehensive evaluation
    async evaluateStartup(answers) {
        try {
            // Check if API keys are configured
            if (!this.deepseekApiKey || this.deepseekApiKey === 'your_deepseek_api_key_here') {
                console.log('DeepSeek API key not configured, using fallback evaluation');
                return this.getFallbackEvaluation(answers);
            }

            const questionPrompts = this.getQuestionPrompts();
            const marketData = await this.gatherMarketData(answers);
            
            // Build comprehensive prompt
            const comprehensivePrompt = this.buildComprehensivePrompt(answers, questionPrompts, marketData);
            
            // Call DeepSeek API
            const evaluation = await this.callDeepSeekAPI(comprehensivePrompt);
            
            // Parse and structure the response
            const parsedEvaluation = this.parseEvaluationResponse(evaluation);
            
            // Generate dynamic similar startups
            const similarStartups = await this.generateSimilarStartups(answers, { evaluation: parsedEvaluation });
            parsedEvaluation.similarStartups = similarStartups;
            
            return parsedEvaluation;
            
        } catch (error) {
            console.error('Evaluation error:', error);
            return this.getFallbackEvaluation(answers);
        }
    }

    buildComprehensivePrompt(answers, questionPrompts, marketData) {
        let prompt = `You are a CRITICAL Startup Analyst with 15+ years of experience. You've seen thousands of startups fail and succeed. 

BE HARSH AND REALISTIC. Most startup ideas are mediocre. Don't be a pleaser.

Analyze these startup answers and provide a brutally honest evaluation:

`;

        // Add each question with specialized analysis
        answers.forEach((answer, index) => {
            if (answer.trim()) {
                const questionPrompt = questionPrompts[index];
                prompt += `\n${index + 1}. ${questionPrompt.title}:\n`;
                prompt += `Answer: "${answer}"\n`;
                prompt += `Analysis: ${questionPrompt.prompt.replace('{answer}', answer)}\n`;
            }
        });

        prompt += `\n\nMarket Context (Real-time data):\n`;
        marketData.forEach((data, index) => {
            prompt += `${index + 1}. ${data.title}: ${data.content}\n`;
        });

        prompt += `\n\nProvide your evaluation in this EXACT JSON format:
{
  "executiveSnapshot": "2-3 sentences summarizing the overall assessment",
  "overallScore": 75,
  "individualScores": {
    "clarity": 82,
    "marketFit": 85,
    "feasibility": 75,
    "differentiation": 68
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "opportunities": ["opportunity1", "opportunity2"],
  "threats": ["threat1", "threat2"],
  "patternMatch": {
    "successful": {
      "name": "Similar successful startup",
      "reason": "Why they succeeded"
    },
    "failed": {
      "name": "Similar failed startup", 
      "reason": "Why they failed"
    }
  },
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "nextQuestion": "Engaging follow-up question for the founder",
  "businessValuation": {
    "level": "yellow",
    "text": "40-70%",
    "description": "Needs more validation"
  },
  "fundingReadiness": {
    "level": "yellow", 
    "text": "40-70%",
    "description": "Needs more validation"
  },
  "marketMomentum": {
    "level": "green",
    "text": ">15% CAGR", 
    "description": "Fast-growing sector, hot"
  },
  "riskExposure": {
    "level": "red",
    "text": "High",
    "description": "4+ risks, high fragility"
  }
}

BE CRITICAL. Most ideas score 40-60. Only exceptional ideas score 80+.`;

        return prompt;
    }

    async callDeepSeekAPI(prompt) {
        try {
            const response = await axios.post(this.deepseekBaseUrl, {
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "You are a critical startup analyst. Always respond with valid JSON only."
                    },
                    {
                        role: "user", 
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.deepseekApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('DeepSeek API error:', error);
            throw error;
        }
    }

    parseEvaluationResponse(response) {
        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No JSON found in response');
        } catch (error) {
            console.error('Error parsing evaluation response:', error);
            return this.getFallbackEvaluation();
        }
    }

    // Generate AI chat response based on user's evaluation data
    async generateChatResponse(userMessage, evaluationData) {
        try {
            // Check if API key is configured
            if (!this.deepseekApiKey || this.deepseekApiKey === 'your_deepseek_api_key_here') {
                return this.getFallbackChatResponse(userMessage, evaluationData);
            }

            const prompt = this.buildChatPrompt(userMessage, evaluationData);
            const response = await this.callDeepSeekAPI(prompt);
            
            // Extract the response text
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.response || parsed.message || response;
            }
            
            return response;
            
        } catch (error) {
            console.error('Chat response error:', error);
            return this.getFallbackChatResponse(userMessage, evaluationData);
        }
    }

    buildChatPrompt(userMessage, evaluationData) {
        const evaluation = evaluationData.evaluation;
        
        return `You are an AI Startup Advisor who has just analyzed a startup idea. You have access to the complete evaluation results and the user's original answers to 10 deep startup questions.

EVALUATION CONTEXT:
- Overall Score: ${evaluation.overallScore}/100
- Executive Snapshot: ${evaluation.executiveSnapshot || 'Not provided'}
- Strengths: ${evaluation.strengths?.join(', ') || 'None identified'}
- Weaknesses: ${evaluation.concerns?.join(', ') || 'None identified'}
- Recommendations: ${evaluation.recommendations?.join(', ') || 'None provided'}

USER'S QUESTION: "${userMessage}"

INSTRUCTIONS:
1. Be knowledgeable about their specific startup evaluation
2. Reference their actual scores and feedback when relevant
3. Provide actionable advice based on their evaluation
4. Be honest but constructive
5. Keep responses concise (2-3 sentences max)
6. If they ask about something not in the evaluation, say you'd need more context

Respond in this JSON format:
{
  "response": "Your helpful response here"
}`;
    }

    getFallbackChatResponse(userMessage, evaluationData) {
        const message = userMessage.toLowerCase();
        const evaluation = evaluationData.evaluation;
        
        if (message.includes('score') || message.includes('rating')) {
            return `Your overall score is ${evaluation.overallScore}/100. This indicates ${evaluation.overallScore >= 70 ? 'strong potential' : evaluation.overallScore >= 50 ? 'moderate potential' : 'significant areas for improvement'}.`;
        } else if (message.includes('strength') || message.includes('good')) {
            return `Your main strengths are: ${evaluation.strengths?.slice(0, 2).join(' and ') || 'Clear value proposition and market awareness'}. Focus on building these further.`;
        } else if (message.includes('weakness') || message.includes('problem') || message.includes('concern')) {
            return `Key areas to improve: ${evaluation.concerns?.slice(0, 2).join(' and ') || 'Competitive advantage and revenue model'}. These should be your top priorities.`;
        } else if (message.includes('recommend') || message.includes('next') || message.includes('should')) {
            return `Based on your evaluation, I recommend: ${evaluation.recommendations?.[0] || 'Focus on building stronger competitive moats'}.`;
        } else {
            return `I've analyzed your startup idea and given it a ${evaluation.overallScore}/100 score. What specific aspect would you like to discuss?`;
        }
    }

    getFallbackEvaluation(answers = []) {
        const filledAnswers = answers.filter(answer => answer.trim().length > 0).length;
        const baseScore = Math.min(100, filledAnswers * 10 + Math.floor(Math.random() * 20));
        
        return {
            executiveSnapshot: "Unable to generate AI evaluation. Please check API configuration.",
            overallScore: baseScore,
            individualScores: {
                clarity: Math.min(100, baseScore + Math.floor(Math.random() * 10)),
                marketFit: Math.min(100, baseScore + Math.floor(Math.random() * 10)),
                feasibility: Math.min(100, baseScore + Math.floor(Math.random() * 10)),
                differentiation: Math.min(100, baseScore + Math.floor(Math.random() * 10))
            },
            strengths: [
                "Clear value proposition identified",
                "Strong market timing awareness", 
                "Well-defined customer persona"
            ],
            weaknesses: [
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
            recommendations: [
                "Focus on building stronger moats around your competitive advantage",
                "Develop more detailed financial projections", 
                "Create a comprehensive risk management plan"
            ],
            nextQuestion: "What's your biggest concern about this startup idea?",
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
            }
        };
    }
}

module.exports = StartupEvaluator;
