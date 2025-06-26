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

// ✅ DJANGO API CONFIGURATION - Your existing API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ✅ DATA TRANSFORMATION - Your existing function, keeping it the same
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

// ✅ MAIN HOMEFEED COMPONENT WITH NEW DESIGN
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

  // ✅ RENDER CONTENT BASED ON ACTIVE TAB
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <main className="pt-16 pb-20 px-4 max-w-2xl mx-auto">
            <div className="space-y-6">
              {/* ✅ Create Post Component */}
              <div className="pt-4">
                <SimpleCreatePost onPostCreated={() => loadPosts(1)} />
              </div>

              {/* ✅ Posts Feed */}
              <div className="space-y-6">
                {loading && posts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading posts...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <button 
                      onClick={() => loadPosts(1)}
                      className="mt-2 text-purple-500 hover:text-purple-600 font-medium"
                    >
                      Try again
                    </button>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                  </div>
                ) : (
                  <>
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                    
                    {/* ✅ Load More Button */}
                    {hasMore && (
                      <div className="text-center py-8">
                        <button 
                          onClick={loadMorePosts}
                          disabled={loading}
                          className="text-purple-500 hover:text-purple-600 font-medium disabled:opacity-50"
                        >
                          {loading ? 'Loading...' : 'Load more posts...'}
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
          <main className="pt-16 pb-20 px-4 max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search posts, people, and topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 py-3 text-lg rounded-full"
                  />
                </div>
              </div>

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
        {/* ✅ FIXED: Messages page now renders without additional padding since MessagesPage handles it internally */}
        return <MessagesPage />;

      case "profile":
        return (
          <main className="pt-16 pb-20 px-4">
            <UserProfile isOwnProfile={true} />
          </main>
        );

      default:
        return (
          <main className="pt-16 pb-20 px-4 max-w-2xl mx-auto">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Page not found</p>
            </div>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      {renderContent()}
      <BottomNavbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default HomeFeed;