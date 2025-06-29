// ===== src/components/pages/HomeFeed/components/PostCard/PostCard.jsx - WITH ANIMATIONS =====
import React, { useState } from 'react';
import { 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Bookmark
} from "lucide-react";
import AnimatedHeart from '../../../../ui/AnimatedHeart/AnimatedHeart';
import AnimatedButton from '../../../../ui/AnimatedButton/AnimatedButton';

// ✅ Enhanced PostCard with ALL animations integrated
function PostCard({ post, onCommentClick, onPostClick, onStatsUpdate }) {
  // ✅ Map your Django API data to the new design
  const user = {
    name: post.author?.name || post.author?.username || 'Unknown User',
    username: post.author?.username || 'unknown',
    avatar: post.author?.avatar || null,
    verified: post.author?.verified || false
  };

  const content = {
    text: post.content || '',
    images: post.image_url ? [post.image_url] : []
  };

  const stats = {
    likes: post.total_likes || 0,
    comments: post.total_comments || 0,
    shares: post.total_shares || 0
  };

  const timestamp = post.time_since_posted || 'Unknown time';

  // ✅ Component State with animation support
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(stats.likes);
  const [sharesCount, setSharesCount] = useState(stats.shares);
  const [showOptions, setShowOptions] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // ✅ Handle Like with instant feedback + parent update
  const handleLike = async () => {
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
  };

  // ✅ Handle Comment with smooth animation
  const handleComment = () => {
    onCommentClick?.(post);
  };

  // ✅ Handle Share with loading state
  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Simulate share API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSharesCount(prev => prev + 1);
    } finally {
      setIsSharing(false);
    }
  };

  // ✅ Handle Save with instant feedback
  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  // ✅ Handle Post Click
  const handlePostClick = () => {
    onPostClick?.(post);
  };

  // ✅ Handle Options Menu
  const handleOptionsBlur = (e) => {
    // Close menu when clicking outside
    setTimeout(() => setShowOptions(false), 100);
  };

  // ✅ Render Images with hover effects
  const renderImages = () => {
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
  };

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
            onClick={() => setShowOptions(!showOptions)}
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
}

export default PostCard;