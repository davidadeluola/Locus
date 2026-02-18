import React, { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import faqData from "../../lib/data/faqData.jsx";

const Faqs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35 },
    },
  };

  const leftSideVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section
      id="faqs"
      className="min-h-screen flex flex-col md:flex-row bg-zinc-50 overflow-hidden w-full"
    >
      {/* LEFT/TOP: The "Support" Side (Orange) */}
      <motion.div
        className="w-full md:w-1/2 bg-orange-600 relative flex flex-col items-center justify-center py-24 md:py-0 px-8 border-b md:border-b-0 md:border-r border-zinc-950"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={leftSideVariants}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <motion.div
          className="relative z-10 text-center md:text-left"
          variants={containerVariants}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 0.8, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <HelpCircle
              size={64}
              className="text-white mb-6 mx-auto md:mx-0 opacity-80"
            />
          </motion.div>
          <motion.h2
            className="text-sm font-bold tracking-[0.3em] text-orange-100 uppercase mb-4"
            variants={itemVariants}
          >
            Support Center
          </motion.h2>
          <motion.h3
            className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none"
            variants={itemVariants}
          >
            FREQUENTLY <br /> ASKED.
          </motion.h3>
          <motion.p
            className="mt-6 text-orange-100/80 font-medium max-w-xs mx-auto md:mx-0"
            variants={itemVariants}
          >
            Everything you need to know about the Locus accountability protocol.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* RIGHT/BOTTOM: The Accordion (Zinc-50) */}
      <motion.div
        className="w-full md:w-1/2 flex items-center py-20 md:py-32 bg-zinc-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="w-full max-w-2xl mx-auto px-6 lg:px-12">
          <motion.div className="space-y-4" variants={containerVariants}>
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                className={`border border-zinc-200 rounded-xl transition-all duration-300 ${
                  openIndex === index
                    ? "bg-white shadow-lg ring-1 ring-orange-500/10"
                    : "bg-transparent"
                }`}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
              >
                <motion.button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  whileHover={{
                    backgroundColor:
                      openIndex === index ? "#ffffff" : "#f5f5f5",
                  }}
                >
                  <span
                    className={`text-lg font-bold tracking-tight transition-colors ${
                      openIndex === index ? "text-orange-600" : "text-zinc-900"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <motion.div
                    className={`p-1 rounded-full transition-all duration-300 ${
                      openIndex === index
                        ? "bg-orange-600 text-white"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {openIndex === index ? (
                      <Minus size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        className="p-6 pt-0 text-zinc-500 leading-relaxed border-t border-zinc-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        {faq.answer}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-12 p-8 bg-zinc-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ boxShadow: "0 15px 30px rgba(249,115,22,0.15)" }}
          >
            <div>
              <p className="text-white font-bold text-lg">
                Still have questions?
              </p>
              <p className="text-zinc-400 text-sm">
                Reach out to the Locus Dev Team.
              </p>
            </div>
            <motion.a
              href="mailto:support@locus.hq"
              className="bg-orange-600 text-white px-6 py-3 rounded-sm font-bold hover:bg-orange-700 transition-colors whitespace-nowrap"
              whileHover={{ scale: 1.05, backgroundColor: "#b45309" }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Support
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Faqs;
