import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import PostCard from '../components/social/PostCard';
import CreatePost from '../components/social/CreatePost';
import EditProfileModal from '../components/social/EditProfileModal';

const ProfilePage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const { user, token, socket, updateAvatar } = useAuth();

  const isOwnProfile = !userId || parseInt(userId) === user?.id;
  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchUserPosts();
      if (!isOwnProfile) {
        checkFriendshipStatus();
      }
    }
  }, [targetUserId, token]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('new_post', handleNewPost);
    socket.on('post_deleted', handlePostDeleted);
    socket.on('post_like_toggle', handlePostLikeToggle);
    socket.on('new_comment', handleNewComment);

    return () => {
      socket.off('new_post');
      socket.off('post_deleted');
      socket.off('post_like_toggle');
      socket.off('new_comment');
    };
  }, [socket]);

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

  const checkFriendshipStatus = async () => {
    try {
      // First try to get friend status from the friends list
      try {
        const friendsResponse = await fetch('http://localhost:3001/api/auth/friends', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (friendsResponse.ok) {
          const friends = await friendsResponse.json();
          const isFriend = friends.some(friend => friend.id === parseInt(targetUserId));
          
          if (isFriend) {
            setFriendshipStatus({ status: 'friends' });
            return;
          }
        }
      } catch (friendsError) {
        console.log('Could not fetch friends list');
      }

      // Try to get friend requests to check if there's a pending request
      try {
        const sentRequestsResponse = await fetch('http://localhost:3001/api/auth/friend-requests?type=sent', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (sentRequestsResponse.ok) {
          const sentRequests = await sentRequestsResponse.json();
          const hasSentRequest = sentRequests.some(req => req.receiver_id === parseInt(targetUserId));
          
          if (hasSentRequest) {
            setFriendshipStatus({ status: 'pending_sent' });
            return;
          }
        }
      } catch (sentError) {
        console.log('Could not fetch sent requests');
      }

      // Try to get received requests
      try {
        const receivedRequestsResponse = await fetch('http://localhost:3001/api/auth/friend-requests?type=received', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (receivedRequestsResponse.ok) {
          const receivedRequests = await receivedRequestsResponse.json();
          const hasReceivedRequest = receivedRequests.some(req => req.sender_id === parseInt(targetUserId));
          
          if (hasReceivedRequest) {
            setFriendshipStatus({ status: 'pending_received' });
            return;
          }
        }
      } catch (receivedError) {
        console.log('Could not fetch received requests');
      }

      // Default to no friendship
      setFriendshipStatus({ status: 'none' });
      
    } catch (error) {
      console.error('Error checking friendship status:', error);
      // Default to no friendship on error
      setFriendshipStatus({ status: 'none' });
    }
  };

  const sendFriendRequest = async () => {
    try {
      setSendingRequest(true);
      
      const response = await fetch('http://localhost:3001/api/auth/friend-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId: targetUserId }),
      });

      if (response.ok) {
        setFriendshipStatus({ status: 'pending_sent' });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to send friend request' }));
        alert(errorData.error || 'Failed to send friend request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      if (error.message === 'Failed to fetch') {
        alert('Cannot connect to server. Please check your internet connection and try again.');
      } else {
        alert('Failed to send friend request. Please try again.');
      }
    } finally {
      setSendingRequest(false);
    }
  };

  const acceptFriendRequest = async () => {
    try {
      // First get the received requests to find the request ID
      const receivedRequestsResponse = await fetch('http://localhost:3001/api/auth/friend-requests?type=received', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (receivedRequestsResponse.ok) {
        const receivedRequests = await receivedRequestsResponse.json();
        const request = receivedRequests.find(req => req.sender_id === parseInt(targetUserId));
        
        if (request) {
          const response = await fetch(`http://localhost:3001/api/auth/friend-request/${request.request_id}/respond`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'accepted' }),
          });

          if (response.ok) {
            setFriendshipStatus({ status: 'friends' });
          }
        }
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const removeFriend = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/auth/friends/${targetUserId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFriendshipStatus({ status: 'none' });
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleCoverPhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Please choose a file smaller than 10MB.');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

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
        // Show success message briefly
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-[9999]';
        successDiv.textContent = 'Cover photo updated successfully!';
        document.body.appendChild(successDiv);
        setTimeout(() => document.body.removeChild(successDiv), 3000);
      } else {
        const errorData = await response.json();
        console.error('Failed to update cover photo:', errorData);
        alert('Failed to update cover photo. Please try again.');
      }
    } catch (error) {
      console.error('Error updating cover photo:', error);
      alert('An error occurred while updating the cover photo.');
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please choose a file smaller than 5MB.');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    try {
      const result = await updateAvatar(file);
      
      if (result.success) {
        // Update local profile state
        setProfile(prev => ({ ...prev, avatar: result.avatar }));
        // Show success message briefly
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-[9999]';
        successDiv.textContent = 'Profile picture updated successfully!';
        document.body.appendChild(successDiv);
        setTimeout(() => document.body.removeChild(successDiv), 3000);
      } else {
        console.error('Failed to update avatar:', result.error);
        alert('Failed to update profile picture. Please try again.');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('An error occurred while updating the profile picture.');
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

  const handleNewPost = (newPost) => {
    // Only add the post if it's from the profile being viewed
    if (newPost.author_id === parseInt(targetUserId)) {
      setPosts(prev => [newPost, ...prev]);
    }
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

  // Privacy logic
  const canViewPosts = isOwnProfile || 
    profile.privacy_setting === 'public' || 
    (profile.privacy_setting === 'friends' && friendshipStatus?.status === 'friends');

  const canViewFullProfile = isOwnProfile || 
    profile.privacy_setting === 'public' || 
    (profile.privacy_setting === 'friends' && friendshipStatus?.status === 'friends');

  const renderFriendButton = () => {
    if (isOwnProfile) return null;

    switch (friendshipStatus?.status) {
      case 'friends':
        return (
          <button 
            onClick={removeFriend}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Unfriend
          </button>
        );
      case 'pending_sent':
        return (
          <button 
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm cursor-not-allowed"
          >
            Request Sent
          </button>
        );
      case 'pending_received':
        return (
          <button 
            onClick={acceptFriendRequest}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Accept Request
          </button>
        );
      default:
        return (
          <button 
            onClick={sendFriendRequest}
            disabled={sendingRequest}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
          >
            {sendingRequest ? 'Sending...' : 'Add Friend'}
          </button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Cover Photo & Profile Header */}
        <div className="bg-white shadow-sm rounded-b-lg overflow-hidden mb-4">
          {/* Cover Photo */}
          <div className="relative h-64 sm:h-80 bg-gradient-to-r from-indigo-500 to-purple-600">
            {profile.cover_photo && (
              <img
                src={`http://localhost:3001/uploads/${profile.cover_photo}`}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            {isOwnProfile && (
              <div className="absolute top-4 right-4 z-20">
                <input
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="cover-upload"
                  className="px-4 py-2 bg-black/60 text-white rounded-lg cursor-pointer hover:bg-black/70 transition-all flex items-center space-x-2 shadow-lg backdrop-blur-sm font-medium"
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
          <div className="relative bg-white px-4 sm:px-6 pt-12 pb-8">
            {/* Background overlay to ensure full white background */}
            <div className="absolute inset-0 bg-white -mt-8"></div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-12 sm:-mt-14">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                <div className="border-4 border-white rounded-full shadow-lg bg-white">
                  <Avatar 
                    src={profile.avatar}
                    username={profile.username}
                    size="2xl"
                    className="border-0 shadow-none"
                  />
                </div>
                {isOwnProfile && (
                  <>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-2 right-2 w-8 h-8 bg-gray-800 bg-opacity-70 text-white rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </label>
                  </>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1 mt-6 sm:mt-4 sm:pb-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{profile.username}</h1>
                    <p className="text-gray-600 text-sm sm:text-base mt-1">{profile.email}</p>
                    {profile.bio && (
                      <p className="text-gray-700 mt-2 text-sm sm:text-base max-w-lg">{profile.bio}</p>
                    )}
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex-shrink-0">
                    {isOwnProfile ? (
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex space-x-3">
                        {renderFriendButton()}
                        {friendshipStatus?.status === 'friends' && (
                          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                            Message
                          </button>
                        )}
                      </div>
                    )}
                  </div>
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
          
          {/* Create Post - Only show on own profile */}
          {isOwnProfile && (
            <div className="mb-6">
              <CreatePost onPostCreated={handleNewPost} />
            </div>
          )}
          
          {canViewPosts ? (
            posts.length > 0 ? (
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
              <p className="text-gray-500 mb-4">
                {isOwnProfile ? 
                  "You haven't shared any posts yet. Create your first post to share your thoughts!" :
                  `${profile.username} hasn't shared any posts yet.`
                }
              </p>
              {isOwnProfile && (
                <button 
                  onClick={() => document.getElementById('post-textarea')?.focus()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create Your First Post
                </button>
              )}
            </div>
            )
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Private Profile</h3>
              <p className="text-gray-500 mb-4">
                This user's posts are private. You need to be friends to see their content.
              </p>
              {friendshipStatus?.status !== 'friends' && renderFriendButton()}
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