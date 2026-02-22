import React from "react";

const variantMap = {
  primary: "bg-orange-600 hover:bg-orange-500 text-white border-orange-500/30",
  ghost: "bg-zinc-950 hover:bg-zinc-900 text-orange-500 border-zinc-800",
  danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30",
};

const ActionButton = ({ children, variant = "primary", className = "", ...props }) => {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-xs uppercase font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
        variantMap[variant] || variantMap.primary
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default ActionButton;
