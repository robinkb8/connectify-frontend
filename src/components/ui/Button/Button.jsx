// src/components/ui/Button/Button.jsx
import React from "react";

const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
  outline: "border border-input hover:bg-accent hover:text-accent-foreground dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-100",
  ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-800 dark:text-gray-100",
  // ... add dark: classes to other variants
};

const buttonSizes = {
  default: "h-10 py-2 px-4",
  sm: "h-9 px-3 rounded-md",
  lg: "h-11 px-8 rounded-md",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef(({ 
  className = "", 
  variant = "default", 
  size = "default", 
  children,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variantClasses = buttonVariants[variant] || buttonVariants.default;
  const sizeClasses = buttonSizes[size] || buttonSizes.default;
  
  const classes = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  return (
    <button
      className={classes}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;