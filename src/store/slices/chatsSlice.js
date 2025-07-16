// src/store/slices/chatsSlice.js - Messages/Chats Redux Slice with WebSocket Integration
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import messagingAPI from '../../utils/api/messaging';

// Async Thunks for API calls
export const loadChats = createAsyncThunk(
  'chats/loadChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messagingAPI.getChats();
      const chatsData = response.results || response;
      return chatsData;
    } catch (error) {
      console.error('Error loading chats:', error);
      return rejectWithValue('Failed to load conversations');
    }
  }
);

export const loadChatById = createAsyncThunk(
  'chats/loadChatById',
  async ({ chatId }, { rejectWithValue }) => {
    try {
      const chatDetails = await messagingAPI.getChat(chatId);
      const messagesResponse = await messagingAPI.getMessages(chatId);
      const messagesData = messagesResponse.results || messagesResponse;
      
      return {
        chat: chatDetails,
        messages: messagesData,
        chatId
      };
    } catch (error) {
      console.error('Error loading chat:', error);
      return rejectWithValue('Failed to load conversation');
    }
  }
);

export const createNewChat = createAsyncThunk(
  'chats/createNewChat',
  async ({ participantIds, isGroupChat = false, chatName = null }, { rejectWithValue }) => {
    try {
      const newChat = await messagingAPI.createChat(participantIds, isGroupChat, chatName);
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      return rejectWithValue('Failed to create conversation');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chats/sendMessage',
  async ({ chatId, content, messageType = 'text', attachment = null, replyTo = null }, { getState, rejectWithValue }) => {
    try {
      // Get current user from auth context (stored in localStorage for this implementation)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUser = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        avatar: user.profile?.avatar || null
      };

      // Optimistically add message to state first
      const tempMessage = {
        id: `temp_${Date.now()}`,
        content: content.trim(),
        message_type: messageType,
        sender: currentUser,
        created_at: new Date().toISOString(),
        status: 'sending',
        chat: chatId,
        is_own_message: true
      };

      // Send to backend
      const sentMessage = await messagingAPI.sendMessage(chatId, content.trim(), messageType, attachment, replyTo);
      
      return {
        tempMessage,
        sentMessage,
        chatId
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return rejectWithValue('Failed to send message');
    }
  }
);

// Initial state matching useMessaging hook structure
const initialState = {
  chats: [],
  messages: {}, // Object with chatId as key, messages array as value
  currentChat: null,
  typingUsers: {}, // Object with chatId as key, typing users as value
  isLoading: false,
  isConnected: false,
  error: null,
  
  // Cache management (preserved from original hook)
  chatIdCache: {}, // For userId to chatId resolution
  messageCache: {}, // For caching messages
  lastFetchTime: {}, // For cache invalidation
};

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    // WebSocket real-time message updates
    addRealtimeMessage: (state, action) => {
      const { message, chatId } = action.payload;
      
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      
      state.messages[chatId].push(message);
      
      // Update chat's last message in the chats list
      const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].last_message = message;
        state.chats[chatIndex].last_activity = message.created_at;
        
        // Sort chats by last activity
        state.chats.sort((a, b) => 
          new Date(b.last_activity) - new Date(a.last_activity)
        );
      }
    },
    
    // Typing indicators management
    updateTypingUsers: (state, action) => {
      const { chatId, userId, username, isTyping } = action.payload;
      
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = {};
      }
      
      if (isTyping) {
        state.typingUsers[chatId][userId] = { 
          username, 
          timestamp: Date.now() 
        };
      } else {
        delete state.typingUsers[chatId][userId];
      }
    },
    
    // Message status updates
    updateMessageStatus: (state, action) => {
      const { chatId, messageId, status } = action.payload;
      
      if (state.messages[chatId]) {
        const messageIndex = state.messages[chatId].findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          state.messages[chatId][messageIndex].status = status;
        }
      }
    },
    
    // Connection status management
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    
    // Error management
    clearError: (state) => {
      state.error = null;
    },
    
    // Cache management (preserved from original hook)
    updateChatIdCache: (state, action) => {
      const { userId, chatId } = action.payload;
      state.chatIdCache[userId] = chatId;
    },
    
    updateMessageCache: (state, action) => {
      const { chatId, messages } = action.payload;
      state.messageCache[chatId] = messages;
      state.lastFetchTime[`messages_${chatId}`] = Date.now();
    },
    
    updateLastFetchTime: (state, action) => {
      const { key, timestamp } = action.payload;
      state.lastFetchTime[key] = timestamp;
    },
    
    // Clear all caches
    clearCache: (state) => {
      state.chatIdCache = {};
      state.messageCache = {};
      state.lastFetchTime = {};
    },
    
    // Replace temp message with sent message
    replaceTemporaryMessage: (state, action) => {
      const { chatId, tempMessageId, sentMessage } = action.payload;
      
      if (state.messages[chatId]) {
        const messageIndex = state.messages[chatId].findIndex(msg => msg.id === tempMessageId);
        if (messageIndex !== -1) {
          state.messages[chatId][messageIndex] = sentMessage;
        }
      }
    },
    
    // Mark temp message as failed
    markMessageAsFailed: (state, action) => {
      const { chatId, tempMessageId } = action.payload;
      
      if (state.messages[chatId]) {
        const messageIndex = state.messages[chatId].findIndex(msg => msg.id === tempMessageId);
        if (messageIndex !== -1) {
          state.messages[chatId][messageIndex].status = 'failed';
        }
      }
    },
    
    // Add new chat to list
    addNewChat: (state, action) => {
      const newChat = action.payload;
      state.chats.unshift(newChat);
    },
    
    // Set current chat
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    
    // Reset state
    resetChats: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Load Chats
      .addCase(loadChats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats = action.payload;
        state.lastFetchTime.chats = Date.now();
      })
      .addCase(loadChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Load Chat by ID
      .addCase(loadChatById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadChatById.fulfilled, (state, action) => {
        const { chat, messages, chatId } = action.payload;
        
        state.isLoading = false;
        state.currentChat = chat;
        state.messages[chatId] = messages;
        
        // Update cache
        state.messageCache[chatId] = messages;
        state.lastFetchTime[`messages_${chatId}`] = Date.now();
      })
      .addCase(loadChatById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create New Chat
      .addCase(createNewChat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats.unshift(action.payload);
      })
      .addCase(createNewChat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Send Message
      .addCase(sendMessage.pending, (state, action) => {
        const { chatId, content, messageType } = action.meta.arg;
        
        // Get current user
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUser = {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          avatar: user.profile?.avatar || null
        };
        
        // Add optimistic message
        const tempMessage = {
          id: `temp_${Date.now()}`,
          content: content.trim(),
          message_type: messageType || 'text',
          sender: currentUser,
          created_at: new Date().toISOString(),
          status: 'sending',
          chat: chatId,
          is_own_message: true
        };
        
        if (!state.messages[chatId]) {
          state.messages[chatId] = [];
        }
        
        state.messages[chatId].push(tempMessage);
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { tempMessage, sentMessage, chatId } = action.payload;
        
        // Replace temp message with sent message
        if (state.messages[chatId]) {
          const messageIndex = state.messages[chatId].findIndex(msg => 
            msg.id.toString().startsWith('temp_') && 
            msg.content === sentMessage.content
          );
          
          if (messageIndex !== -1) {
            state.messages[chatId][messageIndex] = sentMessage;
          }
        }
        
        // Update message cache
        if (state.messageCache[chatId]) {
          state.messageCache[chatId].push(sentMessage);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const { chatId } = action.meta.arg;
        
        // Mark temp messages as failed
        if (state.messages[chatId]) {
          state.messages[chatId] = state.messages[chatId].map(msg =>
            msg.id.toString().startsWith('temp_') 
              ? { ...msg, status: 'failed' }
              : msg
          );
        }
        
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  addRealtimeMessage,
  updateTypingUsers,
  updateMessageStatus,
  setConnectionStatus,
  clearError,
  updateChatIdCache,
  updateMessageCache,
  updateLastFetchTime,
  clearCache,
  replaceTemporaryMessage,
  markMessageAsFailed,
  addNewChat,
  setCurrentChat,
  resetChats
} = chatsSlice.actions;

// Selectors
export const selectChats = (state) => state.chats.chats;
export const selectMessages = (state) => state.chats.messages;
export const selectCurrentChat = (state) => state.chats.currentChat;
export const selectTypingUsers = (state) => state.chats.typingUsers;
export const selectChatsLoading = (state) => state.chats.isLoading;
export const selectChatsConnected = (state) => state.chats.isConnected;
export const selectChatsError = (state) => state.chats.error;
export const selectChatIdCache = (state) => state.chats.chatIdCache;
export const selectMessageCache = (state) => state.chats.messageCache;
export const selectLastFetchTime = (state) => state.chats.lastFetchTime;

// Computed selectors
export const selectChatMessages = (chatId) => (state) => {
  return state.chats.messages[chatId] || [];
};

export const selectChatTypingUsers = (chatId) => (state) => {
  const chatTyping = state.chats.typingUsers[chatId] || {};
  return Object.values(chatTyping).map(user => user.username);
};

export const selectChatById = (chatId) => (state) => {
  return state.chats.chats.find(chat => chat.id === chatId);
};

export default chatsSlice.reducer;