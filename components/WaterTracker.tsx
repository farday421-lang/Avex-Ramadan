
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Plus, Minus } from 'lucide-react';
import { db } from '../services/database';
import { WaterLog } from '../types';
import { toBengaliNumber } from '../services/utils';

const WaterTracker: React.FC = () => {
  const [log, setLog] = useState<WaterLog>({ date: new Date().toDateString(), glasses: 0, goal: 8 });

  useEffect(() => {
    db.water.getToday().then(setLog);
  }, []);

  const updateWater = (change: number) => {
    const newCount = Math.max(0, log.glasses + change);
    const newLog = { ...log, glasses: newCount };
    setLog(newLog);
    db.water.update(newLog);
  };

  return (
    <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute bottom-0 left-0 right-0 bg-blue-500/10 transition-all duration-500 z-0"
             style={{ height: `${(log.glasses / log.goal) * 100}%` }} />
        
        <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                    <Droplet size={20} fill="currentColor" />
                </div>
                <div>
                    <h3 className="font-bold text-white">পানি পান</h3>
                    <p className="text-xs text-white/50">{toBengaliNumber(log.glasses)} / {toBengaliNumber(log.goal)} গ্লাস</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => updateWater(-1)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors"
                >
                    <Minus size={14} />
                </button>
                <span className="text-xl font-mono font-bold text-blue-300 w-6 text-center">{toBengaliNumber(log.glasses)}</span>
                <button 
                    onClick={() => updateWater(1)}
                    className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>

        {/* Visual Glasses */}
        <div className="flex gap-1 mt-4 justify-between relative z-10">
            {Array.from({ length: log.goal }).map((_, i) => (
                <div 
                    key={i} 
                    className={`h-8 w-full rounded-md transition-all duration-500 ${
                        i < log.glasses ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'bg-white/5'
                    }`}
                />
            ))}
        </div>
    </div>
  );
};

export default WaterTracker;
