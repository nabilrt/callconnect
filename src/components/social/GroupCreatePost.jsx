import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const GroupCreatePost = ({ group, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileType, setFileType] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  
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

      if (selectedFiles.length > 0) {
        const file = selectedFiles[0];
        if (fileType === 'image') {
          formData.append('image', file);
        } else if (fileType === 'video') {
          formData.append('video', file);
        }
      }

      const response = await fetch(`http://localhost:3001/api/social/groups/${group.id}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newPost = await response.json();
        onPostCreated(newPost);
        setContent('');
        removeFiles();
      } else {
        console.error('Failed to create group post');
      }
    } catch (error) {
      console.error('Error creating group post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex space-x-3">
        <Avatar 
          src={user?.avatar}
          username={user?.username}
          size="md"
        />
        <div className="flex-1">
          <button
            onClick={() => document.getElementById('group-post-textarea').focus()}
            className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
          >
            Share something with {group.name}...
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Text Area */}
        <textarea
          id="group-post-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Share something with ${group.name}...`}
          className="w-full mt-3 p-3 border-0 resize-none focus:outline-none text-lg placeholder-gray-500"
          rows="3"
          style={{ minHeight: '80px' }}
        />

        {/* File Preview */}
        {selectedFiles.length > 0 && (
          <div className="mt-3 relative">
            {fileType === 'image' && (
              <div className="relative">
                <img 
                  src={URL.createObjectURL(selectedFiles[0])} 
                  alt="Preview" 
                  className="w-full max-w-md rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeFiles}
                  className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {fileType === 'video' && (
              <div className="relative">
                <video 
                  src={URL.createObjectURL(selectedFiles[0])} 
                  controls
                  className="w-full max-w-md rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeFiles}
                  className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Photo</span>
            </button>
            
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Video</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={(!content.trim() && selectedFiles.length === 0) || isPosting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e, 'image')}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={videoInputRef}
          onChange={(e) => handleFileSelect(e, 'video')}
          accept="video/*"
          className="hidden"
        />
      </form>
    </div>
  );
};

export default GroupCreatePost;