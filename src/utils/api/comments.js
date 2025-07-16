// src/utils/api/comments.js - Enhanced with JWT Authentication (COMPLETE FILE)
import apiRequest from '../api'; 

/**
 * Comments API with JWT authentication support
 * Uses the same token management system as the main API
 * ✅ PRESERVED: All existing functionality with enhanced error handling
 */
export const commentsAPI = {
  /**
   * Get comments for a specific post
   * @param {number} postId - The ID of the post
   * @returns {Promise} Array of comments with author info and replies
   */
  getComments: async (postId) => {
    try {
      console.log('📡 Fetching comments for post:', postId);
      const response = await apiRequest(`/posts/${postId}/comments/`);
      console.log('✅ Comments fetched successfully:', response.results?.length || 0, 'comments');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch comments:', error);
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
      console.log('📡 Adding comment to post:', postId, { content: content.substring(0, 50) + '...', parentComment });
      
      const requestBody = { content };
      if (parentComment) {
        requestBody.parent_comment = parentComment;
      }

      const response = await apiRequest(`/posts/${postId}/comments/`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      console.log('✅ Comment added successfully:', response.id);
      return response;
    } catch (error) {
      console.error('❌ Failed to add comment:', error);
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
      console.log('📡 Updating comment:', commentId, { content: content.substring(0, 50) + '...' });
      
      const response = await apiRequest(`/comments/${commentId}/`, {
        method: 'PUT',
        body: JSON.stringify({ content })
      });
      
      console.log('✅ Comment updated successfully:', commentId);
      return response;
    } catch (error) {
      console.error('❌ Failed to update comment:', error);
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
      console.log('📡 Deleting comment:', commentId);
      
      await apiRequest(`/comments/${commentId}/`, {
        method: 'DELETE'
      });
      
      console.log('✅ Comment deleted successfully:', commentId);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete comment:', error);
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
      console.log('📡 Fetching comment:', commentId);
      const response = await apiRequest(`/comments/${commentId}/`);
      console.log('✅ Comment fetched successfully:', commentId);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch comment:', error);
      throw new Error('Failed to fetch comment');
    }
  },

  /**
   * Get comments with pagination support
   * @param {number} postId - The ID of the post
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Items per page (default: 20)
   * @param {string} sortBy - Sort order: 'newest', 'oldest', 'popular' (default: 'newest')
   * @returns {Promise} Paginated comments response
   */
  getCommentsPaginated: async (postId, page = 1, pageSize = 20, sortBy = 'newest') => {
    try {
      console.log('📡 Fetching paginated comments for post:', postId, { page, pageSize, sortBy });
      
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        sort: sortBy
      });
      
      const response = await apiRequest(`/posts/${postId}/comments/?${params}`);
      console.log('✅ Paginated comments fetched:', response.results?.length || 0, 'comments');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch paginated comments:', error);
      throw new Error('Failed to fetch paginated comments');
    }
  },

  /**
   * Like/Unlike a comment
   * @param {number} commentId - The ID of the comment
   * @returns {Promise} Updated like status and count
   */
  toggleCommentLike: async (commentId) => {
    try {
      console.log('📡 Toggling like for comment:', commentId);
      
      const response = await apiRequest(`/comments/${commentId}/like/`, {
        method: 'POST'
      });
      
      console.log('✅ Comment like toggled:', commentId, response.is_liked ? 'liked' : 'unliked');
      return response;
    } catch (error) {
      console.error('❌ Failed to toggle comment like:', error);
      throw new Error('Failed to toggle comment like');
    }
  },

  /**
   * Report a comment for moderation
   * @param {number} commentId - The ID of the comment to report
   * @param {string} reason - Reason for reporting
   * @returns {Promise} Report confirmation
   */
  reportComment: async (commentId, reason) => {
    try {
      console.log('📡 Reporting comment:', commentId, { reason });
      
      const response = await apiRequest(`/comments/${commentId}/report/`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      
      console.log('✅ Comment reported successfully:', commentId);
      return response;
    } catch (error) {
      console.error('❌ Failed to report comment:', error);
      throw new Error('Failed to report comment');
    }
  }
};

export default commentsAPI;