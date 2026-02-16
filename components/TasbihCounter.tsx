
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { toBengaliNumber } from '../services/utils';

const TASBIH_MODES = [
  { id: 1, label: 'সুবহানাল্লাহ', target: 33, arabic: 'سُبْحَانَ ٱللَّٰهِ' },
  { id: 2, label: 'আলহামদুলিল্লাহ', target: 33, arabic: 'ٱلْحَمْدُ لِلَّٰهِ' },
  { id: 3, label: 'আল্লাহু আকবার', target: 34, arabic: 'ٱللَّٰهُ أَكْبَرُ' },
  { id: 4, label: 'আস্তাগফিরুল্লাহ', target: 100, arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ' },
];

const TasbihCounter: React.FC = () => {
  const [count, setCount] = useState(0);
  const [modeIndex, setModeIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false); // Default off for web

  const currentMode = TASBIH_MODES[modeIndex];
  const progress = (count / currentMode.target) * 100;

  const handleTap = () => {
    // Haptic sim (vibrate if available)
    if (navigator.vibrate) navigator.vibrate(5);
    
    if (count < currentMode.target) {
        setCount(c => c + 1);
    } else {
        // Cycle mode or reset
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        setCount(0);
        setModeIndex(prev => (prev + 1) % TASBIH_MODES.length);
    }
  };

  const reset = () => setCount(0);

  return (
    <div className="h-full flex flex-col items-center justify-center pb-20">
      
      {/* Header Controls */}
      <div className="w-full flex justify-between items-center mb-8 px-4">
        <button onClick={reset} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <RotateCcw size={20} />
        </button>
        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-widest text-avex-lime">
            ডিজিটাল তসবিহ
        </div>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Main Counter Display */}
      <div className="relative mb-12">
        <div className="w-64 h-64 rounded-full border-8 border-white/5 flex flex-col items-center justify-center relative">
            {/* Circular Progress SVG */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-white/5"
                />
                <motion.circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="#ccff00"
                    strokeWidth="8"
                    strokeDasharray="753" // 2 * pi * 120
                    strokeDashoffset={753 - (753 * progress) / 100}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 753 }}
                    animate={{ strokeDashoffset: 753 - (753 * progress) / 100 }}
                />
            </svg>

            {/* Content */}
            <div className="text-center z-10">
                <motion.div 
                    key={currentMode.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2"
                >
                    <p className="text-3xl font-sans mb-1">{currentMode.arabic}</p>
                    <p className="text-xs text-white/50 uppercase tracking-widest">{currentMode.label}</p>
                </motion.div>
                <motion.h1 
                    key={count}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-7xl font-mono font-bold text-white mt-4"
                >
                    {toBengaliNumber(count)}
                </motion.h1>
                <p className="text-sm text-white/30 mt-2 font-mono">/ {toBengaliNumber(currentMode.target)}</p>
            </div>
        </div>
      </div>

      {/* Tap Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleTap}
        className="w-full max-w-xs py-6 rounded-3xl bg-white/5 border border-white/10 text-white font-bold text-xl hover:bg-white/10 hover:border-avex-lime/50 transition-all active:bg-avex-lime/20"
      >
        গণনা করুন
      </motion.button>
    </div>
  );
};

export default TasbihCounter;
