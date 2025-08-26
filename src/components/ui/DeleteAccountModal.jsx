import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from './Modal';
import PasswordInput from './PasswordInput';
import Button from './Button';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmationText: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Warning, 2: Confirmation
  const { token, logout, user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required to delete your account';
    }
    
    if (!formData.confirmationText) {
      newErrors.confirmationText = 'Please type the confirmation text';
    } else if (formData.confirmationText !== 'DELETE MY ACCOUNT') {
      newErrors.confirmationText = 'Please type exactly "DELETE MY ACCOUNT" to confirm';
    }
    
    return newErrors;
  };

  const handleDeleteAccount = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:3001/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - account deleted
        alert('Your account has been permanently deleted.');
        // Logout and redirect
        logout();
        onClose();
      } else {
        // Error from server
        setErrors({ general: data.error || 'Failed to delete account' });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error.message === 'Failed to fetch') {
        setErrors({ general: 'Cannot connect to server. Please check your internet connection and try again.' });
      } else {
        setErrors({ general: 'An error occurred while deleting account. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      password: '',
      confirmationText: ''
    });
    setErrors({});
    setStep(1);
    onClose();
  };

  const handleContinue = () => {
    setStep(2);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="w-full max-w-md">
        {step === 1 ? (
          // Warning Step
          <div>
            <div className="mb-6 text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h2>
              <p className="text-gray-600 text-sm">
                This action cannot be undone. Are you sure you want to proceed?
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-red-800 mb-2">This will permanently delete:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Your profile and account information</li>
                <li>• All your posts and comments</li>
                <li>• All your messages and conversations</li>
                <li>• Your stories and media uploads</li>
                <li>• Your friend connections and requests</li>
                <li>• All your activity and data</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleContinue}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          // Confirmation Step
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Final Confirmation</h2>
              <p className="text-gray-600 text-sm">
                Please enter your password and confirmation text to permanently delete your account.
              </p>
            </div>

            <div className="space-y-4">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <PasswordInput
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                error={errors.password}
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type "DELETE MY ACCOUNT" to confirm
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="confirmationText"
                  value={formData.confirmationText}
                  onChange={handleChange}
                  placeholder="DELETE MY ACCOUNT"
                  className={`
                    w-full px-4 py-3 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-red-500 focus:border-transparent
                    placeholder-gray-400 transition-all duration-200
                    ${errors.confirmationText ? 'border-red-500 focus:ring-red-500' : ''}
                  `}
                />
                {errors.confirmationText && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmationText}</p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This action is irreversible. Your account and all associated data will be permanently deleted.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDeleteAccount}
                  className="flex-1"
                  loading={loading}
                >
                  Delete Account Forever
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DeleteAccountModal;