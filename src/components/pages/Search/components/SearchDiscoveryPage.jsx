// src/components/pages/Search/components/SearchDiscoveryPage.jsx - OPTIMIZED
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, TrendingUp, Hash, Users, MessageCircle, Heart, X, Filter } from 'lucide-react';
import { Button } from '../../../ui/Button/Button';
import Input from '../../../ui/Input';
import FollowButton, { FOLLOW_STATES, UserCard } from '../../../ui/FollowButton';

// Import mock data from separate file for better performance
import { 
  MOCK_USERS, 
  MOCK_POSTS, 
  MOCK_HASHTAGS, 
  TRENDING_TOPICS, 
  SEARCH_CATEGORIES 
} from '../../../../utils/mockData';

// Post Card Component with performance optimizations
const PostCard = React.memo(({ post, onPostClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  // Memoize like handler to prevent recreation
  const handleLike = useCallback((e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  }, [isLiked]);

  // Memoize post click handler to prevent recreation
  const handlePostClick = useCallback(() => {
    onPostClick?.(post);
  }, [onPostClick, post]);

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-200 dark:hover:border-blue-800"
      onClick={handlePostClick}
    >
      {/* Author */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {post.author.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="flex items-center space-x-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {post.author.name}
            </h4>
            {post.author.verified && (
              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            @{post.author.username} • {post.timestamp}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-900 dark:text-gray-100 mb-3 leading-relaxed text-sm">
        {post.content}
      </p>

      {/* Media indicator */}
      {post.hasMedia && (
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-3 text-center">
          <span className="text-gray-500 dark:text-gray-400 text-sm">📷 Media content</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 text-sm transition-colors hover:scale-105 ${
            isLiked ? 'text-red-500' : 'hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>

        <button className="flex items-center space-x-1 text-sm hover:text-blue-500 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments}</span>
        </button>

        <button className="flex items-center space-x-1 text-sm hover:text-green-500 transition-colors">
          <TrendingUp className="w-4 h-4" />
          <span>{post.shares}</span>
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.likes === nextProps.post.likes &&
    prevProps.post.comments === nextProps.post.comments &&
    prevProps.post.shares === nextProps.post.shares &&
    prevProps.onPostClick === nextProps.onPostClick
  );
});

PostCard.displayName = 'PostCard';

// Hashtag Card Component with performance optimizations
const HashtagCard = React.memo(({ hashtag, onHashtagClick }) => {
  // Memoize click handler to prevent recreation
  const handleClick = useCallback(() => {
    onHashtagClick?.(hashtag);
  }, [onHashtagClick, hashtag]);

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-200 dark:hover:border-blue-800"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Hash className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              #{hashtag.tag}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {hashtag.count.toLocaleString()} posts
            </p>
          </div>
        </div>
        {hashtag.trending && (
          <div className="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
            Trending
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for hashtag component
  return (
    prevProps.hashtag.tag === nextProps.hashtag.tag &&
    prevProps.hashtag.count === nextProps.hashtag.count &&
    prevProps.hashtag.trending === nextProps.hashtag.trending &&
    prevProps.onHashtagClick === nextProps.onHashtagClick
  );
});

HashtagCard.displayName = 'HashtagCard';

// Recent Searches Component with performance optimizations
const RecentSearches = React.memo(({ searches, onClearSearch, onSearchClick }) => {
  // Memoize clear all handler
  const handleClearAll = useCallback(() => {
    onClearSearch();
  }, [onClearSearch]);

  // Memoize search item handlers
  const createSearchClickHandler = useCallback((search) => () => {
    onSearchClick(search);
  }, [onSearchClick]);

  if (searches.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Searches</h3>
        <button
          onClick={handleClearAll}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear all
        </button>
      </div>
      <div className="space-y-2">
        {searches.map((search, index) => (
          <button
            key={index}
            onClick={createSearchClickHandler(search)}
            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{search}</span>
            </div>
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
          </button>
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for recent searches
  return (
    JSON.stringify(prevProps.searches) === JSON.stringify(nextProps.searches) &&
    prevProps.onClearSearch === nextProps.onClearSearch &&
    prevProps.onSearchClick === nextProps.onSearchClick
  );
});

RecentSearches.displayName = 'RecentSearches';

// Main Search & Discovery Component with performance optimizations
const SearchDiscoveryPage = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(SEARCH_CATEGORIES.ALL);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({ users: [], posts: [], hashtags: [] });
  const [recentSearches, setRecentSearches] = useState(['react hooks', 'design trends', 'photography']);
  const [showFilters, setShowFilters] = useState(false);

  const searchInputRef = useRef(null);

  // Memoize search function to prevent recreation
  const performSearch = useCallback((query) => {
    const lowerQuery = query.toLowerCase();
    
    // Filter users
    const filteredUsers = MOCK_USERS.filter(user =>
      user.name.toLowerCase().includes(lowerQuery) ||
      user.username.toLowerCase().includes(lowerQuery) ||
      user.bio?.toLowerCase().includes(lowerQuery)
    );

    // Filter posts
    const filteredPosts = MOCK_POSTS.filter(post =>
      post.content.toLowerCase().includes(lowerQuery) ||
      post.author.name.toLowerCase().includes(lowerQuery) ||
      post.author.username.toLowerCase().includes(lowerQuery)
    );

    // Filter hashtags
    const filteredHashtags = MOCK_HASHTAGS.filter(hashtag =>
      hashtag.tag.toLowerCase().includes(lowerQuery)
    );

    setSearchResults({
      users: filteredUsers,
      posts: filteredPosts,
      hashtags: filteredHashtags
    });

    setIsSearching(false);
  }, []);

  // Perform search with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ users: [], posts: [], hashtags: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    const searchTimeout = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, performSearch]);

  // Memoize event handlers to prevent recreation
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
      setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
    }
  }, [searchQuery, recentSearches]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults({ users: [], posts: [], hashtags: [] });
    searchInputRef.current?.focus();
  }, []);

  const handleRecentSearchClick = useCallback((search) => {
    setSearchQuery(search);
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  // Memoize category change handler
  const handleCategoryChange = useCallback((category) => {
    setActiveCategory(category);
  }, []);

  // Memoize click handlers for hashtags and posts
  const handleHashtagClick = useCallback((hashtag) => {
    setSearchQuery(`#${hashtag.tag}`);
  }, []);

  const handlePostClick = useCallback((post) => {
    console.log('Post clicked:', post);
  }, []);

  const handleUserClick = useCallback((user) => {
    console.log('User clicked:', user);
  }, []);

  // Memoize filtered results calculation
  const filteredResults = useMemo(() => {
    switch (activeCategory) {
      case SEARCH_CATEGORIES.USERS:
        return { users: searchResults.users, posts: [], hashtags: [] };
      case SEARCH_CATEGORIES.POSTS:
        return { users: [], posts: searchResults.posts, hashtags: [] };
      case SEARCH_CATEGORIES.HASHTAGS:
        return { users: [], posts: [], hashtags: searchResults.hashtags };
      default:
        return searchResults;
    }
  }, [searchResults, activeCategory]);

  // Memoize computed values
  const hasResults = useMemo(() => {
    return filteredResults.users.length > 0 || filteredResults.posts.length > 0 || filteredResults.hashtags.length > 0;
  }, [filteredResults]);

  const isSearchActive = useMemo(() => {
    return searchQuery.trim().length > 0;
  }, [searchQuery]);

  const totalResults = useMemo(() => {
    return searchResults.users.length + searchResults.posts.length + searchResults.hashtags.length;
  }, [searchResults]);

  const currentResultsCount = useMemo(() => {
    return filteredResults.users.length + filteredResults.posts.length + filteredResults.hashtags.length;
  }, [filteredResults]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <form onSubmit={handleSearchSubmit}>
                <Input
                  ref={searchInputRef}
                  placeholder="Search users, posts, hashtags..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  icon={<Search className="w-5 h-5" />}
                  rightIcon={
                    searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )
                  }
                  className="text-base py-3"
                />
              </form>
              
              {/* Loading indicator */}
              {isSearching && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Filters Button */}
            <Button
              variant="outline"
              onClick={toggleFilters}
              className="px-4 py-3"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Filters */}
          {(isSearchActive || showFilters) && (
            <div className="flex items-center space-x-2 mt-4 overflow-x-auto">
              {Object.entries(SEARCH_CATEGORIES).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleCategoryChange(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeCategory === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                  {value === SEARCH_CATEGORIES.ALL && hasResults && (
                    <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
                      {totalResults}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {!isSearchActive ? (
          // DISCOVERY VIEW (when not searching)
          <div className="space-y-6">
            
            {/* Recent Searches */}
            <RecentSearches 
              searches={recentSearches}
              onClearSearch={clearRecentSearches}
              onSearchClick={handleRecentSearchClick}
            />

            {/* Trending Now */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                Trending Now
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TRENDING_TOPICS.map((topic, index) => (
                  <HashtagCard
                    key={index}
                    hashtag={{ tag: topic.tag, count: topic.count, trending: true }}
                    onHashtagClick={handleHashtagClick}
                  />
                ))}
              </div>
            </div>

            {/* Suggested Users */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                People You Might Know
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_USERS.slice(0, 4).map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onUserClick={handleUserClick}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          // SEARCH RESULTS VIEW
          <div className="space-y-6">
            
            {/* Search Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {hasResults ? (
                  <>Search results for "{searchQuery}"</>
                ) : (
                  <>No results for "{searchQuery}"</>
                )}
              </h2>
              {hasResults && (
                <span className="text-gray-500 dark:text-gray-400">
                  {currentResultsCount} results
                </span>
              )}
            </div>

            {hasResults ? (
              <div className="space-y-6">
                
                {/* Users Results */}
                {filteredResults.users.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-500" />
                      Users ({filteredResults.users.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredResults.users.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onUserClick={handleUserClick}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Posts Results */}
                {filteredResults.posts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-green-500" />
                      Posts ({filteredResults.posts.length})
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredResults.posts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onPostClick={handlePostClick}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Hashtags Results */}
                {filteredResults.hashtags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <Hash className="w-5 h-5 mr-2 text-purple-500" />
                      Hashtags ({filteredResults.hashtags.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredResults.hashtags.map((hashtag, index) => (
                        <HashtagCard
                          key={index}
                          hashtag={hashtag}
                          onHashtagClick={handleHashtagClick}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // No Results State
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Try searching for something else or check your spelling
                </p>
                <Button onClick={clearSearch} variant="outline">
                  Clear search
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

SearchDiscoveryPage.displayName = 'SearchDiscoveryPage';

export default SearchDiscoveryPage;