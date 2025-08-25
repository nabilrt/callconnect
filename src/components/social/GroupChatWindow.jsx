import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const GroupChatWindow = ({ group, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user, token, socket } = useAuth();

  useEffect(() => {
    fetchMessages();
  }, [group.id, token]);

  useEffect(() => {
    if (socket && group.id) {
      socket.emit('join_group', group.id);
      socket.on('new_group_message', handleNewMessage);

      return () => {
        socket.emit('leave_group', group.id);
        socket.off('new_group_message');
      };
    }
  }, [socket, group.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/social/groups/${group.id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (messageData) => {
    if (messageData.group_id === group.id) {
      setMessages(prev => [...prev, messageData]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      const response = await fetch(`http://localhost:3001/api/social/groups/${group.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (response.ok) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSending(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:3001/api/social/groups/${group.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        // Message will be added via socket event
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message) => {
    const isOwnMessage = message.sender_id === user?.id;

    if (message.message_type === 'image') {
      return (
        <div className={`max-w-xs ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
          <img
            src={`http://localhost:3001/uploads/${message.message}`}
            alt="Shared image"
            className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(`http://localhost:3001/uploads/${message.message}`, '_blank')}
          />
        </div>
      );
    }

    if (message.message_type === 'file') {
      const fileName = message.message.split('/').pop();
      return (
        <a
          href={`http://localhost:3001/uploads/${message.message}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors ${
            isOwnMessage ? 'ml-auto' : 'mr-auto'
          }`}
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span className="text-sm text-gray-700">{fileName}</span>
        </a>
      );
    }

    return (
      <p className={`text-sm ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
        {message.message}
      </p>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              {group.image ? (
                <img
                  src={`http://localhost:3001/uploads/${group.image}`}
                  alt={group.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-500">{group.members_count} members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : messages.length > 0 ? (
            messages.map((message, index) => {
              const isOwnMessage = message.sender_id === user?.id;
              const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
              const showTimestamp = index === messages.length - 1 || 
                messages[index + 1].sender_id !== message.sender_id ||
                new Date(messages[index + 1].created_at) - new Date(message.created_at) > 5 * 60 * 1000;

              return (
                <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {showAvatar && !isOwnMessage && (
                      <Avatar 
                        src={message.avatar}
                        username={message.username}
                        size="sm"
                      />
                    )}
                    <div>
                      {showAvatar && !isOwnMessage && (
                        <p className="text-xs text-gray-500 mb-1 ml-1">{message.username}</p>
                      )}
                      <div className={`rounded-2xl px-4 py-2 ${
                        isOwnMessage 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {renderMessage(message)}
                      </div>
                      {showTimestamp && (
                        <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right mr-1' : 'ml-1'}`}>
                          {formatTimestamp(message.created_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              disabled={sending}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={sending}
            />
            
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupChatWindow;