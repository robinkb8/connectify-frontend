 
// ===== src/components/layout/DesktopSidebar.jsx =====
import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Heart, 
  MessageCircle, 
  User, 
  Settings, 
  LogOut,
  PlusSquare,
  Menu,
  Bell
} from 'lucide-react';

// ✅ Desktop Sidebar Component
const DesktopSidebar = ({ activeTab, onTabChange, onCreatePost, user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'notifications', icon: Heart, label: 'Notifications', badge: 3 },
    { id: 'messages', icon: MessageCircle, label: 'Messages', badge: 2 },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  const bottomItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'logout', icon: LogOut, label: 'Logout' }
  ];

  return (
    <div className={`hidden md:flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
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

      {/* Navigation */}
      <div className="flex-1 flex flex-col justify-between p-4">
        
        {/* Main Navigation */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {/* Badge for notifications/messages */}
                    {item.badge && item.badge > 0 && (
                      <div className="ml-auto">
                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Badge for collapsed state */}
                {isCollapsed && item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
          
          {/* Create Post Button */}
          <button
            onClick={onCreatePost}
            className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
              isCollapsed ? 'aspect-square' : ''
            }`}
            title={isCollapsed ? "Create Post" : undefined}
          >
            <PlusSquare className="w-5 h-5" />
            {!isCollapsed && <span>Create Post</span>}
          </button>
        </div>

        {/* Bottom Section */}
        <div className="space-y-2">
          {/* User Profile */}
          {user && (
            <div className={`flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    @{user.username || 'username'}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Bottom Items */}
          {bottomItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DesktopSidebar;