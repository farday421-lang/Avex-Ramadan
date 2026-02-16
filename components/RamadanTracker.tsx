
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Trophy, Flame } from 'lucide-react';
import { Badge } from '../types';
import WaterTracker from './WaterTracker';
import JournalWidget from './JournalWidget';
import RamadanChecklist from './RamadanChecklist';
import { toBengaliNumber } from '../services/utils';
import { db } from '../services/database';

// Mock Badges
const BADGES: Badge[] = [
    { id: 'first_roza', name: 'প্রথম রোজা', icon: '🌟', description: '১ম রোজা সম্পন্ন', unlocked: true },
    { id: 'week_one', name: '৭ দিনের স্ট্রিক', icon: '🔥', description: 'টানা ১ সপ্তাহ', unlocked: false },
    { id: 'halfway', name: 'অর্ধেক পথ', icon: '🌓', description: '১৫টি রোজা শেষ', unlocked: false },
    { id: 'champion', name: 'রমজান চ্যাম্পিয়ন', icon: '🏆', description: '৩০টি রোজা সম্পন্ন', unlocked: false },
];

const RamadanTracker: React.FC = () => {
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  useEffect(() => {
    // Load from Supabase
    db.fasting.get().then(days => setCompletedDays(days));
  }, []);

  const toggleDay = async (day: number) => {
    let newCompleted;
    if (completedDays.includes(day)) {
      newCompleted = completedDays.filter(d => d !== day);
    } else {
      newCompleted = [...completedDays, day];
    }
    setCompletedDays(newCompleted);
    // Save to Supabase
    await db.fasting.save(newCompleted);
  };

  const progress = Math.round((completedDays.length / 30) * 100);
  const streak = completedDays.length;

  return (
    <div className="space-y-6 pb-24">
        
        {/* Streak & Stats Row */}
        <div className="grid grid-cols-2 gap-4">
             <div className="glass-card p-5 rounded-[2rem] relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-3 opacity-10"><Flame size={40} /></div>
                 <span className="text-xs text-orange-200 uppercase tracking-widest font-bold block mb-1">স্ট্রিক</span>
                 <span className="text-3xl font-black text-white">{toBengaliNumber(streak)} <span className="text-sm font-normal text-white/40">দিন</span></span>
             </div>
             <div className="glass-card p-5 rounded-[2rem] relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-3 opacity-10"><Trophy size={40} /></div>
                 <span className="text-xs text-avex-lime uppercase tracking-widest font-bold block mb-1">অগ্রগতি</span>
                 <span className="text-3xl font-black text-white">{toBengaliNumber(progress)}%</span>
             </div>
        </div>

        {/* 30 Days Grid */}
        <div className="glass-card rounded-[2.5rem] p-6">
            <h3 className="text-lg font-bold text-white mb-4">রোজা ক্যালেন্ডার</h3>
            <div className="grid grid-cols-6 gap-3">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const isCompleted = completedDays.includes(day);
                return (
                    <motion.button
                    key={day}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleDay(day)}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-sm font-mono transition-all duration-300 relative overflow-hidden group shadow-lg ${
                        isCompleted 
                        ? 'bg-avex-lime text-black border border-avex-lime shadow-[0_0_15px_rgba(163,230,53,0.4)]' 
                        : 'bg-white/5 border border-white/5 text-white/30 hover:bg-white/10'
                    }`}
                    >
                    {isCompleted ? <Check size={18} strokeWidth={4} /> : <span className="font-bold">{toBengaliNumber(day)}</span>}
                    </motion.button>
                );
                })}
            </div>
        </div>

        {/* New Productivity Widgets */}
        <RamadanChecklist />
        <WaterTracker />
        <JournalWidget />

        {/* Badges Section */}
        <div className="glass-card rounded-[2rem] p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-4">অর্জনসমূহ</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 hide-scrollbar">
                {BADGES.map(badge => (
                    <div key={badge.id} className={`flex-shrink-0 w-24 h-32 rounded-2xl border flex flex-col items-center justify-center text-center p-2 gap-2 transition-colors ${
                        badge.unlocked 
                        ? 'bg-white/10 border-avex-lime/30' 
                        : 'bg-white/5 border-white/5 opacity-50 grayscale'
                    }`}>
                        <div className="text-3xl">{badge.icon}</div>
                        <p className="text-[10px] font-bold text-white leading-tight">{badge.name}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default RamadanTracker;
