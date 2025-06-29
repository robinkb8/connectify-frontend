// ===== Enhanced MessagesPage with Real-time Feedback =====
import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Phone, Video, MoreHorizontal, Check, CheckCheck } from "lucide-react";
import Input from '../../ui/Input';
import { Button } from '../../ui/Button';
import { NoMessagesEmpty } from '../../ui/EmptyState/EmptyState';

// ✅ Message Status Types
const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent', 
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
};

// ✅ Enhanced Message Component with Status
const MessageBubble = ({ message, isOwn }) => {
  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    switch (message.status) {
      case MESSAGE_STATUS.SENDING:
        return <div className="w-3 h-3 border border-blue-300 border-t-transparent rounded-full animate-spin" />;
      case MESSAGE_STATUS.SENT:
        return <Check className="w-3 h-3 text-blue-300" />;
      case MESSAGE_STATUS.DELIVERED:
        return <CheckCheck className="w-3 h-3 text-blue-300" />;
      case MESSAGE_STATUS.READ:
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case MESSAGE_STATUS.FAILED:
        return <span className="text-red-400 text-xs">!</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4 ${message.isNew ? 'animate-slideUp' : ''}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-200 ${
        isOwn 
          ? `bg-gradient-to-r from-blue-600 to-teal-600 text-white ${
              message.status === MESSAGE_STATUS.SENDING ? 'opacity-70' : 'opacity-100'
            }` 
          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
      }`}>
        <p className="text-sm">{message.text}</p>
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
      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 max-w-xs">
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

function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState("1");
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
      text: "That's awesome! Can't wait to see it", 
      sender: "other", 
      timestamp: "2:33 PM",
      status: MESSAGE_STATUS.READ,
      isNew: false 
    },
    { 
      id: "4", 
      text: "I'll share a preview with you soon 🚀", 
      sender: "me", 
      timestamp: "2:35 PM",
      status: MESSAGE_STATUS.READ,
      isNew: false 
    },
  ];

  const chats = [
    {
      id: "1",
      user: {
        name: "Sarah Wilson",
        username: "sarahw",
        avatar: "",
        online: true,
      },
      lastMessage: "I'll share a preview with you soon 🚀",
      timestamp: "2m",
      unread: 0,
    },
    {
      id: "2",
      user: {
        name: "Alex Smith",
        username: "alexs", 
        avatar: "",
        online: false,
      },
      lastMessage: "Thanks for the feedback!",
      timestamp: "1h",
      unread: 0,
    },
    {
      id: "3",
      user: {
        name: "Marcus Johnson",
        username: "marcusj",
        avatar: "",
        online: true,
      },
      lastMessage: "Let's catch up soon",
      timestamp: "3h", 
      unread: 1,
    },
  ];

  // ✅ Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      setMessages(initialMessages);
    }
  }, [selectedChat]);

  // ✅ Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Simulate typing indicator for other user
  useEffect(() => {
    if (selectedChat === "1") {
      // Simulate other user typing occasionally
      const interval = setInterval(() => {
        if (Math.random() > 0.8) {
          setOtherUserTyping(true);
          setTimeout(() => setOtherUserTyping(false), 2000);
        }
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  // ✅ Handle typing indicator
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageText(value);
    
    // Trigger typing indicator
    if (!isTyping && value.trim()) {
      setIsTyping(true);
    }
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // ✅ INSTANT message sending with optimistic UI
  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;
    
    const messageContent = messageText.trim();
    const tempId = `temp-${Date.now()}`;
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });

    // ✅ Create optimistic message
    const optimisticMessage = {
      id: tempId,
      text: messageContent,
      sender: "me",
      timestamp: timestamp,
      status: MESSAGE_STATUS.SENDING,
      isNew: true,
      isOptimistic: true
    };

    // ✅ INSTANT UI UPDATE
    setMessages(prev => [...prev, optimisticMessage]);
    setMessageText(""); // Clear input immediately
    setIsTyping(false); // Stop typing indicator
    setIsSending(true);

    try {
      // ✅ Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ✅ Update message status - SENT
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, status: MESSAGE_STATUS.SENT, id: `msg-${Date.now()}` }
          : msg
      ));

      // ✅ Simulate delivery confirmation after 2 seconds
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.text === messageContent 
            ? { ...msg, status: MESSAGE_STATUS.DELIVERED }
            : msg
        ));
      }, 2000);

      // ✅ Simulate read confirmation after 4 seconds
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.text === messageContent 
            ? { ...msg, status: MESSAGE_STATUS.READ }
            : msg
        ));
      }, 4000);

      console.log('✅ Message sent successfully');
      
    } catch (error) {
      // ✅ Handle failed send
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, status: MESSAGE_STATUS.FAILED }
          : msg
      ));
      
      console.error('❌ Failed to send message:', error);
      
      // Could add retry logic here
      
    } finally {
      setIsSending(false);
    }
  };

  // ✅ Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);
  const filteredChats = chats.filter(
    (chat) =>
      chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Chat List */}
      <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                selectedChat === chat.id ? "bg-gray-100 dark:bg-gray-800" : "bg-white dark:bg-gray-900"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {chat.user.name.charAt(0)}
                    </span>
                  </div>
                  {chat.user.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {chat.user.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {chat.timestamp}
                      </span>
                      {chat.unread > 0 && (
                        <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      {selectedChatData ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {/* ✅ Enhanced Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {selectedChatData.user.name.charAt(0)}
                    </span>
                  </div>
                  {selectedChatData.user.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedChatData.user.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedChatData.user.online ? (
                      isTyping ? (
                        <span className="text-blue-500">You are typing...</span>
                      ) : (
                        "Online"
                      )
                    ) : (
                      "Last seen 1h ago"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* ✅ Enhanced Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
            <div className="space-y-1">
              {messages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  isOwn={message.sender === "me"} 
                />
              ))}
              
              {/* ✅ Typing Indicator */}
              <TypingIndicator 
                show={otherUserTyping} 
                userName={selectedChatData.user.name} 
              />
              
              {/* ✅ Messages end reference for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ✅ Enhanced Message Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-end space-x-3">
              {/* ✅ Enhanced Input */}
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
              
              {/* ✅ Enhanced Send Button */}
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
      )}

      {/* ✅ Custom Animations */}
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