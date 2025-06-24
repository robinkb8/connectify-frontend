// src/utils/api.js - UPDATED WITH LIKES & COMMENTS API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ✅ BASE API REQUEST FUNCTION
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add authentication header when ready
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    ...options
  };

  console.log(`🔍 API Request: ${config.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ API Response:`, data);
    return data;

  } catch (error) {
    console.error(`❌ API Error for ${endpoint}:`, error);
    throw error;
  }
};

// ✅ POSTS API
export const postsAPI = {
  /**
   * Fetch posts from Django backend
   * Handles pagination for scalable social media feed
   */
  fetchPosts: async (page = 1) => {
    try {
      const data = await apiRequest(`/posts/?page=${page}`);
      
      return {
        posts: data.results || [],
        hasNext: !!data.next,
        hasPrevious: !!data.previous,
        count: data.count || 0
      };
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      throw error;
    }
  },

  /**
   * Get single post with full details (including comments)
   */
  getPost: async (postId) => {
    return await apiRequest(`/posts/${postId}/`);
  },

  /**
   * Create new post with optional image
   */
  createPost: async (postData) => {
    const formData = new FormData();
    
    if (postData.content) {
      formData.append('content', postData.content);
    }
    
    if (postData.image) {
      formData.append('image', postData.image);
    }

    return await apiRequest('/posts/create/', {
      method: 'POST',
      headers: {}, // Remove Content-Type for FormData
      body: formData
    });
  }
};

// ✅ LIKES API
export const likesAPI = {
  /**
   * Toggle like status for a post
   * @param {number} postId - ID of the post to like/unlike
   * @param {boolean} isCurrentlyLiked - Current like status
   * @returns {Promise} Response with updated like data
   */
  toggleLike: async (postId, isCurrentlyLiked) => {
    const method = isCurrentlyLiked ? 'DELETE' : 'POST';
    
    return await apiRequest(`/posts/${postId}/like/`, {
      method: method
    });
  },

  /**
   * Get detailed post statistics
   * @param {number} postId - ID of the post
   * @returns {Promise} Post stats including recent likers
   */
  getPostStats: async (postId) => {
    return await apiRequest(`/posts/${postId}/stats/`);
  }
};

// ✅ COMMENTS API  
export const commentsAPI = {
  /**
   * Get all comments for a specific post
   * @param {number} postId - ID of the post
   * @returns {Promise} Array of comments
   */
  getComments: async (postId) => {
    const data = await apiRequest(`/posts/${postId}/comments/`);
    return data.results || data; // Handle both paginated and non-paginated
  },

  /**
   * Add a new comment to a post
   * @param {number} postId - ID of the post
   * @param {string} content - Comment text
   * @param {number|null} parentCommentId - ID of parent comment (for replies)
   * @returns {Promise} Created comment data
   */
  addComment: async (postId, content, parentCommentId = null) => {
    const commentData = { content };
    
    if (parentCommentId) {
      commentData.parent_comment = parentCommentId;
    }

    return await apiRequest(`/posts/${postId}/comments/`, {
      method: 'POST',
      body: JSON.stringify(commentData)
    });
  },

  /**
   * Update an existing comment
   * @param {number} commentId - ID of the comment to update
   * @param {string} content - New comment text
   * @returns {Promise} Updated comment data
   */
  updateComment: async (commentId, content) => {
    return await apiRequest(`/comments/${commentId}/`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
  },

  /**
   * Delete a comment
   * @param {number} commentId - ID of the comment to delete
   * @returns {Promise} Deletion confirmation
   */
  deleteComment: async (commentId) => {
    return await apiRequest(`/comments/${commentId}/`, {
      method: 'DELETE'
    });
  },

  /**
   * Get a specific comment by ID
   * @param {number} commentId - ID of the comment
   * @returns {Promise} Comment data
   */
  getComment: async (commentId) => {
    return await apiRequest(`/comments/${commentId}/`);
  }
};

// ✅ USER API (for future use)
export const userAPI = {
  /**
   * Get posts by a specific user
   * @param {number} userId - ID of the user
   * @returns {Promise} Array of user's posts
   */
  getUserPosts: async (userId) => {
    const data = await apiRequest(`/users/${userId}/posts/`);
    return data.results || data;
  }
};

/**
 * Transform Django API response to match current PostCard format
 * This keeps our existing PostCard component working
 */
export const transformApiPost = (apiPost) => {
  return {
    id: apiPost.id,
    user: {
      username: apiPost.author?.username || 'Unknown User',
      avatar: apiPost.author?.avatar || '/api/placeholder/32/32',
      verified: false // Can add this field to backend later
    },
    content: apiPost.content || '',
    image: apiPost.image_url || null,
    timestamp: apiPost.time_since_posted || 'Unknown time',
    likes: {
      count: apiPost.total_likes || 0,
      isLiked: apiPost.is_liked || false
    },
    comments: apiPost.total_comments || 0,
    shares: apiPost.total_shares || 0,
    isActive: apiPost.is_active !== false
  };
};

// ✅ UTILITY FUNCTIONS
export const apiUtils = {
  /**
   * Handle API errors with user-friendly messages
   * @param {Error} error - The error object
   * @returns {string} User-friendly error message
   */
  getErrorMessage: (error) => {
    if (error.message.includes('404')) {
      return 'Content not found. It may have been deleted.';
    } else if (error.message.includes('401')) {
      return 'Please log in to continue.';
    } else if (error.message.includes('403')) {
      return 'You don\'t have permission to do this.';
    } else if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    } else if (!navigator.onLine) {
      return 'Check your internet connection.';
    } else {
      return 'Something went wrong. Please try again.';
    }
  },

  /**
   * Retry an API call with exponential backoff
   * @param {Function} apiCall - The API function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Initial delay in milliseconds
   * @returns {Promise} Result of the API call
   */
  retryApiCall: async (apiCall, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
};

// ✅ EXAMPLE USAGE:
/*
// Like a post
import { likesAPI } from './utils/api';

const handleLike = async (postId, isLiked) => {
  try {
    const result = await likesAPI.toggleLike(postId, isLiked);
    console.log('Like toggled:', result);
  } catch (error) {
    console.error('Failed to like post:', error);
  }
};

// Add a comment
import { commentsAPI } from './utils/api';

const handleComment = async (postId, commentText) => {
  try {
    const newComment = await commentsAPI.addComment(postId, commentText);
    console.log('Comment added:', newComment);
  } catch (error) {
    console.error('Failed to add comment:', error);
  }
};

// Fetch posts with error handling
import { postsAPI, apiUtils } from './utils/api';

const loadPosts = async () => {
  try {
    const response = await apiUtils.retryApiCall(
      () => postsAPI.fetchPosts(1)
    );
    setPosts(response.posts);
  } catch (error) {
    const message = apiUtils.getErrorMessage(error);
    setError(message);
  }
};
*/