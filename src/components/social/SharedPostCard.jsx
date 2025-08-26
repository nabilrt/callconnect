import React from 'react';
import Avatar from '../ui/Avatar';

const SharedPostCard = ({ sharedPost }) => {
  if (!sharedPost) return null;

  const renderSharedMedia = () => {
    if (sharedPost.shared_post_type === 'image' && sharedPost.shared_image) {
      return (
        <div className="mt-3">
          <img
            src={`http://localhost:3001/uploads/${sharedPost.shared_image}`}
            alt="Shared content"
            className="w-full max-h-64 object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => window.open(`http://localhost:3001/uploads/${sharedPost.shared_image}`, '_blank')}
          />
        </div>
      );
    }

    if (sharedPost.shared_post_type === 'video' && sharedPost.shared_video) {
      return (
        <div className="mt-3">
          <video
            src={`http://localhost:3001/uploads/${sharedPost.shared_video}`}
            controls
            className="w-full max-h-64 rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return null;
  };

  // Show debug info temporarily
  if (!sharedPost.shared_username && !sharedPost.shared_content) {
    return (
      <div className="mt-3 border border-red-200 rounded-lg p-4 bg-red-50">
        <p className="text-red-600 text-sm">Original post not found or deleted</p>
      </div>
    );
  }

  return (
    <div className="mt-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center space-x-2 mb-3">
        <Avatar 
          src={sharedPost.shared_avatar}
          username={sharedPost.shared_username}
          size="sm"
        />
        <div>
          <div className="font-semibold text-gray-900 text-sm">{sharedPost.shared_username}</div>
        </div>
      </div>
      
      {sharedPost.shared_content && (
        <p className="text-gray-700 text-sm mb-2 whitespace-pre-wrap">{sharedPost.shared_content}</p>
      )}
      
      {renderSharedMedia()}
    </div>
  );
};

export default SharedPostCard;