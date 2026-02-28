import React from 'react';

export default function OtpInput({ otp, inputRefs, onChange, onKeyDown, onPaste }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-mono text-zinc-500 uppercase mb-4 text-center">Enter 6-Digit Access Code</p>
      <div className="flex gap-2 md:gap-3 justify-center" onPaste={onPaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => onChange(index, e.target.value)}
            onKeyDown={(e) => onKeyDown(index, e)}
            className="w-12 h-16 md:w-16 md:h-20 bg-black border border-zinc-800 rounded-xl text-center text-2xl md:text-3xl font-mono font-bold text-orange-500 focus:border-orange-500 focus:outline-none transition-all"
          />
        ))}
      </div>
    </div>
  );
}
