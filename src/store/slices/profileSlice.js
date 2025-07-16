// src/store/slices/profileSlice.js - Profile Redux Slice with Social Features
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profilesAPI } from '../../utils/api/profiles';

// Async Thunks for API calls
export const loadProfileByUsername = createAsyncThunk(
  'profile/loadProfileByUsername',
  async ({ username }, { rejectWithValue }) => {
    try {
      const response = await profilesAPI.getUserProfile(username);
      if (response.success) {
        return {
          profile: response.user,
          username
        };
      } else {
        return rejectWithValue(response.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

export const loadCurrentUserProfile = createAsyncThunk(
  'profile/loadCurrentUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profilesAPI.getCurrentUserProfile();
      if (response.success) {
        return {
          profile: response.user,
          username: response.user.username
        };
      } else {
        return rejectWithValue(response.message || 'Failed to fetch current user profile');
      }
    } catch (error) {
      console.error('Error loading current user profile:', error);
      return rejectWithValue(error.message || 'Failed to fetch current user profile');
    }
  }
);

export const updateProfileData = createAsyncThunk(
  'profile/updateProfileData',
  async ({ profileData }, { rejectWithValue }) => {
    try {
      const response = await profilesAPI.updateUserProfile(profileData);
      if (response.success) {
        return {
          profile: response.user,
          message: response.message
        };
      } else {
        return rejectWithValue(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const uploadProfileAvatar = createAsyncThunk(
  'profile/uploadProfileAvatar',
  async ({ avatarFile }, { getState, rejectWithValue }) => {
    try {
      const response = await profilesAPI.uploadAvatar(avatarFile);
      if (response.success) {
        return {
          avatar_url: response.avatar_url,
          message: response.message
        };
      } else {
        return rejectWithValue(response.message || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return rejectWithValue(error.message || 'Failed to upload avatar');
    }
  }
);

export const followUser = createAsyncThunk(
  'profile/followUser',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await profilesAPI.followUser(userId);
      if (response.success) {
        return {
          userId,
          isFollowing: true,
          followerCount: response.follower_count || 0
        };
      } else {
        return rejectWithValue(response.message || 'Failed to follow user');
      }
    } catch (error) {
      console.error('Error following user:', error);
      return rejectWithValue(error.message || 'Failed to follow user');
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'profile/unfollowUser',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await profilesAPI.unfollowUser(userId);
      if (response.success) {
        return {
          userId,
          isFollowing: false,
          followerCount: response.follower_count || 0
        };
      } else {
        return rejectWithValue(response.message || 'Failed to unfollow user');
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return rejectWithValue(error.message || 'Failed to unfollow user');
    }
  }
);

// Initial state
const initialState = {
  profiles: {}, // Object with username as key, profile data as value
  currentProfile: null, // Currently viewed profile
  currentUsername: null, // Currently viewed username
  loading: false,
  error: null,
  
  // Cache management
  profileCache: {}, // For caching profile data
  lastFetchTime: {}, // For cache invalidation
  
  // Social features
  followLoading: {}, // Track follow/unfollow loading states by userId
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set current profile (for manual updates)
    setCurrentProfile: (state, action) => {
      const { profile, username } = action.payload;
      state.currentProfile = profile;
      state.currentUsername = username;
      if (username) {
        state.profiles[username] = profile;
      }
    },
    
    // Update profile in cache
    updateProfileInCache: (state, action) => {
      const { username, updates } = action.payload;
      
      if (state.profiles[username]) {
        state.profiles[username] = { ...state.profiles[username], ...updates };
      }
      
      if (state.currentUsername === username) {
        state.currentProfile = { ...state.currentProfile, ...updates };
      }
    },
    
    // Update follower count for a user
    updateFollowerCount: (state, action) => {
      const { userId, isFollowing, followerCount } = action.payload;
      
      // Update in all cached profiles
      Object.keys(state.profiles).forEach(username => {
        const profile = state.profiles[username];
        if (profile.id === userId) {
          state.profiles[username] = {
            ...profile,
            is_following: isFollowing,
            profile: {
              ...profile.profile,
              followers_count: followerCount
            }
          };
        }
      });
      
      // Update current profile if it matches
      if (state.currentProfile?.id === userId) {
        state.currentProfile = {
          ...state.currentProfile,
          is_following: isFollowing,
          profile: {
            ...state.currentProfile.profile,
            followers_count: followerCount
          }
        };
      }
    },
    
    // Clear profile cache
    clearProfileCache: (state) => {
      state.profiles = {};
      state.profileCache = {};
      state.lastFetchTime = {};
    },
    
    // Reset profile state
    resetProfileState: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Load Profile by Username
      .addCase(loadProfileByUsername.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadProfileByUsername.fulfilled, (state, action) => {
        const { profile, username } = action.payload;
        
        state.loading = false;
        state.currentProfile = profile;
        state.currentUsername = username;
        state.profiles[username] = profile;
        
        // Update cache
        state.profileCache[username] = profile;
        state.lastFetchTime[username] = Date.now();
      })
      .addCase(loadProfileByUsername.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentProfile = null;
      })
      
      // Load Current User Profile
      .addCase(loadCurrentUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCurrentUserProfile.fulfilled, (state, action) => {
        const { profile, username } = action.payload;
        
        state.loading = false;
        state.currentProfile = profile;
        state.currentUsername = username;
        state.profiles[username] = profile;
        
        // Update cache
        state.profileCache[username] = profile;
        state.lastFetchTime[username] = Date.now();
      })
      .addCase(loadCurrentUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentProfile = null;
      })
      
      // Update Profile Data
      .addCase(updateProfileData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileData.fulfilled, (state, action) => {
        const { profile } = action.payload;
        
        state.loading = false;
        
        // Update current profile
        if (state.currentProfile) {
          state.currentProfile = profile;
        }
        
        // Update in profiles cache
        if (state.currentUsername) {
          state.profiles[state.currentUsername] = profile;
          state.profileCache[state.currentUsername] = profile;
          state.lastFetchTime[state.currentUsername] = Date.now();
        }
      })
      .addCase(updateProfileData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload Avatar
      .addCase(uploadProfileAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfileAvatar.fulfilled, (state, action) => {
        const { avatar_url } = action.payload;
        
        state.loading = false;
        
        // Update current profile avatar
        if (state.currentProfile) {
          state.currentProfile = {
            ...state.currentProfile,
            profile: {
              ...state.currentProfile.profile,
              avatar: avatar_url
            }
          };
        }
        
        // Update in profiles cache
        if (state.currentUsername) {
          const profile = state.profiles[state.currentUsername];
          if (profile) {
            state.profiles[state.currentUsername] = {
              ...profile,
              profile: {
                ...profile.profile,
                avatar: avatar_url
              }
            };
            state.profileCache[state.currentUsername] = state.profiles[state.currentUsername];
          }
        }
      })
      .addCase(uploadProfileAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Follow User
      .addCase(followUser.pending, (state, action) => {
        const { userId } = action.meta.arg;
        state.followLoading[userId] = true;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const { userId, isFollowing, followerCount } = action.payload;
        
        state.followLoading[userId] = false;
        
        // Update follower count and follow status
        profileSlice.caseReducers.updateFollowerCount(state, {
          payload: { userId, isFollowing, followerCount }
        });
      })
      .addCase(followUser.rejected, (state, action) => {
        const { userId } = action.meta.arg;
        state.followLoading[userId] = false;
        state.error = action.payload;
      })
      
      // Unfollow User
      .addCase(unfollowUser.pending, (state, action) => {
        const { userId } = action.meta.arg;
        state.followLoading[userId] = true;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const { userId, isFollowing, followerCount } = action.payload;
        
        state.followLoading[userId] = false;
        
        // Update follower count and follow status
        profileSlice.caseReducers.updateFollowerCount(state, {
          payload: { userId, isFollowing, followerCount }
        });
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        const { userId } = action.meta.arg;
        state.followLoading[userId] = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  clearError,
  setCurrentProfile,
  updateProfileInCache,
  updateFollowerCount,
  clearProfileCache,
  resetProfileState
} = profileSlice.actions;

// Selectors
export const selectProfiles = (state) => state.profile.profiles;
export const selectCurrentProfile = (state) => state.profile.currentProfile;
export const selectCurrentUsername = (state) => state.profile.currentUsername;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileError = (state) => state.profile.error;
export const selectProfileCache = (state) => state.profile.profileCache;
export const selectLastFetchTime = (state) => state.profile.lastFetchTime;
export const selectFollowLoading = (state) => state.profile.followLoading;

// Computed selectors
export const selectProfileByUsername = (username) => (state) => {
  return state.profile.profiles[username] || null;
};

export const selectIsFollowLoading = (userId) => (state) => {
  return state.profile.followLoading[userId] || false;
};

export default profileSlice.reducer;