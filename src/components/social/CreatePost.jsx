import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileType, setFileType] = useState(null);
  const [privacy, setPrivacy] = useState('friends');
  const [isPosting, setIsPosting] = useState(false);
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const { user, token } = useAuth();

  const handleFileSelect = (event, type) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setFileType(type);
    }
  };

  const removeFiles = () => {
    setSelectedFiles([]);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && selectedFiles.length === 0) {
      return;
    }

    setIsPosting(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('privacy', privacy);

      if (selectedFiles.length > 0) {
        const file = selectedFiles[0];
        if (fileType === 'image') {
          formData.append('image', file);
        } else if (fileType === 'video') {
          formData.append('video', file);
        }
      }

      const response = await fetch('http://localhost:3001/api/social/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newPost = await response.json();
        setContent('');
        setSelectedFiles([]);
        setFileType(null);
        setPrivacy('friends');
        
        // Don't call onPostCreated here since the socket event will handle it
        // The server emits 'new_post' event which FeedPage already handles
      } else {
        console.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const privacyOptions = [
    { value: 'public', label: 'Public', icon: '🌍', desc: 'Anyone can see this post' },
    { value: 'friends', label: 'Friends', icon: '👥', desc: 'Only your friends can see this' },
    { value: 'private', label: 'Only me', icon: '🔒', desc: 'Only you can see this post' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <Avatar 
          src={user?.avatar}
          username={user?.username}
          size="md"
        />
        <div className="flex-1">
          <button
            onClick={() => document.getElementById('post-textarea').focus()}
            className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
          >
            What's on your mind, {user?.username}?
          </button>
        </div>
      </div>

      {/* Create Post Form */}
      <form onSubmit={handleSubmit}>
        {/* Text Area */}
        <textarea
          id="post-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${user?.username}?`}
          className="w-full p-4 border-none resize-none focus:outline-none text-lg placeholder-gray-500"
          rows="3"
          maxLength="2000"
        />

        {/* File Preview */}
        {selectedFiles.length > 0 && (
          <div className="relative mb-4 p-4 bg-gray-50 rounded-lg">
            <button
              type="button"
              onClick={removeFiles}
              className="absolute top-2 right-2 w-8 h-8 bg-gray-800 bg-opacity-70 text-white rounded-full flex items-center justify-center hover:bg-opacity-80"
            >
              ✕
            </button>
            
            {fileType === 'image' && (
              <img
                src={URL.createObjectURL(selectedFiles[0])}
                alt="Preview"
                className="w-full max-h-96 object-cover rounded-lg"
              />
            )}
            
            {fileType === 'video' && (
              <video
                src={URL.createObjectURL(selectedFiles[0])}
                controls
                className="w-full max-h-96 rounded-lg"
              />
            )}
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Image Upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={fileType === 'video'}
            >
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Photo</span>
            </button>

            {/* Video Upload */}
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={fileType === 'image'}
            >
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Video</span>
            </button>

            {/* Privacy Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-sm">
                  {privacyOptions.find(opt => opt.value === privacy)?.icon}
                </span>
                <span className="text-sm font-medium">
                  {privacyOptions.find(opt => opt.value === privacy)?.label}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showPrivacyMenu && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {privacyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setPrivacy(option.value);
                        setShowPrivacyMenu(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        privacy === option.value ? 'bg-indigo-50 text-indigo-900' : 'text-gray-900'
                      }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Post Button */}
          <button
            type="submit"
            disabled={(!content.trim() && selectedFiles.length === 0) || isPosting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPosting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Posting...</span>
              </div>
            ) : (
              'Post'
            )}
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 'image')}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFileSelect(e, 'video')}
          className="hidden"
        />
      </form>
    </div>
  );
};

export default CreatePost;