// ===== src/App.js - WITH SMOOTH NAVIGATION FIXES =====
import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { ToastProvider } from './components/ui/Toast';
import ChatView from './components/pages/Messages/ChatView';

// ✅ Animation Components
import PageTransition from './components/ui/PageTransition/PageTransition';
import { PageSkeleton, SkeletonStyles } from './components/ui/Skeleton/Skeleton';
import { ButtonAnimationStyles } from './components/ui/AnimatedButton/AnimatedButton';

// ✅ Import ResponsiveLayout (Your Original System)
import ResponsiveLayout from './components/layout/ResponsiveLayout';

// ✅ Import Enhanced Post Creation Modal
import EnhancedPostCreationModal from './components/modals/EnhancedPostCreationModal';

// ✅ Lazy-loaded Pages for better performance
const LandingPage = React.lazy(() => import('./components/pages/LandingPage'));
const HomeFeed = React.lazy(() => import('./components/pages/HomeFeed'));
const SearchPage = React.lazy(() => import('./components/pages/Search'));
const MessagesPage = React.lazy(() => import('./components/pages/Messages'));
const UserProfile = React.lazy(() => import('./components/pages/Profile'));
const SettingsPage = React.lazy(() => import('./components/pages/Settings'));
const UpgradePage = React.lazy(() => import('./components/pages/UpgradePage'));



// ✅ Enhanced Loading Component with skeleton
const PageLoadingFallback = ({ type = "feed" }) => (
  <div className="h-full w-full">
    <PageSkeleton type={type} />
  </div>
);

// ✅ Route Configuration with loading states
const routeConfig = [
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

// ✅ Main App Layout Component with Enhanced Animations
function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ State Management with loading states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isNavigating, setIsNavigating] = useState(false);
  
  // ✅ Mock User Data (replace with real auth)
  const user = {
    name: 'Your Name',
    username: 'yourusername'
  };

  // ✅ Determine active tab from current route with animation
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

  // ✅ FIXED: Fast Tab Change with smooth navigation
  const handleTabChange = (tab) => {
    if (tab === activeTab) return; // Prevent unnecessary navigation
    
    // ✅ Immediate state updates for smooth feel
    setActiveTab(tab);
    
    // ✅ Very brief loading state (50ms only)
    setIsNavigating(true);
    setTimeout(() => setIsNavigating(false), 50);
    
    // Navigate based on tab
    const routes = {
      home: '/home',
      search: '/search',
      messages: '/messages',
      profile: '/profile',
      settings: '/settings',    
      upgrade: '/upgrade',
    };
    
    if (routes[tab]) {
      navigate(routes[tab]);
    }
  };

  // ✅ Enhanced Create Post with loading feedback
  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  // ✅ Handle Post Created with smooth feedback
  const handlePostCreated = () => {
    setShowCreatePost(false);
    // Optional: refresh feed or show success animation
    console.log('✅ Post created successfully!');
  };

  // ✅ Get current route config for transition type
  const getCurrentRouteConfig = () => {
    return routeConfig.find(route => 
      location.pathname.startsWith(route.path)
    ) || { transition: 'fade', skeleton: 'feed' };
  };

  const currentRoute = getCurrentRouteConfig();

  return (
    <>
      {/* ✅ Global Animation Styles */}
      <SkeletonStyles />
      <ButtonAnimationStyles />
      
      {/* ✅ FIXED: Simplified Layout without conflicting animations */}
      <ResponsiveLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreatePost={handleCreatePost}
        user={user}
        title="Connectify"
        isNavigating={isNavigating}
      >
        {/* ✅ FIXED: Simple Suspense without extra animations */}
        <Suspense fallback={<PageLoadingFallback type={currentRoute.skeleton} />}>
  <Routes>
    <Route path="/home" element={<HomeFeed />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/messages" element={<MessagesPage />} />
    <Route path="/messages/:userId" element={<ChatView />} />  {/* ✅ MOVED BEFORE WILDCARD */}
    <Route path="/profile" element={<UserProfile />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/upgrade" element={<UpgradePage />} />
    <Route path="*" element={<HomeFeed />} />  {/* ✅ WILDCARD ROUTE LAST */}
  </Routes>
</Suspense>
      </ResponsiveLayout>

      {/* ✅ Enhanced Post Creation Modal with Animations */}
      <EnhancedPostCreationModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreate={handlePostCreated}
      />

      {/* ✅ FIXED: Simplified, faster animations */}
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
}

// ✅ Main App Component with Enhanced Performance
function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="connectify-theme">
      <ToastProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Landing page (no layout, with its own animations) */}
              <Route 
                path="/" 
                element={
                  <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  }>
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
}

export default App;