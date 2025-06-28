// ===== src/components/pages/Messages/MessagesPage.jsx - SYNTAX FIXED =====
import React, { useState } from 'react';
import { Search, Send, Phone, Video, MoreHorizontal } from "lucide-react";
import Input from '../../ui/Input';
import { Button } from '../../ui/Button';

function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState("1");
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const chats = [
    {
      id: "1",
      user: {
        name: "Sarah Wilson",
        username: "sarahw",
        avatar: "",
        online: true,
      },
      lastMessage: "Hey! How's your project going?",
      timestamp: "2m",
      unread: 2,
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

  const messages = [
    { id: "1", text: "Hey! How's your project going?", sender: "other", timestamp: "2:30 PM" },
    { id: "2", text: "It's going great! Just finished the main features", sender: "me", timestamp: "2:32 PM" },
    { id: "3", text: "That's awesome! Can't wait to see it", sender: "other", timestamp: "2:33 PM" },
    { id: "4", text: "I'll share a preview with you soon 🚀", sender: "me", timestamp: "2:35 PM" },
  ];

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

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
                    {selectedChatData.user.online ? "Online" : "Last seen 1h ago"}
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

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div
                 className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
  message.sender === "me" 
    ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white" 
    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
}`}
                >
                  <p>{message.text}</p>
                 <p className={`text-xs mt-1 ${
  message.sender === "me" 
    ? "text-blue-100" 
    : "text-gray-500 dark:text-gray-400"
}`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
             <Button
  onClick={handleSendMessage}
  disabled={!messageText.trim()}
  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Select a conversation</h3>
            <p className="text-gray-500 dark:text-gray-400">Choose a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesPage;