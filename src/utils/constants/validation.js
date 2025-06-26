// ===== src/utils/constants/validation.js - COMPLETE FIXED VERSION =====

// Form states for consistent state management across all components
export const FORM_STATES = {
  IDLE: 'idle',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
  CHECKING: 'checking'
};

// ✅ COMPLETE validation configuration for all form fields
export const VALIDATION_CONFIG = {
  // ✅ Full name validation rules (matches SignUpForm field name)
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

  // ✅ Name validation rules (keeping for backward compatibility)
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

  // ✅ Username validation rules
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

  // ✅ Phone number validation (Indian mobile numbers)
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

  // ✅ Email validation rules
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

  // ✅ Password validation rules
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

  // ✅ Confirm password validation
  CONFIRM_PASSWORD: {
    MESSAGES: {
      REQUIRED: 'Please confirm your password',
      MATCH: 'Passwords do not match',
      SUCCESS: 'Passwords match!',
      INVALID: 'Password confirmation required'
    }
  }
};

// ✅ OTP (One-Time Password) configuration
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
    RESEND_AVAILABLE: 'You can resend OTP now',
    WAIT_TO_RESEND: 'Please wait before requesting a new OTP',
    SENDING: 'Sending OTP...',
    VERIFYING: 'Verifying OTP...'
  }
};

// ✅ API configuration constants
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  ENDPOINTS: {
    BASE_URL: 'http://127.0.0.1:8000',
    AUTH: {
      LOGIN: '/api/auth/login/',
      REGISTER: '/api/auth/register/',
      LOGOUT: '/api/auth/logout/',
      REFRESH: '/api/auth/refresh/',
      VERIFY_EMAIL: '/api/auth/verify-email/',
      SEND_OTP: '/api/auth/send-otp/',
      VERIFY_OTP: '/api/auth/verify-otp/',
      CHECK_USERNAME: '/api/auth/check-username/',
      CHECK_EMAIL: '/api/auth/check-email/'
    }
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// ✅ Timing configuration for various operations
export const TIMING_CONFIG = {
  // Form submission and processing
  FORM_SUBMIT_DELAY: 1000,
  SUCCESS_MESSAGE_DISPLAY: 2000,
  ERROR_MESSAGE_DISPLAY: 3000,
  
  // OTP related timing
  OTP_SEND_DELAY: 2000,
  OTP_VERIFICATION_DELAY: 1500,
  OTP_TIMER_DURATION: 60,
  
  // Username availability check
  USERNAME_CHECK_DELAY: 1000,
  
  // UI transitions and animations
  MODAL_TRANSITION: 300,
  TOOLTIP_DELAY: 500,
  DEBOUNCE_DELAY: 300,
  
  // API timeouts
  API_TIMEOUT: 10000,
  FILE_UPLOAD_TIMEOUT: 30000
};

// ✅ Theme and UI configuration
export const THEME_CONFIG = {
  // Color scheme
  COLORS: {
    PRIMARY: '#8B5CF6', // Purple
    SECONDARY: '#EC4899', // Pink
    SUCCESS: '#10B981', // Green
    ERROR: '#EF4444', // Red
    WARNING: '#F59E0B', // Yellow
    INFO: '#3B82F6' // Blue
  },
  
  // Component sizes
  SIZES: {
    INPUT_HEIGHT: 'h-12',
    BUTTON_HEIGHT: 'h-12',
    MODAL_WIDTH: 'max-w-md',
    BORDER_RADIUS: 'rounded-xl'
  },
  
  // Animation classes
  ANIMATIONS: {
    FADE_IN: 'animate-fade-in',
    SLIDE_UP: 'animate-slide-up',
    SPIN: 'animate-spin',
    PULSE: 'animate-pulse'
  }
};

// ✅ Error messages for different scenarios
export const ERROR_MESSAGES = {
  // Network and connectivity errors
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  CONNECTION_LOST: 'Connection lost. Please check your internet connection.',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  ACCOUNT_NOT_FOUND: 'No account found with this email address.',
  ACCOUNT_SUSPENDED: 'Your account has been suspended. Please contact support.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  
  // Form validation errors
  FORM_INVALID: 'Please fix the errors in the form and try again.',
  REQUIRED_FIELDS: 'Please fill in all required fields.',
  INVALID_FORMAT: 'Please check the format of your input.',
  
  // File upload errors
  FILE_TOO_LARGE: 'File size is too large. Please choose a smaller file.',
  INVALID_FILE_TYPE: 'Invalid file type. Please choose a different file.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  
  // Generic errors
  SOMETHING_WRONG: 'Something went wrong. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please contact support if this persists.',
  OPERATION_FAILED: 'Operation failed. Please try again.'
};

// ✅ Success messages for different scenarios
export const SUCCESS_MESSAGES = {
  // Authentication success
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PASSWORD_RESET: 'Password reset successfully!',
  
  // Email and verification
  EMAIL_SENT: 'Email sent successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  
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

// ✅ Loading messages for better user experience
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

// ✅ Validation utility constants
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

// ✅ Export default object for easy importing
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