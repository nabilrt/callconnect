import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Profile from '../components/dashboard/Profile';
import ContactsList from '../components/dashboard/ContactsList';
import FriendsPage from './FriendsPage';
import DiscoverPage from './DiscoverPage';
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardPage;