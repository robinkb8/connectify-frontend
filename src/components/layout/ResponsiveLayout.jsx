 
// ===== src/components/layout/ResponsiveLayout.jsx =====
import React, { useState, useEffect } from 'react';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import DesktopSidebar from './DesktopSidebar';

// ✅ Mobile Pull-to-Refresh Component
const PullToRefresh = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance * 0.5, 100));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 50) {
      setIsRefreshing(true);
      await onRefresh?.();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  };

  return (
    <div 
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-blue-50 dark:bg-blue-900/20 transition-all duration-200 z-10"
          style={{ transform: `translateY(${pullDistance}px)` }}
        >
          <div className="flex items-center space-x-2">
            {isRefreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Refreshing...</span>
              </>
            ) : (
              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                {pullDistance > 50 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            )}
          </div>
        </div>
      )}
      
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  );
};

// ✅ Responsive Container Component
export const ResponsiveContainer = ({ children, className = "" }) => {
  return (
    <div className={`w-full max-w-full px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-6xl">
        {children}
      </div>
    </div>
  );
};

// ✅ Responsive Grid Component
export const ResponsiveGrid = ({ children, cols = { sm: 1, md: 2, lg: 3 }, gap = 4, className = "" }) => {
  const gridClasses = `grid gap-${gap} grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg} ${className}`;
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// ✅ Mobile-First Card Component
export const ResponsiveCard = ({ children, className = "", clickable = false, onClick }) => {
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl 
        border border-gray-200 dark:border-gray-700 
        p-3 sm:p-4 lg:p-6
        ${clickable ? 'cursor-pointer hover:shadow-lg active:scale-[0.98]' : ''}
        ${clickable ? 'transition-all duration-200' : ''}
        ${className}
      `}
      onClick={clickable ? onClick : undefined}
    >
      {children}
    </div>
  );
};

// ✅ Responsive Text Component
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

// ✅ Main Responsive Layout Component
const ResponsiveLayout = ({ 
  children, 
  activeTab, 
  onTabChange, 
  onCreatePost, 
  user,
  title = "Connectify",
  showBack = false,
  onBack,
  headerActions
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Handle refresh
  const handleRefresh = async () => {
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Page refreshed');
    
    // Trigger custom refresh if provided
    if (window.onPageRefresh) {
      window.onPageRefresh();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <DesktopSidebar 
        activeTab={activeTab}
        onTabChange={onTabChange}
        onCreatePost={onCreatePost}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <MobileHeader
          title={title}
          showBack={showBack}
          onBack={onBack}
          showMenu={true}
          onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
          actions={headerActions}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-auto pb-20 md:pb-0">
          {isMobile ? (
            <PullToRefresh onRefresh={handleRefresh}>
              {children}
            </PullToRefresh>
          ) : (
            <div className="h-full overflow-auto">
              {children}
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          onCreatePost={onCreatePost}
        />
      </div>

      {/* Mobile Menu Overlay (if needed in future) */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        >
          <div className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl">
            {/* Mobile menu content can go here */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Mobile menu content can be added here
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveLayout;