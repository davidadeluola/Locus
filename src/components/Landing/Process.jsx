import React, { useEffect, useState } from "react";
import { MapPin, ShieldCheck, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import steps from "../../lib/data/howitworks.jsx";

const Process = () => {
  const otpDigits = ["1", "2", "3", "4", "5", "6"];
  const [otpStep, setOtpStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOtpStep((current) => (current + 1) % (otpDigits.length * 2));
    }, 360);

    return () => clearInterval(interval);
  }, [otpDigits.length]);

  const activeOtpIndex = Math.floor(otpStep / 2);
  const isMaskPhase = otpStep % 2 === 1;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  const leftSideVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section
      id="how-it-works"
      className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden w-full border-t border-zinc-100"
    >
      {/* LEFT/TOP: The "Live Feed" Visualizer (Orange) */}
      <motion.div
        className="w-full md:flex md:w-1/2 bg-orange-600 hidden relative border-b md:border-b-0 md:border-r border-zinc-900 items-center justify-center py-16 sm:py-20 md:py-0"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={leftSideVariants}
      >
        {/* Background Decorative Mesh */}
        <div
          className="absolute inset-0 opacity-10 animate-pulse"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            className="w-[88vw] max-w-[320px] sm:max-w-[360px] md:max-w-[420px] aspect-square bg-zinc-950 rounded-3xl border-[6px] md:border-8 border-white/10 flex items-center justify-center relative shadow-2xl overflow-hidden"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {/* Static Desktop Scan Line */}
            <div className="hidden md:block absolute top-0 inset-x-0 h-1 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,1)] z-20" />
            <div className="flex items-end gap-2 sm:gap-3 -translate-y-3 md:-translate-y-5">
              {otpDigits.map((digit, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="relative h-10 sm:h-12 md:h-14 w-6 sm:w-8 md:w-10 flex items-center justify-center">
                    <motion.span
                      className="absolute text-orange-500 font-mono font-black text-4xl sm:text-5xl md:text-6xl leading-none"
                      animate={{ y: activeOtpIndex === index && !isMaskPhase ? -14 : 8 }}
                      transition={{
                        duration: 0.16,
                        ease: "linear",
                      }}
                    >
                      {activeOtpIndex === index && !isMaskPhase ? digit : "*"}
                    </motion.span>
                  </div>
                  <motion.div
                    className="h-0.5 w-6 sm:w-7 md:w-8 bg-orange-500 rounded-full"
                    animate={{
                      opacity:
                        activeOtpIndex === index && !isMaskPhase ? 1 : 0.35,
                      scaleX:
                        activeOtpIndex === index && !isMaskPhase ? 1.12 : 0.75,
                      y: activeOtpIndex === index && !isMaskPhase ? -5 : 4,
                    }}
                    transition={{
                      duration: 0.16,
                      ease: "linear",
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Status Badge */}
          <motion.div
            className="mt-4 md:absolute md:top-full md:mt-4 md:left-1/2 md:-translate-x-1/2 bg-white text-zinc-950 px-6 py-2 rounded-full font-bold text-sm tracking-tighter shadow-xl"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            VERIFYING_OTP...
          </motion.div>

          <motion.div
            className="mt-12 text-center hidden md:block"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-white/60 font-mono text-xs uppercase tracking-[0.5em]">
              Verification_Node: 0x82...79
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT/BOTTOM: The Step-by-Step Protocol (White) */}
      <motion.div
        className="w-full md:w-1/2 relative flex items-center py-20 md:py-32 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header Area */}
          <motion.div className="mb-16" variants={itemVariants}>
            <h2 className="text-sm font-bold tracking-[0.3em] text-orange-600 uppercase mb-4">
              Verification Protocol
            </h2>
            <h3 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter">
              HOW <span className="text-zinc-400">LOCUS</span> WORKS.
            </h3>
          </motion.div>

          {/* Process List */}
          <div className="relative">
            {/* Vertical Connecting Line (Desktop) */}
            <div className="absolute left-9.75 top-0 bottom-0 w-px bg-zinc-100 hidden md:block" />

            <motion.div
              className="space-y-12 relative"
              variants={containerVariants}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="group relative flex flex-col md:flex-row items-start gap-8"
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Icon Hub */}
                  <motion.div
                    className="relative z-10 flex items-center justify-center min-w-[80px] h-20 bg-zinc-50 border-2 border-zinc-100 rounded-2xl group-hover:border-orange-500 transition-all duration-500"
                    whileHover={{ scale: 1.1, borderColor: "#ea580c" }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="text-orange-600 group-hover:scale-110 transition-transform"
                      whileHover={{ scale: 1.2 }}
                    >
                      {step.icon}
                    </motion.div>
                    {/* Step Number */}
                    <span className="absolute -top-2 -right-2 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded">
                      {step.tag}
                    </span>
                  </motion.div>

                  {/* Content Area */}
                  <div className="flex-1 pb-8 border-b border-zinc-100 last:border-0">
                    <h4 className="text-2xl font-bold text-zinc-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-zinc-500 text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Process;
