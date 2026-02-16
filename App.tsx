
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronRight, Zap, Moon, Locate, Star, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import DynamicIsland from './components/DynamicIsland';
import LoadingScreen from './components/LoadingScreen';
import RamadanTracker from './components/RamadanTracker';
import DuaCard from './components/DuaCard';
import RamadanCalendar from './components/RamadanCalendar';
import Onboarding from './components/Onboarding';
import BottomNav from './components/BottomNav';
import TasbihCounter from './components/TasbihCounter';
import AIAssistant from './components/AIAssistant';
import SpiritualHub from './components/SpiritualHub';
import WelcomePopup from './components/WelcomePopup';
import TutorialOverlay from './components/TutorialOverlay';
import InstallPrompt from './components/InstallPrompt'; 

// Utils & Services
import { DUAS, MOCK_COORDS, RAMADAN_SCHEDULE } from './constants';
import { PrayerData, Coordinates, UserProfile } from './types';
import { fetchPrayerTimes, getNextPrayer } from './services/prayerService';
import { toBengaliNumber, translatePrayer, getBengaliMonth, getBengaliDay, getBengaliTimePeriod } from './services/utils';
import { db } from './services/database'; 

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayerInfo, setNextPrayerInfo] = useState({ name: '--', time: '--:--', timeLeft: '--' });
  const [isRamadanNight, setIsRamadanNight] = useState(false);
  const [todayRamadan, setTodayRamadan] = useState(RAMADAN_SCHEDULE[0]);
  const [isPreRamadan, setIsPreRamadan] = useState(false);
  
  // New State for Popups
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Load User & Location
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);

    const savedUser = localStorage.getItem('avex_user');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Location access denied, using mock", error);
          setCoords(MOCK_COORDS);
        }
      );
    } else {
      setCoords(MOCK_COORDS);
    }

    return () => clearTimeout(timer);
  }, []);

  // Fetch Prayer Times
  useEffect(() => {
    if (coords) {
      fetchPrayerTimes(coords).then((data) => {
        if (data) setPrayerData(data);
      });
    }
  }, [coords]);

  // Clock, Night Mode & Daily Schedule Check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const month = now.getMonth(); 
      const day = now.getDate();
      
      let preRamadan = false;
      if (month < 1) { // Jan
         preRamadan = true;
      } else if (month === 1 && day < 19) { // Feb 1-18
         preRamadan = true;
      }
      setIsPreRamadan(preRamadan);

      if (!preRamadan) {
          if (month === 1 && day >= 19 && day <= 28) {
              setTodayRamadan(RAMADAN_SCHEDULE[day - 19]);
          }
          else if (month === 2 && day >= 1 && day <= 20) {
              setTodayRamadan(RAMADAN_SCHEDULE[10 + (day - 1)]);
          }
      } else {
          setTodayRamadan(RAMADAN_SCHEDULE[0]);
      }
      
      if (prayerData) {
        const next = getNextPrayer(prayerData.timings);
        const translatedName = translatePrayer(next.name);
        const translatedTimeLeft = next.timeLeft
            .replace('h', 'ঘ')
            .replace('m', 'মি')
            .split(' ')
            .map(part => toBengaliNumber(part))
            .join(' ');

        setNextPrayerInfo({
            name: translatedName,
            time: toBengaliNumber(next.time),
            timeLeft: translatedTimeLeft
        });
        
        const maghrib = prayerData.timings.Maghrib.split(':').map(Number);
        const fajr = prayerData.timings.Fajr.split(':').map(Number);
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const maghribMins = (maghrib[0] + 12) * 60 + maghrib[1];
        const fajrMins = fajr[0] * 60 + fajr[1];

        if (currentMins >= maghribMins || currentMins < fajrMins) {
            setIsRamadanNight(true);
        } else {
            setIsRamadanNight(false);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [prayerData]);

  const handleOnboardingComplete = async (name: string, isNewUser: boolean) => {
    setLoading(true);
    
    // Check user existence (Onboarding already validated this, but double check/fetch full profile)
    const existingUser = await db.users.getByName(name.trim());
    
    let finalUser: UserProfile;

    if (existingUser) {
        finalUser = existingUser;
    } else {
        finalUser = {
            id: crypto.randomUUID(), // Better unique ID
            name: name.trim(),
            hasOnboarded: true,
            streak: 0,
            totalFasts: 0,
            role: 'user', 
            badges: []
        };
        await db.users.sync(finalUser);
    }
    
    localStorage.setItem('avex_user', JSON.stringify(finalUser));
    setUser(finalUser);
    setLoading(false);
    
    // ONLY Show welcome/tutorial for NEW users
    if (isNewUser) {
        setShowWelcome(true);
    }
  };

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    setShowTutorial(true); 
  };

  const handleCloseTutorial = () => {
      setShowTutorial(false);
  };

  const getBengaliDateString = (date: Date) => {
      const d = toBengaliNumber(date.getDate());
      const m = getBengaliMonth(date.getMonth());
      const day = getBengaliDay(date.getDay());
      return `${day}, ${d} ${m}`;
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <Onboarding onComplete={handleOnboardingComplete} />;

  const renderHome = () => (
    <div className="flex flex-col gap-10">
        <header className="relative flex flex-col items-center justify-center py-10">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none blur-[80px] transition-colors duration-1000 ${isRamadanNight ? 'bg-purple-500/10' : 'bg-avex-lime/5'}`} />

            <div className="relative w-[300px] h-[300px] flex items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-white/5 border-dashed"
                    style={{ borderSpacing: '20px' }}
                />
                <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 rounded-full border border-white/5"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-avex-lime rounded-full shadow-[0_0_15px_#ccff00]" />
                </motion.div>
                <div className="absolute inset-8 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-sm" />

                <div className="relative z-10 flex flex-col items-center justify-center">
                     <motion.h1 
                        className="text-[5.5rem] leading-[0.8] font-black text-white tracking-tighter drop-shadow-2xl"
                     >
                        {toBengaliNumber(format(currentTime, 'hh'))}
                     </motion.h1>
                     <div className="flex items-center gap-2 my-1">
                        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-avex-lime to-transparent" />
                        <div className={`text-[12px] font-bold tracking-widest ${isRamadanNight ? 'text-avex-lime' : 'text-white/40'}`}>
                            {getBengaliTimePeriod(currentTime)}
                        </div>
                        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-avex-lime to-transparent" />
                     </div>
                     <motion.h1 
                        className="text-[5.5rem] leading-[0.8] font-thin text-white/90 tracking-tighter font-mono"
                     >
                        {toBengaliNumber(format(currentTime, 'mm'))}
                     </motion.h1>
                </div>

                <div className="absolute -top-6 bg-black/40 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2">
                    <Locate size={10} className="text-avex-lime animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-white/60">ঢাকা</span>
                </div>

                 <div className="absolute -bottom-8 flex flex-col items-center gap-1">
                    <div className="bg-black/40 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2">
                        <Calendar size={10} className="text-white/40" />
                        <span className="text-[10px] uppercase tracking-widest text-white/80">
                            {getBengaliDateString(currentTime)}
                        </span>
                    </div>
                </div>
            </div>
        </header>

        {isPreRamadan ? (
            <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group hover:border-avex-lime/30 transition-all duration-500 w-full text-center">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Moon size={60} /></div>
                 <div className="absolute top-0 left-0 p-4 opacity-10"><Star size={60} /></div>
                 
                 <div className="flex flex-col items-center justify-center py-4 gap-3 relative z-10">
                    <div className="flex items-center gap-2 text-avex-lime/80 mb-2 bg-avex-lime/10 px-3 py-1 rounded-full border border-avex-lime/20">
                        <Calendar size={14} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">আসন্ন রমজান</span>
                    </div>
                    
                    <div>
                        <span className="text-white/60 text-sm uppercase tracking-widest block mb-2">পবিত্র মাহে রমজান শুরু</span>
                        <span className="text-5xl font-sans font-bold text-white tracking-tight block drop-shadow-lg">
                            {toBengaliNumber(RAMADAN_SCHEDULE[0].date.split(' ')[0])} {RAMADAN_SCHEDULE[0].date.split(' ')[1]}
                        </span>
                        <span className="text-xs text-white/40 uppercase tracking-widest mt-2 block">২০২৬ • ক্যালেন্ডার অনুযায়ী</span>
                    </div>

                    <div className="h-[1px] w-24 bg-white/10 my-4" />

                    <div className="flex gap-8 justify-center">
                        <div className="text-center">
                            <span className="text-[10px] text-white/40 block uppercase tracking-wider mb-1">প্রথম সেহরি</span>
                            <span className="text-xl font-sans font-bold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">{toBengaliNumber(RAMADAN_SCHEDULE[0].sehri)}</span>
                        </div>
                        <div className="text-center">
                            <span className="text-[10px] text-white/40 block uppercase tracking-wider mb-1">প্রথম ইফতার</span>
                            <span className="text-xl font-sans font-bold text-orange-300 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20">{toBengaliNumber(RAMADAN_SCHEDULE[0].iftar)}</span>
                        </div>
                    </div>
                 </div>
                 
                 <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-avex-lime to-transparent opacity-50" />
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-[2rem] p-5 relative overflow-hidden group hover:border-avex-lime/30 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Moon size={40} /></div>
                    <div className="flex flex-col h-full justify-between relative z-10">
                        <div className="flex items-center gap-2 text-white/50 mb-4">
                            <Moon size={14} className="text-blue-300" />
                            <span className="text-[10px] uppercase tracking-widest">আজকের সেহরি</span>
                        </div>
                        <div>
                            <span className="text-4xl font-sans font-bold text-white tracking-tight block">
                                {toBengaliNumber(todayRamadan.sehri)}
                            </span>
                            <span className="text-[10px] text-white/30 uppercase tracking-widest">এএম • {todayRamadan.date}</span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
                </div>

                <div className="glass-card rounded-[2rem] p-5 relative overflow-hidden group hover:border-avex-lime/30 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Sun size={40} /></div>
                    <div className="flex flex-col h-full justify-between relative z-10">
                        <div className="flex items-center gap-2 text-white/50 mb-4">
                            <Zap size={14} className="text-orange-300" />
                            <span className="text-[10px] uppercase tracking-widest">আজকের ইফতার</span>
                        </div>
                        <div>
                            <span className="text-4xl font-sans font-bold text-white tracking-tight block">
                                {toBengaliNumber(todayRamadan.iftar)}
                            </span>
                            <span className="text-[10px] text-white/30 uppercase tracking-widest">পিএম • {todayRamadan.day}</span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/50 to-transparent" />
                </div>
            </div>
        )}

        <div className="glass-card rounded-[2rem] p-4 flex items-center justify-between border-l-4 border-l-avex-lime">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-full">
                    <Clock size={20} className="text-avex-lime" />
                </div>
                <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/50 block">পরবর্তী ওয়াক্ত</span>
                    <h3 className="text-xl font-bold text-white">{nextPrayerInfo.name}</h3>
                </div>
            </div>
            <div className="text-right">
                <span className="text-2xl font-mono font-bold text-white tracking-tighter">{nextPrayerInfo.timeLeft}</span>
                <span className="text-[10px] text-white/30 block">সময় বাকি</span>
            </div>
        </div>

        <section>
             <div className="flex items-center justify-between mb-4 px-2">
                 <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">সময়সূচী</h2>
             </div>
             <RamadanCalendar />
        </section>

        <section className="pb-24">
            <div className="flex items-center justify-between px-2 mb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/80 flex items-center gap-2">
                    <Star size={14} className="text-avex-lime" fill="currentColor" /> দোয়া সমূহ
                </h2>
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                        <ChevronRight size={14} />
                    </div>
                </div>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-8 -mx-6 px-6 snap-x hide-scrollbar">
                {DUAS.map(dua => (
                    <DuaCard key={dua.id} dua={dua} />
                ))}
            </div>
        </section>
    </div>
  );

  return (
    <div className={`min-h-screen w-full bg-avex-black text-white relative overflow-x-hidden selection:bg-avex-lime/30 font-sans ${isRamadanNight ? 'theme-night' : ''}`}>
      
      {/* Install Prompt Component Handles Both iOS and Android */}
      <InstallPrompt />

      {/* Dynamic Background Stars */}
      <div className="fixed inset-0 pointer-events-none z-0">
         {isRamadanNight && <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent opacity-50" />}
      </div>

      <DynamicIsland 
        nextPrayer={nextPrayerInfo.name} 
        timeLeft={nextPrayerInfo.timeLeft} 
        type="normal" 
      />

      <main className="relative z-10 pt-32 px-6 max-w-lg mx-auto min-h-screen">
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'home' && renderHome()}
                {activeTab === 'tracker' && <RamadanTracker />}
                {activeTab === 'tasbih' && <TasbihCounter />}
                {activeTab === 'spiritual' && <SpiritualHub onAdminRequest={() => {}} />}
                {activeTab === 'ai' && <AIAssistant />}
            </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav currentTab={activeTab} onChange={setActiveTab} />
      
      {/* Welcome Popup */}
      <AnimatePresence>
          {showWelcome && (
              <WelcomePopup name={user.name} onClose={handleCloseWelcome} />
          )}
      </AnimatePresence>

      {/* Tutorial Overlay */}
      <AnimatePresence>
          {showTutorial && (
              <TutorialOverlay onComplete={handleCloseTutorial} />
          )}
      </AnimatePresence>
    </div>
  );
};

export default App;
