// ===== src/components/modals/CommentsModal/CommentsModal.jsx =====
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Send, 
  MoreHorizontal,
  Reply,
  Trash2,
  Flag
} from 'lucide-react';
import { Button } from '../../ui/Button/Button';

// ✅ Mock Comments Data
const mockComments = [
  {
    id: '1',
    user: {
      name: 'Sarah Johnson',
      username: 'sarahj',
      avatar: null
    },
    content: 'This is such an amazing project! Really love the design and functionality. Can\'t wait to see what you build next! 🚀',
    timestamp: '2h ago',
    likes: 12,
    isLiked: false,
    replies: [
      {
        id: '1-1',
        user: {
          name: 'Mike Chen',
          username: 'mikechen',
          avatar: null
        },
        content: 'Totally agree! The attention to detail is incredible.',
        timestamp: '1h ago',
        likes: 3,
        isLiked: true,
        isReply: true,
        parentId: '1'
      }
    ]
  },
  {
    id: '2',
    user: {
      name: 'Emma Davis',
      username: 'emmad',
      avatar: null
    },
    content: 'How long did this take you to build? The implementation looks really clean!',
    timestamp: '4h ago',
    likes: 8,
    isLiked: true,
    replies: []
  }
];

// ✅ Individual Comment Component
const CommentItem = ({ 
  comment, 
  onLike, 
  onReply, 
  onDelete, 
  isOwnComment = false,
  level = 0 
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyBox(false);
    }
  };

  const handleLike = () => {
    onLike(comment.id, !comment.isLiked);
  };

  return (
    <div className={`${level > 0 ? 'ml-12 border-l-2 border-gray-100 dark:border-gray-700 pl-4' : ''}`}>
      <div className="flex space-x-3 py-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xs">
              {comment.user.name.charAt(0)}
            </span>
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {comment.user.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  @{comment.user.username}
                </span>
              </div>
              
              {/* Options Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                
                {showOptions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
                    <div className="absolute right-0 top-7 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-20 py-1">
                      {isOwnComment ? (
                        <button
                          onClick={() => {
                            onDelete(comment.id);
                            setShowOptions(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 flex items-center space-x-2 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowOptions(false)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center space-x-2 text-sm"
                        >
                          <Flag className="w-4 h-4" />
                          <span>Report</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
              {comment.content}
            </p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center space-x-4 mt-2 ml-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {comment.timestamp}
            </span>
            
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-xs transition-colors ${
                comment.isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
              <span>{comment.likes}</span>
            </button>
            
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Reply className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </div>

          {/* Reply Box */}
          {showReplyBox && (
            <div className="mt-3 ml-4">
              <div className="flex space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs">You</span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.user.name}...`}
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setShowReplyBox(false)}
                      className="text-xs py-1 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReplySubmit}
                      disabled={!replyText.trim()}
                      className="text-xs py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
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
  );
};

// ✅ Main Comments Modal Component
function CommentsModal({ isOpen, onClose, post }) {
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle new comment submission
  const handleSubmitComment = async () => {
    console.log('🚀 Submit comment clicked!', newComment);
    
    if (!newComment.trim() || isSubmitting) {
      console.log('❌ Cannot submit - empty or already submitting');
      return;
    }

    setIsSubmitting(true);
    console.log('✅ Submitting comment...');
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const newCommentObj = {
        id: Date.now().toString(),
        user: {
          name: 'You',
          username: 'you',
          avatar: null
        },
        content: newComment,
        timestamp: 'just now',
        likes: 0,
        isLiked: false,
        replies: []
      };

      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');
      console.log('✅ Comment added successfully');
      
    } catch (error) {
      console.error('❌ Failed to post comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like/unlike comment
  const handleLikeComment = (commentId, isLiked) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked,
          likes: isLiked ? comment.likes + 1 : comment.likes - 1
        };
      }
      
      // Check replies
      if (comment.replies) {
        const updatedReplies = comment.replies.map(reply => 
          reply.id === commentId 
            ? { 
                ...reply, 
                isLiked, 
                likes: isLiked ? reply.likes + 1 : reply.likes - 1 
              }
            : reply
        );
        return { ...comment, replies: updatedReplies };
      }
      
      return comment;
    }));
  };

  // Handle reply to comment
  const handleReplyToComment = (parentId, replyText) => {
    const newReply = {
      id: `${parentId}-${Date.now()}`,
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
      parentId
    };

    setComments(prev => prev.map(comment => 
      comment.id === parentId 
        ? { ...comment, replies: [...(comment.replies || []), newReply] }
        : comment
    ));
  };

  // Handle delete comment
  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setComments(prev => prev.filter(comment => {
        if (comment.id === commentId) return false;
        if (comment.replies) {
          comment.replies = comment.replies.filter(reply => reply.id !== commentId);
        }
        return true;
      }));
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
            className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] px-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onLike={handleLikeComment}
                onReply={handleReplyToComment}
                onDelete={handleDeleteComment}
                isOwnComment={comment.user.username === 'you'}
              />
            ))
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

        {/* 🚨 GUARANTEED WORKING COMMENT INPUT WITH SEND BUTTON */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 resize-none focus:outline-none focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
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
                
                {/* 🎯 GUARANTEED VISIBLE SEND BUTTON */}
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className={`
                    flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 min-w-[80px] justify-center
                    ${!newComment.trim() || isSubmitting 
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer shadow-md hover:shadow-lg'
                    }
                  `}
                  style={{ 
                    minHeight: '40px',
                    border: 'none',
                    outline: 'none'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
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
    </div>
  );
}

export default CommentsModal;