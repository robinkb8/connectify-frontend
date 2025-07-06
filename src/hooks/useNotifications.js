// src/hooks/useNotifications.js - Following usePosts.js patterns
import { useState, useCallback, useEffect, useRef } from 'react';
import { notificationsAPI } from '../utils/api/notifications';

/**
 * Data transformation function - following existing patterns
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

/**
 * Custom hook for managing notifications with real-time updates
 * Handles fetching, WebSocket integration, and state management
 */
const useNotifications = (options = {}) => {
  const {
    autoLoad = true,
    autoConnect = true,
    pageSize = 20
  } = options;

  // State management
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const [stats, setStats] = useState(null);

  // WebSocket connection
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  /**
   * Fetch notifications from API with pagination support
   */
  const fetchNotifications = useCallback(async (pageNum = 1, append = false, filterType = filter) => {
    try {
      if (pageNum === 1 && !append) {
        setLoading(true);
      }
      setError(null);

      const options = { page: pageNum };
      if (filterType === 'unread') {
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

      if (pageNum === 1 || !append) {
        setNotifications(transformedNotifications);
      } else {
        setNotifications(prev => [...prev, ...transformedNotifications]);
      }

      setHasMore(hasNext);
      setPage(pageNum);

      return {
        notifications: transformedNotifications,
        hasMore: hasNext
      };

    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
      
      if (pageNum === 1) {
        setNotifications([]);
      }
      
      throw err;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  /**
   * Load more notifications (pagination)
   */
  const loadMoreNotifications = useCallback(async () => {
    if (hasMore && !loading) {
      try {
        await fetchNotifications(page + 1, true);
      } catch (err) {
        console.error('Error loading more notifications:', err);
      }
    }
  }, [hasMore, loading, page, fetchNotifications]);

  /**
   * Refresh notifications (pull to refresh)
   */
  const refreshNotifications = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchNotifications(1, false);
    } catch (err) {
      console.error('Error refreshing notifications:', err);
    }
  }, [fetchNotifications]);

  /**
   * Get unread count
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.unread_count || 0);
      return response.unread_count || 0;
    } catch (err) {
      console.error('Error fetching unread count:', err);
      return 0;
    }
  }, []);

  /**
   * Get notification statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await notificationsAPI.getNotificationStats();
      setStats(response.stats);
      return response.stats;
    } catch (err) {
      console.error('Error fetching notification stats:', err);
      return null;
    }
  }, []);

  /**
   * Mark single notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationsAPI.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      return response.updated_count || 0;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return 0;
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      
      // Remove from local state
      const notificationToRemove = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if it was unread
      if (notificationToRemove && !notificationToRemove.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [notifications]);

  /**
   * Change filter and refetch
   */
  const changeFilter = useCallback(async (newFilter) => {
    setFilter(newFilter);
    await fetchNotifications(1, false, newFilter);
  }, [fetchNotifications]);

  /**
   * WebSocket connection management
   */
  const connectWebSocket = useCallback(() => {
    try {
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = notificationsAPI.createWebSocketConnection();
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Notification WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'new_notification':
              // Add new notification to the list
              const newNotification = transformApiNotification(data.notification);
              setNotifications(prev => [newNotification, ...prev]);
              
              // Update unread count
              if (!newNotification.is_read) {
                setUnreadCount(prev => prev + 1);
              }
              break;
              
            case 'notification_updated':
              // Update existing notification
              setNotifications(prev =>
                prev.map(notification =>
                  notification.id === data.notification_id
                    ? { ...notification, is_read: data.is_read }
                    : notification
                )
              );
              break;
              
            case 'unread_count_updated':
              setUnreadCount(data.count);
              break;
              
            case 'connection_established':
              console.log('✅ Notification WebSocket connection established');
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
        setIsConnected(false);
        
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
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
      setIsConnected(false);
    }
  }, [autoConnect]);

  /**
   * Disconnect WebSocket
   */
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Intentional disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get notification by ID
   */
  const getNotificationById = useCallback((notificationId) => {
    return notifications.find(notification => notification.id === notificationId);
  }, [notifications]);

  /**
   * Auto-load notifications and connect WebSocket on mount
   */
  useEffect(() => {
    if (autoLoad && notifications.length === 0) {
      fetchNotifications(1);
      fetchUnreadCount();
    }
  }, [autoLoad, fetchNotifications, fetchUnreadCount, notifications.length]);

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
    fetchNotifications(1);
  }, [fetchNotifications]);

  return {
    // State
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
    
    // Actions
    fetchNotifications,
    loadMoreNotifications,
    refreshNotifications,
    fetchUnreadCount,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    changeFilter,
    connectWebSocket,
    disconnectWebSocket,
    clearError,
    getNotificationById,
    retryFetch,
    
    // Computed
    isEmpty: notifications.length === 0 && !loading,
    hasError: !!error,
    isInitialLoading: loading && notifications.length === 0,
    filteredNotifications: notifications.filter(notification => 
      filter === 'all' || (filter === 'unread' && !notification.is_read)
    )
  };
};

export default useNotifications;