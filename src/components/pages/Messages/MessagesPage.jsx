 
// ===== src/components/pages/Messages/MessagesPage.jsx =====
import React, { useState } from 'react';
import { Search, Send, Phone, Video, MoreHorizontal } from "lucide-react";
import { Button } from '../../ui/Button/Button';
import { Input } from '../../ui/Input/Input';

function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState("1");
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Mock chat data - replace with real API calls later
  const chats = [
    {
      id: "1",
      user: {
        name: "Sarah Kim",
        username: "sarahkim",
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
        name: "Alex Chen",
        username: "alexchen",
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

  // ✅ Mock messages data
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
    <div className="flex h-screen bg-background">
      {/* Chat List */}
      <div className="w-full md:w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedChat === chat.id ? "bg-muted" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold">{chat.user.name.charAt(0)}</span>
                  </div>
                  {chat.user.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate">{chat.user.name}</h3>
                    <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>

                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                    {chat.unread}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChatData ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold">{selectedChatData.user.name.charAt(0)}</span>
                </div>
                {selectedChatData.user.online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold">{selectedChatData.user.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedChatData.user.online ? "Online" : "Last seen 1h ago"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.sender === "me" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "bg-muted"
                  }`}
                >
                  <p>{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${message.sender === "me" ? "text-purple-100" : "text-muted-foreground"}`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
            <p className="text-muted-foreground">Choose a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesPage;