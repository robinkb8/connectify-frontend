// ===== src/components/pages/HomeFeed/components/PostCard/PostCard.jsx - ENHANCED WITH SHARE MODAL =====
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Bookmark,
  Edit2,        // 🆕 NEW: Edit icon
  Trash2        // 🆕 NEW: Delete icon
} from "lucide-react";
import AnimatedHeart from '../../../../ui/AnimatedHeart/AnimatedHeart';
import AnimatedButton from '../../../../ui/AnimatedButton/AnimatedButton';
import useLikes from '../../../../../hooks/useLikes';
import { useAuth } from '../../../../../contexts/AuthContext';  // 🆕 NEW: Auth context
import { postsAPI } from '../../../../../utils/api/posts';  // 🆕 NEW: Posts API - FIXED PATH
import EditPostModal from '../../../../modals/EditPostModal';  // 🆕 NEW: Edit modal
import ShareModal from '../../../../modals/ShareModal';  // 🆕 SURGICAL FIX: Share modal

const PostCard = React.memo(({ post, onCommentClick, onPostClick, onStatsUpdate, onPostUpdated, onPostDeleted }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();  // 🆕 NEW: Get current user

  // PRESERVED: Memoize mapped data to prevent recreation on every render
  const user = useMemo(() => ({
    name: post.author?.name || post.author?.username || 'Unknown User',
    username: post.author?.username || 'unknown',
    avatar: post.author?.avatar || null,
    verified: post.author?.verified || false
  }), [post.author]);

  const content = useMemo(() => ({
    text: post.content || '',
    images: post.image_url ? [post.image_url] : []
  }), [post.content, post.image_url]);

  const stats = useMemo(() => ({
    likes: post.total_likes || 0,
    comments: post.total_comments || 0,
    shares: post.total_shares || 0
  }), [post.total_likes, post.total_comments, post.total_shares]);

  const timestamp = post.time_since_posted || 'Unknown time';

  // 🆕 NEW: Check if current user owns this post
  const isOwnPost = useMemo(() => {
    return currentUser && post.author && currentUser.id === post.author.id;
  }, [currentUser, post.author]);

  // ENHANCED: Use useLikes hook for real API integration
  const {
    isLiked,
    likesCount,
    isLoading: isLikeLoading,
    toggleLike,
    error: likeError
  } = useLikes(post.id, post.is_liked || false, stats.likes);

  // PRESERVED: All other component state
  const [isSaved, setIsSaved] = useState(false);
  const [sharesCount, setSharesCount] = useState(stats.shares);
  const [showOptions, setShowOptions] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // 🆕 NEW: Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🆕 SURGICAL FIX: Share modal state
  const [showShareModal, setShowShareModal] = useState(false);

  // PRESERVED: Profile navigation handler
  const handleAuthorClick = useCallback((e) => {
    e.stopPropagation();
    if (user.username && user.username !== 'unknown') {
      navigate(`/profile/${user.username}`);
    }
  }, [navigate, user.username]);

  // ENHANCED: Real API integration for likes
  const handleLike = useCallback(async () => {
    if (isLikeLoading) return; // Prevent multiple simultaneous requests

    const result = await toggleLike();

    // Update parent component with new stats
    if (onStatsUpdate && result.success) {
      onStatsUpdate({
        total_likes: result.likesCount,
        is_liked: result.isLiked
      });
    }

    // Log any errors (errorHandler utility can be integrated here later)
    if (!result.success) {
      console.error('Like operation failed:', result.error);
    }
  }, [toggleLike, isLikeLoading, onStatsUpdate]);

  // PRESERVED: All other memoized handlers
  const handleComment = useCallback(() => {
    onCommentClick?.(post);
  }, [onCommentClick, post]);

  // 🆕 SURGICAL FIX: Share handler now opens modal
  const handleShare = useCallback((e) => {
    e.stopPropagation(); // Prevent event bubbling
    setShowShareModal(true);
  }, []);

  const handleSave = useCallback(() => {
    setIsSaved(!isSaved);
  }, [isSaved]);

  const handlePostClick = useCallback(() => {
    onPostClick?.(post);
  }, [onPostClick, post]);

  const handleOptionsToggle = useCallback(() => {
    setShowOptions(!showOptions);
  }, [showOptions]);

  const handleOptionsBlur = useCallback(() => {
    setTimeout(() => setShowOptions(false), 100);
  }, []);

  // 🆕 NEW: Edit post handler
  const handleEditPost = useCallback(() => {
    setShowOptions(false);
    setShowEditModal(true);
  }, []);

  // 🆕 NEW: Delete post handler
  const handleDeletePost = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setShowOptions(false);

    try {
      const response = await postsAPI.deletePost(post.id);
      
      if (response.success) {
        // Notify parent component about deletion
        onPostDeleted?.(post.id);
      } else {
        alert(response.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }, [post.id, onPostDeleted]);

  // 🆕 NEW: Handle post update from edit modal
  const handlePostUpdated = useCallback((updatedPost) => {
    onPostUpdated?.(updatedPost);
    setShowEditModal(false);
  }, [onPostUpdated]);

  // 🆕 SURGICAL FIX: Handle successful share
  const handleShareSuccess = useCallback(() => {
    setSharesCount(prev => prev + 1);
    setShowShareModal(false);
  }, []);

  // PRESERVED: Memoized image rendering
  const renderImages = useCallback(() => {
    if (!content.images.length) return null;

    const imageCount = content.images.length;

    return (
      <div className="mt-4 mb-4 overflow-hidden rounded-xl">
        {imageCount === 1 && (
          <img 
            src={content.images[0]} 
            alt="Post content"
            className="w-full max-h-96 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={handlePostClick}
          />
        )}
        
        {imageCount > 1 && (
          <div className="grid grid-cols-2 gap-2">
            {content.images.slice(0, 3).map((image, index) => (
              <div key={index} className="relative">
                <img 
                  src={image} 
                  alt={`Post content ${index + 1}`}
                  className="w-full h-24 object-cover cursor-pointer hover:opacity-95 transition-all duration-200 hover:scale-105"
                  onClick={handlePostClick}
                />
                {index === 1 && imageCount > 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer hover:bg-opacity-40 transition-all duration-200" onClick={handlePostClick}>
                    <span className="text-white font-bold text-lg">+{imageCount - 3}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [content.images, handlePostClick]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* PRESERVED: Header with profile navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105 cursor-pointer"
            onClick={handleAuthorClick}
          >
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 
                className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                onClick={handleAuthorClick}
              >
                {user.name}
              </h3>
              {user.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span 
                className="hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer transition-colors duration-200"
                onClick={handleAuthorClick}
              >
                @{user.username}
              </span>
              <span> • {timestamp}</span>
            </p>
          </div>
        </div>

        {/* 🆕 ENHANCED: Conditional Options menu based on ownership */}
        <div className="relative">
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={handleOptionsToggle}
            onBlur={handleOptionsBlur}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-8 h-8 rounded-full"
            pressScale={0.9}
            disabled={isDeleting}
          >
            <MoreHorizontal className="h-5 w-5" />
          </AnimatedButton>
          
          {showOptions && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-32 animate-slideIn">
              {isOwnPost ? (
                /* 🆕 NEW: Own post options - Edit & Delete */
                <>
                  <button 
                    onClick={handleEditPost}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors duration-150 flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button 
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-colors duration-150 flex items-center gap-2 text-red-600 dark:text-red-400 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              ) : (
                /* PRESERVED: Other user's post options - Share, Report, Hide */
                <>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors duration-150">
                    Share
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                    Report
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-colors duration-150">
                    Hide
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PRESERVED: Content */}
      {content.text && (
        <p 
          className="text-gray-900 dark:text-white leading-relaxed cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200" 
          onClick={handlePostClick}
        >
          {content.text}
        </p>
      )}

      {/* PRESERVED: Images */}
      {renderImages()}

      {/* PRESERVED: Actions with Enhanced Like Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          
          {/* ENHANCED: Heart Button with real API integration and loading state */}
          <div className="flex items-center space-x-2">
            <AnimatedHeart
              isLiked={isLiked}
              onClick={handleLike}
              size={20}
              showParticles={true}
              className={`transition-transform duration-200 hover:scale-110 ${
                isLikeLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'
              }`}
              disabled={isLikeLoading}
            />
            <span className={`text-sm font-medium transition-colors duration-200 ${
              isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {likesCount}
            </span>
            {likeError && (
              <span className="text-xs text-red-500 ml-1" title={likeError}>⚠</span>
            )}
          </div>

          {/* PRESERVED: Comment Button */}
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-all duration-200"
            pressScale={0.95}
            ripple={true}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{stats.comments}</span>
          </AnimatedButton>

          {/* 🆕 SURGICAL FIX: Share Button with consistent design */}
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-all duration-200"
            pressScale={0.95}
            ripple={true}
          >
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">{sharesCount}</span>
          </AnimatedButton>
        </div>

        {/* PRESERVED: Save Button */}
        <AnimatedButton
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className={`transition-all duration-200 w-8 h-8 rounded-full ${
            isSaved ? "text-blue-500 scale-110" : "text-gray-500 dark:text-gray-400 hover:text-blue-500"
          }`}
          pressScale={0.9}
        >
          <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
        </AnimatedButton>
      </div>

      {/* 🆕 NEW: Edit Post Modal */}
      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={post}
          onPostUpdated={handlePostUpdated}
        />
      )}

      {/* 🆕 SURGICAL FIX: Share Modal */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={post}
          postContent={content.text}
          postUrl={`${window.location.origin}/post/${post.id}`}
          authorName={user.name}
          onShareSuccess={handleShareSuccess}
        />
      )}

      {/* PRESERVED: Additional Animations CSS */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}, (prevProps, nextProps) => {
  // PRESERVED: Custom comparison function
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.total_likes === nextProps.post.total_likes &&
    prevProps.post.total_comments === nextProps.post.total_comments &&
    prevProps.post.total_shares === nextProps.post.total_shares &&
    prevProps.post.is_liked === nextProps.post.is_liked &&
    prevProps.post.content === nextProps.post.content &&
    prevProps.post.image_url === nextProps.post.image_url &&
    prevProps.post.time_since_posted === nextProps.post.time_since_posted
  );
});

PostCard.displayName = 'PostCard';

export default PostCard;