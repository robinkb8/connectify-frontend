 
// ===== src/components/layout/MobileHeader.jsx =====
import React from 'react';
import { 
  ChevronLeft, 
  Menu,
  Bell,
  MoreHorizontal
} from 'lucide-react';

// ✅ Mobile Header Component
const MobileHeader = ({ 
  title, 
  showBack, 
  onBack, 
  showMenu, 
  onMenuToggle, 
  actions 
}) => {
  return (
    <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 md:hidden">
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
              onClick={onMenuToggle}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}
          
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
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
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;