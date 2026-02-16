
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, BookOpen, Loader2, Bookmark, Play, Pause, Check, Volume2, CheckCircle } from 'lucide-react';
import { Surah, QuranProgress } from '../types';
import { toBengaliNumber, englishToBengaliPhonetic } from '../services/utils';
import { BENGALI_SURAH_NAMES } from '../constants';
import { db } from '../services/database';

interface QuranBrowserProps {
  onBack: () => void;
  initialSurahNumber?: number | null;
  initialAyahNumber?: number | null;
}

interface AyahData {
  number: number;
  text: string; // Arabic
  numberInSurah: number;
  juz: number;
}

interface TranslatedAyah {
  number: number;
  text: string;
}

const QuranBrowser: React.FC<QuranBrowserProps> = ({ onBack, initialSurahNumber, initialAyahNumber }) => {
  const [activeTab, setActiveTab] = useState<'surah' | 'para'>('surah');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  
  // Reader State
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [translation, setTranslation] = useState<TranslatedAyah[]>([]);
  const [transliteration, setTransliteration] = useState<TranslatedAyah[]>([]);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [lastRead, setLastRead] = useState<QuranProgress | null>(null);

  // Audio State
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Para Tracking State
  const [completedParas, setCompletedParas] = useState<number[]>([]);

  // Scroll Ref
  const ayahRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  useEffect(() => {
    // Load last read & completed paras from Supabase
    db.quran.getLastRead().then(data => {
        if (data) setLastRead(data);
    });

    db.quran.getParas().then(data => {
        setCompletedParas(data);
    });

    fetch('https://api.alquran.cloud/v1/surah')
      .then(res => res.json())
      .then(data => {
        setSurahs(data.data);
        setFilteredSurahs(data.data);
        setLoading(false);

        // Handle Deep Link / Resume
        if (initialSurahNumber) {
            const target = data.data.find((s: Surah) => s.number === initialSurahNumber);
            if (target) handleSelectSurah(target, initialAyahNumber);
        }
      })
      .catch(err => {
        console.error("Failed to load surahs", err);
        setLoading(false);
      });

    return () => {
        // Cleanup audio on unmount
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredSurahs(surahs);
    } else {
      const lower = search.toLowerCase();
      // Search in English name or Bengali name (by mapping index)
      setFilteredSurahs(surahs.filter((s, idx) => 
        s.englishName.toLowerCase().includes(lower) || 
        BENGALI_SURAH_NAMES[idx].includes(lower) ||
        s.number.toString().includes(lower)
      ));
    }
  }, [search, surahs]);

  // Scroll to Ayah when loaded
  useEffect(() => {
      if (!loadingSurah && selectedSurah && initialAyahNumber) {
          setTimeout(() => {
              const el = ayahRefs.current[initialAyahNumber];
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 500);
      }
  }, [loadingSurah, selectedSurah, initialAyahNumber]);

  const handleSelectSurah = async (surah: Surah, targetAyah?: number | null) => {
    // Stop any playing audio
    if (audioRef.current) {
        audioRef.current.pause();
        setPlayingAyah(null);
    }

    setSelectedSurah(surah);
    setLoadingSurah(true);
    setAyahs([]);
    setTranslation([]);
    setTransliteration([]);

    try {
      // Fetches Arabic, Bengali Translation, and English Transliteration (Pronunciation)
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,bn.bengali,en.transliteration`);
      const data = await res.json();
      
      if (data.data && data.data.length >= 3) {
          // Identify editions safely
          const arabicData = data.data.find((e: any) => e.edition.identifier === 'quran-uthmani')?.ayahs || [];
          const bengaliData = data.data.find((e: any) => e.edition.language === 'bn')?.ayahs || [];
          const transData = data.data.find((e: any) => e.edition.type === 'transliteration')?.ayahs || [];

          setAyahs(arabicData);
          setTranslation(bengaliData);
          setTransliteration(transData);
      }
      
      if (targetAyah) {
           setTimeout(() => {
              const el = ayahRefs.current[targetAyah];
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 800);
      }

    } catch (error) {
      console.error("Failed to fetch surah details", error);
    } finally {
      setLoadingSurah(false);
    }
  };

  const handleBookmark = async (ayahNumber: number) => {
      if (!selectedSurah) return;
      
      const bengaliName = BENGALI_SURAH_NAMES[selectedSurah.number - 1];

      const progress: QuranProgress = {
          surahNumber: selectedSurah.number,
          surahName: bengaliName,
          ayahNumber: ayahNumber,
          timestamp: Date.now()
      };
      setLastRead(progress);
      await db.quran.saveLastRead(progress);
  };

  const playAyah = (globalAyahNumber: number) => {
    if (playingAyah === globalAyahNumber) {
        // Pause if already playing this one
        if (audioRef.current) {
            audioRef.current.pause();
            setPlayingAyah(null);
        }
    } else {
        // Stop previous
        if (audioRef.current) audioRef.current.pause();
        
        // Play new
        const audio = new Audio(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`);
        audioRef.current = audio;
        audio.play();
        setPlayingAyah(globalAyahNumber);
        
        audio.onended = () => setPlayingAyah(null);
        audio.onerror = () => {
            alert("Audio unavailable for this Ayah currently.");
            setPlayingAyah(null);
        };
    }
  };

  const togglePara = async (paraNum: number) => {
      let updated;
      if (completedParas.includes(paraNum)) {
          updated = completedParas.filter(p => p !== paraNum);
      } else {
          updated = [...completedParas, paraNum];
      }
      setCompletedParas(updated);
      await db.quran.saveParas(updated);
  };

  return (
    <div className="min-h-screen bg-black text-white relative font-sans">
       <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none fixed" />
       
       <AnimatePresence mode="wait">
         {!selectedSurah ? (
            // LIST & TRACKER VIEW
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-24 pt-4 px-4 max-w-lg mx-auto"
            >
               {/* Header */}
               <div className="flex items-center gap-4 mb-6 sticky top-0 bg-black/80 backdrop-blur-xl z-20 py-4 border-b border-white/5 -mx-4 px-4">
                  <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                      <ArrowLeft size={20} />
                  </button>
                  <h1 className="text-xl font-bold">আল-কুরআন</h1>
                  <div className="flex-1" />
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <BookOpen size={20} />
                  </div>
               </div>

               {/* Tabs */}
               <div className="flex bg-white/5 p-1 rounded-2xl mb-6">
                   <button 
                    onClick={() => setActiveTab('surah')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'surah' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40'}`}
                   >
                       সূরা
                   </button>
                   <button 
                    onClick={() => setActiveTab('para')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'para' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40'}`}
                   >
                       পারা
                   </button>
               </div>

                {/* Continue Reading Banner */}
                {lastRead && activeTab === 'surah' && (
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onClick={() => {
                            const target = surahs.find(s => s.number === lastRead.surahNumber);
                            if (target) handleSelectSurah(target, lastRead.ayahNumber);
                        }}
                        className="mb-6 bg-gradient-to-r from-emerald-900/40 to-black border border-emerald-500/30 p-5 rounded-2xl flex items-center justify-between cursor-pointer relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Bookmark size={60} /></div>
                        <div className="relative z-10">
                            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                                <Bookmark size={10} /> সর্বশেষ পঠিত
                            </span>
                            <h3 className="text-xl font-bold text-white">{lastRead.surahName}</h3>
                            <p className="text-xs text-white/50">আয়াত: {toBengaliNumber(lastRead.ayahNumber)} থেকে চালিয়ে যান</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/20 relative z-10 group-hover:scale-110 transition-transform">
                            <Play size={20} fill="currentColor" />
                        </div>
                    </motion.div>
                )}

               {/* Para Progress Notification */}
               {activeTab === 'para' && completedParas.length > 0 && (
                   <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 bg-gradient-to-r from-blue-900/40 to-black border border-blue-500/30 p-5 rounded-2xl relative overflow-hidden"
                   >
                        <div className="flex items-center gap-3 relative z-10">
                             <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                 <CheckCircle size={20} />
                             </div>
                             <div>
                                 <h3 className="font-bold text-white text-lg">আলহামদুলিল্লাহ!</h3>
                                 <p className="text-xs text-white/60">আপনি ৩০টি পারার মধ্যে {toBengaliNumber(completedParas.length)}টি সম্পন্ন করেছেন।</p>
                             </div>
                        </div>
                        <div className="w-full h-1 bg-white/10 mt-4 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-blue-500 transition-all duration-1000"
                                style={{ width: `${(completedParas.length / 30) * 100}%` }}
                             />
                        </div>
                   </motion.div>
               )}

               {activeTab === 'surah' ? (
                   <>
                       {/* Search */}
                       <div className="relative mb-6">
                          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                          <input 
                            type="text" 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="সূরা খুঁজুন..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                          />
                       </div>

                       {/* List */}
                       {loading ? (
                           <div className="flex justify-center py-20">
                               <Loader2 size={32} className="animate-spin text-emerald-500" />
                           </div>
                       ) : (
                           <div className="grid gap-3">
                               {filteredSurahs.map((surah) => (
                                   <motion.div
                                      key={surah.number}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => handleSelectSurah(surah)}
                                      className="glass-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 hover:border-emerald-500/30 transition-all group"
                                   >
                                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm font-bold font-mono text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors relative">
                                           {toBengaliNumber(surah.number)}
                                           <div className="absolute -inset-1 border border-white/5 rounded-xl rotate-45 group-hover:rotate-0 transition-transform" />
                                       </div>
                                       <div className="flex-1">
                                           {/* Use Bengali Name from Constant */}
                                           <h3 className="font-bold text-white text-lg">{BENGALI_SURAH_NAMES[surah.number - 1]}</h3>
                                           <p className="text-xs text-white/50">{surah.englishName} • {toBengaliNumber(surah.numberOfAyahs)} আয়াত</p>
                                       </div>
                                       <div className="text-right">
                                           <span className="font-serif text-xl text-emerald-400/80">{surah.name.replace('سُورَةُ', '').trim()}</span>
                                           <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{surah.revelationType}</p>
                                       </div>
                                   </motion.div>
                               ))}
                           </div>
                       )}
                   </>
               ) : (
                   /* PARA TRACKER GRID */
                   <div className="grid grid-cols-3 gap-3">
                       {Array.from({ length: 30 }, (_, i) => i + 1).map((para) => {
                           const isCompleted = completedParas.includes(para);
                           return (
                               <motion.button
                                   key={para}
                                   whileTap={{ scale: 0.95 }}
                                   onClick={() => togglePara(para)}
                                   className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all relative overflow-hidden group ${
                                       isCompleted 
                                       ? 'bg-avex-lime text-black border-avex-lime' 
                                       : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                   }`}
                               >
                                   <span className="text-sm uppercase tracking-widest font-bold opacity-60">পারা</span>
                                   <span className="text-3xl font-bold">{toBengaliNumber(para)}</span>
                                   {isCompleted && (
                                       <div className="absolute bottom-2 right-2">
                                           <CheckCircle size={16} className="text-black" />
                                       </div>
                                   )}
                               </motion.button>
                           );
                       })}
                   </div>
               )}
            </motion.div>
         ) : (
            // READER VIEW
            <motion.div 
              key="reader"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="min-h-screen bg-avex-black pb-24"
            >
               {/* Reader Header */}
               <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center justify-between shadow-2xl">
                   <button onClick={() => {
                        if(audioRef.current) audioRef.current.pause();
                        setSelectedSurah(null);
                   }} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                       <ArrowLeft size={20} />
                   </button>
                   <div className="text-center">
                       <h2 className="font-bold text-white text-lg">{BENGALI_SURAH_NAMES[selectedSurah.number - 1]}</h2>
                       <p className="text-xs text-white/50">{selectedSurah.englishNameTranslation}</p>
                   </div>
                   <div className="w-10" /> 
               </div>

               <div className="px-4 py-8 max-w-lg mx-auto space-y-8">
                   {/* Bismillah */}
                   <div className="text-center mb-12 relative py-8">
                       <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                           <img src="https://www.transparenttextures.com/patterns/arabesque.png" className="w-full h-full object-cover opacity-50" alt="" />
                       </div>
                       <h1 className="font-serif text-4xl text-emerald-400 mb-2 leading-relaxed drop-shadow-lg">
                           بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                       </h1>
                   </div>

                   {loadingSurah ? (
                       <div className="flex flex-col items-center justify-center py-20 gap-4">
                           <Loader2 size={40} className="animate-spin text-emerald-500" />
                           <p className="text-sm text-white/50 animate-pulse">লোডিং...</p>
                       </div>
                   ) : (
                       ayahs.map((ayah, index) => {
                           const isBookmarked = lastRead?.surahNumber === selectedSurah.number && lastRead.ayahNumber === ayah.numberInSurah;
                           const isPlaying = playingAyah === ayah.number;
                           // Use the helper to convert English transliteration to Bengali
                           const bengaliPronunciation = transliteration[index] ? englishToBengaliPhonetic(transliteration[index].text) : '';

                           return (
                           <div 
                                key={ayah.number} 
                                ref={el => ayahRefs.current[ayah.numberInSurah] = el}
                                className={`relative group transition-all duration-500 glass-card rounded-2xl overflow-hidden p-0 mb-6 ${isBookmarked ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''}`}
                           >
                               {/* Card Content Wrapper */}
                               <div className="p-5">
                                   {/* Top Row: Number */}
                                   <div className="flex justify-between items-start mb-6">
                                       <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-emerald-500/30 text-xs text-emerald-500 font-sans bg-emerald-500/5">
                                           {toBengaliNumber(ayah.numberInSurah)}
                                       </span>
                                   </div>

                                   {/* Arabic */}
                                   <div className="mb-6 text-right pl-2">
                                       <p className={`font-serif text-3xl leading-[2.2] drop-shadow-md transition-colors ${isPlaying ? 'text-avex-lime' : 'text-white'}`}>
                                           {ayah.text} 
                                       </p>
                                   </div>

                                   {/* Transliteration */}
                                   <div className="mb-3">
                                       <span className="text-[10px] uppercase text-white/30 tracking-widest block mb-1">উচ্চারণ</span>
                                       <p className="text-avex-lime/90 text-sm font-medium leading-relaxed font-sans">
                                           {bengaliPronunciation}
                                       </p>
                                   </div>

                                   {/* Translation */}
                                   <div>
                                       <span className="text-[10px] uppercase text-white/30 tracking-widest block mb-1">অনুবাদ</span>
                                       <p className="text-white/80 leading-relaxed font-sans text-sm">
                                           {translation[index]?.text}
                                       </p>
                                   </div>
                               </div>

                               {/* Action Bar Footer */}
                               <div className="bg-white/5 border-t border-white/5 p-3 flex gap-3">
                                   <button 
                                        onClick={() => playAyah(ayah.number)}
                                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                                            isPlaying 
                                            ? 'bg-avex-lime text-black shadow-[0_0_15px_rgba(204,255,0,0.4)]' 
                                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                   >
                                        {isPlaying ? (
                                            <>
                                                <div className="flex items-end gap-1 h-4">
                                                    <div className="w-1 bg-black animate-[bounce_1s_infinite] h-2 rounded-full" />
                                                    <div className="w-1 bg-black animate-[bounce_1s_infinite_0.1s] h-4 rounded-full" />
                                                    <div className="w-1 bg-black animate-[bounce_1s_infinite_0.2s] h-3 rounded-full" />
                                                </div>
                                                <span>চলছে...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Play size={16} fill="currentColor" />
                                                <span>শুনুন</span>
                                            </>
                                        )}
                                   </button>
                                   
                                   <button 
                                        onClick={() => handleBookmark(ayah.numberInSurah)}
                                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                                            isBookmarked 
                                            ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                   >
                                        {isBookmarked ? (
                                            <>
                                                <Check size={16} />
                                                <span>সেভ করা হয়েছে</span>
                                            </>
                                        ) : (
                                            <>
                                                <Bookmark size={16} />
                                                <span>সেভ করুন</span>
                                            </>
                                        )}
                                   </button>
                               </div>
                           </div>
                       )})
                   )}
               </div>
            </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

export default QuranBrowser;
