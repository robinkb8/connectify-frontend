// src/components/pages/Messages/MessagesPage.jsx - OPTIMIZED with Redux State Management
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus,
  Send,
  MoreHorizontal,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../ui/Button/Button';
import useMessagingRedux from '../../../hooks/useMessagingRedux';

// OPTIMIZATION 1: Memoized Chat Item Component (Prevents unnecessary re-renders)
const ChatItem = React.memo(({ chat, onClick, isMobile = false }) => {
  const { display_name, participants, last_message, unread_count, other_participant } = chat;

  // Get the display user (for direct messages, use other_participant)
  const displayUser = other_participant || {
    name: display_name || 'Unknown User',
    username: 'unknown',
    avatar: null
  };

  // OPTIMIZATION: Memoized time formatting function
  const formattedTime = useMemo(() => {
    if (!last_message?.created_at) return '';
    
    const date = new Date(last_message.created_at);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }, [last_message?.created_at]);

  // OPTIMIZATION: Memoized avatar letter calculation
  const avatarLetter = useMemo(() => {
    const name = displayUser.full_name || displayUser.name || displayUser.username || 'U';
    return name.charAt(0).toUpperCase();
  }, [displayUser.full_name, displayUser.name, displayUser.username]);

  // OPTIMIZATION: Memoized click handler to prevent function recreation
  const handleClick = useCallback(() => {
    onClick(chat.id);
  }, [onClick, chat.id]);

  return (
    <div 
      onClick={handleClick}
      className="flex items-center space-x-3 p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0 active:scale-[0.98]"
    >
      {/* Avatar with original styling */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          {displayUser.avatar ? (
            <img 
              src={displayUser.avatar} 
              alt={displayUser.full_name || displayUser.name || displayUser.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-sm sm:text-base">
              {avatarLetter}
            </span>
          )}
        </div>
        {/* Online status - placeholder for future online status feature */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
      </div>

      {/* Content with original styling and responsive design */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
              {displayUser.full_name || displayUser.name || displayUser.username}
            </h3>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {last_message && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formattedTime}
              </span>
            )}
            {unread_count > 0 && (
              <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                {unread_count}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1 pr-2">
            {last_message ? (
              <>
                {last_message.is_own_message ? 'You: ' : ''}{last_message.content || 'Media message'}
              </>
            ) : (
              'No messages yet'
            )}
          </p>
          {last_message && !last_message.is_own_message && last_message.delivery_status?.status !== 'read' && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></div>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // OPTIMIZATION: Custom comparison function for better performance
  const prev = prevProps.chat;
  const next = nextProps.chat;
  
  return (
    prev.id === next.id &&
    prev.last_activity === next.last_activity &&
    prev.unread_count === next.unread_count &&
    prev.last_message?.id === next.last_message?.id &&
    prev.last_message?.content === next.last_message?.content &&
    prevProps.isMobile === nextProps.isMobile
  );
});

// OPTIMIZATION 2: Memoized Error State Component
const ErrorState = React.memo(({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
      <AlertCircle className="w-8 h-8 text-red-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Something went wrong
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
      {error || 'Failed to load conversations. Please try again.'}
    </p>
    <Button 
      onClick={onRetry}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center space-x-2"
    >
      <RefreshCw className="w-4 h-4" />
      <span>Try Again</span>
    </Button>
  </div>
));

// OPTIMIZATION 3: Memoized Loading State Component
const LoadingState = React.memo(() => (
  <div className="p-4">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="flex items-center space-x-3 p-4 border-b border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    ))}
  </div>
));

// OPTIMIZATION 4: Memoized Empty State Component
const NoMessagesEmpty = React.memo(({ onFindPeople }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
      <Send className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
    </div>
    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
      No conversations yet
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
      Start a conversation with someone or find people to connect with.
    </p>
    <Button 
      onClick={onFindPeople}
      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
    >
      Find People
    </Button>
  </div>
));

// OPTIMIZATION 5: Main Messages Component - HIGHLY OPTIMIZED with Redux
function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Use the Redux messaging hook
  const {
    chats,
    isLoading,
    error,
    loadChats,
    selectChat,
    clearError
  } = useMessagingRedux();

  // OPTIMIZATION 6: Memoized responsive detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // OPTIMIZATION 7: Memoized chat selection handler (prevents recreation on every render)
  const handleChatSelect = useCallback((chatId) => {
    console.log('🔍 DEBUG: Chat selected:', {
      chatId: chatId,
      idType: typeof chatId,
    });
    
    try {
      navigate(`/messages/${chatId}`);
    } catch (error) {
      console.error('Error selecting chat:', error);
    }
  }, [navigate]);

  // OPTIMIZATION 8: Memoized action handlers
  const handleFindPeople = useCallback(() => {
    navigate('/search');
  }, [navigate]);

  const handleNewConversation = useCallback(() => {
    navigate('/search');
  }, [navigate]);

  const handleRetry = useCallback(() => {
    clearError();
    loadChats();
  }, [clearError, loadChats]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // OPTIMIZATION 9: Memoized search input handler
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // OPTIMIZATION 10: Memoized and highly optimized chat filtering and sorting
  const processedChats = useMemo(() => {
    console.log('🚀 OPTIMIZATION: Processing chats (only when chats or searchQuery changes)');
    
    // Filter chats based on search query
    let filtered = chats;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = chats.filter(chat => {
        const displayName = chat.display_name || '';
        const otherUser = chat.other_participant || {};
        const lastMessage = chat.last_message || {};
        
        return (
          displayName.toLowerCase().includes(searchLower) ||
          (otherUser.username || '').toLowerCase().includes(searchLower) ||
          (otherUser.full_name || '').toLowerCase().includes(searchLower) ||
          (lastMessage.content || '').toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort chats: unread first, then by last activity
    // FIXED: Create copy before sorting to avoid mutating immutable Redux state
    return [...filtered].sort((a, b) => {
      // First, sort by unread count (unread messages first)
      if (a.unread_count !== b.unread_count) {
        return b.unread_count - a.unread_count;
      }
      
      // Then sort by last activity (most recent first)
      const aTime = a.last_activity || a.created_at || 0;
      const bTime = b.last_activity || b.created_at || 0;
      return new Date(bTime) - new Date(aTime);
    });
  }, [chats, searchQuery]);

  // OPTIMIZATION 11: Memoized chat items with animation delays
  const chatItems = useMemo(() => {
    console.log('🚀 OPTIMIZATION: Rendering chat items (only when processedChats or handlers change)');
    
    return processedChats.map((chat, index) => (
      <div
        key={chat.id}
        className="animate-slideUp"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <ChatItem
          chat={chat}
          onClick={handleChatSelect}
          isMobile={isMobile}
        />
      </div>
    ));
  }, [processedChats, handleChatSelect, isMobile]);

  // OPTIMIZATION 12: Memoized search results info
  const searchInfo = useMemo(() => {
    if (!searchQuery || isLoading) return null;
    
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {processedChats.length} {processedChats.length === 1 ? 'conversation' : 'conversations'} found
      </p>
    );
  }, [searchQuery, isLoading, processedChats.length]);

  // OPTIMIZATION 13: Memoized error display
  const errorDisplay = useMemo(() => {
    if (!error) return null;
    
    return (
      <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }, [error]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      
      {/* Enhanced Header with all original functionality */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Messages
          </h1>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 hover:scale-105"
              onClick={handleNewConversation}
              title="Start new conversation"
              disabled={isLoading}
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 hover:scale-105"
              onClick={handleRetry}
              title="Refresh conversations"
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 hover:scale-105"
              title="More options"
            >
              <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>
        
        {/* Enhanced Search with all original styling */}
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-colors" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
            disabled={isLoading}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Results counter */}
        {searchInfo}

        {/* Error message */}
        {errorDisplay}
      </div>

      {/* OPTIMIZED: Enhanced Chats List with memoized rendering */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && chats.length === 0 ? (
          <LoadingState />
        ) : error && chats.length === 0 ? (
          <ErrorState error={error} onRetry={handleRetry} />
        ) : processedChats.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {chatItems}
          </div>
        ) : searchQuery ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No conversations found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No conversations match "{searchQuery}"
            </p>
            <Button
              onClick={handleClearSearch}
              variant="ghost"
              className="text-blue-600 hover:text-blue-700"
            >
              Clear search
            </Button>
          </div>
        ) : (
          <NoMessagesEmpty onFindPeople={handleFindPeople} />
        )}
      </div>

      {/* Preserve all original animation styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default MessagesPage;