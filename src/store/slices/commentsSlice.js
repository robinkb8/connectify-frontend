// src/store/slices/commentsSlice.js - Comments Redux Slice with Optimistic Updates
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { commentsAPI } from '../../utils/api';

// Async Thunks for API calls
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ postId }, { rejectWithValue }) => {
    try {
      const response = await commentsAPI.getComments(postId);
      
      // Transform API response to match UI format
      const transformedComments = response.results.map(comment => ({
        id: comment.id,
        user: {
          name: comment.author?.full_name || comment.author?.username || 'Unknown User',
          username: comment.author?.username || 'unknown',
          avatar: comment.author?.avatar || null
        },
        content: comment.content,
        timestamp: comment.time_since_posted || 'Unknown time',
        likes: 0, // Comments likes not implemented yet
        isLiked: false,
        isNew: false,
        replies: comment.replies ? comment.replies.map(reply => ({
          id: reply.id,
          user: {
            name: reply.author?.full_name || reply.author?.username || 'Unknown User',
            username: reply.author?.username || 'unknown',
            avatar: reply.author?.avatar || null
          },
          content: reply.content,
          timestamp: reply.time_since_posted || 'Unknown time',
          likes: 0,
          isLiked: false,
          isNew: false
        })) : []
      }));

      return { postId, comments: transformedComments };
    } catch (error) {
      console.error('Error fetching comments:', error);
      return rejectWithValue('Failed to load comments. Please try again.');
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ postId, content, parentCommentId = null }, { rejectWithValue, getState }) => {
    try {
      const response = await commentsAPI.addComment(postId, content, parentCommentId);
      
      // Transform the response
      const realComment = {
        id: response.id,
        user: {
          name: response.author?.full_name || response.author?.username || 'You',
          username: response.author?.username || 'you',
          avatar: response.author?.avatar || null
        },
        content: response.content,
        timestamp: response.time_since_posted || 'just now',
        likes: 0,
        isLiked: false,
        isNew: true,
        isOptimistic: false,
        replies: []
      };

      return { postId, comment: realComment, parentCommentId };
    } catch (error) {
      console.error('Error adding comment:', error);
      return rejectWithValue('Failed to post comment. Please try again.');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async ({ commentId, postId }, { rejectWithValue }) => {
    try {
      await commentsAPI.deleteComment(commentId);
      return { postId, commentId };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return rejectWithValue('Failed to delete comment. Please try again.');
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ commentId, newContent, postId }, { rejectWithValue }) => {
    try {
      const response = await commentsAPI.updateComment(commentId, newContent);
      return { postId, commentId, newContent };
    } catch (error) {
      console.error('Error updating comment:', error);
      return rejectWithValue('Failed to update comment. Please try again.');
    }
  }
);

// Initial state
const initialState = {
  // Comments data by postId
  commentsByPost: {}, // { postId: { comments: [], isLoading: false, etc. } }
  
  // Global loading states
  isSubmitting: false,
  
  // Error states
  error: null,
  
  // UI states
  sortBy: 'newest',
  
  // Optimistic updates tracking
  optimisticComments: {}, // { postId: [optimistic comments] }
};

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    // Add optimistic comment immediately
    addOptimisticComment: (state, action) => {
      const { postId, comment, parentCommentId } = action.payload;
      
      if (!state.commentsByPost[postId]) {
        state.commentsByPost[postId] = {
          comments: [],
          isLoading: false,
          hasLoaded: false
        };
      }
      
      if (parentCommentId) {
        // Adding a reply
        const parentIndex = state.commentsByPost[postId].comments.findIndex(
          c => c.id === parentCommentId
        );
        if (parentIndex !== -1) {
          if (!state.commentsByPost[postId].comments[parentIndex].replies) {
            state.commentsByPost[postId].comments[parentIndex].replies = [];
          }
          state.commentsByPost[postId].comments[parentIndex].replies.unshift(comment);
        }
      } else {
        // Adding a top-level comment
        state.commentsByPost[postId].comments.unshift(comment);
      }
    },
    
    // Remove optimistic comment on failure
    removeOptimisticComment: (state, action) => {
      const { postId, tempCommentId, parentCommentId } = action.payload;
      
      if (!state.commentsByPost[postId]) return;
      
      if (parentCommentId) {
        // Remove reply
        const parentIndex = state.commentsByPost[postId].comments.findIndex(
          c => c.id === parentCommentId
        );
        if (parentIndex !== -1 && state.commentsByPost[postId].comments[parentIndex].replies) {
          state.commentsByPost[postId].comments[parentIndex].replies = 
            state.commentsByPost[postId].comments[parentIndex].replies.filter(
              reply => reply.id !== tempCommentId
            );
        }
      } else {
        // Remove top-level comment
        state.commentsByPost[postId].comments = state.commentsByPost[postId].comments.filter(
          comment => comment.id !== tempCommentId
        );
      }
    },
    
    // Replace optimistic comment with real one
    replaceOptimisticComment: (state, action) => {
      const { postId, tempCommentId, realComment, parentCommentId } = action.payload;
      
      if (!state.commentsByPost[postId]) return;
      
      if (parentCommentId) {
        // Replace reply
        const parentIndex = state.commentsByPost[postId].comments.findIndex(
          c => c.id === parentCommentId
        );
        if (parentIndex !== -1 && state.commentsByPost[postId].comments[parentIndex].replies) {
          const replyIndex = state.commentsByPost[postId].comments[parentIndex].replies.findIndex(
            reply => reply.id === tempCommentId
          );
          if (replyIndex !== -1) {
            state.commentsByPost[postId].comments[parentIndex].replies[replyIndex] = realComment;
          }
        }
      } else {
        // Replace top-level comment
        const commentIndex = state.commentsByPost[postId].comments.findIndex(
          comment => comment.id === tempCommentId
        );
        if (commentIndex !== -1) {
          state.commentsByPost[postId].comments[commentIndex] = realComment;
        }
      }
    },
    
    // Sort comments
    sortComments: (state, action) => {
      const { postId, sortBy } = action.payload;
      
      state.sortBy = sortBy;
      
      if (!state.commentsByPost[postId]) return;
      
      const comments = state.commentsByPost[postId].comments;
      switch (sortBy) {
        case 'popular':
          comments.sort((a, b) => (b.likes || 0) - (a.likes || 0));
          break;
        case 'oldest':
          comments.reverse();
          break;
        default: // newest
          // Already in newest first order
          break;
      }
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear comments for a specific post
    clearCommentsForPost: (state, action) => {
      const { postId } = action.payload;
      if (state.commentsByPost[postId]) {
        delete state.commentsByPost[postId];
      }
    },
    
    // Reset entire comments state
    resetComments: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(fetchComments.pending, (state, action) => {
        const { postId } = action.meta.arg;
        
        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = {
            comments: [],
            isLoading: true,
            hasLoaded: false
          };
        } else {
          state.commentsByPost[postId].isLoading = true;
        }
        
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        
        state.commentsByPost[postId] = {
          comments,
          isLoading: false,
          hasLoaded: true
        };
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const { postId } = action.meta.arg;
        
        if (state.commentsByPost[postId]) {
          state.commentsByPost[postId].isLoading = false;
        }
        
        state.error = action.payload;
      })
      
      // Add Comment
      .addCase(addComment.pending, (state, action) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment, parentCommentId } = action.payload;
        const { content } = action.meta.arg;
        
        // Find and replace optimistic comment with real one
        if (!state.commentsByPost[postId]) return;
        
        if (parentCommentId) {
          // Replace optimistic reply
          const parentIndex = state.commentsByPost[postId].comments.findIndex(
            c => c.id === parentCommentId
          );
          if (parentIndex !== -1 && state.commentsByPost[postId].comments[parentIndex].replies) {
            const replyIndex = state.commentsByPost[postId].comments[parentIndex].replies.findIndex(
              reply => reply.isOptimistic && reply.content === content
            );
            if (replyIndex !== -1) {
              state.commentsByPost[postId].comments[parentIndex].replies[replyIndex] = comment;
            }
          }
        } else {
          // Replace optimistic top-level comment
          const commentIndex = state.commentsByPost[postId].comments.findIndex(
            c => c.isOptimistic && c.content === content
          );
          if (commentIndex !== -1) {
            state.commentsByPost[postId].comments[commentIndex] = comment;
          }
        }
        
        state.isSubmitting = false;
      })
      .addCase(addComment.rejected, (state, action) => {
        const { postId, content, parentCommentId } = action.meta.arg;
        
        // Remove failed optimistic comment
        if (!state.commentsByPost[postId]) return;
        
        if (parentCommentId) {
          // Remove failed reply
          const parentIndex = state.commentsByPost[postId].comments.findIndex(
            c => c.id === parentCommentId
          );
          if (parentIndex !== -1 && state.commentsByPost[postId].comments[parentIndex].replies) {
            state.commentsByPost[postId].comments[parentIndex].replies = 
              state.commentsByPost[postId].comments[parentIndex].replies.filter(
                reply => !(reply.isOptimistic && reply.content === content)
              );
          }
        } else {
          // Remove failed top-level comment
          state.commentsByPost[postId].comments = state.commentsByPost[postId].comments.filter(
            comment => !(comment.isOptimistic && comment.content === content)
          );
        }
        
        state.isSubmitting = false;
        state.error = action.payload;
      })
      
      // Delete Comment
      .addCase(deleteComment.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        
        if (!state.commentsByPost[postId]) return;
        
        // Remove comment from state
        state.commentsByPost[postId].comments = state.commentsByPost[postId].comments.filter(comment => {
          if (comment.id === commentId) return false;
          if (comment.replies) {
            comment.replies = comment.replies.filter(reply => reply.id !== commentId);
          }
          return true;
        });
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Update Comment
      .addCase(updateComment.pending, (state) => {
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const { postId, commentId, newContent } = action.payload;
        
        if (!state.commentsByPost[postId]) return;
        
        // Update comment in state
        state.commentsByPost[postId].comments = state.commentsByPost[postId].comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, content: newContent, isEdited: true };
          }
          if (comment.replies) {
            comment.replies = comment.replies.map(reply => 
              reply.id === commentId 
                ? { ...reply, content: newContent, isEdited: true }
                : reply
            );
          }
          return comment;
        });
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  addOptimisticComment,
  removeOptimisticComment,
  replaceOptimisticComment,
  sortComments,
  clearError,
  clearCommentsForPost,
  resetComments
} = commentsSlice.actions;

// Selectors
export const selectCommentsByPost = (postId) => (state) => {
  return state.comments.commentsByPost[postId]?.comments || [];
};

export const selectCommentsLoading = (postId) => (state) => {
  return state.comments.commentsByPost[postId]?.isLoading || false;
};

export const selectCommentsHasLoaded = (postId) => (state) => {
  return state.comments.commentsByPost[postId]?.hasLoaded || false;
};

export const selectCommentsSubmitting = (state) => state.comments.isSubmitting;
export const selectCommentsError = (state) => state.comments.error;
export const selectCommentsSortBy = (state) => state.comments.sortBy;

// Computed selectors
export const selectCommentCount = (postId) => (state) => {
  const comments = state.comments.commentsByPost[postId]?.comments || [];
  return comments.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0);
  }, 0);
};

export const selectCommentsByPostWithCount = (postId) => (state) => {
  const comments = state.comments.commentsByPost[postId]?.comments || [];
  const count = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0);
  }, 0);
  
  return { comments, count };
};

export default commentsSlice.reducer;