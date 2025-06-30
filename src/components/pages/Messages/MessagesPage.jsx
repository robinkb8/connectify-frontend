// ===== src/components/pages/Messages/MessagesPage.jsx - COMPLETE CONTACTS LIST =====
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus,
  Send,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../../ui/Button/Button';

// ✅ Keep ALL your original mock data
const mockChats = [
  {
    id: "1",
    user: {
      id: "1",
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: null,
      isOnline: true,
      lastSeen: "Online"
    },
    lastMessage: {
      text: "That sounds great! When do you want to start?",
      timestamp: "2:30 PM",
      isOwn: false,
      isRead: true
    },
    unreadCount: 2,
    isPinned: false
  },
  {
    id: "2", 
    user: {
      id: "2",
      name: "Mike Chen",
      username: "mikechen",
      avatar: null,
      isOnline: false,
      lastSeen: "5 min ago"
    },
    lastMessage: {
      text: "Thanks for the help earlier!",
      timestamp: "1:45 PM", 
      isOwn: true,
      isRead: true
    },
    unreadCount: 0,
    isPinned: true
  },
  {
    id: "3",
    user: {
      id: "3", 
      name: "Emma Davis",
      username: "emmad",
      avatar: null,
      isOnline: true,
      lastSeen: "Online"
    },
    lastMessage: {
      text: "Can you send me the files?",
      timestamp: "12:20 PM",
      isOwn: false, 
      isRead: false
    },
    unreadCount: 1,
    isPinned: false
  }
];

// ✅ Enhanced Chat Item Component - Preserved all original styling
const ChatItem = ({ chat, onClick, isMobile = false }) => {
  const { user, lastMessage, unreadCount, isPinned } = chat;

  return (
    <div 
      onClick={() => onClick(chat.id)}
      className="flex items-center space-x-3 p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0 active:scale-[0.98]"
    >
      {/* Avatar with all original styling */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm sm:text-base">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        {user.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
        )}
      </div>

      {/* Content with all original styling and responsive design */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
              {user.name}
            </h3>
            {isPinned && (
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {lastMessage.timestamp}
            </span>
            {unreadCount > 0 && (
              <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                {unreadCount}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1 pr-2">
            {lastMessage.isOwn ? 'You: ' : ''}{lastMessage.text}
          </p>
          {!lastMessage.isRead && !lastMessage.isOwn && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ Enhanced Empty State - Preserved original functionality
const NoMessagesEmpty = ({ onFindPeople }) => (
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
);

// ✅ Main Messages Component - ENHANCED CONTACTS LIST ONLY
function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Preserve responsive detection from original
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Enhanced chat selection with loading state
  const handleChatSelect = (chatId) => {
    setIsLoading(true);
    
    // Small delay for smooth transition feedback
    setTimeout(() => {
      navigate(`/messages/${chatId}`);
      setIsLoading(false);
    }, 150);
  };

  // ✅ Handle find people - Navigate to search
  const handleFindPeople = () => {
    navigate('/search');
  };

  // ✅ Handle new conversation
  const handleNewConversation = () => {
    navigate('/search'); // Or open a modal to select users
  };

  // ✅ Filter chats with enhanced search
  const filteredChats = mockChats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Sort chats: pinned first, then by unread, then by timestamp
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
    if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
    return b.lastMessage.timestamp.localeCompare(a.lastMessage.timestamp);
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      
      {/* ✅ Enhanced Header with all original functionality */}
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
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
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
        
        {/* ✅ Enhanced Search with all original styling */}
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-colors" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* ✅ Results counter */}
        {searchQuery && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {filteredChats.length} {filteredChats.length === 1 ? 'conversation' : 'conversations'} found
          </p>
        )}
      </div>

      {/* ✅ Enhanced Chats List with all original functionality */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {sortedChats.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {sortedChats.map((chat, index) => (
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
            ))}
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
              onClick={() => setSearchQuery('')}
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

      {/* ✅ Preserve all original animation styles */}
      <style jsx>{`
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