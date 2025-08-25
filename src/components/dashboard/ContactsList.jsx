import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const ContactsList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { token, socket, onlineUsers } = useAuth();
  const { makeCall, callStatus } = useCall();

  useEffect(() => {
    fetchUsers();
  }, []);


  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (userId, callType) => {
    if (callStatus === 'idle') {
      makeCall(userId, callType);
    }
  };

  const getStatusColor = (userId) => {
    const user = onlineUsers.get(userId);
    if (!user) return 'bg-gray-400';
    
    switch (user.status) {
      case 'online':
        return 'bg-green-500';
      case 'in-call':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (userId) => {
    const user = onlineUsers.get(userId);
    if (!user) return 'Offline';
    
    switch (user.status) {
      case 'online':
        return 'Online';
      case 'in-call':
        return 'In call';
      default:
        return 'Offline';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Users</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {users.map((user) => (
          <div 
            key={user.id} 
            className="p-4 hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              {/* Avatar with Status */}
              <div className="relative">
                <Avatar 
                  src={user.avatar}
                  username={user.username}
                  size="md"
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.id)} rounded-full border-2 border-white`}></div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {user.username}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {getStatusText(user.id)}
                </p>
              </div>
              
              {/* Call Buttons */}
              <div className="flex items-center space-x-2">
                {/* Audio Call */}
                <Button
                  onClick={() => handleCall(user.id, 'audio')}
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                  disabled={callStatus !== 'idle' || !onlineUsers.has(user.id) || onlineUsers.get(user.id)?.status === 'in-call'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                  </svg>
                </Button>
                
                {/* Video Call */}
                <Button
                  onClick={() => handleCall(user.id, 'video')}
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                  disabled={callStatus !== 'idle' || !onlineUsers.has(user.id) || onlineUsers.get(user.id)?.status === 'in-call'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>No users available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsList;