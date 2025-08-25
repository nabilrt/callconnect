import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const Stories = () => {
  const { user } = useAuth();

  // Mock stories data - in a real app, this would come from an API
  const stories = [
    {
      id: 1,
      username: 'alice_johnson',
      avatar: null,
      hasStory: true,
      isViewed: false
    },
    {
      id: 2,
      username: 'bob_smith',
      avatar: null,
      hasStory: true,
      isViewed: true
    },
    {
      id: 3,
      username: 'charlie_brown',
      avatar: null,
      hasStory: true,
      isViewed: false
    },
    {
      id: 4,
      username: 'diana_prince',
      avatar: null,
      hasStory: true,
      isViewed: true
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {/* Create Story */}
        <div className="flex-shrink-0 text-center cursor-pointer group">
          <div className="relative">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 group-hover:border-indigo-500 transition-colors">
              <Avatar 
                src={user?.avatar}
                username={user?.username}
                size="sm"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-700 mt-2 font-medium">Create Story</p>
        </div>

        {/* Friends' Stories */}
        {stories.map((story) => (
          <div key={story.id} className="flex-shrink-0 text-center cursor-pointer group">
            <div className={`w-16 h-16 rounded-full p-0.5 ${
              story.isViewed 
                ? 'bg-gray-300' 
                : 'bg-gradient-to-tr from-yellow-400 to-pink-600'
            }`}>
              <div className="w-full h-full bg-white rounded-full p-0.5">
                <Avatar 
                  src={story.avatar}
                  username={story.username}
                  size="sm"
                  className="w-full h-full"
                />
              </div>
            </div>
            <p className="text-xs text-gray-700 mt-2 font-medium max-w-[4rem] truncate">
              {story.username}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stories;