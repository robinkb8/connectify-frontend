import React, { useState, useCallback } from 'react';


// ✅ OPTIMIZED: Static icons outside component (no recreation per render)
const ICONS = {
  menu: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  chat: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
};

const TopNavbar = () => {
  // Simple click handlers for now (we'll explain why useCallback later when you see it work)
  const handleMenuClick = useCallback(() => {
    console.log('Menu button clicked!');
  }, []);

  const handleChatClick = useCallback(() => {
    console.log('Chat button clicked!');
  }, []);

   return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Menu Button */}
        <button 
          onClick={handleMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label="Menu"
        >
          {ICONS.menu}
        </button>
        
        {/* Center: Connectify Logo */}
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Connectify
        </h1>
        
        {/* Right: Chat Button with Notification Badge */}
        <button 
          onClick={handleChatClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative"
          aria-label="Messages"
        >
          {ICONS.chat}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;