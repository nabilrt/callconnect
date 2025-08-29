import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import ContactPage from './pages/ContactPage';
import HelpPage from './pages/HelpPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import SecurityPage from './pages/SecurityPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import Logo from './components/ui/Logo';

const TitleUpdater = () => {
  const location = useLocation();
  
  useEffect(() => {
    const pathToTitle = {
      '/': 'SocialHub - Connect & Share',
      '/about': 'About - SocialHub',
      '/features': 'Features - SocialHub',
      '/contact': 'Contact - SocialHub',
      '/help': 'Help - SocialHub',
      '/privacy': 'Privacy Policy - SocialHub',
      '/terms': 'Terms of Service - SocialHub',
      '/security': 'Security - SocialHub'
    };
    
    document.title = pathToTitle[location.pathname] || 'SocialHub - Connect & Share';
  }, [location.pathname]);
  
  return null;
};

const AppContent = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

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

  return (
    <Router>
      <TitleUpdater />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          isAuthenticated && isAdmin ? <AdminDashboard /> : <AdminLogin />
        } />
        
        {/* Regular User Routes */}
        {isAuthenticated ? (
          <Route path="/*" element={<DashboardPage />} />
        ) : (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/security" element={<SecurityPage />} />
          </>
        )}
      </Routes>
    </Router>
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
