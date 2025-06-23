// src/components/forms/SignUpForm/PasswordStrength.jsx
import React from 'react';

// ✅ OPTIMIZED: Complete password strength configuration (static data)
const PASSWORD_STRENGTH_CONFIG = {
  // Strength level thresholds
  thresholds: {
    WEAK: 25,
    MEDIUM: 50,
    STRONG: 75,
    VERY_STRONG: 100
  },
  
  // Strength level labels
  labels: {
    WEAK: 'Weak',
    MEDIUM: 'Medium',
    STRONG: 'Strong',
    VERY_STRONG: 'Very Strong'
  },
  
  // Color classes for different strength levels
  colors: {
    WEAK: 'bg-red-400',
    MEDIUM: 'bg-yellow-400',
    STRONG: 'bg-blue-400',
    VERY_STRONG: 'bg-green-400'
  },
  
  // CSS class configurations
  styles: {
    container: 'mt-2',
    header: 'flex justify-between text-xs text-white text-opacity-60 mb-1',
    progressContainer: 'w-full bg-white bg-opacity-20 rounded-full h-2',
    progressBar: 'h-2 rounded-full transition-all duration-300'
  },
  
  // Display text
  text: {
    label: 'Password Strength',
    strengthPrefix: 'Strength: '
  }
};

// ✅ OPTIMIZED: Static utility functions (created once, reused forever)
const PASSWORD_STRENGTH_UTILS = {
  // Determine strength level based on percentage
  getStrengthLevel: (strength) => {
    const { thresholds } = PASSWORD_STRENGTH_CONFIG;
    
    if (strength >= thresholds.VERY_STRONG) return 'VERY_STRONG';
    if (strength >= thresholds.STRONG) return 'STRONG';
    if (strength >= thresholds.MEDIUM) return 'MEDIUM';
    return 'WEAK';
  },
  
  // Get appropriate label for strength level
  getStrengthLabel: (strength) => {
    const level = PASSWORD_STRENGTH_UTILS.getStrengthLevel(strength);
    return PASSWORD_STRENGTH_CONFIG.labels[level];
  },
  
  // Get appropriate color class for strength level
  getStrengthColor: (strength) => {
    const level = PASSWORD_STRENGTH_UTILS.getStrengthLevel(strength);
    return PASSWORD_STRENGTH_CONFIG.colors[level];
  },
  
  // Build complete progress bar classes
  buildProgressBarClasses: (strength) => {
    const baseClasses = PASSWORD_STRENGTH_CONFIG.styles.progressBar;
    const colorClass = PASSWORD_STRENGTH_UTILS.getStrengthColor(strength);
    return `${baseClasses} ${colorClass}`;
  },
  
  // Get strength description with level
  getStrengthDescription: (strength) => {
    const label = PASSWORD_STRENGTH_UTILS.getStrengthLabel(strength);
    return `${PASSWORD_STRENGTH_CONFIG.text.strengthPrefix}${label}`;
  },
  
  // Calculate visual width percentage (ensures minimum visibility)
  getVisualWidth: (strength) => {
    // Ensure at least 5% width for visibility when strength > 0
    return strength > 0 ? Math.max(strength, 5) : 0;
  }
};

const PasswordStrength = ({ strength = 0 }) => {
  // ✅ OPTIMIZED: Using static utilities (no function recreation per render)
  const strengthLabel = PASSWORD_STRENGTH_UTILS.getStrengthLabel(strength);
  const progressBarClasses = PASSWORD_STRENGTH_UTILS.buildProgressBarClasses(strength);
  const visualWidth = PASSWORD_STRENGTH_UTILS.getVisualWidth(strength);
  const { styles, text } = PASSWORD_STRENGTH_CONFIG;

  return (
    <div className={styles.container}>
      {/* Header with label and strength indicator */}
      <div className={styles.header}>
        <span>{text.label}</span>
        <span>{strengthLabel}</span>
      </div>
      
      {/* Progress bar container */}
      <div className={styles.progressContainer}>
        <div 
          className={progressBarClasses}
          style={{ width: `${visualWidth}%` }}
          role="progressbar"
          aria-valuenow={strength}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Password strength: ${strengthLabel}`}
        />
      </div>
    </div>
  );
};

export default PasswordStrength;