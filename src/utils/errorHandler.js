// src/utils/errorHandler.js

/**
 * Centralized error handling utility for API operations
 * Provides consistent error formatting and user feedback
 */

/**
 * API Error types for different scenarios
 */
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication', 
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  VALIDATION: 'validation',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Network connection failed. Please check your internet connection.',
  [ERROR_TYPES.AUTHENTICATION]: 'Please log in to continue.',
  [ERROR_TYPES.AUTHORIZATION]: 'You do not have permission to perform this action.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested content could not be found.',
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.SERVER]: 'Server error occurred. Please try again later.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Determine error type based on error object or HTTP status
 */
export const getErrorType = (error, status = null) => {
  if (!error && !status) return ERROR_TYPES.UNKNOWN;

  // Check HTTP status codes
  if (status || error.status) {
    const statusCode = status || error.status;
    switch (statusCode) {
      case 401:
        return ERROR_TYPES.AUTHENTICATION;
      case 403:
        return ERROR_TYPES.AUTHORIZATION;
      case 404:
        return ERROR_TYPES.NOT_FOUND;
      case 422:
      case 400:
        return ERROR_TYPES.VALIDATION;
      case 500:
      case 502:
      case 503:
        return ERROR_TYPES.SERVER;
      default:
        return ERROR_TYPES.UNKNOWN;
    }
  }

  // Check error message patterns
  if (error.message) {
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_TYPES.NETWORK;
    }
    if (message.includes('unauthorized') || message.includes('token')) {
      return ERROR_TYPES.AUTHENTICATION;
    }
    if (message.includes('forbidden')) {
      return ERROR_TYPES.AUTHORIZATION;
    }
  }

  return ERROR_TYPES.UNKNOWN;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error, status = null) => {
  const errorType = getErrorType(error, status);
  return ERROR_MESSAGES[errorType];
};

/**
 * Format error for logging
 */
export const formatErrorForLogging = (error, context = '') => {
  const timestamp = new Date().toISOString();
  const errorType = getErrorType(error);
  
  return {
    timestamp,
    context,
    type: errorType,
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    status: error?.status,
    response: error?.response?.data
  };
};

/**
 * Handle API errors with consistent logging and user feedback
 */
export const handleApiError = (error, context = '', options = {}) => {
  const {
    showToast = false,
    logToConsole = true,
    throwError = false
  } = options;

  // Format error for logging
  const formattedError = formatErrorForLogging(error, context);
  
  if (logToConsole) {
    console.error('API Error:', formattedError);
  }

  // Get user-friendly message
  const userMessage = getErrorMessage(error);

  // Show toast notification if requested
  if (showToast && window.toast) {
    window.toast.error(userMessage);
  }

  // Throw error if requested (for component error boundaries)
  if (throwError) {
    throw new Error(userMessage);
  }

  return {
    type: formattedError.type,
    message: userMessage,
    originalError: error,
    timestamp: formattedError.timestamp
  };
};

/**
 * Retry mechanism for failed API calls
 */
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry for client errors (4xx)
      if (error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retry with exponential backoff
      const retryDelay = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      console.warn(`API call failed (attempt ${attempt}/${maxRetries}), retrying in ${retryDelay}ms...`);
    }
  }

  throw lastError;
};

/**
 * Debounced error handler to prevent spam
 */
let errorDebounceTimeout;
export const debouncedErrorHandler = (error, context = '', delay = 500) => {
  clearTimeout(errorDebounceTimeout);
  errorDebounceTimeout = setTimeout(() => {
    handleApiError(error, context, { showToast: true });
  }, delay);
};

export default {
  ERROR_TYPES,
  getErrorType,
  getErrorMessage,
  formatErrorForLogging,
  handleApiError,
  retryApiCall,
  debouncedErrorHandler
};