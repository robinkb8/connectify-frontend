// ===== src/components/pages/HomeFeed/components/PostCard/PostCard.jsx - FULLY UPDATED =====
import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Bookmark
} from "lucide-react";
import { Button } from '../../../../ui/Button/Button';

// ✅ Enhanced PostCard with ALL required props and instant feedback
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
    images: post.image_url ? [post.image_url] : [] // Your API returns single image_url
  };

  const stats = {
    likes: post.total_likes || 0,
    comments: post.total_comments || 0,
    shares: post.total_shares || 0
  };

  const timestamp = post.time_since_posted || 'Unknown time';

  // ✅ Component State
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(stats.likes);
  const [sharesCount, setSharesCount] = useState(stats.shares);
  const [showOptions, setShowOptions] = useState(false);

  // ✅ Handle Like with instant feedback + parent update
  const handleLike = async () => {
    // ✅ INSTANT UI UPDATE
    const newLikedState = !isLiked;
    const newCount = newLikedState ? likesCount + 1 : likesCount - 1;
    
    setIsLiked(newLikedState);
    setLikesCount(newCount);

    // ✅ Update parent component
    if (onStatsUpdate) {
      onStatsUpdate({
        total_likes: newCount,
        is_liked: newLikedState
      });
    }

    try {
      // Background API call (replace with real API)
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${post.id}/like/`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        // Revert on API failure
        setIsLiked(!newLikedState);
        setLikesCount(likesCount);
        if (onStatsUpdate) {
          onStatsUpdate({
            total_likes: likesCount,
            is_liked: !newLikedState
          });
        }
        console.error('Failed to update like');
      } else {
        console.log('✅ Like updated successfully');
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikesCount(likesCount);
      if (onStatsUpdate) {
        onStatsUpdate({
          total_likes: likesCount,
          is_liked: !newLikedState
        });
      }
      console.error('❌ Error updating like:', error);
    }
  };

  // ✅ Handle Comment with instant feedback
  const handleComment = () => {
    if (onCommentClick) {
      onCommentClick(post);
    } else {
      console.log('💬 Comment clicked for post:', post.id);
    }
  };

  // ✅ Handle Share with instant feedback + parent update
  const handleShare = async () => {
    // ✅ INSTANT UI UPDATE
    const newShareCount = sharesCount + 1;
    setSharesCount(newShareCount);

    // ✅ Update parent component
    if (onStatsUpdate) {
      onStatsUpdate({
        total_shares: newShareCount
      });
    }
    
    try {
      // Show native share if available
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${user.name}`,
          text: content.text,
          url: window.location.href
        });
        console.log('✅ Content shared successfully');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(content.text);
        console.log('✅ Content copied to clipboard');
      }
    } catch (error) {
      // Revert on error
      setSharesCount(sharesCount);
      if (onStatsUpdate) {
        onStatsUpdate({
          total_shares: sharesCount
        });
      }
      console.error('❌ Error sharing:', error);
    }
  };

  // ✅ Handle Save
  const handleSave = () => {
    setIsSaved(!isSaved);
    console.log(`📌 Post ${isSaved ? 'unsaved' : 'saved'}`);
  };

  // ✅ Handle Post Click
  const handlePostClick = () => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      console.log('📄 Post clicked:', post.id);
    }
  };

  // ✅ Close options when clicking outside
  const handleOptionsBlur = () => {
    setTimeout(() => setShowOptions(false), 150);
  };

  // ✅ Render Images
  const renderImages = () => {
    if (!content.images || content.images.length === 0) return null;

    const imageCount = content.images.length;

    if (imageCount === 1) {
      return (
        <div className="mt-4 rounded-xl overflow-hidden">
          <img
            src={content.images[0]}
            alt="Post content"
            className="w-full max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={handlePostClick}
          />
        </div>
      );
    }

    if (imageCount === 2) {
      return (
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
          {content.images.slice(0, 2).map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Post content ${index + 1}`}
              className="w-full h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={handlePostClick}
            />
          ))}
        </div>
      );
    }

    // 3+ images: show first image large, others in grid
    return (
      <div className="mt-4 rounded-xl overflow-hidden">
        <img
          src={content.images[0]}
          alt="Post content 1"
          className="w-full h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
          onClick={handlePostClick}
        />
        {imageCount > 1 && (
          <div className="grid grid-cols-2 gap-1 mt-1">
            {content.images.slice(1, 3).map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt={`Post content ${index + 2}`}
                  className="w-full h-24 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={handlePostClick}
                />
                {index === 1 && imageCount > 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer" onClick={handlePostClick}>
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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
      {/* ✅ Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
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
              <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
              {user.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOptions(!showOptions)}
            onBlur={handleOptionsBlur}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
          
          {/* Options Menu */}
          {showOptions && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-32">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg">
                Share
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                Report
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg">
                Hide
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Content */}
      {content.text && (
        <p 
          className="text-gray-900 dark:text-white leading-relaxed cursor-pointer" 
          onClick={handlePostClick}
        >
          {content.text}
        </p>
      )}

      {/* ✅ Images */}
      {renderImages()}

      {/* ✅ Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
              isLiked ? "text-red-500 hover:text-red-400" : "text-gray-500 dark:text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">{likesCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{stats.comments}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">{sharesCount}</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          className={`transition-colors ${
            isSaved ? "text-blue-500" : "text-gray-500 dark:text-gray-400 hover:text-blue-500"
          }`}
        >
          <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
        </Button>
      </div>
    </div>
  );
}

export default PostCard;