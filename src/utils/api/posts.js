// src/utils/api/posts.js - FINAL FIXED VERSION with JWT Authentication
import { tokenManager } from '../api';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Enhanced API request with JWT token support and file upload handling
 */
const postsApiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenManager.getAccessToken();

  const defaultHeaders = {};

  // Add Authorization header if token exists
  if (token && !options.skipAuth) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData - let browser set it
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    headers: { ...defaultHeaders, ...options.headers },
    ...options
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Posts API Request Error:', error);
    throw error;
  }
};

export const postsAPI = {
  // Get all posts with pagination
  getPosts: async (page = 1) => {
    try {
      const response = await postsApiRequest(`/posts/?page=${page}`);
      return response;
    } catch (error) {
      throw new Error('Failed to fetch posts');
    }
  },

  // FIXED: Create new post with proper JWT and FormData support
  createPost: async (postData) => {
    try {
      let body;
      let headers = {};

      // Get token for Authorization header
      const token = tokenManager.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Handle different input types
      if (postData instanceof FormData) {
        // Already FormData - use as is
        body = postData;
        // Don't set Content-Type for FormData
      } else if (postData.image) {
        // Has image - convert to FormData
        const formData = new FormData();
        formData.append('content', postData.content || '');
        formData.append('image', postData.image);
        body = formData;
      } else {
        // Text only - can use JSON
        body = JSON.stringify({ content: postData.content });
        headers['Content-Type'] = 'application/json';
      }

      console.log('🚀 Creating post with headers:', Object.keys(headers));
      console.log('📝 Token present:', !!token);

      const response = await fetch(`${API_BASE_URL}/posts/create/`, {
        method: 'POST',
        headers,
        body
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to create post: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Post created successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ Failed to create post:', error);
      throw error;
    }
  },

  // Get single post with JWT auth
  getPost: async (postId) => {
    try {
      const response = await postsApiRequest(`/posts/${postId}/`);
      return response;
    } catch (error) {
      throw new Error('Failed to fetch post');
    }
  },

  // FIXED: Like/Unlike post with proper JWT auth
  toggleLike: async (postId, isCurrentlyLiked) => {
    try {
      const method = isCurrentlyLiked ? 'DELETE' : 'POST';
      const response = await postsApiRequest(`/posts/${postId}/like/`, {
        method: method
      });
      return response;
    } catch (error) {
      console.error('Failed to toggle like:', error);
      throw error;
    }
  },

  // Get post statistics with JWT auth
  getPostStats: async (postId) => {
    try {
      const response = await postsApiRequest(`/posts/${postId}/stats/`);
      return response;
    } catch (error) {
      throw new Error('Failed to fetch post stats');
    }
  },

  // Get user's posts with JWT auth
  getUserPosts: async (userId) => {
    try {
      const response = await postsApiRequest(`/users/${userId}/posts/`);
      return response;
    } catch (error) {
      throw new Error('Failed to fetch user posts');
    }
  },

  // 🆕 NEW: Edit post with proper JWT auth (NOW INSIDE THE OBJECT)
  editPost: async (postId, updateData) => {
    try {
      let body;
      let headers = {};

      // Get token for Authorization header
      const token = tokenManager.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Handle different input types
      if (updateData instanceof FormData) {
        // Already FormData - use as is
        body = updateData;
        // Don't set Content-Type for FormData
      } else if (updateData.image) {
        // Has image - convert to FormData
        const formData = new FormData();
        if (updateData.content !== undefined) {
          formData.append('content', updateData.content || '');
        }
        formData.append('image', updateData.image);
        body = formData;
      } else {
        // Text only - can use JSON
        body = JSON.stringify({ content: updateData.content });
        headers['Content-Type'] = 'application/json';
      }

      console.log('🔄 Updating post with ID:', postId);

      const response = await fetch(`${API_BASE_URL}/posts/${postId}/edit/`, {
        method: 'PUT',
        headers,
        body
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to update post: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Post updated successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ Failed to update post:', error);
      throw error;
    }
  },

  // 🆕 NEW: Delete post with proper JWT auth (NOW INSIDE THE OBJECT)
  deletePost: async (postId) => {
    try {
      const token = tokenManager.getAccessToken();
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🗑️ Deleting post with ID:', postId);

      const response = await fetch(`${API_BASE_URL}/posts/${postId}/delete/`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to delete post: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Post deleted successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ Failed to delete post:', error);
      throw error;
    }
  }

}; // ← IMPORTANT: Object ends here with semicolon

export default postsAPI;