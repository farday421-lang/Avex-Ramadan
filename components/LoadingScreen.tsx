
import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center flex-col">
      <div className="absolute inset-0 bg-noise opacity-10" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Animated Line */}
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-avex-lime to-transparent mb-8 animate-pulse" />
        
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.2, duration: 0.8 }}
           className="text-center space-y-4"
        >
            <h1 className="text-3xl font-thin tracking-[0.5em] text-white uppercase">আভেক্স</h1>
            <p className="text-[10px] tracking-[0.8em] text-avex-lime uppercase">রমজান ২০২৬</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
