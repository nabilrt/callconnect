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

const CallWindow = ({ 
  isOpen, 
  callData,
  onEndCall,
  onMinimize 
}) => {
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
  const callStartTime = useRef(Date.now());

  useEffect(() => {
    if (!isOpen || !callData) return;

    // Set up WebRTC event listeners
    const handleLocalStream = (event) => {
      const stream = event.detail.stream;
      const hasVideo = event.detail.hasVideo;
      
      console.log('🎥 CallWindow: Local stream received', {
        hasVideo,
        videoTracks: stream?.getVideoTracks().length,
        audioTracks: stream?.getAudioTracks().length,
        stream
      });
      
      setHasLocalVideo(hasVideo);
      
      if (stream) {
        // Set up audio
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
          console.log('🎵 Set local audio stream');
        }
        
        // Set up video if available
        if (hasVideo && localVideoRef.current) {
          console.log('🎥 Setting local video stream to video element');
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
      setConnectionState(event.detail.state);
    };

    const handleAudioToggled = (event) => {
      setIsAudioMuted(event.detail.muted);
    };

    const handleVideoToggled = (event) => {
      setIsVideoMuted(event.detail.muted);
    };

    const handleCallEnded = () => {
      // Reset all state
      setConnectionState('closed');
      setIsAudioMuted(false);
      setIsVideoMuted(false);
      setHasLocalVideo(false);
      setHasRemoteVideo(false);
      setCallDuration(0);
      
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
      // Reset all local state
      setConnectionState('closed');
      setIsAudioMuted(false);
      setIsVideoMuted(false);
      setHasLocalVideo(false);
      setHasRemoteVideo(false);
      setCallDuration(0);
      
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

    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
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
      
      clearInterval(timer);
    };
  }, [isOpen, callData, onEndCall]);

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

  // Debug logging
  console.log('🎥 CallWindow render:', {
    hasLocalVideo,
    hasRemoteVideo,
    callType: callData.callType,
    isVideoMuted
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
            {callData.callType === 'video' && (
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
                
                {/* Local Video (Picture-in-Picture) - Always show */}
                <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
                  {/* Always create the local video element */}
                  <video 
                    ref={localVideoRef}
                    muted 
                    autoPlay 
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ 
                      display: 'block',
                      transform: 'scaleX(-1)' // Mirror local video
                    }}
                    onLoadedMetadata={() => console.log('🎥 Local video metadata loaded')}
                    onCanPlay={() => console.log('🎥 Local video can play')}
                    onPlay={() => console.log('🎥 Local video started playing')}
                  />
                  
                  {/* Overlay when video is muted */}
                  {isVideoMuted && (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <VideoOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-xs">Camera off</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Local video label */}
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    You
                  </div>
                </div>
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