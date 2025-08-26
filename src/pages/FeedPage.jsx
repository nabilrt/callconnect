import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/social/PostCard';
import CreatePost from '../components/social/CreatePost';
import Stories from '../components/social/Stories';
import FriendDiscovery from '../components/friends/FriendDiscovery';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { token, socket } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_post', handleNewPost);
    socket.on('post_like_toggle', handlePostLikeToggle);
    socket.on('new_comment', handleNewComment);
    socket.on('post_deleted', handlePostDeleted);

    return () => {
      socket.off('new_post');
      socket.off('post_like_toggle');
      socket.off('new_comment');
      socket.off('post_deleted');
    };
  }, [socket]);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/social/posts?limit=20&page=${pageNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const newPosts = await response.json();
        if (pageNum === 1) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        setHasMore(newPosts.length === 20);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostLikeToggle = ({ postId, userId, action, liked }) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newLikesCount = action === 'liked' 
          ? post.likes_count + 1 
          : post.likes_count - 1;
        return {
          ...post,
          likes_count: newLikesCount,
          user_liked: liked ? 1 : 0
        };
      }
      return post;
    }));
  };

  const handleNewComment = ({ postId }) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments_count: post.comments_count + 1
        };
      }
      return post;
    }));
  };

  const handlePostDeleted = ({ postId }) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-6">
          {/* Main Feed Container */}
          <div className="flex-1 max-w-2xl">
        {/* Stories Section */}
        <Stories />

        {/* Create Post Section */}
        <CreatePost onPostCreated={handleNewPost} />

        {/* Posts Feed */}
        <div className="space-y-4 mt-6">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
              onLike={handlePostLikeToggle}
              onComment={handleNewComment}
              onDelete={handlePostDeleted}
            />
          ))}

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {!loading && hasMore && (
            <div className="flex justify-center py-4">
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Load More Posts
              </button>
            </div>
          )}

          {!loading && !hasMore && posts.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              You're all caught up! No more posts to show.
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M5 11V9a2 2 0 012-2h10a2 2 0 012 2v2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">Be the first to share something with your friends!</p>
            </div>
          )}
          </div>
          </div>
          
          {/* Right Sidebar - Friend Discovery */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-20">
              <FriendDiscovery />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;