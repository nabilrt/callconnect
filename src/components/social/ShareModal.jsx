import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const ShareModal = ({ isOpen, onClose, post }) => {
  const [shareText, setShareText] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareOption, setShareOption] = useState('feed'); // 'feed' or 'story'
  const { user, token } = useAuth();

  if (!isOpen) return null;

  const handleShareToFeed = async () => {
    setIsSharing(true);
    try {
      const response = await fetch('http://localhost:3001/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: shareText,
          shared_post_id: post.id,
          post_type: 'shared'
        }),
      });

      if (response.ok) {
        onClose();
        setShareText('');
        // Show success message or toast
      } else {
        console.error('Failed to share post');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      // Show copied notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
      notification.textContent = 'Link copied to clipboard!';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShare = () => {
    if (shareOption === 'feed') {
      handleShareToFeed();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Share Post</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Share Options */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="space-y-3">
            <button
              onClick={() => setShareOption('feed')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                shareOption === 'feed' ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Share to Feed</div>
                <div className="text-sm text-gray-500">Share with your friends</div>
              </div>
            </button>
          </div>
        </div>

        {/* Share Content */}
        {shareOption === 'feed' && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-start space-x-3 mb-4">
              <Avatar src={user?.avatar} username={user?.username} size="sm" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{user?.username}</div>
                <div className="text-sm text-gray-500">Public</div>
              </div>
            </div>
            
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder="Say something about this..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
            
            {/* Original Post Preview */}
            <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center space-x-2 mb-2">
                <Avatar src={post.avatar} username={post.username} size="sm" />
                <div className="font-semibold text-gray-900">{post.username}</div>
              </div>
              <p className="text-gray-700 text-sm line-clamp-3">{post.content}</p>
              {post.image && (
                <img 
                  src={`http://localhost:3001/uploads/${post.image}`} 
                  alt="Shared content" 
                  className="mt-2 w-full h-32 object-cover rounded-lg"
                />
              )}
            </div>
          </div>
        )}

        {/* Quick Share Options */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-3">Quick Share</div>
          <div className="flex space-x-4">
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm">Copy Link</span>
            </button>
            
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Check out this post',
                    text: post.content,
                    url: `${window.location.origin}/post/${post.id}`
                  });
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span className="text-sm">Send</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {shareOption === 'feed' && (
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSharing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sharing...</span>
                </div>
              ) : (
                'Share'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return isOpen ? createPortal(modalContent, document.body) : null;
};

export default ShareModal;