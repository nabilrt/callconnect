import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from '../components/ui/Avatar';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, socket, user } = useAuth();
  const { markNotificationAsRead } = useNotifications();

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  useEffect(() => {
    if (socket) {
      socket.on('new_friend_request', handleNewNotification);
      socket.on('friend_request_responded', handleNewNotification);
      socket.on('new_message', handleNewNotification);
      
      return () => {
        socket.off('new_friend_request');
        socket.off('friend_request_responded');
        socket.off('new_message');
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    if (!token) {
      console.log('No token available for notifications fetch');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.error('Failed to fetch notifications:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (notificationData) => {
    const newNotification = {
      id: Date.now(),
      type: getNotificationType(notificationData),
      title: getNotificationTitle(notificationData),
      message: getNotificationMessage(notificationData),
      timestamp: new Date().toISOString(),
      read: false,
      user: {
        id: notificationData.sender_id || notificationData.responder_id,
        username: notificationData.sender_username || notificationData.responder_username
      }
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const getNotificationType = (data) => {
    if (data.sender_id && !data.status) return 'friend_request';
    if (data.status) return 'friend_response';
    if (data.message) return 'message';
    return 'general';
  };

  const getNotificationTitle = (data) => {
    if (data.sender_id && !data.status) return 'New Friend Request';
    if (data.status === 'accepted') return 'Friend Request Accepted';
    if (data.status === 'rejected') return 'Friend Request Declined';
    if (data.message) return 'New Message';
    return 'Notification';
  };

  const getNotificationMessage = (data) => {
    const username = data.sender_username || data.responder_username;
    if (data.sender_id && !data.status) return `${username} sent you a friend request`;
    if (data.status === 'accepted') return `${username} accepted your friend request`;
    if (data.status === 'rejected') return `${username} declined your friend request`;
    if (data.message) return `${username} sent you a message`;
    return 'You have a new notification';
  };

  const markAsRead = async (notificationId) => {
    if (!token) {
      console.log('No token available for marking notification as read');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/auth/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        // Update the sidebar notification badge
        markNotificationAsRead(notificationId);
      } else {
        console.error('Failed to mark notification as read:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    // Handle both ISO string and SQLite datetime formats
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    // Handle negative differences (future dates) as "Just now"
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
        );
      case 'friend_response':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">Stay updated with your latest activities</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-500">You're all caught up! New notifications will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`flex items-start space-x-4 p-6 cursor-pointer transition-colors duration-200 ${
                  notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                }`}
              >
                {getNotificationIcon(notification.type)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold truncate ${
                      notification.read ? 'text-gray-900' : 'text-blue-900'
                    }`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatTimestamp(notification.created_at || notification.timestamp)}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${
                    notification.read ? 'text-gray-600' : 'text-blue-800'
                  }`}>
                    {notification.message}
                  </p>
                </div>

                {!notification.read && (
                  <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;