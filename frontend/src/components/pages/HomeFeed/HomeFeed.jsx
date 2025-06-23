// frontend/src/components/pages/HomeFeed/HomeFeed.jsx - UPDATED FULL CODE
import React, { useState, useEffect, useCallback } from 'react';
import TopNavbar from './components/TopNavbar';
import StoriesSection from './components/StoriesSection';
import PostCard from './components/PostCard';
import BottomNavbar from './components/BottomNavbar';

// ✅ API UTILITY FUNCTIONS (inline for now)
const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Fetch posts from Django backend
 */
const fetchPosts = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/?page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Posts fetched from Django:', data);
    
    return {
      posts: data.results || [],
      hasNext: !!data.next,
      hasPrevious: !!data.previous,
      count: data.count || 0
    };
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    throw error;
  }
};

/**
 * Transform Django API response to match PostCard format
 */
const transformApiPost = (apiPost) => {
  return {
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
};

// ✅ LOADING SKELETON COMPONENT
const PostSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden animate-pulse">
    <div className="flex items-center space-x-3 p-4">
      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
    <div className="px-4 pb-3">
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    </div>
    <div className="bg-gray-300 h-64"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
    </div>
  </div>
);

// ✅ MAIN HOMEFEED COMPONENT
const HomeFeed = () => {
  // ✅ STATE MANAGEMENT for scalable posts feed
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ FETCH POSTS FROM DJANGO BACKEND
  const loadPosts = useCallback(async (page = 1, reset = false) => {
    try {
      console.log(`🔄 Loading posts from Django - Page ${page}`);
      
      if (reset) {
        setLoading(true);
        setError(null);
      }

      const response = await fetchPosts(page);
      const transformedPosts = response.posts.map(transformApiPost);
      
      if (reset) {
        // First load or refresh
        setPosts(transformedPosts);
      } else {
        // Load more posts (infinite scroll later)
        setPosts(prevPosts => [...prevPosts, ...transformedPosts]);
      }
      
      setHasMore(response.hasNext);
      setCurrentPage(page);
      
      console.log(`✅ Loaded ${transformedPosts.length} posts from Django`);
      console.log(`📊 Total posts in feed: ${reset ? transformedPosts.length : posts.length + transformedPosts.length}`);
      
    } catch (err) {
      console.error('❌ Failed to load posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [posts.length]);

  // ✅ LOAD POSTS ON COMPONENT MOUNT
  useEffect(() => {
    loadPosts(1, true);
  }, []);

  // ✅ REFRESH POSTS FUNCTION
  const refreshPosts = useCallback(() => {
    loadPosts(1, true);
  }, [loadPosts]);

  // ✅ HANDLE LOADING STATE
  if (loading && posts.length === 0) {
    return (
      <div>
        <TopNavbar />
        <StoriesSection />
        <div className="px-4 py-4 pb-20">
          <div className="text-center text-gray-500 mb-4">
            🔄 Loading posts from Django backend...
          </div>
          {/* Show 3 loading skeletons */}
          {[1, 2, 3].map(i => (
            <PostSkeleton key={i} />
          ))}
        </div>
        <BottomNavbar />
      </div>
    );
  }

  // ✅ HANDLE ERROR STATE
  if (error && posts.length === 0) {
    return (
      <div>
        <TopNavbar />
        <StoriesSection />
        <div className="px-4 py-4 pb-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <h3 className="text-red-800 font-semibold mb-2">
              ❌ Failed to load posts
            </h3>
            <p className="text-red-600 text-sm mb-4">
              {error}
            </p>
            <button 
              onClick={refreshPosts}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  // ✅ HANDLE EMPTY STATE (no posts yet)
  if (!loading && posts.length === 0) {
    return (
      <div>
        <TopNavbar />
        <StoriesSection />
        <div className="px-4 py-4 pb-20">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-gray-800 font-semibold mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Create some posts in Django admin to see them here!
            </p>
            <button 
              onClick={refreshPosts}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Refresh Feed
            </button>
          </div>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  // ✅ RENDER POSTS FEED (SUCCESS STATE)
  return (
    <div>
      <TopNavbar />
      <StoriesSection />
      
      {/* ✅ POSTS FEED with real Django data */}
      <div className="px-4 py-4 pb-20">
        {/* Success indicator for debugging */}
        <div className="text-center text-green-600 text-sm mb-4 font-medium">
          ✅ {posts.length} posts loaded from Django backend
        </div>
        
        {/* ✅ RENDER EACH POST - This replaces your single <PostCard /> */}
        {posts.map(post => (
          <PostCard 
            key={`post-${post.id}`} 
            post={post}
            // TODO: Add onLike function in Phase 2
          />
        ))}
        
        {/* Load more indicator (for infinite scroll in Phase 2) */}
        {hasMore && (
          <div className="text-center py-4">
            <button 
              onClick={() => loadPosts(currentPage + 1, false)}
              className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Posts'}
            </button>
          </div>
        )}
        
        {/* End of posts indicator */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            🎉 You've seen all posts! Check back later for more.
          </div>
        )}
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default HomeFeed;