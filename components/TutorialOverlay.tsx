
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BookOpen, Sparkles, Home, ArrowRight, Check } from 'lucide-react';

interface TutorialOverlayProps {
  onComplete: () => void;
}

const STEPS = [
    {
        id: 1,
        title: "স্বাগতম আভেক্স রমজানে",
        desc: "আপনার দৈনন্দিন ইবাদত এবং রমজানের সময়সূচী এখন হাতের মুঠোয়। চলুন দেখে নেয়া যাক অ্যাপের বিশেষ ফিচারগুলো।",
        icon: <Home size={40} className="text-avex-lime" />
    },
    {
        id: 2,
        title: "ডাইনামিক আইল্যান্ড",
        desc: "স্ক্রিনের একদম উপরে নামাজের সময় এবং কাউন্টডাউন দেখুন সব সময়। এটি অ্যাপের যেকোনো জায়গা থেকে দেখা যায়।",
        icon: <Activity size={40} className="text-blue-400" />
    },
    {
        id: 3,
        title: "দ্বীন ও শিক্ষা",
        desc: "পুরো কুরআন শরীফ বাংলা অর্থ ও উচ্চারণসহ পড়ুন। সাথে আছে প্রতিদিনের প্রয়োজনীয় দোয়া ও আমল।",
        icon: <BookOpen size={40} className="text-emerald-400" />
    },
    {
        id: 4,
        title: "এআই অ্যাসিস্ট্যান্ট",
        desc: "ইসলামী যেকোনো প্রশ্ন বা মাসয়ালা জানতে আমাদের এআই-এর সাথে চ্যাট করুন।",
        icon: <Sparkles size={40} className="text-purple-400" />
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
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
        
        <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="relative z-10 w-full max-w-sm bg-[#111] border border-white/10 rounded-[2.5rem] p-8 text-center overflow-hidden"
        >
            {/* Background Blob */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center min-h-[300px] justify-between">
                <div className="mt-8">
                    <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl mx-auto">
                        {STEPS[currentStep].icon}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
                        {STEPS[currentStep].title}
                    </h2>
                    <p className="text-white/60 leading-relaxed text-sm">
                        {STEPS[currentStep].desc}
                    </p>
                </div>

                <div className="w-full mt-10">
                    <div className="flex justify-center gap-2 mb-8">
                        {STEPS.map((_, i) => (
                            <div 
                                key={i} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    i === currentStep ? 'w-8 bg-avex-lime' : 'w-2 bg-white/20'
                                }`} 
                            />
                        ))}
                    </div>

                    <button 
                        onClick={handleNext}
                        className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
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
    </div>
  );
};

export default TutorialOverlay;
