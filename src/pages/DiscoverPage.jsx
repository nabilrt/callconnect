import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const DiscoverPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());
  const [friends, setFriends] = useState(new Set());
  
  const { token, socket, user } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchSentRequests();
    fetchFriends();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/friend-requests?type=sent', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const requestIds = new Set(data.map(req => req.receiver_id));
        setSentRequests(requestIds);
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/friends', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const friendIds = new Set(data.map(friend => friend.id));
        setFriends(friendIds);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const sendFriendRequest = async (receiverId) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId }),
      });

      if (response.ok) {
        setSentRequests(prev => new Set(prev.add(receiverId)));
        
        if (socket) {
          socket.emit('friend_request_sent', { receiverId });
        }
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-10 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Discover People</h1>
        <p className="text-gray-600">Find and connect with new friends</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Users Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {searchTerm ? `Search Results (${filteredUsers.length})` : `All Users (${users.length})`}
          </h2>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No users found' : 'No users available'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new users'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredUsers.map((discoveredUser) => (
              <div key={discoveredUser.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar 
                    src={discoveredUser.avatar}
                    username={discoveredUser.username}
                    size="lg"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{discoveredUser.username}</h3>
                    <p className="text-sm text-gray-500 truncate">{discoveredUser.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Joined {new Date(discoveredUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  {friends.has(discoveredUser.id) ? (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span className="text-sm font-medium">Friends</span>
                    </div>
                  ) : sentRequests.has(discoveredUser.id) ? (
                    <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      <span className="text-sm font-medium">Request Sent</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => sendFriendRequest(discoveredUser.id)}
                      variant="primary"
                      className="flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add Friend</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;