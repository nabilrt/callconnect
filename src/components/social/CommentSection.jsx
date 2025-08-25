import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const CommentSection = ({ postId, comments, setComments, onComment }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:3001/api/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: newComment.trim() }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [...prev, newCommentData]);
        setNewComment('');
        
        if (onComment) {
          onComment({ postId });
        }
      } else {
        console.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/social/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      } else {
        console.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="px-4 pb-4">
      {/* Existing Comments */}
      {comments.length > 0 && (
        <div className="space-y-3 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <Avatar 
                src={comment.avatar}
                username={comment.username}
                size="sm"
              />
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                      {comment.username}
                    </span>
                    {comment.user_id === user?.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-500 text-xs ml-2"
                        title="Delete comment"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="text-gray-900 text-sm">{comment.comment}</p>
                </div>
                <div className="flex items-center space-x-4 mt-1 ml-3">
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(comment.created_at)}
                  </span>
                  <button className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                    Like
                  </button>
                  <button className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment */}
      <form onSubmit={handleSubmitComment} className="flex space-x-3">
        <Avatar 
          src={user?.avatar}
          username={user?.username}
          size="sm"
        />
        <div className="flex-1 flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            disabled={isSubmitting}
          />
          {newComment.trim() && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Post'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CommentSection;