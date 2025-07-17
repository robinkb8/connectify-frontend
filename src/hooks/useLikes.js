// src/hooks/useLikes.js
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  likePost,
  unlikePost,
  initializePost,
  optimisticToggleLike,
  rollbackOptimisticUpdate,
  clearError as clearErrorAction,
  resetPostState,
  updateLikesCount as updateLikesCountAction,
  updateLikeStatus as updateLikeStatusAction,
  selectPostLikes
} from '../store/slices/likesSlice';

/**
 * Redux-based hook for managing post likes with optimistic updates
 * Maintains identical API to original useLikes hook
 * Handles like/unlike functionality with error rollback
 */
const useLikes = (postId, initialIsLiked = false, initialLikesCount = 0) => {
  const dispatch = useDispatch();
  
  // Use direct state access to ensure proper re-renders
  const likesState = useSelector(state => state.likes);
  const postState = likesState.posts[postId];
  const isLoading = Boolean(likesState.loading[postId]);
  
  const isLiked = postState ? postState.isLiked : false;
  const likesCount = postState ? postState.likesCount : 0;
  const error = postState ? postState.error : null;
  
  console.log('🔍 DEBUG Hook State:', { 
    postId, 
    postState, 
    isLiked, 
    likesCount, 
    error, 
    isLoading,
    allPosts: Object.keys(likesState.posts)
  });

  // Initialize post state on mount if not exists
  useEffect(() => {
    dispatch(initializePost({ postId, isLiked: initialIsLiked, likesCount: initialLikesCount }));
  }, [dispatch, postId, initialIsLiked, initialLikesCount]);

  /**
   * Toggle like status with optimistic updates
   * Automatically rolls back on API failure
   * IDENTICAL API to original hook
   */
  const toggleLike = useCallback(async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests

    // Store previous state for rollback
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    const newLikedState = !isLiked;
    const newCount = newLikedState ? likesCount + 1 : likesCount - 1;

    // Optimistic update (update UI immediately)
    dispatch(optimisticToggleLike({ postId }));

    try {
      let result;
      if (newLikedState) {
        result = await dispatch(likePost({ postId })).unwrap();
      } else {
        result = await dispatch(unlikePost({ postId })).unwrap();
      }

      // Return success response with identical format
      return {
        success: true,
        isLiked: newLikedState,
        likesCount: result.response?.total_likes || newCount
      };

    } catch (err) {
      console.error('Like operation failed:', err);
      
      // Rollback optimistic update
      dispatch(rollbackOptimisticUpdate({
        postId,
        previousIsLiked,
        previousLikesCount,
        error: err.error || err.message || 'Failed to update like status'
      }));

      // Return error response with identical format
      return {
        success: false,
        error: err.error || err.message || 'Failed to update like status'
      };
    }
  }, [dispatch, postId, isLiked, likesCount, isLoading]);

  /**
   * Reset error state
   * IDENTICAL API to original hook
   */
  const clearError = useCallback(() => {
    dispatch(clearErrorAction({ postId }));
  }, [dispatch, postId]);

  /**
   * Update likes count from external source (e.g., real-time updates)
   * IDENTICAL API to original hook
   */
  const updateLikesCount = useCallback((newCount) => {
    console.log('🔍 DEBUG Hook updateLikesCount called:', { postId, newCount });
    dispatch(updateLikesCountAction({ postId, newCount }));
    console.log('🔍 DEBUG Hook updateLikesCount dispatched');
  }, [dispatch, postId]);

  /**
   * Update like status from external source
   * IDENTICAL API to original hook
   */
  const updateLikeStatus = useCallback((newIsLiked, newCount) => {
    console.log('🔍 DEBUG Hook updateLikeStatus called:', { postId, newIsLiked, newCount });
    dispatch(updateLikeStatusAction({ postId, newIsLiked, newCount }));
    console.log('🔍 DEBUG Hook updateLikeStatus dispatched');
  }, [dispatch, postId]);

  /**
   * Reset post state (for testing)
   */
  const resetState = useCallback(() => {
    dispatch(resetPostState({ postId }));
  }, [dispatch, postId]);

  // Return identical object structure to original hook
  return {
    // State (identical property names and types)
    isLiked,
    likesCount,
    isLoading,
    error,
    
    // Actions (identical function signatures)
    toggleLike,
    clearError,
    updateLikesCount,
    updateLikeStatus,
    
    // Testing helper
    resetState
  };
};

export default useLikes;