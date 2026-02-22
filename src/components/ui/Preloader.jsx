import React from "react";
import { Fingerprint } from "lucide-react";

const Preloader = () => {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#09090b]">
      <div className="relative p-8">
        <div className="absolute inset-0 border-2 border-zinc-800 rounded-2xl animate-pulse" />

        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 relative overflow-hidden">
            <Fingerprint className="text-orange-500 animate-pulse" size={32} />
            <div className="scanner-line absolute inset-0" />
          </div>

          <div className="text-center">
            <h1 className="text-white font-bold tracking-tighter text-xl font-mono uppercase">
              LOCUS<span className="text-orange-500">.</span>
            </h1>
            <div className="flex items-center gap-2 mt-2 justify-center">
              <div className="h-1 w-1 bg-orange-500 rounded-full animate-bounce" />
              <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em]">
                SYSTEM_BOOTING...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
