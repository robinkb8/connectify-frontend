// ===== src/components/layout/MobileHeader.jsx - HAMBURGER FOR SECONDARY ACTIONS =====
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Menu,
  Bell,
  MoreHorizontal,
  X,
  Crown,
  Settings,
  LogOut,
  HelpCircle,
  Star,
  Moon,
  Sun
} from 'lucide-react';

// ✅ Mobile Header Component - Hamburger for Secondary Actions Only
const MobileHeader = ({ 
  title, 
  showBack, 
  onBack, 
  showMenu = true, 
  onMenuToggle, 
  actions,
  onTabChange,
  user 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuToggle && onMenuToggle();
  };

  const handleMenuItemClick = (tabId) => {
    setIsMenuOpen(false);
    onTabChange && onTabChange(tabId);
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // Add your theme toggle logic here
  };

  // ✅ SECONDARY ACTIONS ONLY (like your original design)
  const menuItems = [
    { 
      id: 'theme', 
      icon: isDarkMode ? Sun : Moon, 
      label: 'Dark Mode', 
      isToggle: true,
      action: handleThemeToggle
    },
    { id: 'help', icon: HelpCircle, label: 'Help & Support' },
    { id: 'upgrade', icon: Crown, label: 'Upgrade Account', isPremium: true },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'logout', icon: LogOut, label: 'Logout', isDanger: true }
  ];

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        {/* Status bar spacing for mobile */}
        <div className="h-safe-area-inset-top"></div>
        
        <div className="flex items-center justify-between px-4 py-3">
          
          {/* Left Side */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {showBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            )}
            
            {showMenu && !showBack && (
              <button
                onClick={handleMenuToggle}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
              >
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            )}
            
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
              {title}
            </h1>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {actions || (
              <>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  {/* Notification dot */}
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ HAMBURGER MENU OVERLAY - SECONDARY ACTIONS */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Connectify
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* User Profile Section */}
            {user && (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      Alex Chen
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @alexchen
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items - SECONDARY ACTIONS */}
            <div className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                
                if (item.isToggle) {
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors ${
                        isDarkMode ? 'bg-purple-600' : 'bg-gray-300'
                      }`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 mt-1 ${
                          isDarkMode ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </div>
                    </button>
                  );
                }
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                      item.isPremium
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                        : item.isDanger
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.isPremium && <Star className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Connectify v1.0.0
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHeader;