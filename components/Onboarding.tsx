
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

interface OnboardingProps {
  onComplete: (name: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep(2);
      setTimeout(() => onComplete(name), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center px-6">
      <div className="absolute inset-0 bg-noise opacity-10" />
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-avex-lime/10 rounded-full blur-[120px]" />

      {step === 1 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-sm"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-avex-lime to-avex-yellow flex items-center justify-center shadow-[0_0_40px_rgba(163,230,53,0.3)]">
                <Star size={32} className="text-black fill-black" />
            </div>
          </div>
          
          <h1 className="text-4xl font-thin text-center text-white mb-2 tracking-tight">আসসালামু আলাইকুম।</h1>
          <p className="text-center text-white/50 mb-10">আপনার রমজানের সঙ্গী।</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-xl text-white placeholder-white/20 focus:outline-none focus:border-avex-lime/50 transition-colors"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-avex-lime text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-avex-limeDim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>শুরু করুন</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center relative z-10"
        >
          <h2 className="text-2xl font-light text-white mb-2">রমজান মোবারক,</h2>
          <h1 className="text-4xl font-bold text-avex-lime capitalize mb-4">{name}</h1>
          <p className="text-white/40 text-sm tracking-widest uppercase">ড্যাশবোর্ড তৈরি হচ্ছে...</p>
        </motion.div>
      )}
    </div>
  );
};

export default Onboarding;
