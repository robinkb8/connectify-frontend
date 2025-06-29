// ===== src/components/layout/MobileBottomNav.jsx - MAIN NAVIGATION =====
import React from 'react';
import { 
  Home, 
  Search, 
  PlusSquare, 
  MessageCircle, 
  User
} from 'lucide-react';

// ✅ Mobile Bottom Navigation - PRIMARY NAVIGATION (All Devices)
const MobileBottomNav = ({ activeTab, onTabChange, onCreatePost }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'create', icon: PlusSquare, label: 'Create', action: onCreatePost },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => item.action ? item.action() : onTabChange(item.id)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                isActive 
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 scale-110' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium truncate">{item.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="w-1 h-1 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* iPhone notch padding */}
      <div className="h-safe-area-inset-bottom"></div>
    </div>
  );
};

export default MobileBottomNav;