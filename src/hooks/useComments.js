// src/hooks/useComments.js - Enhanced with Parent Notification for Comment Count Sync
import { useState, useCallback, useEffect } from 'react';
import { commentsAPI } from '../utils/api';

/**
 * Custom hook for managing post comments with real API integration + Parent Notification Fix
 * Handles fetching, posting, editing, and deleting comments with optimistic updates
 * ✅ SURGICAL FIX #3: Added parent notification for comment count synchronization
 */
const useComments = (postId, onCommentCountUpdate = null) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  /**
   * Fetch comments for the post
   */
  const fetchComments = useCallback(async () => {
    if (!postId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await commentsAPI.getComments(postId);
      
      // Transform API response to match our UI format
      const transformedComments = response.results.map(comment => ({
        id: comment.id,
        user: {
          name: comment.author?.full_name || comment.author?.username || 'Unknown User',
          username: comment.author?.username || 'unknown',
          avatar: comment.author?.avatar || null
        },
        content: comment.content,
        timestamp: comment.time_since_posted || 'Unknown time',
        likes: 0, // Comments likes not implemented yet
        isLiked: false,
        isNew: false,
        replies: comment.replies ? comment.replies.map(reply => ({
          id: reply.id,
          user: {
            name: reply.author?.full_name || reply.author?.username || 'Unknown User',
            username: reply.author?.username || 'unknown',
            avatar: reply.author?.avatar || null
          },
          content: reply.content,
          timestamp: reply.time_since_posted || 'Unknown time',
          likes: 0,
          isLiked: false,
          isNew: false
        })) : []
      }));

      setComments(transformedComments);
      
      // ✅ SURGICAL FIX #3: Notify parent component of actual comment count
      if (onCommentCountUpdate) {
        const totalComments = transformedComments.reduce((total, comment) => {
          return total + 1 + (comment.replies ? comment.replies.length : 0);
        }, 0);
        console.log('📊 useComments: Notifying parent of comment count:', totalComments);
        onCommentCountUpdate(totalComments);
      }
      
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [postId, onCommentCountUpdate]);

  /**
   * ✅ SURGICAL FIX #3: Enhanced addComment with parent notification
   * Add a new comment with optimistic update and parent count sync
   */
  const addComment = useCallback(async (content, parentCommentId = null) => {
    if (!content.trim() || isSubmitting) return { success: false };

    // Create optimistic comment for instant UI feedback
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      user: {
        name: 'You',
        username: 'you',
        avatar: null
      },
      content: content.trim(),
      timestamp: 'just now',
      likes: 0,
      isLiked: false,
      isNew: true,
      isOptimistic: true,
      replies: []
    };

    setIsSubmitting(true);
    setError(null);

    // Optimistic update - add comment immediately to UI
    if (parentCommentId) {
      // Adding a reply
      setComments(prev => {
        const newComments = prev.map(comment => 
          comment.id === parentCommentId 
            ? { ...comment, replies: [optimisticComment, ...(comment.replies || [])] }
            : comment
        );
        
        // 🎯 SURGICAL CHANGE: Notify parent of new comment count (including replies)
        if (onCommentCountUpdate) {
          const totalComments = newComments.reduce((total, comment) => {
            return total + 1 + (comment.replies ? comment.replies.length : 0);
          }, 0);
          console.log('📊 useComments: Parent notified of new reply count:', totalComments);
          onCommentCountUpdate(totalComments);
        }
        
        return newComments;
      });
    } else {
      // Adding a top-level comment
      setComments(prev => {
        const newComments = [optimisticComment, ...prev];
        
        // 🎯 SURGICAL CHANGE: Notify parent of new comment count
        if (onCommentCountUpdate) {
          const totalComments = newComments.reduce((total, comment) => {
            return total + 1 + (comment.replies ? comment.replies.length : 0);
          }, 0);
          console.log('📊 useComments: Parent notified of new comment count:', totalComments);
          onCommentCountUpdate(totalComments);
        }
        
        return newComments;
      });
    }

    try {
      const response = await commentsAPI.addComment(postId, content, parentCommentId);
      
      // Transform the response
      const realComment = {
        id: response.id,
        user: {
          name: response.author?.full_name || response.author?.username || 'You',
          username: response.author?.username || 'you',
          avatar: response.author?.avatar || null
        },
        content: response.content,
        timestamp: response.time_since_posted || 'just now',
        likes: 0,
        isLiked: false,
        isNew: true,
        isOptimistic: false,
        replies: []
      };

      // Replace optimistic comment with real data
      if (parentCommentId) {
        setComments(prev => prev.map(comment => 
          comment.id === parentCommentId 
            ? { 
                ...comment, 
                replies: comment.replies.map(reply => 
                  reply.id === optimisticComment.id ? realComment : reply
                )
              }
            : comment
        ));
      } else {
        setComments(prev => prev.map(comment => 
          comment.id === optimisticComment.id ? realComment : comment
        ));
      }

      return { success: true, comment: realComment };

    } catch (err) {
      console.error('Error adding comment:', err);
      
      // Remove optimistic comment on failure and update parent count
      if (parentCommentId) {
        setComments(prev => {
          const newComments = prev.map(comment => 
            comment.id === parentCommentId 
              ? { 
                  ...comment, 
                  replies: comment.replies.filter(reply => reply.id !== optimisticComment.id)
                }
              : comment
          );
          
          // Update parent count on failure rollback
          if (onCommentCountUpdate) {
            const totalComments = newComments.reduce((total, comment) => {
              return total + 1 + (comment.replies ? comment.replies.length : 0);
            }, 0);
            onCommentCountUpdate(totalComments);
          }
          
          return newComments;
        });
      } else {
        setComments(prev => {
          const newComments = prev.filter(comment => comment.id !== optimisticComment.id);
          
          // Update parent count on failure rollback
          if (onCommentCountUpdate) {
            const totalComments = newComments.reduce((total, comment) => {
              return total + 1 + (comment.replies ? comment.replies.length : 0);
            }, 0);
            onCommentCountUpdate(totalComments);
          }
          
          return newComments;
        });
      }

      setError('Failed to post comment. Please try again.');
      return { success: false, error: err.message };

    } finally {
      setIsSubmitting(false);
    }
  }, [postId, isSubmitting, onCommentCountUpdate]);

  /**
   * ✅ SURGICAL FIX #3: Enhanced deleteComment with parent notification
   * Delete a comment and update parent count
   */
  const deleteComment = useCallback(async (commentId) => {
    try {
      await commentsAPI.deleteComment(commentId);
      
      // Remove comment from state and update parent count
      setComments(prev => {
        const newComments = prev.filter(comment => {
          if (comment.id === commentId) return false;
          if (comment.replies) {
            comment.replies = comment.replies.filter(reply => reply.id !== commentId);
          }
          return true;
        });
        
        // 🎯 SURGICAL CHANGE: Notify parent of updated comment count after deletion
        if (onCommentCountUpdate) {
          const totalComments = newComments.reduce((total, comment) => {
            return total + 1 + (comment.replies ? comment.replies.length : 0);
          }, 0);
          console.log('📊 useComments: Parent notified of comment deletion, new count:', totalComments);
          onCommentCountUpdate(totalComments);
        }
        
        return newComments;
      });

      return { success: true };

    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
      return { success: false, error: err.message };
    }
  }, [onCommentCountUpdate]);

  /**
   * PRESERVED: Update a comment (no count change needed)
   */
  const updateComment = useCallback(async (commentId, newContent) => {
    try {
      const response = await commentsAPI.updateComment(commentId, newContent);
      
      // Update comment in state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content: newContent, isEdited: true };
        }
        if (comment.replies) {
          comment.replies = comment.replies.map(reply => 
            reply.id === commentId 
              ? { ...reply, content: newContent, isEdited: true }
              : reply
          );
        }
        return comment;
      }));

      return { success: true };

    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment. Please try again.');
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * PRESERVED: Sort comments
   */
  const sortComments = useCallback((newSortBy) => {
    setSortBy(newSortBy);
    
    setComments(prev => {
      const sorted = [...prev];
      switch (newSortBy) {
        case 'popular':
          sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
          break;
        case 'oldest':
          // For oldest first, we'd need actual timestamps from API
          // For now, reverse the order as a placeholder
          sorted.reverse();
          break;
        default: // newest
          // Already in newest first order from API
          break;
      }
      return sorted;
    });
  }, []);

  /**
   * PRESERVED: Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * PRESERVED: Refresh comments
   */
  const refreshComments = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    // State
    comments,
    isLoading,
    isSubmitting,
    error,
    sortBy,
    
    // Actions
    fetchComments,
    addComment,
    deleteComment,
    updateComment,
    sortComments,
    clearError,
    refreshComments
  };
};

export default useComments;