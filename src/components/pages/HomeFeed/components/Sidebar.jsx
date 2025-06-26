 

// ===== src/components/pages/HomeFeed/components/Sidebar.jsx =====
import React, { useState } from 'react';
import { X, Moon, Sun, HelpCircle, Crown, Settings, LogOut } from "lucide-react";
import { Button } from '../../../ui/Button/Button';
import { Switch } from '../../../ui/Switch/Switch';
import { useTheme } from '../../../providers/ThemeProvider';

function Sidebar({ isOpen, onClose }) {
  const { theme, setTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <div
        className={`
        fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Connectify
            </span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-purple-400" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-400" />
              )}
              <span className="font-medium">Dark Mode</span>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <HelpCircle className="h-5 w-5 mr-3" />
            Help & Support
          </Button>

          <Button
            variant="ghost"
            onClick={() => setShowUpgrade(true)}
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Crown className="h-5 w-5 mr-3 text-yellow-400" />
            Upgrade Account
          </Button>

          <Button
            variant="ghost"
            onClick={() => setShowSettings(true)}
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Button>

          <div className="pt-6 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;