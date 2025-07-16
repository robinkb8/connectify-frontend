// src/store/actions/crossSliceActions.js - Cross-Slice Action Creators
import { createAsyncThunk } from '@reduxjs/toolkit';
import { postsAPI } from '../../utils/api';
import { 
  removePost, 
  updatePostStats, 
  updatePost 
} from '../slices/postsSlice';
import { 
  updateProfileInCache 
} from '../slices/profileSlice';
import { 
  addRealtimeMessage 
} from '../slices/chatsSlice';

/**
 * Enhanced post deletion that syncs across slices
 */
export const deletePostWithSync = createAsyncThunk(
  'crossSlice/deletePostWithSync',
  async ({ postId }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      
      // Find the post to get author info before deletion
      const postToDelete = state.posts.posts.find(post => post.id === postId);
      
      if (!postToDelete) {
        return rejectWithValue('Post not found');
      }
      
      // Delete from backend
      const response = await postsAPI.deletePost(postId);
      
      if (response.success) {
        // Remove from posts slice
        dispatch(removePost(postId));
        
        // Update profile stats
        if (postToDelete.author?.username) {
          const authorUsername = postToDelete.author.username;
          const currentProfile = state.profile.profiles[authorUsername];
          
          if (currentProfile) {
            dispatch(updateProfileInCache({
              username: authorUsername,
              updates: {
                profile: {
                  ...currentProfile.profile,
                  posts_count: Math.max(0, (currentProfile.profile?.posts_count || 1) - 1)
                }
              }
            }));
          }
        }
        
        return {
          postId,
          authorUsername: postToDelete.author?.username,
          message: 'Post deleted successfully'
        };
      } else {
        return rejectWithValue(response.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post with sync:', error);
      return rejectWithValue(error.message || 'Failed to delete post');
    }
  }
);

/**
 * Enhanced post like that syncs stats across slices
 */
export const likePostWithSync = createAsyncThunk(
  'crossSlice/likePostWithSync',
  async ({ postId, isLiked }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      const post = state.posts.posts.find(p => p.id === postId);
      
      if (!post) {
        return rejectWithValue('Post not found');
      }
      
      // Optimistic update
      const newLikeCount = isLiked ? post.total_likes + 1 : Math.max(0, post.total_likes - 1);
      
      dispatch(updatePostStats(postId, {
        is_liked: isLiked,
        total_likes: newLikeCount
      }));
      
      // Backend update (fire and forget for better UX)
      if (isLiked) {
        postsAPI.likePost(postId).catch(console.error);
      } else {
        postsAPI.unlikePost(postId).catch(console.error);
      }
      
      return {
        postId,
        isLiked,
        newLikeCount
      };
    } catch (error) {
      console.error('Error liking post with sync:', error);
      return rejectWithValue(error.message || 'Failed to like post');
    }
  }
);

/**
 * Enhanced comment addition that syncs across slices
 */
export const addCommentWithSync = createAsyncThunk(
  'crossSlice/addCommentWithSync',
  async ({ postId, commentContent }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      const post = state.posts.posts.find(p => p.id === postId);
      
      if (!post) {
        return rejectWithValue('Post not found');
      }
      
      // Update comment count optimistically
      dispatch(updatePostStats(postId, {
        total_comments: post.total_comments + 1
      }));
      
      return {
        postId,
        newCommentCount: post.total_comments + 1
      };
    } catch (error) {
      console.error('Error adding comment with sync:', error);
      return rejectWithValue(error.message || 'Failed to add comment');
    }
  }
);

/**
 * Enhanced profile update that syncs across all slices
 */
export const updateProfileWithSync = createAsyncThunk(
  'crossSlice/updateProfileWithSync',
  async ({ profileData }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentUsername = state.profile.currentUsername;
      
      if (!currentUsername) {
        return rejectWithValue('No current user');
      }
      
      // Update profile slice (this will be handled by the slice itself)
      // The middleware will sync with posts
      
      return {
        username: currentUsername,
        profileData
      };
    } catch (error) {
      console.error('Error updating profile with sync:', error);
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

/**
 * Enhanced message sending that syncs chat state
 */
export const sendMessageWithSync = createAsyncThunk(
  'crossSlice/sendMessageWithSync',
  async ({ chatId, content, messageType = 'text' }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Create optimistic message
      const optimisticMessage = {
        id: `temp_${Date.now()}`,
        content,
        message_type: messageType,
        sender: {
          id: currentUser.id,
          username: currentUser.username,
          full_name: currentUser.full_name,
          avatar: currentUser.profile?.avatar || null
        },
        created_at: new Date().toISOString(),
        status: 'sending',
        chat: chatId,
        is_own_message: true
      };
      
      // Add to chat slice
      dispatch(addRealtimeMessage({
        message: optimisticMessage,
        chatId
      }));
      
      return {
        chatId,
        message: optimisticMessage
      };
    } catch (error) {
      console.error('Error sending message with sync:', error);
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

/**
 * Enhanced follow action that syncs across profile and posts
 */
export const followUserWithSync = createAsyncThunk(
  'crossSlice/followUserWithSync',
  async ({ userId, isFollowing }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      
      // Update posts by this user to show follow status in author data
      const postsToUpdate = state.posts.posts.filter(
        post => post.author?.id === userId
      );
      
      postsToUpdate.forEach(post => {
        dispatch(updatePost({
          postId: post.id,
          updates: {
            author: {
              ...post.author,
              is_following: isFollowing
            }
          }
        }));
      });
      
      return {
        userId,
        isFollowing,
        updatedPostsCount: postsToUpdate.length
      };
    } catch (error) {
      console.error('Error following user with sync:', error);
      return rejectWithValue(error.message || 'Failed to follow user');
    }
  }
);

/**
 * Sync user data across all slices (for AuthContext updates)
 */
export const syncUserDataAcrossSlices = (userData) => (dispatch, getState) => {
  const state = getState();
  
  if (!userData || !userData.username) return;
  
  try {
    // Update profile slice if this is the current user
    if (state.profile.currentUsername === userData.username) {
      dispatch(updateProfileInCache({
        username: userData.username,
        updates: userData
      }));
    }
    
    // Update posts author data
    const postsToUpdate = state.posts.posts.filter(
      post => post.author?.username === userData.username
    );
    
    postsToUpdate.forEach(post => {
      dispatch(updatePost({
        postId: post.id,
        updates: {
          author: {
            ...post.author,
            name: userData.full_name || userData.username,
            avatar: userData.profile?.avatar || post.author.avatar,
            verified: userData.verified || false
          }
        }
      }));
    });
    
    console.log('🔄 Synced user data across slices for:', userData.username);
  } catch (error) {
    console.error('Error syncing user data across slices:', error);
  }
};

export default {
  deletePostWithSync,
  likePostWithSync,
  addCommentWithSync,
  updateProfileWithSync,
  sendMessageWithSync,
  followUserWithSync,
  syncUserDataAcrossSlices
};