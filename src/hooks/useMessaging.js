// src/hooks/useMessaging.js - FIXED: WebSocket Connection Stability
import { useState, useEffect, useCallback, useRef } from 'react';
import messagingAPI, { MessagingWebSocket } from '../utils/api/messaging';

/**
 * FIXED: Custom hook for managing messaging functionality
 * Handles chats, messages, WebSocket connections, and real-time updates
 * SOLUTION: Added userId → chatId resolution for stable WebSocket connections
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
  
  // FIXED: Add chat ID cache to avoid repeated API calls
  const chatIdCacheRef = useRef(new Map());

  // FIXED: Helper function to resolve userId to actual chatId
  const findOrCreateChat = useCallback(async (userIdOrChatId) => {
    try {
      // Check cache first
      if (chatIdCacheRef.current.has(userIdOrChatId)) {
        return chatIdCacheRef.current.get(userIdOrChatId);
      }

      // Check if it's already a valid chat ID (UUID format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(userIdOrChatId)) {
        // Try to get chat details to verify it exists
        try {
          const chatDetails = await messagingAPI.getChat(userIdOrChatId);
          chatIdCacheRef.current.set(userIdOrChatId, userIdOrChatId);
          return userIdOrChatId;
        } catch (error) {
          console.log('Chat ID not found:', userIdOrChatId);
        }
      }

      // It's a userId - find or create chat with this user
      console.log('🔍 Resolving userId to chatId:', userIdOrChatId);
      
      // First, check existing chats for this user
      const response = await messagingAPI.getChats();
      const userChats = response.results || response;
      
      // Look for existing chat with this user
      const existingChat = userChats.find(chat => {
        if (chat.is_group_chat) return false;
        
        // Find other participant
        const otherParticipant = chat.participants?.find(p => 
          p.id !== getCurrentUser().id
        );
        
        return otherParticipant && (
          otherParticipant.id.toString() === userIdOrChatId.toString() ||
          otherParticipant.username === userIdOrChatId
        );
      });

      if (existingChat) {
        console.log('✅ Found existing chat:', existingChat.id);
        chatIdCacheRef.current.set(userIdOrChatId, existingChat.id);
        return existingChat.id;
      }

      // No existing chat found - create new one
      console.log('🆕 Creating new chat with user:', userIdOrChatId);
      const newChat = await messagingAPI.createChat([userIdOrChatId], false);
      
      console.log('✅ Created new chat:', newChat.id);
      chatIdCacheRef.current.set(userIdOrChatId, newChat.id);
      
      // Add to chats list
      setChats(prevChats => [newChat, ...prevChats]);
      
      return newChat.id;
      
    } catch (error) {
      console.error('❌ Error resolving userId to chatId:', error);
      throw error;
    }
  }, []);

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

  // FIXED: Updated selectChat to resolve userId to chatId
  const selectChat = useCallback(async (userIdOrChatId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎯 Selecting chat for:', userIdOrChatId);
      
      // FIXED: Resolve userId to actual chatId
      const actualChatId = await findOrCreateChat(userIdOrChatId);
      console.log('✅ Resolved to chat ID:', actualChatId);
      
      // Get chat details using actual chat ID
      const chatDetails = await messagingAPI.getChat(actualChatId);
      setCurrentChat(chatDetails);
      
      // Load messages for this chat
      const messagesResponse = await messagingAPI.getMessages(actualChatId);
      const messagesData = messagesResponse.results || messagesResponse;
      
      setMessages(prev => ({
        ...prev,
        [actualChatId]: messagesData
      }));
      
      // FIXED: Connect WebSocket using actual chat ID
      console.log('🔌 Connecting WebSocket to chat:', actualChatId);
      connectWebSocket(actualChatId);
      
    } catch (error) {
      console.error('❌ Error selecting chat:', error);
      setError('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [findOrCreateChat]);

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
      
      // Clear from cache
      chatIdCacheRef.current.forEach((value, key) => {
        if (value === chatId) {
          chatIdCacheRef.current.delete(key);
        }
      });
      
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete conversation');
      throw error;
    }
  }, [currentChat]);

  // Message management functions
  const sendNewMessage = useCallback(async (chatIdOrUserId, content, messageType = 'text', attachment = null, replyTo = null) => {
    if (!content.trim() && !attachment) return;

    try {
      setError(null);
      
      // FIXED: Resolve to actual chat ID if needed
      let actualChatId = chatIdOrUserId;
      if (currentChat) {
        actualChatId = currentChat.id;
      } else {
        actualChatId = await findOrCreateChat(chatIdOrUserId);
      }
      
      // Optimistically add message to UI
      const tempMessage = {
        id: `temp_${Date.now()}`,
        content: content.trim(),
        message_type: messageType,
        sender: getCurrentUser(),
        created_at: new Date().toISOString(),
        status: 'sending',
        chat: actualChatId
      };

      setMessages(prev => ({
        ...prev,
        [actualChatId]: [...(prev[actualChatId] || []), tempMessage]
      }));

      // Send message to backend
      const sentMessage = await messagingAPI.sendMessage(actualChatId, content.trim(), messageType, attachment, replyTo);
      
      // Replace temp message with actual message
      setMessages(prev => ({
        ...prev,
        [actualChatId]: prev[actualChatId].map(msg =>
          msg.id === tempMessage.id ? sentMessage : msg
        )
      }));

      // Update chat's last message in the chats list
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === actualChatId
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
      const actualChatId = currentChat?.id || chatIdOrUserId;
      setMessages(prev => ({
        ...prev,
        [actualChatId]: prev[actualChatId]?.map(msg =>
          msg.id.toString().startsWith('temp_') 
            ? { ...msg, status: 'failed' }
            : msg
        ) || []
      }));
      
      throw error;
    }
  }, [currentChat, findOrCreateChat]);

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

  // FIXED: WebSocket management with enhanced connection stability
  const connectWebSocket = useCallback((chatId) => {
    // Disconnect existing connection
    if (wsRef.current) {
      console.log('🔌 Disconnecting existing WebSocket');
      wsRef.current.disconnect();
    }

    console.log('🚀 Creating new WebSocket connection for chat:', chatId);

    const handleMessage = (message) => {
      console.log('📨 Received message:', message);
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
      console.error('❌ WebSocket error:', error);
      setError('Connection error');
      setIsConnected(false);
    };

    const handleClose = (event) => {
      console.log('🔌 WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      
      // Don't trigger error state for normal closures
      if (event.code !== 1000) {
        setError('Connection lost');
      }
    };

    const handleOpen = () => {
      console.log('✅ WebSocket connected successfully for chat:', chatId);
      setIsConnected(true);
      setError(null);
    };

    // Create new WebSocket connection with enhanced handlers
    wsRef.current = new MessagingWebSocket(
      chatId,
      handleMessage,
      handleTyping,
      handleStatus,
      handleError,
      handleClose
    );

    // Add open handler
    wsRef.current.onOpen = handleOpen;

    wsRef.current.connect();
  }, []);

  const disconnectWebSocket = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket');
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

  // FIXED: Updated to handle userId → chatId resolution
  const getChatMessages = useCallback((userIdOrChatId) => {
    // Try to get messages by direct chat ID first
    if (messages[userIdOrChatId]) {
      return messages[userIdOrChatId];
    }
    
    // Try to find chat ID from cache
    const cachedChatId = chatIdCacheRef.current.get(userIdOrChatId);
    if (cachedChatId && messages[cachedChatId]) {
      return messages[cachedChatId];
    }
    
    // Return empty array as fallback
    return [];
  }, [messages]);

  // FIXED: Updated to handle userId → chatId resolution
  const getChatTypingUsers = useCallback((userIdOrChatId) => {
    // Try to get typing users by direct chat ID first
    if (typingUsers[userIdOrChatId]) {
      const chatTyping = typingUsers[userIdOrChatId] || {};
      return Object.values(chatTyping).map(user => user.username);
    }
    
    // Try to find chat ID from cache
    const cachedChatId = chatIdCacheRef.current.get(userIdOrChatId);
    if (cachedChatId && typingUsers[cachedChatId]) {
      const chatTyping = typingUsers[cachedChatId] || {};
      return Object.values(chatTyping).map(user => user.username);
    }
    
    // Return empty array as fallback
    return [];
  }, [typingUsers]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // FIXED: Clear cache on logout/unmount
  const clearCache = useCallback(() => {
    chatIdCacheRef.current.clear();
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
      // Clear cache
      clearCache();
    };
  }, [loadChats, disconnectWebSocket, clearCache]);

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
    clearError,
    clearCache,
    
    // FIXED: Add helper for debugging
    findOrCreateChat
  };
};

export default useMessaging;