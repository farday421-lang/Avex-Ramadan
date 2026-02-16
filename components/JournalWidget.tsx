
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Save, Smile, Frown, Meh, Battery, Heart } from 'lucide-react';
import { db } from '../services/database';
import { JournalEntry } from '../types';
import { toBengaliNumber } from '../services/utils';

const MOODS = [
  { id: 'happy', icon: Smile, color: 'text-avex-lime' },
  { id: 'grateful', icon: Heart, color: 'text-pink-400' },
  { id: 'neutral', icon: Meh, color: 'text-blue-300' },
  { id: 'tired', icon: Battery, color: 'text-orange-400' },
  { id: 'sad', icon: Frown, color: 'text-white/40' },
] as const;

const JournalWidget: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState<JournalEntry['mood']>('grateful');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    db.journal.getAll().then(setEntries);
  }, []);

  const handleSave = async () => {
    if (!text.trim()) return;
    
    const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        mood: selectedMood,
        text,
        timestamp: Date.now()
    };

    await db.journal.add(newEntry);
    setEntries([newEntry, ...entries]);
    setText('');
    setIsExpanded(false);
  };

  return (
    <div className="glass-card rounded-[2rem] p-6 transition-all duration-500">
        <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                    <Book size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white">রমজান জার্নাল</h3>
                    <p className="text-xs text-white/50">আজকের অনুভূতি</p>
                </div>
            </div>
            <button className="text-xs text-avex-lime uppercase tracking-widest hover:underline">
                {isExpanded ? 'বন্ধ' : 'লিখুন'}
            </button>
        </div>

        <AnimatePresence>
            {isExpanded && (
                <motion.div 
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="overflow-hidden"
                >
                    <div className="flex justify-between mb-4 px-2">
                        {MOODS.map((m) => (
                            <button 
                                key={m.id}
                                onClick={() => setSelectedMood(m.id)}
                                className={`p-2 rounded-full transition-all ${
                                    selectedMood === m.id ? 'bg-white/10 scale-110 shadow-lg' : 'opacity-50 hover:opacity-100'
                                }`}
                            >
                                <m.icon size={24} className={m.color} />
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="আজকের রোজা কেমন কাটলো?"
                        className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-colors resize-none mb-4"
                    />

                    <button 
                        onClick={handleSave}
                        disabled={!text.trim()}
                        className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <Save size={16} /> সংরক্ষণ করুন
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Recent Entry Preview */}
        {!isExpanded && entries.length > 0 && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pt-4 border-t border-white/5"
            >
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">{entries[0].date}</span>
                    {MOODS.find(m => m.id === entries[0].mood)?.icon && 
                        React.createElement(MOODS.find(m => m.id === entries[0].mood)!.icon, { size: 12, className: MOODS.find(m => m.id === entries[0].mood)?.color })
                    }
                </div>
                <p className="text-sm text-white/70 line-clamp-2 italic">"{entries[0].text}"</p>
            </motion.div>
        )}
    </div>
  );
};

export default JournalWidget;
