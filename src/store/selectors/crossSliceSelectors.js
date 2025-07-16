// src/store/selectors/crossSliceSelectors.js - Cross-Slice Selectors
import { createSelector } from '@reduxjs/toolkit';
import { 
  selectPosts, 
  selectPostsLoading, 
  selectFilteredPosts 
} from '../slices/postsSlice';
import { 
  selectChats, 
  selectMessages, 
  selectCurrentChat 
} from '../slices/chatsSlice';
import { 
  selectProfiles, 
  selectCurrentProfile 
} from '../slices/profileSlice';

/**
 * Enhanced posts with author profile data
 * Combines posts with full author profiles from profile slice
 */
export const selectEnhancedPosts = createSelector(
  [selectPosts, selectProfiles],
  (posts, profiles) => {
    return posts.map(post => {
      const authorProfile = profiles[post.author?.username];
      
      if (authorProfile) {
        return {
          ...post,
          author: {
            ...post.author,
            full_name: authorProfile.full_name || post.author.name,
            avatar: authorProfile.profile?.avatar || post.author.avatar,
            verified: authorProfile.verified || false,
            is_following: authorProfile.is_following || false,
            follower_count: authorProfile.profile?.followers_count || 0
          }
        };
      }
      
      return post;
    });
  }
);

/**
 * Posts by specific user with enhanced author data
 */
export const selectPostsByUser = createSelector(
  [selectEnhancedPosts, (state, username) => username],
  (enhancedPosts, username) => {
    return enhancedPosts.filter(post => 
      post.author?.username === username
    );
  }
);

/**
 * User stats combining posts and profile data
 */
export const selectUserStats = createSelector(
  [selectProfiles, selectPosts, (state, username) => username],
  (profiles, posts, username) => {
    const profile = profiles[username];
    const userPosts = posts.filter(post => post.author?.username === username);
    
    if (!profile) {
      return {
        posts_count: userPosts.length,
        followers_count: 0,
        following_count: 0,
        total_likes: 0
      };
    }
    
    const totalLikes = userPosts.reduce((sum, post) => sum + (post.total_likes || 0), 0);
    
    return {
      posts_count: Math.max(userPosts.length, profile.profile?.posts_count || 0),
      followers_count: profile.profile?.followers_count || 0,
      following_count: profile.profile?.following_count || 0,
      total_likes: totalLikes,
      actual_posts_count: userPosts.length
    };
  }
);

/**
 * Chat with enhanced participant data from profiles
 */
export const selectEnhancedChats = createSelector(
  [selectChats, selectProfiles],
  (chats, profiles) => {
    return chats.map(chat => {
      const enhancedParticipants = chat.participants?.map(participant => {
        const profile = profiles[participant.username];
        return profile ? {
          ...participant,
          full_name: profile.full_name || participant.name,
          avatar: profile.profile?.avatar || participant.avatar,
          verified: profile.verified || false
        } : participant;
      });
      
      return {
        ...chat,
        participants: enhancedParticipants,
        other_participant: enhancedParticipants?.find(p => 
          p.username !== JSON.parse(localStorage.getItem('user') || '{}').username
        )
      };
    });
  }
);

/**
 * Current chat with enhanced data
 */
export const selectEnhancedCurrentChat = createSelector(
  [selectCurrentChat, selectProfiles],
  (currentChat, profiles) => {
    if (!currentChat) return null;
    
    const enhancedParticipants = currentChat.participants?.map(participant => {
      const profile = profiles[participant.username];
      return profile ? {
        ...participant,
        full_name: profile.full_name || participant.name,
        avatar: profile.profile?.avatar || participant.avatar,
        verified: profile.verified || false
      } : participant;
    });
    
    return {
      ...currentChat,
      participants: enhancedParticipants,
      other_participant: enhancedParticipants?.find(p => 
        p.username !== JSON.parse(localStorage.getItem('user') || '{}').username
      )
    };
  }
);

/**
 * Messages with enhanced sender data
 */
export const selectEnhancedMessages = createSelector(
  [selectMessages, selectProfiles, (state, chatId) => chatId],
  (messages, profiles, chatId) => {
    const chatMessages = messages[chatId] || [];
    
    return chatMessages.map(message => {
      const senderProfile = profiles[message.sender?.username];
      
      if (senderProfile) {
        return {
          ...message,
          sender: {
            ...message.sender,
            full_name: senderProfile.full_name || message.sender.name,
            avatar: senderProfile.profile?.avatar || message.sender.avatar,
            verified: senderProfile.verified || false
          }
        };
      }
      
      return message;
    });
  }
);

/**
 * Global loading state across all slices
 */
export const selectGlobalLoading = createSelector(
  [
    (state) => state.posts.loading,
    (state) => state.chats.isLoading,
    (state) => state.profile.loading
  ],
  (postsLoading, chatsLoading, profileLoading) => {
    return {
      isLoading: postsLoading || chatsLoading || profileLoading,
      posts: postsLoading,
      chats: chatsLoading,
      profile: profileLoading
    };
  }
);

/**
 * Global error state across all slices
 */
export const selectGlobalError = createSelector(
  [
    (state) => state.posts.error,
    (state) => state.chats.error,
    (state) => state.profile.error
  ],
  (postsError, chatsError, profileError) => {
    const errors = [postsError, chatsError, profileError].filter(Boolean);
    
    return {
      hasError: errors.length > 0,
      errors: {
        posts: postsError,
        chats: chatsError,
        profile: profileError
      },
      firstError: errors[0] || null
    };
  }
);

/**
 * Notification data combining unread messages and activity
 */
export const selectNotificationData = createSelector(
  [selectChats, selectMessages],
  (chats, messages) => {
    const totalUnreadMessages = chats.reduce((sum, chat) => 
      sum + (chat.unread_count || 0), 0
    );
    
    const recentActivity = chats
      .filter(chat => chat.last_activity)
      .sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity))
      .slice(0, 5);
    
    return {
      unreadMessages: totalUnreadMessages,
      recentChats: recentActivity,
      hasActivity: totalUnreadMessages > 0 || recentActivity.length > 0
    };
  }
);

/**
 * Search results across all slices
 */
export const selectSearchResults = createSelector(
  [selectEnhancedPosts, selectEnhancedChats, selectProfiles, (state, query) => query],
  (posts, chats, profiles, query) => {
    if (!query || query.trim().length < 2) {
      return {
        posts: [],
        users: [],
        chats: [],
        total: 0
      };
    }
    
    const searchQuery = query.toLowerCase();
    
    const matchingPosts = posts.filter(post =>
      post.content?.toLowerCase().includes(searchQuery) ||
      post.author?.name?.toLowerCase().includes(searchQuery) ||
      post.author?.username?.toLowerCase().includes(searchQuery)
    ).slice(0, 10);
    
    const matchingUsers = Object.values(profiles).filter(profile =>
      profile.full_name?.toLowerCase().includes(searchQuery) ||
      profile.username?.toLowerCase().includes(searchQuery) ||
      profile.profile?.bio?.toLowerCase().includes(searchQuery)
    ).slice(0, 10);
    
    const matchingChats = chats.filter(chat =>
      chat.display_name?.toLowerCase().includes(searchQuery) ||
      chat.other_participant?.full_name?.toLowerCase().includes(searchQuery) ||
      chat.other_participant?.username?.toLowerCase().includes(searchQuery)
    ).slice(0, 5);
    
    return {
      posts: matchingPosts,
      users: matchingUsers,
      chats: matchingChats,
      total: matchingPosts.length + matchingUsers.length + matchingChats.length
    };
  }
);

export default {
  selectEnhancedPosts,
  selectPostsByUser,
  selectUserStats,
  selectEnhancedChats,
  selectEnhancedCurrentChat,
  selectEnhancedMessages,
  selectGlobalLoading,
  selectGlobalError,
  selectNotificationData,
  selectSearchResults
};