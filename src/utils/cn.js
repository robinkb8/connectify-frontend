// src/utils/cn.js - Class name utility function
import { clsx } from 'clsx';

/**
 * Utility function to combine CSS classes
 * This is a simple version of the cn utility commonly used with Tailwind CSS
 * 
 * @param {...any} inputs - Class names to combine
 * @returns {string} Combined class names
 */
export function cn(...inputs) {
  return clsx(inputs);
}

// Alternative implementation without clsx dependency
export function cnSimple(...classes) {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim();
}

// For backwards compatibility, export both
export default cn;