 
// ===== src/utils/api/comments.js =====
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const commentsAPI = {
  // Get comments for a post
  getComments: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  // Add comment to post
  addComment: async (postId, content) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  },

  // Update comment
  updateComment: async (commentId, content) => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Failed to update comment');
    return response.json();
  },

  // Delete comment
  deleteComment: async (commentId) => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete comment');
  }
};