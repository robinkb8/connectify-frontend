// ===== REPLACE src/components/pages/HomeFeed/components/PostCard.jsx =====
import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Bookmark
} from "lucide-react";
import { Button } from '../../../ui/Button/Button';
import CommentsModal from '../../../modals/CommentsModal';
import ShareModal from '../../../modals/ShareModal';
import PostOptionsMenu from '../../../modals/PostOptionsMenu';

// ✅ DJANGO API INTEGRATION - PostCard that works with your existing API
function PostCard({ post }) {
  // ✅ Map your Django API data to the new design
  const user = {
    name: post.author?.username || 'Unknown User',
    username: post.author?.username || 'unknown',
    avatar: post.author?.avatar || null
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
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // ✅ DJANGO API INTEGRATION - Like/Unlike functionality
  const handleLike = async () => {
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${post.id}/like/`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // ✅ Enhanced Image Rendering with Multiple Layout Support
  const renderImages = () => {
    if (!content.images || content.images.length === 0) return null;

    const imageCount = content.images.length;

    if (imageCount === 1) {
      return (
        <div className="rounded-xl overflow-hidden">
          <img
            src={content.images[0]}
            alt="Post content"
            className="w-full h-auto max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onError={(e) => {
              e.target.src = '/api/placeholder/600/400';
            }}
          />
        </div>
      );
    }

    if (imageCount === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
          {content.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post content ${index + 1}`}
              className="w-full h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onError={(e) => {
                e.target.src = '/api/placeholder/300/200';
              }}
            />
          ))}
        </div>
      );
    }

    if (imageCount === 3) {
      return (
        <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
          <img
            src={content.images[0]}
            alt="Post content 1"
            className="w-full h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
          />
          <div className="grid grid-rows-2 gap-2">
            <img
              src={content.images[1]}
              alt="Post content 2"
              className="w-full h-47 object-cover cursor-pointer hover:opacity-95 transition-opacity"
            />
            <img
              src={content.images[2]}
              alt="Post content 3"
              className="w-full h-47 object-cover cursor-pointer hover:opacity-95 transition-opacity"
            />
          </div>
        </div>
      );
    }

    if (imageCount >= 4) {
      return (
        <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
          {content.images.slice(0, 3).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post content ${index + 1}`}
              className={`w-full object-cover cursor-pointer hover:opacity-95 transition-opacity ${
                index === 0 ? "h-96 row-span-2" : "h-47"
              }`}
            />
          ))}
          <div className="relative">
            <img
              src={content.images[3]}
              alt="Post content 4"
              className="w-full h-47 object-cover cursor-pointer"
            />
            {imageCount > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors">
                <span className="text-white text-xl font-bold">+{imageCount - 4}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* ✅ NEW DESIGN - Glassmorphism Card */}
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-4">
        
        {/* ✅ Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">
                @{user.username} • {timestamp}
              </p>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowOptions(!showOptions)}
              className="text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            <PostOptionsMenu
              isOpen={showOptions}
              onClose={() => setShowOptions(false)}
              isOwnPost={user.username === "you"} // Update this based on your auth system
            />
          </div>
        </div>

        {/* ✅ Content */}
        {content.text && <p className="leading-relaxed">{content.text}</p>}

        {/* ✅ Images */}
        {renderImages()}

        {/* ✅ Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isLiked ? "text-red-500 hover:text-red-400" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(true)}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{stats.comments}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShare(true)}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <Share2 className="h-5 w-5" />
              <span>{stats.shares}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSaved(!isSaved)}
            className={`${isSaved ? "text-purple-500 hover:text-purple-400" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ✅ Modals */}
      <CommentsModal 
        isOpen={showComments} 
        onClose={() => setShowComments(false)} 
        postId={post.id}
      />

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        postContent={content.text || "Check out this post on Connectify!"}
      />
    </>
  );
}

export default PostCard;