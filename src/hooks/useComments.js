// src/hooks/useComments.js
import { useState, useCallback, useEffect } from 'react';
import { commentsAPI } from '../utils/api';

/**
 * Custom hook for managing post comments with real API integration
 * Handles fetching, posting, editing, and deleting comments with optimistic updates
 */
const useComments = (postId) => {
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
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  /**
   * Add a new comment with optimistic update
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
      setComments(prev => prev.map(comment => 
        comment.id === parentCommentId 
          ? { ...comment, replies: [optimisticComment, ...(comment.replies || [])] }
          : comment
      ));
    } else {
      // Adding a top-level comment
      setComments(prev => [optimisticComment, ...prev]);
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
      
      // Remove optimistic comment on failure
      if (parentCommentId) {
        setComments(prev => prev.map(comment => 
          comment.id === parentCommentId 
            ? { 
                ...comment, 
                replies: comment.replies.filter(reply => reply.id !== optimisticComment.id)
              }
            : comment
        ));
      } else {
        setComments(prev => prev.filter(comment => comment.id !== optimisticComment.id));
      }

      setError('Failed to post comment. Please try again.');
      return { success: false, error: err.message };

    } finally {
      setIsSubmitting(false);
    }
  }, [postId, isSubmitting]);

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(async (commentId) => {
    try {
      await commentsAPI.deleteComment(commentId);
      
      // Remove comment from state
      setComments(prev => prev.filter(comment => {
        if (comment.id === commentId) return false;
        if (comment.replies) {
          comment.replies = comment.replies.filter(reply => reply.id !== commentId);
        }
        return true;
      }));

      return { success: true };

    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Update a comment
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
   * Sort comments
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
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh comments
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