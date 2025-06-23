// frontend/src/components/pages/HomeFeed/HomeFeed.jsx - UPDATED WITH CREATE POST MODAL
import React, { useState, useEffect, useCallback } from 'react';
import TopNavbar from './components/TopNavbar';
import StoriesSection from './components/StoriesSection';
import PostCard from './components/PostCard';
import BottomNavbar from './components/BottomNavbar';
import CreatePostModal from '../../forms/CreatePostModal'; // ✅ NEW IMPORT

// ✅ API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ✅ DATA TRANSFORMATION FUNCTION
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

// ✅ FETCH POSTS FROM DJANGO
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
    
    console.log('🔍 Posts found:', posts.length);
    
    return {
      posts,
      hasNext,
      hasPrevious
    };
    
  } catch (err) {
    console.error('❌ Failed to fetch posts:', err);
    throw err;
  }
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

const HomeFeed = () => {
  // ✅ EXISTING STATE
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ✅ NEW STATE FOR CREATE POST MODAL
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ✅ Debug logging for state changes
  useEffect(() => {
    console.log('🔍 HomeFeed State:', {
      postsCount: posts.length,
      loading,
      error,
      hasMore,
      currentPage,
      showCreateModal
    });
  }, [posts, loading, error, hasMore, currentPage, showCreateModal]);

  // ✅ LOAD POSTS FUNCTION
  const loadPosts = useCallback(async (page = 1, reset = false) => {
    console.log('🔍 loadPosts called:', { page, reset, currentPosts: posts.length });
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchPosts(page);
      
      console.log('🔍 fetchPosts result:', result);
      
      // Transform API data to PostCard format
      const transformedPosts = result.posts.map(transformApiPost);
      console.log('🔍 Transformed posts:', transformedPosts);
      
      if (reset) {
        console.log('🔍 Resetting posts with:', transformedPosts.length, 'items');
        setPosts(transformedPosts);
      } else {
        console.log('🔍 Adding posts to existing');
        setPosts(prevPosts => [...prevPosts, ...transformedPosts]);
      }

      setCurrentPage(page);
      setHasMore(result.hasNext);
      
      console.log('✅ Posts loaded successfully:', transformedPosts.length);
      
    } catch (err) {
      console.error('❌ Failed to load posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ LOAD POSTS ON COMPONENT MOUNT
  useEffect(() => {
    console.log('🔍 HomeFeed mounted - loading initial posts');
    loadPosts(1, true);
  }, [loadPosts]);

  // ✅ CREATE POST MODAL HANDLERS
  const openCreateModal = useCallback(() => {
    console.log('🔍 Opening create post modal');
    setShowCreateModal(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    console.log('🔍 Closing create post modal');
    setShowCreateModal(false);
  }, []);

  const handlePostCreated = useCallback((newPost) => {
    console.log('🔍 New post created:', newPost);
    
    // Transform the new post and add it to the beginning of the list
    const transformedPost = transformApiPost(newPost);
    setPosts(prevPosts => [transformedPost, ...prevPosts]);
    
    console.log('✅ Post added to feed');
  }, []);

  // ✅ REFRESH POSTS FUNCTION
  const refreshPosts = useCallback(() => {
    console.log('🔍 Refreshing posts');
    loadPosts(1, true);
  }, [loadPosts]);

  // ✅ LOAD MORE POSTS FUNCTION
  const loadMorePosts = useCallback(() => {
    if (!loading && hasMore) {
      console.log('🔍 Loading more posts, page:', currentPage + 1);
      loadPosts(currentPage + 1, false);
    }
  }, [loading, hasMore, currentPage, loadPosts]);

  // ✅ LOADING STATE
  if (loading && posts.length === 0) {
    console.log('🔍 Rendering: Loading state');
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavbar />
        <StoriesSection />
        <div className="px-4 py-4 pb-20">
          <div className="text-center text-blue-600 text-sm mb-4 font-medium">
            🔄 Loading posts from Django backend...
          </div>
          {[1, 2, 3].map(i => (
            <PostSkeleton key={i} />
          ))}
        </div>
        <BottomNavbar onCreateClick={openCreateModal} />
        
        {/* ✅ CREATE POST MODAL */}
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={closeCreateModal}
          onPostCreated={handlePostCreated}
        />
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error && posts.length === 0) {
    console.log('🔍 Rendering: Error state');
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavbar />
        <StoriesSection />
        <div className="px-4 py-4 pb-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-red-800 font-semibold text-lg mb-2">
              Failed to load posts
            </h3>
            <p className="text-red-600 text-sm mb-4">
              {error}
            </p>
            <div className="space-y-2">
              <p className="text-red-500 text-xs">
                Make sure Django server is running on http://127.0.0.1:8000
              </p>
              <button 
                onClick={refreshPosts}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <BottomNavbar onCreateClick={openCreateModal} />
        
        {/* ✅ CREATE POST MODAL */}
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={closeCreateModal}
          onPostCreated={handlePostCreated}
        />
      </div>
    );
  }

  // ✅ EMPTY STATE
  if (!loading && posts.length === 0) {
    console.log('🔍 Rendering: Empty state');
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavbar />
        <StoriesSection />
        <div className="px-4 py-4 pb-20">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-gray-800 font-semibold text-lg mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Be the first to share something awesome!
            </p>
            <div className="space-y-3">
              <button 
                onClick={openCreateModal}
                className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                Create Your First Post
              </button>
              <br />
              <button 
                onClick={refreshPosts}
                className="text-purple-500 text-sm hover:text-purple-600 transition-colors"
              >
                Refresh Feed
              </button>
            </div>
          </div>
        </div>
        <BottomNavbar onCreateClick={openCreateModal} />
        
        {/* ✅ CREATE POST MODAL */}
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={closeCreateModal}
          onPostCreated={handlePostCreated}
        />
      </div>
    );
  }

  // ✅ SUCCESS STATE - RENDER POSTS
  console.log('🔍 Rendering: Success state with', posts.length, 'posts');
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      <StoriesSection />
      
      {/* ✅ POSTS FEED */}
      <div className="px-4 py-4 pb-20">
        {/* Success indicator */}
        <div className="text-center text-green-600 text-sm mb-4 font-medium">
          ✅ {posts.length} post{posts.length !== 1 ? 's' : ''} loaded from Django
        </div>
        
        {/* ✅ RENDER EACH POST */}
        {posts.map((post, index) => {
          console.log(`🔍 Rendering post ${index + 1}:`, {
            id: post.id,
            content: post.content?.substring(0, 30) + '...',
            hasImage: !!post.image,
            author: post.user?.username,
            likesStructure: post.likes
          });
          
          return (
            <PostCard 
              key={`post-${post.id}-${index}`} 
              post={post}
              onLike={() => {
                // TODO: Implement like functionality
                console.log('Like clicked for post:', post.id);
              }}
            />
          );
        })}
        
        {/* ✅ LOAD MORE BUTTON */}
        {hasMore && (
          <div className="text-center py-6">
            <button 
              onClick={loadMorePosts}
              disabled={loading}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Loading...' : 'Load More Posts'}
            </button>
          </div>
        )}
        
        {/* ✅ END OF POSTS INDICATOR */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-6">
            <div className="text-gray-500 text-sm mb-3">
              🎉 You've seen all posts!
            </div>
            <button 
              onClick={refreshPosts}
              className="text-blue-500 text-sm hover:text-blue-600 transition-colors"
            >
              Refresh for new posts
            </button>
          </div>
        )}
      </div>
      
      <BottomNavbar onCreateClick={openCreateModal} />
      
      {/* ✅ CREATE POST MODAL */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default HomeFeed;