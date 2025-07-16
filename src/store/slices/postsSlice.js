// src/store/slices/postsSlice.js - Posts Redux Slice with API Integration
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postsAPI } from '../../utils/api';

/**
 * Data transformation function - preserved from usePosts hook
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

// Async Thunks for API calls
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page = 1, append = false }, { rejectWithValue }) => {
    try {
      const response = await postsAPI.fetchPosts(page);
      
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

      return {
        posts: transformedPosts,
        hasMore: hasNext,
        totalCount,
        page,
        append
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return rejectWithValue('Failed to load posts. Please try again.');
    }
  }
);

export const refreshPosts = createAsyncThunk(
  'posts/refreshPosts',
  async (_, { dispatch }) => {
    return dispatch(fetchPosts({ page: 1, append: false }));
  }
);

export const loadMorePosts = createAsyncThunk(
  'posts/loadMorePosts',
  async (_, { getState, dispatch }) => {
    const { posts } = getState();
    if (posts.hasMore && !posts.loading) {
      return dispatch(fetchPosts({ page: posts.page + 1, append: true }));
    }
  }
);

// Initial state matching usePosts hook structure
const initialState = {
  posts: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: false,
  refreshing: false,
  lastFetch: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Synchronous actions for real-time updates
    updatePost: (state, action) => {
      const { postId, updates } = action.payload;
      const postIndex = state.posts.findIndex(post => post.id === postId);
      if (postIndex !== -1) {
        state.posts[postIndex] = { ...state.posts[postIndex], ...updates };
      }
    },
    
    updatePostStats: (state, action) => {
      const { postId, updates } = action.payload;
      const postIndex = state.posts.findIndex(post => post.id === postId);
      if (postIndex !== -1) {
        state.posts[postIndex] = { ...state.posts[postIndex], ...updates };
      }
    },
    
    addPost: (state, action) => {
      const newPost = transformApiPost(action.payload);
      state.posts.unshift(newPost);
    },
    
    removePost: (state, action) => {
      const postId = action.payload;
      state.posts = state.posts.filter(post => post.id !== postId);
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset state action
    resetPosts: (state) => {
      return initialState;
    },
    
    // Set refreshing state
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state, action) => {
        const { page, append } = action.meta.arg || {};
        if (page === 1 && !append) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        const { posts, hasMore, page, append } = action.payload;
        
        if (page === 1 || !append) {
          state.posts = posts;
        } else {
          state.posts.push(...posts);
        }
        
        state.hasMore = hasMore;
        state.page = page;
        state.loading = false;
        state.refreshing = false;
        state.lastFetch = Date.now();
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload;
        
        // If first page failed, clear posts
        if (action.meta.arg?.page === 1) {
          state.posts = [];
        }
      })
      
      // Refresh Posts
      .addCase(refreshPosts.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      });
  },
});

// Export actions
export const {
  updatePost,
  updatePostStats,
  addPost,
  removePost,
  clearError,
  resetPosts,
  setRefreshing
} = postsSlice.actions;

// Selectors
export const selectPosts = (state) => state.posts.posts;
export const selectPostsLoading = (state) => state.posts.loading;
export const selectPostsError = (state) => state.posts.error;
export const selectPostsHasMore = (state) => state.posts.hasMore;
export const selectPostsRefreshing = (state) => state.posts.refreshing;
export const selectPostsPage = (state) => state.posts.page;

// Computed selectors
export const selectPostsIsEmpty = (state) => 
  state.posts.posts.length === 0 && !state.posts.loading;

export const selectPostsHasError = (state) => !!state.posts.error;

export const selectPostsIsInitialLoading = (state) => 
  state.posts.loading && state.posts.posts.length === 0;

// Filter posts selector
export const selectFilteredPosts = (searchQuery) => (state) => {
  const posts = selectPosts(state);
  if (!searchQuery?.trim()) return posts;
  
  const query = searchQuery.toLowerCase();
  return posts.filter(post =>
    post.content?.toLowerCase().includes(query) ||
    post.author?.username?.toLowerCase().includes(query) ||
    post.author?.name?.toLowerCase().includes(query)
  );
};

// Get post by ID selector
export const selectPostById = (postId) => (state) => {
  return state.posts.posts.find(post => post.id === postId);
};

export default postsSlice.reducer;