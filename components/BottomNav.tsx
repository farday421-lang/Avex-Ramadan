
import React from 'react';
import { Home, Activity, BookOpen, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  currentTab: string;
  onChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'হোম' },
    { id: 'tracker', icon: Activity, label: 'ট্র্যাকার' },
    { id: 'tasbih', icon: User, label: 'তসবিহ' }, 
    { id: 'spiritual', icon: BookOpen, label: 'দ্বীন' },
    { id: 'ai', icon: Sparkles, label: 'এআই' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 px-6">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2rem] px-6 py-4 shadow-2xl flex items-center gap-8">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-col items-center justify-center group"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-white/10 rounded-xl -m-2"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <Icon 
                size={24} 
                className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-avex-lime' : 'text-white/40 group-hover:text-white/80'}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              
              {isActive && (
                <motion.div 
                    layoutId="nav-dot"
                    className="absolute -bottom-2 w-1 h-1 rounded-full bg-avex-lime"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
