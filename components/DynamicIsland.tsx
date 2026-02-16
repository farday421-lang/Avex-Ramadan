
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Moon, Sun, Clock, Star, Activity } from 'lucide-react';

interface DynamicIslandProps {
  nextPrayer: string;
  timeLeft: string;
  type: 'normal' | 'alert' | 'iftar' | 'sehri';
}

const DynamicIsland: React.FC<DynamicIslandProps> = ({ nextPrayer, timeLeft, type }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto expand on alert types
  useEffect(() => {
    if (type === 'iftar' || type === 'sehri') {
      setIsExpanded(true);
      const timer = setTimeout(() => setIsExpanded(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [type]);

  // Increased Width for "Doirgo Boro"
  const variants = {
    idle: { width: '220px', height: '48px', borderRadius: '30px' },
    expanded: { width: '360px', height: '160px', borderRadius: '40px' },
  };

  return (
    <div className="fixed top-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <motion.div
        layout
        initial="idle"
        animate={isExpanded ? "expanded" : "idle"}
        variants={variants}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative pointer-events-auto cursor-pointer group"
      >
        {/* Animated Gradient Border Layer */}
        {/* Uses conic gradient for the loop animation of Lime Green + Yellow */}
        <div className="absolute -inset-[2px] rounded-[inherit] overflow-hidden">
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg_at_50%_50%,#a3e635_0deg,#facc15_60deg,#000000_120deg,#000000_240deg,#a3e635_360deg)] animate-spin-slow opacity-80 blur-[2px]" />
        </div>

        {/* Main Content Container - Black with Glass effect */}
        <div className="absolute inset-0 bg-black/90 rounded-[inherit] border border-white/10 z-10 backdrop-blur-xl overflow-hidden flex flex-col">
          
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.div
                key="compact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-between px-4"
              >
                 {/* Left: Branding "AVEX" */}
                 <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-avex-lime to-avex-yellow flex items-center justify-center shadow-[0_0_10px_rgba(163,230,53,0.5)]">
                        <Star size={10} className="text-black fill-black" />
                    </div>
                    <span className="text-[11px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                        আভেক্স
                    </span>
                 </div>
                 
                 {/* Divider */}
                 <div className="h-3 w-[1px] bg-white/20" />

                 {/* Right: Timer / Prayer */}
                 <div className="flex items-center gap-2">
                   {type !== 'normal' && (
                     <Bell size={12} className="text-avex-yellow animate-pulse" />
                   )}
                   <div className="flex flex-col items-end leading-none">
                     <span className="text-[9px] text-avex-lime font-bold uppercase">{nextPrayer}</span>
                     <span className="text-[11px] font-mono text-white tabular-nums">{timeLeft.split(' ')[0]}</span>
                   </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col justify-between p-6 relative"
              >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-avex-lime/10 rounded-full blur-3xl -mr-10 -mt-10" />

                {/* Top: Branding Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-avex-lime" />
                        <span className="text-[10px] uppercase tracking-widest text-avex-lime font-bold">আভেক্স রমজান</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full border border-avex-yellow/30 bg-avex-yellow/10">
                         <span className="text-[9px] text-avex-yellow font-bold uppercase tracking-wider">লাইভ</span>
                    </div>
                </div>

                {/* Middle: Main Info */}
                <div className="flex items-end justify-between mt-2">
                   <div className="flex flex-col">
                      <span className="text-xs text-white/50 mb-1">পরবর্তী ওয়াক্ত</span>
                      <span className="text-3xl font-bold text-white tracking-tight">{nextPrayer}</span>
                   </div>
                   
                   <div className="text-right">
                      <span className="text-4xl font-thin font-mono text-transparent bg-clip-text bg-gradient-to-b from-avex-lime to-avex-yellow tracking-tighter">
                         {timeLeft}
                      </span>
                   </div>
                </div>

                {/* Bottom: Signature Footer */}
                <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] text-white/40 uppercase tracking-[0.3em]">প্রিমিয়াম ইন্টারফেস</span>
                        <span className="text-[9px] font-medium text-white/80 mt-1">ডিজাইন বাই তাহসিন রিজন</span>
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default DynamicIsland;
