// src/components/ui/Input/Input.jsx
import React, { useState, forwardRef } from 'react';

// ✅ OPTIMIZED: Static input configuration (created once, reused forever)
const INPUT_CONFIG = {
  // Validation state constants
  validationStates: {
    ERROR: 'error',
    SUCCESS: 'success',
    DEFAULT: 'default'
  },
  
  // CSS class configurations
  styles: {
    // Border styles for different states
    borders: {
      error: 'border-red-400 focus:ring-red-400',
      success: 'border-green-400 focus:ring-green-400',
      default: 'border-white border-opacity-30 focus:ring-white'
    },
    
    // Message text styles for different states
    messages: {
      error: 'text-red-400',
      success: 'text-green-400',
      default: 'text-white text-opacity-60'
    },
    
    // Base input styling
    baseInput: 'w-full px-4 py-3 bg-white bg-opacity-10 border rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200',
    
    // Container and label styling
    container: 'space-y-2',
    label: 'block text-white text-sm font-medium',
    
    // Additional element styling
    prefix: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-60 z-10',
    passwordToggle: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-60 hover:text-opacity-100 focus:outline-none',
    loadingContainer: 'absolute right-3 top-1/2 transform -translate-y-1/2'
  },
  
  // Static SVG icons (created once, reused forever)
  icons: {
    eyeOpen: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    
    eyeClosed: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      </svg>
    ),
    
    loading: (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
    )
  }
};

// ✅ OPTIMIZED: Static utility functions (created once, reused forever)
const INPUT_UTILS = {
  // Determine validation state based on props
  getValidationState: (error, success) => {
    if (error) return INPUT_CONFIG.validationStates.ERROR;
    if (success) return INPUT_CONFIG.validationStates.SUCCESS;
    return INPUT_CONFIG.validationStates.DEFAULT;
  },
  
  // Get border classes based on validation state
  getBorderClasses: (error, success) => {
    const state = INPUT_UTILS.getValidationState(error, success);
    return INPUT_CONFIG.styles.borders[state];
  },
  
  // Get message classes based on validation state
  getMessageClasses: (error, success) => {
    const state = INPUT_UTILS.getValidationState(error, success);
    return INPUT_CONFIG.styles.messages[state];
  },
  
  // Build complete input CSS classes
  buildInputClasses: (error, success, prefix, showPasswordToggle, disabled) => {
    const baseClasses = INPUT_CONFIG.styles.baseInput;
    const borderClasses = INPUT_UTILS.getBorderClasses(error, success);
    const paddingLeft = prefix ? 'pl-12' : '';
    const paddingRight = showPasswordToggle ? 'pr-12' : '';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    
    return `${baseClasses} ${borderClasses} ${paddingLeft} ${paddingRight} ${disabledClasses}`.trim();
  },
  
  // Get appropriate password toggle icon
  getPasswordIcon: (showPassword) => {
    return showPassword ? INPUT_CONFIG.icons.eyeOpen : INPUT_CONFIG.icons.eyeClosed;
  },
  
  // Determine input type based on password toggle state
  getInputType: (type, showPasswordToggle, showPassword) => {
    if (showPasswordToggle) {
      return showPassword ? 'text' : 'password';
    }
    return type;
  }
};

const Input = forwardRef(({
  label,
  type = 'text',
  value = '',
  onChange,
  placeholder,
  error,
  success,
  isLoading = false,
  disabled = false,
  prefix,
  showPasswordToggle = false,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // ✅ OPTIMIZED: Using static utility functions (no recreation per render)
  const inputType = INPUT_UTILS.getInputType(type, showPasswordToggle, showPassword);
  const inputClasses = INPUT_UTILS.buildInputClasses(error, success, prefix, showPasswordToggle, disabled);
  const messageClasses = INPUT_UTILS.getMessageClasses(error, success);
  const passwordIcon = INPUT_UTILS.getPasswordIcon(showPassword);

  return (
    <div className={`${INPUT_CONFIG.styles.container} ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={props.id} className={INPUT_CONFIG.styles.label}>
          {label}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Prefix */}
        {prefix && (
          <span className={INPUT_CONFIG.styles.prefix}>
            {prefix}
          </span>
        )}
        
        {/* Input Field */}
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className={INPUT_CONFIG.styles.loadingContainer}>
            {INPUT_CONFIG.icons.loading}
          </div>
        )}
        
        {/* Password Toggle Button */}
        {showPasswordToggle && !isLoading && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={INPUT_CONFIG.styles.passwordToggle}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {passwordIcon}
          </button>
        )}
      </div>
      
      {/* Validation Message */}
      {(error || success) && (
        <p className={`text-sm ${messageClasses}`}>
          {error || success}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;