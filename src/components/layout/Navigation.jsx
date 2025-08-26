import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Logo from '../ui/Logo';
import Avatar from '../ui/Avatar';

const Navigation = () => {
  const { logout, user } = useAuth();
  const { unreadMessagesCount, unreadNotificationsCount } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      path: '/feed',
      name: 'Feed',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      )
    },
    {
      path: '/friends',
      name: 'Friends',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      path: '/groups',
      name: 'Groups',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  const actionItems = [
    {
      path: '/messages',
      name: 'Messages',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      notificationCount: unreadMessagesCount
    },
    {
      path: '/notifications',
      name: 'Notifications',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      notificationCount: unreadNotificationsCount
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Logo */}
          <div className="flex items-center">
            <NavLink to="/feed" className="flex items-center">
              <Logo size="sm" />
            </NavLink>
          </div>

          {/* Center Section - Main Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative p-4 mx-2 rounded-xl transition-all duration-300 ease-in-out group transform hover:scale-105 ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
                title={item.name}
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
              >
                <div className="transition-transform duration-300 ease-in-out group-hover:scale-110">
                  {item.icon}
                </div>
                {/* Active indicator */}
                <div 
                  className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1 bg-indigo-600 rounded-full transition-all duration-500 ease-out ${
                    item.path === location.pathname ? 'w-8 opacity-100' : 'w-0 opacity-0'
                  }`} 
                />
                {/* Hover indicator */}
                <div 
                  className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1 bg-gray-400 rounded-full transition-all duration-300 ease-out ${
                    item.path !== location.pathname ? 'group-hover:w-6 group-hover:opacity-60' : 'w-0 opacity-0'
                  }`} 
                />
              </NavLink>
            ))}
          </div>

          {/* Right Section - Actions and Profile */}
          <div className="flex items-center space-x-4">
            {/* Action Items */}
            <div className="flex items-center space-x-3">
              {actionItems.map((item, index) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative p-3 rounded-full transition-all duration-300 ease-in-out group transform hover:scale-110 ${
                      isActive
                        ? 'text-indigo-600 bg-indigo-50 shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-sm'
                    }`
                  }
                  title={item.name}
                  style={{
                    transitionDelay: `${index * 30}ms`
                  }}
                >
                  <div className="relative transition-transform duration-300 ease-in-out group-hover:scale-105">
                    {item.icon}
                    {item.notificationCount > 0 && (
                      <div className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center transform transition-all duration-300 ease-out group-hover:scale-110 animate-pulse">
                        <span className="text-xs text-white font-bold px-1">
                          {item.notificationCount > 99 ? '99+' : item.notificationCount}
                        </span>
                      </div>
                    )}
                  </div>
                </NavLink>
              ))}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <div className="transition-transform duration-300 ease-in-out hover:scale-110">
                  <Avatar 
                    src={user?.avatar} 
                    alt={user?.username || 'Profile'} 
                    size="sm"
                  />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate transition-colors duration-200">
                  {user?.username || 'User'}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-all duration-300 ease-in-out ${
                    showDropdown ? 'rotate-180 text-indigo-600' : 'rotate-0'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 transform transition-all duration-300 ease-out animate-in slide-in-from-top-2">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3 transition-all duration-200 hover:bg-gray-50 rounded-lg p-2 -m-2">
                      <Avatar 
                        src={user?.avatar} 
                        alt={user?.username || 'Profile'} 
                        size="md"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 transition-colors duration-200">
                          {user?.username || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 transition-colors duration-200">
                          {user?.email || ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 ease-in-out hover:translate-x-1"
                  >
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Your Profile</span>
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 ease-in-out hover:translate-x-1"
                  >
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;