import React from 'react';
import Questions from './Questions';
import './App.css';

function App() {
  // Check if we should show the landing page or questions
  const urlParams = new URLSearchParams(window.location.search);
  const showQuestions = urlParams.get('page') === 'questions';

  if (showQuestions) {
    return <Questions />;
  }

  // Default: redirect to landing page
  window.location.href = 'index.html';
  return null;
}

export default App;