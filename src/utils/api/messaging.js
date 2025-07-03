// src/utils/api/messaging.js - Complete Messaging API Integration
import { tokenManager } from '../api';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
  const token = tokenManager.getAccessToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// =====================================================
// CHAT MANAGEMENT API
// =====================================================

/**
 * Get all chats for the current user
 * GET /api/messaging/chats/
 */
export const getChats = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/chats/?page=${page}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chats: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
};

/**
 * Create a new chat
 * POST /api/messaging/chats/
 */
export const createChat = async (participantIds, isGroupChat = false, chatName = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/chats/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        participant_ids: participantIds,
        is_group_chat: isGroupChat,
        chat_name: chatName
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create chat: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

/**
 * Get a specific chat with details
 * GET /api/messaging/chats/{id}/
 */
export const getChat = async (chatId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/chats/${chatId}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chat: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching chat:', error);
    throw error;
  }
};

/**
 * Update a chat (group chat name, etc.)
 * PUT /api/messaging/chats/{id}/
 */
export const updateChat = async (chatId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/chats/${chatId}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update chat: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating chat:', error);
    throw error;
  }
};

/**
 * Delete/leave a chat
 * DELETE /api/messaging/chats/{id}/
 */
export const deleteChat = async (chatId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/chats/${chatId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete chat: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

// =====================================================
// MESSAGE MANAGEMENT API
// =====================================================

/**
 * Get messages for a specific chat
 * GET /api/messaging/chats/{id}/messages/
 */
export const getMessages = async (chatId, page = 1, limit = 50) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/messaging/chats/${chatId}/messages/?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Send a new message
 * POST /api/messaging/chats/{id}/messages/
 */
export const sendMessage = async (chatId, content, messageType = 'text', attachment = null, replyTo = null) => {
  try {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('message_type', messageType);
    
    if (attachment) {
      formData.append('attachment', attachment);
    }
    
    if (replyTo) {
      formData.append('reply_to', replyTo);
    }

    const token = tokenManager.getAccessToken();
    const response = await fetch(
      `${API_BASE_URL}/messaging/chats/${chatId}/messages/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get specific message details
 * GET /api/messaging/messages/{id}/
 */
export const getMessage = async (messageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/messages/${messageId}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch message: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching message:', error);
    throw error;
  }
};

/**
 * Update a message (edit)
 * PUT /api/messaging/messages/{id}/
 */
export const updateMessage = async (messageId, content) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/messages/${messageId}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update message: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

/**
 * Delete a message
 * DELETE /api/messaging/messages/{id}/
 */
export const deleteMessage = async (messageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/messages/${messageId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete message: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// =====================================================
// MESSAGE STATUS API
// =====================================================

/**
 * Mark message as read
 * POST /api/messaging/messages/{id}/read/
 */
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/messages/${messageId}/read/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark message as read: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

/**
 * Mark message as delivered
 * POST /api/messaging/messages/{id}/delivered/
 */
export const markMessageAsDelivered = async (messageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/messages/${messageId}/delivered/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark message as delivered: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking message as delivered:', error);
    throw error;
  }
};

// =====================================================
// USER SEARCH API
// =====================================================

/**
 * Search users to start chat with
 * GET /api/messaging/search/users/?q=query
 */
export const searchUsers = async (query) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/messaging/search/users/?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search users: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// =====================================================
// CHAT PARTICIPANTS API
// =====================================================

/**
 * Get chat participants
 * GET /api/messaging/chats/{id}/participants/
 */
export const getChatParticipants = async (chatId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messaging/chats/${chatId}/participants/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get chat participants: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting chat participants:', error);
    throw error;
  }
};

/**
 * Add participant to chat
 * POST /api/messaging/chats/{id}/participants/{user_id}/
 */
export const addChatParticipant = async (chatId, userId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/messaging/chats/${chatId}/participants/${userId}/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add participant: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
};

/**
 * Remove participant from chat
 * DELETE /api/messaging/chats/{id}/participants/{user_id}/
 */
export const removeChatParticipant = async (chatId, userId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/messaging/chats/${chatId}/participants/${userId}/`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to remove participant: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing participant:', error);
    throw error;
  }
};

// =====================================================
// WEBSOCKET CONNECTION CLASS
// =====================================================

/**
 * WebSocket connection for real-time messaging
 */
export class MessagingWebSocket {
  constructor(chatId, onMessage, onTyping, onStatus, onError, onClose) {
    this.chatId = chatId;
    this.ws = null;
    this.onMessage = onMessage;
    this.onTyping = onTyping;
    this.onStatus = onStatus;
    this.onError = onError;
    this.onClose = onClose;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    const token = tokenManager.getAccessToken();
    if (!token) {
      this.onError?.('No authentication token available');
      return;
    }

    const wsUrl = `ws://localhost:8000/ws/chat/${this.chatId}/?token=${token}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected for chat:', this.chatId);
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'new_message':
              this.onMessage?.(data.message);
              break;
            case 'typing_indicator':
              this.onTyping?.(data);
              break;
            case 'message_status':
              this.onStatus?.(data);
              break;
            case 'connection_established':
              console.log('WebSocket connection confirmed:', data.message);
              break;
            case 'error':
              console.error('WebSocket error from server:', data.message);
              this.onError?.(data.message);
              break;
            default:
              console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.onError?.('Failed to parse message');
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.onClose?.(event);
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect();
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError?.(error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.onError?.(error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(content, replyTo = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'chat_message',
        content: content,
        reply_to: replyTo
      }));
    } else {
      console.error('WebSocket is not connected');
      this.onError?.('Connection not available');
    }
  }

  sendTypingStart() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing_start'
      }));
    }
  }

  sendTypingStop() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing_stop'
      }));
    }
  }

  markMessageRead(messageId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message_read',
        message_id: messageId
      }));
    }
  }

  markMessageDelivered(messageId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message_delivered',
        message_id: messageId
      }));
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export default object for easier importing
const messagingAPI = {
  // Chat management
  getChats,
  createChat,
  getChat,
  updateChat,
  deleteChat,
  
  // Message management
  getMessages,
  sendMessage,
  getMessage,
  updateMessage,
  deleteMessage,
  
  // Message status
  markMessageAsRead,
  markMessageAsDelivered,
  
  // User search
  searchUsers,
  
  // Chat participants
  getChatParticipants,
  addChatParticipant,
  removeChatParticipant,
  
  // WebSocket class
  MessagingWebSocket
};

export default messagingAPI;