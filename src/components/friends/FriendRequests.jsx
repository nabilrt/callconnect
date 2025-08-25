import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const FriendRequests = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, socket } = useAuth();

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_friend_request', handleNewFriendRequest);
    socket.on('friend_request_responded', handleFriendRequestResponse);

    return () => {
      socket.off('new_friend_request');
      socket.off('friend_request_responded');
    };
  }, [socket]);

  const fetchFriendRequests = async () => {
    try {
      const [receivedResponse, sentResponse] = await Promise.all([
        fetch('http://localhost:3001/api/auth/friend-requests?type=received', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('http://localhost:3001/api/auth/friend-requests?type=sent', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (receivedResponse.ok && sentResponse.ok) {
        const received = await receivedResponse.json();
        const sent = await sentResponse.json();
        setReceivedRequests(received);
        setSentRequests(sent);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewFriendRequest = (request) => {
    setReceivedRequests(prev => [request, ...prev]);
  };

  const handleFriendRequestResponse = (response) => {
    setSentRequests(prev => 
      prev.filter(req => req.receiver_id !== response.responder_id)
    );
  };

  const respondToRequest = async (requestId, status, senderId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/auth/friend-request/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setReceivedRequests(prev => prev.filter(req => req.request_id !== requestId));
        
        if (socket) {
          socket.emit('friend_request_response', { senderId, status });
        }
      }
    } catch (error) {
      console.error('Error responding to friend request:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Received Requests */}
      {receivedRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Friend Requests ({receivedRequests.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {receivedRequests.map((request) => (
              <div key={request.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar 
                      src={request.avatar}
                      username={request.username}
                      size="md"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{request.username}</h4>
                      <p className="text-sm text-gray-500">{request.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => respondToRequest(request.request_id, 'accepted', request.sender_id)}
                      variant="success"
                      size="sm"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => respondToRequest(request.request_id, 'rejected', request.sender_id)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-red-600"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              Sent Requests ({sentRequests.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {sentRequests.map((request) => (
              <div key={request.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar 
                      src={request.avatar}
                      username={request.username}
                      size="md"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{request.username}</h4>
                      <p className="text-sm text-gray-500">{request.email}</p>
                    </div>
                  </div>
                  
                  <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {receivedRequests.length === 0 && sentRequests.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Friend Requests</h3>
          <p className="text-gray-500">When you receive friend requests, they'll appear here.</p>
        </div>
      )}
    </div>
  );
};

export default FriendRequests;