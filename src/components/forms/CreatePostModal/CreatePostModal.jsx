// ===== src/components/forms/CreatePostModal/CreatePostModal.jsx =====
import React, { useState, useCallback } from 'react';
import { X, Image, Smile, MapPin } from 'lucide-react';

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
      if (onPostCreated) {
        onPostCreated(newPost);
      }

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        
        {/* ✅ MODAL HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 transition-colors duration-200 font-medium"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Create Post
          </h2>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !image)}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-2 rounded-full font-semibold disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Posting...</span>
              </div>
            ) : (
              'Post'
            )}
          </button>
        </div>

        {/* ✅ MODAL CONTENT */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto bg-white dark:bg-gray-900">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </div>
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* ✅ TEXT CONTENT INPUT */}
          <div className="mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[120px] p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              disabled={isSubmitting}
              maxLength={2200}
            />
            
            {/* Character Count */}
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {content.length > 2000 && (
                  <span className={content.length > 2200 ? 'text-red-500' : 'text-yellow-500'}>
                    {content.length}/2200
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ✅ IMAGE SELECTION */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
            disabled={isSubmitting}
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mb-6">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-80 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
              />
              <button
                onClick={removeImage}
                disabled={isSubmitting}
                className="absolute top-3 right-3 bg-black/70 hover:bg-black/80 text-white p-2 rounded-full transition-colors duration-200 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ✅ ACTIONS BAR */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="image-upload"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer text-gray-700 dark:text-gray-300"
              >
                <Image className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Photo</span>
              </label>
              
              <button
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-700 dark:text-gray-300"
              >
                <Smile className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Feeling</span>
              </button>
              
              <button
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-700 dark:text-gray-300"
              >
                <MapPin className="h-5 w-5 text-green-500" />
                <span className="font-medium">Location</span>
              </button>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {(!content.trim() && !image) ? "Add content to post" : "Ready to share!"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;