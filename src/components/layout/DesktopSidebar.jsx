// ===== src/components/layout/DesktopSidebar.jsx - SECONDARY ACTIONS ONLY =====
import React, { useState } from 'react';
import { 
  Settings, 
  LogOut,
  Menu,
  Crown,
  Star,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react';

// ✅ Desktop Sidebar - SECONDARY ACTIONS (Settings, Logout, etc.)
const DesktopSidebar = ({ activeTab, onTabChange, user, theme, onThemeToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ✅ SECONDARY ACTIONS ONLY - Primary nav is in bottom nav
  const secondaryItems = [
    { id: 'upgrade', icon: Crown, label: 'Upgrade to Pro', isPremium: true },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support' },
    { id: 'logout', icon: LogOut, label: 'Logout', isDanger: true }
  ];

  return (
    <div className={`hidden lg:flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-72'
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
      <div className="flex-1 flex flex-col justify-between p-4">
        
        {/* User Profile Section */}
        <div className="space-y-6">
          {user && (
            <div className={`flex items-center space-x-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 ${
              isCollapsed ? 'justify-center' : ''
            }`}>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    @{user.username || 'username'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={onThemeToggle}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? "Toggle Dark Mode" : undefined}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!isCollapsed && (
              <span className="font-medium">Dark Mode</span>
            )}
            {!isCollapsed && (
              <div className="ml-auto">
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 mt-1 ${
                    theme === 'dark' ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="space-y-2">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  item.isPremium
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                    : item.isDanger
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{item.label}</span>
                    {item.isPremium && <Star className="w-4 h-4" />}
                  </div>
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