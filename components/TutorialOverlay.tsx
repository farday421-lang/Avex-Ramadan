
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BookOpen, Sparkles, Home, ArrowRight, Check, Droplet, Clock } from 'lucide-react';

interface TutorialOverlayProps {
  onComplete: () => void;
}

const STEPS = [
    {
        id: 1,
        title: "হোম ও ডাইনামিক আইল্যান্ড",
        desc: "নামাজের সময়, সেহরি ও ইফতারের কাউন্টডাউন এখন ডাইনামিক আইল্যান্ডে। অ্যাপের যেকোনো জায়গা থেকে সময়ের দিকে নজর রাখুন।",
        icon: <Clock size={40} className="text-avex-lime" />,
        color: "bg-avex-lime/10 border-avex-lime/20"
    },
    {
        id: 2,
        title: "কুরআন ও অডিও",
        desc: "আরবি তিলাওয়াত, বাংলা উচ্চারণ এবং অর্থসহ পুরো কুরআন শরীফ পড়ুন এবং শুনুন। যেকোনো আয়াত বুকমার্ক করে রাখুন।",
        icon: <BookOpen size={40} className="text-emerald-400" />,
        color: "bg-emerald-500/10 border-emerald-500/20"
    },
    {
        id: 3,
        title: "ইবাদত ট্র্যাকার",
        desc: "আপনার রোজা, নামাজ, পানি পান এবং দৈনন্দিন আমল ট্র্যাক করুন। নিজের অগ্রগতির জন্য ব্যাজ অর্জন করুন।",
        icon: <Activity size={40} className="text-blue-400" />,
        color: "bg-blue-500/10 border-blue-500/20"
    },
    {
        id: 4,
        title: "ইসলামিক এআই",
        desc: "আপনার ব্যক্তিগত ইসলামিক অ্যাসিস্ট্যান্ট। রোজা, নামাজ বা দ্বীন নিয়ে যেকোনো প্রশ্ন করুন, মুহূর্তেই উত্তর পাবেন।",
        icon: <Sparkles size={40} className="text-purple-400" />,
        color: "bg-purple-500/10 border-purple-500/20"
    }
];

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
      if (currentStep < STEPS.length - 1) {
          setCurrentStep(c => c + 1);
      } else {
          onComplete();
      }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
        
        <AnimatePresence mode="wait">
            <motion.div 
                key={currentStep}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="relative z-10 w-full max-w-sm bg-[#050505] border border-white/10 rounded-[2.5rem] p-8 text-center overflow-hidden shadow-2xl"
            >
                {/* Background Glow */}
                <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${STEPS[currentStep].color.split(' ')[0]} to-transparent pointer-events-none opacity-50`} />
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/5 rounded-full blur-[60px]" />
                
                <div className="relative z-10 flex flex-col items-center min-h-[350px] justify-between">
                    <div className="mt-4 w-full">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl mx-auto backdrop-blur-xl border ${STEPS[currentStep].color}`}
                        >
                            {STEPS[currentStep].icon}
                        </motion.div>
                        
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-2xl font-bold text-white mb-4 leading-tight font-sans"
                        >
                            {STEPS[currentStep].title}
                        </motion.h2>
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/60 leading-relaxed text-sm"
                        >
                            {STEPS[currentStep].desc}
                        </motion.p>
                    </div>

                    <div className="w-full mt-10">
                        {/* Dots Indicator */}
                        <div className="flex justify-center gap-2 mb-8">
                            {STEPS.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                        i === currentStep ? 'w-8 bg-avex-lime' : 'w-2 bg-white/10'
                                    }`} 
                                />
                            ))}
                        </div>

                        <button 
                            onClick={handleNext}
                            className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            {currentStep === STEPS.length - 1 ? (
                                <>শুরু করুন <Check size={18} /></>
                            ) : (
                                <>পরবর্তী <ArrowRight size={18} /></>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    </div>
  );
};

export default TutorialOverlay;
