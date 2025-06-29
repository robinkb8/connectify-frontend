 
// ===== src/components/modals/EnhancedPostCreationModal.jsx =====
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  X, 
  Image, 
  Video, 
  Smile, 
  MapPin, 
  Users, 
  Globe, 
  Lock,
  Trash2,
  Plus,
  Upload,
  CheckCircle,
  AlertCircle,
  Camera
} from 'lucide-react';
import { Button } from '../ui/Button/Button';

// ✅ Post Privacy Options
const PRIVACY_OPTIONS = {
  PUBLIC: { 
    value: 'public', 
    label: 'Public', 
    description: 'Anyone can see this post',
    icon: <Globe className="w-4 h-4" />
  },
  FOLLOWERS: { 
    value: 'followers', 
    label: 'Followers', 
    description: 'Only your followers can see this post',
    icon: <Users className="w-4 h-4" />
  },
  PRIVATE: { 
    value: 'private', 
    label: 'Only me', 
    description: 'Only you can see this post',
    icon: <Lock className="w-4 h-4" />
  }
};

// ✅ Media Upload Component
const MediaUpload = ({ files, onFilesChange, maxFiles = 4 }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // ✅ Handle file selection
  const handleFiles = useCallback((newFiles) => {
    const validFiles = Array.from(newFiles).filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      return isValidType && isValidSize;
    });

    if (files.length + validFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files`);
      return;
    }

    // Simulate upload progress
    validFiles.forEach((file, index) => {
      const fileId = `${Date.now()}-${index}`;
      file.id = fileId;
      file.preview = URL.createObjectURL(file);
      
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      // Simulate upload
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min((prev[fileId] || 0) + 20, 100);
          if (newProgress === 100) {
            clearInterval(interval);
            setTimeout(() => {
              setUploadProgress(prev => {
                const { [fileId]: removed, ...rest } = prev;
                return rest;
              });
            }, 500);
          }
          return { ...prev, [fileId]: newProgress };
        });
      }, 200);
    });

    onFilesChange([...files, ...validFiles]);
  }, [files, onFilesChange, maxFiles]);

  // ✅ Drag and Drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // ✅ Remove file
  const removeFile = (index) => {
    const fileToRemove = files[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Images and videos up to 50MB • Max {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {files.map((file, index) => (
            <div key={file.id || index} className="relative group">
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {file.type?.startsWith('image/') ? (
                  <img
                    src={file.preview || URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : file.type?.startsWith('video/') ? (
                  <video
                    src={file.preview || URL.createObjectURL(file)}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                {/* Upload Progress */}
                {uploadProgress[file.id] !== undefined && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="w-16 h-16 relative">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-200 dark:text-gray-600"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - uploadProgress[file.id] / 100)}`}
                            className="text-blue-500 transition-all duration-300"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {uploadProgress[file.id]}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* File type indicator */}
                <div className="absolute top-2 left-2">
                  {file.type?.startsWith('video/') && (
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                      <Video className="w-3 h-3" />
                      <span>Video</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {/* Add More Button */}
          {files.length < maxFiles && (
            <div 
              className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ✅ Character Counter Component
const CharacterCounter = ({ current, max, warning = 0.8 }) => {
  const percentage = current / max;
  const isWarning = percentage >= warning;
  const isOver = current > max;

  return (
    <div className="flex items-center space-x-2">
      {/* Circle Progress */}
      <div className="relative w-5 h-5">
        <svg className="w-5 h-5 transform -rotate-90">
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-200 dark:text-gray-600"
          />
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 8}`}
            strokeDashoffset={`${2 * Math.PI * 8 * (1 - Math.min(percentage, 1))}`}
            className={`transition-all duration-300 ${
              isOver ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-blue-500'
            }`}
          />
        </svg>
      </div>
      
      {/* Count */}
      <span className={`text-sm font-medium ${
        isOver ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'
      }`}>
        {current}/{max}
      </span>
    </div>
  );
};

// ✅ Emoji Picker (Simple Implementation)
const SimpleEmojiPicker = ({ onEmojiSelect, isOpen, onClose }) => {
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 w-80">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Choose Emoji</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

// ✅ Main Enhanced Post Creation Modal
function EnhancedPostCreationModal({ isOpen, onClose, onPostCreate }) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [privacy, setPrivacy] = useState(PRIVACY_OPTIONS.PUBLIC.value);
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState('');
  
  const textareaRef = useRef(null);
  const maxChars = 280;

  // ✅ Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // ✅ Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ✅ Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ✅ Handle post submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!content.trim() && files.length === 0) {
      setError('Please add some content or media to your post.');
      return;
    }

    if (content.length > maxChars) {
      setError(`Post is too long. Please keep it under ${maxChars} characters.`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create post object
      const newPost = {
        id: Date.now().toString(),
        content: content.trim(),
        files: files,
        privacy: privacy,
        location: location.trim(),
        timestamp: new Date().toISOString(),
        author: {
          name: 'You',
          username: 'you',
          avatar: '',
          verified: false
        },
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        hasMedia: files.length > 0
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate occasional failures for testing
      if (Math.random() < 0.05) {
        throw new Error('Failed to create post');
      }

      // Call parent callback
      onPostCreate?.(newPost);

      // Reset form
      setContent('');
      setFiles([]);
      setPrivacy(PRIVACY_OPTIONS.PUBLIC.value);
      setLocation('');
      setShowLocationInput(false);
      setError('');
      
      // Close modal
      onClose();

      console.log('✅ Post created successfully:', newPost);
      
    } catch (error) {
      console.error('❌ Failed to create post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [content, files, privacy, location, onPostCreate, onClose, maxChars]);

  // ✅ Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    const cursorPosition = textareaRef.current?.selectionStart || content.length;
    const newContent = content.slice(0, cursorPosition) + emoji + content.slice(cursorPosition);
    setContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // ✅ Handle hashtag and mention detection (visual only)
  const processContent = (text) => {
    return text
      .replace(/#(\w+)/g, '<span class="text-blue-500">#$1</span>')
      .replace(/@(\w+)/g, '<span class="text-blue-500">@$1</span>');
  };

  // ✅ Check if post can be submitted
  const canSubmit = (content.trim() || files.length > 0) && content.length <= maxChars && !isSubmitting;

  const selectedPrivacy = Object.values(PRIVACY_OPTIONS).find(option => option.value === privacy);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[95vh] overflow-hidden">
        
        {/* ✅ Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Create Post
          </h2>
          <div className="flex items-center space-x-3">
            {/* Character Counter */}
            <CharacterCounter current={content.length} max={maxChars} />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ✅ Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start space-x-2 animate-slideDown">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">You</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Your Name</h3>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                    className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    {selectedPrivacy?.icon}
                    <span>{selectedPrivacy?.label}</span>
                  </button>
                  
                  {/* Privacy Dropdown */}
                  {showPrivacyDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-64">
                      {Object.values(PRIVACY_OPTIONS).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setPrivacy(option.value);
                            setShowPrivacyDropdown(false);
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              {option.icon}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {option.label}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-3">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                className="w-full p-0 border-none outline-none resize-none text-xl placeholder-gray-500 dark:placeholder-gray-400 bg-transparent text-gray-900 dark:text-gray-100 min-h-[120px] max-h-64"
                disabled={isSubmitting}
              />
              
              {/* Character limit warning */}
              {content.length > maxChars && (
                <div className="flex items-center space-x-2 text-red-500 animate-slideDown">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Character limit exceeded</span>
                </div>
              )}
            </div>

            {/* Location Input */}
            {showLocationInput && (
              <div className="space-y-2 animate-slideDown">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Add location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where are you?"
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
            )}

            {/* Media Upload */}
            <MediaUpload 
              files={files}
              onFilesChange={setFiles}
              maxFiles={4}
            />
          </form>
        </div>

        {/* ✅ Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            
            {/* Media Actions */}
            <div className="flex items-center space-x-4 relative">
              
              {/* Image/Video Upload */}
              <button
                type="button"
                onClick={() => document.querySelector('input[type="file"]')?.click()}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                disabled={isSubmitting}
                title="Add photos or videos"
              >
                <Camera className="w-5 h-5" />
              </button>

              {/* Emoji */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                disabled={isSubmitting}
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Location */}
              <button
                type="button"
                onClick={() => setShowLocationInput(!showLocationInput)}
                className={`p-2 rounded-full transition-colors ${
                  showLocationInput
                    ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
                disabled={isSubmitting}
                title="Add location"
              >
                <MapPin className="w-5 h-5" />
              </button>

              {/* Emoji Picker */}
              <SimpleEmojiPicker
                isOpen={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
                onEmojiSelect={handleEmojiSelect}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-8 py-2 ${
                isSubmitting
                  ? 'bg-blue-400 cursor-wait'
                  : canSubmit
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700'
                    : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
              } text-white font-semibold transition-all duration-200`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Posting...</span>
                </div>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* ✅ Custom Animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            max-height: 200px;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default EnhancedPostCreationModal;