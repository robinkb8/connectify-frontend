// src/components/layout/ResponsiveLayout.jsx - Fixed logout functionality
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';
import DesktopSidebar from './DesktopSidebar';

// Simple theme detection hook - moved outside for reusability
const useSimpleTheme = () => {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    if (window.toggleTheme) {
      window.toggleTheme();
    }
    
    setTheme(newTheme);
  }, [theme]);
  
  return { theme, toggleTheme };
};

// Main responsive layout component with performance optimizations
const ResponsiveLayout = React.memo(({ 
  children, 
  activeTab, 
  onTabChange, 
  onCreatePost, 
  onLogout, // Accept onLogout prop from App.js
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
  
  const { theme, toggleTheme } = useSimpleTheme();

  // Memoize sidebar actions - now with proper logout functionality
  const sidebarActions = useMemo(() => ({
    settings: (onTabChange) => onTabChange?.('settings'),
    upgrade: (onTabChange) => onTabChange?.('upgrade'),
    help: () => console.log('Help & Support clicked'),
    logout: () => {
      console.log('Logout clicked - calling logout function');
      onLogout?.(); // Call the actual logout function from App.js
    },
  }), [onLogout]);

  // Memoize viewport detection to prevent unnecessary recalculations
  const viewportConfig = useMemo(() => ({
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet
  }), [isMobile, isTablet]);

  // Enhanced responsive detection with useCallback to prevent recreation
  const checkViewport = useCallback(() => {
    const width = window.innerWidth;
    setIsMobile(width < 768);
    setIsTablet(width >= 768 && width < 1024);
  }, []);

  useEffect(() => {
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, [checkViewport]);

  // Memoize sidebar navigation handler to prevent recreation
  const handleSidebarNavigation = useCallback((action) => {
    const handler = sidebarActions[action];
    if (handler) {
      handler(onTabChange);
    } else {
      console.log('Unknown action:', action);
    }
  }, [sidebarActions, onTabChange]);

  // Memoize menu toggle handlers to prevent recreation
  const handleMenuToggle = useCallback(() => {
    setShowMobileMenu(!showMobileMenu);
  }, [showMobileMenu]);

  const handleMenuClose = useCallback(() => {
    setShowMobileMenu(false);
  }, []);

  // Memoize class calculations to prevent recreation on every render
  const contentClasses = useMemo(() => {
    const baseClasses = "flex-1 flex flex-col min-w-0 relative h-screen";
    return baseClasses;
  }, []);

  const mainContentClasses = useMemo(() => {
    const baseClasses = "flex-1 min-h-0 relative";
    
    if (viewportConfig.isMobile || viewportConfig.isTablet) {
      return `${baseClasses} pb-16`;
    }
    return `${baseClasses} pb-20`;
  }, [viewportConfig.isMobile, viewportConfig.isTablet]);

  // Memoize mobile menu handlers to prevent recreation
  const createMenuHandler = useCallback((action) => () => {
    handleSidebarNavigation(action);
    handleMenuClose();
  }, [handleSidebarNavigation, handleMenuClose]);

  const menuHandlers = useMemo(() => ({
    settings: createMenuHandler('settings'),
    upgrade: createMenuHandler('upgrade'),
    help: createMenuHandler('help'),
    logout: createMenuHandler('logout')
  }), [createMenuHandler]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Desktop Sidebar - Only show on desktop */}
      {viewportConfig.isDesktop && (
        <DesktopSidebar 
          activeTab={activeTab}
          onTabChange={onTabChange}
          onSidebarAction={handleSidebarNavigation}
          user={user}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      )}

      {/* Main Content Area */}
      <div className={contentClasses}>
        
        {/* Mobile Header - Only on mobile and tablet */}
        {(viewportConfig.isMobile || viewportConfig.isTablet) && (
          <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
            <MobileHeader
              title={title}
              showBack={showBack}
              onBack={onBack}
              showMenu={true}
              onMenuToggle={handleMenuToggle}
              actions={headerActions}
              onTabChange={onTabChange}
              user={user}
              theme={theme}
              onThemeToggle={toggleTheme}
            />
          </div>
        )}

        {/* Main Content with consistent containers */}
        <div className={mainContentClasses}>
          <div className={`h-full w-full route-container ${isNavigating ? 'loading' : ''}`}>
            <div className="h-full overflow-y-auto">
              <div className="min-h-full px-4 py-4 max-w-2xl mx-auto lg:max-w-3xl">
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation - Always visible on all screen sizes */}
        <div className="flex-shrink-0">
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={onTabChange}
            onCreatePost={onCreatePost}
          />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (viewportConfig.isMobile || viewportConfig.isTablet) && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={handleMenuClose}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl">
            <div className="p-6">
              <button 
                onClick={handleMenuClose}
                className="mb-6 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
              
              {/* Mobile menu content with memoized handlers */}
              <div className="space-y-4">
                <button 
                  onClick={menuHandlers.settings}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Settings
                </button>
                <button 
                  onClick={menuHandlers.upgrade}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Upgrade to Pro
                </button>
                <button 
                  onClick={menuHandlers.help}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Help & Support
                </button>
                <button 
                  onClick={menuHandlers.logout}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for smooth transitions */}
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
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  // Only re-render if essential props have changed
  return (
    prevProps.activeTab === nextProps.activeTab &&
    prevProps.title === nextProps.title &&
    prevProps.showBack === nextProps.showBack &&
    prevProps.isNavigating === nextProps.isNavigating &&
    prevProps.user?.id === nextProps.user?.id &&
    prevProps.children === nextProps.children &&
    prevProps.onLogout === nextProps.onLogout // Include onLogout in comparison
  );
});

// Set display name for debugging
ResponsiveLayout.displayName = 'ResponsiveLayout';

// Export additional responsive components (unchanged for functionality)
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