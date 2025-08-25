import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const Profile = () => {
  const { user, logout, updateAvatar } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (file) => {
    setUploadingAvatar(true);
    const result = await updateAvatar(file);
    
    if (result.success) {
      console.log('Avatar updated successfully');
    } else {
      console.error('Failed to update avatar:', result.error);
    }
    
    setUploadingAvatar(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <Avatar 
            src={user?.avatar}
            username={user?.username}
            size="lg"
            showUpload={true}
            onUpload={handleAvatarUpload}
            className={uploadingAvatar ? 'opacity-50' : ''}
          />
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{user?.username}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-500">Online</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => setShowProfileModal(true)}
              variant="outline"
              size="sm"
            >
              Settings
            </Button>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Profile Settings"
        size="md"
      >
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="text-center">
            <div className="mb-4">
              <Avatar 
                src={user?.avatar}
                username={user?.username}
                size="2xl"
                showUpload={true}
                onUpload={handleAvatarUpload}
                className={`mx-auto ${uploadingAvatar ? 'opacity-50' : ''}`}
              />
            </div>
            <p className="text-sm text-gray-600">Click the + icon to change your avatar</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="text-gray-900 font-medium">{user?.username}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="text-gray-900">{user?.email}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-900">Online</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => setShowProfileModal(false)}
              variant="ghost"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowProfileModal(false);
                logout();
              }}
              variant="danger"
            >
              Logout
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Profile;