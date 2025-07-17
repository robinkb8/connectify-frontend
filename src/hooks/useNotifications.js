// src/hooks/useNotificationsRedux.js - Redux-based notifications hook with identical API
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationsAPI } from '../utils/api/notifications';
import {
  // Async actions
  fetchNotifications,
  refreshNotifications,
  loadMoreNotifications,
  fetchUnreadCount,
  fetchNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  
  // Sync actions
  addNotification,
  updateNotification,
  setFilter,
  setWebSocketConnected,
  clearError,
  updateUnreadCount,
  
  // Selectors
  selectNotifications,
  selectNotificationsLoading,
  selectNotificationsError,
  selectNotificationsHasMore,
  selectNotificationsRefreshing,
  selectNotificationsPage,
  selectUnreadCount,
  selectNotificationsFilter,
  selectNotificationStats,
  selectNotificationsConnected,
  selectNotificationsIsEmpty,
  selectNotificationsHasError,
  selectNotificationsIsInitialLoading,
  selectFilteredNotifications,
  selectNotificationById
} from '../store/slices/notificationsSlice';

/**
 * Redux-based notifications hook with IDENTICAL API
 * Drop-in replacement for surgical migration
 */
const useNotifications = (options = {}) => {
  const {
    autoLoad = true,
    autoConnect = true,
    pageSize = 20
  } = options;

  const dispatch = useDispatch();
  
  // Redux state selectors
  const notifications = useSelector(selectNotifications);
  const loading = useSelector(selectNotificationsLoading);
  const error = useSelector(selectNotificationsError);
  const hasMore = useSelector(selectNotificationsHasMore);
  const refreshing = useSelector(selectNotificationsRefreshing);
  const page = useSelector(selectNotificationsPage);
  const unreadCount = useSelector(selectUnreadCount);
  const filter = useSelector(selectNotificationsFilter);
  const stats = useSelector(selectNotificationStats);
  const isConnected = useSelector(selectNotificationsConnected);
  const isEmpty = useSelector(selectNotificationsIsEmpty);
  const hasError = useSelector(selectNotificationsHasError);
  const isInitialLoading = useSelector(selectNotificationsIsInitialLoading);
  const filteredNotifications = useSelector(selectFilteredNotifications);

  // WebSocket connection reference
  const wsRef = useRef(null);

  /**
   * Fetch notifications - wraps Redux action
   */
  const fetchNotificationsWrapper = useCallback(async (pageNum = 1, append = false, filterType = filter) => {
    try {
      const result = await dispatch(fetchNotifications({ 
        page: pageNum, 
        append, 
        filter: filterType 
      })).unwrap();
      
      return {
        notifications: result.notifications,
        hasMore: result.hasMore
      };
    } catch (err) {
      throw err;
    }
  }, [dispatch, filter]);

  /**
   * Load more notifications - wraps Redux action
   */
  const loadMoreNotificationsWrapper = useCallback(async () => {
    if (hasMore && !loading) {
      try {
        await dispatch(loadMoreNotifications()).unwrap();
      } catch (err) {
        console.error('Error loading more notifications:', err);
      }
    }
  }, [dispatch, hasMore, loading]);

  /**
   * Refresh notifications - wraps Redux action
   */
  const refreshNotificationsWrapper = useCallback(async () => {
    try {
      await dispatch(refreshNotifications(filter)).unwrap();
    } catch (err) {
      console.error('Error refreshing notifications:', err);
    }
  }, [dispatch, filter]);

  /**
   * Fetch unread count - wraps Redux action
   */
  const fetchUnreadCountWrapper = useCallback(async () => {
    try {
      const count = await dispatch(fetchUnreadCount()).unwrap();
      return count;
    } catch (err) {
      console.error('Error fetching unread count:', err);
      return 0;
    }
  }, [dispatch]);

  /**
   * Fetch stats - wraps Redux action
   */
  const fetchStatsWrapper = useCallback(async () => {
    try {
      const statsData = await dispatch(fetchNotificationStats()).unwrap();
      return statsData;
    } catch (err) {
      console.error('Error fetching notification stats:', err);
      return null;
    }
  }, [dispatch]);

  /**
   * Mark as read - wraps Redux action
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, [dispatch]);

  /**
   * Mark all as read - wraps Redux action
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const count = await dispatch(markAllNotificationsAsRead()).unwrap();
      return count;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return 0;
    }
  }, [dispatch]);

  /**
   * Delete notification - wraps Redux action
   */
  const deleteNotificationWrapper = useCallback(async (notificationId) => {
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [dispatch]);

  /**
   * Change filter - wraps Redux action
   */
  const changeFilter = useCallback(async (newFilter) => {
    dispatch(setFilter(newFilter));
    await dispatch(fetchNotifications({ page: 1, append: false, filter: newFilter }));
  }, [dispatch]);

  /**
   * WebSocket connection management - enhanced with Redux integration
   */
  const connectWebSocket = useCallback(() => {
    try {
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = notificationsAPI.createWebSocketConnection();
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔥 REDUX Notification WebSocket connected');
        dispatch(setWebSocketConnected(true));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'new_notification':
              // Add new notification via Redux
              dispatch(addNotification(data.notification));
              break;
              
            case 'notification_updated':
              // Update existing notification via Redux
              dispatch(updateNotification({
                notificationId: data.notification_id,
                updates: { is_read: data.is_read }
              }));
              break;
              
            case 'unread_count_updated':
              dispatch(updateUnreadCount(data.count));
              break;
              
            case 'connection_established':
              console.log('🔥 REDUX Notification WebSocket connection established');
              break;
              
            case 'error':
              console.error('WebSocket error:', data.message);
              break;
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        dispatch(setWebSocketConnected(false));
        
        // Reconnect after 3 seconds if not intentional close
        if (event.code !== 1000) {
          setTimeout(() => {
            if (autoConnect) {
              connectWebSocket();
            }
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.warn('⚠️ WebSocket connection failed - continuing without real-time updates');
        console.warn('Check: 1) Django server running 2) Channels configured 3) Token valid');
        dispatch(setWebSocketConnected(false));
        // Don't spam reconnection attempts on persistent failures
      };

    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
      dispatch(setWebSocketConnected(false));
    }
  }, [dispatch, autoConnect]);

  /**
   * Disconnect WebSocket
   */
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Intentional disconnect');
      wsRef.current = null;
    }
    dispatch(setWebSocketConnected(false));
  }, [dispatch]);

  /**
   * Clear error state
   */
  const clearErrorWrapper = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Get notification by ID - returns a function that finds from current notifications
   */
  const getNotificationById = useCallback((notificationId) => {
    return notifications.find(notification => notification.id === notificationId);
  }, [notifications]);

  /**
   * Auto-load notifications and connect WebSocket on mount
   */
  useEffect(() => {
    if (autoLoad && notifications.length === 0) {
      dispatch(fetchNotifications({ page: 1, append: false, filter }));
      dispatch(fetchUnreadCount());
    }
  }, [autoLoad, dispatch, notifications.length, filter]);

  useEffect(() => {
    if (autoConnect) {
      connectWebSocket();
    }

    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, [autoConnect, connectWebSocket, disconnectWebSocket]);

  /**
   * Retry mechanism for failed requests
   */
  const retryFetch = useCallback(() => {
    dispatch(fetchNotifications({ page: 1, append: false, filter }));
  }, [dispatch, filter]);

  // IDENTICAL API RETURN - Drop-in replacement for useNotifications
  return {
    // State (identical to original hook)
    notifications,
    loading,
    error,
    hasMore,
    refreshing,
    page,
    unreadCount,
    filter,
    stats,
    isConnected,
    
    // Actions (identical APIs)
    fetchNotifications: fetchNotificationsWrapper,
    loadMoreNotifications: loadMoreNotificationsWrapper,
    refreshNotifications: refreshNotificationsWrapper,
    fetchUnreadCount: fetchUnreadCountWrapper,
    fetchStats: fetchStatsWrapper,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotificationWrapper,
    changeFilter,
    connectWebSocket,
    disconnectWebSocket,
    clearError: clearErrorWrapper,
    getNotificationById,
    retryFetch,
    
    // Computed (identical to original hook)
    isEmpty,
    hasError,
    isInitialLoading,
    filteredNotifications
  };
};

export default useNotifications;