import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import GroupChatWindow from '../components/social/GroupChatWindow';
import GroupCreatePost from '../components/social/GroupCreatePost';
import GroupPostCard from '../components/social/GroupPostCard';

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const { token, socket } = useAuth();

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchMembers();
      fetchPosts();
    }
  }, [groupId, token]);

  useEffect(() => {
    if (socket && groupId) {
      // Join group room for real-time updates
      socket.emit('join_group', parseInt(groupId));

      socket.on('user_joined_group', handleUserJoined);
      socket.on('user_left_group', handleUserLeft);
      socket.on('new_group_post', handleNewGroupPost);
      socket.on('group_post_deleted', handleGroupPostDeleted);

      return () => {
        socket.emit('leave_group', parseInt(groupId));
        socket.off('user_joined_group');
        socket.off('user_left_group');
        socket.off('new_group_post');
        socket.off('group_post_deleted');
      };
    }
  }, [socket, groupId]);

  const fetchGroup = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/social/groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const groupData = await response.json();
        setGroup(groupData);
      }
    } catch (error) {
      console.error('Error fetching group:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/social/groups/${groupId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const membersData = await response.json();
        setMembers(membersData);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserJoined = ({ groupId: eventGroupId, userId, username }) => {
    if (parseInt(eventGroupId) === parseInt(groupId)) {
      // Refresh members list
      fetchMembers();
    }
  };

  const handleUserLeft = ({ groupId: eventGroupId, userId, username }) => {
    if (parseInt(eventGroupId) === parseInt(groupId)) {
      // Refresh members list
      fetchMembers();
    }
  };

  const handleJoinGroup = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/social/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchGroup();
        fetchMembers();
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/social/groups/${groupId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchGroup();
        fetchMembers();
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/social/groups/${groupId}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching group posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleNewGroupPost = (newPost) => {
    if (parseInt(newPost.group_id) === parseInt(groupId)) {
      setPosts(prev => [newPost, ...prev]);
    }
  };

  const handleGroupPostDeleted = ({ postId }) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Group not found</h2>
          <p className="text-gray-600">The group you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Group Header */}
        <div className="bg-white shadow-sm">
          {/* Cover Image */}
          <div className="relative h-64 bg-gradient-to-r from-indigo-500 to-purple-600">
            {group.image && (
              <img
                src={`http://localhost:3001/uploads/${group.image}`}
                alt={group.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Group Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-20">
              {/* Group Avatar */}
              <div className="relative">
                <div className="w-32 h-32 border-4 border-white rounded-xl overflow-hidden bg-white">
                  {group.image ? (
                    <img
                      src={`http://localhost:3001/uploads/${group.image}`}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-0 flex space-x-3">
                {group.user_role ? (
                  <>
                    <button
                      onClick={() => setShowChat(true)}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Group Chat
                    </button>
                    {group.user_role !== 'admin' && (
                      <button
                        onClick={handleLeaveGroup}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Leave Group
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleJoinGroup}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Join Group
                  </button>
                )}
              </div>
            </div>

            {/* Group Details */}
            <div className="mt-4">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  group.privacy === 'public' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {group.privacy === 'public' ? '🌍 Public' : '🔒 Private'}
                </span>
              </div>
              
              {group.description && (
                <p className="text-gray-700 text-lg mb-4">{group.description}</p>
              )}

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>{group.members_count} {group.members_count === 1 ? 'member' : 'members'}</span>
                <span>Created by {group.creator_name}</span>
                <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        {group.user_role && (
          <div className="mt-6 px-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Posts</h2>
            
            {/* Create Post - Only for members */}
            <GroupCreatePost group={group} onPostCreated={handlePostCreated} />
            
            {/* Posts List */}
            {postsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div>
                {posts.map((post) => (
                  <GroupPostCard 
                    key={post.id} 
                    post={post}
                    group={group}
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
                <p className="text-gray-500 mb-6">Be the first to share something in this group!</p>
              </div>
            )}
          </div>
        )}

        {/* Members Section */}
        <div className="mt-6 px-4 pb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Members ({members.length})</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div key={member.user_id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <Avatar 
                      src={member.avatar}
                      username={member.username}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{member.username}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          member.role === 'admin' 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : member.role === 'moderator'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role === 'admin' && '👑'} 
                          {member.role === 'moderator' && '🛡️'} 
                          {member.role}
                        </span>
                        <span className="text-xs text-gray-500">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No members to show</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Group Chat Window */}
      {showChat && (
        <GroupChatWindow 
          group={group}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default GroupDetailPage;