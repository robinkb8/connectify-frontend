// src/hooks/useCommentsRedux.js - Redux-based comments hook with IDENTICAL API
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  // Async actions
  fetchComments,
  addComment,
  deleteComment,
  updateComment,
  
  // Sync actions
  addOptimisticComment,
  removeOptimisticComment,
  replaceOptimisticComment,
  sortComments,
  clearError,
  clearCommentsForPost,
  
  // Selectors
  selectCommentsByPost,
  selectCommentsLoading,
  selectCommentsHasLoaded,
  selectCommentsSubmitting,
  selectCommentsError,
  selectCommentsSortBy,
  selectCommentCount,
  selectCommentsByPostWithCount
} from '../store/slices/commentsSlice';

/**
 * Redux-based comments hook with IDENTICAL API to useComments.js
 * Drop-in replacement for surgical migration
 * ✅ MAINTAINS: onCommentCountUpdate callback for PostCard sync
 * ✅ MAINTAINS: Optimistic updates for instant UI feedback
 * ✅ MAINTAINS: All function signatures and return values
 */
const useComments = (postId, onCommentCountUpdate = null) => {
  const dispatch = useDispatch();
  
  // Redux state selectors
  const comments = useSelector(selectCommentsByPost(postId));
  const isLoading = useSelector(selectCommentsLoading(postId));
  const hasLoaded = useSelector(selectCommentsHasLoaded(postId));
  const isSubmitting = useSelector(selectCommentsSubmitting);
  const error = useSelector(selectCommentsError);
  const sortBy = useSelector(selectCommentsSortBy);
  const commentCount = useSelector(selectCommentCount(postId));
  
  /**
   * ✅ IDENTICAL API: Fetch comments for the post
   */
  const fetchCommentsWrapper = useCallback(async () => {
    if (!postId) return;

    try {
      await dispatch(fetchComments({ postId })).unwrap();
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }, [postId, dispatch]);

  /**
   * ✅ IDENTICAL API: Add a new comment with optimistic update and parent count sync
   */
  const addCommentWrapper = useCallback(async (content, parentCommentId = null) => {
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

    // Add optimistic comment immediately to Redux state
    dispatch(addOptimisticComment({
      postId,
      comment: optimisticComment,
      parentCommentId
    }));

    // 🎯 CRITICAL: Notify parent of new comment count immediately (optimistic)
    if (onCommentCountUpdate) {
      const newCount = commentCount + 1;
      console.log('📊 useCommentsRedux: Parent notified of optimistic count:', newCount);
      onCommentCountUpdate(newCount);
    }

    try {
      const result = await dispatch(addComment({ 
        postId, 
        content: content.trim(), 
        parentCommentId 
      })).unwrap();

      // 🎯 CRITICAL: Update parent count again with real data (should be same)
      if (onCommentCountUpdate) {
        // Re-calculate actual count after successful add
        const actualCount = commentCount + 1; // This should match optimistic
        console.log('📊 useCommentsRedux: Parent notified of real count:', actualCount);
        onCommentCountUpdate(actualCount);
      }

      return { success: true, comment: result.comment };

    } catch (err) {
      console.error('Error adding comment:', err);
      
      // Remove optimistic comment on failure
      dispatch(removeOptimisticComment({
        postId,
        tempCommentId: optimisticComment.id,
        parentCommentId
      }));

      // 🎯 CRITICAL: Revert parent count on failure
      if (onCommentCountUpdate) {
        console.log('📊 useCommentsRedux: Parent notified of failure rollback:', commentCount);
        onCommentCountUpdate(commentCount);
      }

      return { success: false, error: err.message || 'Failed to post comment' };
    }
  }, [postId, isSubmitting, dispatch, commentCount, onCommentCountUpdate]);

  /**
   * ✅ IDENTICAL API: Delete a comment and update parent count
   */
  const deleteCommentWrapper = useCallback(async (commentId) => {
    try {
      await dispatch(deleteComment({ commentId, postId })).unwrap();

      // 🎯 CRITICAL: Notify parent of updated comment count after deletion
      if (onCommentCountUpdate) {
        const newCount = commentCount - 1;
        console.log('📊 useCommentsRedux: Parent notified of deletion, new count:', newCount);
        onCommentCountUpdate(newCount);
      }

      return { success: true };

    } catch (err) {
      console.error('Error deleting comment:', err);
      return { success: false, error: err.message || 'Failed to delete comment' };
    }
  }, [dispatch, postId, commentCount, onCommentCountUpdate]);

  /**
   * ✅ IDENTICAL API: Update a comment (no count change needed)
   */
  const updateCommentWrapper = useCallback(async (commentId, newContent) => {
    try {
      await dispatch(updateComment({ commentId, newContent, postId })).unwrap();
      return { success: true };

    } catch (err) {
      console.error('Error updating comment:', err);
      return { success: false, error: err.message || 'Failed to update comment' };
    }
  }, [dispatch, postId]);

  /**
   * ✅ IDENTICAL API: Sort comments
   */
  const sortCommentsWrapper = useCallback((newSortBy) => {
    dispatch(sortComments({ postId, sortBy: newSortBy }));
  }, [dispatch, postId]);

  /**
   * ✅ IDENTICAL API: Clear error state
   */
  const clearErrorWrapper = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * ✅ IDENTICAL API: Refresh comments
   */
  const refreshComments = useCallback(() => {
    fetchCommentsWrapper();
  }, [fetchCommentsWrapper]);

  /**
   * ✅ CRITICAL: Parent notification effect - sync count changes
   * This ensures parent component always has current count
   */
  useEffect(() => {
    if (onCommentCountUpdate && hasLoaded) {
      const currentCount = comments.reduce((total, comment) => {
        return total + 1 + (comment.replies ? comment.replies.length : 0);
      }, 0);
      
      console.log('📊 useCommentsRedux: Effect sync - notifying parent of count:', currentCount);
      console.log('📊 useCommentsRedux: Comments breakdown:', {
        topLevel: comments.length,
        totalWithReplies: currentCount,
        commentsData: comments.map(c => ({ id: c.id, replies: c.replies?.length || 0 }))
      });
      onCommentCountUpdate(currentCount);
    }
  }, [comments, onCommentCountUpdate, hasLoaded]);

  /**
   * ✅ IDENTICAL API: Auto-fetch comments on mount if not loaded
   */
  useEffect(() => {
    if (postId && !hasLoaded && !isLoading) {
      fetchCommentsWrapper();
    }
  }, [postId, hasLoaded, isLoading, fetchCommentsWrapper]);

  // ✅ IDENTICAL API RETURN - Perfect drop-in replacement
  return {
    // State (identical to original hook)
    comments,
    isLoading,
    isSubmitting,
    error,
    sortBy,
    
    // Actions (identical APIs)
    fetchComments: fetchCommentsWrapper,
    addComment: addCommentWrapper,
    deleteComment: deleteCommentWrapper,
    updateComment: updateCommentWrapper,
    sortComments: sortCommentsWrapper,
    clearError: clearErrorWrapper,
    refreshComments
  };
};

export default useComments;