import React, { useState, useCallback } from 'react';



// ✅ OPTIMIZED: Static icons outside component (no recreation per render)
const ICONS = {
  home: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  search: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  plus: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  chat: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  user: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
};
const BottomNavbar = () => {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
    console.log('Navigate to:', tab);
  }, []);

    return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {/* Home Tab */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors duration-200 ${
            activeTab === 'home' ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {ICONS.home}
          <span className="text-xs">Home</span>
        </button>

        {/* Search Tab */}
        <button
          onClick={() => handleTabClick('search')}
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors duration-200 ${
            activeTab === 'search' ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {ICONS.search}
          <span className="text-xs">Search</span>
        </button>

        {/* Create Button (Special) */}
        <button
          onClick={() => handleTabClick('create')}
          className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          {ICONS.plus}
        </button>

        {/* Chat Tab */}
        <button
          onClick={() => handleTabClick('chat')}
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors duration-200 ${
            activeTab === 'chat' ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {ICONS.chat}
          <span className="text-xs">Chat</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors duration-200 ${
            activeTab === 'profile' ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {ICONS.user}
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavbar;