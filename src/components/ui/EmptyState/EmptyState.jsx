 
// ===== src/components/ui/EmptyState/EmptyState.jsx =====
import React from 'react';
import { 
  Home,
  Search,
  MessageCircle,
  Bell,
  User,
  Heart,
  Camera,
  Users,
  Wifi,
  AlertCircle,
  RefreshCw,
  Plus,
  Inbox,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../Button/Button';

// ✅ Empty State Types
export const EMPTY_STATE_TYPES = {
  NO_POSTS: 'no_posts',
  NO_MESSAGES: 'no_messages',
  NO_NOTIFICATIONS: 'no_notifications',
  NO_SEARCH_RESULTS: 'no_search_results',
  NO_FOLLOWERS: 'no_followers',
  NO_FOLLOWING: 'no_following',
  NO_LIKES: 'no_likes',
  NO_COMMENTS: 'no_comments',
  NO_PHOTOS: 'no_photos',
  NETWORK_ERROR: 'network_error',
  LOADING_ERROR: 'loading_error',
  PERMISSION_DENIED: 'permission_denied',
  FIRST_TIME_USER: 'first_time_user',
  MAINTENANCE: 'maintenance'
};

// ✅ Empty State Configurations
const EMPTY_STATE_CONFIG = {
  [EMPTY_STATE_TYPES.NO_POSTS]: {
    icon: FileText,
    title: "No posts yet",
    description: "When you start sharing posts, they'll appear here.",
    primaryAction: {
      label: "Create your first post",
      icon: Plus,
      variant: "default"
    },
    illustration: "📝"
  },
  
  [EMPTY_STATE_TYPES.NO_MESSAGES]: {
    icon: MessageCircle,
    title: "No messages yet",
    description: "Start a conversation with someone to see your messages here.",
    primaryAction: {
      label: "Find people to message",
      icon: Users,
      variant: "default"
    },
    illustration: "💬"
  },
  
  [EMPTY_STATE_TYPES.NO_NOTIFICATIONS]: {
    icon: Bell,
    title: "No notifications",
    description: "When you get likes, comments, or follows, they'll show up here.",
    illustration: "🔔"
  },
  
  [EMPTY_STATE_TYPES.NO_SEARCH_RESULTS]: {
    icon: Search,
    title: "No results found",
    description: "Try searching for something else or check your spelling.",
    primaryAction: {
      label: "Clear search",
      icon: RefreshCw,
      variant: "outline"
    },
    illustration: "🔍"
  },
  
  [EMPTY_STATE_TYPES.NO_FOLLOWERS]: {
    icon: Users,
    title: "No followers yet",
    description: "Share interesting content to attract followers.",
    primaryAction: {
      label: "Create a post",
      icon: Plus,
      variant: "default"
    },
    illustration: "👥"
  },
  
  [EMPTY_STATE_TYPES.NO_FOLLOWING]: {
    icon: Users,
    title: "Not following anyone",
    description: "Discover and follow people to see their posts in your feed.",
    primaryAction: {
      label: "Discover people",
      icon: Search,
      variant: "default"
    },
    illustration: "🌟"
  },
  
  [EMPTY_STATE_TYPES.NO_LIKES]: {
    icon: Heart,
    title: "No likes yet",
    description: "Posts you like will appear here.",
    primaryAction: {
      label: "Explore posts",
      icon: Search,
      variant: "default"
    },
    illustration: "❤️"
  },
  
  [EMPTY_STATE_TYPES.NO_COMMENTS]: {
    icon: MessageCircle,
    title: "No comments yet",
    description: "Be the first to comment on this post!",
    primaryAction: {
      label: "Add a comment",
      icon: MessageCircle,
      variant: "default"
    },
    illustration: "💭"
  },
  
  [EMPTY_STATE_TYPES.NO_PHOTOS]: {
    icon: ImageIcon,
    title: "No photos yet",
    description: "Share your moments by adding photos to your posts.",
    primaryAction: {
      label: "Add a photo",
      icon: Camera,
      variant: "default"
    },
    illustration: "📸"
  },
  
  [EMPTY_STATE_TYPES.NETWORK_ERROR]: {
    icon: Wifi,
    title: "Connection problem",
    description: "Check your internet connection and try again.",
    primaryAction: {
      label: "Retry",
      icon: RefreshCw,
      variant: "default"
    },
    illustration: "📡",
    isError: true
  },
  
  [EMPTY_STATE_TYPES.LOADING_ERROR]: {
    icon: AlertCircle,
    title: "Something went wrong",
    description: "We couldn't load this content. Please try again.",
    primaryAction: {
      label: "Try again",
      icon: RefreshCw,
      variant: "default"
    },
    secondaryAction: {
      label: "Report issue",
      variant: "ghost"
    },
    illustration: "⚠️",
    isError: true
  },
  
  [EMPTY_STATE_TYPES.PERMISSION_DENIED]: {
    icon: AlertCircle,
    title: "Access denied",
    description: "You don't have permission to view this content.",
    primaryAction: {
      label: "Go back",
      icon: Home,
      variant: "default"
    },
    illustration: "🔒",
    isError: true
  },
  
  [EMPTY_STATE_TYPES.FIRST_TIME_USER]: {
    icon: Users,
    title: "Welcome to Connectify!",
    description: "Start by following some people or creating your first post.",
    primaryAction: {
      label: "Create your first post",
      icon: Plus,
      variant: "default"
    },
    secondaryAction: {
      label: "Find people to follow",
      icon: Search,
      variant: "outline"
    },
    illustration: "🎉"
  },
  
  [EMPTY_STATE_TYPES.MAINTENANCE]: {
    icon: AlertCircle,
    title: "Under maintenance",
    description: "We're making some improvements. Please check back soon.",
    illustration: "🔧",
    isError: true
  }
};

// ✅ Main Empty State Component
function EmptyState({ 
  type, 
  title, 
  description, 
  illustration,
  primaryAction,
  secondaryAction,
  className = "",
  size = "medium" // "small", "medium", "large"
}) {
  const config = EMPTY_STATE_CONFIG[type] || {};
  
  // Use props or fall back to config
  const finalTitle = title || config.title || "No content";
  const finalDescription = description || config.description;
  const finalIllustration = illustration || config.illustration;
  const finalPrimaryAction = primaryAction || config.primaryAction;
  const finalSecondaryAction = secondaryAction || config.secondaryAction;
  const isError = config.isError || false;
  
  // Size configurations
  const sizeConfig = {
    small: {
      container: "py-8",
      illustration: "text-4xl",
      icon: "w-8 h-8",
      title: "text-lg",
      description: "text-sm",
      spacing: "space-y-3"
    },
    medium: {
      container: "py-12",
      illustration: "text-6xl",
      icon: "w-12 h-12",
      title: "text-xl",
      description: "text-base",
      spacing: "space-y-4"
    },
    large: {
      container: "py-16",
      illustration: "text-8xl",
      icon: "w-16 h-16",
      title: "text-2xl",
      description: "text-lg",
      spacing: "space-y-6"
    }
  };
  
  const currentSize = sizeConfig[size] || sizeConfig.medium;
  const IconComponent = config.icon;

  return (
    <div className={`text-center ${currentSize.container} ${className}`}>
      <div className={`flex flex-col items-center ${currentSize.spacing}`}>
        
        {/* Illustration or Icon */}
        <div className="flex flex-col items-center space-y-4">
          {finalIllustration && (
            <div className={`${currentSize.illustration} mb-2`}>
              {finalIllustration}
            </div>
          )}
          
          {IconComponent && (
            <div className={`p-3 rounded-full ${
              isError 
                ? 'bg-red-100 dark:bg-red-900/20' 
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <IconComponent className={`${currentSize.icon} ${
                isError 
                  ? 'text-red-500 dark:text-red-400' 
                  : 'text-gray-400 dark:text-gray-500'
              }`} />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className={`font-semibold ${currentSize.title} ${
          isError 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-gray-900 dark:text-white'
        }`}>
          {finalTitle}
        </h3>

        {/* Description */}
        {finalDescription && (
          <p className={`${currentSize.description} text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed`}>
            {finalDescription}
          </p>
        )}

        {/* Actions */}
        {(finalPrimaryAction || finalSecondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-2">
            {finalPrimaryAction && (
              <Button
                onClick={finalPrimaryAction.onClick}
                variant={finalPrimaryAction.variant || "default"}
                className={`${
                  finalPrimaryAction.variant === "default" 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : ""
                }`}
              >
                {finalPrimaryAction.icon && (
                  <finalPrimaryAction.icon className="w-4 h-4 mr-2" />
                )}
                {finalPrimaryAction.label}
              </Button>
            )}
            
            {finalSecondaryAction && (
              <Button
                onClick={finalSecondaryAction.onClick}
                variant={finalSecondaryAction.variant || "ghost"}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                {finalSecondaryAction.icon && (
                  <finalSecondaryAction.icon className="w-4 h-4 mr-2" />
                )}
                {finalSecondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Specialized Empty State Components for common use cases

export const NoPostsEmpty = ({ onCreatePost, size = "medium" }) => (
  <EmptyState
    type={EMPTY_STATE_TYPES.NO_POSTS}
    primaryAction={{
      ...EMPTY_STATE_CONFIG[EMPTY_STATE_TYPES.NO_POSTS].primaryAction,
      onClick: onCreatePost
    }}
    size={size}
  />
);

export const NoMessagesEmpty = ({ onFindPeople, size = "medium" }) => (
  <EmptyState
    type={EMPTY_STATE_TYPES.NO_MESSAGES}
    primaryAction={{
      ...EMPTY_STATE_CONFIG[EMPTY_STATE_TYPES.NO_MESSAGES].primaryAction,
      onClick: onFindPeople
    }}
    size={size}
  />
);

export const NoNotificationsEmpty = ({ size = "medium" }) => (
  <EmptyState
    type={EMPTY_STATE_TYPES.NO_NOTIFICATIONS}
    size={size}
  />
);

export const NoSearchResultsEmpty = ({ onClearSearch, searchQuery, size = "medium" }) => (
  <EmptyState
    type={EMPTY_STATE_TYPES.NO_SEARCH_RESULTS}
    description={searchQuery ? `No results found for "${searchQuery}"` : "Try searching for something else."}
    primaryAction={{
      ...EMPTY_STATE_CONFIG[EMPTY_STATE_TYPES.NO_SEARCH_RESULTS].primaryAction,
      onClick: onClearSearch
    }}
    size={size}
  />
);

export const NetworkErrorEmpty = ({ onRetry, size = "medium" }) => (
  <EmptyState
    type={EMPTY_STATE_TYPES.NETWORK_ERROR}
    primaryAction={{
      ...EMPTY_STATE_CONFIG[EMPTY_STATE_TYPES.NETWORK_ERROR].primaryAction,
      onClick: onRetry
    }}
    size={size}
  />
);

export const LoadingErrorEmpty = ({ onRetry, onReportIssue, size = "medium" }) => (
  <EmptyState
    type={EMPTY_STATE_TYPES.LOADING_ERROR}
    primaryAction={{
      ...EMPTY_STATE_CONFIG[EMPTY_STATE_TYPES.LOADING_ERROR].primaryAction,
      onClick: onRetry
    }}
    secondaryAction={{
      ...EMPTY_STATE_CONFIG[EMPTY_STATE_TYPES.LOADING_ERROR].secondaryAction,
      onClick: onReportIssue
    }}
    size={size}
  />
);

export const FirstTimeUserEmpty = ({ onCreatePost, onFindPeople, size = "large" }) => (
  <EmptyState
    type={EMPTY_STATE_TYPES.FIRST_TIME_USER}
    primaryAction={{
      ...EMPTY_STATE_CONFIG[EMPTY_STATE_TYPES.FIRST_TIME_USER].primaryAction,
      onClick: onCreatePost
    }}
    secondaryAction={{
      ...EMPTY_STATE_CONFIG[EMPTY_STATE_TYPES.FIRST_TIME_USER].secondaryAction,
      onClick: onFindPeople
    }}
    size={size}
  />
);

// ✅ Loading State Component for better UX
export const LoadingState = ({ message = "Loading...", size = "medium" }) => {
  const sizeConfig = {
    small: { spinner: "w-6 h-6", text: "text-sm" },
    medium: { spinner: "w-8 h-8", text: "text-base" },
    large: { spinner: "w-12 h-12", text: "text-lg" }
  };
  
  const currentSize = sizeConfig[size] || sizeConfig.medium;
  
  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <div className={`${currentSize.spinner} border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin`}></div>
        <p className={`${currentSize.text} text-gray-500 dark:text-gray-400`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;