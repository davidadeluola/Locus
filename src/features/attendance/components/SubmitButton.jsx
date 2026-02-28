import React from 'react';
import { QrCode, Loader2 } from 'lucide-react';

export default function SubmitButton({ onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          Verifying Clearance...
        </>
      ) : (
        <>
          <QrCode size={20} />
          Authenticate Attendance
        </>
      )}
    </button>
  );
}
