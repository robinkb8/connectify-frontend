 
// ===== src/components/ui/NotificationPanel/NotificationPanel.jsx =====
import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Share2, 
  X, 
  Check, 
  MoreHorizontal,
  Settings,
  Bell
} from 'lucide-react';
import { Button } from '../Button/Button';
import { NoNotificationsEmpty } from '../EmptyState/EmptyState';

// ✅ Notification Types & Mock Data
const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  SHARE: 'share',
  MENTION: 'mention',
  SYSTEM: 'system'
};

const mockNotifications = [
  {
    id: '1',
    type: NOTIFICATION_TYPES.LIKE,
    user: {
      name: 'Sarah Johnson',
      username: 'sarahj',
      avatar: null
    },
    content: 'liked your post',
    postPreview: 'Just finished an amazing coding session! 🚀',
    timestamp: '2 min ago',
    read: false,
    actionUrl: '/post/123'
  },
  {
    id: '2',
    type: NOTIFICATION_TYPES.COMMENT,
    user: {
      name: 'Mike Chen',
      username: 'mikechen',
      avatar: null
    },
    content: 'commented on your post',
    commentPreview: 'This looks amazing! Great work 👏',
    timestamp: '5 min ago',
    read: false,
    actionUrl: '/post/456'
  },
  {
    id: '3',
    type: NOTIFICATION_TYPES.FOLLOW,
    user: {
      name: 'Alex Rivera',
      username: 'alexr',
      avatar: null
    },
    content: 'started following you',
    timestamp: '1h ago',
    read: true,
    actionUrl: '/profile/alexr'
  },
  {
    id: '4',
    type: NOTIFICATION_TYPES.SHARE,
    user: {
      name: 'Emma Davis',
      username: 'emmad',
      avatar: null
    },
    content: 'shared your post',
    postPreview: 'Why Choose Connectify? Experience the next...',
    timestamp: '3h ago',
    read: true,
    actionUrl: '/post/789'
  },
  {
    id: '5',
    type: NOTIFICATION_TYPES.SYSTEM,
    content: 'Welcome to Connectify! Complete your profile to get started.',
    timestamp: '1d ago',
    read: false,
    actionUrl: '/profile/edit'
  }
];

// ✅ Notification Icon Component
const NotificationIcon = ({ type }) => {
  const iconProps = { className: "w-4 h-4" };
  
  switch (type) {
    case NOTIFICATION_TYPES.LIKE:
      return <Heart className="w-4 h-4 text-red-500" fill="currentColor" />;
    case NOTIFICATION_TYPES.COMMENT:
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case NOTIFICATION_TYPES.FOLLOW:
      return <UserPlus className="w-4 h-4 text-green-500" />;
    case NOTIFICATION_TYPES.SHARE:
      return <Share2 className="w-4 h-4 text-purple-500" />;
    case NOTIFICATION_TYPES.SYSTEM:
      return <Bell className="w-4 h-4 text-orange-500" />;
    default:
      return <Bell {...iconProps} />;
  }
};

// ✅ Individual Notification Item
const NotificationItem = ({ notification, onMarkAsRead, onAction }) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (onAction) {
      onAction(notification.actionUrl);
    }
  };

  return (
    <div 
      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* User Avatar or System Icon */}
        <div className="flex-shrink-0">
          {notification.user ? (
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {notification.user.name.charAt(0)}
              </span>
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
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
          
          <div className="mt-1">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {notification.user && (
                <span className="font-semibold">{notification.user.name} </span>
              )}
              <span className="text-gray-600 dark:text-gray-400">
                {notification.content}
              </span>
            </p>
            
            {/* Preview Content */}
            {(notification.postPreview || notification.commentPreview) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {notification.postPreview || notification.commentPreview}
              </p>
            )}
            
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {notification.timestamp}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {!notification.read && (
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

// ✅ Main Notification Panel Component
function NotificationPanel({ isOpen, onClose, onNavigate }) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || (filter === 'unread' && !notification.read)
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark single notification as read
  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

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
                onClick={() => {/* TODO: Open notification settings */}}
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
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 p-0 h-auto"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
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
              /* TODO: Navigate to notification settings */
              console.log('Open notification settings');
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