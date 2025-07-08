// src/components/layout/DesktopSidebar.jsx - ENHANCED WITH DYNAMIC USER STATS
import React, { useState } from 'react';
import { 
  Settings, 
  LogOut,
  Menu,
  Crown,
  Star,
  HelpCircle,
  Moon,
  Sun,
  User,
  Mail,
  Shield
} from 'lucide-react';


const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  return `http://127.0.0.1:8000${avatarPath}`;
};

// Desktop Sidebar - ORIGINAL STRUCTURE PRESERVED + DYNAMIC STATS
const DesktopSidebar = ({ 
  activeTab, 
  onTabChange, 
  onSidebarAction, 
  user, 
  theme, 
  onThemeToggle 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Handle sidebar item clicks
  const handleItemClick = (item) => {
    console.log('Sidebar item clicked:', item.id);
    
    if (item.id === 'theme') {
      onThemeToggle?.();
      return;
    }

    // Call the sidebar action handler from ResponsiveLayout
    if (onSidebarAction) {
      onSidebarAction(item.id);
    } else {
      // Fallback to onTabChange for backwards compatibility
      onTabChange?.(item.id);
    }
  };

  // Sidebar Items - ORIGINAL STRUCTURE
  const secondaryItems = [
    { 
      id: 'upgrade', 
      icon: Crown, 
      label: 'Upgrade to Pro', 
      isPremium: true,
      description: 'Get premium features'
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: 'Settings',
      description: 'App preferences'
    },
    { 
      id: 'help', 
      icon: HelpCircle, 
      label: 'Help & Support',
      description: 'Get assistance'
    },
    { 
      id: 'theme', 
      icon: theme === 'dark' ? Sun : Moon, 
      label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
      description: 'Toggle theme'
    },
    { 
      id: 'logout', 
      icon: LogOut, 
      label: 'Logout', 
      isDanger: true,
      description: 'Sign out'
    }
  ];

  // ✅ ENHANCED - Dynamic user stats from backend
  const getUserStats = () => {
    if (!user || !user.profile) {
      // Fallback to default values if no user data
      return {
        posts: 0,
        followers: 0,
        following: 0
      };
    }

    const profile = user.profile;
    
    return {
      posts: profile.posts_count || 0,
      followers: profile.followers_count || 0,
      following: profile.following_count || 0
    };
  };

  const userStats = getUserStats();

  // ✅ ENHANCED - Helper function to format numbers
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  return (
    <div className={`flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-80'
    }`}>
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Connectify
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        
        {/* User Profile Section - ENHANCED WITH DYNAMIC DATA */}
        {user && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer`}>
              
              {/* Avatar - ENHANCED */}
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.profile?.avatar ? (
                  <img 
                    src={getFullAvatarUrl(user.profile.avatar)}
                    alt={user.full_name || user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {(user.full_name || user.username)?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              
              {/* User Info - ENHANCED WITH REAL DATA */}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {user.full_name || user.username || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    @{user.username || 'username'}
                  </p>
                  
                  {/* Dynamic Stats - REAL DATA FROM BACKEND */}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{userStats.posts} posts</span>
                    <span>{formatCount(userStats.followers)} followers</span>
                    <span>{userStats.following} following</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Items - ORIGINAL STRUCTURE PRESERVED */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : item.isPremium
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                      : item.isDanger
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 ${item.isPremium ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{item.label}</span>
                        {item.isPremium && <Star className="w-4 h-4 flex-shrink-0" />}
                      </div>
                      {item.description && (
                        <p className={`text-xs opacity-70 truncate ${
                          item.isPremium ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Connectify v1.0.0
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Made with ❤️ for social connections
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopSidebar;