// src/App.js - ENHANCED WITH JWT AUTHENTICATION
import React, { useState, Suspense, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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

// ✅ PRESERVED - Lazy-loaded Pages for better performance
const LandingPage = React.lazy(() => import('./components/pages/LandingPage'));
const HomeFeed = React.lazy(() => import('./components/pages/HomeFeed'));
const SearchPage = React.lazy(() => import('./components/pages/Search'));
const MessagesPage = React.lazy(() => import('./components/pages/Messages'));
const UserProfile = React.lazy(() => import('./components/pages/Profile'));
const SettingsPage = React.lazy(() => import('./components/pages/Settings'));
const UpgradePage = React.lazy(() => import('./components/pages/UpgradePage'));

// ✅ PRESERVED - Move static data outside component to prevent recreation on every render
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

// ✅ PRESERVED - Move route mapping outside component to prevent recreation
const TAB_ROUTES = {
  home: '/home',
  search: '/search',
  messages: '/messages',
  profile: '/profile',
  settings: '/settings',    
  upgrade: '/upgrade',
};

// ✅ PRESERVED - Enhanced Loading Component with skeleton
const PageLoadingFallback = React.memo(({ type = "feed" }) => (
  <div className="h-full w-full">
    <PageSkeleton type={type} />
  </div>
));

PageLoadingFallback.displayName = 'PageLoadingFallback';

// ✅ ENHANCED - Authentication-aware Landing Page wrapper
const LandingPageWrapper = React.memo(() => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Show landing page for non-authenticated users
  return <LandingPage />;
});

LandingPageWrapper.displayName = 'LandingPageWrapper';

// ✅ ENHANCED - Main App Layout Component with JWT integration
const AppLayout = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Get user data from JWT context
  
  // ✅ PRESERVED - State Management with loading states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isNavigating, setIsNavigating] = useState(false);
  
  // ✅ ENHANCED - Memoize user data from JWT context instead of hardcoded
  const userData = useMemo(() => ({
    name: user?.full_name || 'User',
    username: user?.username || 'username',
    email: user?.email || '',
    avatar: user?.profile?.avatar || null,
    profile: user?.profile || {}
  }), [user]);

  // ✅ PRESERVED - Memoize current route config calculation
  const currentRoute = useMemo(() => {
    return ROUTE_CONFIG.find(route => 
      location.pathname.startsWith(route.path)
    ) || { transition: 'fade', skeleton: 'feed' };
  }, [location.pathname]);

  // ✅ PRESERVED - Determine active tab from current route with memoized calculation
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

  // ✅ PRESERVED - Memoize tab change handler to prevent recreation
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

  // ✅ PRESERVED - Memoize create post handler to prevent recreation
  const handleCreatePost = useCallback(() => {
    setShowCreatePost(true);
  }, []);

  // ✅ PRESERVED - Memoize post created handler to prevent recreation
  const handlePostCreated = useCallback(() => {
    setShowCreatePost(false);
    console.log('Post created successfully!');
  }, []);

  // ✅ PRESERVED - Memoize modal close handler to prevent recreation
  const handleModalClose = useCallback(() => {
    setShowCreatePost(false);
  }, []);

  // ✅ NEW - Handle logout
  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <>
      {/* ✅ PRESERVED - Global Animation Styles */}
      <SkeletonStyles />
      <ButtonAnimationStyles />
      
      {/* ✅ ENHANCED - Layout with real user data and logout function */}
      <ResponsiveLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreatePost={handleCreatePost}
        user={userData}
        onLogout={handleLogout} // Add logout handler if your ResponsiveLayout supports it
        title="Connectify"
        isNavigating={isNavigating}
      >
        {/* ✅ PRESERVED - Simple Suspense without extra animations */}
        <Suspense fallback={<PageLoadingFallback type={currentRoute.skeleton} />}>
          <Routes>
            <Route path="/home" element={<HomeFeed />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:userId" element={<ChatView />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/upgrade" element={<UpgradePage />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Suspense>
      </ResponsiveLayout>

      {/* ✅ PRESERVED - Enhanced Post Creation Modal with Animations */}
      <EnhancedPostCreationModal
        isOpen={showCreatePost}
        onClose={handleModalClose}
        onPostCreate={handlePostCreated}
      />

      {/* ✅ PRESERVED - Simplified, faster animations */}
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

// ✅ ENHANCED - Authentication-aware App Routes Component
const AppRoutes = React.memo(() => {
  // ✅ PRESERVED - Memoize landing page fallback to prevent recreation
  const landingPageFallback = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ), []);

  return (
    <Routes>
      {/* ✅ PUBLIC ROUTE - Landing page (redirects to /home if authenticated) */}
      <Route 
        path="/" 
        element={
          <Suspense fallback={landingPageFallback}>
            <LandingPageWrapper />
          </Suspense>
        } 
      />
      
      {/* ✅ PROTECTED ROUTES - All app routes require authentication */}
      <Route 
        path="/*" 
        element={
          <ProtectedRoute requireAuth={true}>
            <AppLayout />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
});

AppRoutes.displayName = 'AppRoutes';

// ✅ ENHANCED - Main App Component with JWT Authentication Provider
const App = React.memo(() => {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="connectify-theme">
        <ToastProvider>
          <Router>
            <div className="App">
              <AppRoutes />
            </div>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
});

App.displayName = 'App';

export default App;