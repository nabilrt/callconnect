import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import FriendRequests from '../components/friends/FriendRequests';
import ChatWindow from '../components/chat/ChatWindow';

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showChat, setShowChat] = useState(false);
  
  const { token, socket, onlineUsers } = useAuth();
  const { makeCall, callStatus } = useCall();

  useEffect(() => {
    fetchFriends();
  }, []);


  const fetchFriends = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/friends', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (friendId, callType) => {
    if (callStatus === 'idle') {
      makeCall(friendId, callType);
    }
  };

  const handleChatOpen = (friend) => {
    setSelectedFriend(friend);
    setShowChat(true);
  };

  const handleRemoveFriend = async (friendId) => {
    if (!confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/auth/friends/${friendId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFriends(prev => prev.filter(friend => friend.id !== friendId));
      }
    } catch (error) {
      console.error('Error removing friend:', error);
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
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-300 rounded flex-1"></div>
                  <div className="h-8 bg-gray-300 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Friends</h1>
        <p className="text-gray-600">Connect with your friends through calls and messages</p>
      </div>

      {/* Friend Requests */}
      <div className="mb-8">
        <FriendRequests />
      </div>

      {/* Friends List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Friends ({friends.length})
          </h2>
        </div>

        {friends.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Friends Yet</h3>
            <p className="text-gray-500 mb-6">Discover and add friends to start connecting</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {friends.map((friend) => (
              <div key={friend.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <Avatar 
                      src={friend.avatar}
                      username={friend.username}
                      size="lg"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(friend.id)} rounded-full border-2 border-white`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{friend.username}</h3>
                    <p className="text-sm text-gray-500 truncate">{getStatusText(friend.id)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Button
                    onClick={() => handleCall(friend.id, 'audio')}
                    variant="outline"
                    size="sm"
                    disabled={callStatus !== 'idle' || !onlineUsers.has(friend.id) || onlineUsers.get(friend.id)?.status === 'in-call'}
                    className="flex items-center justify-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                    </svg>
                    <span>Call</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleCall(friend.id, 'video')}
                    variant="outline"
                    size="sm"
                    disabled={callStatus !== 'idle' || !onlineUsers.has(friend.id) || onlineUsers.get(friend.id)?.status === 'in-call'}
                    className="flex items-center justify-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                    <span>Video</span>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleChatOpen(friend)}
                    variant="primary"
                    size="sm"
                    className="flex items-center justify-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Message</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleRemoveFriend(friend.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Window */}
      {showChat && selectedFriend && (
        <ChatWindow 
          friend={selectedFriend}
          onClose={() => {
            setShowChat(false);
            setSelectedFriend(null);
          }}
        />
      )}
    </div>
  );
};

export default FriendsPage;