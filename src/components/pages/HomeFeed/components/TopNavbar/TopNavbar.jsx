// src/components/pages/HomeFeed/components/TopNavbar/TopNavbar.jsx
import React, { useState } from 'react';
import { Menu, Bell } from "lucide-react";
import { Button } from '../../../../ui/Button/Button';
import Sidebar from '../Sidebar';

function TopNavbar({ activeTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Only show TopNavbar on home section
  const shouldShowNavbar = activeTab === 'home';

  // If navbar shouldn't be shown, return null
  if (!shouldShowNavbar) {
    return null;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Menu className="h-6 w-6" />
            </Button>

            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Connectify
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </nav>
      {/* ✅ Sidebar with higher z-index */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

export default TopNavbar;