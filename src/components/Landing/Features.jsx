import React from "react";
import { Globe, Lock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import featureList from "../../lib/data/features.jsx";

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
      id="features"
      className="min-h-screen flex flex-col md:flex-row-reverse bg-zinc-950 overflow-hidden w-full items-stretch"
    >
      {/* RIGHT/TOP: The Visual "Dark Room" (Black) */}
      <motion.div
        className="w-full md:w-1/2 bg-zinc-950 relative flex flex-col items-center justify-center py-24 md:py-0 border-b md:border-b-0 md:border-l border-zinc-800 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={rightSideVariants}
      >
        {/* 1. The Engineering Grid Layer */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* 2. The Radial Core Glow */}
        <motion.div
          className="absolute w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        {/* 3. Terminal Header Decoration */}
        <motion.div
          className="absolute top-8 left-8 right-8 flex justify-between items-center opacity-40"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 0.4, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
          </div>
          <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
            Protocol: 0.1.4_Stable
          </span>
        </motion.div>

        {/* 4. Feature Highlight Content */}
        <motion.div
          className="relative z-10 w-full max-w-md px-6 space-y-8"
          variants={containerVariants}
        >
          {/* Central Progress Card */}
          <motion.div
            className="w-full aspect-video border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-xl p-8 flex flex-col justify-between shadow-2xl"
            variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(249,115,22,0.2)" }}
              transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-start">
              <motion.div
                className="p-3 bg-orange-600/20 rounded-lg"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(249,115,22,0.3)" }}
              >
                <ShieldCheck className="text-orange-500" size={32} />
              </motion.div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-zinc-500 uppercase">
                  Integrity_Check
                </p>
                <p className="text-emerald-400 font-mono text-xs">
                  PASS_SESSIONS
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full w-2/3 bg-orange-600"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
              </div>
              <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                <span>ENCRYPTING_TOTP...</span>
                <span>88%</span>
              </div>
            </div>
          </motion.div>

          {/* Mini Stats Grid */}
          <motion.div className="grid grid-cols-2 gap-4" variants={containerVariants}>
            <motion.div
              className="bg-zinc-900/50 backdrop-blur-xl p-6 border border-zinc-800 rounded-xl transform hover:-translate-y-2 transition-transform"
              variants={itemVariants}
              whileHover={{ y: -6, borderColor: "#ea580c" }}
              transition={{ duration: 0.2 }}
            >
              <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
                <Lock size={24} className="text-orange-600 mb-4" />
              </motion.div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest">
                Secure
              </h4>
            </motion.div>
            <motion.div
              className="bg-zinc-900/50 backdrop-blur-xl p-6 border border-zinc-800 rounded-xl transform hover:-translate-y-2 transition-transform"
              variants={itemVariants}
              whileHover={{ y: -6, borderColor: "#ea580c" }}
              transition={{ duration: 0.2 }}
            >
              <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
                <Globe size={24} className="text-orange-600 mb-4" />
              </motion.div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest">
                Real-time
              </h4>
            </motion.div>
            <motion.div
              className="col-span-2 bg-orange-600 p-6 rounded-xl flex justify-between items-center shadow-2xl shadow-orange-600/20"
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <h4 className="text-white font-black text-lg italic tracking-tighter leading-none">
                  ENFORCED_ACCOUNTABILITY
                </h4>
                <p className="text-orange-100 text-[10px] font-mono mt-1">
                  Status: Active_Protocol
                </p>
              </div>
              <div className="h-8 w-8 bg-white/20 rounded-full animate-ping" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 5. Bottom Label */}
        <motion.div
          className="absolute bottom-8 left-8 opacity-40"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 0.4, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="font-mono text-[10px] text-zinc-500 leading-tight">
            SYS_L_400_ENGINEERING
            <br />
            VER_DEPLOYMENT_ACTIVE
          </p>
        </motion.div>
      </motion.div>

      {/* LEFT/BOTTOM: The Feature Details (White) */}
      <motion.div
        className="w-full md:w-1/2 bg-white flex items-center py-20 md:py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-6 lg:px-20">
          <motion.div className="mb-16" variants={itemVariants}>
            <h2 className="text-sm font-bold tracking-[0.3em] text-orange-600 uppercase mb-4">
              Core Capabilities
            </h2>
            <h3 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter">
              ENGINEERED <br /> FOR{" "}
              <span className="text-zinc-400">TRUST.</span>
            </h3>
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12" variants={containerVariants}>
            {featureList.map((feature, index) => (
              <motion.div
                key={index}
                className="group"
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="mb-4 inline-block p-3 bg-zinc-50 rounded-lg group-hover:bg-orange-50 transition-colors"
                  whileHover={{ scale: 1.1, backgroundColor: "#fed7aa" }}
                >
                  {feature.icon}
                </motion.div>
                <h4 className="text-xl font-bold text-zinc-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-zinc-500 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Features;
