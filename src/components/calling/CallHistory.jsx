import React, { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Video, Clock, PhoneCall } from 'lucide-react';
import Avatar from '../ui/Avatar';
import callHistoryService from '../../services/callHistoryService';
import { useAuth } from '../../context/AuthContext';

const CallHistory = () => {
  const { user } = useAuth();
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCallHistory();
  }, []);

  const loadCallHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const history = await callHistoryService.getUserCallHistory();
      setCallHistory(history);
    } catch (error) {
      console.error('Error loading call history:', error);
      setError('Failed to load call history');
      setCallHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (seconds === 0) return 'No answer';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCallTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      // This week
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      // Older
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getCallTypeIcon = (callType, callDirection, status) => {
    const iconSize = 16;
    const baseClasses = "flex-shrink-0";
    
    if (callType === 'video') {
      return <Video size={iconSize} className={`${baseClasses} text-purple-500`} />;
    }
    
    // Audio calls - different icons based on direction and status
    if (callDirection === 'outgoing') {
      return (
        <PhoneOutgoing 
          size={iconSize} 
          className={`${baseClasses} ${status === 'completed' ? 'text-green-500' : 'text-red-500'}`} 
        />
      );
    } else {
      return (
        <PhoneIncoming 
          size={iconSize} 
          className={`${baseClasses} ${status === 'completed' ? 'text-blue-500' : 'text-red-500'}`} 
        />
      );
    }
  };

  const startNewCall = (userId, username, callType) => {
    if (window.startCall) {
      window.startCall(userId, username, callType);
    }
  };

  const groupCallsByDate = (calls) => {
    const groups = {};
    
    calls.forEach(call => {
      const date = new Date(call.timestamp);
      const today = new Date();
      const diffTime = today - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      let groupKey;
      if (diffDays === 0) {
        groupKey = 'Today';
      } else if (diffDays === 1) {
        groupKey = 'Yesterday';
      } else if (diffDays < 7) {
        groupKey = 'This Week';
      } else if (diffDays < 30) {
        groupKey = 'This Month';
      } else {
        groupKey = 'Older';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(call);
    });
    
    return groups;
  };

  const groupedCalls = groupCallsByDate(callHistory);
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="mr-2" size={24} />
              Call History
            </h1>
          </div>
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading call history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="mr-2" size={24} />
              Call History
            </h1>
          </div>
          <div className="p-6 text-center">
            <PhoneCall size={64} className="mx-auto text-red-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading call history</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={loadCallHistory}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (callHistory.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="mr-2" size={24} />
              Call History
            </h1>
          </div>
          <div className="text-center py-12">
            <PhoneCall size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No call history</h3>
            <p className="text-gray-500">Your call history will appear here after you make or receive calls.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            <Clock className="mr-2" size={24} />
            Call History
          </h1>
        </div>
        
        <div className="divide-y divide-gray-100">
          {groupOrder.map(groupName => {
            if (!groupedCalls[groupName]) return null;
            
            return (
              <div key={groupName} className="p-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  {groupName}
                </h3>
                
                <div className="space-y-3">
                  {groupedCalls[groupName].map((call, index) => {
                    const otherParticipant = call.direction === 'outgoing' 
                      ? { id: call.receiverId, username: call.receiverUsername }
                      : { id: call.callerId, username: call.callerUsername };
                    
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          {getCallTypeIcon(call.callType, call.direction, call.status)}
                          
                          <Avatar
                            username={otherParticipant.username}
                            userId={otherParticipant.id}
                            size="sm"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {otherParticipant.username}
                              </p>
                              {call.callType === 'video' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  Video
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{formatCallTime(call.timestamp)}</span>
                              <span>•</span>
                              <span>{formatDuration(call.duration)}</span>
                              {call.status === 'missed' && (
                                <>
                                  <span>•</span>
                                  <span className="text-red-500 font-medium">Missed</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Call back buttons */}
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startNewCall(otherParticipant.id, otherParticipant.username, 'audio')}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            title="Call back (audio)"
                          >
                            <Phone size={16} />
                          </button>
                          
                          <button
                            onClick={() => startNewCall(otherParticipant.id, otherParticipant.username, 'video')}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                            title="Call back (video)"
                          >
                            <Video size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CallHistory;