// ===== src/components/modals/EnhancedCommentsModal.jsx - REAL API INTEGRATION =====
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, MessageCircle, Heart, Reply, Trash2, Send, MoreHorizontal } from 'lucide-react';
import useComments from '../../hooks/useComments';

// PRESERVED: Memoized Individual Comment Component
const CommentItem = React.memo(({ comment, onLike, onReply, onDelete, isOwnComment, level = 0 }) => {
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likes || 0);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // PRESERVED: All memoized event handlers
  const handleLike = useCallback(() => {
    const newLikedState = !isLiked;
    const newCount = newLikedState ? likesCount + 1 : likesCount - 1;
    
    setIsLiked(newLikedState);
    setLikesCount(newCount);
    onLike(comment.id, newLikedState);
  }, [isLiked, likesCount, onLike, comment.id]);

  const handleReplySubmit = useCallback(() => {
    if (!replyText.trim()) return;
    
    onReply(comment.id, replyText.trim());
    setReplyText('');
    setShowReplyInput(false);
  }, [replyText, onReply, comment.id]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Delete this comment?')) {
      setIsDeleting(true);
      setTimeout(() => onDelete(comment.id), 300);
    }
  }, [onDelete, comment.id]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReplySubmit();
    }
  }, [handleReplySubmit]);

  const handleToggleReply = useCallback(() => {
    setShowReplyInput(!showReplyInput);
  }, [showReplyInput]);

  const handleShowMore = useCallback(() => {
    setShowMore(!showMore);
  }, [showMore]);

  // Determine if content should be truncated
  const shouldTruncate = comment.content && comment.content.length > 200;
  const displayContent = shouldTruncate && !showMore 
    ? comment.content.slice(0, 200) + '...' 
    : comment.content;

  return (
    <div className={`
      transition-all duration-300 ease-out
      ${isDeleting ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}
      ${comment.isNew ? 'animate-slideIn' : ''}
      ${level > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}
    `}>
      <div className="flex space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
          {comment.user.avatar ? (
            <img 
              src={comment.user.avatar} 
              alt={comment.user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-xs">
              {comment.user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 space-y-2 min-w-0">
          {/* User info */}
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {comment.user.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              @{comment.user.username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {comment.timestamp}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
            )}
          </div>

          {/* Comment text */}
          <div className="text-gray-900 dark:text-gray-100 leading-relaxed text-sm">
            <p>{displayContent}</p>
            {shouldTruncate && (
              <button
                onClick={handleShowMore}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium mt-1"
              >
                {showMore ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Like - Disabled for now since comments likes not implemented in backend */}
            <button
              onClick={handleLike}
              disabled
              className="flex items-center space-x-1 text-xs text-gray-400 cursor-not-allowed"
            >
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>

            {/* Reply */}
            <button
              onClick={handleToggleReply}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors"
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>

            {/* More options */}
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <MoreHorizontal className="w-3 h-3" />
            </button>

            {/* Delete (if own comment) */}
            {isOwnComment && (
              <button
                onClick={handleDelete}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="animate-slideDown">
              <div className="flex space-x-2 mt-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">You</span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.user.name}...`}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm resize-none focus:outline-none focus:border-blue-500"
                    rows={2}
                    onKeyDown={handleKeyPress}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={handleToggleReply}
                      className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReplySubmit}
                      disabled={!replyText.trim()}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Render Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-1 mt-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onLike={onLike}
                  onReply={onReply}
                  onDelete={onDelete}
                  isOwnComment={reply.user.username === 'you'}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // PRESERVED: Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.comment.id === nextProps.comment.id &&
    prevProps.comment.likes === nextProps.comment.likes &&
    prevProps.comment.isLiked === nextProps.comment.isLiked &&
    prevProps.comment.content === nextProps.comment.content &&
    prevProps.isOwnComment === nextProps.isOwnComment &&
    prevProps.level === nextProps.level
  );
});

CommentItem.displayName = 'CommentItem';

// ENHANCED: Comments Modal with REAL API Integration
const EnhancedCommentsModal = React.memo(({ isOpen, onClose, postId, postAuthor }) => {
  const [newComment, setNewComment] = useState('');
  const textareaRef = useRef(null);

  // ENHANCED: Use real API through useComments hook
  const {
    comments,
    isLoading,
    isSubmitting,
    error,
    sortBy,
    fetchComments,
    addComment,
    deleteComment,
    sortComments,
    clearError
  } = useComments(postId);

  // ENHANCED: Load comments when modal opens
  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId, fetchComments]);

  // PRESERVED: Auto-focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // PRESERVED: Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newComment]);

  // ENHANCED: Real comment submission
  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim() || isSubmitting) return;

    const result = await addComment(newComment.trim());
    
    if (result.success) {
      setNewComment('');
      clearError();
    }
  }, [newComment, isSubmitting, addComment, clearError]);

  // ENHANCED: Real like handler (placeholder since backend doesn't support comment likes yet)
  const handleLikeComment = useCallback(async (commentId, isLiked) => {
    // Placeholder - backend doesn't support comment likes yet
    console.log(`${isLiked ? 'Liked' : 'Unliked'} comment ${commentId}`);
  }, []);

  // ENHANCED: Real reply handler
  const handleReplyToComment = useCallback(async (parentId, replyText) => {
    const result = await addComment(replyText, parentId);
    if (!result.success) {
      console.error('Failed to post reply:', result.error);
    }
  }, [addComment]);

  // ENHANCED: Real delete handler
  const handleDeleteComment = useCallback(async (commentId) => {
    const result = await deleteComment(commentId);
    if (!result.success) {
      console.error('Failed to delete comment:', result.error);
    }
  }, [deleteComment]);

  // ENHANCED: Real sort handler
  const handleSortChange = useCallback((newSortBy) => {
    sortComments(newSortBy);
  }, [sortComments]);

  // PRESERVED: Memoized key press handler
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitComment();
    }
  }, [handleSubmitComment]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Comments
            </h2>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-sm">
              {comments.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="oldest">Oldest</option>
            </select>
            
            <button
              onClick={onClose}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto max-h-[50vh]">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
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

        {/* Comment Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          
          {/* Error Message */}
          {error && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-slideDown">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            {/* User Avatar */}
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">You</span>
            </div>
            
            {/* Input Container */}
            <div className="flex-1">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 resize-none focus:outline-none focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors text-sm"
                rows={2}
                disabled={isSubmitting}
                onKeyDown={handleKeyPress}
              />
              
              {/* Bottom Actions Row */}
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Press Cmd+Enter to post quickly
                </span>
                
                {/* Send Button */}
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 min-w-[80px] justify-center
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
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRESERVED: Custom Animations */}
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
}, (prevProps, nextProps) => {
  // PRESERVED: Custom comparison for modal
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.postId === nextProps.postId &&
    prevProps.postAuthor === nextProps.postAuthor
  );
});

EnhancedCommentsModal.displayName = 'EnhancedCommentsModal';

export default EnhancedCommentsModal;