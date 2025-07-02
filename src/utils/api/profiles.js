// utils/api/profiles.js - Comprehensive Profile API Service
import { tokenManager } from '../api';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Enhanced API request specifically for profile operations
 */
const profileApiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenManager.getAccessToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token && !options.skipAuth) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    headers: { ...defaultHeaders, ...options.headers },
    ...options
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Profile API Request Error:', error);
    throw error;
  }
};

/**
 * Profile API Functions
 */
export const profilesAPI = {
  // Get user profile by username
  getUserProfile: async (username) => {
    try {
      const response = await profileApiRequest(`/auth/users/${username}/`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user profile');
    }
  },

  // Get current user profile
  getCurrentUserProfile: async () => {
    try {
      const response = await profileApiRequest('/auth/me/');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch current user profile');
    }
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    try {
      const token = tokenManager.getAccessToken();
      let body;
      let headers = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Handle FormData for file uploads
      if (profileData instanceof FormData) {
        body = profileData;
        // Don't set Content-Type for FormData
      } else {
        body = JSON.stringify(profileData);
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile/update/`, {
        method: 'PUT',
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const token = tokenManager.getAccessToken();
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile/avatar/`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload avatar');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  // Follow user
  followUser: async (userId) => {
    try {
      const response = await profileApiRequest(`/auth/users/${userId}/follow/`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to follow user');
    }
  },

  // Unfollow user
  unfollowUser: async (userId) => {
    try {
      const response = await profileApiRequest(`/auth/users/${userId}/unfollow/`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to unfollow user');
    }
  },

  // Get user followers
  getUserFollowers: async (userId, page = 1, pageSize = 20) => {
    try {
      const response = await profileApiRequest(
        `/auth/users/${userId}/followers/?page=${page}&page_size=${pageSize}`,
        { skipAuth: true }
      );
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch followers');
    }
  },

  // Get user following
  getUserFollowing: async (userId, page = 1, pageSize = 20) => {
    try {
      const response = await profileApiRequest(
        `/auth/users/${userId}/following/?page=${page}&page_size=${pageSize}`,
        { skipAuth: true }
      );
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch following');
    }
  }
};

export default profilesAPI;