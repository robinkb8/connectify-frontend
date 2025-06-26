// src/components/modals/PostCreationModal.jsx
import React, { useState, useRef } from 'react';
import { X, Image, Smile, MapPin } from 'lucide-react';
import { Button } from '../ui/Button/Button';
import { postsAPI } from '../../utils/api';

function PostCreationModal({ isOpen, onClose, onPostCreated }) {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setContent('');
    setSelectedImage(null);
    setImagePreview(null);
    setError('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setSelectedImage(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedImage) {
      setError('Please add some content or an image');
      return;
    }

    if (content.length > 2200) {
      setError('Post is too long. Maximum 2200 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const postData = {
        content: content.trim(),
        image: selectedImage
      };

      const response = await postsAPI.createPost(postData);
      
      console.log('✅ Post created successfully:', response);
      
      // Call the callback to refresh the feed
      if (onPostCreated) {
        onPostCreated(response);
      }

      // Close modal and reset form
      handleClose();
      
    } catch (error) {
      console.error('❌ Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const characterCount = content.length;
  const isNearLimit = characterCount > 2000;
  const isOverLimit = characterCount > 2200;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Create Post</h2>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isSubmitting}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold">Y</span>
            </div>
            <div>
              <p className="font-medium">Your Name</p>
              <p className="text-sm text-muted-foreground">Public</p>
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[120px] p-3 bg-transparent border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSubmitting}
            />
            
            {/* Character Count */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {isNearLimit && (
                  <span className={isOverLimit ? 'text-red-500' : 'text-yellow-500'}>
                    {characterCount}/2200
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-64 object-cover rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                onClick={removeImage}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 text-white" />
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-500/10 rounded">
              {error}
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Image className="h-5 w-5" />
                <span>Photo</span>
              </button>
              
              <button
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Smile className="h-5 w-5" />
                <span>Feeling</span>
              </button>
              
              <button
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <MapPin className="h-5 w-5" />
                <span>Location</span>
              </button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isOverLimit || (!content.trim() && !selectedImage)}
              className="min-w-[80px]"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default PostCreationModal;