import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-mono text-zinc-500">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
        <input
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          value={value}
          onChange={onChange}
          className="w-full pl-10 pr-11 py-3 bg-[#09090b] border border-zinc-800 rounded-xl focus:border-orange-500 outline-none text-zinc-100"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((state) => !state)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-orange-500 transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
