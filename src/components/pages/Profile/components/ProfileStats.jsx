// components/pages/Profile/components/ProfileStats.jsx
import React from 'react';

const ProfileStats = ({ 
  postsCount = 0, 
  followersCount = 0, 
  followingCount = 0,
  onFollowersClick,
  onFollowingClick,
  className = ""
}) => {
  return (
    <div className={`flex gap-8 ${className}`}>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {postsCount.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
      </div>
      
      <div 
        className="text-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onFollowersClick}
      >
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {followersCount.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
      </div>
      
      <div 
        className="text-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onFollowingClick}
      >
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {followingCount.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
      </div>
    </div>
  );
};

export default ProfileStats;