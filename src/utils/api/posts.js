 

// ===== src/utils/api/posts.js =====
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const postsAPI = {
  // Get all posts
  getPosts: async (page = 1) => {
    const response = await fetch(`${API_BASE_URL}/posts/?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  // Create new post
  createPost: async (postData) => {
    const response = await fetch(`${API_BASE_URL}/posts/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  // Like/Unlike post
  toggleLike: async (postId, isLiked) => {
    const method = isLiked ? 'DELETE' : 'POST';
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like/`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) throw new Error('Failed to toggle like');
    return response.json();
  },

  // Get post stats
  getPostStats: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/stats/`);
    if (!response.ok) throw new Error('Failed to fetch post stats');
    return response.json();
  }
};