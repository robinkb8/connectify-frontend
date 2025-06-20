import React from 'react';
import TopNavbar from './components/TopNavbar';
import StoriesSection from './components/StoriesSection';
import PostCard from './components/PostCard';
import BottomNavbar from './components/BottomNavbar';


const HomeFeed = () => {
  return (
    <div>
      <TopNavbar />
      <StoriesSection />
       {/* Main Feed Area */}
      <div className="px-4 py-4 pb-20">
        <PostCard />
      </div>
      <BottomNavbar />
    </div>
  );
};

export default HomeFeed;