// src/components/ui/Button/Button.jsx
import React from "react";

const buttonVariants = {
  default: "bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600 dark:from-blue-500 dark:to-teal-500 dark:hover:from-blue-600 dark:hover:to-teal-600",
  outline: "border border-slate-700 hover:bg-slate-800/50 hover:text-white dark:border-slate-600 dark:hover:bg-slate-800 dark:text-slate-100",
  ghost: "hover:bg-slate-800/50 hover:text-white dark:hover:bg-slate-800 dark:text-slate-100",
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
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
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