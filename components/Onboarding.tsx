
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, UserPlus, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { db } from '../services/database';

interface OnboardingProps {
  onComplete: (name: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setError('');

    try {
        const existingUser = await db.users.getByName(name.trim());

        if (mode === 'signup') {
            if (existingUser) {
                setError('এই নামে ইতিমধ্যে একটি অ্যাকাউন্ট আছে। অনুগ্রহ করে লগইন করুন।');
                setLoading(false);
                return;
            }
        } else {
            // Login mode
            if (!existingUser) {
                setError('এই নামে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সাইন আপ করুন।');
                setLoading(false);
                return;
            }
        }
        
        // Success
        setStep(2);
        setTimeout(() => onComplete(name), 1500);

    } catch (err) {
        console.error(err);
        setError('কোথাও একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        setLoading(false);
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
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-avex-lime to-avex-yellow flex items-center justify-center shadow-[0_0_40px_rgba(163,230,53,0.3)]">
                <Star size={32} className="text-black fill-black" />
            </div>
          </div>
          
          <h1 className="text-4xl font-thin text-center text-white mb-2 tracking-tight">আসসালামু আলাইকুম</h1>
          <p className="text-center text-white/50 mb-8">আপনার রমজানের সঙ্গী</p>

          {/* Mode Toggle */}
          <div className="bg-white/5 p-1 rounded-xl flex mb-6 border border-white/5">
              <button 
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'signup' ? 'bg-avex-lime text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                  <UserPlus size={16} /> নতুন অ্যাকাউন্ট
              </button>
              <button 
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'login' ? 'bg-white/20 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                  <LogIn size={16} /> লগইন
              </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder={mode === 'signup' ? "আপনার নাম লিখুন" : "আপনার ইউজারনেম"}
                className={`w-full bg-white/5 border rounded-2xl px-6 py-4 text-center text-xl text-white placeholder-white/20 focus:outline-none transition-colors ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-avex-lime/50'}`}
                autoFocus
              />
              {error && (
                  <div className="flex items-center justify-center gap-2 text-red-400 text-xs mt-3 bg-red-500/10 py-2 rounded-lg">
                      <AlertCircle size={12} /> {error}
                  </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="w-full bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                  <Loader2 size={20} className="animate-spin" />
              ) : (
                  <>
                      <span>{mode === 'signup' ? 'শুরু করুন' : 'ফিরে আসুন'}</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
              )}
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
