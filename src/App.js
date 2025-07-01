// src/App.js - OPTIMIZED
import React, { useState, Suspense, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { ToastProvider } from './components/ui/Toast';
import ChatView from './components/pages/Messages/ChatView';

// Animation Components
import PageTransition from './components/ui/PageTransition/PageTransition';
import { PageSkeleton, SkeletonStyles } from './components/ui/Skeleton/Skeleton';
import { ButtonAnimationStyles } from './components/ui/AnimatedButton/AnimatedButton';

// Import ResponsiveLayout
import ResponsiveLayout from './components/layout/ResponsiveLayout';

// Import Enhanced Post Creation Modal
import EnhancedPostCreationModal from './components/modals/EnhancedPostCreationModal';

// Lazy-loaded Pages for better performance
const LandingPage = React.lazy(() => import('./components/pages/LandingPage'));
const HomeFeed = React.lazy(() => import('./components/pages/HomeFeed'));
const SearchPage = React.lazy(() => import('./components/pages/Search'));
const MessagesPage = React.lazy(() => import('./components/pages/Messages'));
const UserProfile = React.lazy(() => import('./components/pages/Profile'));
const SettingsPage = React.lazy(() => import('./components/pages/Settings'));
const UpgradePage = React.lazy(() => import('./components/pages/UpgradePage'));

// Move static data outside component to prevent recreation on every render
const ROUTE_CONFIG = [
  { 
    path: '/home', 
    component: HomeFeed, 
    skeleton: 'feed',
    transition: 'fade' 
  },
  { 
    path: '/search', 
    component: SearchPage, 
    skeleton: 'search',
    transition: 'slide',
    direction: 'right'
  },
  { 
    path: '/messages', 
    component: MessagesPage, 
    skeleton: 'messages',
    transition: 'slide',
    direction: 'left'
  },
  { 
    path: '/profile', 
    component: UserProfile, 
    skeleton: 'profile',
    transition: 'scale'
  },
  { 
    path: '/settings', 
    component: SettingsPage, 
    skeleton: 'feed',
    transition: 'fade'
  },
  { 
    path: '/upgrade', 
    component: UpgradePage, 
    skeleton: 'feed',
    transition: 'blur'
  }
];

// Move route mapping outside component to prevent recreation
const TAB_ROUTES = {
  home: '/home',
  search: '/search',
  messages: '/messages',
  profile: '/profile',
  settings: '/settings',    
  upgrade: '/upgrade',
};

// Enhanced Loading Component with skeleton
const PageLoadingFallback = React.memo(({ type = "feed" }) => (
  <div className="h-full w-full">
    <PageSkeleton type={type} />
  </div>
));

PageLoadingFallback.displayName = 'PageLoadingFallback';

// Main App Layout Component with performance optimizations
const AppLayout = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State Management with loading states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Memoize user data to prevent recreation on every render
  const user = useMemo(() => ({
    name: 'Your Name',
    username: 'yourusername'
  }), []);

  // Memoize current route config calculation
  const currentRoute = useMemo(() => {
    return ROUTE_CONFIG.find(route => 
      location.pathname.startsWith(route.path)
    ) || { transition: 'fade', skeleton: 'feed' };
  }, [location.pathname]);

  // Determine active tab from current route with memoized calculation
  React.useEffect(() => {
    const path = location.pathname;
    
    // Update active tab based on route
    if (path === '/home' || path === '/') setActiveTab('home');
    else if (path.startsWith('/search')) setActiveTab('search');
    else if (path.startsWith('/messages')) setActiveTab('messages');
    else if (path.startsWith('/profile')) setActiveTab('profile');
    else if (path.startsWith('/settings')) setActiveTab('settings');
    else if (path.startsWith('/upgrade')) setActiveTab('upgrade');
  }, [location.pathname]);

  // Memoize tab change handler to prevent recreation
  const handleTabChange = useCallback((tab) => {
    if (tab === activeTab) return; // Prevent unnecessary navigation
    
    // Immediate state updates for smooth feel
    setActiveTab(tab);
    
    // Very brief loading state for visual feedback
    setIsNavigating(true);
    setTimeout(() => setIsNavigating(false), 50);
    
    // Navigate using pre-defined routes
    if (TAB_ROUTES[tab]) {
      navigate(TAB_ROUTES[tab]);
    }
  }, [activeTab, navigate]);

  // Memoize create post handler to prevent recreation
  const handleCreatePost = useCallback(() => {
    setShowCreatePost(true);
  }, []);

  // Memoize post created handler to prevent recreation
  const handlePostCreated = useCallback(() => {
    setShowCreatePost(false);
    console.log('Post created successfully!');
  }, []);

  // Memoize modal close handler to prevent recreation
  const handleModalClose = useCallback(() => {
    setShowCreatePost(false);
  }, []);

  return (
    <>
      {/* Global Animation Styles */}
      <SkeletonStyles />
      <ButtonAnimationStyles />
      
      {/* Simplified Layout without conflicting animations */}
      <ResponsiveLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreatePost={handleCreatePost}
        user={user}
        title="Connectify"
        isNavigating={isNavigating}
      >
        {/* Simple Suspense without extra animations */}
        <Suspense fallback={<PageLoadingFallback type={currentRoute.skeleton} />}>
          <Routes>
            <Route path="/home" element={<HomeFeed />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:userId" element={<ChatView />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/upgrade" element={<UpgradePage />} />
            <Route path="*" element={<HomeFeed />} />
          </Routes>
        </Suspense>
      </ResponsiveLayout>

      {/* Enhanced Post Creation Modal with Animations */}
      <EnhancedPostCreationModal
        isOpen={showCreatePost}
        onClose={handleModalClose}
        onPostCreate={handlePostCreated}
      />

      {/* Simplified, faster animations */}
      <style jsx global>{`
        /* Fast smooth transitions - 120ms only */
        .page-transition {
          transition: all 0.12s ease-out;
        }
        
        /* Smooth navigation loading */
        .navigation-loading {
          opacity: 0.98;
          transition: opacity 0.05s ease;
        }
        
        /* Enhanced focus styles for accessibility */
        button:focus-visible,
        [role="button"]:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 4px;
        }
        
        /* Smooth scrolling for better UX */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
          transition: background-color 0.2s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.8);
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.5);
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(75, 85, 99, 0.8);
        }
      `}</style>
    </>
  );
}, (prevProps, nextProps) => {
  // AppLayout has no props, so it should never re-render unless forced
  return true;
});

AppLayout.displayName = 'AppLayout';

// Main App Component with Enhanced Performance
const App = React.memo(() => {
  // Memoize landing page fallback to prevent recreation
  const landingPageFallback = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ), []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="connectify-theme">
      <ToastProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Landing page with its own animations */}
              <Route 
                path="/" 
                element={
                  <Suspense fallback={landingPageFallback}>
                    <LandingPage />
                  </Suspense>
                } 
              />
              
              {/* All other routes use the animated layout */}
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
});

App.displayName = 'App';

export default App;