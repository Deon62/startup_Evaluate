import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import './App.css';

const STARTUP_QUESTIONS = [
  "What is your unique value proposition? What's genuinely new or different about what you're building?",
  "What's your unfair competitive advantage? Why can't others easily copy you?",
  "Who is your customer, really? Describe the exact persona (pain points, alternatives).",
  "Why now? What market/tech/regulatory shifts make this the right moment?",
  "What critical problem are you solving, and how painful is it?",
  "What would stop this idea from succeeding? List the biggest risks.",
  "If your product disappeared tomorrow, what would customers miss most?",
  "How will you make money, and why will customers actually pay?",
  "What is your long-term vision (5–10 years) if everything goes right?",
  "Why you? What in your background/network makes you the right team?"
];

function Questions() {
  const [answers, setAnswers] = useState(Array(10).fill(''));
  const [isLoading, setIsLoading] = useState(false);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const getFilledAnswersCount = () => {
    return answers.filter(answer => answer.trim().length > 0).length;
  };

  const isEvaluationEnabled = () => {
    return getFilledAnswersCount() >= 7 && !isLoading;
  };

  const handleEvaluate = async () => {
    if (!isEvaluationEnabled()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      const result = await response.json();
      // Store evaluation data in localStorage and redirect to dashboard
      localStorage.setItem('evaluationData', JSON.stringify(result));
      window.location.href = 'dashboard.html'; // Redirect to static HTML
    } catch (error) {
      console.error('Error evaluating startup:', error);
      alert('Failed to evaluate your startup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Startup Validation</h1>
          <p className="subtitle">
            Answer these deep questions to validate your startup idea
          </p>
          <div className="progress-indicator">
            <span className="progress-text">
              {getFilledAnswersCount()}/10 questions answered
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(getFilledAnswersCount() / 10) * 100}%` }}
              />
            </div>
          </div>
        </header>

        <div className="questions-container">
          {STARTUP_QUESTIONS.map((question, index) => (
            <div key={index} className="question-card">
              <label className="question-label">
                <span className="question-number">{index + 1}</span>
                {question}
              </label>
              <textarea
                className="answer-textarea"
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="Share your thoughts here..."
                rows={4}
              />
            </div>
          ))}
        </div>

        <div className="evaluate-section">
          <button
            className={`evaluate-button ${!isEvaluationEnabled() ? 'disabled' : ''}`}
            onClick={handleEvaluate}
            disabled={!isEvaluationEnabled()}
          >
            {isLoading ? (
              <>
                <Loader2 className="button-icon spinning" />
                Evaluating...
              </>
            ) : (
              <>
                Evaluate
                <ArrowRight className="button-icon" />
              </>
            )}
          </button>
          
          {getFilledAnswersCount() < 7 && (
            <p className="validation-message">
              Please answer at least 7 questions to evaluate your startup
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default Questions;
