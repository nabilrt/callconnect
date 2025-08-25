import React from 'react';
import { useCall } from '../../context/CallContext';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';

const IncomingCall = () => {
  const { incomingCall, answerCall, callStatus } = useCall();

  if (!incomingCall || callStatus !== 'ringing') return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounce-slow">
        {/* Caller Avatar */}
        <div className="mb-6">
          <Avatar 
            username={incomingCall.fromUsername}
            size="2xl"
            className="mx-auto"
          />
        </div>

        {/* Call Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {incomingCall.fromUsername}
          </h2>
          <p className="text-gray-600 mb-2">
            Incoming {incomingCall.callType} call
          </p>
          
          {/* Ringing Animation */}
          <div className="flex items-center justify-center space-x-1 mb-4">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Call Actions */}
        <div className="flex items-center justify-center space-x-6">
          {/* Decline */}
          <Button
            onClick={() => answerCall(false)}
            variant="danger"
            size="lg"
            className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700 shadow-lg"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.51-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
            </svg>
          </Button>

          {/* Accept */}
          <Button
            onClick={() => answerCall(true)}
            variant="success"
            size="lg"
            className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700 shadow-lg animate-pulse"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </Button>
        </div>

        {/* Action Labels */}
        <div className="flex items-center justify-center space-x-12 mt-4">
          <span className="text-sm text-gray-500">Decline</span>
          <span className="text-sm text-gray-500">Accept</span>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;