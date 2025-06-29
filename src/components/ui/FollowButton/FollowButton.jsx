 
// ===== src/components/ui/FollowButton/FollowButton.jsx =====
import React, { useState } from 'react';
import { UserPlus, UserCheck, UserX, Loader2 } from 'lucide-react';
import { Button } from '../Button/Button';

// ✅ Follow States
export const FOLLOW_STATES = {
  NOT_FOLLOWING: 'not_following',
  FOLLOWING: 'following',
  PENDING: 'pending', // For private accounts
  LOADING: 'loading',
  ERROR: 'error'
};

// ✅ Enhanced Follow Button Component
function FollowButton({ 
  userId, 
  initialFollowState = FOLLOW_STATES.NOT_FOLLOWING,
  initialFollowerCount = 0,
  userName = "User",
  isPrivate = false,
  onFollowChange,
  className = "",
  size = "default" // "sm", "default", "lg"
}) {
  const [followState, setFollowState] = useState(initialFollowState);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // ✅ Get button configuration based on state
  const getButtonConfig = () => {
    switch (followState) {
      case FOLLOW_STATES.NOT_FOLLOWING:
        return {
          text: "Follow",
          icon: <UserPlus className="w-4 h-4" />,
          className: "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95",
          disabled: false
        };
      
      case FOLLOW_STATES.FOLLOWING:
        return {
          text: isHovered ? "Unfollow" : "Following",
          icon: isHovered ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />,
          className: isHovered 
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600",
          disabled: false
        };
      
      case FOLLOW_STATES.PENDING:
        return {
          text: "Pending",
          icon: <UserCheck className="w-4 h-4" />,
          className: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400",
          disabled: false
        };
      
      case FOLLOW_STATES.LOADING:
        return {
          text: "Loading...",
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          className: "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-wait",
          disabled: true
        };
      
      case FOLLOW_STATES.ERROR:
        return {
          text: "Try Again",
          icon: <UserPlus className="w-4 h-4" />,
          className: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30",
          disabled: false
        };
      
      default:
        return {
          text: "Follow",
          icon: <UserPlus className="w-4 h-4" />,
          className: "bg-blue-500 hover:bg-blue-600 text-white",
          disabled: false
        };
    }
  };

  // ✅ Handle follow/unfollow with optimistic UI updates
  const handleFollowToggle = async () => {
    const previousState = followState;
    const previousCount = followerCount;

    try {
      // ✅ INSTANT UI UPDATE based on current state
      if (followState === FOLLOW_STATES.NOT_FOLLOWING) {
        setFollowState(FOLLOW_STATES.LOADING);
        
        // Optimistic update for public accounts
        if (!isPrivate) {
          setTimeout(() => {
            setFollowState(FOLLOW_STATES.FOLLOWING);
            setFollowerCount(prev => prev + 1);
          }, 200);
        } else {
          // For private accounts, go to pending
          setTimeout(() => {
            setFollowState(FOLLOW_STATES.PENDING);
          }, 200);
        }
        
      } else if (followState === FOLLOW_STATES.FOLLOWING) {
        setFollowState(FOLLOW_STATES.LOADING);
        
        // Optimistic unfollow
        setTimeout(() => {
          setFollowState(FOLLOW_STATES.NOT_FOLLOWING);
          setFollowerCount(prev => prev - 1);
        }, 200);
        
      } else if (followState === FOLLOW_STATES.PENDING) {
        setFollowState(FOLLOW_STATES.LOADING);
        
        // Cancel follow request
        setTimeout(() => {
          setFollowState(FOLLOW_STATES.NOT_FOLLOWING);
        }, 200);
      }

      // ✅ Simulate API call
      const response = await simulateFollowAPI(userId, followState);
      
      if (response.success) {
        // API succeeded - the optimistic update was correct
        console.log('✅ Follow action successful');
        
        // Call parent callback if provided
        if (onFollowChange) {
          onFollowChange({
            userId,
            isFollowing: followState === FOLLOW_STATES.NOT_FOLLOWING || followState === FOLLOW_STATES.PENDING,
            followerCount: followerCount
          });
        }
        
      } else {
        throw new Error(response.error || 'Failed to update follow status');
      }
      
    } catch (error) {
      console.error('❌ Follow action failed:', error);
      
      // ✅ Revert optimistic updates on error
      setFollowState(previousState);
      setFollowerCount(previousCount);
      
      // Show error state briefly
      setFollowState(FOLLOW_STATES.ERROR);
      setTimeout(() => {
        setFollowState(previousState);
      }, 2000);
    }
  };

  // ✅ Simulate API call (replace with real API)
  const simulateFollowAPI = async (userId, currentState) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      return { success: false, error: 'Network error' };
    }
    
    return { success: true };
  };

  // ✅ Size configurations
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="relative">
      <Button
        onClick={handleFollowToggle}
        disabled={buttonConfig.disabled}
        className={`
          ${buttonConfig.className} 
          ${sizeClasses[size]}
          ${className}
          transition-all duration-200 font-semibold border
          ${followState === FOLLOW_STATES.LOADING ? 'pointer-events-none' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        <div className="flex items-center space-x-2">
          {buttonConfig.icon}
          <span>{buttonConfig.text}</span>
        </div>
      </Button>

      {/* ✅ Tooltip for additional context */}
      {showTooltip && followState === FOLLOW_STATES.PENDING && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg whitespace-nowrap animate-fadeIn z-50">
          Follow request sent to {userName}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-100"></div>
        </div>
      )}
    </div>
  );
}

// ✅ Enhanced User Card with Follow Button (Helper Component)
export function UserCard({ 
  user, 
  showFollowButton = true, 
  onUserClick,
  className = "" 
}) {
  const [followerCount, setFollowerCount] = useState(user.followers || 0);
  
  const handleFollowChange = ({ isFollowing, followerCount: newCount }) => {
    setFollowerCount(newCount);
    console.log(`User ${user.username} ${isFollowing ? 'followed' : 'unfollowed'}`);
  };

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 
      hover:shadow-lg transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800
      ${className}
    `}>
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer flex-1" 
          onClick={() => onUserClick?.(user)}
        >
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user.name}
              </h3>
              {user.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              @{user.username}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {followerCount.toLocaleString()} followers
            </p>
          </div>
        </div>

        {/* Follow Button */}
        {showFollowButton && (
          <FollowButton
            userId={user.id}
            initialFollowState={user.isFollowing ? FOLLOW_STATES.FOLLOWING : FOLLOW_STATES.NOT_FOLLOWING}
            initialFollowerCount={followerCount}
            userName={user.name}
            isPrivate={user.isPrivate}
            onFollowChange={handleFollowChange}
            size="sm"
          />
        )}
      </div>

      {/* Bio (if available) */}
      {user.bio && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2">
          {user.bio}
        </p>
      )}
    </div>
  );
}

export default FollowButton;