// ===== src/hooks/useFormValidation.js - COMPLETE FIXED VERSION =====
import { useReducer, useCallback, useMemo } from 'react';
import { VALIDATION_CONFIG, FORM_STATES } from '../utils/constants/validation';

// ✅ COMPLETE validation functions for all form fields
const FORM_VALIDATORS = {
  // ✅ Full name validation (matches SignUpForm field)
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

  // ✅ Name validation (keeping for backward compatibility)
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

  // ✅ Username validation
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

  // ✅ Phone validation
  phone: (value) => {
    const config = VALIDATION_CONFIG.PHONE;
    const cleaned = value.replace(/\D/g, ''); // Remove all non-digits
    
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

  // ✅ Email validation
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

  // ✅ Password validation with strength calculation
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

  // ✅ Confirm password validation
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

// ✅ Django API check for username availability
const checkUsernameAvailability = async (username) => {
  try {
    console.log('Checking username availability with Django:', username);

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
        isValid: data.available,
        message: data.available
          ? 'Username is available!'
          : 'Username is already taken',
        isChecking: false
      };
    } else {
      return {
        isValid: false,
        message: data.message || 'Could not check username availability',
        isChecking: false
      };
    }
  } catch (error) {
    console.error('Username check network error:', error);
    return {
      isValid: false,
      message: 'Could not check username availability',
      isChecking: false
    };
  }
};

// ✅ Form reducer for efficient state management
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

// ✅ Main useFormValidation hook
export const useFormValidation = (initialValues = {}) => {
  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    validation: {},
    touched: {}
  });

  // ✅ Validate field using static validators
  const validateField = useCallback(async (field, value) => {
    // Handle special case for confirmPassword
    if (field === 'confirmPassword') {
      const result = FORM_VALIDATORS.confirmPassword(value, state.values.password);
      dispatch({ type: 'SET_VALIDATION', field, result });
      return;
    }

    // ✅ Handle username async validation with REAL Django API
    if (field === 'username') {
      dispatch({ type: 'SET_CHECKING', field, isChecking: true });
      
      // First do basic validation (format, length, etc.)
      const basicValidation = FORM_VALIDATORS.username(value);
      
      if (!basicValidation.isValid) {
        // If basic validation fails, set the result and stop
        dispatch({ type: 'SET_VALIDATION', field, result: basicValidation });
        return;
      }
      
      // If basic validation passes, check availability with Django
      const availabilityCheck = await checkUsernameAvailability(value);
      dispatch({ type: 'SET_VALIDATION', field, result: availabilityCheck });
      return;
    }

    // ✅ Handle regular field validation
    if (FORM_VALIDATORS[field]) {
      const result = FORM_VALIDATORS[field](value);
      dispatch({ type: 'SET_VALIDATION', field, result });
    }
  }, [state.values.password]);

  // ✅ Handle field changes with validation
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

  // ✅ Handle field blur events
  const handleBlur = useCallback((field) => {
    dispatch({ type: 'SET_TOUCHED', field });
    validateField(field, state.values[field]);
  }, [state.values, validateField]);

  // ✅ Check if entire form is valid
  const isValid = useMemo(() => {
    const fieldNames = Object.keys(initialValues);
    
    // All fields must be touched and valid
    const allTouched = fieldNames.every(field => state.touched[field]);
    const allValid = fieldNames.every(field => {
      const validation = state.validation[field];
      return validation && validation.isValid && !validation.isChecking;
    });
    
    // ✅ Debug logging for development
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

  // ✅ Reset form to initial state
  const reset = useCallback(() => {
    dispatch({ type: 'RESET', initialValues });
  }, [initialValues]);

  // ✅ Get field validation status
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

  // ✅ Validate all fields at once
  const validateAll = useCallback(() => {
    const fieldNames = Object.keys(initialValues);
    
    fieldNames.forEach(field => {
      dispatch({ type: 'SET_TOUCHED', field });
      validateField(field, state.values[field]);
    });
  }, [initialValues, state.values, validateField]);

  // ✅ Return the complete API with legacy support
  return {
    // Form state
    values: state.values,
    validation: state.validation,
    touched: state.touched,
    isValid,
    
    // Legacy support - map validation to errors for compatibility
    errors: Object.keys(state.validation).reduce((acc, field) => {
      const fieldValidation = state.validation[field];
      if (fieldValidation && !fieldValidation.isValid) {
        acc[field] = fieldValidation.message;
      }
      return acc;
    }, {}),
    
    // Actions
    handleChange,
    handleBlur,
    reset,
    validateAll,
    getFieldStatus
  };
};

export default useFormValidation;