import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const ChatWindow = ({ friend, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user, token, socket, onlineUsers } = useAuth();

  useEffect(() => {
    if (friend) {
      fetchMessages();
      markMessagesAsRead();
    }
  }, [friend]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message');
    };
  }, [socket, friend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAttachmentMenu && !event.target.closest('.attachment-menu-container')) {
        setShowAttachmentMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAttachmentMenu]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/auth/messages/${friend.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await fetch(`http://localhost:3001/api/auth/messages/${friend.id}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleNewMessage = (message) => {
    // Only add message if it's between current user and the friend in this chat
    if ((message.sender_id === friend.id && message.receiver_id === user.id) || 
        (message.sender_id === user.id && message.receiver_id === friend.id)) {
      
      // Check if message already exists to prevent duplicates
      setMessages(prev => {
        const messageExists = prev.some(msg => 
          msg.id === message.id || 
          (msg.sender_id === message.sender_id && 
           msg.receiver_id === message.receiver_id && 
           msg.message === message.message && 
           Math.abs(new Date(msg.created_at) - new Date(message.created_at)) < 1000)
        );
        
        if (messageExists) {
          return prev;
        }
        
        return [...prev, message];
      });
      
      if (message.sender_id === friend.id) {
        markMessagesAsRead();
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      receiverId: friend.id,
      message: newMessage.trim(),
      messageType: 'text'
    };

    try {
      const response = await fetch('http://localhost:3001/api/auth/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const data = await response.json();
        setNewMessage('');
        
        // Don't add message locally - it will come through socket event
        if (socket) {
          socket.emit('send_message', {
            ...messageData,
            id: data.id // Use the real message ID from the API
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = (type) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = getAcceptTypes(type);
      fileInputRef.current.click();
    }
    setShowAttachmentMenu(false);
  };

  const getAcceptTypes = (type) => {
    switch (type) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.zip,.rar';
      default:
        return '*/*';
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images and videos
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target.result);
          setShowFilePreview(true);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setFilePreview(url);
        setShowFilePreview(true);
      } else {
        // For other files, just show file info
        setFilePreview(null);
        setShowFilePreview(true);
      }
    }
  };

  const sendFile = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('receiverId', friend.id);

    try {
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      // Upload progress handler
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      // Response handler
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Upload failed'));
      });

      // Set up request
      xhr.open('POST', 'http://localhost:3001/api/auth/upload-message-file');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      // Send request
      xhr.send(formData);
      
      // Wait for response
      const data = await uploadPromise;
      
      // Don't add message locally - it will come through socket event
      // Emit socket event for real-time delivery
      if (socket) {
        socket.emit('send_message', {
          receiverId: friend.id,
          message: data.message,
          messageType: data.message_type,
          id: data.id // Use the real message ID from the API
        });
      }
      
      // Clean up
      setSelectedFile(null);
      setFilePreview(null);
      setShowFilePreview(false);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Error sending file:', error);
      // You could add error state here if needed
    } finally {
      setIsUploading(false);
    }
  };

  const cancelFileUpload = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setShowFilePreview(false);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp in formatTime:', timestamp);
      return '';
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp in formatDate:', timestamp);
      return '';
    }
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFriendStatus = () => {
    const onlineUser = onlineUsers.get(friend.id);
    if (!onlineUser) return 'Offline';
    
    return onlineUser.status === 'online' ? 'Online' : 'Offline';
  };

  const getFriendStatusColor = () => {
    const onlineUser = onlineUsers.get(friend.id);
    if (!onlineUser) return 'text-gray-500';
    
    return onlineUser.status === 'online' ? 'text-green-600' : 'text-gray-500';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessage = (message) => {
    const isCurrentUser = message.sender_id === user.id;
    
    if (message.message_type === 'text') {
      return (
        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
          isCurrentUser 
            ? 'bg-indigo-600 text-white ml-auto' 
            : 'bg-white border border-gray-200 text-gray-900'
        }`}>
          <p className="break-words leading-relaxed">{message.message}</p>
          <p className={`text-xs mt-2 ${
            isCurrentUser ? 'text-indigo-100' : 'text-gray-500'
          }`}>
            {formatTime(message.created_at)}
          </p>
        </div>
      );
    }

    // Handle file messages
    let fileInfo;
    try {
      fileInfo = JSON.parse(message.message);
    } catch (e) {
      return renderMessage({...message, message_type: 'text'});
    }

    const baseClasses = `max-w-xs lg:max-w-md rounded-2xl shadow-sm overflow-hidden ${
      isCurrentUser 
        ? 'ml-auto border-2 border-indigo-200' 
        : 'border border-gray-200'
    }`;

    if (message.message_type === 'image') {
      return (
        <div className={baseClasses}>
          <img 
            src={`http://localhost:3001${fileInfo.filePath}`}
            alt={fileInfo.originalName}
            className="w-full h-auto max-h-64 object-cover cursor-pointer"
            onClick={() => window.open(`http://localhost:3001${fileInfo.filePath}`, '_blank')}
          />
          <div className={`px-3 py-2 ${
            isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-gray-50'
          }`}>
            <p className={`text-xs truncate ${isCurrentUser ? 'text-indigo-100' : 'text-gray-600'}`}>
              {fileInfo.originalName}
            </p>
            <p className={`text-xs ${isCurrentUser ? 'text-indigo-100' : 'text-gray-500'}`}>
              {formatTime(message.created_at)}
            </p>
          </div>
        </div>
      );
    }

    if (message.message_type === 'video') {
      return (
        <div className={baseClasses}>
          <video 
            src={`http://localhost:3001${fileInfo.filePath}`}
            controls
            className="w-full h-auto max-h-64"
          />
          <div className={`px-3 py-2 ${
            isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-gray-50'
          }`}>
            <p className={`text-xs truncate ${isCurrentUser ? 'text-indigo-100' : 'text-gray-600'}`}>
              {fileInfo.originalName}
            </p>
            <p className={`text-xs ${isCurrentUser ? 'text-indigo-100' : 'text-gray-500'}`}>
              {formatFileSize(fileInfo.fileSize)} • {formatTime(message.created_at)}
            </p>
          </div>
        </div>
      );
    }

    // File type
    return (
      <div className={`${baseClasses} ${
        isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-white'
      }`}>
        <div className="p-4 flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isCurrentUser ? 'bg-white/20' : 'bg-gray-100'
          }`}>
            <svg className={`w-6 h-6 ${
              isCurrentUser ? 'text-white' : 'text-gray-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${
              isCurrentUser ? 'text-white' : 'text-gray-900'
            }`}>
              {fileInfo.originalName}
            </p>
            <p className={`text-xs ${
              isCurrentUser ? 'text-indigo-100' : 'text-gray-500'
            }`}>
              {formatFileSize(fileInfo.fileSize)} • {formatTime(message.created_at)}
            </p>
          </div>
          <a
            href={`http://localhost:3001${fileInfo.filePath}`}
            download={fileInfo.originalName}
            className={`p-2 rounded-lg hover:bg-white/20 transition-colors ${
              isCurrentUser ? 'text-white' : 'text-gray-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </a>
        </div>
      </div>
    );
  };

  if (!friend) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center p-2 sm:p-4 min-h-screen overflow-hidden" style={{ paddingTop: '7rem' }}>
      <div className="bg-white rounded-xl w-full max-w-3xl h-[70vh] max-h-[calc(100vh-10rem)] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300 relative">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar 
                src={friend.avatar}
                username={friend.username}
                size="md"
              />
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${
                getFriendStatus() === 'Online' ? 'bg-green-500' : 'bg-gray-400'
              } rounded-full border-2 border-white`}></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{friend.username}</h3>
              <p className={`text-sm ${getFriendStatusColor()} flex items-center space-x-1`}>
                <span className={`w-2 h-2 rounded-full ${
                  getFriendStatus() === 'Online' ? 'bg-green-500' : 'bg-gray-400'
                }`}></span>
                <span>{getFriendStatus()}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 transform hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="bg-indigo-50 rounded-full p-6 mx-auto w-20 h-20 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Start a conversation</h4>
                <p className="text-sm text-gray-500">Send a message or share a file to get started</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isCurrentUser = message.sender_id === user.id;
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);
                
                return (
                  <div key={message.id || index}>
                    {showDate && (
                      <div className="flex justify-center mb-6">
                        <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}>
                      {renderMessage(message)}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-white rounded-b-xl">
          <div className="flex items-end space-x-2 sm:space-x-3">
            {/* Attachment Button */}
            <div className="relative attachment-menu-container">
              <button
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 transform hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              
              {/* Attachment Menu */}
              {showAttachmentMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 min-w-[180px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="space-y-2">
                    <button
                      onClick={() => handleFileSelect('image')}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="p-2 bg-green-100 rounded-full">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">Photos</span>
                    </button>
                    
                    <button
                      onClick={() => handleFileSelect('video')}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="p-2 bg-purple-100 rounded-full">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">Videos</span>
                    </button>
                    
                    <button
                      onClick={() => handleFileSelect('document')}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="p-2 bg-blue-100 rounded-full">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">Documents</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 shadow-sm"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            
            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className={`p-3 rounded-full shadow-lg transform transition-all duration-200 ${
                newMessage.trim() 
                  ? 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 text-white' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        {/* File Preview Modal */}
        {showFilePreview && selectedFile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4" onClick={cancelFileUpload}>
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Send File</h3>
                <p className="text-sm text-gray-600">Are you sure you want to send this file?</p>
              </div>
              
              {/* File Preview */}
              <div className="mb-6">
                {selectedFile.type.startsWith('image/') && filePreview ? (
                  <div className="text-center">
                    <img 
                      src={filePreview} 
                      alt={selectedFile.name}
                      className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm border border-gray-200"
                    />
                  </div>
                ) : selectedFile.type.startsWith('video/') && filePreview ? (
                  <div className="text-center">
                    <video 
                      src={filePreview} 
                      className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm border border-gray-200"
                      controls
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                )}
              </div>
              
              <div className="text-center text-sm text-gray-600 mb-1">
                <strong>{selectedFile.name}</strong>
              </div>
              <div className="text-center text-xs text-gray-500 mb-6">
                {formatFileSize(selectedFile.size)}
              </div>
              
              {/* Upload Progress */}
              {isUploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Uploading...</span>
                    <span className="text-sm text-gray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  {uploadProgress === 100 && (
                    <div className="flex items-center justify-center mt-2">
                      <svg className="animate-spin h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-2 text-sm text-gray-600">Processing...</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={cancelFileUpload}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={sendFile}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send File'
                  )}
                </button>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;