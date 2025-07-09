// src/utils/api/comments.js - Enhanced with JWT Authentication
import apiRequest from '../api'; 

/**
 * Comments API with JWT authentication support
 * Uses the same token management system as the main API
 */
export const commentsAPI = {
  /**
   * Get comments for a specific post
   * @param {number} postId - The ID of the post
   * @returns {Promise} Array of comments with author info and replies
   */
  getComments: async (postId) => {
    try {
      const response = await apiRequest(`/posts/${postId}/comments/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      throw new Error('Failed to fetch comments');
    }
  },

  /**
   * Add a new comment to a post
   * @param {number} postId - The ID of the post
   * @param {string} content - The comment content
   * @param {number|null} parentComment - Optional parent comment ID for replies
   * @returns {Promise} The created comment object
   */
  addComment: async (postId, content, parentComment = null) => {
    try {
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
      console.error('Failed to add comment:', error);
      throw new Error('Failed to add comment');
    }
  },

  /**
   * Update an existing comment (only by the author)
   * @param {number} commentId - The ID of the comment to update
   * @param {string} content - The new comment content
   * @returns {Promise} The updated comment object
   */
  updateComment: async (commentId, content) => {
    try {
      const response = await apiRequest(`/comments/${commentId}/`, {
        method: 'PUT',
        body: JSON.stringify({ content })
      });
      
      return response;
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw new Error('Failed to update comment');
    }
  },

  /**
   * Delete a comment (only by the author)
   * @param {number} commentId - The ID of the comment to delete
   * @returns {Promise} Success confirmation
   */
  deleteComment: async (commentId) => {
    try {
      await apiRequest(`/comments/${commentId}/`, {
        method: 'DELETE'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw new Error('Failed to delete comment');
    }
  },

  /**
   * Get a specific comment by ID
   * @param {number} commentId - The ID of the comment
   * @returns {Promise} The comment object
   */
  getComment: async (commentId) => {
    try {
      const response = await apiRequest(`/comments/${commentId}/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch comment:', error);
      throw new Error('Failed to fetch comment');
    }
  }
};

export default commentsAPI;