
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronDown, Moon, Sun, Clock } from 'lucide-react';
import { RAMADAN_SCHEDULE } from '../constants';
import { toBengaliNumber } from '../services/utils';

const RamadanCalendar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Helper to get Ashra label in Bengali
  const getAshraLabel = (ashra: string) => {
      switch(ashra) {
          case 'Rahmat': return 'প্রথম ১০ দিন: রহমত';
          case 'Maghfirat': return 'দ্বিতীয় ১০ দিন: মাগফিরাত';
          case 'Najat': return 'তৃতীয় ১০ দিন: নাজাত';
          default: return '';
      }
  };

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden relative transition-all duration-500 group border border-white/5 hover:border-white/10">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-avex-lime/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative z-10 p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
             <div className={`p-3 rounded-2xl border transition-colors duration-300 ${isExpanded ? 'bg-avex-lime text-black border-avex-lime' : 'bg-white/5 text-avex-lime border-white/10'}`}>
                 <CalendarIcon size={20} />
            </div>
            <div>
                 <h2 className="text-xl font-bold text-white tracking-tight">রমজানের সময়সূচী</h2>
                 <p className="text-sm text-white/40 tracking-wide flex items-center gap-2 font-medium">
                    <Clock size={12} />
                    ২০২৬
                 </p>
            </div>
        </div>
        <motion.div 
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className={`p-2 rounded-full transition-colors duration-300 ${isExpanded ? 'bg-white/10 text-white' : 'text-white/40'}`}
        >
            <ChevronDown size={20} />
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden bg-black/20"
          >
            <div className="border-t border-white/5">
                {/* Header Row */}
                <div className="grid grid-cols-12 py-4 px-2 md:px-6 bg-white/5 text-[11px] uppercase tracking-widest text-white/50 font-bold backdrop-blur-md z-10 border-b border-white/5 text-center">
                    <div className="col-span-2">রমজান</div>
                    <div className="col-span-3">তারিখ</div>
                    <div className="col-span-2">বার</div>
                    <div className="col-span-2">সেহরি</div>
                    <div className="col-span-3">ইফতার</div>
                </div>

                {/* List Container */}
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {RAMADAN_SCHEDULE.map((day, index) => {
                        const showAshraHeader = index === 0 || RAMADAN_SCHEDULE[index-1].ashra !== day.ashra;
                        const isEven = index % 2 === 0;
                        
                        return (
                            <React.Fragment key={index}>
                                {showAshraHeader && (
                                    <div className="py-3 px-4 mt-4 mb-2 rounded-xl bg-gradient-to-r from-avex-lime/10 to-transparent border border-avex-lime/20 text-left">
                                        <span className="text-sm font-bold text-avex-lime uppercase tracking-widest drop-shadow-sm">{getAshraLabel(day.ashra)}</span>
                                    </div>
                                )}
                                
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className={`grid grid-cols-12 py-4 px-2 md:px-4 items-center rounded-2xl border transition-all duration-300 relative overflow-hidden text-center group ${
                                        isEven ? 'bg-white/[0.02] border-white/[0.02]' : 'bg-transparent border-transparent'
                                    } hover:bg-white/[0.08] hover:border-white/10`}
                                >
                                    <div className="col-span-2">
                                        <div className="w-9 h-9 mx-auto rounded-full flex items-center justify-center text-sm font-bold bg-white/10 text-white group-hover:bg-avex-lime group-hover:text-black transition-colors">
                                            {day.ramadan}
                                        </div>
                                    </div>
                                    
                                    {/* Date Column - Highlighted */}
                                    <div className="col-span-3">
                                        <div className="bg-white/10 rounded-lg py-1.5 px-1 border border-white/5 mx-auto max-w-[90px]">
                                            <span className="text-sm font-bold text-white block">{day.date}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="col-span-2">
                                        <span className="text-sm font-medium text-white/60">{day.day}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-sm font-bold text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,0.3)]">{toBengaliNumber(day.sehri)}</span>
                                    </div>
                                     <div className="col-span-3">
                                        <span className="text-sm font-bold text-orange-300 drop-shadow-[0_0_10px_rgba(253,186,116,0.3)]">{toBengaliNumber(day.iftar)}</span>
                                    </div>
                                </motion.div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RamadanCalendar;
