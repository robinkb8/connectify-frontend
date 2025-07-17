// src/hooks/usePostsRedux.js - Redux Bridge Hook with Identical API to usePosts
import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPosts,
  refreshPosts,
  loadMorePosts,
  updatePost,
  updatePostStats,
  addPost,
  removePost,
  clearError,
  resetPosts,
  selectPosts,
  selectPostsLoading,
  selectPostsError,
  selectPostsHasMore,
  selectPostsRefreshing,
  selectPostsPage,
  selectPostsIsEmpty,
  selectPostsHasError,
  selectPostsIsInitialLoading,
  selectFilteredPosts,
  selectPostById
} from '../store/slices/postsSlice';

/**
 * Redux-powered posts hook with identical API to original usePosts
 * This ensures seamless migration with zero breaking changes
 */
const usePostsRedux = (options = {}) => {
  const {
    autoLoad = true,
    pageSize = 10
  } = options;

  const dispatch = useDispatch();
  
  // Select all state from Redux store
  const posts = useSelector(selectPosts);
  const loading = useSelector(selectPostsLoading);
  const error = useSelector(selectPostsError);
  const hasMore = useSelector(selectPostsHasMore);
  const refreshing = useSelector(selectPostsRefreshing);
  const page = useSelector(selectPostsPage);
  
  // Computed values
  const isEmpty = useSelector(selectPostsIsEmpty);
  const hasError = useSelector(selectPostsHasError);
  const isInitialLoading = useSelector(selectPostsIsInitialLoading);

  /**
   * Fetch posts - matches original usePosts API exactly
   */
  const fetchPostsAction = useCallback(async (pageNum = 1, append = false) => {
    try {
      const result = await dispatch(fetchPosts({ page: pageNum, append }));
      
      if (fetchPosts.fulfilled.match(result)) {
        const { posts, hasMore, totalCount } = result.payload;
        return {
          posts,
          hasMore,
          totalCount
        };
      } else {
        throw new Error(result.payload || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      throw err;
    }
  }, [dispatch]);

  /**
   * Load more posts - matches original usePosts API exactly
   */
  const loadMorePostsAction = useCallback(async () => {
    if (hasMore && !loading) {
      try {
        await dispatch(loadMorePosts());
      } catch (err) {
        console.error('Error loading more posts:', err);
      }
    }
  }, [hasMore, loading, dispatch]);

  /**
   * Refresh posts - matches original usePosts API exactly
   */
  const refreshPostsAction = useCallback(async () => {
    try {
      await dispatch(refreshPosts());
    } catch (err) {
      console.error('Error refreshing posts:', err);
    }
  }, [dispatch]);

  /**
   * Update post stats - matches original usePosts API exactly
   */
  const updatePostStatsAction = useCallback((postId, updates) => {
    dispatch(updatePostStats({ postId, updates }));
  }, [dispatch]);

  /**
   * Update post - matches original usePosts API exactly
   */
  const updatePostAction = useCallback((postId, updates) => {
    dispatch(updatePost({ postId, updates }));
  }, [dispatch]);

  /**
   * Add new post - matches original usePosts API exactly
   */
  const addPostAction = useCallback((newPost) => {
    dispatch(addPost(newPost));
  }, [dispatch]);

  /**
   * Remove post - matches original usePosts API exactly
   */
  const removePostAction = useCallback((postId) => {
    dispatch(removePost(postId));
  }, [dispatch]);

  /**
   * Clear error - matches original usePosts API exactly
   */
  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Filter posts - matches original usePosts API exactly
   */
  const filterPosts = useCallback((searchQuery) => {
    // Use selector to filter posts
    if (!searchQuery?.trim()) return posts;
    
    const query = searchQuery.toLowerCase();
    return posts.filter(post =>
      post.content?.toLowerCase().includes(query) ||
      post.author?.username?.toLowerCase().includes(query) ||
      post.author?.name?.toLowerCase().includes(query)
    );
  }, [posts]);

  /**
   * Get post by ID - matches original usePosts API exactly
   */
  const getPostById = useCallback((postId) => {
    return posts.find(post => post.id === postId);
  }, [posts]);

  /**
   * Retry fetch - matches original usePosts API exactly
   */
  const retryFetch = useCallback(() => {
    dispatch(fetchPosts({ page: 1, append: false }));
  }, [dispatch]);

  /**
   * Auto-load posts on mount - matches original usePosts behavior
   */
  useEffect(() => {
    if (autoLoad && posts.length === 0 && !loading) {
      dispatch(fetchPosts({ page: 1, append: false }));
    }
  }, [autoLoad, posts.length, loading, dispatch]);

  // Return exact same API as original usePosts hook
  return {
    // State - identical to original
    posts,
    loading,
    error,
    hasMore,
    refreshing,
    page,
    
    // Actions - identical API to original
    fetchPosts: fetchPostsAction,
    loadMorePosts: loadMorePostsAction,
    refreshPosts: refreshPostsAction,
    updatePostStats: updatePostStatsAction,
    updatePost: updatePostAction,
    addPost: addPostAction,
    removePost: removePostAction,
    clearError: clearErrorAction,
    filterPosts,
    getPostById,
    retryFetch,
    
    // Computed - identical to original
    isEmpty,
    hasError,
    isInitialLoading
  };
};

export default usePostsRedux;