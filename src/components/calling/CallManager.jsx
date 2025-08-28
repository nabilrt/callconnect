import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import webrtcService from '../../services/webrtcService';
import IncomingCallModal from './IncomingCallModal';
import CallWindow from './CallWindow';

const CallManager = () => {
  const { socket, user } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, connected

  useEffect(() => {
    if (!socket) return;

    // Set socket in WebRTC service
    webrtcService.setSocket(socket);

    // Handle WebRTC connection state changes
    const handleConnectionState = (event) => {
      const { state } = event.detail;
      console.log('📞 Connection state in CallManager:', state);
      
      if (state === 'connected') {
        setCallStatus('connected');
        if (currentCall) {
          setCurrentCall({
            ...currentCall,
            status: 'connected'
          });
        }
      }
    };

    // Socket event listeners
    const handleIncomingCall = (data) => {
      console.log('Incoming call:', data);
      setIncomingCall(data);
      setCallStatus('ringing');
    };

    const handleCallInitiated = (data) => {
      console.log('Call initiated:', data);
      const receiverInfo = window._pendingCallReceiver || {};
      setCurrentCall({
        callId: data.callId,
        receiverId: data.receiverId,
        receiverUsername: receiverInfo.receiverUsername,
        callerId: user?.id,
        callerUsername: user?.username,
        callType: data.callType,
        isReceiver: false,
        status: 'calling'
      });
      setCallStatus('calling');
      // Clear the pending receiver info
      delete window._pendingCallReceiver;
    };

    const handleCallAccepted = (data) => {
      console.log('Call accepted:', data);
      if (currentCall) {
        setCurrentCall({
          ...currentCall,
          status: 'accepted'
        });
      }
      setCallStatus('connecting'); // Set to connecting first, will change to connected when WebRTC connects
    };

    const handleCallRejected = (data) => {
      console.log('Call rejected:', data);
      setCurrentCall(null);
      setCallStatus('idle');
      alert('Call was rejected');
    };

    const handleCallEnded = (data) => {
      console.log('Call ended:', data);
      setCurrentCall(null);
      setIncomingCall(null);
      setCallStatus('idle');
      
      if (data.reason === 'user_disconnected') {
        alert(`Call ended: ${data.disconnectedUser} disconnected`);
      }
    };

    const handleCallError = (data) => {
      console.error('Call error:', data);
      setCurrentCall(null);
      setIncomingCall(null);
      setCallStatus('idle');
      alert(`Call error: ${data.message}`);
    };

    // Add event listeners
    window.addEventListener('webrtc:connectionState', handleConnectionState);
    
    // Add socket listeners
    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_initiated', handleCallInitiated);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_rejected', handleCallRejected);
    socket.on('call_ended', handleCallEnded);
    socket.on('call_error', handleCallError);

    return () => {
      // Remove event listeners
      window.removeEventListener('webrtc:connectionState', handleConnectionState);
      
      // Remove socket listeners
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_initiated', handleCallInitiated);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_rejected', handleCallRejected);
      socket.off('call_ended', handleCallEnded);
      socket.off('call_error', handleCallError);
    };
  }, [socket, currentCall]);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    
    try {
      await webrtcService.acceptCall(incomingCall.callId, incomingCall.callType);
      
      setCurrentCall({
        callId: incomingCall.callId,
        callerId: incomingCall.callerId,
        callerUsername: incomingCall.callerUsername,
        receiverId: user?.id,
        receiverUsername: user?.username,
        callType: incomingCall.callType,
        isReceiver: true,
        status: 'accepted'
      });
      
      setIncomingCall(null);
      setCallStatus('connecting');
    } catch (error) {
      console.error('Error accepting call:', error);
      const errorMessage = incomingCall.callType === 'video' 
        ? 'Failed to accept call. Please check your camera and microphone permissions.'
        : 'Failed to accept call. Please check your microphone permissions.';
      alert(errorMessage);
      handleRejectCall();
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      socket.emit('reject_call', { callId: incomingCall.callId });
      setIncomingCall(null);
      setCallStatus('idle');
    }
  };

  const handleEndCall = () => {
    setCurrentCall(null);
    setCallStatus('idle');
  };

  // Function to initiate a call (to be called from other components)
  const startCall = async (receiverId, receiverUsername, callType = 'audio') => {
    if (callStatus !== 'idle') {
      alert('Already in a call');
      return;
    }

    try {
      await webrtcService.startCall(receiverId, callType);
      // Store the receiver info for when the call is initiated
      window._pendingCallReceiver = { receiverId, receiverUsername };
    } catch (error) {
      console.error('Error starting call:', error);
      const errorMessage = callType === 'video' 
        ? 'Failed to start call. Please check your camera and microphone permissions.'
        : 'Failed to start call. Please check your microphone permissions.';
      alert(errorMessage);
    }
  };

  // Expose the startCall function to other components via window object
  useEffect(() => {
    window.startCall = startCall;
    return () => {
      delete window.startCall;
    };
  }, [callStatus]);

  return (
    <>
      {/* Incoming Call Modal */}
      <IncomingCallModal
        isOpen={!!incomingCall && callStatus === 'ringing'}
        callerUsername={incomingCall?.callerUsername}
        callerId={incomingCall?.callerId}
        callType={incomingCall?.callType}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

      {/* Active Call Window */}
      <CallWindow
        isOpen={!!currentCall && (callStatus === 'calling' || callStatus === 'connecting' || callStatus === 'connected')}
        callData={currentCall}
        onEndCall={handleEndCall}
      />

      {/* Call Status Indicator (for calling state) */}
      {callStatus === 'calling' && currentCall && (
        <div className="fixed top-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm">
              Calling {currentCall.receiverUsername || 'user'}...
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default CallManager;