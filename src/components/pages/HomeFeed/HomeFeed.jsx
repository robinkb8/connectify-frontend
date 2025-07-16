// src/components/pages/HomeFeed/HomeFeed.jsx - With Redux State Management
import React, { useState, useCallback } from 'react';
import { Search, Bell } from "lucide-react";
import { Input } from '../../ui/Input/Input';

// PRESERVED: Import existing components
import PostCard from './components/PostCard';
import SimpleCreatePost from './components/SimpleCreatePost';
import { NoPostsEmpty, LoadingState, LoadingErrorEmpty } from '../../ui/EmptyState/EmptyState';
import EnhancedCommentsModal from '../../modals/EnhancedCommentsModal';
import NotificationPanel from '../../ui/NotificationPanel/NotificationPanel';

// ENHANCED: Import Redux hooks instead of usePosts
import usePostsRedux from '../../../hooks/usePostsRedux';
import useRealTime from '../../../hooks/useRealTime';
import useNotifications from '../../../hooks/useNotifications';

// ENHANCED: Main HomeFeed Component with Redux state management
function HomeFeed() {
  // ENHANCED: Use Redux posts hook instead of local hook
  const {
    posts,
    loading,
    error,
    hasMore,
    refreshing,
    loadMorePosts,
    refreshPosts,
    updatePostStats,
    updatePost,
    addPost,
    filterPosts,
    retryFetch,
    isEmpty,
    isInitialLoading
  } = usePostsRedux({ autoLoad: true });

  // NEW: Notifications hook
  const { unreadCount } = useNotifications({
    autoLoad: true,
    autoConnect: true
  });

  // PRESERVED: Local state for UI interactions
  const [searchQuery, setSearchQuery] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // NEW: Notification panel state
  const [showNotifications, setShowNotifications] = useState(false);

  // ENHANCED: Real-time updates integration
  const realTime = useRealTime({
    enabled: true,
    pollingInterval: 30000,
    onPostUpdate: updatePost,
    onNewPost: addPost,
    onPostDelete: (postId) => {
      // Handle post deletion
      console.log('Post deleted:', postId);
    }
  });

  // ENHANCED: Search functionality with hook integration
  const filteredPosts = filterPosts(searchQuery);

  // PRESERVED: Post interaction handlers
  const handleCommentClick = useCallback((post) => {
    console.log('💬 Opening comments for post:', post.id);
    setSelectedPost(post);
    setShowComments(true);
  }, []);

  const handlePostClick = useCallback((post) => {
    console.log('📱 Post clicked:', post.id);
    // Could navigate to detailed post view or expand inline
  }, []);

  // NEW: Notification handlers
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClose = () => {
    setShowNotifications(false);
  };

  const handleNotificationNavigate = (url) => {
    console.log('Navigate to:', url);
    setShowNotifications(false);
  };

  // ENHANCED: Stats update handler with real-time sync
  const handleStatsUpdate = useCallback((postId, updates) => {
    updatePostStats(postId, updates);
    
    // Trigger real-time update check to sync with other clients
    realTime.forceUpdate();
  }, [updatePostStats, realTime]);

  // ENHANCED: Comment added handler
  const handleCommentAdded = useCallback((newComment) => {
    if (selectedPost) {
      updatePostStats(selectedPost.id, {
        total_comments: selectedPost.total_comments + 1
      });
    }
  }, [selectedPost, updatePostStats]);

  // ENHANCED: Pull to refresh functionality
  const handleRefresh = useCallback(async () => {
    await refreshPosts();
  }, [refreshPosts]);

  // PRESERVED: Main render with enhanced loading states
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* ENHANCED: Search Input with Notification Button */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
        
        {/* NEW: Notification Button */}
        <button
          onClick={handleNotificationClick}
          className="relative p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </button>
      </div>

      {/* PRESERVED: Create Post Component (commented out as before) */}
      {/* <SimpleCreatePost onPostCreated={addPost} /> */}

      {/* ENHANCED: Posts Feed with improved loading states */}
      <div className="space-y-6">
        {isInitialLoading ? (
          // PRESERVED: Loading skeleton
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          // ENHANCED: Error state with retry
          <div className="text-center py-8">
            <LoadingErrorEmpty onRetry={retryFetch} />
          </div>
        ) : isEmpty ? (
          // PRESERVED: Empty state
          <NoPostsEmpty onCreatePost={() => console.log('Create post')} />
        ) : (
          // ENHANCED: Posts list with real-time updates
          <>
            {/* Pull to refresh indicator */}
            {refreshing && (
              <div className="text-center py-2">
                <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>Refreshing...</span>
                </div>
              </div>
            )}

            {filteredPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                onCommentClick={() => handleCommentClick(post)}
                onPostClick={() => handlePostClick(post)}
                onStatsUpdate={(updates) => handleStatsUpdate(post.id, updates)}
              />
            ))}
            
            {/* ENHANCED: Load More with improved UX */}
            {hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={loadMorePosts}
                  disabled={loading}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-all duration-200
                    ${loading 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 active:scale-95'
                    }
                  `}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}

            {/* ENHANCED: Real-time status indicator (for development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="fixed bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs">
                Real-time: {realTime.isActive ? '🟢 Active' : '🔴 Inactive'}
              </div>
            )}
          </>
        )}
      </div>

      {/* ENHANCED: Pull to refresh hint */}
      {!isInitialLoading && !isEmpty && (
        <div className="text-center py-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-sm text-gray-500 hover:text-blue-500 transition-colors"
          >
            {refreshing ? 'Refreshing...' : 'Pull to refresh or click here'}
          </button>
        </div>
      )}

      {/* NEW: Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={handleNotificationClose}
        onNavigate={handleNotificationNavigate}
      />

      {/* PRESERVED: Enhanced Comments Modal */}
      <EnhancedCommentsModal
        isOpen={showComments}
        onClose={() => {
          setShowComments(false);
          setSelectedPost(null);
        }}
        postId={selectedPost?.id}
        postAuthor={selectedPost?.author}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
}

export default HomeFeed;