// src/store/middleware/crossSliceMiddleware.js - Cross-Slice Synchronization Middleware
import { 
  updatePost, 
  removePost, 
  addPost 
} from '../slices/postsSlice';

import { 
  addRealtimeMessage, 
  updateChatIdCache 
} from '../slices/chatsSlice';

import { 
  updateProfileInCache, 
  updateFollowerCount,
  setCurrentProfile 
} from '../slices/profileSlice';

/**
 * Cross-slice synchronization middleware
 * Handles data consistency across different Redux slices
 */
const crossSliceMiddleware = (store) => (next) => (action) => {
  // Call the next middleware/reducer first
  const result = next(action);
  
  // Get current state after the action
  const state = store.getState();
  
  // Handle cross-slice synchronizations based on action type
  switch (action.type) {
    
    // ============================================================
    // POSTS SLICE SYNCHRONIZATIONS
    // ============================================================
    
    case 'posts/removePost': {
      // When a post is deleted, update profile stats
      const { payload: postId } = action;
      const deletedPost = state.posts.posts.find(post => post.id === postId);
      
      if (deletedPost && deletedPost.author) {
        const authorUsername = deletedPost.author.username;
        
        // Update profile posts count in profile slice
        store.dispatch(updateProfileInCache({
          username: authorUsername,
          updates: {
            profile: {
              ...state.profile.profiles[authorUsername]?.profile,
              posts_count: Math.max(0, (state.profile.profiles[authorUsername]?.profile?.posts_count || 1) - 1)
            }
          }
        }));
        
        console.log('🔄 Cross-slice sync: Post deleted, updated profile stats for', authorUsername);
      }
      break;
    }
    
    case 'posts/addPost': {
      // When a new post is added, update profile stats
      const { payload: newPost } = action;
      
      if (newPost && newPost.author) {
        const authorUsername = newPost.author.username;
        
        // Update profile posts count in profile slice
        store.dispatch(updateProfileInCache({
          username: authorUsername,
          updates: {
            profile: {
              ...state.profile.profiles[authorUsername]?.profile,
              posts_count: (state.profile.profiles[authorUsername]?.profile?.posts_count || 0) + 1
            }
          }
        }));
        
        console.log('🔄 Cross-slice sync: Post added, updated profile stats for', authorUsername);
      }
      break;
    }
    
    // ============================================================
    // PROFILE SLICE SYNCHRONIZATIONS
    // ============================================================
    
    case 'profile/updateProfileData/fulfilled': {
      // When profile is updated, sync with posts author data
      const { payload } = action;
      const updatedProfile = payload.profile;
      
      if (updatedProfile) {
        // Update author data in all posts by this user
        const postsToUpdate = state.posts.posts.filter(
          post => post.author?.username === updatedProfile.username
        );
        
        postsToUpdate.forEach(post => {
          store.dispatch(updatePost({
            postId: post.id,
            updates: {
              author: {
                ...post.author,
                name: updatedProfile.full_name || updatedProfile.username,
                avatar: updatedProfile.profile?.avatar || post.author.avatar,
                verified: updatedProfile.verified || false
              }
            }
          }));
        });
        
        console.log('🔄 Cross-slice sync: Profile updated, synced with posts author data for', updatedProfile.username);
      }
      break;
    }
    
    case 'profile/uploadProfileAvatar/fulfilled': {
      // When avatar is uploaded, sync across all slices
      const { payload } = action;
      const { avatar_url } = payload;
      const currentUsername = state.profile.currentUsername;
      
      if (currentUsername && avatar_url) {
        // Update author avatar in all posts by this user
        const postsToUpdate = state.posts.posts.filter(
          post => post.author?.username === currentUsername
        );
        
        postsToUpdate.forEach(post => {
          store.dispatch(updatePost({
            postId: post.id,
            updates: {
              author: {
                ...post.author,
                avatar: avatar_url
              }
            }
          }));
        });
        
        console.log('🔄 Cross-slice sync: Avatar updated, synced across posts for', currentUsername);
      }
      break;
    }
    
    case 'profile/followUser/fulfilled':
    case 'profile/unfollowUser/fulfilled': {
      // When follow status changes, update profile follower counts
      const { userId, isFollowing, followerCount } = action.payload;
      
      // Update follower count in profile slice (already handled by reducer)
      // But we could sync with other slices if needed
      
      console.log('🔄 Cross-slice sync: Follow status updated for user', userId, 'Following:', isFollowing, 'Count:', followerCount);
      break;
    }
    
    // ============================================================
    // CHATS SLICE SYNCHRONIZATIONS
    // ============================================================
    
    case 'chats/addRealtimeMessage': {
      // When a new message is received, we could update user "last seen" status
      const { payload } = action;
      const { message, chatId } = payload;
      
      if (message && message.sender) {
        // Could sync last activity with profile data
        const senderUsername = message.sender.username;
        
        console.log('🔄 Cross-slice sync: New message received from', senderUsername, 'in chat', chatId);
      }
      break;
    }
    
    case 'chats/createNewChat/fulfilled': {
      // When a new chat is created, cache the user-to-chat mapping
      const { payload: newChat } = action;
      
      if (newChat && newChat.participants) {
        // Cache user ID to chat ID mappings for faster lookup
        newChat.participants.forEach(participant => {
          if (participant.id) {
            store.dispatch(updateChatIdCache({
              userId: participant.id,
              chatId: newChat.id
            }));
          }
        });
        
        console.log('🔄 Cross-slice sync: New chat created, cached user mappings for chat', newChat.id);
      }
      break;
    }
    
    // ============================================================
    // AUTHENTICATION CONTEXT SYNCHRONIZATIONS
    // ============================================================
    
    // Note: These would be handled by AuthContext updates, but we can listen for them
    case 'auth/updateUser': {
      // If we had auth in Redux, we'd sync here
      // For now, AuthContext handles this separately
      break;
    }
    
    default:
      // No cross-slice sync needed for this action
      break;
  }
  
  return result;
};

export default crossSliceMiddleware;