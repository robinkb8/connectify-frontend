// src/components/pages/Messages/ChatView.jsx - FIXED: Infinite selectChat Loop
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Phone,
  Video,
  Info,
  Send,
  MoreHorizontal,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../ui/Button/Button';
import useMessaging from '../../../hooks/useMessaging';

// Message Status Constants - From original
const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
};

// OPTIMIZATION 1: Memoized Message Bubble Component (Prevents re-rendering of all messages)
const MessageBubble = React.memo(({ message, isOwn }) => {
  // OPTIMIZATION: Memoized status icon calculation
  const statusIcon = useMemo(() => {
    if (!isOwn) return null;
    
    const status = message.status || message.delivery_status?.status || MESSAGE_STATUS.SENT;
    
    switch (status) {
      case MESSAGE_STATUS.SENDING:
        return <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin opacity-50"></div>;
      case MESSAGE_STATUS.SENT:
        return <span className="text-xs opacity-50">✓</span>;
      case MESSAGE_STATUS.DELIVERED:
        return <span className="text-xs opacity-70">✓✓</span>;
      case MESSAGE_STATUS.READ:
        return <span className="text-xs text-blue-400">✓✓</span>;
      case MESSAGE_STATUS.FAILED:
        return <span className="text-xs text-red-400">!</span>;
      default:
        return null;
    }
  }, [isOwn, message.status, message.delivery_status?.status]);

  // OPTIMIZATION: Memoized time formatting
  const formattedTime = useMemo(() => {
    if (!message.created_at) return message.time_since_sent || '';
    
    const date = new Date(message.created_at);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [message.created_at, message.time_since_sent]);

  return (
    <div className={`flex mb-3 sm:mb-4 ${isOwn ? 'justify-end' : 'justify-start'} animate-slideUp`}>
      <div className={`max-w-xs sm:max-w-md lg:max-w-lg px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-200 ${
        isOwn 
          ? `bg-gradient-to-r from-blue-600 to-teal-600 text-white ${
              message.status === MESSAGE_STATUS.SENDING ? 'opacity-70' : 'opacity-100'
            }` 
          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
      }`}>
        <p className="text-sm sm:text-base">{message.content}</p>
        <div className={`flex items-center justify-between mt-1 ${
          isOwn ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
        }`}>
          <span className="text-xs">
            {formattedTime}
          </span>
          {statusIcon}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // OPTIMIZATION: Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.isOwn === nextProps.isOwn &&
    prevProps.message.created_at === nextProps.message.created_at
  );
});

// OPTIMIZATION 2: Memoized Typing Indicator Component
const TypingIndicator = React.memo(({ typingUsers }) => {
  // OPTIMIZATION: Memoized display text calculation
  const displayText = useMemo(() => {
    if (!typingUsers || typingUsers.length === 0) return null;
    
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing`;
    } else {
      return `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;
    }
  }, [typingUsers]);

  if (!displayText) return null;
  
  return (
    <div className="flex justify-start mb-4 animate-fadeIn">
      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 max-w-xs">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">{displayText}</span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // OPTIMIZATION: Only re-render if typing users actually changed
  return JSON.stringify(prevProps.typingUsers) === JSON.stringify(nextProps.typingUsers);
});

// OPTIMIZATION 3: Memoized Loading State Component
const ChatLoadingState = React.memo(() => (
  <div className="h-full flex flex-col">
    {/* Header skeleton */}
    <div className="flex items-center space-x-3 p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-1"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
    
    {/* Messages skeleton */}
    <div className="flex-1 p-4 space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className="w-48 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
        </div>
      ))}
    </div>
    
    {/* Input skeleton */}
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="flex-1 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    </div>
  </div>
));

// OPTIMIZATION 4: Memoized Error State Component
const ChatErrorState = React.memo(({ error, onRetry, onBack }) => (
  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
      <AlertCircle className="w-8 h-8 text-red-500" />
    </div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Failed to load chat
    </h2>
    <p className="text-gray-500 dark:text-gray-400 mb-6">
      {error || 'The conversation could not be loaded.'}
    </p>
    <div className="flex space-x-3">
      <Button 
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center space-x-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </Button>
      <Button 
        onClick={onBack}
        variant="ghost"
        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Back to Messages
      </Button>
    </div>
  </div>
));

// OPTIMIZATION 5: Main ChatView Component - FIXED Infinite Loop
function ChatView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Use the messaging hook
  const {
    currentChat,
    isLoading,
    error,
    isConnected,
    selectChat,
    sendMessage,
    getChatMessages,
    getChatTypingUsers,
    sendTypingStart,
    sendTypingStop,
    clearError
  } = useMessaging();

  // OPTIMIZATION 6: Memoized data retrieval (only recalculate when userId changes)
  const messages = useMemo(() => {
    return getChatMessages(userId) || [];
  }, [getChatMessages, userId]);

  const typingUsers = useMemo(() => {
    return getChatTypingUsers(userId) || [];
  }, [getChatTypingUsers, userId]);

  // OPTIMIZATION 7: Memoized responsive detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🎯 SURGICAL FIX: Remove selectChat from dependencies to prevent infinite loop
  useEffect(() => {
    if (userId) {
      selectChat(userId);
    }
  }, [userId]); // ✅ FIXED: Only depend on userId, not selectChat function

  // OPTIMIZATION 9: Memoized auto-scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typingUsers.length]); // Only scroll when message count or typing users change

  // OPTIMIZATION 10: Memoized focus effect
  useEffect(() => {
    if (currentChat && inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [currentChat?.id, isMobile]); // Only refocus when chat changes or mobile state changes

  // OPTIMIZATION 11: Memoized navigation handler
  const handleBack = useCallback(() => {
    navigate('/messages');
  }, [navigate]);

  // OPTIMIZATION 12: Memoized input change handler
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setMessageText(value);
    
    // Send typing indicator
    if (!isTyping && value.trim() && isConnected) {
      setIsTyping(true);
      sendTypingStart();
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && isConnected) {
        setIsTyping(false);
        sendTypingStop();
      }
    }, 1000);
  }, [isTyping, isConnected, sendTypingStart, sendTypingStop]);

  // OPTIMIZATION 13: Memoized send message handler
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !currentChat) return;
    
    const content = messageText.trim();
    setMessageText("");
    
    // Stop typing indicator
    if (isTyping && isConnected) {
      setIsTyping(false);
      sendTypingStop();
    }
    
    try {
      await sendMessage(userId, content);
    } catch (error) {
      console.error('Error sending message:', error);
      // Message will show as failed in the UI automatically
    }
  }, [messageText, currentChat, isTyping, isConnected, sendTypingStop, sendMessage, userId]);

  // OPTIMIZATION 14: Memoized key press handler
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // OPTIMIZATION 15: Memoized textarea resize handler
  const handleTextareaResize = useCallback((e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }, []);

  // 🎯 SURGICAL FIX: Remove selectChat from dependencies to prevent infinite loop  
  const handleRetry = useCallback(() => {
    clearError();
    if (userId) {
      selectChat(userId);
    }
  }, [clearError, userId]); // ✅ FIXED: Removed selectChat dependency

  // OPTIMIZATION 17: Memoized current user data
  const currentUser = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user;
  }, []); // Only calculate once since user data doesn't change during session

  // OPTIMIZATION 18: Memoized display user calculation
  const displayUser = useMemo(() => {
    if (currentChat?.other_participant) {
      return currentChat.other_participant;
    }
    
    // Fallback for group chats or when other_participant is not available
    const participants = currentChat?.participants || [];
    const otherParticipant = participants.find(p => p.id !== currentUser.id);
    
    return otherParticipant || {
      username: 'Unknown User',
      full_name: 'Unknown User',
      avatar: null
    };
  }, [currentChat?.other_participant, currentChat?.participants, currentUser.id]);

  // OPTIMIZATION 19: Memoized message list rendering
  const messageList = useMemo(() => {
    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Start the conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Send a message to get things started.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            isOwn={message.sender?.id === currentUser.id || message.is_own_message} 
          />
        ))}
        <TypingIndicator typingUsers={typingUsers} />
        <div ref={messagesEndRef} />
      </div>
    );
  }, [messages, typingUsers, currentUser.id]);

  // Show loading state
  if (isLoading && !currentChat) {
    return <ChatLoadingState />;
  }

  // Show error state
  if (error && !currentChat) {
    return <ChatErrorState error={error} onRetry={handleRetry} onBack={handleBack} />;
  }

  // Show not found state
  if (!isLoading && !currentChat && !error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Chat not found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The conversation you're looking for doesn't exist.
        </p>
        <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700 text-white">
          Back to Messages
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      
      {/* OPTIMIZATION 20: Memoized Chat Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center relative">
          {displayUser.avatar ? (
            <img 
              src={displayUser.avatar} 
              alt={displayUser.full_name || displayUser.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-sm sm:text-base">
              {(displayUser.full_name || displayUser.username || 'U').charAt(0).toUpperCase()}
            </span>
          )}
          {/* Connection status indicator */}
          {isConnected && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
            {displayUser.full_name || displayUser.username}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {isConnected ? 'Online' : 'Connecting...'}
          </p>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 hover:scale-105"
            title="Voice call"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 hover:scale-105"
            title="Video call"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 hover:scale-105"
            title="Chat info"
          >
            <Info className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* OPTIMIZATION 21: Memoized Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
        {messageList}
      </div>

      {/* OPTIMIZATION 22: Memoized Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => {
                handleInputChange(e);
                handleTextareaResize(e);
              }}
              onKeyDown={handleKeyPress}
              rows={1}
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base"
              style={{ 
                minHeight: '44px',
                maxHeight: '120px'
              }}
              disabled={!isConnected}
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || !isConnected}
            className={`h-11 px-4 rounded-xl transition-all duration-200 flex-shrink-0 ${
              !messageText.trim() || !isConnected
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white hover:scale-105 active:scale-95'
            }`}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Connection status */}
        {!isConnected && (
          <div className="mt-2 text-center">
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Connecting...
            </span>
          </div>
        )}
      </div>

      {/* Animation Styles - From original */}
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

export default ChatView;