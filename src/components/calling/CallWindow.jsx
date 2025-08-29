import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video,
  VideoOff,
  Minimize2,
  Maximize2
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import webrtcService from '../../services/webrtcService';
import callHistoryService from '../../services/callHistoryService';
import { useAuth } from '../../context/AuthContext';

const CallWindow = ({ 
  isOpen, 
  callData,
  onEndCall,
  onMinimize 
}) => {
  const { user } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [connectionState, setConnectionState] = useState('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [hasLocalVideo, setHasLocalVideo] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callStartTime = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !callData) return;

    // Set up WebRTC event listeners
    const handleLocalStream = (event) => {
      const stream = event.detail.stream;
      const hasVideo = event.detail.hasVideo;
      const streamCallType = event.detail.callType;
      
      console.log('🎥 CallWindow: Local stream event received - DETAILED:', {
        'event.detail': event.detail,
        'hasVideo (from event)': hasVideo,
        'hasVideo type': typeof hasVideo,
        'streamCallType': streamCallType,
        'callDataType': callData?.callType,
        'videoTracks length': stream?.getVideoTracks().length,
        'audioTracks length': stream?.getAudioTracks().length,
        'stream object': stream
      });
      
      // Use hasVideo OR if it's a video call type as fallback
      const shouldShowVideo = hasVideo || streamCallType === 'video' || callData?.callType === 'video';
      setHasLocalVideo(shouldShowVideo);
      
      if (stream) {
        // Set up audio
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
          console.log('🎵 Set local audio stream');
        }
        
        // Set up video if available - always try to set for video calls
        if (localVideoRef.current && (hasVideo || callData?.callType === 'video')) {
          console.log('🎥 Setting local video stream to video element, hasVideo:', hasVideo, 'callType:', callData?.callType);
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(error => {
            console.error('🎥 Error playing local video:', error);
          });
        }
      }
    };

    const handleRemoteStream = (event) => {
      const stream = event.detail.stream;
      const hasVideo = event.detail.hasVideo;
      
      console.log('🎥 CallWindow: Remote stream received', {
        hasVideo,
        videoTracks: stream?.getVideoTracks().length,
        audioTracks: stream?.getAudioTracks().length,
        stream
      });
      
      setHasRemoteVideo(hasVideo);
      
      if (stream) {
        // Set up audio
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;
          remoteAudioRef.current.play().catch(console.error);
          console.log('🎵 Set remote audio stream');
        }
        
        // Set up video if available
        if (hasVideo && remoteVideoRef.current) {
          console.log('🎥 Setting remote video stream to video element');
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.play().catch(error => {
            console.error('🎥 Error playing remote video:', error);
          });
        }
      }
    };

    const handleConnectionState = (event) => {
      const newState = event.detail.state;
      setConnectionState(newState);
      
      // Start timer when call is connected
      if (newState === 'connected' && !callStartTime.current) {
        callStartTime.current = Date.now();
        console.log('📞 Call connected, starting duration timer');
      }
    };

    const handleAudioToggled = (event) => {
      setIsAudioMuted(event.detail.muted);
    };

    const handleVideoToggled = (event) => {
      setIsVideoMuted(event.detail.muted);
    };

    const handleCallEnded = () => {
      // Calculate final call duration
      const finalDuration = callStartTime.current ? 
        Math.floor((Date.now() - callStartTime.current) / 1000) : 0;
      
      // Always save completed calls (duration > 0)
      // Don't save calls that never connected (duration = 0) as they're handled elsewhere as missed calls
      if (finalDuration > 0) {
        console.log('📞 Saving completed call with duration:', finalDuration);
        saveCallToHistory(finalDuration);
      }
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Reset all state
      setConnectionState('closed');
      setIsAudioMuted(false);
      setIsVideoMuted(false);
      setHasLocalVideo(false);
      setHasRemoteVideo(false);
      setCallDuration(0);
      callStartTime.current = null;
      
      // Clear audio and video elements
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = null;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      
      onEndCall();
    };

    const handleCleanup = () => {
      console.log('🧹 Call window cleanup triggered');
      
      // Don't save call history on cleanup - this is handled by handleCallEnded
      // Cleanup is for forced cleanup scenarios (like browser refresh)
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Reset all local state
      setConnectionState('closed');
      setIsAudioMuted(false);
      setIsVideoMuted(false);
      setHasLocalVideo(false);
      setHasRemoteVideo(false);
      setCallDuration(0);
      callStartTime.current = null;
      
      // Clear audio and video elements
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = null;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };

    // Add event listeners
    window.addEventListener('webrtc:localStream', handleLocalStream);
    window.addEventListener('webrtc:remoteStream', handleRemoteStream);
    window.addEventListener('webrtc:connectionState', handleConnectionState);
    window.addEventListener('webrtc:audioToggled', handleAudioToggled);
    window.addEventListener('webrtc:videoToggled', handleVideoToggled);
    window.addEventListener('webrtc:callEnded', handleCallEnded);
    window.addEventListener('webrtc:cleanup', handleCleanup);

    // Start call duration timer (only when connected)
    timerRef.current = setInterval(() => {
      if (callStartTime.current) {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }
    }, 1000);

    return () => {
      // Remove event listeners
      window.removeEventListener('webrtc:localStream', handleLocalStream);
      window.removeEventListener('webrtc:remoteStream', handleRemoteStream);
      window.removeEventListener('webrtc:connectionState', handleConnectionState);
      window.removeEventListener('webrtc:audioToggled', handleAudioToggled);
      window.removeEventListener('webrtc:videoToggled', handleVideoToggled);
      window.removeEventListener('webrtc:callEnded', handleCallEnded);
      window.removeEventListener('webrtc:cleanup', handleCleanup);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, callData, onEndCall]);

  const saveCallToHistory = async (duration) => {
    if (!callData || !user) return;
    
    const callRecord = {
      ...callData,
      duration: duration,
      status: duration > 0 ? 'completed' : 'missed',
      startedAt: callStartTime.current ? new Date(callStartTime.current).toISOString() : new Date().toISOString(),
      endedAt: new Date().toISOString()
    };
    
    try {
      // Transform to database format and save
      const dbCallData = callHistoryService.transformToDbFormat(callRecord, user.id);
      await callHistoryService.createCallHistory(dbCallData);
    } catch (error) {
      console.error('📞 Failed to save call to database, using localStorage fallback');
      // The service already handles localStorage fallback in case of error
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleToggleAudio = () => {
    webrtcService.toggleAudio();
  };

  const handleToggleVideo = () => {
    webrtcService.toggleVideo();
  };

  const handleEndCall = () => {
    // Calculate call duration
    const finalDuration = callStartTime.current ? 
      Math.floor((Date.now() - callStartTime.current) / 1000) : 0;
    
    // Save call history regardless of duration
    if (callData && user) {
      saveCallToHistory(finalDuration);
    }
    
    webrtcService.endCall();
    onEndCall();
  };

  const toggleMinimize = () => {
    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    if (onMinimize) {
      onMinimize(newMinimized);
    }
  };

  if (!isOpen || !callData) return null;

  const otherParticipant = callData.isReceiver 
    ? { username: callData.callerUsername, id: callData.callerId }
    : { username: callData.receiverUsername, id: callData.receiverId };

  // For video calls, always show local video area
  const showLocalVideoArea = callData.callType === 'video';
  const showRemoteVideoArea = callData.callType === 'video';

  // Debug logging
  console.log('🎥 CallWindow render:', {
    hasLocalVideo,
    hasRemoteVideo,
    callType: callData.callType,
    isVideoMuted,
    showLocalVideoArea,
    showRemoteVideoArea
  });

  return (
    <>
      {/* Audio elements - hidden */}
      <audio ref={localAudioRef} muted autoPlay />
      <audio ref={remoteAudioRef} autoPlay />
      

      {/* Call Window */}
      <div 
        className={`fixed ${
          isMinimized 
            ? 'bottom-4 right-4 w-80 h-24' 
            : 'inset-4 lg:inset-20'
        } bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl z-50 transition-all duration-300`}
      >
        {isMinimized ? (
          /* Minimized View */
          <div className="h-full flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Avatar username={otherParticipant.username} userId={otherParticipant.id} size="sm" />
              <div>
                <p className="text-white font-medium text-sm">{otherParticipant.username}</p>
                <p className="text-gray-300 text-xs">{formatDuration(callDuration)}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={toggleMinimize}
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center"
              >
                <Maximize2 size={14} />
              </button>
              <button
                onClick={handleEndCall}
                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
              >
                <PhoneOff size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Full View */
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 text-center border-b border-gray-700">
              <div className="w-24 h-24 mx-auto mb-4">
                <Avatar 
                  username={otherParticipant.username} 
                  userId={otherParticipant.id}
                  size="xl"
                />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-1">
                {otherParticipant.username}
              </h3>
              <div className="flex items-center justify-center space-x-4 text-gray-300">
                <span className="text-sm">
                  {connectionState === 'connected' ? formatDuration(callDuration) : 'Connecting...'}
                </span>
                {connectionState === 'connected' && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">Connected</span>
                  </div>
                )}
              </div>
            </div>

            {/* Video Display Area - Always show for video calls */}
            {showRemoteVideoArea && (
              <div className="flex-1 bg-gray-900 relative overflow-hidden">
                {/* Remote Video (Main Display) - Always create the element */}
                <video 
                  ref={remoteVideoRef}
                  autoPlay 
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ display: 'block' }}
                  onLoadedMetadata={() => console.log('🎥 Remote video metadata loaded')}
                  onCanPlay={() => console.log('🎥 Remote video can play')}
                  onPlay={() => console.log('🎥 Remote video started playing')}
                />
                
                {/* Fallback: Show avatar when no remote video */}
                {!hasRemoteVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4">
                        <Avatar 
                          username={otherParticipant.username} 
                          userId={otherParticipant.id}
                          size="xl"
                        />
                      </div>
                      <p className="text-gray-300 text-lg">{otherParticipant.username}</p>
                      <p className="text-gray-500 text-sm">Camera off</p>
                    </div>
                  </div>
                )}
                
              </div>
            )}

            {/* Controls */}
            <div className={`${hasLocalVideo || hasRemoteVideo ? 'bg-gray-800' : 'flex-1'} flex items-center justify-center p-8`}>
              <div className="flex space-x-6">
                {/* Mute/Unmute */}
                <button
                  onClick={handleToggleAudio}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    isAudioMuted 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  } text-white`}
                >
                  {isAudioMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                {/* Video Toggle (only show for video calls) */}
                {(hasLocalVideo || hasRemoteVideo) && (
                  <button
                    onClick={handleToggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isVideoMuted 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    } text-white`}
                  >
                    {isVideoMuted ? <VideoOff size={24} /> : <Video size={24} />}
                  </button>
                )}

                {/* Minimize */}
                <button
                  onClick={toggleMinimize}
                  className="w-14 h-14 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <Minimize2 size={24} />
                </button>

                {/* End Call */}
                <button
                  onClick={handleEndCall}
                  className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <PhoneOff size={24} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CallWindow;