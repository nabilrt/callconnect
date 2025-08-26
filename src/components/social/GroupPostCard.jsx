import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const GroupPostCard = ({ post, group, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, token } = useAuth();

  const canDelete = user?.id === post.user_id;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/social/groups/${group.id}/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onDelete(post.id);
      }
    } catch (error) {
      console.error('Error deleting group post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = (now - date) / (1000 * 60);
      return diffInMinutes < 1 ? 'now' : `${Math.floor(diffInMinutes)}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar 
            src={post.avatar}
            username={post.username}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{post.username}</h3>
            <p className="text-sm text-gray-500">{formatTimestamp(post.created_at)}</p>
          </div>
        </div>
        
        {canDelete && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {showMenu && (
              <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {post.post_type === 'image' && post.image && (
        <div className="px-4 pb-3">
          <img 
            src={`http://localhost:3001/uploads/${post.image}`}
            alt="Post image"
            className="w-full rounded-lg max-h-96 object-cover"
          />
        </div>
      )}

      {post.post_type === 'video' && post.video && (
        <div className="px-4 pb-3">
          <video 
            src={`http://localhost:3001/uploads/${post.video}`}
            controls
            className="w-full rounded-lg max-h-96"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Like</span>
            {post.likes_count > 0 && <span>({post.likes_count})</span>}
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Comment</span>
            {post.comments_count > 0 && <span>({post.comments_count})</span>}
          </button>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default GroupPostCard;