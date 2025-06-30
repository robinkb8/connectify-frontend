// ===== src/components/layout/ResponsiveLayout.jsx - SMOOTH NAVIGATION FIXED =====
import React, { useState, useEffect } from 'react';
import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';
import DesktopSidebar from './DesktopSidebar';

// ✅ Simple theme detection that works with existing theme system
const useSimpleTheme = () => {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    // Check initial theme from DOM
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Also try to trigger the same method used by settings
    if (window.toggleTheme) {
      window.toggleTheme();
    }
    
    setTheme(newTheme);
  };
  
  return { theme, toggleTheme };
};

// ✅ Main Responsive Layout Component - SMOOTH NAVIGATION FIXED
const ResponsiveLayout = ({ 
  children, 
  activeTab, 
  onTabChange, 
  onCreatePost, 
  user,
  title = "Connectify",
  showBack = false,
  onBack,
  headerActions,
  isNavigating = false
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // ✅ Use simple theme detection
  const { theme, toggleTheme } = useSimpleTheme();

  // ✅ Enhanced responsive detection
  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // ✅ Handle sidebar navigation
  const handleSidebarNavigation = (action) => {
    switch (action) {
      case 'settings':
        onTabChange?.('settings');
        break;
      case 'upgrade':
        onTabChange?.('upgrade');
        break;
      case 'help':
        console.log('Help & Support clicked');
        // Add help functionality
        break;
      case 'logout':
        console.log('Logout clicked');
        // Add logout functionality
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // ✅ Get dynamic classes based on viewport
  const getContentClasses = () => {
    const baseClasses = "flex-1 flex flex-col min-w-0 relative";
    
    if (isMobile) {
      return `${baseClasses} h-screen`;
    } else if (isTablet) {
      return `${baseClasses} h-screen`;
    } else {
      return `${baseClasses} h-screen`;
    }
  };

  const getMainContentClasses = () => {
    const baseClasses = "flex-1 min-h-0 relative";
    
    if (isMobile) {
      return `${baseClasses} pb-16`; // Space for bottom nav
    } else if (isTablet) {
      return `${baseClasses} pb-16`; // Space for bottom nav
    } else {
      return `${baseClasses} pb-20`; // Space for bottom nav on desktop too
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* ✅ Desktop Sidebar - Only show on desktop */}
      {!isMobile && !isTablet && (
        <DesktopSidebar 
          activeTab={activeTab}
          onTabChange={onTabChange}
          onSidebarAction={handleSidebarNavigation}
          user={user}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      )}

      {/* ✅ Main Content Area */}
      <div className={getContentClasses()}>
        
        {/* ✅ Mobile Header - Only on mobile and tablet */}
        {(isMobile || isTablet) && (
          <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
            <MobileHeader
              title={title}
              showBack={showBack}
              onBack={onBack}
              showMenu={true}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
              actions={headerActions}
              onTabChange={onTabChange}
              user={user}
              theme={theme}
              onThemeToggle={toggleTheme}
            />
          </div>
        )}

        {/* ✅ FIXED: Main Content with consistent containers */}
        <div className={getMainContentClasses()}>
          <div className={`h-full w-full route-container ${isNavigating ? 'loading' : ''}`}>
            {/* ✅ FIXED: Consistent container for ALL pages - no more layout shifts */}
            <div className="h-full overflow-y-auto">
              <div className="min-h-full px-4 py-4 max-w-2xl mx-auto lg:max-w-3xl">
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Bottom Navigation - ALWAYS VISIBLE on all screen sizes */}
        <div className="flex-shrink-0">
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={onTabChange}
            onCreatePost={onCreatePost}
          />
        </div>
      </div>

      {/* ✅ Mobile Menu Overlay */}
      {showMobileMenu && (isMobile || isTablet) && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl">
            <div className="p-6">
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="mb-6 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
              
              {/* Mobile menu content */}
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    handleSidebarNavigation('settings');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Settings
                </button>
                <button 
                  onClick={() => {
                    handleSidebarNavigation('upgrade');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Upgrade to Pro
                </button>
                <button 
                  onClick={() => {
                    handleSidebarNavigation('help');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Help & Support
                </button>
                <button 
                  onClick={() => {
                    handleSidebarNavigation('logout');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ FIXED: CSS for smooth transitions */}
      <style jsx>{`
        .route-container {
          transition: opacity 0.12s ease-out;
        }
        
        .route-container.loading {
          opacity: 0.98;
        }
      `}</style>
    </div>
  );
};

// ✅ Export additional responsive components
export const ResponsiveContainer = ({ children, className = "", maxWidth = "2xl" }) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl"
  };

  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className={`mx-auto ${maxWidthClasses[maxWidth]}`}>
        {children}
      </div>
    </div>
  );
};

export const ResponsiveGrid = ({ children, cols = { sm: 1, md: 2, lg: 3 }, gap = 4, className = "" }) => {
  return (
    <div className={`grid gap-${gap} grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg} ${className}`}>
      {children}
    </div>
  );
};

export const ResponsiveCard = ({ children, className = "", clickable = false, onClick, padding = "default" }) => {
  const paddingClasses = {
    none: "p-0",
    sm: "p-2 sm:p-3",
    default: "p-3 sm:p-4 lg:p-6",
    lg: "p-4 sm:p-6 lg:p-8"
  };

  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl 
        border border-gray-200 dark:border-gray-700 
        ${paddingClasses[padding]}
        ${clickable ? 'cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all duration-200' : ''}
        ${className}
      `}
      onClick={clickable ? onClick : undefined}
    >
      {children}
    </div>
  );
};

export const ResponsiveText = ({ variant = "body", children, className = "" }) => {
  const variants = {
    h1: "text-2xl sm:text-3xl lg:text-4xl font-bold",
    h2: "text-xl sm:text-2xl lg:text-3xl font-bold",
    h3: "text-lg sm:text-xl lg:text-2xl font-semibold",
    h4: "text-base sm:text-lg lg:text-xl font-semibold",
    body: "text-sm sm:text-base",
    caption: "text-xs sm:text-sm",
    small: "text-xs"
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveLayout;