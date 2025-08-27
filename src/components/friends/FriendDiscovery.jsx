import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import FeedbackModal from '../ui/FeedbackModal';

const FriendDiscovery = () => {
  const navigate = useNavigate();
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingRequests, setSendingRequests] = useState(new Set());
  const [sentRequests, setSentRequests] = useState(new Set());
  const [receivedRequests, setReceivedRequests] = useState(new Set());
  const [friendsSet, setFriendsSet] = useState(new Set());
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '' });
  const { token, user } = useAuth();

  useEffect(() => {
    fetchSuggestedFriends();
    fetchFriendRequests();
  }, [token]);

  const fetchSuggestedFriends = async () => {
    try {
      setLoading(true);
      
      // Fetch all users
      const usersResponse = await fetch('http://localhost:3001/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (usersResponse.ok) {
        const allUsers = await usersResponse.json();
        
        // Get current user's friends
        let friendIds = new Set();
        try {
          const friendsResponse = await fetch('http://localhost:3001/api/auth/friends', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (friendsResponse.ok) {
            const friends = await friendsResponse.json();
            friendIds = new Set(friends.map(friend => friend.id));
            setFriendsSet(friendIds);
          }
        } catch (friendsError) {
          console.log('Could not fetch friends, showing all users');
        }
        
        // Filter users to show as suggestions (exclude current user and existing friends)
        const suggestions = allUsers
          .filter(suggestedUser => 
            suggestedUser.id !== user?.id && 
            !friendIds.has(suggestedUser.id)
          )
          .slice(0, 10); // Limit to 10 suggestions
        
        setSuggestedFriends(suggestions);
      } else {
        console.error('Users API responded with:', usersResponse.status);
        setSuggestedFriends([]);
      }
    } catch (error) {
      console.error('Error fetching suggested friends:', error);
      // Check if it's a connection error
      if (error.message === 'Failed to fetch' || error.code === 'CONNECTION_REFUSED') {
        console.log('Backend server appears to be offline');
      }
      setSuggestedFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId) => {
    try {
      setSendingRequests(prev => new Set(prev).add(friendId));
      
      const response = await fetch('http://localhost:3001/api/auth/friend-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId: friendId }),
      });

      if (response.ok) {
        // Mark the user as having a sent request
        setSentRequests(prev => new Set(prev).add(friendId));
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Friend Request Sent!',
          message: 'Your friend request has been sent successfully.'
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Failed to Send Request',
          message: errorData.error || 'Failed to send friend request. Please try again.'
        });
      }
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Connection Error',
          message: 'Cannot connect to server. Please check your internet connection and try again.'
        });
      } else {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Request Failed',
          message: 'Failed to send friend request. Please try again.'
        });
      }
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendId);
        return newSet;
      });
    }
  };

  const fetchFriendRequests = async () => {
    try {
      // Fetch sent requests
      const sentResponse = await fetch('http://localhost:3001/api/auth/friend-requests?type=sent', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (sentResponse.ok) {
        const sentReqs = await sentResponse.json();
        setSentRequests(new Set(sentReqs.map(req => req.receiver_id)));
      }
      
      // Fetch received requests
      const receivedResponse = await fetch('http://localhost:3001/api/auth/friend-requests?type=received', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (receivedResponse.ok) {
        const receivedReqs = await receivedResponse.json();
        setReceivedRequests(new Set(receivedReqs.map(req => req.sender_id)));
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const respondToFriendRequest = async (senderId, status) => {
    try {
      // First get the request ID for this sender
      const receivedResponse = await fetch('http://localhost:3001/api/auth/friend-requests?type=received', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (receivedResponse.ok) {
        const receivedRequests = await receivedResponse.json();
        const request = receivedRequests.find(req => req.sender_id === senderId);
        
        if (request) {
          const response = await fetch(`http://localhost:3001/api/auth/friend-request/${request.request_id}/respond`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
          });

          if (response.ok) {
            setReceivedRequests(prev => {
              const newSet = new Set(prev);
              newSet.delete(senderId);
              return newSet;
            });
            
            if (status === 'accepted') {
              setFriendsSet(prev => new Set(prev).add(senderId));
              setModal({
                isOpen: true,
                type: 'success',
                title: 'Friend Request Accepted!',
                message: 'You are now friends!'
              });
            } else {
              setModal({
                isOpen: true,
                type: 'info',
                title: 'Friend Request Rejected',
                message: 'Friend request has been rejected.'
              });
            }
          } else {
            setModal({
              isOpen: true,
              type: 'error',
              title: 'Action Failed',
              message: `Failed to ${status === 'accepted' ? 'accept' : 'reject'} friend request.`
            });
          }
        }
      }
    } catch (error) {
      console.error('Error responding to friend request:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Request Failed',
        message: 'Failed to respond to friend request. Please try again.'
      });
    }
  };

  const handleUsernameClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const getButtonForUser = (friend) => {
    if (friendsSet.has(friend.id)) {
      return (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span className="text-xs font-medium">Friends</span>
        </div>
      );
    }
    
    if (sentRequests.has(friend.id)) {
      return (
        <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <span className="text-xs font-medium">Sent</span>
        </div>
      );
    }
    
    if (receivedRequests.has(friend.id)) {
      return (
        <div className="flex space-x-1">
          <button
            onClick={() => respondToFriendRequest(friend.id, 'accepted')}
            className="px-2 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => respondToFriendRequest(friend.id, 'rejected')}
            className="px-2 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            Reject
          </button>
        </div>
      );
    }
    
    return (
      <button
        onClick={() => sendFriendRequest(friend.id)}
        disabled={sendingRequests.has(friend.id)}
        className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
      >
        {sendingRequests.has(friend.id) ? 'Sending...' : 'Add'}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">People You May Know</h3>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : suggestedFriends.length > 0 ? (
        <div className="space-y-3">
          {suggestedFriends.slice(0, 5).map((friend) => (
            <div key={friend.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar 
                  src={friend.avatar} 
                  alt={friend.username} 
                  size="sm"
                />
                <div>
                  <p 
                    className="font-medium text-gray-900 text-sm hover:underline cursor-pointer"
                    onClick={() => handleUsernameClick(friend.id)}
                  >
                    {friend.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {friend.mutualFriends > 0 ? `${friend.mutualFriends} mutual friends` : 'New to SocialHub'}
                  </p>
                </div>
              </div>
              {getButtonForUser(friend)}
            </div>
          ))}
          
          {suggestedFriends.length > 5 && (
            <button className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2">
              See All Suggestions
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm text-gray-500">No friend suggestions available</p>
        </div>
      )}

      <FeedbackModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
};

export default FriendDiscovery;