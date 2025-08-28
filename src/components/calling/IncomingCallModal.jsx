import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import Avatar from '../ui/Avatar';

const IncomingCallModal = ({ 
  isOpen, 
  callerUsername, 
  callerId,
  callType = 'audio',
  onAccept, 
  onReject 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
        {/* Caller Avatar */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto mb-4">
            <Avatar 
              username={callerUsername} 
              userId={callerId}
              size="xl"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {callerUsername}
          </h3>
          <p className="text-gray-600">
            Incoming {callType} call...
          </p>
        </div>

        {/* Call Actions */}
        <div className="flex justify-center space-x-6">
          {/* Reject Call */}
          <button
            onClick={onReject}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
          >
            <PhoneOff size={24} />
          </button>

          {/* Accept Call */}
          <button
            onClick={onAccept}
            className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
          >
            {callType === 'video' ? <Video size={24} /> : <Phone size={24} />}
          </button>
        </div>

        {/* Ripple Animation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full relative overflow-hidden rounded-2xl">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 border-4 border-blue-400 rounded-full animate-ping opacity-30"></div>
              <div className="w-40 h-40 border-4 border-blue-300 rounded-full animate-ping opacity-20 absolute -top-4 -left-4" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;