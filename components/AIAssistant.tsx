
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "আসসালামু আলাইকুম! আমি আপনার রমজানের সহায়ক। নামাজ, রোজা বা দোয়া সম্পর্কে আমাকে জিজ্ঞেস করতে পারেন।", sender: 'ai' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response logic
    setTimeout(() => {
        let responseText = "চমৎকার প্রশ্ন! বিস্তারিত দোয়ার জন্য 'দ্বীন' বিভাগটি দেখার অনুরোধ রইলো।";
        const lowerInput = userMsg.text.toLowerCase();
        
        if (lowerInput.includes('দোয়া') || lowerInput.includes('নামাজ')) {
            responseText = "ইফতারের জন্য পড়ুন: 'আল্লাহুম্মা ইন্নি লাকা সুমতু...'। আরও দোয়া 'দ্বীন' ট্যাবে পাবেন।";
        } else if (lowerInput.includes('ক্ষুধা') || lowerInput.includes('রোজা')) {
            responseText = "ধৈর্য ধরুন! রোজার প্রতিদান অনেক। কুরআন বা জিকিরে নিজেকে ব্যস্ত রাখুন।";
        } else if (lowerInput.includes('সময়') || lowerInput.includes('ইফতার')) {
            responseText = "ইফতারের সময়সূচী হোম স্ক্রিনে বা ডাইনামিক আইল্যান্ডে দেখতে পাবেন।";
        }

        const aiMsg: Message = { id: Date.now() + 1, text: responseText, sender: 'ai' };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col pb-24 relative">
       {/* Chat Header */}
       <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-avex-lime to-emerald-500 flex items-center justify-center">
                <Sparkles size={20} className="text-black" />
            </div>
            <div>
                <h2 className="font-bold text-white">আভেক্স এআই</h2>
                <p className="text-[10px] text-avex-lime uppercase tracking-wider">অনলাইন • রমজান অ্যাসিস্ট্যান্ট</p>
            </div>
       </div>

       {/* Messages Area */}
       <div className="flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar">
            {messages.map((msg) => (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user' 
                        ? 'bg-avex-lime text-black rounded-tr-none' 
                        : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                    }`}>
                        {msg.text}
                    </div>
                </motion.div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1">
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200" />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
       </div>

       {/* Input Area */}
       <div className="mt-4 relative">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="প্রশ্ন করুন..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-14 py-4 text-white placeholder-white/30 focus:outline-none focus:border-avex-lime/50 transition-colors"
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="absolute right-2 top-2 p-2 rounded-full bg-avex-lime text-black hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send size={20} />
            </button>
       </div>
    </div>
  );
};

export default AIAssistant;
