// src/hooks/useFormValidation.js - FIXED VERSION
import { useReducer, useCallback, useMemo } from 'react';
import { VALIDATION_CONFIG, FORM_STATES } from '../utils/constants/validation';

// ✅ OPTIMIZED: Static validation functions (created once, reused forever)
const FORM_VALIDATORS = {
  // ✅ FIXED: Full name validation (matches SignUpForm field)
  full_name: (value) => {
    const config = VALIDATION_CONFIG.FULL_NAME;
    const trimmed = value.trim();
    
    if (!trimmed) {
      return { isValid: false, message: config.MESSAGES.REQUIRED };
    }
    
    if (trimmed.length < config.MIN_LENGTH) {
      return { isValid: false, message: config.MESSAGES.MIN_LENGTH };
    }
    
    if (trimmed.length > config.MAX_LENGTH) {
      return { isValid: false, message: config.MESSAGES.MAX_LENGTH };
    }
    
    if (!config.PATTERN.test(trimmed)) {
      return { isValid: false, message: config.MESSAGES.PATTERN };
    }
    
    return { isValid: true, message: config.MESSAGES.SUCCESS };
  },

  // Name validation (keeping for backward compatibility)
  name: (value) => {
    const config = VALIDATION_CONFIG.NAME;
    const trimmed = value.trim();
    
    if (!trimmed) {
      return { isValid: false, message: config.MESSAGES.REQUIRED };
    }
    
    if (trimmed.length < config.MIN_LENGTH) {
      return { isValid: false, message: config.MESSAGES.MIN_LENGTH };
    }
    
    if (trimmed.length > config.MAX_LENGTH) {
      return { isValid: false, message: config.MESSAGES.MAX_LENGTH };
    }
    
    if (!config.PATTERN.test(trimmed)) {
      return { isValid: false, message: config.MESSAGES.PATTERN };
    }
    
    return { isValid: true, message: config.MESSAGES.SUCCESS };
  },

  // Username validation
  username: (value) => {
    const config = VALIDATION_CONFIG.USERNAME;
    const trimmed = value.trim().toLowerCase();
    
    if (!trimmed) {
      return { isValid: false, message: config.MESSAGES.REQUIRED };
    }
    
    if (trimmed.length < config.MIN_LENGTH) {
      return { isValid: false, message: config.MESSAGES.MIN_LENGTH };
    }
    
    if (trimmed.length > config.MAX_LENGTH) {
      return { isValid: false, message: config.MESSAGES.MAX_LENGTH };
    }
    
    if (!config.PATTERN.test(trimmed)) {
      return { isValid: false, message: config.MESSAGES.PATTERN };
    }
    
    return { isValid: true, message: config.MESSAGES.SUCCESS };
  },

  // Phone validation
  phone: (value) => {
    const config = VALIDATION_CONFIG.PHONE;
    const cleaned = value.replace(config.FORMAT_PATTERN, '');
    
    if (!cleaned) {
      return { isValid: false, message: config.MESSAGES.REQUIRED };
    }
    
    if (cleaned.length !== config.LENGTH) {
      return { isValid: false, message: config.MESSAGES.LENGTH };
    }
    
    if (!config.PATTERN.test(cleaned)) {
      return { isValid: false, message: config.MESSAGES.PATTERN };
    }
    
    return { isValid: true, message: config.MESSAGES.SUCCESS };
  },

  // Email validation
  email: (value) => {
    const config = VALIDATION_CONFIG.EMAIL;
    const trimmed = value.trim().toLowerCase();
    
    if (!trimmed) {
      return { isValid: false, message: config.MESSAGES.REQUIRED };
    }
    
    if (!config.PATTERN.test(trimmed)) {
      return { isValid: false, message: config.MESSAGES.PATTERN };
    }
    
    if (trimmed.length > config.MAX_LENGTH) {
      return { isValid: false, message: config.MESSAGES.TOO_LONG };
    }
    
    return { isValid: true, message: config.MESSAGES.SUCCESS };
  },

  // Password validation with strength calculation
  password: (value) => {
    const config = VALIDATION_CONFIG.PASSWORD;
    let strength = 0;
    const requirements = [];

    if (!value) {
      return { isValid: false, message: config.MESSAGES.REQUIRED, strength: 0 };
    }

    if (value.length < config.MIN_LENGTH) {
      requirements.push(config.MESSAGES.MIN_LENGTH);
    } else {
      strength += 25;
    }

    // Check pattern requirements
    if (!config.PATTERNS.uppercase.test(value)) {
      requirements.push(config.MESSAGES.UPPERCASE);
    } else {
      strength += 25;
    }

    if (!config.PATTERNS.lowercase.test(value)) {
      requirements.push(config.MESSAGES.LOWERCASE);
    } else {
      strength += 25;
    }

    if (!config.PATTERNS.number.test(value)) {
      requirements.push(config.MESSAGES.NUMBER);
    } else {
      strength += 25;
    }

    // Bonus points for special characters
    if (config.PATTERNS.special.test(value)) {
      strength = Math.min(strength + 10, 100);
    }

    const isValid = requirements.length === 0;
    const message = isValid 
      ? config.MESSAGES.SUCCESS 
      : `Missing: ${requirements.join(', ')}`;

    return { isValid, message, strength };
  },

  // Confirm password validation
  confirmPassword: (value, originalPassword) => {
    const config = VALIDATION_CONFIG.CONFIRM_PASSWORD;
    
    if (!value) {
      return { isValid: false, message: config.MESSAGES.REQUIRED };
    }
    
    if (value !== originalPassword) {
      return { isValid: false, message: config.MESSAGES.MATCH };
    }
    
    return { isValid: true, message: config.MESSAGES.SUCCESS };
  }
};

// ✅ OPTIMIZED: Form reducer for efficient state management
const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value }
      };
    
    case 'SET_VALIDATION':
      return {
        ...state,
        validation: { ...state.validation, [action.field]: action.result },
        touched: { ...state.touched, [action.field]: true }
      };
    
    case 'SET_CHECKING':
      return {
        ...state,
        validation: {
          ...state.validation,
          [action.field]: { 
            ...state.validation[action.field], 
            isChecking: action.isChecking 
          }
        }
      };
    
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true }
      };
    
    case 'RESET':
      return {
        values: action.initialValues,
        validation: {},
        touched: {}
      };
    
    default:
      return state;
  }
};

// ✅ OPTIMIZED: Main hook with static functions and configuration
export const useFormValidation = (initialValues = {}) => {
  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    validation: {},
    touched: {}
  });

  // ✅ OPTIMIZED: Validate field using static validators
  const validateField = useCallback(async (field, value) => {
    // Handle special case for confirmPassword
    if (field === 'confirmPassword') {
      const result = FORM_VALIDATORS.confirmPassword(value, state.values.password);
      dispatch({ type: 'SET_VALIDATION', field, result });
      return;
    }

    // ✅ FIXED: Handle username async validation with REAL Django API
    if (field === 'username') {
      dispatch({ type: 'SET_CHECKING', field, isChecking: true });
      
      // First do basic validation (format, length, etc.)
      const basicValidation = FORM_VALIDATORS.username(value);
      
      if (!basicValidation.isValid) {
        // If basic validation fails, don't check availability
        dispatch({ type: 'SET_VALIDATION', field, result: basicValidation });
        dispatch({ type: 'SET_CHECKING', field, isChecking: false });
        return;
      }
      
      // If basic validation passes, check availability with Django
      try {
        // This will call Django API to check if username exists in database
        const availabilityCheck = await checkUsernameWithDjango(value);
        dispatch({ type: 'SET_VALIDATION', field, result: availabilityCheck });
        dispatch({ type: 'SET_CHECKING', field, isChecking: false });
      } catch (error) {
        dispatch({ type: 'SET_VALIDATION', field, result: {
          isValid: false,
          message: 'Could not check username availability'
        }});
        dispatch({ type: 'SET_CHECKING', field, isChecking: false });
      }
      return;
    }

    // Regular validation for other fields
    const validator = FORM_VALIDATORS[field];
    if (validator) {
      const result = validator(value);
      dispatch({ type: 'SET_VALIDATION', field, result });
    } else {
      // ✅ FIXED: Log missing validator for debugging
      console.warn(`No validator found for field: ${field}. Available validators:`, Object.keys(FORM_VALIDATORS));
    }
  }, [state.values.password]);

// ✅ HELPER FUNCTION: Call Django API for username checking
const checkUsernameWithDjango = async (username) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/auth/check-username/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username })
    });
    
    const data = await response.json();
    console.log('Django username check response:', data);
    
    if (response.ok) {
      return {
        isValid: data.available,  // Django returns { available: true/false }
        message: data.available 
          ? 'Username is available!' 
          : 'Username is already taken'
      };
    } else {
      return {
        isValid: false,
        message: data.message || 'Could not check username availability'
      };
    }
  } catch (error) {
    console.error('Username check error:', error);
    return {
      isValid: false,
      message: 'Could not check username availability'
    };
  }
};

  // ✅ OPTIMIZED: Handle field changes with validation
  const handleChange = useCallback((field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
    
    // Re-validate if field was already touched
    if (state.touched[field]) {
      validateField(field, value);
    }
    
    // Re-validate confirmPassword if password changes
    if (field === 'password' && state.values.confirmPassword && state.touched.confirmPassword) {
      validateField('confirmPassword', state.values.confirmPassword);
    }
  }, [state.touched, state.values.confirmPassword, validateField]);

  // ✅ OPTIMIZED: Handle field blur events
  const handleBlur = useCallback((field) => {
    dispatch({ type: 'SET_TOUCHED', field });
    validateField(field, state.values[field]);
  }, [state.values, validateField]);

  // ✅ OPTIMIZED: Check if entire form is valid
  const isValid = useMemo(() => {
    const fieldNames = Object.keys(initialValues);
    
    // All fields must be touched and valid
    const allTouched = fieldNames.every(field => state.touched[field]);
    const allValid = fieldNames.every(field => {
      const validation = state.validation[field];
      return validation && validation.isValid && !validation.isChecking;
    });
    
    // ✅ DEBUGGING: Log validation state for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Form Validation Debug:', {
        fieldNames,
        allTouched,
        allValid,
        isFormValid: allTouched && allValid && fieldNames.length > 0,
        touchedFields: state.touched,
        validationResults: state.validation
      });
    }
    
    return allTouched && allValid && fieldNames.length > 0;
  }, [state.validation, state.touched, initialValues]);

  // ✅ OPTIMIZED: Reset form to initial state
  const reset = useCallback(() => {
    dispatch({ type: 'RESET', initialValues });
  }, [initialValues]);

  // ✅ OPTIMIZED: Get field validation status
  const getFieldStatus = useCallback((field) => {
    const validation = state.validation[field];
    const isTouched = state.touched[field];
    
    return {
      isValid: validation?.isValid || false,
      isInvalid: isTouched && validation && !validation.isValid,
      isChecking: validation?.isChecking || false,
      isTouched,
      message: validation?.message || '',
      strength: validation?.strength || 0
    };
  }, [state.validation, state.touched]);

  // ✅ OPTIMIZED: Validate all fields at once
  const validateAll = useCallback(() => {
    const fieldNames = Object.keys(initialValues);
    
    fieldNames.forEach(field => {
      dispatch({ type: 'SET_TOUCHED', field });
      validateField(field, state.values[field]);
    });
  }, [initialValues, state.values, validateField]);

  return {
    // Form state
    values: state.values,
    validation: state.validation,
    touched: state.touched,
    isValid,
    
    // Actions
    handleChange,
    handleBlur,
    reset,
    validateAll,
    getFieldStatus
  };
};