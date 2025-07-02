// hooks/useProfile.js - Profile data management hook
import { useState, useEffect, useCallback } from 'react';
import { profilesAPI } from '../utils/api/profiles';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for managing user profile data
 */
export const useProfile = (username = null) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

  // Determine if viewing own profile
  const isOwnProfile = username ? username === currentUser?.username : true;

  /**
   * Fetch profile data
   */
  const fetchProfile = useCallback(async () => {
    if (!username && !currentUser) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      if (username) {
        // Fetch specific user profile
        response = await profilesAPI.getUserProfile(username);
      } else {
        // Fetch current user profile
        response = await profilesAPI.getCurrentUserProfile();
      }

      if (response.success) {
        setProfile(response.user);
      } else {
        setError(response.message || 'Failed to fetch profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [username, currentUser]);

  /**
   * Update profile data
   */
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await profilesAPI.updateUserProfile(profileData);
      
      if (response.success) {
        setProfile(response.user);
        return {
          success: true,
          user: response.user,
          message: response.message
        };
      } else {
        setError(response.message || 'Failed to update profile');
        return {
          success: false,
          message: response.message || 'Failed to update profile'
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
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
   * Upload avatar
   */
  const uploadAvatar = useCallback(async (avatarFile) => {
    setLoading(true);
    setError(null);

    try {
      const response = await profilesAPI.uploadAvatar(avatarFile);
      
      if (response.success) {
        // Update profile with new avatar
        if (profile) {
          setProfile(prev => ({
            ...prev,
            profile: {
              ...prev.profile,
              avatar: response.avatar_url
            }
          }));
        }
        return {
          success: true,
          avatar_url: response.avatar_url,
          message: response.message
        };
      } else {
        setError(response.message || 'Failed to upload avatar');
        return {
          success: false,
          message: response.message || 'Failed to upload avatar'
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload avatar';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [profile]);

  /**
   * Refresh profile data
   */
  const refreshProfile = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    isOwnProfile,
    updateProfile,
    uploadAvatar,
    refreshProfile,
    setProfile // For manual updates
  };
};

export default useProfile;