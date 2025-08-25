import React, { useEffect } from 'react';
import { useCall } from '../../context/CallContext';
import Button from '../ui/Button';

const CallInterface = () => {
  const {
    currentCall,
    localStream,
    remoteStream,
    isCallActive,
    callStatus,
    isAudioEnabled,
    isVideoEnabled,
    localVideoRef,
    remoteVideoRef,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useCall();

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!isCallActive) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Status Bar */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${callStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
          <span className="text-sm font-medium">
            {callStatus === 'connected' ? 'Connected' : 'Connecting...'}
          </span>
        </div>
        <div className="text-sm text-gray-300">
          {currentCall?.callType === 'video' ? 'Video Call' : 'Audio Call'}
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        {currentCall?.callType === 'video' && (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-gray-800"
          />
        )}
        
        {/* Audio Only Background */}
        {currentCall?.callType === 'audio' && (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-6 mx-auto">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Audio Call</h2>
              <p className="text-white/80">Call in progress...</p>
            </div>
          </div>
        )}

        {/* Local Video (Picture in Picture) */}
        {currentCall?.callType === 'video' && localStream && (
          <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Mute Audio */}
          <Button
            onClick={toggleAudio}
            variant={isAudioEnabled ? "ghost" : "danger"}
            size="lg"
            className={`rounded-full w-14 h-14 ${
              isAudioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isAudioEnabled ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
              </svg>
            )}
          </Button>

          {/* End Call */}
          <Button
            onClick={endCall}
            variant="danger"
            size="lg"
            className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.51-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
            </svg>
          </Button>

          {/* Toggle Video */}
          {currentCall?.callType === 'video' && (
            <Button
              onClick={toggleVideo}
              variant={isVideoEnabled ? "ghost" : "danger"}
              size="lg"
              className={`rounded-full w-14 h-14 ${
                isVideoEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isVideoEnabled ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82l2 2H16v7.17l2 2V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2zM15 16H5V8h1.73L15 16.27V16z"/>
                </svg>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallInterface;