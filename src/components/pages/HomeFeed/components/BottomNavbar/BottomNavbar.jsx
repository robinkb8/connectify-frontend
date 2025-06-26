// ===== src/components/pages/HomeFeed/components/BottomNavbar/BottomNavbar.jsx =====
import React, { useState } from 'react';
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { Button } from '../../../../ui/Button/Button';
import CreatePostModal from '../../../../forms/CreatePostModal/CreatePostModal';

function BottomNavbar({ activeTab, onTabChange }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "create", icon: Plus, label: "Create" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  const handleTabClick = (itemId) => {
    if (itemId === "create") {
      setShowCreateModal(true);
    } else {
      onTabChange(itemId);
    }
  };

  const handlePostCreated = (newPost) => {
    setShowCreateModal(false);
    // Optionally trigger a refresh of the feed
    console.log('New post created:', newPost);
  };

  return (
    <>
      {/* ✅ FIXED: Enhanced styling and proper z-index */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-30 shadow-lg">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isCreate = item.id === "create";

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="icon"
                onClick={() => handleTabClick(item.id)}
                className={`
                  relative flex flex-col items-center space-y-1 h-auto py-2 px-3 transition-all duration-200
                  ${
                    isCreate
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg scale-110"
                      : isActive
                        ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
                        : "text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                  }
                `}
              >
                <Icon className={`h-6 w-6 ${isCreate ? "h-5 w-5" : ""}`} />
                <span className={`text-xs font-medium ${isCreate ? "text-xs" : ""}`}>
                  {item.label}
                </span>
                {isActive && !isCreate && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* ✅ Create Post Modal */}
      <CreatePostModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />
    </>
  );
}

export default BottomNavbar;