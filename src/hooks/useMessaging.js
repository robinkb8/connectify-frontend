// src/hooks/useMessagingRedux.js - Redux Bridge Hook with Smart Caching Performance Fix
import { useCallback, useRef, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessagingWebSocket } from '../utils/api/messaging';
import messagingAPI from '../utils/api/messaging';
import {
  loadChats,
  loadChatById,
  createNewChat,
  sendMessage,
  addRealtimeMessage,
  updateTypingUsers,
  updateMessageStatus,
  setConnectionStatus,
  clearError,
  updateChatIdCache,
  updateMessageCache,
  updateLastFetchTime,
  clearCache,
  setCurrentChat,
  selectChats,
  selectMessages,
  selectCurrentChat,
  selectTypingUsers,
  selectChatsLoading,
  selectChatsConnected,
  selectChatsError,
  selectChatIdCache,
  selectMessageCache,
  selectLastFetchTime,
  selectChatMessages,
  selectChatTypingUsers
} from '../store/slices/chatsSlice';

/**
 * PRESERVED: Smart WebSocket Connection Manager from original hook
 * This maintains all the sophisticated connection pooling and management
 */
class WebSocketConnectionManager {
  constructor() {
    this.connections = new Map();
    this.activeConnection = null;
    this.messageHandlers = new Map();
    this.statusHandlers = new Map();
    this.typingHandlers = new Map();
  }

  async getConnection(chatId, callbacks) {
    // Check if we already have a connection for this chat
    if (this.connections.has(chatId)) {
      const connection = this.connections.get(chatId);
      if (connection.isConnected()) {
        this.setActiveConnection(chatId);
        this.updateCallbacks(chatId, callbacks);
        return connection;
      } else {
        // Connection exists but is not connected, remove it
        this.connections.delete(chatId);
      }
    }

    // Create new connection
    console.log('🚀 Creating new optimized WebSocket connection for chat:', chatId);
    const connection = new MessagingWebSocket(
      chatId,
      callbacks.onMessage,
      callbacks.onTyping,
      callbacks.onStatus,
      callbacks.onError,
      callbacks.onClose,
      callbacks.onOpen
    );

    this.connections.set(chatId, connection);
    this.updateCallbacks(chatId, callbacks);
    
    await connection.connect();
    this.setActiveConnection(chatId);
    
    return connection;
  }

  setActiveConnection(chatId) {
    // Pause other connections but don't disconnect them
    this.connections.forEach((connection, id) => {
      if (id !== chatId && connection.isConnected()) {
        console.log('⏸️ Pausing connection for chat:', id);
        // Don't actually pause, just mark as inactive
        // This allows for quick switching between chats
      }
    });

    this.activeConnection = chatId;
    console.log('✅ Active connection set to chat:', chatId);
  }

  updateCallbacks(chatId, callbacks) {
    this.messageHandlers.set(chatId, callbacks.onMessage);
    this.statusHandlers.set(chatId, callbacks.onStatus);
    this.typingHandlers.set(chatId, callbacks.onTyping);
  }

  getActiveConnection() {
    if (this.activeConnection && this.connections.has(this.activeConnection)) {
      return this.connections.get(this.activeConnection);
    }
    return null;
  }

  disconnectAll() {
    console.log('🔌 Disconnecting all WebSocket connections');
    this.connections.forEach((connection, chatId) => {
      connection.disconnect();
    });
    this.connections.clear();
    this.activeConnection = null;
  }

  disconnect(chatId) {
    if (this.connections.has(chatId)) {
      console.log('🔌 Disconnecting WebSocket for chat:', chatId);
      this.connections.get(chatId).disconnect();
      this.connections.delete(chatId);
      
      if (this.activeConnection === chatId) {
        this.activeConnection = null;
      }
    }
  }

  isConnected() {
    const activeConn = this.getActiveConnection();
    return activeConn ? activeConn.isConnected() : false;
  }
}

/**
 * Redux-powered messaging hook with Smart Caching Performance Fix
 * Preserves all WebSocket functionality and performance optimizations
 */
const useMessagingRedux = () => {
  const dispatch = useDispatch();
  
  // Select all state from Redux store
  const chats = useSelector(selectChats);
  const messages = useSelector(selectMessages);
  const currentChat = useSelector(selectCurrentChat);
  const typingUsers = useSelector(selectTypingUsers);
  const isLoading = useSelector(selectChatsLoading);
  const isConnected = useSelector(selectChatsConnected);
  const error = useSelector(selectChatsError);
  const chatIdCache = useSelector(selectChatIdCache);
  const messageCache = useSelector(selectMessageCache);
  const lastFetchTime = useSelector(selectLastFetchTime);

  // PRESERVED: Enhanced refs for better performance (from original hook)
  const wsManagerRef = useRef(new WebSocketConnectionManager());
  const typingTimeoutRef = useRef({});

  // PRESERVED: Memoized helper functions (from original hook)
  const getCurrentUser = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      avatar: user.profile?.avatar || null
    };
  }, []); // Only calculate once per session

  // PRESERVED: Enhanced findOrCreateChat with Redux integration
  const findOrCreateChat = useCallback(async (userIdOrChatId) => {
    try {
      // Check Redux cache first
      if (chatIdCache[userIdOrChatId]) {
        const cachedId = chatIdCache[userIdOrChatId];
        console.log('✅ Redux cache hit for chat resolution:', userIdOrChatId, '->', cachedId);
        return cachedId;
      }

      // Check if it's already a valid chat ID (UUID format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(userIdOrChatId)) {
        try {
          const chatDetails = await messagingAPI.getChat(userIdOrChatId);
          dispatch(updateChatIdCache({ userId: userIdOrChatId, chatId: userIdOrChatId }));
          return userIdOrChatId;
        } catch (error) {
          console.log('Chat ID not found:', userIdOrChatId);
        }
      }

      // It's a userId - find or create chat with this user
      console.log('🔍 Resolving userId to chatId:', userIdOrChatId);
      
      // Check if we need to refresh chat list
      const lastFetch = lastFetchTime.chats || 0;
      let userChats = chats;
      
      if (Date.now() - lastFetch > 30000 || chats.length === 0) {
        // Refresh chat list if it's stale or empty
        const resultAction = await dispatch(loadChats());
        if (loadChats.fulfilled.match(resultAction)) {
          userChats = resultAction.payload;
        }
      }
      
      // Look for existing chat with this user
      const existingChat = userChats.find(chat => {
        if (chat.is_group_chat) return false;
        
        const otherParticipant = chat.participants?.find(p => 
          p.id !== getCurrentUser.id
        );
        
        return otherParticipant && (
          otherParticipant.id.toString() === userIdOrChatId.toString() ||
          otherParticipant.username === userIdOrChatId
        );
      });

      if (existingChat) {
        console.log('✅ Found existing chat:', existingChat.id);
        dispatch(updateChatIdCache({ userId: userIdOrChatId, chatId: existingChat.id }));
        return existingChat.id;
      }

      // No existing chat found - create new one
      console.log('🆕 Creating new chat with user:', userIdOrChatId);
      const resultAction = await dispatch(createNewChat({ participantIds: [userIdOrChatId], isGroupChat: false }));
      
      if (createNewChat.fulfilled.match(resultAction)) {
        const newChat = resultAction.payload;
        console.log('✅ Created new chat:', newChat.id);
        dispatch(updateChatIdCache({ userId: userIdOrChatId, chatId: newChat.id }));
        return newChat.id;
      } else {
        throw new Error('Failed to create chat');
      }
      
    } catch (error) {
      console.error('❌ Error resolving userId to chatId:', error);
      throw error;
    }
  }, [dispatch, chats, chatIdCache, lastFetchTime.chats, getCurrentUser.id]);

  // PRESERVED: Load chats function with Redux
  const loadChatsAction = useCallback(async () => {
    try {
      await dispatch(loadChats());
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }, [dispatch]);

  // ✅ SURGICAL FIX #2: Enhanced selectChat with smart caching and parallel execution
  const selectChat = useCallback(async (userIdOrChatId) => {
    try {
      console.log('🎯 Selecting chat for:', userIdOrChatId);
      
      // 🎯 SURGICAL CHANGE: Check cache first for instant response on repeated selections
      const cachedChatId = chatIdCache[userIdOrChatId];
      
      if (cachedChatId && currentChat?.id === cachedChatId) {
        console.log('⚡ INSTANT: Chat already loaded from cache, just ensuring WebSocket');
        // Non-blocking WebSocket connection - don't wait for it
        connectWebSocket(cachedChatId).catch(console.error);
        return;
      }
      
      // Resolve userId to actual chatId
      const actualChatId = await findOrCreateChat(userIdOrChatId);
      console.log('✅ Resolved to chat ID:', actualChatId);
      
      // Check if we already have this chat loaded
      if (currentChat?.id === actualChatId) {
        console.log('✅ Chat already loaded, just ensuring WebSocket connection');
        // 🎯 SURGICAL CHANGE: Non-blocking WebSocket connection
        connectWebSocket(actualChatId).catch(console.error);
        return;
      }
      
      // Check message cache first for faster loading
      const cacheKey = `messages_${actualChatId}`;
      const lastMessageFetch = lastFetchTime[cacheKey] || 0;
      
      let shouldFetchFromAPI = true;
      if (Date.now() - lastMessageFetch < 15000 && messageCache[actualChatId]) {
        // Use cached messages if less than 15 seconds old
        const chatDetails = await messagingAPI.getChat(actualChatId);
        dispatch(setCurrentChat(chatDetails));
        console.log('⚡ FAST: Using cached messages for chat:', actualChatId);
        shouldFetchFromAPI = false;
      }
      
      // 🎯 SURGICAL CHANGE: Execute chat loading and WebSocket in parallel, not sequential
      const chatLoadPromise = shouldFetchFromAPI 
        ? dispatch(loadChatById({ chatId: actualChatId }))
        : Promise.resolve();
      
      const wsConnectPromise = connectWebSocket(actualChatId);
      
      // Execute both in parallel - don't wait for WebSocket to complete
      await Promise.allSettled([chatLoadPromise, wsConnectPromise]);
      
    } catch (error) {
      console.error('❌ Error selecting chat:', error);
    }
  }, [dispatch, findOrCreateChat, currentChat?.id, lastFetchTime, messageCache, chatIdCache]);

  // PRESERVED: Smart WebSocket connection with Redux integration
  const connectWebSocket = useCallback(async (chatId) => {
    console.log('🔌 Connecting to WebSocket for chat:', chatId);

    const callbacks = {
      onMessage: (message) => {
        console.log('📨 Received message:', message);
        dispatch(addRealtimeMessage({ message, chatId }));
      },

      onTyping: (data) => {
        const { user_id, username, is_typing } = data;
        dispatch(updateTypingUsers({ chatId, userId: user_id, username, isTyping: is_typing }));

        // Clear typing indicator after timeout
        if (is_typing) {
          const timeoutKey = `${chatId}_${user_id}`;
          if (typingTimeoutRef.current[timeoutKey]) {
            clearTimeout(typingTimeoutRef.current[timeoutKey]);
          }
          
          typingTimeoutRef.current[timeoutKey] = setTimeout(() => {
            dispatch(updateTypingUsers({ chatId, userId: user_id, username, isTyping: false }));
          }, 3000);
        }
      },

      onStatus: (data) => {
        const { message_id, status } = data;
        dispatch(updateMessageStatus({ chatId, messageId: message_id, status }));
      },

      onError: (error) => {
        console.error('❌ WebSocket error:', error);
        dispatch(setConnectionStatus(false));
      },

      onClose: (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        dispatch(setConnectionStatus(false));
      },

      onOpen: () => {
        console.log('✅ WebSocket connected successfully for chat:', chatId);
        dispatch(setConnectionStatus(true));
      }
    };

    try {
      const connection = await wsManagerRef.current.getConnection(chatId, callbacks);
      return connection;
    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error);
      dispatch(setConnectionStatus(false));
    }
  }, [dispatch]);

  // PRESERVED: Enhanced disconnect function
  const disconnectWebSocket = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket');
    wsManagerRef.current.disconnectAll();
    dispatch(setConnectionStatus(false));
  }, [dispatch]);

  // PRESERVED: Optimized message sending with Redux
  const sendNewMessage = useCallback(async (chatIdOrUserId, content, messageType = 'text', attachment = null, replyTo = null) => {
    if (!content.trim() && !attachment) return;

    try {
      let actualChatId = chatIdOrUserId;
      if (currentChat) {
        actualChatId = currentChat.id;
      } else {
        actualChatId = await findOrCreateChat(chatIdOrUserId);
      }
      
      // Use Redux thunk for sending message (includes optimistic updates)
      const resultAction = await dispatch(sendMessage({
        chatId: actualChatId,
        content,
        messageType,
        attachment,
        replyTo
      }));

      if (sendMessage.fulfilled.match(resultAction)) {
        return resultAction.payload.sentMessage;
      } else {
        throw new Error(resultAction.payload || 'Failed to send message');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [dispatch, currentChat, findOrCreateChat]);

  // PRESERVED: Enhanced typing indicators
  const sendTypingStart = useCallback(() => {
    const connection = wsManagerRef.current.getActiveConnection();
    if (connection && connection.isConnected()) {
      connection.sendTypingStart();
    }
  }, []);

  const sendTypingStop = useCallback(() => {
    const connection = wsManagerRef.current.getActiveConnection();
    if (connection && connection.isConnected()) {
      connection.sendTypingStop();
    }
  }, []);

  // PRESERVED: Memoized data retrieval functions with Redux selectors
  const getChatMessages = useCallback((userIdOrChatId) => {
    // Try to get messages by direct chat ID first
    if (messages[userIdOrChatId]) {
      return messages[userIdOrChatId];
    }
    
    // Try to find chat ID from Redux cache
    const cachedChatId = chatIdCache[userIdOrChatId];
    if (cachedChatId && messages[cachedChatId]) {
      return messages[cachedChatId];
    }
    
    return [];
  }, [messages, chatIdCache]);

  const getChatTypingUsers = useCallback((userIdOrChatId) => {
    // Try to get typing users by direct chat ID first
    if (typingUsers[userIdOrChatId]) {
      const chatTyping = typingUsers[userIdOrChatId] || {};
      return Object.values(chatTyping).map(user => user.username);
    }
    
    // Try to find chat ID from Redux cache
    const cachedChatId = chatIdCache[userIdOrChatId];
    if (cachedChatId && typingUsers[cachedChatId]) {
      const chatTyping = typingUsers[cachedChatId] || {};
      return Object.values(chatTyping).map(user => user.username);
    }
    
    return [];
  }, [typingUsers, chatIdCache]);

  // PRESERVED: Other utility functions with Redux
  const createChat = useCallback(async (participantIds, isGroupChat = false, chatName = null) => {
    try {
      const resultAction = await dispatch(createNewChat({ participantIds, isGroupChat, chatName }));
      
      if (createNewChat.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }, [dispatch]);

  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCacheAction = useCallback(() => {
    dispatch(clearCache());
  }, [dispatch]);

  // PRESERVED: Enhanced cleanup and initialization
  useEffect(() => {
    loadChatsAction();
    
    return () => {
      wsManagerRef.current.disconnectAll();
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [loadChatsAction]);

  // Return identical API to original useMessaging hook
  return {
    // State - identical to original
    chats,
    messages,
    currentChat,
    isLoading,
    isConnected,
    error,
    
    // Chat management - identical API
    loadChats: loadChatsAction,
    createChat,
    selectChat,
    
    // Message management - identical API
    sendMessage: sendNewMessage,
    getChatMessages,
    
    // WebSocket management - identical API
    connectWebSocket,
    disconnectWebSocket,
    
    // Typing indicators - identical API
    sendTypingStart,
    sendTypingStop,
    getChatTypingUsers,
    
    // Utility - identical API
    clearError: clearErrorAction,
    clearCache: clearCacheAction,
    findOrCreateChat
  };
};

export default useMessagingRedux;