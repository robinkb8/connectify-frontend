// src/components/ui/Textarea/Textarea.jsx
import React from "react";

export const Textarea = React.forwardRef(({ 
  className = "", 
  ...props 
}, ref) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white ring-offset-slate-950 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
export default Textarea;