import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from '../components/ui/Avatar';
import ChatWindow from '../components/chat/ChatWindow';

const MessagesPage = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [conversationPreviews, setConversationPreviews] = useState(new Map());
  
  const { token, socket, onlineUsers } = useAuth();
  const { unreadMessagesByFriend, markMessagesAsRead } = useNotifications();

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages to refresh previews
    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message');
    };
  }, [socket, friends]);

  const handleNewMessage = (messageData) => {
    // Only refresh if the message involves one of our friends
    const isRelevant = friends.some(friend => 
      friend.id === messageData.sender_id || friend.id === messageData.receiver_id
    );
    
    if (isRelevant && friends.length > 0) {
      // Add a small delay to ensure database is updated
      setTimeout(() => {
        fetchMessagePreviews(friends);
      }, 100);
    }
  };


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
        // Fetch message previews for each friend
        fetchMessagePreviews(data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagePreviews = async (friendsList) => {
    const previews = new Map();
    
    for (const friend of friendsList) {
      try {
        const response = await fetch(`http://localhost:3001/api/auth/messages/${friend.id}?limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const messages = await response.json();
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            // Get current user ID from token
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentUserId = tokenPayload.userId;
            
            previews.set(friend.id, {
              lastMessage: lastMessage.message,
              messageType: lastMessage.message_type || 'text',
              timestamp: lastMessage.created_at,
              isFromMe: lastMessage.sender_id === currentUserId
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching messages for friend ${friend.id}:`, error);
      }
    }
    
    setConversationPreviews(previews);
  };

  const handleChatOpen = (friend) => {
    setSelectedFriend(friend);
    setShowChat(true);
    // Mark messages as read when opening chat
    markMessagesAsRead(friend.id);
  };

  const formatMessagePreview = (message, messageType, isFromMe) => {
    const prefix = isFromMe ? 'You: ' : '';
    
    // Handle different message types
    let displayText;
    switch (messageType) {
      case 'image':
        displayText = '📷 Photo';
        break;
      case 'video':
        displayText = '🎥 Video';
        break;
      case 'file':
        displayText = '📎 File';
        break;
      default:
        displayText = message.length > 50 ? message.substring(0, 50) + '...' : message;
    }
    
    return prefix + displayText;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (userId) => {
    const user = onlineUsers.get(userId);
    if (!user) return 'bg-gray-400';
    
    return user.status === 'online' ? 'bg-green-500' : 'bg-gray-400';
  };

  const getStatusText = (userId) => {
    const user = onlineUsers.get(userId);
    if (!user) return 'Offline';
    
    return user.status === 'online' ? 'Online' : 'Offline';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Chat with your friends</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Conversations
          </h2>
        </div>

        {friends.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversations Yet</h3>
            <p className="text-gray-500 mb-6">Add friends to start messaging</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {friends.map((friend) => (
              <div 
                key={friend.id}
                onClick={() => handleChatOpen(friend)}
                className={`flex items-center space-x-4 p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                  unreadMessagesByFriend.has(friend.id) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="relative">
                  <Avatar 
                    src={friend.avatar}
                    username={friend.username}
                    size="md"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(friend.id)} rounded-full border-2 border-white`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{friend.username}</h3>
                    <span className="text-xs text-gray-500">
                      {conversationPreviews.has(friend.id) 
                        ? formatTimestamp(conversationPreviews.get(friend.id).timestamp)
                        : getStatusText(friend.id)
                      }
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conversationPreviews.has(friend.id)
                      ? formatMessagePreview(
                          conversationPreviews.get(friend.id).lastMessage,
                          conversationPreviews.get(friend.id).messageType,
                          conversationPreviews.get(friend.id).isFromMe
                        )
                      : "Click to start a conversation"
                    }
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {unreadMessagesByFriend.has(friend.id) && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {unreadMessagesByFriend.get(friend.id)}
                    </span>
                  )}
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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
            // Refresh message previews when closing chat to show latest messages
            if (friends.length > 0) {
              fetchMessagePreviews(friends);
            }
          }}
        />
      )}
    </div>
  );
};

export default MessagesPage;