// src/components/modals/DeleteAccountModal.jsx - MATCHING DESIGN SYSTEM
import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Trash2, 
  Loader2,
  Shield,
  Lock
} from 'lucide-react';
import { Button } from '../ui/Button/Button';

const DeleteAccountModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  user,
  isDeleting = false 
}) => {
  const [confirmationStep, setConfirmationStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Required confirmation text
  const REQUIRED_TEXT = 'DELETE MY ACCOUNT';

  // Reset modal state when opened/closed
  React.useEffect(() => {
    if (!isOpen) {
      setConfirmationStep(1);
      setConfirmText('');
      setAgreedToTerms(false);
    }
  }, [isOpen]);

  // Handle confirmation flow
  const handleNextStep = () => {
    if (confirmationStep === 1) {
      setConfirmationStep(2);
    }
  };

  const handleFinalConfirm = () => {
    if (confirmText === REQUIRED_TEXT && agreedToTerms) {
      onConfirm();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  const isStep2Valid = confirmText === REQUIRED_TEXT && agreedToTerms;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl animate-modalSlideIn">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Delete Account
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Step {confirmationStep} of 2
                </p>
              </div>
            </div>
            
            {!isDeleting && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {confirmationStep === 1 ? (
            /* Step 1: Initial Warning */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Are you sure you want to delete your account?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This action will permanently remove your account and all associated data.
                </p>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.profile?.avatar ? (
                      <img 
                        src={user.profile.avatar.startsWith('http') ? user.profile.avatar : `http://127.0.0.1:8000${user.profile.avatar}`}
                        alt={user.full_name || user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {(user?.full_name || user?.username)?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user?.full_name || user?.username || 'Your Account'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{user?.username || 'username'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning List */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-sm">
                  <Shield className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    All your posts, comments, and interactions will be permanently deleted
                  </span>
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <Lock className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Your profile and personal information will be removed
                  </span>
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    This action cannot be undone
                  </span>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="flex space-x-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                >
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            /* Step 2: Final Confirmation */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Final Confirmation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  To confirm deletion, please type <strong>"{REQUIRED_TEXT}"</strong> in the box below.
                </p>
              </div>

              {/* Confirmation Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type "{REQUIRED_TEXT}" to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={REQUIRED_TEXT}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={isDeleting}
                  />
                </div>

                {/* Agreement Checkbox */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    disabled={isDeleting}
                  />
                  <label htmlFor="agree-terms" className="text-sm text-gray-700 dark:text-gray-300">
                    I understand that this action is permanent and cannot be undone. I agree to delete my account and all associated data.
                  </label>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => setConfirmationStep(1)}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  disabled={isDeleting}
                >
                  Back
                </Button>
                <Button
                  onClick={handleFinalConfirm}
                  disabled={!isStep2Valid || isDeleting}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-modalSlideIn {
          animation: modalSlideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DeleteAccountModal;