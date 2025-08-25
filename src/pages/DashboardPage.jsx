import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Profile from '../components/dashboard/Profile';
import ContactsList from '../components/dashboard/ContactsList';
import FriendsPage from './FriendsPage';
import DiscoverPage from './DiscoverPage';
import MessagesPage from './MessagesPage';
import CallInterface from '../components/calling/CallInterface';
import IncomingCall from '../components/calling/IncomingCall';
import { useCall } from '../context/CallContext';

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
  const { callStatus } = useCall();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Status Bar */}
        {callStatus !== 'idle' && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                callStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-gray-700 capitalize">{callStatus}</span>
            </div>
          </div>
        )}

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/messages" element={<MessagesPage />} />
        </Routes>
      </div>

      {/* Call Components */}
      <CallInterface />
      <IncomingCall />
    </div>
  );
};

export default DashboardPage;