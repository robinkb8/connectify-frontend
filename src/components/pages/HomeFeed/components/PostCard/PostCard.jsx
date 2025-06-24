// src/components/pages/HomeFeed/components/PostCard/PostCard.jsx - DEBUG VERSION WITH VISIBLE BUTTONS
import React, { useState, useCallback } from 'react';

// ✅ API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ✅ SAFE DATA ACCESS HELPERS
const safeGet = (obj, path, defaultValue = '') => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
};

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath || avatarPath === 'null' || avatarPath === null) {
    return '/api/placeholder/40/40';
  }
  return avatarPath;
};

const PostCard = ({ post, onLike, onComment }) => {
  // ✅ SAFE DATA EXTRACTION with fallbacks
  const postData = {
    id: post?.id || 0,
    content: post?.content || '',
    image: post?.image || null,
    timestamp: post?.timestamp || 'Unknown time',
    user: {
      username: safeGet(post, 'user.username', 'Unknown User'),
      avatar: getAvatarUrl(safeGet(post, 'user.avatar')),
      verified: safeGet(post, 'user.verified', false)
    },
    likes: {
      count: safeGet(post, 'likes.count', 0),
      isLiked: safeGet(post, 'likes.isLiked', false)
    },
    comments: post?.comments || 0,
    shares: post?.shares || 0
  };

  console.log('🔍 PostCard received post:', post);
  console.log('🔍 PostCard processed data:', postData);

  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [localLikes, setLocalLikes] = useState(postData.likes);

  // ✅ LIKE HANDLER - Connect to Django API
  const handleLike = useCallback(async () => {
    console.log('🔍 Like button clicked!', { postId: postData.id, isLiked: localLikes.isLiked });
    setIsLikeAnimating(true);
    
    try {
      const method = localLikes.isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`${API_BASE_URL}/posts/${postData.id}/like/`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔍 Like API response:', data);
      
      // Update local state immediately for smooth UX
      setLocalLikes({
        count: data.total_likes || 0,
        isLiked: data.is_liked || false
      });

      console.log(`✅ Like ${data.is_liked ? 'added' : 'removed'} successfully`);
      
      // Call parent component callback if provided
      if (onLike) {
        onLike(postData.id, data.is_liked, data.total_likes);
      }
      
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      // Revert optimistic update on error
      setLocalLikes(postData.likes);
    } finally {
      setTimeout(() => setIsLikeAnimating(false), 300);
    }
  }, [postData.id, localLikes.isLiked, onLike, postData.likes]);

  // ✅ DOUBLE TAP TO LIKE  
  const handleImageDoubleClick = useCallback(() => {
    console.log('🔍 Image double clicked!');
    if (!localLikes.isLiked) {
      handleLike();
    }
  }, [localLikes.isLiked, handleLike]);

  // ✅ LOAD COMMENTS
  const loadComments = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postData.id}/comments/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const commentsData = Array.isArray(data) ? data : (data.results || []);
      setComments(commentsData);
      console.log(`✅ Loaded ${commentsData.length} comments`);
      
    } catch (error) {
      console.error('❌ Error loading comments:', error);
      setComments([]); // Set empty array on error
    }
  }, [postData.id]);

  // ✅ TOGGLE COMMENTS SECTION
  const handleToggleComments = useCallback(async () => {
    console.log('🔍 Comment button clicked!');
    if (!showComments) {
      await loadComments();
    }
    setShowComments(!showComments);
  }, [showComments, loadComments]);

  // ✅ ADD NEW COMMENT
  const handleAddComment = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postData.id}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newCommentData = await response.json();
      
      // Add new comment to local state
      setComments(prev => [...prev, newCommentData]);
      
      // Clear input
      setNewComment('');
      
      console.log('✅ Comment added successfully');
      
      // Call parent callback if provided
      if (onComment) {
        onComment(postData.id, newCommentData);
      }
      
    } catch (error) {
      console.error('❌ Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  }, [newComment, isSubmittingComment, postData.id, onComment]);

  const handleShare = useCallback(() => {
    console.log(`📤 Share clicked for post ${postData.id}`);
    // TODO: Implement share functionality
  }, [postData.id]);

  // ✅ HANDLE MISSING DATA GRACEFULLY
  if (!post || !postData.id) {
    console.log('🔍 PostCard: No post data, returning null');
    return null;
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto 20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      {/* DEBUG INFO */}
      <div style={{
        padding: '10px',
        backgroundColor: '#f0f0f0',
        fontSize: '12px',
        color: '#666',
        borderBottom: '1px solid #eee'
      }}>
        DEBUG: Post ID: {postData.id} | Likes: {localLikes.count} | Liked: {localLikes.isLiked ? 'Yes' : 'No'}
      </div>

      {/* ✅ HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={postData.user.avatar} 
            alt={`${postData.user.username}'s avatar`}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #f3f4f6'
            }}
            onError={(e) => {
              e.target.src = '/api/placeholder/40/40';
            }}
          />
          <div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#111827',
              margin: '0'
            }}>
              {postData.user.username}
            </h3>
            <time style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '2px',
              display: 'block'
            }}>
              {postData.timestamp}
            </time>
          </div>
        </div>
        <button style={{
          background: 'none',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%'
        }}>
          ⋯
        </button>
      </div>

      {/* ✅ CONTENT */}
      {postData.content && (
        <div style={{ padding: '0 20px 16px' }}>
          <p style={{
            margin: '0',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#374151'
          }}>
            {postData.content}
          </p>
        </div>
      )}

      {/* ✅ IMAGE with double-tap to like */}
      {postData.image && (
        <div style={{ position: 'relative', cursor: 'pointer' }} onDoubleClick={handleImageDoubleClick}>
          <img 
            src={postData.image} 
            alt="Post content"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'cover',
              maxHeight: '600px'
            }}
            onError={(e) => {
              e.target.src = '/api/placeholder/600/400';
            }}
          />
          
          {/* Double-tap heart animation */}
          {isLikeAnimating && localLikes.isLiked && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 10,
              fontSize: '80px',
              animation: 'heartPop 0.6s ease-out'
            }}>
              ❤️
            </div>
          )}
        </div>
      )}

      {/* ✅ ACTIONS - SIMPLIFIED AND VERY VISIBLE */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fafafa'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* LIKE BUTTON - VERY VISIBLE */}
          <button 
            onClick={handleLike}
            disabled={isLikeAnimating}
            style={{
              background: localLikes.isLiked ? '#ef4444' : '#374151',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {localLikes.isLiked ? '❤️' : '🤍'} {localLikes.count} Likes
          </button>
          
          {/* COMMENT BUTTON - VERY VISIBLE */}
          <button 
            onClick={handleToggleComments}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            💬 {postData.comments} Comments
          </button>
          
          {/* SHARE BUTTON - VERY VISIBLE */}
          <button 
            onClick={handleShare}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📤 Share
          </button>
        </div>
      </div>

      {/* ✅ ENGAGEMENT STATS */}
      <div style={{ padding: '0 20px 16px' }}>
        {localLikes.count > 0 && (
          <p style={{
            margin: '0 0 4px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#111827'
          }}>
            {localLikes.count.toLocaleString()} {localLikes.count === 1 ? 'like' : 'likes'}
          </p>
        )}
        
        {postData.comments > 0 && (
          <button 
            onClick={handleToggleComments}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '0'
            }}
          >
            View all {postData.comments} comments
          </button>
        )}
      </div>

      {/* ✅ COMMENTS SECTION */}
      {showComments && (
        <div style={{
          borderTop: '1px solid #f3f4f6',
          padding: '16px 20px',
          backgroundColor: '#f9fafb'
        }}>
          {/* Comments List */}
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            marginBottom: '16px'
          }}>
            {comments.map(comment => {
              // Safe comment data extraction
              const commentData = {
                id: comment?.id || Math.random(),
                content: comment?.content || '',
                author: {
                  username: safeGet(comment, 'author.username', 'Unknown User'),
                  avatar: getAvatarUrl(safeGet(comment, 'author.avatar'))
                },
                time: comment?.time_since_posted || 'Unknown time'
              };

              return (
                <div key={commentData.id} style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '12px',
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '8px'
                }}>
                  <img 
                    src={commentData.author.avatar} 
                    alt={commentData.author.username}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = '/api/placeholder/24/24';
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0', fontSize: '14px' }}>
                      <strong>{commentData.author.username}</strong> {commentData.content}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
                      {commentData.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <img 
              src="/api/placeholder/24/24" 
              alt="Your avatar"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={isSubmittingComment}
              style={{
                flex: 1,
                border: '1px solid #e5e7eb',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                outline: 'none'
              }}
              maxLength={500}
            />
            {newComment.trim() && (
              <button
                type="submit"
                disabled={isSubmittingComment}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {isSubmittingComment ? 'Posting...' : 'Post'}
              </button>
            )}
          </form>
        </div>
      )}

      <style>{`
        @keyframes heartPop {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default PostCard;