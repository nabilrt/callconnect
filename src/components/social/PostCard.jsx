import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import CommentSection from './CommentSection';

const PostCard = ({ post, onLike, onComment, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { user, token } = useAuth();

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await fetch(`http://localhost:3001/api/social/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        // The socket event will update the UI
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/social/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // The socket event will update the UI
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
    setShowMenu(false);
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/social/posts/${post.id}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleShowComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const renderMedia = () => {
    if (post.post_type === 'image' && post.image) {
      return (
        <div className="mt-3">
          <img
            src={`http://localhost:3001/uploads/${post.image}`}
            alt="Post content"
            className="w-full max-h-96 object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => window.open(`http://localhost:3001/uploads/${post.image}`, '_blank')}
          />
        </div>
      );
    }

    if (post.post_type === 'video' && post.video) {
      return (
        <div className="mt-3">
          <video
            src={`http://localhost:3001/uploads/${post.video}`}
            controls
            className="w-full max-h-96 rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return null;
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'public':
        return <span className="text-gray-500" title="Public">🌍</span>;
      case 'friends':
        return <span className="text-gray-500" title="Friends only">👥</span>;
      case 'private':
        return <span className="text-gray-500" title="Only me">🔒</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 animate-fade-in-up">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar 
              src={post.avatar}
              username={post.username}
              size="md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 hover:underline cursor-pointer">
                  {post.username}
                </h3>
                {getPrivacyIcon(post.privacy)}
              </div>
              <p className="text-sm text-gray-500">{formatTimestamp(post.created_at)}</p>
            </div>
          </div>

          {/* Menu Button */}
          {post.author_id === user?.id && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        {post.content && (
          <p className="text-gray-900 whitespace-pre-wrap mb-2">{post.content}</p>
        )}
        {renderMedia()}
      </div>

      {/* Stats */}
      {(post.likes_count > 0 || post.comments_count > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-b border-gray-100">
          {post.likes_count > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-red-500">❤️</span>
              <span>{post.likes_count}</span>
            </div>
          )}
          {post.comments_count > 0 && (
            <button
              onClick={handleShowComments}
              className="hover:underline"
            >
              {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 flex items-center justify-around border-b border-gray-100">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            post.user_liked > 0
              ? 'text-red-500 bg-red-50 hover:bg-red-100'
              : 'text-gray-600 hover:bg-gray-100'
          } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg 
            className={`w-5 h-5 ${post.user_liked > 0 ? 'fill-current' : ''}`} 
            fill={post.user_liked > 0 ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="font-medium">{post.user_liked > 0 ? 'Liked' : 'Like'}</span>
        </button>

        <button
          onClick={handleShowComments}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="font-medium">Comment</span>
        </button>

        <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span className="font-medium">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={comments}
          setComments={setComments}
          onComment={onComment}
        />
      )}
    </div>
  );
};

export default PostCard;