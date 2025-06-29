// ===== src/components/pages/Messages/MessagesPage.jsx - FULLY RESPONSIVE =====
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreHorizontal, 
  Send, 
  ArrowLeft,
  Phone,
  Video,
  Info,
  Plus
} from 'lucide-react';
import { Button } from '../../ui/Button/Button';

// ✅ Message Status Constants
const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
};

// ✅ Mock Data
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

// ✅ Chat Item Component
const ChatItem = ({ chat, isSelected, onClick, isMobile }) => {
  const { user, lastMessage, unreadCount, isPinned } = chat;

  return (
    <div 
      onClick={() => onClick(chat.id)}
      className={`flex items-center space-x-3 p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
      }`}
    >
      {/* Avatar */}
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

      {/* Content */}
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
              <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
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
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ Message Bubble Component
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

// ✅ Typing Indicator Component
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

// ✅ Empty State Component
const NoMessagesEmpty = ({ onFindPeople }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
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
      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-2 rounded-xl"
    >
      Find People
    </Button>
  </div>
);

// ✅ Main Messages Component
function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ✅ Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Reset mobile chat view on desktop
      if (!mobile) {
        setShowMobileChat(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Auto-select first chat on desktop
  useEffect(() => {
    if (!isMobile && !selectedChat && mockChats.length > 0) {
      setSelectedChat(mockChats[0].id);
    }
  }, [isMobile, selectedChat]);

  // ✅ Mock initial messages
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

  // ✅ Load messages when chat selected
  useEffect(() => {
    if (selectedChat) {
      setMessages(initialMessages);
      if (isMobile) {
        setShowMobileChat(true);
      }
    }
  }, [selectedChat, isMobile]);

  // ✅ Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherUserTyping]);

  // ✅ Handle chat selection
  const handleChatSelect = (chatId) => {
    setSelectedChat(chatId);
    if (isMobile) {
      setShowMobileChat(true);
    }
  };

  // ✅ Handle back to chats list (mobile)
  const handleBackToChats = () => {
    setShowMobileChat(false);
    setSelectedChat(null);
  };

  // ✅ Handle input change with typing indicator
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

  // ✅ Handle send message
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

  // ✅ Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ✅ Get selected chat data
  const selectedChatData = selectedChat ? mockChats.find(chat => chat.id === selectedChat) : null;

  // ✅ Filter chats based on search
  const filteredChats = mockChats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Mobile layout with full screen chat
  if (isMobile && showMobileChat && selectedChatData) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        {/* Mobile Chat Header */}
        <div className="flex items-center space-x-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToChats}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {selectedChatData.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {selectedChatData.user.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedChatData.user.lastSeen}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <Video className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
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
              userName={selectedChatData.user.name} 
            />
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                placeholder="Type a message..."
                value={messageText}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                rows={1}
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 transition-colors"
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
              className={`h-11 px-4 rounded-xl transition-all duration-200 ${
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
      </div>
    );
  }

  // ✅ Desktop and Mobile List Layout
  return (
    <div className="h-full flex bg-white dark:bg-gray-900">
      
      {/* ✅ Chats Sidebar */}
      <div className={`${
        isMobile ? 'w-full' : 'w-80 border-r border-gray-200 dark:border-gray-700'
      } flex flex-col`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChat === chat.id}
                onClick={handleChatSelect}
                isMobile={isMobile}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Chat Area (Desktop Only) */}
      {!isMobile && (
        selectedChatData ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {selectedChatData.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedChatData.user.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedChatData.user.lastSeen}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <Info className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
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
                  userName={selectedChatData.user.name} 
                />
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    rows={1}
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 transition-colors"
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
                  className={`h-11 px-4 rounded-xl transition-all duration-200 ${
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
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
            <NoMessagesEmpty onFindPeople={() => console.log('Find people to message')} />
          </div>
        )
      )}

      {/* ✅ Animation Styles */}
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