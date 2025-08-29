import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import PageTransition from '../components/layout/PageTransition';
import Profile from '../components/dashboard/Profile';
import ContactsList from '../components/dashboard/ContactsList';
import CallManager from '../components/calling/CallManager';
import CallHistory from '../components/calling/CallHistory';
import FeedPage from './FeedPage';
import ProfilePage from './ProfilePage';
import FriendsPage from './FriendsPage';
import GroupsPage from './GroupsPage';
import GroupDetailPage from './GroupDetailPage';
import MessagesPage from './MessagesPage';

const HomePage = () => (
  <div className="p-8 max-w-7xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Profile />
      </div>
      <div className="lg:col-span-2">
        <ContactsList />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const location = useLocation();
  
  useEffect(() => {
    const pathToTitle = {
      '/': 'Feed - SocialHub',
      '/feed': 'Feed - SocialHub',
      '/profile': 'Profile - SocialHub',
      '/friends': 'Friends - SocialHub',
      '/groups': 'Groups - SocialHub',
      '/messages': 'Messages - SocialHub',
      '/call-history': 'Call History - SocialHub',
      '/admin': 'Admin Panel - SocialHub'
    };
    
    // Handle dynamic routes
    if (location.pathname.startsWith('/profile/')) {
      document.title = 'Profile - SocialHub';
    } else if (location.pathname.startsWith('/groups/')) {
      document.title = 'Group - SocialHub';
    } else {
      document.title = pathToTitle[location.pathname] || 'SocialHub - Connect & Share';
    }
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <Navigation />

      {/* Call Manager - Global calling functionality */}
      <CallManager />

      {/* Main Content Area */}
      <div className="pt-16">
        {/* Routes */}
        <Routes>
          <Route path="/feed" element={<PageTransition><FeedPage /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
          <Route path="/profile/:userId" element={<PageTransition><ProfilePage /></PageTransition>} />
          <Route path="/friends" element={<PageTransition><FriendsPage /></PageTransition>} />
          <Route path="/groups" element={<PageTransition><GroupsPage /></PageTransition>} />
          <Route path="/groups/:groupId" element={<PageTransition><GroupDetailPage /></PageTransition>} />
          <Route path="/messages" element={<PageTransition><MessagesPage /></PageTransition>} />
          <Route path="/call-history" element={<PageTransition><CallHistory /></PageTransition>} />
          <Route path="/" element={<PageTransition><FeedPage /></PageTransition>} />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardPage;