// ===== src/components/pages/Search/SearchPage.jsx - SIMPLE SEARCH =====
import React, { useState } from 'react';
import { Search, TrendingUp, Users, Hash } from "lucide-react";
import { Input } from '../../ui/Input/Input';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock trending data
  const trendingTopics = [
    { id: 1, hashtag: "#ReactJS", posts: "12.5K posts" },
    { id: 2, hashtag: "#WebDev", posts: "8.2K posts" },
    { id: 3, hashtag: "#JavaScript", posts: "15.1K posts" },
    { id: 4, hashtag: "#Design", posts: "6.8K posts" },
    { id: 5, hashtag: "#TechNews", posts: "9.3K posts" }
  ];

  const suggestedUsers = [
    { id: 1, name: "Alex Chen", username: "alexchen", followers: "1.2K", verified: true },
    { id: 2, name: "Sarah Johnson", username: "sarahj", followers: "890", verified: false },
    { id: 3, name: "Mike Davis", username: "mikedavis", followers: "2.1K", verified: true }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Search Input */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Search</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search posts, people, and topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 py-3"
          />
        </div>
      </div>

      {/* Search Results or Default Content */}
      {searchQuery ? (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Search results for "{searchQuery}"
          </h2>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No results found. Try different keywords.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Trending Topics */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Trending Topics
              </h2>
            </div>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <button
                  key={topic.id}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {topic.hashtag}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {topic.posts}
                      </p>
                    </div>
                  </div>
                  <Hash className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </section>

          {/* Suggested Users */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Suggested Users
              </h2>
            </div>
            <div className="space-y-3">
              {suggestedUsers.map((user) => (
                <button
                  key={user.id}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center space-x-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {user.name}
                        </p>
                        {user.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.username} • {user.followers} followers
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                    Follow
                  </button>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default SearchPage;