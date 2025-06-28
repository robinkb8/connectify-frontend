 
// ===== src/components/pages/Search/SearchPage.jsx =====
import { NoSearchResultsEmpty } from '../../ui/EmptyState/EmptyState';
import React, { useState } from 'react';
import { Search } from "lucide-react";
import { Input } from '../../ui/Input/Input';
import PostCard from '../HomeFeed/components/PostCard';

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Mock search results - replace with real API calls later
  const searchResults = [
    {
      id: 1,
      author: { username: "johndoe", avatar: "" },
      content: "Just finished an amazing coding session! The new features are looking great 🚀",
      image_url: null,
      total_likes: 45,
      total_comments: 12,
      total_shares: 3,
      time_since_posted: "3h",
      is_liked: false,
      is_active: true
    }
  ];

  const filteredResults = searchResults.filter(post =>
    post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {filteredResults.length > 0 ? (
              filteredResults.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
           ) : (
              <NoSearchResultsEmpty 
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
              />
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
}

export default SearchPage;