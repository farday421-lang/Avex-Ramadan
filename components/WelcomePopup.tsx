
import React from 'react';
import { motion } from 'framer-motion';
import { Gift, X, Sparkles, Heart } from 'lucide-react';

interface WelcomePopupProps {
  name: string;
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ name, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden p-8 text-center shadow-2xl"
      >
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-avex-lime/10 to-transparent pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-avex-lime to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(163,230,53,0.3)] animate-float">
                <Gift size={32} className="text-black" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-2 font-sans tracking-tight">আসসালামু আলাইকুম,</h2>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-avex-lime to-emerald-400 mb-6 font-sans">
                {name}
            </h1>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8 relative group">
                <div className="absolute top-2 right-2 opacity-20"><Sparkles size={20} /></div>
                <p className="text-white/80 leading-relaxed font-medium">
                    <span className="font-bold text-avex-lime">Tahsin Rijon ( Avex Studio )</span> এর পক্ষ থেকে আপনার জন্য সামান্য উপহার এই ওয়েবসাইটটি।
                </p>
                <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-lg font-bold text-white tracking-widest uppercase flex items-center justify-center gap-2">
                         <Heart size={16} className="text-red-500 fill-red-500" /> রামাদান মোবারক
                    </p>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
                ধন্যবাদ <Sparkles size={16} />
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePopup;
