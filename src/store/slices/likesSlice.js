// src/store/slices/likesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postsAPI } from '../../utils/api';

// Async thunk for liking a post
export const likePost = createAsyncThunk(
  'likes/likePost',
  async ({ postId }, { rejectWithValue }) => {
    try {
      const response = await postsAPI.likePost(postId);
      return {
        postId,
        response,
        success: true
      };
    } catch (error) {
      return rejectWithValue({
        postId,
        error: error.message || 'Failed to like post'
      });
    }
  }
);

// Async thunk for unliking a post
export const unlikePost = createAsyncThunk(
  'likes/unlikePost',
  async ({ postId }, { rejectWithValue }) => {
    try {
      const response = await postsAPI.unlikePost(postId);
      return {
        postId,
        response,
        success: true
      };
    } catch (error) {
      return rejectWithValue({
        postId,
        error: error.message || 'Failed to unlike post'
      });
    }
  }
);

// Initial state structure
const initialState = {
  // Per-post like data indexed by postId
  posts: {},
  // Global loading states for optimistic updates
  loading: {}
};

// Helper function to get post state
const getPostState = (state, postId) => {
  return state.posts[postId] || {
    isLiked: false,
    likesCount: 0,
    error: null
  };
};

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    // Initialize post like state
    initializePost: (state, action) => {
      const { postId, isLiked = false, likesCount = 0 } = action.payload;
      if (!state.posts[postId]) {
        state.posts[postId] = {
          isLiked,
          likesCount,
          error: null
        };
      }
    },
    
    // Optimistic update for like toggle
    optimisticToggleLike: (state, action) => {
      const { postId } = action.payload;
      const postState = getPostState(state, postId);
      
      // Ensure post exists in state
      if (!state.posts[postId]) {
        state.posts[postId] = { ...postState };
      }
      
      // Toggle like state optimistically
      const newLikedState = !postState.isLiked;
      const newCount = newLikedState ? postState.likesCount + 1 : postState.likesCount - 1;
      
      state.posts[postId].isLiked = newLikedState;
      state.posts[postId].likesCount = newCount;
      state.posts[postId].error = null;
      state.loading[postId] = true;
    },
    
    // Rollback optimistic update on failure
    rollbackOptimisticUpdate: (state, action) => {
      const { postId, previousIsLiked, previousLikesCount, error } = action.payload;
      
      if (state.posts[postId]) {
        state.posts[postId].isLiked = previousIsLiked;
        state.posts[postId].likesCount = previousLikesCount;
        state.posts[postId].error = error;
      }
      state.loading[postId] = false;
    },
    
    // Clear error for a specific post
    clearError: (state, action) => {
      const { postId } = action.payload;
      if (state.posts[postId]) {
        state.posts[postId].error = null;
      }
    },
    
    // Reset post state (for testing)
    resetPostState: (state, action) => {
      const { postId } = action.payload;
      if (state.posts[postId]) {
        delete state.posts[postId];
      }
      if (state.loading[postId]) {
        delete state.loading[postId];
      }
    },
    
    // Update likes count from external source
    updateLikesCount: (state, action) => {
      const { postId, newCount } = action.payload;
      console.log('🔍 DEBUG updateLikesCount:', { postId, newCount, beforeState: state.posts[postId] });
      
      // Initialize post if it doesn't exist
      if (!state.posts[postId]) {
        state.posts[postId] = {
          isLiked: false,
          likesCount: newCount,
          error: null
        };
        console.log('🔍 DEBUG updateLikesCount - POST CREATED:', state.posts[postId]);
      } else {
        const oldCount = state.posts[postId].likesCount;
        state.posts[postId].likesCount = newCount;
        console.log('🔍 DEBUG updateLikesCount - POST UPDATED:', { oldCount, newCount, afterState: state.posts[postId] });
      }
    },
    
    // Update like status from external source
    updateLikeStatus: (state, action) => {
      const { postId, newIsLiked, newCount } = action.payload;
      console.log('🔍 DEBUG updateLikeStatus:', { postId, newIsLiked, newCount, beforeState: state.posts[postId] });
      
      // Always initialize or update post state
      if (!state.posts[postId]) {
        state.posts[postId] = {
          isLiked: newIsLiked,
          likesCount: typeof newCount === 'number' ? newCount : 0,
          error: null
        };
        console.log('🔍 DEBUG updateLikeStatus - POST CREATED:', state.posts[postId]);
      } else {
        const oldState = { ...state.posts[postId] };
        state.posts[postId].isLiked = newIsLiked;
        if (typeof newCount === 'number') {
          state.posts[postId].likesCount = newCount;
        }
        console.log('🔍 DEBUG updateLikeStatus - POST UPDATED:', { oldState, newState: state.posts[postId] });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Like post success
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, response } = action.payload;
        
        if (state.posts[postId]) {
          // Update with server response if available
          if (response && typeof response.total_likes === 'number') {
            state.posts[postId].likesCount = response.total_likes;
          }
          state.posts[postId].error = null;
        }
        state.loading[postId] = false;
      })
      
      // Like post failure (handled by rollback reducer)
      .addCase(likePost.rejected, (state, action) => {
        const { postId } = action.meta.arg;
        state.loading[postId] = false;
      })
      
      // Unlike post success
      .addCase(unlikePost.fulfilled, (state, action) => {
        const { postId, response } = action.payload;
        
        if (state.posts[postId]) {
          // Update with server response if available
          if (response && typeof response.total_likes === 'number') {
            state.posts[postId].likesCount = response.total_likes;
          }
          state.posts[postId].error = null;
        }
        state.loading[postId] = false;
      })
      
      // Unlike post failure (handled by rollback reducer)
      .addCase(unlikePost.rejected, (state, action) => {
        const { postId } = action.meta.arg;
        state.loading[postId] = false;
      });
  }
});

// Export actions
export const {
  initializePost,
  optimisticToggleLike,
  rollbackOptimisticUpdate,
  clearError,
  resetPostState,
  updateLikesCount,
  updateLikeStatus
} = likesSlice.actions;

// Selectors
export const selectLikes = (state) => state.likes;

export const selectPostLikes = (state, postId) => {
  const postState = state.likes.posts[postId];
  return postState ? {
    isLiked: postState.isLiked,
    likesCount: postState.likesCount,
    error: postState.error,
    isLoading: Boolean(state.likes.loading[postId])
  } : {
    isLiked: false,
    likesCount: 0,
    error: null,
    isLoading: false
  };
};

export const selectIsPostLoading = (state, postId) => {
  return Boolean(state.likes.loading[postId]);
};

export default likesSlice.reducer;