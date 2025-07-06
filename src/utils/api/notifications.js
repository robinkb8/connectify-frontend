// src/utils/api/notifications.js - Following existing API patterns

import { tokenManager } from '../api';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Enhanced API Request specifically for notifications
const notificationRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/notifications${endpoint}`;
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

    // Handle token refresh if access token expired
    if (response.status === 401 && !options.isRefresh && !options.skipAuth) {
      // Try to refresh token (reuse logic from main api.js)
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        tokenManager.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired');
      }

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken })
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (data.access) {
            tokenManager.setTokens(data.access, refreshToken);
            
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
          }
        }
        
        // Refresh failed, redirect to login
        tokenManager.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired');
      } catch (refreshError) {
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
    console.error('Notification API Request Error:', error);
    throw error;
  }
};

// Notifications API following existing patterns
export const notificationsAPI = {
  // Get notifications with pagination and filtering
  getNotifications: async (options = {}) => {
    try {
      const { page = 1, type, is_read } = options;
      const params = new URLSearchParams();
      
      if (page > 1) params.append('page', page);
      if (type) params.append('type', type);
      if (is_read !== undefined) params.append('is_read', is_read);
      
      const queryString = params.toString();
      const endpoint = queryString ? `/?${queryString}` : '/';
      
      return await notificationRequest(endpoint);
    } catch (error) {
      throw new Error('Failed to fetch notifications');
    }
  },

  // Get notification statistics
  getNotificationStats: async () => {
    try {
      return await notificationRequest('/stats/');
    } catch (error) {
      throw new Error('Failed to fetch notification stats');
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      return await notificationRequest('/unread-count/');
    } catch (error) {
      throw new Error('Failed to fetch unread count');
    }
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    try {
      return await notificationRequest(`/${notificationId}/read/`, {
        method: 'POST'
      });
    } catch (error) {
      throw new Error('Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      return await notificationRequest('/mark-all-read/', {
        method: 'POST'
      });
    } catch (error) {
      throw new Error('Failed to mark all notifications as read');
    }
  },

  // Delete specific notification
  deleteNotification: async (notificationId) => {
    try {
      return await notificationRequest(`/${notificationId}/delete/`, {
        method: 'DELETE'
      });
    } catch (error) {
      throw new Error('Failed to delete notification');
    }
  },

  // Clear all read notifications
  clearReadNotifications: async () => {
    try {
      return await notificationRequest('/clear-read/', {
        method: 'DELETE'
      });
    } catch (error) {
      throw new Error('Failed to clear read notifications');
    }
  },

  // Get notification settings
  getNotificationSettings: async () => {
    try {
      return await notificationRequest('/settings/');
    } catch (error) {
      throw new Error('Failed to fetch notification settings');
    }
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    try {
      return await notificationRequest('/settings/', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
    } catch (error) {
      throw new Error('Failed to update notification settings');
    }
  },

  // WebSocket connection helper
  createWebSocketConnection: () => {
    const token = tokenManager.getAccessToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = '127.0.0.1:8000'; // Match your development server
    const wsUrl = `${wsProtocol}//${wsHost}/ws/notifications/?token=${token}`;
    
    return new WebSocket(wsUrl);
  }
};

export default notificationsAPI;