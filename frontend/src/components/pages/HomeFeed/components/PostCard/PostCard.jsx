// src/components/pages/HomeFeed/components/PostCard/PostCard.jsx
import React, { useState, useCallback } from 'react';

// ✅ UPDATED: Static dummy post data with LIKE system (Instagram-style)
const DUMMY_POST = {
  id: '1',
  user: {
    username: 'alex_photographer',
    avatar: '/api/placeholder/32/32',
    verified: false
  },
  content: 'Just captured this amazing sunset over the mountains! Sometimes nature provides the most incredible backdrops for photography. What do you think?',
  image: '/api/placeholder/400/300',
  timestamp: '2h ago',
  likes: {
    count: 1247,
    isLiked: false  // Whether current user has liked this post
  },
  comments: 89,
  shares: 34
};

// ✅ HEART ICONS: Filled and Outline (Instagram-style)
const HeartIcon = ({ filled = false, className = "w-6 h-6" }) => {
  if (filled) {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    );
  }
  
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
};

// ✅ COMMENT ICON: Proper SVG
const CommentIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

// ✅ SHARE ICON: Proper SVG
const ShareIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const PostCard = () => {
  // ✅ LIKE STATE MANAGEMENT: Track likes and user's like status
  const [likeState, setLikeState] = useState({
    count: DUMMY_POST.likes.count,
    isLiked: DUMMY_POST.likes.isLiked
  });

  // ✅ HEART ANIMATION STATE
  const [isAnimating, setIsAnimating] = useState(false);

  // ✅ LIKE/UNLIKE HANDLER: Toggle like with animation
  const handleLike = useCallback(() => {
    setIsAnimating(true);
    
    setLikeState(currentState => {
      if (currentState.isLiked) {
        // Unlike: Remove like
        return {
          count: currentState.count - 1,
          isLiked: false
        };
      } else {
        // Like: Add like
        return {
          count: currentState.count + 1,
          isLiked: true
        };
      }
    });

    // Reset animation after short delay
    setTimeout(() => setIsAnimating(false), 300);
  }, []);

  // ✅ DOUBLE TAP TO LIKE (Instagram-style)
  const handleImageDoubleClick = useCallback(() => {
    if (!likeState.isLiked) {
      handleLike();
    }
  }, [likeState.isLiked, handleLike]);

  // ✅ COMMENT HANDLER: Same as before
  const handleComment = useCallback(() => {
    console.log('Comments clicked');
  }, []);

  // ✅ SHARE HANDLER: Same as before
  const handleShare = useCallback(() => {
    console.log('Share clicked');
  }, []);

  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
      {/* User Header */}
      <div className="flex items-center space-x-3 p-4 pb-3">
        <img 
          src={DUMMY_POST.user.avatar} 
          alt={DUMMY_POST.user.username}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{DUMMY_POST.user.username}</h3>
          <p className="text-xs text-gray-500">{DUMMY_POST.timestamp}</p>
        </div>
        
        {/* Optional: Three dots menu */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 leading-relaxed">{DUMMY_POST.content}</p>
      </div>

      {/* Post Image with Double-tap Like */}
      <div className="relative bg-gray-100">
        <img 
          src={DUMMY_POST.image} 
          alt="Post content"
          className="w-full object-cover cursor-pointer select-none"
          style={{ aspectRatio: '16/9' }}
          onDoubleClick={handleImageDoubleClick}
        />
        
        {/* Double-tap Heart Animation */}
        {isAnimating && likeState.isLiked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-ping">
              <HeartIcon 
                filled={true} 
                className="w-16 h-16 text-red-500 opacity-80" 
              />
            </div>
          </div>
        )}
      </div>

      {/* Interaction Bar with Instagram-style Like */}
      <div className="p-4 pt-3">
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Like Button with Heart */}
            <button 
              onClick={handleLike}
              className={`transition-all duration-200 transform ${
                isAnimating ? 'scale-110' : 'scale-100'
              } ${
                likeState.isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-600 hover:text-red-400'
              }`}
              aria-label={likeState.isLiked ? 'Unlike post' : 'Like post'}
            >
              <HeartIcon 
                filled={likeState.isLiked} 
                className="w-6 h-6 transition-all duration-200" 
              />
            </button>
            
            {/* Comment Button */}
            <button 
              onClick={handleComment}
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              aria-label="Comment on post"
            >
              <CommentIcon className="w-6 h-6" />
            </button>
            
            {/* Share Button */}
            <button 
              onClick={handleShare}
              className="text-gray-600 hover:text-purple-600 transition-colors duration-200"
              aria-label="Share post"
            >
              <ShareIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Bookmark Button (Instagram-style) */}
          <button 
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
            aria-label="Save post"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Like Count */}
        <div className="mt-3">
          <p className="font-semibold text-gray-900 text-sm">
            {likeState.count.toLocaleString()} {likeState.count === 1 ? 'like' : 'likes'}
          </p>
        </div>

        {/* Post Content with Username */}
        <div className="mt-1">
          <p className="text-gray-900 text-sm">
            <span className="font-semibold">{DUMMY_POST.user.username}</span>{' '}
            <span className="text-gray-800">{DUMMY_POST.content}</span>
          </p>
        </div>

        {/* Comments Preview */}
        <div className="mt-1">
          <button 
            onClick={handleComment}
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            View all {DUMMY_POST.comments} comments
          </button>
        </div>

        {/* Post Timestamp */}
        <div className="mt-1">
          <p className="text-gray-400 text-xs uppercase tracking-wide">
            {DUMMY_POST.timestamp}
          </p>
        </div>
      </div>

      {/* Add Comment Section (Instagram-style) */}
      <div className="border-t border-gray-100 p-4 pt-3">
        <div className="flex items-center space-x-3">
          <img 
            src="/api/placeholder/24/24" 
            alt="Your avatar"
            className="w-6 h-6 rounded-full object-cover"
          />
          <input 
            type="text"
            placeholder="Add a comment..."
            className="flex-1 text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none"
          />
          <button className="text-blue-500 text-sm font-semibold hover:text-blue-700 transition-colors">
            Post
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;