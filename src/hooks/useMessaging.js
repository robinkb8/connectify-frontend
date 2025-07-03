// src/hooks/useMessaging.js - Complete Messaging State Management Hook
import { useState, useEffect, useCallback, useRef } from 'react';
import messagingAPI, { MessagingWebSocket } from '../utils/api/messaging';

/**
 * Custom hook for managing messaging functionality
 * Handles chats, messages, WebSocket connections, and real-time updates
 */
const useMessaging = () => {
  // State management
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [currentChat, setCurrentChat] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // WebSocket management
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef({});

  // Chat management functions
  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await messagingAPI.getChats();
      
      // Handle both paginated and direct array responses
      const chatsData = response.results || response;
      setChats(chatsData);
      
    } catch (error) {
      console.error('Error loading chats:', error);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewChat = useCallback(async (participantIds, isGroupChat = false, chatName = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newChat = await messagingAPI.createChat(participantIds, isGroupChat, chatName);
      
      // Add new chat to the list
      setChats(prevChats => [newChat, ...prevChats]);
      
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      setError('Failed to create conversation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectChat = useCallback(async (chatId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get chat details
      const chatDetails = await messagingAPI.getChat(chatId);
      setCurrentChat(chatDetails);
      
      // Load messages for this chat
      const messagesResponse = await messagingAPI.getMessages(chatId);
      const messagesData = messagesResponse.results || messagesResponse;
      
      setMessages(prev => ({
        ...prev,
        [chatId]: messagesData
      }));
      
      // Connect WebSocket for real-time updates
      connectWebSocket(chatId);
      
    } catch (error) {
      console.error('Error selecting chat:', error);
      setError('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateChat = useCallback(async (chatId, updateData) => {
    try {
      const updatedChat = await messagingAPI.updateChat(chatId, updateData);
      
      // Update chat in the list
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId ? { ...chat, ...updatedChat } : chat
        )
      );
      
      // Update current chat if it's the one being updated
      if (currentChat?.id === chatId) {
        setCurrentChat(prev => ({ ...prev, ...updatedChat }));
      }
      
      return updatedChat;
    } catch (error) {
      console.error('Error updating chat:', error);
      setError('Failed to update conversation');
      throw error;
    }
  }, [currentChat]);

  const deleteChat = useCallback(async (chatId) => {
    try {
      await messagingAPI.deleteChat(chatId);
      
      // Remove chat from the list
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      
      // Clear current chat if it's the one being deleted
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        disconnectWebSocket();
      }
      
      // Clear messages for this chat
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[chatId];
        return newMessages;
      });
      
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete conversation');
      throw error;
    }
  }, [currentChat]);

  // Message management functions
  const sendNewMessage = useCallback(async (chatId, content, messageType = 'text', attachment = null, replyTo = null) => {
    if (!content.trim() && !attachment) return;

    try {
      setError(null);
      
      // Optimistically add message to UI
      const tempMessage = {
        id: `temp_${Date.now()}`,
        content: content.trim(),
        message_type: messageType,
        sender: getCurrentUser(),
        created_at: new Date().toISOString(),
        status: 'sending',
        chat: chatId
      };

      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), tempMessage]
      }));

      // Send message to backend
      const sentMessage = await messagingAPI.sendMessage(chatId, content.trim(), messageType, attachment, replyTo);
      
      // Replace temp message with actual message
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId].map(msg =>
          msg.id === tempMessage.id ? sentMessage : msg
        )
      }));

      // Update chat's last message in the chats list
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                last_message: sentMessage,
                last_activity: sentMessage.created_at
              }
            : chat
        ).sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity))
      );

      return sentMessage;
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      
      // Mark temp message as failed
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId].map(msg =>
          msg.id.toString().startsWith('temp_') 
            ? { ...msg, status: 'failed' }
            : msg
        )
      }));
      
      throw error;
    }
  }, []);

  const editMessage = useCallback(async (messageId, newContent) => {
    try {
      const updatedMessage = await messagingAPI.updateMessage(messageId, newContent);
      
      // Update message in the messages state
      setMessages(prev => {
        const newMessages = { ...prev };
        Object.keys(newMessages).forEach(chatId => {
          newMessages[chatId] = newMessages[chatId].map(msg =>
            msg.id === messageId ? updatedMessage : msg
          );
        });
        return newMessages;
      });
      
      return updatedMessage;
    } catch (error) {
      console.error('Error editing message:', error);
      setError('Failed to edit message');
      throw error;
    }
  }, []);

  const removeMessage = useCallback(async (messageId) => {
    try {
      await messagingAPI.deleteMessage(messageId);
      
      // Remove message from the messages state
      setMessages(prev => {
        const newMessages = { ...prev };
        Object.keys(newMessages).forEach(chatId => {
          newMessages[chatId] = newMessages[chatId].filter(msg => msg.id !== messageId);
        });
        return newMessages;
      });
      
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message');
      throw error;
    }
  }, []);

  // WebSocket management
  const connectWebSocket = useCallback((chatId) => {
    // Disconnect existing connection
    if (wsRef.current) {
      wsRef.current.disconnect();
    }

    const handleMessage = (message) => {
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), message]
      }));
    };

    const handleTyping = (data) => {
      const { user_id, username, is_typing } = data;
      
      setTypingUsers(prev => {
        const chatTyping = prev[chatId] || {};
        
        if (is_typing) {
          return {
            ...prev,
            [chatId]: {
              ...chatTyping,
              [user_id]: { username, timestamp: Date.now() }
            }
          };
        } else {
          const { [user_id]: removed, ...remaining } = chatTyping;
          return {
            ...prev,
            [chatId]: remaining
          };
        }
      });

      // Clear typing indicator after timeout
      if (is_typing) {
        const timeoutKey = `${chatId}_${user_id}`;
        if (typingTimeoutRef.current[timeoutKey]) {
          clearTimeout(typingTimeoutRef.current[timeoutKey]);
        }
        
        typingTimeoutRef.current[timeoutKey] = setTimeout(() => {
          setTypingUsers(prev => {
            const chatTyping = prev[chatId] || {};
            const { [user_id]: removed, ...remaining } = chatTyping;
            return {
              ...prev,
              [chatId]: remaining
            };
          });
        }, 3000);
      }
    };

    const handleStatus = (data) => {
      const { message_id, status } = data;
      
      setMessages(prev => {
        const newMessages = { ...prev };
        if (newMessages[chatId]) {
          newMessages[chatId] = newMessages[chatId].map(msg =>
            msg.id === message_id ? { ...msg, status } : msg
          );
        }
        return newMessages;
      });
    };

    const handleError = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error');
      setIsConnected(false);
    };

    const handleClose = () => {
      setIsConnected(false);
    };

    // Create new WebSocket connection
    wsRef.current = new MessagingWebSocket(
      chatId,
      handleMessage,
      handleTyping,
      handleStatus,
      handleError,
      handleClose
    );

    wsRef.current.connect();
    setIsConnected(true);
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Typing indicators
  const sendTypingStart = useCallback(() => {
    if (wsRef.current && wsRef.current.isConnected()) {
      wsRef.current.sendTypingStart();
    }
  }, []);

  const sendTypingStop = useCallback(() => {
    if (wsRef.current && wsRef.current.isConnected()) {
      wsRef.current.sendTypingStop();
    }
  }, []);

  // User search
  const searchUsers = useCallback(async (query) => {
    if (!query || query.length < 2) return [];

    try {
      const results = await messagingAPI.searchUsers(query);
      return results.results || results;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }, []);

  // Message status management
  const markAsRead = useCallback(async (messageId) => {
    try {
      await messagingAPI.markMessageAsRead(messageId);
      
      if (wsRef.current && wsRef.current.isConnected()) {
        wsRef.current.markMessageRead(messageId);
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  const markAsDelivered = useCallback(async (messageId) => {
    try {
      await messagingAPI.markMessageAsDelivered(messageId);
      
      if (wsRef.current && wsRef.current.isConnected()) {
        wsRef.current.markMessageDelivered(messageId);
      }
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  }, []);

  // Utility functions
  const getCurrentUser = () => {
    // Get current user from localStorage or context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      avatar: user.profile?.avatar || null
    };
  };

  const getChatMessages = useCallback((chatId) => {
    return messages[chatId] || [];
  }, [messages]);

  const getChatTypingUsers = useCallback((chatId) => {
    const chatTyping = typingUsers[chatId] || {};
    return Object.values(chatTyping).map(user => user.username);
  }, [typingUsers]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize messaging on mount
  useEffect(() => {
    loadChats();
    
    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
      // Clear all typing timeouts
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [loadChats, disconnectWebSocket]);

  // Return hook API
  return {
    // State
    chats,
    messages,
    currentChat,
    isLoading,
    isConnected,
    error,
    
    // Chat management
    loadChats,
    createChat: createNewChat,
    selectChat,
    updateChat,
    deleteChat,
    
    // Message management
    sendMessage: sendNewMessage,
    editMessage,
    deleteMessage: removeMessage,
    getChatMessages,
    
    // WebSocket management
    connectWebSocket,
    disconnectWebSocket,
    
    // Typing indicators
    sendTypingStart,
    sendTypingStop,
    getChatTypingUsers,
    
    // User search
    searchUsers,
    
    // Message status
    markAsRead,
    markAsDelivered,
    
    // Utility
    clearError
  };
};

export default useMessaging;