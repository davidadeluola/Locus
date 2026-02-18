import React from "react";
import { QrCode, MapPin, ShieldCheck, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import steps from "../../lib/data/howitworks.jsx";

const Process = () => {
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
        className="w-full hidden md:flex md:w-1/2 bg-orange-600 relative  items-center justify-center py-24 md:py-0"
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
            className="w-64 h-64 md:w-80 md:h-80 bg-zinc-950 rounded-3xl border-8 border-white/10 flex items-center justify-center relative shadow-2xl overflow-hidden"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {/* Scanning Line Animation */}
            <motion.div
              className="absolute inset-x-0 h-1 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,1)] z-20"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{
                duration: 4,
                ease: "linear",
                repeat: Infinity,
              }}
            />
            <QrCode
              size={140}
              className="text-white opacity-20 animate-pulse"
              strokeWidth={1}
            />
          </motion.div>

          {/* Status Badge */}
          <motion.div
            className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white text-zinc-950 px-6 py-2 rounded-full font-bold text-sm tracking-tighter shadow-xl"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            SYSTEM_SCANNING...
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
            <div className="absolute left-[39px] top-0 bottom-0 w-px bg-zinc-100 hidden md:block" />

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
