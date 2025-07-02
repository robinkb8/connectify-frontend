// hooks/useFollow.js - Follow functionality hook
import { useState, useCallback } from 'react';
import { profilesAPI } from '../utils/api/profiles';

/**
 * Hook for managing follow/unfollow functionality
 */
export const useFollow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Follow a user
   */
  const followUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await profilesAPI.followUser(userId);
      
      if (response.success) {
        return {
          success: true,
          isFollowing: response.is_following,
          followerCount: response.follower_count,
          followingCount: response.following_count,
          message: response.message
        };
      } else {
        setError(response.message || 'Failed to follow user');
        return {
          success: false,
          message: response.message || 'Failed to follow user'
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to follow user';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Unfollow a user
   */
  const unfollowUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await profilesAPI.unfollowUser(userId);
      
      if (response.success) {
        return {
          success: true,
          isFollowing: response.is_following,
          followerCount: response.follower_count,
          followingCount: response.following_count,
          message: response.message
        };
      } else {
        setError(response.message || 'Failed to unfollow user');
        return {
          success: false,
          message: response.message || 'Failed to unfollow user'
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to unfollow user';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Toggle follow status
   */
  const toggleFollow = useCallback(async (userId, currentlyFollowing) => {
    if (currentlyFollowing) {
      return await unfollowUser(userId);
    } else {
      return await followUser(userId);
    }
  }, [followUser, unfollowUser]);

  /**
   * Get user followers
   */
  const getFollowers = useCallback(async (userId, page = 1, pageSize = 20) => {
    setLoading(true);
    setError(null);

    try {
      const response = await profilesAPI.getUserFollowers(userId, page, pageSize);
      
      if (response.success) {
        return {
          success: true,
          followers: response.followers,
          pagination: response.pagination,
          user: response.user
        };
      } else {
        setError(response.message || 'Failed to fetch followers');
        return {
          success: false,
          message: response.message || 'Failed to fetch followers'
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch followers';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get user following
   */
  const getFollowing = useCallback(async (userId, page = 1, pageSize = 20) => {
    setLoading(true);
    setError(null);

    try {
      const response = await profilesAPI.getUserFollowing(userId, page, pageSize);
      
      if (response.success) {
        return {
          success: true,
          following: response.following,
          pagination: response.pagination,
          user: response.user
        };
      } else {
        setError(response.message || 'Failed to fetch following');
        return {
          success: false,
          message: response.message || 'Failed to fetch following'
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch following';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    followUser,
    unfollowUser,
    toggleFollow,
    getFollowers,
    getFollowing,
    setError // For manual error clearing
  };
};

export default useFollow;