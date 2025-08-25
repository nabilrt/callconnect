import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { socket, token, user } = useAuth();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [unreadMessagesByFriend, setUnreadMessagesByFriend] = useState(new Map());

  useEffect(() => {
    if (token) {
      fetchUnreadCounts();
    }
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', handleNewMessage);
    socket.on('new_friend_request', handleNewNotification);
    socket.on('friend_request_responded', handleNewNotification);

    return () => {
      socket.off('new_message');
      socket.off('new_friend_request');
      socket.off('friend_request_responded');
    };
  }, [socket]);

  const fetchUnreadCounts = async () => {
    try {
      // Fetch unread messages count
      const messagesResponse = await fetch('http://localhost:3001/api/auth/messages/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (messagesResponse.ok) {
        const messageData = await messagesResponse.json();
        setUnreadMessagesCount(messageData.totalUnread || 0);
        
        // Create map of unread messages by friend
        const friendUnreadMap = new Map();
        if (messageData.unreadByFriend) {
          messageData.unreadByFriend.forEach(item => {
            friendUnreadMap.set(item.friend_id, item.unread_count);
          });
        }
        setUnreadMessagesByFriend(friendUnreadMap);
      }

      // Fetch unread notifications count
      const notificationsResponse = await fetch('http://localhost:3001/api/auth/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (notificationsResponse.ok) {
        const notificationData = await notificationsResponse.json();
        setUnreadNotificationsCount(notificationData.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const handleNewMessage = (messageData) => {
    // Only count if message is not from current user
    if (messageData.sender_id !== user?.id) {
      setUnreadMessagesCount(prev => prev + 1);
      setUnreadMessagesByFriend(prev => {
        const newMap = new Map(prev);
        const currentCount = newMap.get(messageData.sender_id) || 0;
        newMap.set(messageData.sender_id, currentCount + 1);
        return newMap;
      });
    }
  };

  const handleNewNotification = (notificationData) => {
    setUnreadNotificationsCount(prev => prev + 1);
  };

  const markMessagesAsRead = (friendId) => {
    const unreadCount = unreadMessagesByFriend.get(friendId) || 0;
    if (unreadCount > 0) {
      setUnreadMessagesCount(prev => prev - unreadCount);
      setUnreadMessagesByFriend(prev => {
        const newMap = new Map(prev);
        newMap.delete(friendId);
        return newMap;
      });

      // API call to mark messages as read
      if (token) {
        fetch(`http://localhost:3001/api/auth/messages/${friendId}/mark-read`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(error => {
          console.error('Error marking messages as read:', error);
        });
      }
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
  };

  const clearAllNotifications = () => {
    setUnreadNotificationsCount(0);
  };

  const refreshNotifications = () => {
    fetchUnreadCounts();
  };

  const value = {
    unreadMessagesCount,
    unreadNotificationsCount,
    unreadMessagesByFriend,
    markMessagesAsRead,
    markNotificationAsRead,
    clearAllNotifications,
    fetchUnreadCounts,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};