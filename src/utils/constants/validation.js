// src/utils/constants/validation.js - FIXED VERSION
// ✅ COMPLETE validation constants file - supports all optimized components

// Form states for consistent state management across all components
export const FORM_STATES = {
  IDLE: 'idle',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
  CHECKING: 'checking'
};

// Comprehensive validation configuration for all form fields
export const VALIDATION_CONFIG = {
  // Username validation rules
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9._]*$/,
    CHECK_DELAY: 1000, // Async validation delay in milliseconds
    MESSAGES: {
      REQUIRED: 'Username is required',
      MIN_LENGTH: 'Username must be at least 3 characters',
      MAX_LENGTH: 'Username must be less than 30 characters',
      PATTERN: 'Username can only contain letters, numbers, dots, and underscores',
      SUCCESS: 'Username is available!',
      CHECKING: 'Checking availability...',
      TAKEN: 'Username is already taken',
      INVALID: 'Invalid username format'
    }
  },

  // Phone number validation (Indian mobile numbers)
  PHONE: {
    LENGTH: 10,
    PATTERN: /^[6-9]\d{9}$/, // Indian mobile number pattern
    FORMAT_PATTERN: /\D/g, // Pattern to remove non-digits
    PREFIX: '+91',
    MESSAGES: {
      REQUIRED: 'Phone number is required',
      LENGTH: 'Phone number must be 10 digits',
      PATTERN: 'Phone number must start with 6, 7, 8, or 9',
      SUCCESS: 'Valid Indian mobile number',
      INVALID: 'Invalid phone number format'
    }
  },

  // Email validation rules
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 254, // RFC compliant max email length
    MESSAGES: {
      REQUIRED: 'Email is required',
      PATTERN: 'Please enter a valid email address',
      SUCCESS: 'Valid email address',
      ALREADY_EXISTS: 'Email is already registered',
      VERIFICATION_SENT: 'Verification email sent',
      INVALID: 'Invalid email format',
      TOO_LONG: 'Email address is too long'
    }
  },

  // Password validation rules
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERNS: {
      uppercase: /[A-Z]/,
      lowercase: /[a-z]/,
      number: /\d/,
      special: /[!@#$%^&*(),.?":{}|<>]/
    },
    STRENGTH_THRESHOLDS: {
      WEAK: 25,
      MEDIUM: 50,
      STRONG: 75,
      VERY_STRONG: 100
    },
    MESSAGES: {
      REQUIRED: 'Password is required',
      MIN_LENGTH: 'Password must be at least 8 characters',
      MAX_LENGTH: 'Password cannot exceed 128 characters',
      UPPERCASE: 'Must contain at least one uppercase letter',
      LOWERCASE: 'Must contain at least one lowercase letter',
      NUMBER: 'Must contain at least one number',
      SPECIAL: 'Must contain at least one special character',
      SUCCESS: 'Strong password!',
      WEAK: 'Weak password',
      MEDIUM: 'Medium password',
      STRONG: 'Strong password',
      VERY_STRONG: 'Very strong password',
      INVALID: 'Invalid password format'
    }
  },

  // ✅ FIXED: Full name validation rules (matches SignUpForm field name)
  FULL_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]*$/, // Letters, spaces, hyphens, apostrophes
    MESSAGES: {
      REQUIRED: 'Full name is required',
      MIN_LENGTH: 'Full name must be at least 2 characters',
      MAX_LENGTH: 'Full name cannot exceed 50 characters',
      PATTERN: 'Full name can only contain letters, spaces, hyphens, and apostrophes',
      SUCCESS: 'Looks good!',
      INVALID: 'Invalid name format'
    }
  },

  // Name validation rules (keeping for backward compatibility)
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]*$/, // Letters, spaces, hyphens, apostrophes
    MESSAGES: {
      REQUIRED: 'Name is required',
      MIN_LENGTH: 'Name must be at least 2 characters',
      MAX_LENGTH: 'Name cannot exceed 50 characters',
      PATTERN: 'Name can only contain letters, spaces, hyphens, and apostrophes',
      SUCCESS: 'Looks good!',
      INVALID: 'Invalid name format'
    }
  },

  // Confirm password validation
  CONFIRM_PASSWORD: {
    MESSAGES: {
      REQUIRED: 'Please confirm your password',
      MATCH: 'Passwords do not match',
      SUCCESS: 'Passwords match!',
      INVALID: 'Password confirmation required'
    }
  }
};

// OTP (One-Time Password) configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_TIME: 300, // 5 minutes in seconds
  RESEND_DELAY: 60, // 1 minute in seconds
  MAX_ATTEMPTS: 3,
  MOCK_OTP: '123456', // For development/demo purposes
  PATTERN: /^\d{6}$/, // Exactly 6 digits
  MESSAGES: {
    SENT: 'OTP sent successfully',
    EXPIRED: 'OTP has expired. Please request a new one',
    INVALID: 'Invalid OTP. Please try again',
    MAX_ATTEMPTS: 'Maximum attempts exceeded. Please request a new OTP',
    SUCCESS: 'OTP verified successfully!',
    REQUIRED: 'Please enter the OTP',
    LENGTH: 'OTP must be 6 digits',
    RESEND_AVAILABLE: 'You can resend OTP now',
    RESEND_WAIT: 'Please wait before requesting new OTP'
  }
};

// API configuration for form submissions
export const API_CONFIG = {
  ENDPOINTS: {
    // Authentication endpoints
    VALIDATE_USERNAME: '/api/auth/validate-username',
    VALIDATE_EMAIL: '/api/auth/validate-email',
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    GOOGLE_AUTH: '/api/auth/google',
    FACEBOOK_AUTH: '/api/auth/facebook',
    
    // User management endpoints
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/update',
    CHANGE_PASSWORD: '/api/user/change-password',
    DELETE_ACCOUNT: '/api/user/delete'
  },
  
  TIMEOUTS: {
    DEFAULT: 5000, // 5 seconds
    UPLOAD: 30000, // 30 seconds for file uploads
    AUTH: 10000, // 10 seconds for authentication
    VALIDATION: 3000 // 3 seconds for field validation
  },
  
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second between retries
    BACKOFF_MULTIPLIER: 2 // Exponential backoff
  }
};

// Form timing configuration for various operations
export const TIMING_CONFIG = {
  DEBOUNCE_DELAY: 300, // For real-time validation
  SUBMIT_DELAY: 2000, // Mock submission delay
  SUCCESS_DISPLAY: 1500, // How long to show success state
  ERROR_DISPLAY: 3000, // How long to show error state
  LOADING_MIN: 500, // Minimum loading time for UX
  
  ANIMATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000
  },
  
  VALIDATION: {
    REAL_TIME_DELAY: 500, // Delay for real-time validation
    ASYNC_CHECK_DELAY: 1000, // Delay for async validations (username, email)
    SUCCESS_SHOW_TIME: 2000 // How long to show success messages
  }
};

// Theme configuration for consistent styling
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#a855f7', // Purple
    SECONDARY: '#ec4899', // Pink
    SUCCESS: '#22c55e', // Green
    ERROR: '#ef4444', // Red
    WARNING: '#f59e0b', // Yellow/Orange
    INFO: '#3b82f6', // Blue
    NEUTRAL: '#6b7280' // Gray
  },
  
  GRADIENTS: {
    PRIMARY: 'linear-gradient(135deg, #a855f7, #ec4899)',
    SUCCESS: 'linear-gradient(135deg, #22c55e, #16a34a)',
    ERROR: 'linear-gradient(135deg, #ef4444, #dc2626)',
    BACKGROUND: 'linear-gradient(135deg, #667eea, #764ba2)'
  },
  
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48
  },
  
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
    XXL: 24,
    FULL: '50%'
  },
  
  SHADOWS: {
    SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
};

// Comprehensive error messages for different scenarios
export const ERROR_MESSAGES = {
  // Network and connectivity errors
  NETWORK: 'Network error. Please check your internet connection.',
  SERVER: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  CONNECTION: 'Unable to connect. Please check your connection.',
  
  // Form validation errors
  VALIDATION: 'Please fix the form errors and try again.',
  REQUIRED_FIELDS: 'Please fill in all required fields.',
  INVALID_FORMAT: 'Please check the format of your inputs.',
  
  // Authentication errors
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Account is temporarily locked. Please try again later.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Resource errors
  NOT_FOUND: 'Resource not found.',
  ALREADY_EXISTS: 'This item already exists.',
  QUOTA_EXCEEDED: 'You have exceeded your quota.',
  
  // Generic fallback
  GENERIC: 'Something went wrong. Please try again.',
  UNKNOWN: 'An unknown error occurred.',
  MAINTENANCE: 'System is under maintenance. Please try again later.'
};

// Success messages for positive feedback
export const SUCCESS_MESSAGES = {
  // Authentication success
  REGISTRATION: 'Account created successfully! Welcome to Connectify!',
  LOGIN: 'Welcome back! You have been logged in successfully.',
  LOGOUT: 'You have been logged out successfully.',
  
  // Profile and account management
  PROFILE_UPDATE: 'Your profile has been updated successfully.',
  PASSWORD_CHANGE: 'Your password has been changed successfully.',
  EMAIL_VERIFIED: 'Your email has been verified successfully.',
  ACCOUNT_DELETED: 'Your account has been deleted successfully.',
  
  // OTP and verification
  OTP_SENT: 'Verification code has been sent to your email/phone.',
  OTP_VERIFIED: 'Verification code confirmed successfully!',
  
  // Data operations
  DATA_SAVED: 'Your data has been saved successfully.',
  FILE_UPLOADED: 'File uploaded successfully.',
  CHANGES_SAVED: 'Your changes have been saved.',
  
  // Generic success
  OPERATION_SUCCESSFUL: 'Operation completed successfully.',
  ACTION_COMPLETED: 'Action completed successfully.'
};

// Loading messages for better user experience
export const LOADING_MESSAGES = {
  // General loading states
  LOADING: 'Loading...',
  PROCESSING: 'Processing your request...',
  PLEASE_WAIT: 'Please wait...',
  
  // Form-specific loading states
  SUBMITTING: 'Submitting form...',
  VALIDATING: 'Validating information...',
  CHECKING: 'Checking availability...',
  SENDING: 'Sending verification code...',
  VERIFYING: 'Verifying code...',
  
  // Authentication loading states
  LOGGING_IN: 'Logging you in...',
  CREATING_ACCOUNT: 'Creating your account...',
  UPDATING_PROFILE: 'Updating your profile...',
  
  // Data operations
  SAVING: 'Saving changes...',
  UPLOADING: 'Uploading file...',
  DOWNLOADING: 'Downloading...',
  FETCHING: 'Fetching data...'
};

// Validation utility constants
export const VALIDATION_UTILS = {
  // Common regex patterns
  PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_INDIAN: /^[6-9]\d{9}$/,
    USERNAME: /^[a-zA-Z0-9._]*$/,
    PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
    NAME: /^[a-zA-Z\s'-]*$/,
    DIGITS_ONLY: /^\d+$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]*$/
  },
  
  // Common validation functions
  VALIDATORS: {
    isRequired: (value) => value && value.toString().trim().length > 0,
    hasMinLength: (value, min) => value && value.toString().length >= min,
    hasMaxLength: (value, max) => value && value.toString().length <= max,
    matchesPattern: (value, pattern) => pattern.test(value),
    isEmail: (value) => VALIDATION_UTILS.PATTERNS.EMAIL.test(value),
    isPhoneNumber: (value) => VALIDATION_UTILS.PATTERNS.PHONE_INDIAN.test(value.replace(/\D/g, '')),
    isStrongPassword: (value) => value && value.length >= 8 && VALIDATION_UTILS.PATTERNS.PASSWORD_STRONG.test(value)
  }
};

// Export default object for easy importing
export default {
  FORM_STATES,
  VALIDATION_CONFIG,
  OTP_CONFIG,
  API_CONFIG,
  TIMING_CONFIG,
  THEME_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  VALIDATION_UTILS
};