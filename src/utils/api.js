// src/utils/api.js - Enhanced with JWT Authentication + Profile API Integration + Payment Endpoints

// Import profile API
import { profilesAPI } from './api/profiles';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// JWT Token Management - PRESERVED
class TokenManager {
  constructor() {
    this.tokenKey = 'accessToken';
    this.refreshTokenKey = 'refreshToken';
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  getAccessToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  clearTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

const tokenManager = new TokenManager();

// Enhanced API Request with JWT Support - PRESERVED
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenManager.getAccessToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists and not explicitly skipped
  if (token && !options.skipAuth) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    headers: { ...defaultHeaders, ...options.headers },
    ...options
  };

  try {
    const response = await fetch(url, config);

    // Handle token refresh if access token expired
    if (response.status === 401 && !options.isRefresh && !options.skipAuth) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        // Retry original request with new token
        const newToken = tokenManager.getAccessToken();
        const retryConfig = {
          ...config,
          headers: {
            ...config.headers,
            'Authorization': `Bearer ${newToken}`
          }
        };
        const retryResponse = await fetch(url, retryConfig);
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        return retryResponse.json();
      } else {
        // Refresh failed, redirect to login
        tokenManager.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Refresh Access Token - PRESERVED
const refreshTokens = async () => {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access) {
        tokenManager.setTokens(data.access, refreshToken);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Authentication API - PRESERVED COMPLETELY
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await apiRequest('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true
      });

      if (response.success && response.tokens) {
        tokenManager.setTokens(response.tokens.access, response.tokens.refresh);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await apiRequest('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
        skipAuth: true
      });

      if (response.success && response.tokens) {
        tokenManager.setTokens(response.tokens.access, response.tokens.refresh);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  },

  logout: async () => {
    tokenManager.clearTokens();
    try {
      await apiRequest('/auth/logout/', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    }
    return { success: true };
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me/');
  },

  checkEmailAvailability: async (email) => {
    return apiRequest('/auth/check-email/', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuth: true
    });
  },

  checkUsernameAvailability: async (username) => {
    return apiRequest('/auth/check-username/', {
      method: 'POST',
      body: JSON.stringify({ username }),
      skipAuth: true
    });
  },

  sendOTP: async (email) => {
    return apiRequest('/auth/send-otp/', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuth: true
    });
  },

  verifyOTP: async (email, otp_code) => {
    return apiRequest('/auth/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({ email, otp_code }),
      skipAuth: true
    });
  },

  // Helper methods for external use
  isAuthenticated: () => tokenManager.isAuthenticated(),
  clearTokens: () => tokenManager.clearTokens(),
  getAccessToken: () => tokenManager.getAccessToken()
};

// Enhanced Posts API - PRESERVED COMPLETELY
export const postsAPI = {
  fetchPosts: async (page = 1) => {
    try {
      // Using apiRequest to automatically handle JWT tokens
      const response = await apiRequest(`/posts/?page=${page}`);
      return response;
    } catch (error) {
      throw new Error('Failed to fetch posts');
    }
  },

  createPost: async (postData) => {
    try {
      const formData = new FormData();
      if (postData.content) formData.append('content', postData.content);
      if (postData.image) formData.append('image', postData.image);

      // Enhanced version with JWT token
      const token = tokenManager.getAccessToken();
      const url = `${API_BASE_URL}/posts/create/`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // Don't set Content-Type for FormData, let browser set it
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      if (!response.ok) {
        // Handle token refresh for FormData requests
        if (response.status === 401 && token) {
          const refreshed = await refreshTokens();
          if (refreshed) {
            const newToken = tokenManager.getAccessToken();
            const retryResponse = await fetch(url, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${newToken}`
              },
              body: formData
            });
            if (!retryResponse.ok) throw new Error('Failed to create post');
            return retryResponse.json();
          }
        }
        throw new Error('Failed to create post');
      }
      
      return response.json();
    } catch (error) {
      throw error;
    }
  },

  // Additional post methods with JWT
  getPost: async (postId) => {
    return apiRequest(`/posts/${postId}/`);
  },

  likePost: async (postId) => {
    return apiRequest(`/posts/${postId}/like/`, { method: 'POST' });
  },

  unlikePost: async (postId) => {
    return apiRequest(`/posts/${postId}/like/`, { method: 'DELETE' });
  },

  getUserPosts: async (userId) => {
    return apiRequest(`/users/${userId}/posts/`);
  }
};

// Enhanced Comments API - PRESERVED COMPLETELY
export const commentsAPI = {
  getComments: async (postId) => {
    try {
      // Using apiRequest to automatically handle JWT tokens
      const response = await apiRequest(`/posts/${postId}/comments/`);
      return response;
    } catch (error) {
      throw new Error('Failed to fetch comments');
    }
  },

  addComment: async (postId, content, parentComment = null) => {
    try {
      // Enhanced version with JWT token and optional parent comment
      const requestBody = { content };
      if (parentComment) {
        requestBody.parent_comment = parentComment;
      }

      const response = await apiRequest(`/posts/${postId}/comments/`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      return response;
    } catch (error) {
      throw new Error('Failed to add comment');
    }
  },

  // Additional comment methods
  updateComment: async (commentId, content) => {
    return apiRequest(`/comments/${commentId}/`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
  },

  deleteComment: async (commentId) => {
    return apiRequest(`/comments/${commentId}/`, { method: 'DELETE' });
  }
};

// NEW Payment API - Razorpay Integration
export const paymentsAPI = {
  // Create Razorpay order for subscription
  createOrder: async (amount) => {
    try {
      const response = await apiRequest('/payments/create-order/', {
        method: 'POST',
        body: JSON.stringify({ amount })
      });
      return response;
    } catch (error) {
      console.error('Failed to create payment order:', error);
      return {
        success: false,
        message: 'Failed to create payment order'
      };
    }
  },

  // Verify payment and activate subscription
  verifyPayment: async (paymentData) => {
    try {
      const response = await apiRequest('/payments/verify-payment/', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });
      return response;
    } catch (error) {
      console.error('Failed to verify payment:', error);
      return {
        success: false,
        message: 'Failed to verify payment'
      };
    }
  },

  // Get current user's subscription status
  getSubscriptionStatus: async () => {
    try {
      const response = await apiRequest('/payments/subscription/status/');
      return response;
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return {
        success: false,
        message: 'Failed to get subscription status'
      };
    }
  },

  // Get subscription pricing and configuration
  getSubscriptionConfig: async () => {
    try {
      const response = await apiRequest('/payments/subscription/config/');
      return response;
    } catch (error) {
      console.error('Failed to get subscription config:', error);
      return {
        success: false,
        message: 'Failed to get subscription config'
      };
    }
  },

  // Get user's payment history
  getPaymentHistory: async (limit = 10) => {
    try {
      const response = await apiRequest(`/payments/history/?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Failed to get payment history:', error);
      return {
        success: false,
        message: 'Failed to get payment history'
      };
    }
  },

  // Cancel active subscription
  cancelSubscription: async () => {
    try {
      const response = await apiRequest('/payments/subscription/cancel/', {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return {
        success: false,
        message: 'Failed to cancel subscription'
      };
    }
  }
};

// ENHANCED Profile API - Merging existing with new comprehensive functions
export const profileAPI = {
  // PRESERVED existing methods
  updateProfile: async (profileData) => {
    const formData = new FormData();
    
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });

    const token = tokenManager.getAccessToken();
    const url = `${API_BASE_URL}/auth/profile/update/`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  uploadAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const token = tokenManager.getAccessToken();
    const url = `${API_BASE_URL}/auth/profile/avatar/`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) throw new Error('Failed to upload avatar');
    return response.json();
  },

  // NEW comprehensive profile methods
  getUserProfile: profilesAPI.getUserProfile,
  getCurrentUserProfile: profilesAPI.getCurrentUserProfile,
  updateUserProfile: profilesAPI.updateUserProfile,
  followUser: profilesAPI.followUser,
  unfollowUser: profilesAPI.unfollowUser,
  getUserFollowers: profilesAPI.getUserFollowers,
  getUserFollowing: profilesAPI.getUserFollowing
};

// Export the token manager for use in components - PRESERVED
export { tokenManager };

// Export profiles API separately
export { profilesAPI };

// Export default API request function (backward compatibility) - PRESERVED
export default apiRequest;

export { notificationsAPI } from './api/notifications';