const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock API endpoint for startup evaluation
app.post('/api/evaluate', (req, res) => {
  const { answers } = req.body;
  
  // Simulate processing delay
  setTimeout(() => {
    // Mock evaluation response
    const mockResponse = {
      success: true,
      evaluation: {
        overallScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
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
        recommendations: [
          "Focus on building stronger moats around your competitive advantage",
          "Develop more detailed financial projections",
          "Create a comprehensive risk management plan"
        ],
        nextSteps: [
          "Conduct customer interviews to validate assumptions",
          "Build a minimum viable product (MVP)",
          "Develop a go-to-market strategy"
        ]
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(mockResponse);
  }, 2000); // 2 second delay to simulate processing
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
