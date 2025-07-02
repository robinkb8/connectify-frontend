// src/hooks/useRealTime.js
import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for real-time updates and synchronization
 * Currently uses polling, can be extended with WebSocket support
 */
const useRealTime = (options = {}) => {
  const {
    enabled = true,
    pollingInterval = 30000, // 30 seconds
    onPostUpdate = null,
    onNewPost = null,
    onPostDelete = null
  } = options;

  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  /**
   * Simulate real-time updates with polling
   * In a real app, this would be replaced with WebSocket events
   */
  const checkForUpdates = useCallback(async () => {
    try {
      // This is where we would check for updates
      // For now, we'll simulate real-time events
      
      // In a real implementation, this would:
      // 1. Call an API endpoint to get updates since lastUpdateRef.current
      // 2. Process the updates and call the appropriate callbacks
      // 3. Update lastUpdateRef.current

      console.log('🔄 Checking for real-time updates...');
      
      // Example of how real-time updates would work:
      // const updates = await postsAPI.getUpdates(lastUpdateRef.current);
      // 
      // updates.forEach(update => {
      //   switch (update.type) {
      //     case 'post_liked':
      //       onPostUpdate?.(update.postId, { 
      //         total_likes: update.newLikesCount,
      //         is_liked: update.isLikedByCurrentUser 
      //       });
      //       break;
      //     case 'post_commented':
      //       onPostUpdate?.(update.postId, { 
      //         total_comments: update.newCommentsCount 
      //       });
      //       break;
      //     case 'new_post':
      //       onNewPost?.(update.post);
      //       break;
      //     case 'post_deleted':
      //       onPostDelete?.(update.postId);
      //       break;
      //   }
      // });

      lastUpdateRef.current = Date.now();
      
    } catch (error) {
      console.error('Error checking for real-time updates:', error);
    }
  }, [onPostUpdate, onNewPost, onPostDelete]);

  /**
   * Start real-time updates
   */
  const startRealTime = useCallback(() => {
    if (!enabled) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start polling for updates
    intervalRef.current = setInterval(checkForUpdates, pollingInterval);
    
    console.log('🚀 Real-time updates started');
  }, [enabled, pollingInterval, checkForUpdates]);

  /**
   * Stop real-time updates
   */
  const stopRealTime = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    console.log('⏹️ Real-time updates stopped');
  }, []);

  /**
   * Manually trigger update check
   */
  const forceUpdate = useCallback(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  /**
   * Simulate receiving a real-time update
   * This is for testing purposes and would be removed in production
   */
  const simulateUpdate = useCallback((type, data) => {
    switch (type) {
      case 'like':
        onPostUpdate?.(data.postId, {
          total_likes: data.newLikesCount,
          is_liked: data.isLikedByCurrentUser
        });
        break;
      case 'comment':
        onPostUpdate?.(data.postId, {
          total_comments: data.newCommentsCount
        });
        break;
      case 'new_post':
        onNewPost?.(data.post);
        break;
      case 'delete_post':
        onPostDelete?.(data.postId);
        break;
      default:
        console.warn('Unknown update type:', type);
    }
  }, [onPostUpdate, onNewPost, onPostDelete]);

  /**
   * WebSocket connection (future enhancement)
   */
  const connectWebSocket = useCallback(() => {
    // Future implementation for WebSocket real-time updates
    // const ws = new WebSocket('ws://localhost:8000/ws/posts/');
    // 
    // ws.onopen = () => {
    //   console.log('WebSocket connected');
    // };
    // 
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   simulateUpdate(data.type, data);
    // };
    // 
    // ws.onclose = () => {
    //   console.log('WebSocket disconnected');
    //   // Implement reconnection logic
    // };
    // 
    // return ws;
  }, [simulateUpdate]);

  /**
   * Start/stop real-time updates based on enabled state
   */
  useEffect(() => {
    if (enabled) {
      startRealTime();
    } else {
      stopRealTime();
    }

    // Cleanup on unmount
    return () => {
      stopRealTime();
    };
  }, [enabled, startRealTime, stopRealTime]);

  /**
   * Handle visibility change (pause updates when tab is not visible)
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRealTime();
      } else if (enabled) {
        startRealTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, startRealTime, stopRealTime]);

  return {
    // State
    isActive: !!intervalRef.current,
    
    // Actions
    start: startRealTime,
    stop: stopRealTime,
    forceUpdate,
    simulateUpdate, // For testing - remove in production
    
    // Future enhancements
    connectWebSocket // For future WebSocket implementation
  };
};

export default useRealTime;