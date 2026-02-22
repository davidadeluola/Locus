import React from "react";

const toneMap = {
  active: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
  depleted: "text-zinc-500 border-zinc-700 bg-zinc-900",
  warning: "text-orange-500 border-orange-500/30 bg-orange-500/10",
};

const SystemBadge = ({ label, tone = "depleted", pulse = false }) => {
  const toneClass = toneMap[tone] || toneMap.depleted;
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] uppercase font-mono ${toneClass} ${
        pulse ? "animate-pulse" : ""
      }`}
    >
      {label}
    </span>
  );
};

export default SystemBadge;
