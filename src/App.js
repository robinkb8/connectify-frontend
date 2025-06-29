// ===== src/App.js - RESTORED ORIGINAL DESIGN =====
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { ToastProvider } from './components/ui/Toast';

// ✅ Import ResponsiveLayout (Your Original System)
import ResponsiveLayout from './components/layout/ResponsiveLayout';

// ✅ Import Enhanced Post Creation Modal
import EnhancedPostCreationModal from './components/modals/EnhancedPostCreationModal';

// ✅ Import Pages
import LandingPage from './components/pages/LandingPage';
import HomeFeed from './components/pages/HomeFeed';
import SearchPage from './components/pages/Search';
import MessagesPage from './components/pages/Messages';
import UserProfile from './components/pages/Profile';
import SettingsPage from './components/pages/Settings';
import UpgradePage from './components/pages/UpgradePage';

// ✅ Main App Layout Component (Your Original Design)
function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ State Management
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  // ✅ Mock User Data (replace with real auth)
  const user = {
    name: 'Your Name',
    username: 'yourusername'
  };

  // ✅ Determine active tab from current route
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/home' || path === '/') setActiveTab('home');
    else if (path.startsWith('/search')) setActiveTab('search');
    else if (path.startsWith('/messages')) setActiveTab('messages');
    else if (path.startsWith('/profile')) setActiveTab('profile');
    else if (path.startsWith('/notifications')) setActiveTab('notifications');
    else setActiveTab('home');
  }, [location.pathname]);

  // ✅ Handle tab navigation (Your Original Logic)
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Navigate to appropriate route
    switch (tabId) {
      case 'home':
        navigate('/home');
        break;
      case 'search':
        navigate('/search');
        break;
      case 'messages':
        navigate('/messages');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'upgrade':
        navigate('/upgrade');
        break;
      case 'logout':
        // Handle logout
        navigate('/');
        break;
      default:
        navigate('/home');
    }
  };

  // ✅ Handle post creation
  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  // ✅ Handle new post created
  const handlePostCreated = (newPost) => {
    console.log('New post created:', newPost);
    // Redirect to home if not already there
    if (location.pathname !== '/home') {
      navigate('/home');
    }
  };

  // ✅ Don't show layout on landing page
  if (location.pathname === '/') {
    return <LandingPage />;
  }

  return (
    <>
      {/* ✅ Your Original ResponsiveLayout with Bottom Nav & Hamburger */}
      <ResponsiveLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreatePost={handleCreatePost}
        user={user}
        title="Connectify"
      >
        {/* ✅ Page Content */}
        <Routes>
          <Route path="/home" element={<HomeFeed />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/upgrade" element={<UpgradePage />} />
          
          {/* Redirect root to home for authenticated users */}
          <Route path="*" element={<HomeFeed />} />
        </Routes>
      </ResponsiveLayout>

      {/* ✅ Enhanced Post Creation Modal */}
      <EnhancedPostCreationModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreate={handlePostCreated}
      />
    </>
  );
}

// ✅ Main App Component (Your Original Structure)
function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="connectify-theme">
      <ToastProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Landing page (no layout) */}
              <Route path="/" element={<LandingPage />} />
              
              {/* All other routes use the layout */}
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;