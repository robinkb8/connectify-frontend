// ===== src/components/pages/HomeFeed/HomeFeed.jsx =====
import React, { useState, useEffect, useCallback } from 'react';
import { Search } from "lucide-react";
import { Input } from '../../ui/Input/Input';
import TopNavbar from './components/TopNavbar';
import BottomNavbar from './components/BottomNavbar';
import PostCard from './components/PostCard';
import SimpleCreatePost from './components/SimpleCreatePost';
import UserProfile from '../Profile/UserProfile';
import MessagesPage from '../Messages/MessagesPage';
import { NoPostsEmpty, LoadingState, LoadingErrorEmpty } from '../../ui/EmptyState/EmptyState';

// ✅ DJANGO API CONFIGURATION - Your existing API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ✅ DATA TRANSFORMATION - Your existing function
const transformApiPost = (apiPost) => {
  console.log('🔄 Transforming API post:', apiPost);
  
  const transformed = {
    id: apiPost.id,
    author: {
      username: apiPost.author?.username || 'Unknown User',
      avatar: apiPost.author?.avatar || null
    },
    content: apiPost.content || '',
    image_url: apiPost.image_url || null,
    total_likes: apiPost.total_likes || 0,
    total_comments: apiPost.total_comments || 0,
    total_shares: apiPost.total_shares || 0,
    time_since_posted: apiPost.time_since_posted || 'Unknown time',
    is_liked: apiPost.is_liked || false,
    is_active: apiPost.is_active !== false
  };
  
  console.log('✅ Transformed post:', transformed);
  return transformed;
};

// ✅ FETCH POSTS - Your existing API call
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
    
    return {
      posts: posts.map(transformApiPost),
      hasNext,
      hasPrevious,
      count: data.count || posts.length
    };
    
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    return {
      posts: [],
      hasNext: false,
      hasPrevious: false,
      count: 0
    };
  }
};

// ✅ MAIN HOMEFEED COMPONENT
function HomeFeed() {
  // ✅ State Management
  const [activeTab, setActiveTab] = useState("home");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // ✅ Load Posts on Component Mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchPosts(pageNum);
      
      if (pageNum === 1) {
        setPosts(result.posts);
      } else {
        setPosts(prev => [...prev, ...result.posts]);
      }
      
      setHasMore(result.hasNext);
      setPage(pageNum);
      
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Load More Posts
  const loadMorePosts = useCallback(() => {
    if (hasMore && !loading) {
      loadPosts(page + 1);
    }
  }, [hasMore, loading, page, loadPosts]);

  // ✅ Search Functionality
  const filteredPosts = posts.filter(post =>
    post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Determine if TopNavbar is visible
  const isTopNavbarVisible = activeTab === 'home';

  // ✅ RENDER CONTENT BASED ON ACTIVE TAB
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <main className="pt-16 pb-20 px-4 max-w-2xl mx-auto">
            <div className="space-y-6">
            

              {/* ✅ Posts Feed */}
             {/* ✅ Loading State */}
              {loading && posts.length === 0 && (
                <LoadingState message="Loading your feed..." />
              )}

              {/* ✅ Error State */}
              {error && !loading && (
                <LoadingErrorEmpty onRetry={() => loadPosts(1)} />
              )}

              {/* ✅ Empty State */}
              {!loading && !error && posts.length === 0 && (
                <NoPostsEmpty onCreatePost={() => console.log('Create post')} />
              )}

              {/* ✅ Posts Feed */}
              <div className="space-y-6">
  {loading && posts.length === 0 ? (
    // ✅ LOADING STATE - Show skeletons when actually loading
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
    // ✅ ERROR STATE
    <div className="text-center py-8 text-red-500">
      <p>{error}</p>
      <button 
        onClick={() => loadPosts(1)}
        className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Retry
      </button>
    </div>
  ) : posts.length === 0 ? (
    // ✅ EMPTY STATE
    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
      <p>No posts available</p>
    </div>
  ) : (
    // ✅ POSTS EXIST - Show actual posts
    <>
      {filteredPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={loadMorePosts}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </>
  )}
</div>
            </div>
          </main>
        );

      case "search":
        return (
          <main className="pt-4 pb-20 px-4 max-w-2xl mx-auto">
            <div className="space-y-6">
              {/* ✅ Search Header */}
              <div className="pt-4">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Search</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search posts, people, and topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* ✅ Search Results */}
              {searchQuery ? (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Search results for "{searchQuery}"</h2>
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No posts found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Search for posts, people, and topics</p>
                </div>
              )}
            </div>
          </main>
        );

      case "messages":
        return (
          <div className="pt-0 pb-20">
            <MessagesPage />
          </div>
        );

      case "profile":
        return (
          <main className="pt-4 pb-20 px-4">
            <UserProfile isOwnProfile={true} />
          </main>
        );

      default:
        return (
          <main className="pt-4 pb-20 px-4 max-w-2xl mx-auto">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Page not found</p>
            </div>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* ✅ Pass activeTab to TopNavbar - it will conditionally render */}
      <TopNavbar activeTab={activeTab} />
      {renderContent()}
      <BottomNavbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default HomeFeed;