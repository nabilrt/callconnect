import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const GroupPostCard = ({ post, group, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [userLiked, setUserLiked] = useState(post.user_liked > 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
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

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await fetch(`http://localhost:3001/api/social/groups/${group.id}/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setUserLiked(result.liked);
        setLikesCount(prev => result.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error toggling group post like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/social/groups/${group.id}/posts/${post.id}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error('Error fetching group post comments:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/social/groups/${group.id}/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [...prev, comment]);
        setCommentsCount(prev => prev + 1);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error creating group post comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      fetchComments();
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
          <button 
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              userLiked 
                ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                : 'text-gray-600 hover:bg-gray-100'
            } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-5 h-5" fill={userLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Like</span>
            {likesCount > 0 && <span>({likesCount})</span>}
          </button>
          
          <button 
            onClick={toggleComments}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Comment</span>
            {commentsCount > 0 && <span>({commentsCount})</span>}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-200">
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mt-3 mb-4">
            <div className="flex space-x-3">
              <Avatar 
                src={user?.avatar}
                username={user?.username}
                size="sm"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="2"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isCommenting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {isCommenting ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar 
                  src={comment.avatar}
                  username={comment.username}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm">{comment.username}</span>
                      <span className="text-xs text-gray-500">{formatTimestamp(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-900">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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