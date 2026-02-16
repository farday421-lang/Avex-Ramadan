
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Capture Android Prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Show iOS hint after a delay if on iOS and not standalone
    if (ios) {
        const timer = setTimeout(() => setShowIOS(true), 3000);
        return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (isStandalone) return null;

  return (
    <>
      {/* ANDROID BUTTON - Top Left */}
      {deferredPrompt && (
        <div className="fixed top-6 left-6 z-[60]">
            <button 
              onClick={handleAndroidInstall}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white/70 hover:bg-avex-lime hover:text-black transition-all shadow-lg animate-pulse"
              title="Install App"
            >
              <Download size={20} />
            </button>
        </div>
      )}

      {/* iOS INSTRUCTION MODAL - Bottom Sheet style */}
      <AnimatePresence>
        {showIOS && isIOS && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 z-[100] bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl"
          >
            <button 
                onClick={() => setShowIOS(false)}
                className="absolute top-4 right-4 text-white/30 hover:text-white"
            >
                <X size={18} />
            </button>

            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-avex-lime to-emerald-500 flex items-center justify-center shrink-0">
                    <Smartphone size={24} className="text-black" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm mb-1">অ্যাপটি ইনস্টল করুন</h3>
                    <p className="text-xs text-white/60 leading-relaxed mb-3">
                        সেরা অভিজ্ঞতার জন্য iPhone এ অ্যাপটি ইনস্টল করুন।
                    </p>
                    
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs text-white/80">
                            <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-full">১</span>
                            <span>নিচের <Share size={12} className="inline mx-1 text-blue-400" /> <b>Share</b> বাটনে ক্লিক করুন</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/80">
                            <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-full">২</span>
                            <span>মেনু থেকে <PlusSquare size={12} className="inline mx-1 text-white" /> <b>Add to Home Screen</b> সিলেক্ট করুন</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pointer arrow to bottom center (Safari toolbar location) */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a1a1a]/90 rotate-45 border-r border-b border-white/10"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallPrompt;
