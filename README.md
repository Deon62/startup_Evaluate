# Startup Validation App

A comprehensive startup validation tool that helps entrepreneurs evaluate their business ideas through 10 deep, strategic questions.

## Features

- **10 Deep Startup Questions**: Carefully crafted questions covering value proposition, competitive advantage, market timing, and more
- **Smart Validation**: Requires at least 7/10 questions to be answered before evaluation
- **Real-time Progress**: Visual progress indicator showing completion status
- **Professional UI**: Clean, modern design with the specified color scheme
- **Loading States**: Smooth user experience with loading indicators
- **Mock API**: Simulated evaluation with realistic feedback

## Color Scheme

- **Background**: #FFFFFF
- **Surface**: #FAFBFF  
- **Primary**: #6C5BFF
- **Accent**: #16A34A
- **Muted text**: #6B7280
- **Main text**: #0F172A

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your DeepSeek API key:
   ```
   PORT=3001
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the UI directory:
   ```bash
   cd ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## API Endpoints

### POST /api/evaluate
Evaluates startup answers and returns feedback.

**Request Body:**
```json
{
  "answers": ["answer1", "answer2", ...]
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "overallScore": 85,
    "strengths": ["Clear value proposition", ...],
    "concerns": ["Competitive advantage needs clarity", ...],
    "recommendations": ["Focus on building moats", ...],
    "nextSteps": ["Conduct customer interviews", ...]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Project Structure

```
├── backend/
│   ├── server.js          # Express server with API endpoints
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── ui/
│   ├── public/
│   │   └── index.html    # HTML template
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styling with color scheme
│   │   ├── index.js      # React entry point
│   │   └── index.css     # Global styles
│   └── package.json      # Frontend dependencies
└── README.md             # This file
```

## Development

The app uses a proxy configuration to connect the React frontend to the Express backend. The frontend runs on port 3000 and proxies API requests to the backend on port 3001.

## Next Steps

- Integrate with DeepSeek API for real evaluation
- Add user authentication and save progress
- Implement more sophisticated scoring algorithms
- Add export functionality for evaluation results
