import React, { useEffect, useState } from "react";
import { ArrowUpRight, MapPin, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useGeolocation } from "../../hooks/useGeolocation";

const HeroSection = () => {
  const { latitude, longitude, loading, error } = useGeolocation();
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    const target = 99.9;
    const durationMs = 1200;
    const start = performance.now();
    let frameId;

    const tick = (now) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const value = target * progress;
      setAccuracy(value);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const rightSideVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section
      className="min-h-screen pt-16 flex flex-col md:flex-row overflow-hidden bg-zinc-950"
      id="home"
    >
      {/* LEFT CONTAINER: The "Intelligence" Side */}
      <motion.div
        className="w-full md:w-1/2 bg-zinc-50 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-16 md:py-0 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div className="space-y-6 md:space-y-8 relative z-10" variants={containerVariants}>
          <motion.div className="flex items-center gap-3" variants={itemVariants}>
            <span className="bg-orange-600/10 text-orange-600 px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase">
              Version 1.0 Deployment
            </span>
            <div className="h-px grow bg-zinc-200 hidden md:block" />
          </motion.div>

          <motion.h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-zinc-900 leading-[0.85] tracking-tighter" variants={itemVariants}>
            PRECISION <br />
            INTEGRITY <br />
            <span className="text-orange-600">& AUTH.</span>
          </motion.h1>

          <motion.p className="text-zinc-500 text-lg md:text-xl max-w-3xl leading-relaxed font-medium" variants={itemVariants}>
            Next-gen attendance protocol for{" "}
            <span className="text-zinc-900 font-bold">LASUSTECH Engineers</span>
            . Eliminating proxy culture through geolocation and TOTP
            verification.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-4 pt-4" variants={itemVariants}>
            <motion.a
              href="#get-started"
              className="group bg-zinc-950 text-white px-8 py-4 rounded-sm flex items-center justify-center gap-2 hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-zinc-900/10"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-bold">INITIALIZE SESSION</span>
              <Zap size={18} className="fill-current" />
            </motion.a>
            <motion.button
              className="border-2 border-zinc-200 text-zinc-900 px-8 py-4 rounded-sm font-bold hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              LEARN MORE
              <ArrowUpRight
                size={20}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Subtle Background Detail */}
        <div className="absolute bottom-10 left-12 hidden lg:block">
          <div className="flex gap-8 opacity-0 grayscale">
            <img src="/lasustech-logo.png" alt="University" className="h-8" />
            <span className="font-mono text-xs text-zinc-400">
              BUILD: CPE_PRM_2026
            </span>
          </div>
        </div>
      </motion.div>

      {/* RIGHT CONTAINER: The "Validation" Side */}
      <motion.div
        className="w-full md:w-1/2 bg-orange-600 relative flex items-center justify-center py-20 md:py-0 border-t-1"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={rightSideVariants}
      >
        {/* Animated Background Mesh */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Central Visual: The Verification Pulse */}
        <motion.div
          className="relative z-10 scale-75 lg:scale-100"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="absolute inset-0 bg-white/20 blur-[100px] rounded-full animate-pulse" />
          <div className="relative bg-zinc-950 p-8 md:p-12 rounded-3xl border-4 border-white/10 shadow-2xl">
            <MapPin
              size={120}
              className="text-orange-500 animate-bounce"
              strokeWidth={1.5}
            />
            <div className="mt-6 space-y-2">
              <div className="h-1.5 w-32 bg-orange-600 rounded-full animate-infinite-scroll" />
              <div className="h-1.5 w-20 bg-zinc-800 rounded-full" />
            </div>
          </div>

          {/* Floating Data Tags */}
          <div className="absolute -top-6 -right-12 bg-white text-zinc-950 p-3 rounded-lg shadow-xl font-mono text-xs font-bold border-2 border-zinc-950 animate-float">
            LOC: {loading ? "..." : error ? "N/A" : `${longitude}°`}
          </div>
          <div className="absolute top-20 -left-18 bg-white text-zinc-950 p-3 rounded-lg shadow-xl font-mono text-xs font-bold border-2 border-zinc-950 animate-float">
            LAT: {loading ? "..." : error ? "N/A" : `${latitude}°`}
          </div>
          <div className="absolute -bottom-4 -left-12 bg-zinc-900 text-emerald-400 p-3 rounded-lg shadow-xl font-mono text-xs border-2 border-emerald-500/50">
            STATUS: VERIFIED
          </div>
        </motion.div>

        {/* Lower Stats Bar */}
        <div className="absolute bottom-0 w-full grid grid-cols-2 border-t-4 border-zinc-950 h-24 md:h-32">
          <motion.div
            className="bg-zinc-900 flex flex-col justify-center items-center text-white border-r-2 border-zinc-800"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-2xl md:text-3xl font-black">
              {accuracy.toFixed(1)}%
            </span>
            <span className="text-[10px] uppercase tracking-tighter text-zinc-500 font-bold">
              ACCURACY
            </span>
          </motion.div>
          <motion.div
            className="bg-zinc-950 flex flex-col justify-center items-center text-white"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-2xl md:text-3xl font-black text-orange-600">
              400L
            </span>
            <span className="text-[10px] uppercase tracking-tighter text-zinc-500 font-bold">
              PREMIER SET
            </span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
