// src/hooks/useLikes.js
import { useState, useCallback } from 'react';
import { postsAPI } from '../utils/api';

/**
 * Custom hook for managing post likes with optimistic updates
 * Handles like/unlike functionality with error rollback
 */
const useLikes = (postId, initialIsLiked = false, initialLikesCount = 0) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Toggle like status with optimistic updates
   * Automatically rolls back on API failure
   */
  const toggleLike = useCallback(async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests

    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    const newLikedState = !isLiked;
    const newCount = newLikedState ? likesCount + 1 : likesCount - 1;

    // Optimistic update (update UI immediately)
    setIsLiked(newLikedState);
    setLikesCount(newCount);
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (newLikedState) {
        response = await postsAPI.likePost(postId);
      } else {
        response = await postsAPI.unlikePost(postId);
      }

      // Update with server response if available
      if (response && typeof response.total_likes === 'number') {
        setLikesCount(response.total_likes);
      }

      return {
        success: true,
        isLiked: newLikedState,
        likesCount: response?.total_likes || newCount
      };

    } catch (err) {
      console.error('Like operation failed:', err);
      
      // Rollback optimistic update
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      setError(err.message || 'Failed to update like status');

      return {
        success: false,
        error: err.message || 'Failed to update like status'
      };
    } finally {
      setIsLoading(false);
    }
  }, [postId, isLiked, likesCount, isLoading]);

  /**
   * Reset error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Update likes count from external source (e.g., real-time updates)
   */
  const updateLikesCount = useCallback((newCount) => {
    setLikesCount(newCount);
  }, []);

  /**
   * Update like status from external source
   */
  const updateLikeStatus = useCallback((newIsLiked, newCount) => {
    setIsLiked(newIsLiked);
    if (typeof newCount === 'number') {
      setLikesCount(newCount);
    }
  }, []);

  return {
    // State
    isLiked,
    likesCount,
    isLoading,
    error,
    
    // Actions
    toggleLike,
    clearError,
    updateLikesCount,
    updateLikeStatus
  };
};

export default useLikes;