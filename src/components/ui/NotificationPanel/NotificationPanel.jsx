// src/components/ui/NotificationPanel/NotificationPanel.jsx - Auto Mark as Read
import React, { useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Share2, 
  X, 
  Check, 
  Settings,
  Bell,
  AtSign
} from 'lucide-react';
import { Button } from '../Button/Button';
import { NoNotificationsEmpty } from '../EmptyState/EmptyState';
import useNotifications from '../../../hooks/useNotifications';

// Notification Types mapping to icons
const NOTIFICATION_ICONS = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  share: Share2,
  mention: AtSign,
  message: MessageCircle,
  system: Bell
};

// Notification Icon Component
const NotificationIcon = ({ type }) => {
  const Icon = NOTIFICATION_ICONS[type] || Bell;
  
  const iconColors = {
    like: 'text-red-500',
    comment: 'text-blue-500',
    follow: 'text-green-500',
    share: 'text-purple-500',
    mention: 'text-yellow-500',
    message: 'text-indigo-500',
    system: 'text-orange-500'
  };
  
  const fillColors = {
    like: 'fill-current'
  };
  
  return (
    <Icon 
      className={`w-4 h-4 ${iconColors[type] || iconColors.system} ${fillColors[type] || ''}`}
    />
  );
};

// Individual Notification Item
const NotificationItem = ({ notification, onMarkAsRead, onAction }) => {
  const handleClick = () => {
    // Mark as read if not already read
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    
    if (onAction && notification.content_object_data) {
      // Navigate based on notification type
      const { content_object_data, type } = notification;
      let url = '/';
      
      switch (type) {
        case 'like':
        case 'comment':
          if (content_object_data.post) {
            url = `/post/${content_object_data.post.id}`;
          } else if (content_object_data.id) {
            url = `/post/${content_object_data.id}`;
          }
          break;
        case 'follow':
          if (notification.sender) {
            url = `/profile/${notification.sender.username}`;
          }
          break;
        case 'message':
          if (content_object_data.chat_id) {
            url = `/messages/${content_object_data.chat_id}`;
          }
          break;
        default:
          break;
      }
      
      onAction(url);
    }
  };

  const formatContent = () => {
    const { type, sender, content_object_data } = notification;
    
    // For system notifications without sender
    if (!sender) {
      return notification.message;
    }
    
    let action = '';
    let preview = '';
    
    switch (type) {
      case 'like':
        action = 'liked your post';
        if (content_object_data && content_object_data.content) {
          preview = content_object_data.content.length > 50 
            ? content_object_data.content.substring(0, 50) + '...'
            : content_object_data.content;
        }
        break;
      case 'comment':
        action = 'commented on your post';
        if (content_object_data && content_object_data.content) {
          preview = content_object_data.content;
        }
        break;
      case 'follow':
        action = 'started following you';
        break;
      case 'mention':
        action = 'mentioned you in a comment';
        if (content_object_data && content_object_data.content) {
          preview = content_object_data.content;
        }
        break;
      case 'message':
        action = 'sent you a message';
        if (content_object_data && content_object_data.preview) {
          preview = content_object_data.preview;
        }
        break;
      default:
        action = notification.message;
        break;
    }
    
    return { action, preview };
  };

  const { action, preview } = formatContent();

  return (
    <div 
      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
        !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* User Avatar or System Icon */}
        <div className="flex-shrink-0">
          {notification.sender ? (
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
              {notification.sender.avatar ? (
                <img 
                  src={notification.sender.avatar} 
                  alt={notification.sender.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {notification.sender.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <NotificationIcon type={notification.type} />
            </div>
          )}
        </div>

        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <NotificationIcon type={notification.type} />
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
          
          <div className="mt-1">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {notification.sender && (
                <span className="font-semibold">{notification.sender.name} </span>
              )}
              <span className="text-gray-600 dark:text-gray-400">
                {action}
              </span>
            </p>
            
            {/* Preview Content */}
            {preview && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {preview}
              </p>
            )}
            
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {notification.time_since_created}
            </p>
          </div>
        </div>

        {/* Action Button - Only show for unread notifications */}
        <div className="flex-shrink-0">
          {!notification.is_read && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Notification Panel Component
function NotificationPanel({ isOpen, onClose, onNavigate }) {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    filter,
    filteredNotifications,
    markAsRead,
    markAllAsRead,
    changeFilter,
    refreshNotifications,
    clearError,
    retryFetch
  } = useNotifications({
    autoLoad: true,
    autoConnect: true
  });

  // AUTO-MARK ALL UNREAD AS READ WHEN PANEL OPENS
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      // Add a small delay to ensure smooth UX
      const timer = setTimeout(() => {
        markAllAsRead();
      }, 800); // 800ms delay allows user to see notifications before they're marked as read
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, unreadCount, markAllAsRead]);

  // Refresh notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      refreshNotifications();
    }
  }, [isOpen, refreshNotifications]);

  // Handle notification action (navigate to post/profile)
  const handleNotificationAction = (url) => {
    if (onNavigate) {
      onNavigate(url);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
        onClick={onClose} 
      />

      {/* Notification Panel */}
      <div className="fixed top-16 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 max-h-[calc(100vh-5rem)] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  console.log('Open notification settings');
                  // TODO: Navigate to notification settings
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center mt-3 space-x-1">
            <button
              onClick={() => changeFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => changeFilter('unread')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Manual Mark All Read Button (optional) */}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              onClick={markAllAsRead}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 p-0 h-auto"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-red-500 mb-3">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearError();
                  retryFetch();
                }}
              >
                Try Again
              </Button>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onAction={handleNotificationAction}
              />
            ))
          ) : (
            <NoNotificationsEmpty size="medium" />
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button
            variant="ghost"
            onClick={() => {
              console.log('Open notification settings');
              // TODO: Navigate to notification settings
            }}
            className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <Settings className="w-4 h-4 mr-2" />
            Notification Settings
          </Button>
        </div>
      </div>
    </>
  );
}

export default NotificationPanel;