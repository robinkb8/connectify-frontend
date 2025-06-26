
// ===== src/components/pages/HomeFeed/components/BottomNavbar.jsx =====
import React, { useState } from 'react';
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { Button } from '../../../ui/Button/Button';
import PostCreationModal from '../../../modals/PostCreationModal';

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

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-30">
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
                  relative flex flex-col items-center space-y-1 h-auto py-2 px-3
                  ${
                    isCreate
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full"
                      : isActive
                        ? "text-purple-500"
                        : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <Icon className={`h-6 w-6 ${isCreate ? "h-5 w-5" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && !isCreate && <div className="absolute -bottom-1 w-1 h-1 bg-purple-500 rounded-full"></div>}
              </Button>
            );
          })}
        </div>
      </nav>

      <PostCreationModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </>
  );
}

export default BottomNavbar;