import React, { useState, useCallback } from 'react';

// ✅ HEART ICONS (keep existing)
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

const CommentIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

// ✅ UPDATED POSTCARD - Now receives post as prop instead of using DUMMY_POST
const PostCard = ({ post, onLike }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // ✅ LIKE HANDLER (Phase 2 will connect to API)
  const handleLike = useCallback(() => {
    setIsAnimating(true);
    
    // TODO: Phase 2 - Call onLike prop to update Django backend
    console.log(`❤️ Like button clicked for post ${post.id}`);
    if (onLike) {
      onLike(post.id);
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  }, [post.id, onLike]);

  // ✅ DOUBLE TAP TO LIKE  
  const handleImageDoubleClick = useCallback(() => {
    if (!post.likes.isLiked) {
      handleLike();
    }
  }, [post.likes.isLiked, handleLike]);

  const handleComment = useCallback(() => {
    console.log(`💬 Comment clicked for post ${post.id}`);
  }, [post.id]);

  const handleShare = useCallback(() => {
    console.log(`📤 Share clicked for post ${post.id}`);
  }, [post.id]);

  // ✅ HANDLE MISSING DATA GRACEFULLY
  if (!post) {
    return null;
  }

  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
      {/* ✅ USER HEADER - Using real Django data */}
      <div className="flex items-center space-x-3 p-4 pb-3">
        <img 
          src={post.user.avatar} 
          alt={post.user.username}
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            e.target.src = '/api/placeholder/32/32';
          }}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{post.user.username}</h3>
          <p className="text-xs text-gray-500">{post.timestamp}</p>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      {/* ✅ POST CONTENT - Using real Django data */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 leading-relaxed">{post.content}</p>
      </div>

      {/* ✅ POST IMAGE - Only show if image exists */}
      {post.image && (
        <div className="relative bg-gray-100">
          <img 
            src={post.image} 
            alt="Post content"
            className="w-full object-cover cursor-pointer select-none"
            style={{ aspectRatio: '16/9' }}
            onDoubleClick={handleImageDoubleClick}
            onError={(e) => {
              // Hide image if it fails to load
              e.target.style.display = 'none';
            }}
          />
          
          {/* Double-tap Heart Animation */}
          {isAnimating && post.likes.isLiked && (
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
      )}

      {/* ✅ INTERACTION BAR - Using real Django data */}
      <div className="p-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button 
              onClick={handleLike}
              className={`transition-all duration-200 transform ${
                isAnimating ? 'scale-110' : 'scale-100'
              } ${
                post.likes.isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-600 hover:text-red-400'
              }`}
              aria-label={post.likes.isLiked ? 'Unlike post' : 'Like post'}
            >
              <HeartIcon 
                filled={post.likes.isLiked} 
                className="w-6 h-6 transition-all duration-200" 
              />
            </button>
            
            <button 
              onClick={handleComment}
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              <CommentIcon className="w-6 h-6" />
            </button>
            
            <button 
              onClick={handleShare}
              className="text-gray-600 hover:text-purple-600 transition-colors duration-200"
            >
              <ShareIcon className="w-6 h-6" />
            </button>
          </div>
          
          <button className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* ✅ LIKE COUNT - Using real Django data */}
        <div className="mt-3">
          <p className="font-semibold text-gray-900 text-sm">
            {post.likes.count.toLocaleString()} {post.likes.count === 1 ? 'like' : 'likes'}
          </p>
        </div>

        {/* ✅ POST CONTENT WITH USERNAME */}
        <div className="mt-1">
          <p className="text-gray-900 text-sm">
            <span className="font-semibold">{post.user.username}</span>{' '}
            <span className="text-gray-800">{post.content}</span>
          </p>
        </div>

        {/* ✅ COMMENTS PREVIEW */}
        <div className="mt-1">
          <button 
            onClick={handleComment}
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            View all {post.comments} comments
          </button>
        </div>

        {/* ✅ TIMESTAMP */}
        <div className="mt-1">
          <p className="text-gray-400 text-xs uppercase tracking-wide">
            {post.timestamp}
          </p>
        </div>
      </div>

      {/* ✅ ADD COMMENT SECTION */}
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