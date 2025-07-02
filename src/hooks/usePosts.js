// src/hooks/usePosts.js
import { useState, useCallback, useEffect } from 'react';
import { postsAPI } from '../utils/api';

/**
 * Data transformation function - preserved from HomeFeed.jsx
 */
const transformApiPost = (apiPost) => {
  return {
    id: apiPost.id,
    author: {
      username: apiPost.author?.username || 'Unknown User',
      name: apiPost.author?.name || apiPost.author?.username || 'Unknown User',
      avatar: apiPost.author?.avatar || null,
      verified: apiPost.author?.verified || false
    },
    content: apiPost.content || '',
    image_url: apiPost.image_url || null,
    total_likes: apiPost.total_likes || 0,
    total_comments: apiPost.total_comments || 0,
    total_shares: apiPost.total_shares || 0,
    time_since_posted: apiPost.time_since_posted || 'Unknown time',
    is_liked: apiPost.is_liked || false,
    is_active: apiPost.is_active !== false
  };
};

/**
 * Custom hook for managing posts with real API integration
 * Handles fetching, pagination, and real-time updates
 */
const usePosts = (options = {}) => {
  const {
    autoLoad = true,
    pageSize = 10
  } = options;

  // State management
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch posts from API with pagination support
   */
  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1 && !append) {
        setLoading(true);
      }
      setError(null);

      const response = await postsAPI.fetchPosts(pageNum);
      
      // Handle both paginated and non-paginated responses
      let postsData, hasNext, totalCount;
      
      if (Array.isArray(response)) {
        // Non-paginated response
        postsData = response;
        hasNext = false;
        totalCount = response.length;
      } else {
        // Paginated response
        postsData = response.results || [];
        hasNext = !!response.next;
        totalCount = response.count || 0;
      }

      const transformedPosts = postsData.map(transformApiPost);

      if (pageNum === 1 || !append) {
        setPosts(transformedPosts);
      } else {
        setPosts(prev => [...prev, ...transformedPosts]);
      }

      setHasMore(hasNext);
      setPage(pageNum);

      return {
        posts: transformedPosts,
        hasMore: hasNext,
        totalCount
      };

    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
      
      if (pageNum === 1) {
        setPosts([]);
      }
      
      throw err;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * Load more posts (pagination)
   */
  const loadMorePosts = useCallback(async () => {
    if (hasMore && !loading) {
      try {
        await fetchPosts(page + 1, true);
      } catch (err) {
        console.error('Error loading more posts:', err);
      }
    }
  }, [hasMore, loading, page, fetchPosts]);

  /**
   * Refresh posts (pull to refresh)
   */
  const refreshPosts = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchPosts(1, false);
    } catch (err) {
      console.error('Error refreshing posts:', err);
    }
  }, [fetchPosts]);

  /**
   * Update specific post stats (likes, comments, etc.)
   */
  const updatePostStats = useCallback((postId, updates) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, ...updates }
          : post
      )
    );
  }, []);

  /**
   * Update post in list (for real-time updates)
   */
  const updatePost = useCallback((postId, updates) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, ...updates }
          : post
      )
    );
  }, []);

  /**
   * Add new post to the beginning of the list
   */
  const addPost = useCallback((newPost) => {
    const transformedPost = transformApiPost(newPost);
    setPosts(prevPosts => [transformedPost, ...prevPosts]);
  }, []);

  /**
   * Remove post from the list
   */
  const removePost = useCallback((postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Search/filter posts
   */
  const filterPosts = useCallback((searchQuery) => {
    if (!searchQuery.trim()) return posts;
    
    const query = searchQuery.toLowerCase();
    return posts.filter(post =>
      post.content?.toLowerCase().includes(query) ||
      post.author?.username?.toLowerCase().includes(query) ||
      post.author?.name?.toLowerCase().includes(query)
    );
  }, [posts]);

  /**
   * Get post by ID
   */
  const getPostById = useCallback((postId) => {
    return posts.find(post => post.id === postId);
  }, [posts]);

  /**
   * Auto-load posts on mount
   */
  useEffect(() => {
    if (autoLoad && posts.length === 0) {
      fetchPosts(1);
    }
  }, [autoLoad, fetchPosts, posts.length]);

  /**
   * Retry mechanism for failed requests
   */
  const retryFetch = useCallback(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  return {
    // State
    posts,
    loading,
    error,
    hasMore,
    refreshing,
    page,
    
    // Actions
    fetchPosts,
    loadMorePosts,
    refreshPosts,
    updatePostStats,
    updatePost,
    addPost,
    removePost,
    clearError,
    filterPosts,
    getPostById,
    retryFetch,
    
    // Computed
    isEmpty: posts.length === 0 && !loading,
    hasError: !!error,
    isInitialLoading: loading && posts.length === 0
  };
};

export default usePosts;