// ===== Enhanced CommentsModal with Immediate Visual Feedback =====
import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Heart, Reply, Trash2, Send } from 'lucide-react';
import { commentsAPI } from '../../../utils/api/comments';

// ✅ Individual Comment Component with Smooth Animations
const CommentItem = ({ comment, onLike, onReply, onDelete, isOwnComment }) => {
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likes || 0);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ Instant like feedback
  const handleLike = () => {
    const newLikedState = !isLiked;
    const newCount = newLikedState ? likesCount + 1 : likesCount - 1;
    
    // Immediate UI update
    setIsLiked(newLikedState);
    setLikesCount(newCount);
    
    // Call parent handler (can handle API in background)
    onLike(comment.id, newLikedState);
  };

  // ✅ Smooth reply submission
  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    
    onReply(comment.id, replyText);
    setReplyText('');
    setShowReplyInput(false);
  };

  // ✅ Smooth delete with animation
  const handleDelete = () => {
    if (window.confirm('Delete this comment?')) {
      setIsDeleting(true);
      // Small delay for smooth animation before removal
      setTimeout(() => onDelete(comment.id), 300);
    }
  };

  return (
    <div className={`
      transition-all duration-300 ease-out
      ${isDeleting ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}
      ${comment.isNew ? 'animate-slideIn' : ''}
    `}>
      <div className="flex space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">
            {comment.user.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Comment Content */}
        <div className="flex-1 space-y-2">
          {/* User info */}
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {comment.user.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              @{comment.user.username}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {comment.timestamp}
            </span>
          </div>

          {/* Comment text */}
          <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`
                flex items-center space-x-1 text-sm transition-all duration-200 hover:scale-105
                ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}
              `}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>

            {/* Reply */}
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
            >
              <Reply className="w-4 h-4" />
              <span>Reply</span>
            </button>

            {/* Delete (if own comment) */}
            {isOwnComment && (
              <button
                onClick={handleDelete}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="animate-slideDown">
              <div className="flex space-x-2 mt-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleReplySubmit();
                    }
                  }}
                />
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Reply
                </button>
              </div>
            </div>
          )}

          {/* Render Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-4 space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onLike={onLike}
                  onReply={onReply}
                  onDelete={onDelete}
                  isOwnComment={reply.user.username === 'you'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ Enhanced Comments Modal with Instant Feedback
function CommentsModal({ isOpen, onClose, postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);

  // ✅ Load comments when modal opens
  useEffect(() => {
    if (isOpen && postId) {
      loadComments();
    }
  }, [isOpen, postId]);

  // ✅ Auto-focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ✅ Load comments from API
  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await commentsAPI.getComments(postId);
      setComments(data);
    } catch (error) {
      setError('Failed to load comments');
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ INSTANT comment submission with optimistic UI
  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    // Create optimistic comment for instant UI feedback
    const optimisticComment = {
      id: `temp-${Date.now()}`, // Temporary ID
      user: {
        name: 'You',
        username: 'you',
        avatar: null
      },
      content: newComment.trim(),
      timestamp: 'just now',
      likes: 0,
      isLiked: false,
      isNew: true, // Flag for animation
      isOptimistic: true // Flag to identify optimistic updates
    };

    // ✅ INSTANT UI UPDATE - Add comment immediately
    setComments(prev => [optimisticComment, ...prev]);
    setNewComment(''); // Clear input immediately
    setError(''); // Clear any previous errors
    setIsSubmitting(true);

    try {
      // Make API call in background
      const response = await commentsAPI.addComment(postId, newComment.trim());
      
      // ✅ Replace optimistic comment with real data
      setComments(prev => prev.map(comment => 
        comment.id === optimisticComment.id 
          ? { ...response, isNew: true } // Keep animation flag
          : comment
      ));

      // Success feedback (subtle)
      console.log('✅ Comment posted successfully');

    } catch (error) {
      // ✅ Remove optimistic comment and show error
      setComments(prev => prev.filter(comment => comment.id !== optimisticComment.id));
      setError('Failed to post comment. Please try again.');
      setNewComment(optimisticComment.content); // Restore the text
      console.error('Error posting comment:', error);
      
      // Auto-clear error after 3 seconds
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Handle like with optimistic UI
  const handleLikeComment = async (commentId, isLiked) => {
    // API call can happen in background
    try {
      // Add your like API call here
      console.log(`${isLiked ? 'Liked' : 'Unliked'} comment ${commentId}`);
    } catch (error) {
      console.error('Error liking comment:', error);
      // Could revert the UI change here if needed
    }
  };

  // ✅ Handle reply with instant feedback
  const handleReplyToComment = async (parentId, replyText) => {
    const optimisticReply = {
      id: `temp-reply-${Date.now()}`,
      user: {
        name: 'You',
        username: 'you',
        avatar: null
      },
      content: replyText,
      timestamp: 'just now',
      likes: 0,
      isLiked: false,
      isReply: true,
      parentId,
      isNew: true,
      isOptimistic: true
    };

    // ✅ Instant UI update
    setComments(prev => prev.map(comment => 
      comment.id === parentId 
        ? { ...comment, replies: [optimisticReply, ...(comment.replies || [])] }
        : comment
    ));

    try {
      // API call in background
      const response = await commentsAPI.addComment(postId, replyText, parentId);
      
      // Replace optimistic reply with real data
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { 
              ...comment, 
              replies: comment.replies.map(reply => 
                reply.id === optimisticReply.id ? response : reply
              )
            }
          : comment
      ));
    } catch (error) {
      // Remove optimistic reply on error
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { 
              ...comment, 
              replies: comment.replies.filter(reply => reply.id !== optimisticReply.id)
            }
          : comment
      ));
      console.error('Error posting reply:', error);
    }
  };

  // ✅ Handle delete with smooth animation
  const handleDeleteComment = async (commentId) => {
    // The CommentItem handles the UI animation
    try {
      await commentsAPI.deleteComment(commentId);
      // Remove from state after animation
      setTimeout(() => {
        setComments(prev => prev.filter(comment => {
          if (comment.id === commentId) return false;
          if (comment.replies) {
            comment.replies = comment.replies.filter(reply => reply.id !== commentId);
          }
          return true;
        }));
      }, 300);
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Could show error feedback here
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Comments ({comments.length})
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto max-h-[50vh]">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-1">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onLike={handleLikeComment}
                  onReply={handleReplyToComment}
                  onDelete={handleDeleteComment}
                  isOwnComment={comment.user.username === 'you'}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No comments yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Be the first to comment on this post!
              </p>
            </div>
          )}
        </div>

        {/* ✅ Enhanced Comment Input with Instant Feedback */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          
          {/* Error Message */}
          {error && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-slideDown">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">You</span>
            </div>
            
            {/* Input Container */}
            <div className="flex-1">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 resize-none focus:outline-none focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                rows={3}
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              
              {/* Bottom Actions Row */}
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Press Cmd+Enter to post quickly
                </span>
                
                {/* ✅ Instant Feedback Send Button */}
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className={`
                    flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 min-w-[100px] justify-center
                    ${!newComment.trim() 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : isSubmitting
                        ? 'bg-blue-400 text-white cursor-wait'
                        : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 active:scale-95'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Custom Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default CommentsModal;