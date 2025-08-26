import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import Logo from './components/ui/Logo';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-pulse">
            <Logo size="xl" showText={false} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-manrope">SocialHub</h2>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Router>
      <NotificationProvider>
        <DashboardPage />
      </NotificationProvider>
    </Router>
  ) : (
    <LandingPage />
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
