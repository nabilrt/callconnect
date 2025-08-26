import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';

const Stories = () => {
  const { user, token, socket } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showViewModal, setShowViewModal] = useState(false);
  const [createStoryType, setCreateStoryType] = useState('image');
  const [storyContent, setStoryContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#667eea');
  const [textColor, setTextColor] = useState('#ffffff');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef(null);
  const storyProgressRef = useRef(null);

  useEffect(() => {
    fetchStories();
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_story', handleNewStory);
    socket.on('story_deleted', handleStoryDeleted);

    return () => {
      socket.off('new_story');
      socket.off('story_deleted');
    };
  }, [socket]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/social/stories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStories(data);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewStory = (newStory) => {
    fetchStories(); // Refresh stories when a new one is created
  };

  const handleStoryDeleted = ({ storyId }) => {
    fetchStories(); // Refresh stories when one is deleted
  };

  const handleCreateStory = async () => {
    if (!storyContent && !selectedFile && createStoryType !== 'text') {
      return;
    }

    setIsCreating(true);
    
    try {
      const formData = new FormData();
      
      if (selectedFile) {
        if (selectedFile.type.startsWith('image/')) {
          formData.append('image', selectedFile);
          formData.append('story_type', 'image');
        } else if (selectedFile.type.startsWith('video/')) {
          formData.append('video', selectedFile);
          formData.append('story_type', 'video');
        }
      } else {
        formData.append('story_type', 'text');
        formData.append('background_color', backgroundColor);
        formData.append('text_color', textColor);
      }
      
      if (storyContent) {
        formData.append('content', storyContent);
      }

      const response = await fetch('http://localhost:3001/api/social/stories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setShowCreateModal(false);
        setStoryContent('');
        setSelectedFile(null);
        setCreateStoryType('image');
        fetchStories();
      }
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStoryClick = (storyGroup, index = 0) => {
    setSelectedStoryGroup(storyGroup);
    setCurrentStoryIndex(index);
    setShowViewModal(true);
  };

  const handleStoryViewed = (storyId, userId) => {
    setStories(prevStories => 
      prevStories.map(storyGroup => {
        if (storyGroup.user_id === userId) {
          const updatedStories = storyGroup.stories.map(story => 
            story.id === storyId 
              ? { ...story, viewed_by_current_user: true }
              : story
          );
          
          // Check if all stories in this group have been viewed
          const hasUnseenStories = updatedStories.some(story => !story.viewed_by_current_user);
          
          return {
            ...storyGroup,
            stories: updatedStories,
            has_unseen: hasUnseenStories
          };
        }
        return storyGroup;
      })
    );
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setCreateStoryType(file.type.startsWith('video/') ? 'video' : 'image');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex space-x-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-12 h-3 bg-gray-200 rounded mt-2 mx-auto animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {/* Create Story */}
          <div 
            className="flex-shrink-0 text-center cursor-pointer group"
            onClick={() => setShowCreateModal(true)}
          >
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
          {stories.map((storyGroup) => {
            const latestStory = storyGroup.stories[0]; // Get the latest story
            return (
              <div 
                key={storyGroup.user_id} 
                className="flex-shrink-0 text-center cursor-pointer group"
                onClick={() => handleStoryClick(storyGroup)}
              >
                <div className={`w-16 h-16 rounded-full p-0.5 ${
                  storyGroup.has_unseen 
                    ? 'bg-gradient-to-tr from-yellow-400 to-pink-600' 
                    : 'bg-gray-300'
                }`}>
                  <div className="w-full h-full bg-white rounded-full p-1 overflow-hidden">
                    {/* Story Preview */}
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      {latestStory.story_type === 'image' ? (
                        <img 
                          src={`http://localhost:3001/uploads/${latestStory.image}`}
                          alt="Story preview"
                          className="w-full h-full object-cover"
                        />
                      ) : latestStory.story_type === 'video' ? (
                        <video 
                          src={`http://localhost:3001/uploads/${latestStory.video}`}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        // Text story preview
                        <div 
                          className="w-full h-full flex items-center justify-center text-[8px] font-bold text-center p-1"
                          style={{ 
                            backgroundColor: latestStory.background_color || '#667eea',
                            color: latestStory.text_color || '#ffffff'
                          }}
                        >
                          <span className="line-clamp-3 break-words">
                            {latestStory.content || 'Story'}
                          </span>
                        </div>
                      )}
                      
                      {/* User Avatar Overlay */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full p-0.5">
                        <Avatar 
                          src={storyGroup.avatar}
                          username={storyGroup.username}
                          size="xs"
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-700 mt-2 font-medium max-w-[4rem] truncate">
                  {storyGroup.username}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Story Modal */}
      {showCreateModal && (
        <CreateStoryModal 
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateStory}
          isCreating={isCreating}
          storyContent={storyContent}
          setStoryContent={setStoryContent}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          createStoryType={createStoryType}
          setCreateStoryType={setCreateStoryType}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          textColor={textColor}
          setTextColor={setTextColor}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
        />
      )}

      {/* View Story Modal */}
      {showViewModal && selectedStoryGroup && (
        <StoryViewModal 
          storyGroup={selectedStoryGroup}
          currentIndex={currentStoryIndex}
          onClose={() => {
            setShowViewModal(false);
            setSelectedStoryGroup(null);
            setCurrentStoryIndex(0);
          }}
          onStoryChange={setCurrentStoryIndex}
          onStoryViewed={handleStoryViewed}
          token={token}
        />
      )}
    </>
  );
};

// Create Story Modal Component
const CreateStoryModal = ({ 
  onClose, 
  onCreate, 
  isCreating, 
  storyContent, 
  setStoryContent,
  selectedFile,
  setSelectedFile,
  createStoryType,
  setCreateStoryType,
  backgroundColor,
  setBackgroundColor,
  textColor,
  setTextColor,
  fileInputRef,
  handleFileSelect
}) => {
  const backgroundColors = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
    '#fa709a', '#fee140', '#4facfe', '#f093fb', '#ffecd2'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create Story</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {/* Story Type Selection */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setCreateStoryType('text')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                createStoryType === 'text' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setCreateStoryType('image')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                createStoryType === 'image' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Photo
            </button>
            <button
              onClick={() => setCreateStoryType('video')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                createStoryType === 'video' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Video
            </button>
          </div>

          {/* Content based on type */}
          {createStoryType === 'text' ? (
            <div>
              {/* Background Color Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <div className="flex flex-wrap gap-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        backgroundColor === color ? 'border-gray-800' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Text Color Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTextColor('#ffffff')}
                    className={`w-8 h-8 rounded-full border-2 ${
                      textColor === '#ffffff' ? 'border-gray-800' : 'border-gray-200'
                    } bg-white`}
                  />
                  <button
                    onClick={() => setTextColor('#000000')}
                    className={`w-8 h-8 rounded-full border-2 ${
                      textColor === '#000000' ? 'border-gray-800' : 'border-gray-200'
                    } bg-black`}
                  />
                </div>
              </div>

              {/* Story Preview */}
              <div 
                className="w-full h-48 rounded-lg flex items-center justify-center mb-4 p-4"
                style={{ backgroundColor }}
              >
                <textarea
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full h-full bg-transparent resize-none border-none outline-none text-center text-lg font-medium"
                  style={{ color: textColor }}
                  maxLength={150}
                />
              </div>
            </div>
          ) : (
            <div>
              {/* File Upload */}
              <div className="mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
                >
                  {selectedFile ? (
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm">Click to change file</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="font-medium">Choose {createStoryType}</p>
                      <p className="text-sm">Click to upload</p>
                    </div>
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept={createStoryType === 'image' ? 'image/*' : 'video/*'}
                  className="hidden"
                />
              </div>

              {/* Optional Caption */}
              <textarea
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                placeholder="Add a caption..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                maxLength={150}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              disabled={isCreating || (!storyContent && !selectedFile)}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? 'Creating...' : 'Share Story'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Story View Modal Component
const StoryViewModal = ({ storyGroup, currentIndex, onClose, onStoryChange, onStoryViewed, token }) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const currentStory = storyGroup.stories[currentIndex];

  useEffect(() => {
    // Mark story as viewed
    if (currentStory) {
      fetch(`http://localhost:3001/api/social/stories/${currentStory.id}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).then(response => {
        if (response.ok) {
          // Update parent state to mark story as viewed
          onStoryViewed(currentStory.id, storyGroup.user_id);
        }
      }).catch(console.error);
    }
  }, [currentStory, token, onStoryViewed, storyGroup.user_id]);

  useEffect(() => {
    if (!isPaused) {
      startProgress();
    } else {
      pauseProgress();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex, isPaused]);

  const startProgress = () => {
    setProgress(0);
    const duration = currentStory?.story_type === 'video' ? 10000 : 5000; // 10s for video, 5s for image/text
    const increment = 100 / (duration / 100);

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + increment;
      });
    }, 100);
  };

  const pauseProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const nextStory = () => {
    if (currentIndex < storyGroup.stories.length - 1) {
      onStoryChange(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      onStoryChange(currentIndex - 1);
    }
  };

  const formatTime = (timestamp) => {
    // Handle both ISO format and SQLite format
    let date;
    if (timestamp.includes('T') || timestamp.includes('Z')) {
      // ISO format - already includes timezone
      date = new Date(timestamp);
    } else {
      // SQLite format - treat as UTC and convert
      date = new Date(timestamp + 'Z'); // Add Z to indicate UTC
    }
    
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    
    if (diffInMinutes < 1) {
      return 'now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-[10000] flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1">
        {storyGroup.stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ 
                width: index < currentIndex ? '100%' : 
                       index === currentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between mt-6">
        <div className="flex items-center space-x-3">
          <Avatar 
            src={storyGroup.avatar}
            username={storyGroup.username}
            size="sm"
          />
          <div>
            <p className="text-white font-semibold">{storyGroup.username}</p>
            <p className="text-white/70 text-sm">{formatTime(currentStory.created_at)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Story Content */}
      <div 
        className="relative w-full max-w-md mx-4 aspect-[9/16] rounded-xl overflow-hidden"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {currentStory.story_type === 'image' && (
          <img 
            src={`http://localhost:3001/uploads/${currentStory.image}`}
            alt="Story"
            className="w-full h-full object-cover"
          />
        )}
        
        {currentStory.story_type === 'video' && (
          <video 
            src={`http://localhost:3001/uploads/${currentStory.video}`}
            className="w-full h-full object-cover"
            autoPlay
            muted
          />
        )}
        
        {currentStory.story_type === 'text' && (
          <div 
            className="w-full h-full flex items-center justify-center p-6"
            style={{ backgroundColor: currentStory.background_color }}
          >
            <p 
              className="text-center text-xl font-bold"
              style={{ color: currentStory.text_color }}
            >
              {currentStory.content}
            </p>
          </div>
        )}

        {/* Navigation areas */}
        <div className="absolute inset-0 flex">
          <button
            className="flex-1 bg-transparent"
            onClick={prevStory}
            disabled={currentIndex === 0}
          />
          <button
            className="flex-1 bg-transparent"
            onClick={nextStory}
          />
        </div>

        {/* Story text overlay */}
        {currentStory.content && currentStory.story_type !== 'text' && (
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white text-lg font-medium">{currentStory.content}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;