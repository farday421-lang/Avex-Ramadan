
import React, { useState, useEffect } from 'react';
import { Book, Heart, Coffee, ChevronRight, X, Lock, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DuaCard from './DuaCard';
import QuranBrowser from './QuranBrowser';
import { DUAS } from '../constants';
import { Dua, QuranProgress } from '../types';
import { toBengaliNumber } from '../services/utils';

interface SpiritualHubProps {
  onAdminRequest: () => void;
}

const SpiritualHub: React.FC<SpiritualHubProps> = ({ onAdminRequest }) => {
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [showQuran, setShowQuran] = useState(false);
  const [resumeData, setResumeData] = useState<{surah: number, ayah: number} | null>(null);
  const [progress, setProgress] = useState<QuranProgress | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('avex_quran_progress');
    if (saved) {
        setProgress(JSON.parse(saved));
    }
  }, []);

  const handleOpenQuran = (resume: boolean = false) => {
    if (resume && progress) {
        setResumeData({ surah: progress.surahNumber, ayah: progress.ayahNumber });
    } else {
        setResumeData(null);
    }
    setShowQuran(true);
  };

  if (showQuran) {
    return (
        <QuranBrowser 
            onBack={() => setShowQuran(false)} 
            initialSurahNumber={resumeData?.surah} 
            initialAyahNumber={resumeData?.ayah}
        />
    );
  }

  return (
    <div className="pb-24 space-y-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-2">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">দ্বীন ও শিক্ষা</h1>
                <p className="text-xs text-white/50 uppercase tracking-widest mt-1">আপনার আধ্যাত্মিক যাত্রা</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Sparkles size={18} className="text-avex-lime" />
            </div>
        </div>

        {/* Quran Progress / Entry */}
        <section className="glass-card rounded-[2rem] p-6 relative overflow-hidden group cursor-pointer" onClick={() => handleOpenQuran(false)}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] -mr-10 -mt-10 transition-opacity duration-500 group-hover:opacity-20" />
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <Book size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg">কুরআন শরীফ</h3>
                    <p className="text-xs text-white/50">তিলাওয়াত ও অর্থসহ পড়ুন</p>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex justify-between text-sm items-end">
                    <span className="text-white/70 font-medium">
                        {progress ? `শেষ পড়া: ${progress.surahName}` : 'শুরু করুন'}
                    </span>
                    {progress && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md">
                            আয়াত {toBengaliNumber(progress.ayahNumber)}
                        </span>
                    )}
                </div>
                <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                        style={{ width: progress ? `${(progress.surahNumber / 114) * 100}%` : '5%' }}
                    />
                </div>
                
                {progress ? (
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenQuran(true); }}
                        className="w-full py-4 mt-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-all flex items-center justify-center gap-2 group-hover:border-emerald-500/30"
                    >
                        চালিয়ে যান <ArrowUpRight size={16} />
                    </button>
                ) : (
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenQuran(false); }}
                        className="w-full py-4 mt-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                    >
                        পড়া শুরু করুন <ArrowUpRight size={16} />
                    </button>
                )}
            </div>
        </section>

        {/* All Duas Grid */}
        <section>
             <div className="flex items-center justify-between px-2 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">দৈনন্দিন দোয়া</h3>
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/40">{DUAS.length} টি</span>
             </div>
             
             <div className="grid grid-cols-1 gap-4">
                 {DUAS.map((dua, index) => (
                     <motion.div 
                         key={dua.id} 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: index * 0.05 }}
                         whileTap={{ scale: 0.98 }}
                         onClick={() => setSelectedDua(dua)}
                     >
                        <DuaCard dua={dua} variant="list" />
                     </motion.div>
                 ))}
             </div>
        </section>

        {/* Iftar Ideas */}
        <section className="glass-card rounded-[2rem] p-6 group">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 border border-orange-500/20">
                    <Coffee size={20} />
                </div>
                <h3 className="font-bold text-white text-lg">ইফতার টিপস</h3>
             </div>
             <div className="aspect-video rounded-2xl bg-white/5 mb-5 overflow-hidden relative">
                 <img 
                    src="https://images.unsplash.com/photo-1577223595448-f4175db44849?q=80&w=800&auto=format&fit=crop" 
                    alt="Dates" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                 <div className="absolute bottom-0 left-0 p-4 w-full">
                     <span className="px-2 py-1 bg-avex-lime/20 backdrop-blur rounded-md text-[10px] font-bold uppercase text-avex-lime border border-avex-lime/30 mb-2 inline-block">Healthy Sunnah</span>
                     <h4 className="text-lg font-bold text-white leading-tight">খেজুর ও বাদামের স্মুদি</h4>
                 </div>
             </div>
             
             <p className="text-sm text-white/60 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                 সুন্নাহ সম্মত একটি এনার্জি ড্রিংক। ৫টি খেজুর, ভেজানো কাঠবাদাম এবং দুধ একসাথে ব্লেন্ড করে নিন। এটি সারাদিনের ক্লান্তি দূর করতে সাহায্য করে।
             </p>
        </section>

        {/* Modal Overlay */}
        <AnimatePresence>
            {selectedDua && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedDua(null)}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="relative z-10 w-full max-w-lg"
                    >
                         <button 
                            onClick={() => setSelectedDua(null)}
                            className="absolute -top-14 right-0 w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors border border-white/10"
                        >
                            <X size={20} />
                        </button>
                        <DuaCard dua={selectedDua} variant="modal" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default SpiritualHub;
