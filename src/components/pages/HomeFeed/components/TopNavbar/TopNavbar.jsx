import React, { useState } from 'react';
import { Menu, Bell } from "lucide-react";
import { Button } from '../../../../ui/Button/Button';
import Sidebar from '../Sidebar';
import NotificationPanel from '../../../../ui/NotificationPanel/NotificationPanel'; // ✅ NEW IMPORT

function TopNavbar({ activeTab, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false); // ✅ NEW STATE

  const unreadCount = 3; // Replace with real API data

  if (activeTab !== 'home') return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Connectify
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* ✅ UPDATED: Now functional notification button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
              className={`relative ${notificationPanelOpen ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </nav>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* ✅ NEW: Notification Panel */}
      <NotificationPanel 
        isOpen={notificationPanelOpen} 
        onClose={() => setNotificationPanelOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
}

export default TopNavbar;