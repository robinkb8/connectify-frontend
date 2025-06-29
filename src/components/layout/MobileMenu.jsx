// ===== Mobile Menu Component for ResponsiveLayout =====
import React from 'react';
import { 
  Home, 
  Search, 
  Heart, 
  MessageCircle, 
  User, 
  Settings, 
  LogOut,
  Crown,
  X
} from 'lucide-react';

const MobileMenu = ({ isOpen, onClose, activeTab, onTabChange, user }) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'notifications', icon: Heart, label: 'Notifications', badge: 3 },
    { id: 'messages', icon: MessageCircle, label: 'Messages', badge: 2 },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'upgrade', icon: Crown, label: 'Upgrade to Pro', special: true },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'logout', icon: LogOut, label: 'Logout', danger: true }
  ];

  const handleItemClick = (itemId) => {
    onTabChange(itemId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
      <div className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user.name || 'User'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{user.username || 'username'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isUpgrade = item.special;
            const isDanger = item.danger;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg'
                    : isUpgrade
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg'
                      : isDanger
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isUpgrade ? 'animate-pulse' : ''}`} />
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
                
                {/* Special upgrade badge */}
                {isUpgrade && (
                  <div className="ml-auto">
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold bg-white/20 text-white rounded-full">
                      NEW
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Connectify v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;