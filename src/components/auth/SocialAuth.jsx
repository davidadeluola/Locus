import React from "react";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";

const MotionButton = motion.button;

const SocialAuth = ({ onGoogleClick, disabled = false }) => {
  return (
    <MotionButton
      whileTap={{ scale: 0.99 }}
      type="button"
      onClick={onGoogleClick}
      disabled={disabled}
      className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:border-orange-500 text-zinc-200 font-mono font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
    >
      <Chrome size={16} />
      CONTINUE WITH GOOGLE
    </MotionButton>
  );
};

export default SocialAuth;
