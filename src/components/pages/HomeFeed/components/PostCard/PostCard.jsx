// ===== src/components/pages/HomeFeed/components/PostCard/PostCard.jsx - OPTIMIZED =====
import React, { useState, useCallback, useMemo } from 'react';
import { 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Bookmark
} from "lucide-react";
import AnimatedHeart from '../../../../ui/AnimatedHeart/AnimatedHeart';
import AnimatedButton from '../../../../ui/AnimatedButton/AnimatedButton';

// ✅ OPTIMIZED: Enhanced PostCard with performance improvements
const PostCard = React.memo(({ post, onCommentClick, onPostClick, onStatsUpdate }) => {
  // ✅ OPTIMIZED: Memoize mapped data to prevent recreation on every render
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

  // ✅ Component State with animation support
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(stats.likes);
  const [sharesCount, setSharesCount] = useState(stats.shares);
  const [showOptions, setShowOptions] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // ✅ OPTIMIZED: Memoized event handlers to prevent recreation
  const handleLike = useCallback(async () => {
    const newLikedState = !isLiked;
    const newCount = newLikedState ? likesCount + 1 : likesCount - 1;
    
    setIsLiked(newLikedState);
    setLikesCount(newCount);

    if (onStatsUpdate) {
      onStatsUpdate({
        total_likes: newCount,
        is_liked: newLikedState
      });
    }

    try {
      // Background API call (replace with real API)
      const method = newLikedState ? 'POST' : 'DELETE';
      const response = await fetch(`/api/posts/${post.id}/like/`, {
        method,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        // Revert on error
        setIsLiked(!newLikedState);
        setLikesCount(newLikedState ? newCount - 1 : newCount + 1);
      }
    } catch (error) {
      console.error('Like error:', error);
      // Revert on error
      setIsLiked(!newLikedState);
      setLikesCount(newLikedState ? newCount - 1 : newCount + 1);
    }
  }, [isLiked, likesCount, onStatsUpdate, post.id]);

  // ✅ OPTIMIZED: Memoized comment handler
  const handleComment = useCallback(() => {
    onCommentClick?.(post);
  }, [onCommentClick, post]);

  // ✅ OPTIMIZED: Memoized share handler
  const handleShare = useCallback(async () => {
    setIsSharing(true);
    try {
      // Simulate share API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSharesCount(prev => prev + 1);
    } finally {
      setIsSharing(false);
    }
  }, []);

  // ✅ OPTIMIZED: Memoized save handler
  const handleSave = useCallback(() => {
    setIsSaved(!isSaved);
  }, [isSaved]);

  // ✅ OPTIMIZED: Memoized post click handler
  const handlePostClick = useCallback(() => {
    onPostClick?.(post);
  }, [onPostClick, post]);

  // ✅ OPTIMIZED: Memoized options handlers
  const handleOptionsToggle = useCallback(() => {
    setShowOptions(!showOptions);
  }, [showOptions]);

  const handleOptionsBlur = useCallback(() => {
    // Close menu when clicking outside
    setTimeout(() => setShowOptions(false), 100);
  }, []);

  // ✅ OPTIMIZED: Memoized image rendering to prevent recreation
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
      {/* ✅ Header with improved animations */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
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
              <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-pointer">
                {user.name}
              </h3>
              {user.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{user.username} • {timestamp}
            </p>
          </div>
        </div>

        <div className="relative">
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={handleOptionsToggle}
            onBlur={handleOptionsBlur}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-8 h-8 rounded-full"
            pressScale={0.9}
          >
            <MoreHorizontal className="h-5 w-5" />
          </AnimatedButton>
          
          {/* ✅ Options Menu with smooth slide-in */}
          {showOptions && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-32 animate-slideIn">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors duration-150">
                Share
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                Report
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-colors duration-150">
                Hide
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Content with smooth hover effects */}
      {content.text && (
        <p 
          className="text-gray-900 dark:text-white leading-relaxed cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200" 
          onClick={handlePostClick}
        >
          {content.text}
        </p>
      )}

      {/* ✅ Images with enhanced animations */}
      {renderImages()}

      {/* ✅ Actions with Advanced Animations */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          
          {/* ✅ Enhanced Heart Button */}
          <div className="flex items-center space-x-2">
            <AnimatedHeart
              isLiked={isLiked}
              onClick={handleLike}
              size={20}
              showParticles={true}
              className="transition-transform duration-200 hover:scale-110"
            />
            <span className={`text-sm font-medium transition-colors duration-200 ${
              isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {likesCount}
            </span>
          </div>

          {/* ✅ Comment Button with feedback */}
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

          {/* ✅ Share Button with loading state */}
          <AnimatedButton
            variant="ghost"
            size="sm"
            onAsyncClick={handleShare}
            loading={isSharing}
            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-all duration-200"
            pressScale={0.95}
            ripple={true}
          >
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">{sharesCount}</span>
          </AnimatedButton>
        </div>

        {/* ✅ Save Button with state feedback */}
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

      {/* ✅ Additional Animations CSS */}
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
  // ✅ OPTIMIZED: Custom comparison function to prevent unnecessary re-renders
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