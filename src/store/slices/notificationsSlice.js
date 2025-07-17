// src/store/slices/notificationsSlice.js - Notifications Redux Slice with WebSocket Integration
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsAPI } from '../../utils/api/notifications';

/**
 * Data transformation function - preserved from useNotifications hook
 */
const transformApiNotification = (apiNotification) => {
  return {
    id: apiNotification.id,
    type: apiNotification.notification_type,
    title: apiNotification.title,
    message: apiNotification.message,
    sender: apiNotification.sender ? {
      id: apiNotification.sender.id,
      username: apiNotification.sender.username,
      name: apiNotification.sender.full_name || apiNotification.sender.username,
      avatar: apiNotification.sender.avatar
    } : null,
    content_object_data: apiNotification.content_object_data,
    is_read: apiNotification.is_read,
    read_at: apiNotification.read_at,
    created_at: apiNotification.created_at,
    time_since_created: apiNotification.time_since_created || 'Unknown time'
  };
};

// Async Thunks for API calls - following postsSlice patterns
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, append = false, filter = 'all' }, { rejectWithValue }) => {
    try {
      const options = { page };
      if (filter === 'unread') {
        options.is_read = false;
      }

      const response = await notificationsAPI.getNotifications(options);
      
      // Handle both paginated and non-paginated responses
      let notificationsData, hasNext;
      
      if (Array.isArray(response)) {
        // Non-paginated response
        notificationsData = response;
        hasNext = false;
      } else {
        // Paginated response
        notificationsData = response.results || [];
        hasNext = !!response.next;
      }

      const transformedNotifications = notificationsData.map(transformApiNotification);

      return {
        notifications: transformedNotifications,
        hasMore: hasNext,
        page,
        append,
        filter
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return rejectWithValue('Failed to load notifications. Please try again.');
    }
  }
);

export const refreshNotifications = createAsyncThunk(
  'notifications/refreshNotifications',
  async (filter = 'all', { dispatch }) => {
    return dispatch(fetchNotifications({ page: 1, append: false, filter }));
  }
);

export const loadMoreNotifications = createAsyncThunk(
  'notifications/loadMoreNotifications',
  async (_, { getState, dispatch }) => {
    const { notifications } = getState();
    if (notifications.hasMore && !notifications.loading) {
      return dispatch(fetchNotifications({ 
        page: notifications.page + 1, 
        append: true, 
        filter: notifications.filter 
      }));
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      return response.unread_count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return rejectWithValue('Failed to fetch unread count');
    }
  }
);

export const fetchNotificationStats = createAsyncThunk(
  'notifications/fetchNotificationStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getNotificationStats();
      return response.stats;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return rejectWithValue('Failed to fetch notification stats');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return rejectWithValue('Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.markAllAsRead();
      return response.updated_count || 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return rejectWithValue('Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return rejectWithValue('Failed to delete notification');
    }
  }
);

// Initial state matching useNotifications hook structure
const initialState = {
  notifications: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: false,
  refreshing: false,
  unreadCount: 0,
  filter: 'all', // 'all', 'unread'
  stats: null,
  isConnected: false,
  lastFetch: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Synchronous actions for real-time WebSocket updates
    addNotification: (state, action) => {
      const newNotification = transformApiNotification(action.payload);
      state.notifications.unshift(newNotification);
      
      // Update unread count if notification is unread
      if (!newNotification.is_read) {
        state.unreadCount += 1;
      }
    },
    
    updateNotification: (state, action) => {
      const { notificationId, updates } = action.payload;
      const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
      if (notificationIndex !== -1) {
        state.notifications[notificationIndex] = { 
          ...state.notifications[notificationIndex], 
          ...updates 
        };
      }
    },
    
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const notificationToRemove = state.notifications.find(n => n.id === notificationId);
      
      state.notifications = state.notifications.filter(n => n.id !== notificationId);
      
      // Update unread count if removed notification was unread
      if (notificationToRemove && !notificationToRemove.is_read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    
    setWebSocketConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset state action
    resetNotifications: (state) => {
      return initialState;
    },
    
    // Set refreshing state
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state, action) => {
        const { page, append } = action.meta.arg || {};
        if (page === 1 && !append) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const { notifications, hasMore, page, append, filter } = action.payload;
        
        if (page === 1 || !append) {
          state.notifications = notifications;
        } else {
          state.notifications.push(...notifications);
        }
        
        state.hasMore = hasMore;
        state.page = page;
        state.filter = filter;
        state.loading = false;
        state.refreshing = false;
        state.lastFetch = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload;
        
        // If first page failed, clear notifications
        if (action.meta.arg?.page === 1) {
          state.notifications = [];
        }
      })
      
      // Refresh Notifications
      .addCase(refreshNotifications.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      
      // Fetch Stats
      .addCase(fetchNotificationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Mark as Read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
        
        if (notificationIndex !== -1 && !state.notifications[notificationIndex].is_read) {
          state.notifications[notificationIndex].is_read = true;
          state.notifications[notificationIndex].read_at = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Mark All as Read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString()
        }));
        state.unreadCount = 0;
      })
      
      // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notificationToRemove = state.notifications.find(n => n.id === notificationId);
        
        state.notifications = state.notifications.filter(n => n.id !== notificationId);
        
        // Update unread count if deleted notification was unread
        if (notificationToRemove && !notificationToRemove.is_read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

// Export actions
export const {
  addNotification,
  updateNotification,
  removeNotification,
  updateUnreadCount,
  setFilter,
  setWebSocketConnected,
  clearError,
  resetNotifications,
  setRefreshing
} = notificationsSlice.actions;

// Selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectNotificationsLoading = (state) => state.notifications.loading;
export const selectNotificationsError = (state) => state.notifications.error;
export const selectNotificationsHasMore = (state) => state.notifications.hasMore;
export const selectNotificationsRefreshing = (state) => state.notifications.refreshing;
export const selectNotificationsPage = (state) => state.notifications.page;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsFilter = (state) => state.notifications.filter;
export const selectNotificationStats = (state) => state.notifications.stats;
export const selectNotificationsConnected = (state) => state.notifications.isConnected;

// Computed selectors
export const selectNotificationsIsEmpty = (state) => 
  state.notifications.notifications.length === 0 && !state.notifications.loading;

export const selectNotificationsHasError = (state) => !!state.notifications.error;

export const selectNotificationsIsInitialLoading = (state) => 
  state.notifications.loading && state.notifications.notifications.length === 0;

// Filtered notifications selector
export const selectFilteredNotifications = (state) => {
  const notifications = selectNotifications(state);
  const filter = selectNotificationsFilter(state);
  
  return notifications.filter(notification => 
    filter === 'all' || (filter === 'unread' && !notification.is_read)
  );
};

// Get notification by ID selector
export const selectNotificationById = (notificationId) => (state) => {
  return state.notifications.notifications.find(notification => notification.id === notificationId);
};

export default notificationsSlice.reducer;