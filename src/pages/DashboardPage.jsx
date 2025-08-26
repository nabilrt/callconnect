import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Profile from '../components/dashboard/Profile';
import ContactsList from '../components/dashboard/ContactsList';
import FeedPage from './FeedPage';
import ProfilePage from './ProfilePage';
import FriendsPage from './FriendsPage';
import GroupsPage from './GroupsPage';
import GroupDetailPage from './GroupDetailPage';
import MessagesPage from './MessagesPage';
import NotificationsPage from './NotificationsPage';

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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <div className="pt-16">
        {/* Routes */}
        <Routes>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<GroupDetailPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/" element={<FeedPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardPage;