// src/components/forms/CreateStoryModal/CreateStoryModal.jsx
import React, { useState, useCallback } from 'react';

// ✅ API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const CreateStoryModal = ({ isOpen, onClose, onStoryCreated }) => {
  // ✅ STATE FOR FORM DATA
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ✅ HANDLE IMAGE SELECTION
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, or GIF)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size cannot exceed 10MB');
        return;
      }

      setImage(file);
      setError(null);
      
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
    setError(null);
  }, []);

  // ✅ SUBMIT STORY TO DJANGO API
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validation
    if (!image) {
      setError('Please select an image for your story');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', image);
      
      if (caption.trim()) {
        formData.append('caption', caption.trim());
      }

      console.log('🔄 Submitting story to Django API...');
      
      const response = await fetch(`${API_BASE_URL}/stories/create/`, {
        method: 'POST',
        body: formData,
        // NOTE: Don't set Content-Type header for FormData - browser sets it automatically
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newStory = await response.json();
      console.log('✅ Story created successfully:', newStory);

      // Reset form
      setImage(null);
      setImagePreview(null);
      setCaption('');
      
      // Call parent callback
      if (onStoryCreated) {
        onStoryCreated(newStory);
      }
      
      // Close modal
      onClose();

    } catch (error) {
      console.error('❌ Error creating story:', error);
      setError(error.message || 'Failed to create story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [image, caption, onStoryCreated, onClose]);

  // ✅ HANDLE MODAL CLOSE
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setImage(null);
      setImagePreview(null);
      setCaption('');
      setError(null);
      onClose();
    }
  }, [isSubmitting, onClose]);

  // ✅ DON'T RENDER IF NOT OPEN
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Create Story</h2>
          <button 
            onClick={handleClose} 
            className="close-button"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Image Upload Section */}
          <div className="upload-section">
            {!imagePreview ? (
              <div className="upload-area">
                <input
                  type="file"
                  id="story-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="file-input"
                />
                <label htmlFor="story-image" className="upload-label">
                  <div className="upload-icon">📸</div>
                  <p className="upload-text">
                    Click to select an image
                  </p>
                  <p className="upload-hint">
                    JPG, PNG, or GIF up to 10MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="preview-container">
                <img 
                  src={imagePreview} 
                  alt="Story preview"
                  className="preview-image"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="remove-image-button"
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Caption Input */}
          <div className="caption-section">
            <label htmlFor="caption" className="caption-label">
              Caption (optional)
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption to your story..."
              disabled={isSubmitting}
              className="caption-input"
              maxLength={200}
              rows={3}
            />
            <div className="caption-counter">
              {caption.length}/200
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!image || isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? 'Creating...' : 'Share Story'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        /* Modal Content */
        .modal-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Modal Header */
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 18px;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }

        .close-button:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Modal Body */
        .modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        /* Upload Section */
        .upload-section {
          margin-bottom: 24px;
        }

        .upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          transition: border-color 0.2s ease, background-color 0.2s ease;
          cursor: pointer;
        }

        .upload-area:hover {
          border-color: #a855f7;
          background: #faf5ff;
        }

        .file-input {
          display: none;
        }

        .upload-label {
          cursor: pointer;
          display: block;
        }

        .upload-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .upload-text {
          font-size: 16px;
          color: #374151;
          margin: 0 0 8px;
          font-weight: 500;
        }

        .upload-hint {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        /* Preview Container */
        .preview-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: #f9fafb;
        }

        .preview-image {
          width: 100%;
          height: 300px;
          object-fit: cover;
          display: block;
        }

        .remove-image-button {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }

        .remove-image-button:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.9);
        }

        .remove-image-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Caption Section */
        .caption-section {
          margin-bottom: 24px;
        }

        .caption-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .caption-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
          transition: border-color 0.2s ease;
        }

        .caption-input:focus {
          outline: none;
          border-color: #a855f7;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
        }

        .caption-input:disabled {
          background: #f9fafb;
          opacity: 0.7;
        }

        .caption-counter {
          text-align: right;
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        /* Error Message */
        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 20px;
        }

        /* Modal Actions */
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .cancel-button,
        .submit-button {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .cancel-button {
          background: #f3f4f6;
          color: #374151;
        }

        .cancel-button:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .submit-button {
          background: linear-gradient(45deg, #a855f7, #ec4899);
          color: white;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(45deg, #9333ea, #db2777);
          transform: translateY(-1px);
        }

        .submit-button:disabled,
        .cancel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Mobile Responsiveness */
        @media (max-width: 640px) {
          .modal-overlay {
            padding: 10px;
          }

          .modal-content {
            max-height: 95vh;
          }

          .modal-header,
          .modal-body {
            padding: 16px;
          }

          .upload-area {
            padding: 30px 15px;
          }

          .upload-icon {
            font-size: 40px;
          }

          .preview-image {
            height: 250px;
          }

          .modal-actions {
            flex-direction: column;
          }

          .cancel-button,
          .submit-button {
            width: 100%;
            order: 2;
          }

          .cancel-button {
            order: 1;
          }
        }

        /* Accessibility */
        .modal-content:focus {
          outline: 2px solid #a855f7;
          outline-offset: 2px;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .modal-content,
          .upload-area,
          .submit-button {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateStoryModal;