 
// ===== src/components/pages/Messages/ChatView.jsx - COMPLETE CHAT INTERFACE =====
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Phone,
  Video,
  Info,
  Send,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../../ui/Button/Button';

// ✅ Message Status Constants - From your original
const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
};

// ✅ Mock Chat Data - Matches your original data
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
    }
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
    }
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
    }
  }
];

// ✅ Message Bubble Component - Complete from your original
const MessageBubble = ({ message, isOwn }) => {
  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    switch (message.status) {
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
  };

  return (
    <div className={`flex mb-3 sm:mb-4 ${isOwn ? 'justify-end' : 'justify-start'} animate-slideUp`}>
      <div className={`max-w-xs sm:max-w-md lg:max-w-lg px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-200 ${
        isOwn 
          ? `bg-gradient-to-r from-blue-600 to-teal-600 text-white ${
              message.status === MESSAGE_STATUS.SENDING ? 'opacity-70' : 'opacity-100'
            }` 
          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
      }`}>
        <p className="text-sm sm:text-base">{message.text}</p>
        <div className={`flex items-center justify-between mt-1 ${
          isOwn ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
        }`}>
          <span className="text-xs">{message.timestamp}</span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

// ✅ Typing Indicator Component - Complete from your original
const TypingIndicator = ({ show, userName }) => {
  if (!show) return null;
  
  return (
    <div className="flex justify-start mb-4 animate-fadeIn">
      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 max-w-xs">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">{userName} is typing</span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Main ChatView Component
function ChatView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ✅ Responsive detection - From your original
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Get current chat data
  const currentChat = mockChats.find(chat => chat.id === userId);

  // ✅ Mock initial messages - From your original
  const initialMessages = [
    { 
      id: "1", 
      text: "Hey! How's your project going?", 
      sender: "other", 
      timestamp: "2:30 PM",
      status: MESSAGE_STATUS.READ,
      isNew: false 
    },
    { 
      id: "2", 
      text: "It's going great! Just finished the main features", 
      sender: "me", 
      timestamp: "2:32 PM",
      status: MESSAGE_STATUS.READ,
      isNew: false 
    },
    { 
      id: "3", 
      text: "That's awesome! Can't wait to see it 🚀", 
      sender: "other", 
      timestamp: "2:33 PM",
      status: MESSAGE_STATUS.READ,
      isNew: false 
    }
  ];

  // ✅ Load messages when component mounts
  useEffect(() => {
    setMessages(initialMessages);
  }, [userId]);

  // ✅ Auto-scroll to bottom - From your original
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherUserTyping]);

  // ✅ Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // ✅ Handle back navigation
  const handleBack = () => {
    navigate('/messages');
  };

  // ✅ Handle input change with typing indicator - From your original
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageText(value);
    
    // Trigger typing indicator
    if (!isTyping && value.trim()) {
      setIsTyping(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // ✅ Handle send message - Complete from your original
  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: messageText.trim(),
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: MESSAGE_STATUS.SENDING,
      isNew: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageText("");
    setIsSending(true);
    
    // Simulate sending
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: MESSAGE_STATUS.DELIVERED }
            : msg
        )
      );
      setIsSending(false);
      
      // Simulate other user typing and response
      setTimeout(() => {
        setOtherUserTyping(true);
        setTimeout(() => {
          setOtherUserTyping(false);
          // Add mock response
          const response = {
            id: Date.now().toString(),
            text: "Got it! Thanks for sharing 👍",
            sender: "other",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: MESSAGE_STATUS.READ,
            isNew: true
          };
          setMessages(prev => [...prev, response]);
        }, 2000);
      }, 1000);
    }, 1500);
  };

  // ✅ Handle key press - From your original
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ✅ Auto-resize textarea
  const handleTextareaResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // ✅ If chat not found, show error
  if (!currentChat) {
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
      
      {/* ✅ Chat Header - Complete with all your original styling */}
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
          <span className="text-white font-bold text-sm sm:text-base">
            {currentChat.user.name.charAt(0).toUpperCase()}
          </span>
          {currentChat.user.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
            {currentChat.user.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {currentChat.user.lastSeen}
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

      {/* ✅ Messages Area - Complete from your original */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
        <div className="space-y-1">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isOwn={message.sender === "me"} 
            />
          ))}
          <TypingIndicator 
            show={otherUserTyping} 
            userName={currentChat.user.name} 
          />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ✅ Message Input - Complete from your original */}
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
              disabled={isSending}
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            className={`h-11 px-4 rounded-xl transition-all duration-200 flex-shrink-0 ${
              !messageText.trim() 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : isSending
                  ? 'bg-blue-400 text-white cursor-wait'
                  : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white hover:scale-105 active:scale-95'
            }`}
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* ✅ Animation Styles - From your original */}
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