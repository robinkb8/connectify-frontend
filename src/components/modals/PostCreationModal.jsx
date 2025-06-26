 
// ===== src/components/modals/PostCreationModal.jsx =====
import React, { useState, useRef } from 'react';
import { X, ImageIcon, Smile, MapPin, Globe, Users, Lock } from "lucide-react";
import { Button } from '../ui/Button/Button';
import { Textarea } from '../ui/Textarea/Textarea';
import { postsAPI } from '../utils/api';

function PostCreationModal({ isOpen, onClose, onPostCreated }) {
  const [postText, setPostText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.slice(0, 4 - selectedImages.length);

    if (newFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...newFiles]);

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews((prev) => [...prev, e.target?.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!postText.trim() && selectedImages.length === 0) return;

    try {
      setLoading(true);

      // ✅ DJANGO API INTEGRATION - Create FormData for file upload
      const formData = new FormData();
      formData.append('content', postText);
      
      // Add the first image if available (your API handles single image)
      if (selectedImages.length > 0) {
        formData.append('image', selectedImages[0]);
      }

      const response = await fetch('http://127.0.0.1:8000/api/posts/create/', {
        method: 'POST',
        body: formData // Don't set Content-Type header, let browser set it
      });

      if (response.ok) {
        const newPost = await response.json();
        console.log('✅ Post created successfully:', newPost);
        
        // Reset form
        setPostText("");
        setSelectedImages([]);
        setImagePreviews([]);
        setPrivacy("public");
        
        // Notify parent component
        if (onPostCreated) {
          onPostCreated();
        }
        
        // Close modal
        onClose();
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('❌ Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPrivacyIcon = () => {
    switch (privacy) {
      case "public":
        return <Globe className="w-4 h-4" />;
      case "friends":
        return <Users className="w-4 h-4" />;
      case "private":
        return <Lock className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Create Post</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <div>
              <h3 className="font-semibold">Your Name</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const options = ["public", "friends", "private"];
                  const currentIndex = options.indexOf(privacy);
                  const nextIndex = (currentIndex + 1) % options.length;
                  setPrivacy(options[nextIndex]);
                }}
                className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto"
                disabled={loading}
              >
                {getPrivacyIcon()}
                <span className="ml-1 capitalize">{privacy}</span>
              </Button>
            </div>
          </div>

          <Textarea
            placeholder="What's on your mind?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="border-none text-lg resize-none focus:ring-0 focus:outline-none p-0 min-h-[120px]"
            disabled={loading}
          />

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    disabled={loading}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={loading}
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedImages.length >= 4 || loading}
                className="text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <ImageIcon className="h-5 w-5 mr-2" />
                Photo
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={loading}
                className="text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <Smile className="h-5 w-5 mr-2" />
                Emoji
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={loading}
                className="text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Location
              </Button>
            </div>
          </div>

          <Button
            onClick={handlePost}
            disabled={(!postText.trim() && selectedImages.length === 0) || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Posting...</span>
              </div>
            ) : (
              'Post'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PostCreationModal;