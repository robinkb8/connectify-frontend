// src/utils/api.js
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const postsAPI = {
  fetchPosts: async (page = 1) => {
    const response = await fetch(`${API_BASE_URL}/posts/?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  createPost: async (postData) => {
    const formData = new FormData();
    if (postData.content) formData.append('content', postData.content);
    if (postData.image) formData.append('image', postData.image);

    const response = await fetch(`${API_BASE_URL}/posts/create/`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  }
};

export const commentsAPI = {
  getComments: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  addComment: async (postId, content) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  }
};