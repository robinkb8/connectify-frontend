// src/components/pages/HomeFeed/components/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, User, Settings, LogOut, X, Moon, Sun } from 'lucide-react';
import { Button } from '../../../ui/Button/Button';
import { useTheme } from '../../../providers/ThemeProvider';

function Sidebar({ isOpen, onClose }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    console.log('Navigating to upgrade page...');
    navigate('/upgrade');
    onClose(); // Close sidebar after navigation
  };

  const menuItems = [
    { icon: Home, label: 'Home', active: true, onClick: null },
    { icon: Search, label: 'Search', active: false, onClick: null },
    { icon: User, label: 'Upgrade profile', active: false, onClick: handleUpgradeClick },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" 
        onClick={onClose} 
      />

      <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Connectify
            </span>
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* NAV */}
        <nav className="p-4 space-y-2 bg-white dark:bg-gray-900">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  item.active 
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 space-y-2">
          
          {/* Toggle Theme */}
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
          >
            {theme === 'dark' ? (
              <Sun className="h-6 w-6 text-yellow-500" />
            ) : (
              <Moon className="h-6 w-6 text-indigo-500" />
            )}
            <span className="font-medium">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Settings */}
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200">
            <Settings className="h-6 w-6" />
            <span className="font-medium">Settings</span>
          </button>

          {/* Logout */}
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-all duration-200">
            <LogOut className="h-6 w-6" />
            <span className="font-medium">Log out</span>
          </button>
          
        </div>
      </div>
    </>
  );
}

export default Sidebar;