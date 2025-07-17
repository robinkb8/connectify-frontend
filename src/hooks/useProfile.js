// src/hooks/useProfileRedux.js - Redux Bridge Hook with Identical API to useProfile
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import {
  loadProfileByUsername,
  loadCurrentUserProfile,
  updateProfileData,
  uploadProfileAvatar,
  clearError,
  setCurrentProfile,
  updateProfileInCache,
  selectCurrentProfile,
  selectCurrentUsername,
  selectProfileLoading,
  selectProfileError,
  selectProfileCache,
  selectLastFetchTime,
  selectProfileByUsername
} from '../store/slices/profileSlice';

/**
 * Redux-powered profile hook with identical API to original useProfile
 * Preserves all functionality while adding global state management
 */
const useProfileRedux = (username = null) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  
  // Select state from Redux store
  const currentProfile = useSelector(selectCurrentProfile);
  const currentUsername = useSelector(selectCurrentUsername);
  const loading = useSelector(selectProfileLoading);
  const error = useSelector(selectProfileError);
  const profileCache = useSelector(selectProfileCache);
  const lastFetchTime = useSelector(selectLastFetchTime);
  
  // Determine target username and if viewing own profile
  const targetUsername = username || currentUser?.username;
  const isOwnProfile = targetUsername ? targetUsername === currentUser?.username : true;
  
  // Get profile for current request (either current or cached)
  const requestedProfile = useSelector(selectProfileByUsername(targetUsername)) || 
                          (currentUsername === targetUsername ? currentProfile : null);

  /**
   * Fetch profile data - matches original useProfile API exactly
   */
  const fetchProfile = useCallback(async () => {
    if (!targetUsername && !currentUser) return;

    // Check cache first (15 seconds cache duration)
    const cacheKey = targetUsername || 'current';
    const lastFetch = lastFetchTime[cacheKey] || 0;
    const isCacheValid = Date.now() - lastFetch < 15000;
    
    if (isCacheValid && profileCache[cacheKey]) {
      console.log('✅ Profile cache hit for:', cacheKey);
      dispatch(setCurrentProfile({ 
        profile: profileCache[cacheKey], 
        username: targetUsername 
      }));
      return;
    }

    try {
      if (targetUsername && targetUsername !== currentUser?.username) {
        // Fetch specific user profile
        await dispatch(loadProfileByUsername({ username: targetUsername }));
      } else {
        // Fetch current user profile
        await dispatch(loadCurrentUserProfile());
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  }, [dispatch, targetUsername, currentUser, lastFetchTime, profileCache]);

  /**
   * Update profile data - matches original useProfile API exactly
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      const resultAction = await dispatch(updateProfileData({ profileData }));
      
      if (updateProfileData.fulfilled.match(resultAction)) {
        const { profile, message } = resultAction.payload;
        return {
          success: true,
          user: profile,
          message: message
        };
      } else {
        return {
          success: false,
          message: resultAction.payload || 'Failed to update profile'
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [dispatch]);

  /**
   * Upload avatar - matches original useProfile API exactly
   */
  const uploadAvatar = useCallback(async (avatarFile) => {
    try {
      const resultAction = await dispatch(uploadProfileAvatar({ avatarFile }));
      
      if (uploadProfileAvatar.fulfilled.match(resultAction)) {
        const { avatar_url, message } = resultAction.payload;
        return {
          success: true,
          avatar_url: avatar_url,
          message: message
        };
      } else {
        return {
          success: false,
          message: resultAction.payload || 'Failed to upload avatar'
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload avatar';
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [dispatch]);

  /**
   * Refresh profile data - matches original useProfile API exactly
   */
  const refreshProfile = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  /**
   * Set profile manually - matches original useProfile API exactly
   */
  const setProfile = useCallback((profile) => {
    dispatch(setCurrentProfile({ 
      profile, 
      username: targetUsername 
    }));
  }, [dispatch, targetUsername]);

  /**
   * Clear error - additional helper function
   */
  const clearProfileError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Update profile in cache - additional helper function
   */
  const updateProfileInCacheAction = useCallback((updates) => {
    if (targetUsername) {
      dispatch(updateProfileInCache({ 
        username: targetUsername, 
        updates 
      }));
    }
  }, [dispatch, targetUsername]);

  // Auto-fetch profile when parameters change
  useEffect(() => {
    const shouldFetch = targetUsername && (
      !requestedProfile || 
      currentUsername !== targetUsername
    );
    
    if (shouldFetch) {
      fetchProfile();
    }
  }, [targetUsername, requestedProfile, currentUsername, fetchProfile]);

  // Determine which profile to return (current context or requested)
  const profile = useMemo(() => {
    if (targetUsername === currentUsername) {
      return currentProfile;
    }
    return requestedProfile;
  }, [targetUsername, currentUsername, currentProfile, requestedProfile]);

  // Return identical API to original useProfile hook
  return {
    // State - identical to original
    profile,
    loading,
    error,
    isOwnProfile,
    
    // Functions - identical API to original
    updateProfile,
    uploadAvatar,
    refreshProfile,
    setProfile,
    
    // Additional Redux-specific helpers (backwards compatible)
    clearError: clearProfileError,
    updateProfileInCache: updateProfileInCacheAction,
    fetchProfile, // Expose fetchProfile for manual calls
  };
};

export default useProfileRedux;