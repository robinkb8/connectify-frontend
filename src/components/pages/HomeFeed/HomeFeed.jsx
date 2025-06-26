// src/components/pages/HomeFeed/HomeFeed.jsx - UPDATED WITH REAL STORIES
import React, { useState, useEffect, useCallback } from 'react';
import TopNavbar from './components/TopNavbar';
import PostCard from './components/PostCard';
import BottomNavbar from './components/BottomNavbar';
import CreatePostModal from '../../forms/CreatePostModal';

// ✅ API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ✅ DATA TRANSFORMATION FUNCTION - Enhanced for better handling
const transformApiPost = (apiPost) => {
  console.log('🔄 Transforming API post:', apiPost);
  
  const transformed = {
    id: apiPost.id,
    user: {
      username: apiPost.author?.username || 'Unknown User',
      avatar: apiPost.author?.avatar || '/api/placeholder/32/32',
      verified: false
    },
    content: apiPost.content || '',
    image: apiPost.image_url || null,
    timestamp: apiPost.time_since_posted || 'Unknown time',
    likes: {
      count: apiPost.total_likes || 0,
      isLiked: apiPost.is_liked || false
    },
    comments: apiPost.total_comments || 0,
    shares: apiPost.total_shares || 0,
    isActive: apiPost.is_active !== false
  };
  
  console.log('✅ Transformed post:', transformed);
  return transformed;
};

// ✅ FETCH POSTS FROM DJANGO - Enhanced error handling
const fetchPosts = async (page = 1) => {
  const url = `${API_BASE_URL}/posts/?page=${page}`;
  
  console.log('🔍 Fetching posts from:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('🔍 Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('🔍 Raw API Response:', data);
    
    // Handle both paginated and non-paginated responses
    const posts = Array.isArray(data) ? data : (data.results || []);
    const hasNext = data.next ? true : false;
    const hasPrevious = data.previous ? true : false;
    
    console.log(`✅ Fetched ${posts.length} posts`);
    
    return {
      posts: posts.map(transformApiPost),
      hasNext,
      hasPrevious,
      count: data.count || posts.length
    };
    
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    throw error;
  }
};

const HomeFeed = () => {
  // ✅ STATE MANAGEMENT
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ✅ LOAD POSTS FROM API
  const loadPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);
      
      const response = await fetchPosts(pageNum);
      
      if (append) {
        setPosts(prev => [...prev, ...response.posts]);
      } else {
        setPosts(response.posts);
      }
      
      setHasMore(response.hasNext);
      setPage(pageNum);
      
    } catch (err) {
      console.error('❌ Failed to load posts:', err);
      setError('Failed to load posts. Please try again.');
      
      // If no posts loaded yet, show empty state
      if (!append) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ✅ INITIAL LOAD
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // ✅ REFRESH POSTS
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts(1, false);
  }, [loadPosts]);

  // ✅ LOAD MORE POSTS (Pagination)
  const handleLoadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await loadPosts(page + 1, true);
    }
  }, [hasMore, loading, page, loadPosts]);

  // ✅ HANDLE LIKE ACTION - Update local state optimistically
  const handlePostLike = useCallback((postId, isLiked, totalLikes) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? {
              ...post,
              likes: {
                count: totalLikes,
                isLiked: isLiked
              }
            }
          : post
      )
    );
    console.log(`✅ Updated post ${postId} like status: ${isLiked} (${totalLikes} total)`);
  }, []);

  // ✅ HANDLE COMMENT ACTION - Update local state
  const handlePostComment = useCallback((postId, newComment) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? {
              ...post,
              comments: post.comments + 1
            }
          : post
      )
    );
    console.log(`✅ Added comment to post ${postId}:`, newComment);
  }, []);

  // ✅ HANDLE CREATE POST
  const handleCreatePost = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handlePostCreated = useCallback(async (newPost) => {
    console.log('✅ New post created:', newPost);
    setShowCreateModal(false);
    
    // Refresh the feed to show the new post
    await handleRefresh();
  }, [handleRefresh]);

  // ✅ LOADING STATE
  if (loading && posts.length === 0) {
    return (
      <div className="app-container">
        <TopNavbar />
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your feed...</p>
          </div>
        </div>
        <BottomNavbar onCreateClick={handleCreatePost} />
        
        <style jsx>{`
          .app-container {
            min-height: 100vh;
            background-color: #fafafa;
          }

          .loading-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            padding: 16px;
          }

          .loading-content {
            text-align: center;
          }

          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #e5e7eb;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }

          .loading-text {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error && posts.length === 0) {
    return (
      <div className="app-container">
        <TopNavbar />
        <div className="error-container">
          <div className="error-content">
            <div className="error-icon">😕</div>
            <h2 className="error-title">Oops! Something went wrong</h2>
            <p className="error-message">{error}</p>
            <button 
              onClick={handleRefresh}
              className="error-button"
            >
              Try Again
            </button>
          </div>
        </div>
        <BottomNavbar onCreateClick={handleCreatePost} />
        
        <style jsx>{`
          .app-container {
            min-height: 100vh;
            background-color: #fafafa;
          }

          .error-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            padding: 16px;
          }

          .error-content {
            text-align: center;
            max-width: 400px;
          }

          .error-icon {
            font-size: 4rem;
            margin-bottom: 16px;
          }

          .error-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
            margin: 0 0 8px;
          }

          .error-message {
            color: #6b7280;
            margin: 0 0 24px;
            line-height: 1.5;
          }

          .error-button {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }

          .error-button:hover {
            background-color: #2563eb;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <TopNavbar />
      
      {/* Main Content */}
      <main className="main-content">
       
        {/* Refresh Button */}
        <div className="refresh-container">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="refresh-button"
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Pull to refresh'}
          </button>
        </div>
        
        {/* Posts Feed */}
        <div className="posts-container">
          {posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  onLike={handlePostLike}
                  onComment={handlePostComment}
                />
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <div className="load-more-container">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="load-more-button"
                  >
                    {loading ? 'Loading...' : 'Load More Posts'}
                  </button>
                </div>
              )}
              
              {/* End of feed message */}
              {!hasMore && posts.length > 0 && (
                <div className="end-of-feed">
                  <p className="end-title">🎉 You're all caught up!</p>
                  <p className="end-subtitle">Check back later for new posts</p>
                </div>
              )}
            </>
          ) : (
            // Empty state
            <div className="empty-state">
              <div className="empty-icon">📱</div>
              <h2 className="empty-title">No posts yet</h2>
              <p className="empty-message">Be the first to share something amazing!</p>
              <button 
                onClick={handleCreatePost}
                className="empty-button"
              >
                Create Your First Post
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavbar onCreateClick={handleCreatePost} />
      
      {/* ✅ MODALS */}
      <CreatePostModal 
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onPostCreated={handlePostCreated}
      />
      
      <style jsx>{`
        /* ✅ RESPONSIVE FEED CONTAINER */
        .app-container {
          min-height: 100vh;
          background-color: #fafafa;
        }

        .main-content {
          padding-top: 64px; /* Space for fixed navbar */
          padding-bottom: 80px; /* Space for bottom navbar */
          min-height: 100vh;
        }

        /* Stories Section */
        .stories-container {
          /* Mobile: Full width with padding */
          padding: 0;
          margin-bottom: 20px;
        }

        /* Refresh Button */
        .refresh-container {
          /* Mobile: Full width with padding */
          padding: 0 16px;
          margin-bottom: 16px;
          text-align: center;
        }

        .refresh-button {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .refresh-button:hover {
          color: #374151;
          background-color: #f3f4f6;
        }

        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Posts Container */
        .posts-container {
          /* Mobile: Full width with padding for posts */
          padding: 0 16px;
        }

        /* Load More Section */
        .load-more-container {
          text-align: center;
          padding: 32px 0;
        }

        .load-more-button {
          background-color: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .load-more-button:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .load-more-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* End of Feed */
        .end-of-feed {
          text-align: center;
          padding: 40px 16px;
        }

        .end-title {
          color: #374151;
          font-size: 16px;
          margin: 0 0 4px;
        }

        .end-subtitle {
          color: #9ca3af;
          font-size: 14px;
          margin: 0;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 16px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 24px;
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 8px;
        }

        .empty-message {
          color: #6b7280;
          margin: 0 0 32px;
          line-height: 1.5;
        }

        .empty-button {
          background-color: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .empty-button:hover {
          background-color: #2563eb;
        }

        /* ✅ RESPONSIVE BREAKPOINTS */
        
        /* Tablet and up */
        @media (min-width: 640px) {
          .refresh-container,
          .posts-container {
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
            padding-left: 0;
            padding-right: 0;
          }

          .refresh-container {
            margin-bottom: 20px;
          }
        }

        /* Desktop and up */
        @media (min-width: 1024px) {
          .refresh-container,
          .posts-container {
            max-width: 600px;
          }

          .refresh-container {
            margin-bottom: 24px;
          }
        }

        /* Extra wide screens */
        @media (min-width: 1280px) {
          .main-content {
            max-width: 1200px;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeFeed;