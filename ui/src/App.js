import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Questions from './Questions';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import './App.css';

// Header component with authentication
const Header = () => {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 24px',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
        Evalio
      </div>
      
      <div>
        {!isAuthenticated && (
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#2563eb'}
            onMouseOut={(e) => e.target.style.background = '#3b82f6'}
          >
            Sign In
          </button>
        )}
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </header>
  );
};

// Bottom Navigation component for dashboard
const BottomNav = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #e5e7eb',
      padding: '12px 24px',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <UserProfile />
    </nav>
  );
};

// Main App component
const AppContent = () => {
  // Check if we should show the landing page or questions
  const urlParams = new URLSearchParams(window.location.search);
  const showQuestions = urlParams.get('page') === 'questions';

  if (showQuestions) {
    return (
      <div>
        <Header />
        <div style={{ marginTop: '80px', marginBottom: '80px' }}>
          <Questions />
        </div>
        <BottomNav />
      </div>
    );
  }

  // Default: redirect to landing page
  window.location.href = 'index.html';
  return null;
};

// App wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;