// src/components/pages/HomeFeed/components/TopNavbar/Sidebar.jsx
import React from 'react';
import { Home, Search, User, Settings, LogOut, X } from 'lucide-react';
import { Button } from '../../../ui/Button/Button';

function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Search, label: 'Search' },
    { icon: User, label: 'Profile' },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-80 bg-white border-r z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Connectify
            </span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100">
            <Settings className="h-6 w-6" />
            <span className="font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-red-500">
            <LogOut className="h-6 w-6" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;