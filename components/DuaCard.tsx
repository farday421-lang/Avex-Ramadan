
import React from 'react';
import { Dua } from '../types';
import { Quote, Copy, Volume2, Share2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface DuaCardProps {
  dua: Dua;
  variant?: 'carousel' | 'modal' | 'list';
}

const DuaCard: React.FC<DuaCardProps> = ({ dua, variant = 'carousel' }) => {
  // Container Sizing based on variant
  const containerClasses = {
    carousel: "min-w-[85vw] sm:min-w-[380px] snap-center",
    modal: "w-full",
    list: "w-full"
  };

  // Card Styling based on variant
  const cardClasses = {
    carousel: "min-h-[320px] p-8",
    modal: "p-8 max-h-[80vh] overflow-y-auto custom-scrollbar",
    list: "p-5 hover:border-avex-lime/50 cursor-pointer"
  };

  const isModal = variant === 'modal';
  const isList = variant === 'list';

  return (
    <div className={containerClasses[variant]}>
      <div className={`relative glass-card rounded-[2rem] overflow-hidden group transition-all duration-500 border border-white/5 ${cardClasses[variant]}`}>
        
        {/* Background Texture & Glow */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-overlay pointer-events-none" />
        <div className={`absolute top-0 right-0 rounded-full blur-[80px] -mr-16 -mt-16 transition-all duration-700 opacity-15 group-hover:opacity-25 ${
             dua.category === 'Sehri' ? 'bg-blue-500' :
             dua.category === 'Iftar' ? 'bg-orange-500' :
             'bg-avex-lime'
        } ${isModal ? 'w-64 h-64 opacity-20' : 'w-48 h-48'}`} />

        <div className="relative z-10 flex flex-col h-full">
            
            {/* Header: Category & Actions */}
            <div className="flex items-start justify-between mb-6">
                <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border backdrop-blur-md font-sans ${
                  dua.category === 'Sehri' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                  dua.category === 'Iftar' ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' :
                  'bg-avex-lime/10 text-avex-lime border-avex-lime/20'
                }`}>
                    {dua.category}
                </span>
                
                {isModal ? (
                    <div className="flex gap-2">
                        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <Volume2 size={18} />
                        </button>
                        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <Copy size={18} />
                        </button>
                    </div>
                ) : (
                    <Quote size={20} className="text-white/20 group-hover:text-white/40 transition-colors" fill="currentColor" />
                )}
            </div>

            {/* Title */}
            <h3 className={`${isModal ? 'text-3xl text-center mb-8' : 'text-2xl mb-4'} font-bold text-white tracking-tight font-sans`}>
                {dua.title}
            </h3>

            {/* Content Body */}
            <div className={`flex-1 flex flex-col ${isModal ? 'gap-8' : 'gap-4'}`}>
                
                {/* Arabic Text */}
                <div className={`relative ${isModal ? 'bg-white/5 rounded-3xl p-8 border border-white/5' : ''}`}>
                    {isModal && <Sparkles size={16} className="absolute top-4 left-4 text-white/10" />}
                    <p className={`${isModal ? 'text-4xl leading-[2] text-center' : 'text-3xl leading-loose text-right'} font-bold text-white drop-shadow-md`} dir="rtl" style={{ fontFamily: 'serif' }}>
                        {dua.arabic}
                    </p>
                    {isModal && <Sparkles size={16} className="absolute bottom-4 right-4 text-white/10" />}
                </div>

                {/* Translation Block */}
                <div className={`${isModal ? 'bg-black/40 p-6 rounded-2xl border border-white/5' : 'bg-black/20 p-4 rounded-2xl border border-white/5'}`}>
                    
                    {!isList && (
                        <>
                            <p className="text-sm text-avex-lime/90 italic tracking-wide leading-relaxed font-sans font-medium mb-3">
                                "{dua.transliteration}"
                            </p>
                            <div className="h-[1px] w-full bg-white/10 my-3" />
                        </>
                    )}
                    
                    <p className={`${isModal ? 'text-lg' : 'text-sm'} text-white font-bold leading-relaxed font-sans`}>
                        {dua.translation}
                    </p>
                </div>
            </div>

            {/* Footer for List View */}
            {isList && (
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-white/30">
                     <span>Tap to read more</span>
                     <Share2 size={14} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DuaCard;
