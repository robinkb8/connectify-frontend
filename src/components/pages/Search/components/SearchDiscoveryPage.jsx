 
// ===== src/components/pages/Search/components/SearchDiscoveryPage.jsx =====
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, TrendingUp, Hash, Users, MessageCircle, Heart, X, Filter } from 'lucide-react';
import { Button } from '../../../ui/Button/Button';
import Input from '../../../ui/Input';
import FollowButton, { FOLLOW_STATES, UserCard } from '../../../ui/FollowButton';

// ✅ Search Categories
const SEARCH_CATEGORIES = {
  ALL: 'all',
  USERS: 'users',
  POSTS: 'posts',
  HASHTAGS: 'hashtags',
  MEDIA: 'media'
};

// ✅ Mock Data
const mockUsers = [
  {
    id: '1',
    name: 'Sarah Wilson',
    username: 'sarahw',
    bio: 'UX Designer at Tech Corp. Love creating beautiful interfaces!',
    avatar: '',
    followers: 2340,
    verified: true,
    isFollowing: false,
    isPrivate: false
  },
  {
    id: '2',
    name: 'Alex Chen',
    username: 'alexchen',
    bio: 'Full-stack developer | React enthusiast | Coffee addict ☕',
    avatar: '',
    followers: 1890,
    verified: false,
    isFollowing: true,
    isPrivate: false
  },
  {
    id: '3',
    name: 'Maria Garcia',
    username: 'maria_g',
    bio: 'Digital artist and photographer 📸',
    avatar: '',
    followers: 5670,
    verified: true,
    isFollowing: false,
    isPrivate: true
  },
  {
    id: '4',
    name: 'David Kim',
    username: 'davidk',
    bio: 'Product Manager | Tech enthusiast',
    avatar: '',
    followers: 890,
    verified: false,
    isFollowing: false,
    isPrivate: false
  },
  {
    id: '5',
    name: 'Robin Kumar',
    username: 'robinkb',
    bio: 'Full-stack developer passionate about creating amazing user experiences!',
    avatar: '',
    followers: 1234,
    verified: true,
    isFollowing: false,
    isPrivate: false
  }
];

const mockPosts = [
  {
    id: '1',
    author: mockUsers[0],
    content: 'Just finished designing a new mobile app interface! What do you think? #UIDesign #MobileApp',
    timestamp: '2h ago',
    likes: 234,
    comments: 45,
    shares: 12,
    hasMedia: true
  },
  {
    id: '2',
    author: mockUsers[1],
    content: 'Loving the new React 18 features! The concurrent rendering is a game changer. #React #WebDev',
    timestamp: '4h ago',
    likes: 189,
    comments: 32,
    shares: 8,
    hasMedia: false
  },
  {
    id: '3',
    author: mockUsers[2],
    content: 'Golden hour photography from yesterday\'s shoot 🌅 #Photography #GoldenHour #NaturePhotography',
    timestamp: '1d ago',
    likes: 567,
    comments: 89,
    shares: 34,
    hasMedia: true
  },
  {
    id: '4',
    author: mockUsers[4],
    content: 'Working on some exciting new features. Can\'t wait to show you all! 💻✨ #Development #React',
    timestamp: '3h ago',
    likes: 156,
    comments: 23,
    shares: 7,
    hasMedia: false
  }
];

const mockHashtags = [
  { tag: 'react', count: 12340, trending: true },
  { tag: 'javascript', count: 8920, trending: true },
  { tag: 'design', count: 6780, trending: false },
  { tag: 'photography', count: 15600, trending: true },
  { tag: 'webdev', count: 4560, trending: false },
  { tag: 'ui', count: 3440, trending: false },
  { tag: 'ux', count: 2890, trending: false },
  { tag: 'frontend', count: 5670, trending: true },
  { tag: 'development', count: 7890, trending: false },
  { tag: 'mobile', count: 4321, trending: false }
];

const trendingTopics = [
  { tag: 'TechNews', count: 45600 },
  { tag: 'AI', count: 32400 },
  { tag: 'WebDevelopment', count: 28900 },
  { tag: 'Design', count: 21300 },
  { tag: 'React', count: 18700 }
];

// ✅ Post Card Component
const PostCard = ({ post, onPostClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-200 dark:hover:border-blue-800"
      onClick={() => onPostClick?.(post)}
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
};

// ✅ Hashtag Card Component
const HashtagCard = ({ hashtag, onHashtagClick }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-200 dark:hover:border-blue-800"
      onClick={() => onHashtagClick?.(hashtag)}
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
};

// ✅ Recent Searches Component
const RecentSearches = ({ searches, onClearSearch, onSearchClick }) => {
  if (searches.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Searches</h3>
        <button
          onClick={() => onClearSearch()}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear all
        </button>
      </div>
      <div className="space-y-2">
        {searches.map((search, index) => (
          <button
            key={index}
            onClick={() => onSearchClick(search)}
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
};

// ✅ Main Search & Discovery Component
function SearchDiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(SEARCH_CATEGORIES.ALL);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({ users: [], posts: [], hashtags: [] });
  const [recentSearches, setRecentSearches] = useState(['react hooks', 'design trends', 'photography']);
  const [showFilters, setShowFilters] = useState(false);

  const searchInputRef = useRef(null);

  // ✅ Perform search with debouncing
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
  }, [searchQuery]);

  // ✅ Search function with instant results
  const performSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Filter users
    const filteredUsers = mockUsers.filter(user =>
      user.name.toLowerCase().includes(lowerQuery) ||
      user.username.toLowerCase().includes(lowerQuery) ||
      user.bio?.toLowerCase().includes(lowerQuery)
    );

    // Filter posts
    const filteredPosts = mockPosts.filter(post =>
      post.content.toLowerCase().includes(lowerQuery) ||
      post.author.name.toLowerCase().includes(lowerQuery) ||
      post.author.username.toLowerCase().includes(lowerQuery)
    );

    // Filter hashtags
    const filteredHashtags = mockHashtags.filter(hashtag =>
      hashtag.tag.toLowerCase().includes(lowerQuery)
    );

    setSearchResults({
      users: filteredUsers,
      posts: filteredPosts,
      hashtags: filteredHashtags
    });

    setIsSearching(false);
  };

  // ✅ Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // ✅ Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
      setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
    }
  };

  // ✅ Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ users: [], posts: [], hashtags: [] });
    searchInputRef.current?.focus();
  };

  // ✅ Handle recent search click
  const handleRecentSearchClick = (search) => {
    setSearchQuery(search);
  };

  // ✅ Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // ✅ Filter results by category
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

  const hasResults = filteredResults.users.length > 0 || filteredResults.posts.length > 0 || filteredResults.hashtags.length > 0;
  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* ✅ Search Header */}
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
              onClick={() => setShowFilters(!showFilters)}
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
                  onClick={() => setActiveCategory(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeCategory === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                  {value === SEARCH_CATEGORIES.ALL && hasResults && (
                    <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
                      {searchResults.users.length + searchResults.posts.length + searchResults.hashtags.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {!isSearchActive ? (
          // ✅ DISCOVERY VIEW (when not searching)
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
                {trendingTopics.map((topic, index) => (
                  <HashtagCard
                    key={index}
                    hashtag={{ tag: topic.tag, count: topic.count, trending: true }}
                    onHashtagClick={(hashtag) => setSearchQuery(`#${hashtag.tag}`)}
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
                {mockUsers.slice(0, 4).map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onUserClick={(user) => console.log('User clicked:', user)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          // ✅ SEARCH RESULTS VIEW
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
                  {filteredResults.users.length + filteredResults.posts.length + filteredResults.hashtags.length} results
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
                          onUserClick={(user) => console.log('User clicked:', user)}
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
                          onPostClick={(post) => console.log('Post clicked:', post)}
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
                          onHashtagClick={(hashtag) => console.log('Hashtag clicked:', hashtag)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // ✅ No Results State
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
}

export default SearchDiscoveryPage;