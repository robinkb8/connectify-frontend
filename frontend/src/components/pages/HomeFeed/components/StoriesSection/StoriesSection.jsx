import React, { useCallback } from 'react';

// ✅ OPTIMIZED: Static story data (no recreation per render)
const DUMMY_STORIES = [
  { id: 'user', username: 'Your Story', avatar: '/api/placeholder/40/40', isUser: true },
  { id: '1', username: 'alex_photo', avatar: '/api/placeholder/40/40', isViewed: false },
  { id: '2', username: 'sarah_travel', avatar: '/api/placeholder/40/40', isViewed: true },
  { id: '3', username: 'mike_fitness', avatar: '/api/placeholder/40/40', isViewed: false },
  { id: '4', username: 'emma_art', avatar: '/api/placeholder/40/40', isViewed: true },
  { id: '5', username: 'david_food', avatar: '/api/placeholder/40/40', isViewed: false }
];
const StoriesSection = () => {
  // Click handler for when user clicks a story
  const handleStoryClick = useCallback((storyId) => {
    console.log('Story clicked:', storyId);
  }, []);

  return (
  <section className="bg-white border-b border-gray-200 py-4">
    <div className="flex space-x-4 px-4 overflow-x-auto">
      {DUMMY_STORIES.map((story) => (
        <div 
          key={story.id}
          onClick={() => handleStoryClick(story.id)}
          className="flex flex-col items-center space-y-1 cursor-pointer min-w-[60px]"
        >
          {/* Story Avatar with Ring */}
          <div className={`relative p-0.5 rounded-full ${
            story.isUser 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
              : story.isViewed 
              ? 'bg-gray-300' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}>
            <div className="bg-white p-0.5 rounded-full">
              <img 
                src={story.avatar} 
                alt={story.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            {/* Plus Icon for "Your Story" */}
            {story.isUser && (
              <div className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1">
                <span className="text-white text-xs font-bold">+</span>
              </div>
            )}
          </div>
          
          {/* Username */}
          <span className="text-xs text-gray-600 text-center truncate w-full">
            {story.isUser ? 'Your Story' : story.username}
          </span>
        </div>
      ))}
    </div>
  </section>
);
};
export default StoriesSection;