import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import PostCard from '../components/social/PostCard';
import EditProfileModal from '../components/social/EditProfileModal';

const ProfilePage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user, token } = useAuth();

  const isOwnProfile = !userId || parseInt(userId) === user?.id;
  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [targetUserId, token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/social/profile/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/social/posts/user/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverPhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('cover', file);

    try {
      const response = await fetch('http://localhost:3001/api/social/profile/cover', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => ({ ...prev, cover_photo: result.cover_photo }));
      }
    } catch (error) {
      console.error('Error updating cover photo:', error);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Cover Photo & Profile Header */}
        <div className="bg-white shadow-sm">
          {/* Cover Photo */}
          <div className="relative h-80 bg-gradient-to-r from-indigo-500 to-purple-600">
            {profile.cover_photo && (
              <img
                src={`http://localhost:3001/uploads/${profile.cover_photo}`}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            {isOwnProfile && (
              <div className="absolute bottom-4 right-4">
                <input
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="cover-upload"
                  className="px-4 py-2 bg-white bg-opacity-90 text-gray-700 rounded-lg cursor-pointer hover:bg-opacity-100 transition-all flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Edit Cover Photo</span>
                </label>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-20">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 border-4 border-white rounded-full overflow-hidden bg-white">
                  <Avatar 
                    src={profile.avatar}
                    username={profile.username}
                    size="xl"
                    className="w-full h-full"
                  />
                </div>
                {isOwnProfile && (
                  <button className="absolute bottom-2 right-2 w-8 h-8 bg-gray-800 bg-opacity-70 text-white rounded-full flex items-center justify-center hover:bg-opacity-80">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1 mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>
                    <p className="text-gray-600 text-lg">{profile.email}</p>
                    {profile.bio && (
                      <p className="text-gray-700 mt-2">{profile.bio}</p>
                    )}
                  </div>
                  
                  {isOwnProfile ? (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="mt-4 sm:mt-0 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                      <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Add Friend
                      </button>
                      <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        Message
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                  {profile.location && (
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-6 0h6m-6 0V7a2 2 0 012-2h2a2 2 0 012 2v4" />
                    </svg>
                    <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-6 px-4 pb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isOwnProfile ? 'Your Posts' : `${profile.username}'s Posts`}
          </h2>
          
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  onLike={handlePostLikeToggle}
                  onComment={handleNewComment}
                  onDelete={handlePostDeleted}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M5 11V9a2 2 0 012-2h10a2 2 0 012 2v2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">
                {isOwnProfile ? 
                  "You haven't shared any posts yet. Create your first post to share your thoughts!" :
                  `${profile.username} hasn't shared any posts yet.`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={setProfile}
        />
      )}
    </div>
  );
};

export default ProfilePage;