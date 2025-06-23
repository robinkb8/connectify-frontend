 
// frontend/src/components/forms/CreatePostModal/CreatePostModal.jsx
import React, { useState, useCallback } from 'react';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  // ✅ STATE FOR FORM DATA
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ✅ HANDLE IMAGE SELECTION
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // ✅ REMOVE SELECTED IMAGE
  const removeImage = useCallback(() => {
    setImage(null);
    setImagePreview(null);
  }, []);

  // ✅ SUBMIT POST TO DJANGO API
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validation
    if (!content.trim() && !image) {
      setError('Please add some content or an image');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('content', content.trim());
      
      if (image) {
        formData.append('image', image);
      }

      console.log('🔄 Submitting post to Django API...');
      
      const response = await fetch('http://127.0.0.1:8000/api/posts/create/', {
        method: 'POST',
        body: formData,
        // NOTE: Don't set Content-Type header for FormData - browser sets it automatically
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newPost = await response.json();
      console.log('✅ Post created successfully:', newPost);

      // Reset form
      setContent('');
      setImage(null);
      setImagePreview(null);
      
      // Close modal and refresh feed
      onClose();
      onPostCreated(newPost);

    } catch (err) {
      console.error('❌ Failed to create post:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, image, onClose, onPostCreated]);

  // ✅ CLOSE MODAL AND RESET
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setContent('');
      setImage(null);
      setImagePreview(null);
      setError(null);
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Don't render if modal is closed
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        
        {/* ✅ MODAL HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900">
            Create Post
          </h2>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !image)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>

        {/* ✅ MODAL CONTENT */}
        <div className="p-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* ✅ TEXT CONTENT INPUT */}
          <div className="mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              maxLength={2200}
              disabled={isSubmitting}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {content.length}/2200
            </div>
          </div>

          {/* ✅ IMAGE UPLOAD SECTION */}
          <div className="mb-4">
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mb-4">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full rounded-lg max-h-64 object-cover"
                />
                <button
                  onClick={removeImage}
                  disabled={isSubmitting}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            )}

            {/* File Input */}
            {!imagePreview && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload" 
                  className="cursor-pointer block"
                >
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">Click to add photo</p>
                  <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                </label>
              </div>
            )}
          </div>

          {/* ✅ POST OPTIONS (Future features) */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-500 text-sm text-center">
              📱 More options coming soon: Location, Tags, etc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;