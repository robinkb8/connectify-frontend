 
// ===== src/components/ui/Skeleton/Skeleton.jsx - PRODUCTION QUALITY =====
import React from 'react';

// ✅ Base Skeleton Component with shimmer effect
const Skeleton = ({ 
  className = "", 
  width, 
  height, 
  rounded = false, 
  animate = true,
  variant = "default" // "default", "text", "avatar", "button"
}) => {
  const baseClasses = `
    bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 
    dark:from-gray-700 dark:via-gray-600 dark:to-gray-700
    ${animate ? 'animate-shimmer' : ''}
    ${rounded ? 'rounded-full' : 'rounded-md'}
  `;

  const variantClasses = {
    default: 'bg-gray-200 dark:bg-gray-700',
    text: 'h-4 bg-gray-200 dark:bg-gray-700',
    avatar: 'rounded-full bg-gray-200 dark:bg-gray-700',
    button: 'h-10 bg-gray-200 dark:bg-gray-700 rounded-lg'
  };

  const styles = {
    width: width || undefined,
    height: height || undefined,
    backgroundSize: '200% 100%',
    animation: animate ? 'shimmer 1.5s ease-in-out infinite' : undefined
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={styles}
    />
  );
};

// ✅ Post Card Skeleton
export const PostCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <Skeleton variant="avatar" className="w-10 h-10" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="w-6 h-6" />
    </div>
    
    {/* Content */}
    <div className="space-y-2 mb-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    
    {/* Image placeholder */}
    <Skeleton className="w-full h-48 mb-4" />
    
    {/* Actions */}
    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-6">
        <Skeleton className="w-12 h-6" />
        <Skeleton className="w-12 h-6" />
        <Skeleton className="w-12 h-6" />
      </div>
      <Skeleton className="w-6 h-6" />
    </div>
  </div>
);

// ✅ Profile Card Skeleton
export const ProfileCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton variant="avatar" className="w-16 h-16" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton variant="button" className="w-20" />
    </div>
    <Skeleton className="h-16 w-full" />
  </div>
);

// ✅ Message Skeleton
export const MessageSkeleton = () => (
  <div className="flex items-center space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
    <Skeleton variant="avatar" className="w-12 h-12" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-3 w-3/4" />
    </div>
  </div>
);

// ✅ Search Result Skeleton
export const SearchResultSkeleton = () => (
  <div className="flex items-center space-x-3 p-3">
    <Skeleton variant="avatar" className="w-10 h-10" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton variant="button" className="w-16 h-8" />
  </div>
);

// ✅ Feed Loading Component
export const FeedSkeleton = ({ count = 3 }) => (
  <div className="space-y-6">
    {Array.from({ length: count }, (_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
);

// ✅ Grid Skeleton for discovery/search
export const GridSkeleton = ({ cols = 3, rows = 3 }) => (
  <div className={`grid grid-cols-${cols} gap-4`}>
    {Array.from({ length: cols * rows }, (_, i) => (
      <Skeleton key={i} className="aspect-square" />
    ))}
  </div>
);

// ✅ List Skeleton for users/messages
export const ListSkeleton = ({ count = 5, type = "message" }) => {
  const SkeletonComponent = type === "profile" ? ProfileCardSkeleton : MessageSkeleton;
  
  return (
    <div className="space-y-1">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
};

// ✅ Page Loading Skeleton
export const PageSkeleton = ({ type = "feed" }) => {
  switch (type) {
    case "profile":
      return (
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton variant="avatar" className="w-20 h-20" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
                <div className="flex space-x-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton variant="button" className="w-24" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-8 w-16 rounded-t-lg" />
            ))}
          </div>
          
          {/* Posts */}
          <FeedSkeleton count={2} />
        </div>
      );
      
    case "messages":
      return (
        <div className="h-full flex">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-4">
            <Skeleton className="h-10 w-full mb-4" />
            <ListSkeleton count={8} type="message" />
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Skeleton variant="avatar" className="w-10 h-10" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            <div className="flex-1 p-4 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <Skeleton className={`h-10 ${i % 2 === 0 ? 'w-40' : 'w-32'} rounded-2xl`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
      
    case "search":
      return (
        <div className="space-y-6">
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }, (_, i) => (
              <SearchResultSkeleton key={i} />
            ))}
          </div>
        </div>
      );
      
    default: // feed
      return <FeedSkeleton count={4} />;
  }
};

// ✅ CSS for shimmer animation
export const SkeletonStyles = () => (
  <style jsx global>{`
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    
    .animate-shimmer {
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.4) 50%,
        transparent 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    
    .dark .animate-shimmer {
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.1) 50%,
        transparent 100%
      );
    }
  `}</style>
);

export default Skeleton;