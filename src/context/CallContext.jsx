import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CallContext = createContext();

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

const servers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const CallProvider = ({ children }) => {
  const { socket, user } = useAuth();
  const [currentCall, setCurrentCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, connected
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const peerConnection = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_answered', handleCallAnswered);
    socket.on('call_rejected', handleCallRejected);
    socket.on('ice_candidate', handleIceCandidate);
    socket.on('call_ended', handleCallEnded);
    socket.on('user_unavailable', handleUserUnavailable);

    return () => {
      socket.off('incoming_call');
      socket.off('call_answered');
      socket.off('call_rejected');
      socket.off('ice_candidate');
      socket.off('call_ended');
      socket.off('user_unavailable');
    };
  }, [socket]);

  const createPeerConnection = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    peerConnection.current = new RTCPeerConnection(servers);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && currentCall) {
        socket.emit('ice_candidate', {
          roomId: currentCall.roomId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream);
      });
    }

    return peerConnection.current;
  };

  const getMediaStream = async (video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Error accessing media:', error);
      throw error;
    }
  };

  const makeCall = async (targetUserId, callType = 'video') => {
    try {
      setCallStatus('calling');
      
      const stream = await getMediaStream(callType === 'video');
      const pc = createPeerConnection();

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      setCurrentCall({
        targetUserId,
        callType,
        roomId: null,
        status: 'calling'
      });

      socket.emit('call_user', {
        targetUserId,
        offer,
        callType,
      });
    } catch (error) {
      console.error('Error making call:', error);
      setCallStatus('idle');
    }
  };

  const handleIncomingCall = (data) => {
    const { from, fromUsername, offer, callType, roomId } = data;
    setIncomingCall({
      from,
      fromUsername,
      offer,
      callType,
      roomId,
    });
    setCallStatus('ringing');
  };

  const answerCall = async (accepted = true) => {
    if (!incomingCall) return;

    try {
      if (accepted) {
        const stream = await getMediaStream(incomingCall.callType === 'video');
        const pc = createPeerConnection();

        await pc.setRemoteDescription(incomingCall.offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        setCurrentCall({
          targetUserId: incomingCall.from,
          callType: incomingCall.callType,
          roomId: incomingCall.roomId,
          status: 'connected'
        });

        socket.emit('answer_call', {
          roomId: incomingCall.roomId,
          answer,
          accepted: true,
        });

        socket.emit('join_room', incomingCall.roomId);
        setIsCallActive(true);
        setCallStatus('connected');
      } else {
        socket.emit('answer_call', {
          roomId: incomingCall.roomId,
          accepted: false,
        });
        setCallStatus('idle');
      }
      setIncomingCall(null);
    } catch (error) {
      console.error('Error answering call:', error);
      setCallStatus('idle');
      setIncomingCall(null);
    }
  };

  const handleCallAnswered = async (data) => {
    const { answer, accepted, roomId } = data;
    if (accepted && peerConnection.current) {
      await peerConnection.current.setRemoteDescription(answer);
      setCurrentCall(prev => ({ ...prev, roomId, status: 'connected' }));
      socket.emit('join_room', roomId);
      setIsCallActive(true);
      setCallStatus('connected');
    }
  };

  const handleCallRejected = () => {
    setCallStatus('idle');
    setCurrentCall(null);
    stopLocalStream();
  };

  const handleIceCandidate = async (data) => {
    const { candidate } = data;
    if (peerConnection.current && candidate) {
      try {
        await peerConnection.current.addIceCandidate(candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const handleCallEnded = () => {
    endCall();
  };

  const handleUserUnavailable = () => {
    setCallStatus('idle');
    setCurrentCall(null);
    stopLocalStream();
  };

  const endCall = () => {
    if (currentCall && currentCall.roomId) {
      socket.emit('end_call', { roomId: currentCall.roomId });
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    stopLocalStream();
    setRemoteStream(null);
    setCurrentCall(null);
    setIncomingCall(null);
    setIsCallActive(false);
    setCallStatus('idle');
  };

  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const value = {
    currentCall,
    incomingCall,
    localStream,
    remoteStream,
    isCallActive,
    callStatus,
    isAudioEnabled,
    isVideoEnabled,
    localVideoRef,
    remoteVideoRef,
    makeCall,
    answerCall,
    endCall,
    toggleAudio,
    toggleVideo,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};