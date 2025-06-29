// ===== SIMPLE FIX: Update ResponsiveLayout.jsx to detect theme from DOM =====
import React, { useState, useEffect } from 'react';
import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';
import DesktopSidebar from './DesktopSidebar';

// ✅ Simple theme detection (works with existing theme system)
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

// ✅ Main Responsive Layout Component - SIMPLE THEME FIX
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
  
  // ✅ Use simple theme detection (same as your settings)
  const { theme, toggleTheme } = useSimpleTheme();

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Page refreshed');
    
    if (window.onPageRefresh) {
      window.onPageRefresh();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* ✅ Desktop Sidebar - SECONDARY ACTIONS ONLY */}
      <DesktopSidebar 
        activeTab={activeTab}
        onTabChange={onTabChange}
        user={user}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ✅ Mobile Header - Only on mobile */}
        <div className="lg:hidden">
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

        {/* ✅ Content Area with proper spacing */}
        <div className="flex-1 overflow-auto pb-20 lg:pb-20">
          {isMobile ? (
            <div className="h-full overflow-auto">
              {children}
            </div>
          ) : (
            <div className="h-full overflow-auto">
              {children}
            </div>
          )}
        </div>

        {/* ✅ Bottom Navigation - ALWAYS VISIBLE */}
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          onCreatePost={onCreatePost}
        />
      </div>
    </div>
  );
};

// ✅ Export additional components for backwards compatibility
export const ResponsiveContainer = ({ children, className = "" }) => {
  return (
    <div className={`w-full max-w-full px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-6xl">
        {children}
      </div>
    </div>
  );
};

export const ResponsiveGrid = ({ children, cols = { sm: 1, md: 2, lg: 3 }, gap = 4, className = "" }) => {
  const gridClasses = `grid gap-${gap} grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg} ${className}`;
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

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