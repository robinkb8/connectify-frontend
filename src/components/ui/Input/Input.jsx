// src/components/ui/Input/Input.jsx
import React from "react";

export const Input = React.forwardRef(({ 
  className = "", 
  type = "text",
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-slate-700 dark:border-slate-600 bg-slate-900/50 dark:bg-slate-800 px-3 py-2 text-sm text-white dark:text-slate-100 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";
export default Input;