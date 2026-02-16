
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Activity, Bell, FileText, Settings, LogOut, ArrowLeft, Search, Calendar, Save, Trash2, Edit2, Plus, Lock, Sparkles, CheckCircle, AlertCircle, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../services/database';
import { AdminStats, UserProfile, Dua, CalendarOverride } from '../types';
import { DUAS } from '../constants';
import { fetchMonthlyCalendar } from '../services/prayerService';
import { parseCalendarText, ParsedTiming } from '../services/aiService';

interface AdminDashboardProps {
    onBack: () => void;
}

// Mock Data for Admin View (Users list still mocked as we don't have a 'getAllUsers' in db service yet)
const MOCK_USERS: UserProfile[] = [
    { id: '1', name: 'Tahsin Rijon', role: 'admin', hasOnboarded: true, streak: 12, totalFasts: 12, badges: [] },
    { id: '2', name: 'Sarah Ahmed', role: 'user', hasOnboarded: true, streak: 5, totalFasts: 5, badges: [] },
    { id: '3', name: 'Karim Ullah', role: 'user', hasOnboarded: true, streak: 8, totalFasts: 8, badges: [] },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
    const [contentDuas, setContentDuas] = useState<Dua[]>(DUAS);
    const [calendarData, setCalendarData] = useState<any[]>([]);
    
    // Calendar Navigation State
    const [selectedMonth, setSelectedMonth] = useState(3); // Default March
    const [selectedYear, setSelectedYear] = useState(2026); // Default 2026

    // AI States
    const [aiInputText, setAiInputText] = useState('');
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [aiParsedData, setAiParsedData] = useState<ParsedTiming[]>([]);
    const [aiError, setAiError] = useState('');

    const refreshCalendar = () => {
        fetchMonthlyCalendar({ latitude: 23.8103, longitude: 90.4125 }, selectedMonth, selectedYear).then(setCalendarData);
    };

    useEffect(() => {
        db.admin.getStats().then(setStats);
        refreshCalendar();
    }, [selectedMonth, selectedYear]);

    const handleBroadcast = () => {
        const msg = prompt("Enter broadcast message:");
        if (msg) db.admin.broadcastMessage(msg);
    };

    const handleDeleteUser = (id: string) => {
        if (confirm('Are you sure you want to ban this user?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const handleDeleteDua = (id: number) => {
         if (confirm('Delete this content?')) {
            setContentDuas(contentDuas.filter(d => d.id !== id));
        }
    };

    const handleTimeChange = (index: number, type: 'Fajr' | 'Maghrib', value: string) => {
        const updated = [...calendarData];
        updated[index].timings[type] = value;
        setCalendarData(updated);
    };

    const saveCalendarOverride = async (day: any) => {
        const dateKey = day.date.readable;
        try {
            await db.calendar.setOverride({
                date: dateKey,
                fajr: day.timings.Fajr,
                maghrib: day.timings.Maghrib
            });
            alert(`Updated timings for ${dateKey}`);
        } catch (error) {
            alert('Failed to update timings');
        }
    };

    // --- AI Logic ---
    const handleAiProcess = async () => {
        if (!aiInputText.trim()) return;

        setIsAiProcessing(true);
        setAiError('');
        setAiParsedData([]);

        try {
            const data = await parseCalendarText(aiInputText);
            setAiParsedData(data);
            if (data.length === 0) setAiError("Could not extract any data. Please check the text.");
        } catch (err: any) {
            setAiError(err.message || "AI processing failed. Please try again.");
        } finally {
            setIsAiProcessing(false);
        }
    };

    const handleAiApply = async () => {
        if (aiParsedData.length === 0) return;
        
        try {
            const overrides: CalendarOverride[] = aiParsedData.map(item => ({
                date: item.date,
                fajr: item.fajr,
                maghrib: item.maghrib
            }));

            await db.calendar.setBulkOverrides(overrides);
            
            // Automatically switch view to the month of the first parsed date
            if (aiParsedData.length > 0) {
                const firstDate = new Date(aiParsedData[0].date);
                if (!isNaN(firstDate.getTime())) {
                    setSelectedMonth(firstDate.getMonth() + 1);
                    setSelectedYear(firstDate.getFullYear());
                }
            }
            setAiInputText('');
            setAiParsedData([]);
            refreshCalendar();
            alert('Calendar successfully updated from AI data!');
        } catch (error) {
            console.error("Failed to apply bulk overrides", error);
            alert("Failed to apply changes to database.");
        }
    };

    // Render logic remains similar, focusing on the changes made to handlers
    return (
        <div className="min-h-screen bg-black text-white p-6 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <h1 className="text-xl font-bold uppercase tracking-widest">অ্যাডমিন প্যানেল</h1>
                </div>
                <div className="w-10" />
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 overflow-x-auto pb-4 mb-6 border-b border-white/5 hide-scrollbar">
                 {[
                    { id: 'overview', icon: Activity, label: 'ওভারভিউ' },
                    { id: 'users', icon: Users, label: 'ব্যবহারকারী' },
                    { id: 'content', icon: FileText, label: 'কনটেন্ট' },
                    { id: 'calendar', icon: Calendar, label: 'ক্যালেন্ডার' },
                 ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                            activeTab === tab.id ? 'bg-avex-lime text-black font-bold' : 'bg-white/5 text-white/50 hover:bg-white/10'
                        }`}
                     >
                         <tab.icon size={16} />
                         {tab.label}
                     </button>
                 ))}
            </div>

            {/* Content Area */}
            <div className="pb-24">
                {activeTab === 'overview' && stats && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-6 rounded-2xl">
                             <Users size={32} className="text-blue-400 mb-2" />
                             <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
                             <p className="text-xs text-white/40 uppercase">মোট ব্যবহারকারী</p>
                        </div>
                        <div className="glass-card p-6 rounded-2xl">
                             <Activity size={32} className="text-emerald-400 mb-2" />
                             <h3 className="text-3xl font-bold">{stats.activeUsers}</h3>
                             <p className="text-xs text-white/40 uppercase">সক্রিয় আজ</p>
                        </div>
                        <button onClick={handleBroadcast} className="col-span-2 bg-white/10 p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
                            <Bell size={18} /> ব্রডকাস্ট মেসেজ পাঠান
                        </button>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input type="text" placeholder="ব্যবহারকারী খুঁজুন..." className="w-full bg-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:bg-white/10" />
                        </div>
                        {users.map(user => (
                            <div key={user.id} className="glass-card p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-xs font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{user.name}</h4>
                                        <p className="text-xs text-white/40">{user.role} • Streak: {user.streak}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-4">
                         {contentDuas.map(dua => (
                             <div key={dua.id} className="glass-card p-4 rounded-xl">
                                 <div className="flex justify-between items-start mb-2">
                                     <span className="text-[10px] bg-white/10 px-2 py-1 rounded uppercase tracking-wider">{dua.category}</span>
                                     <div className="flex gap-2">
                                         <button className="p-1.5 hover:bg-white/10 rounded"><Edit2 size={14} /></button>
                                         <button onClick={() => handleDeleteDua(dua.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={14} /></button>
                                     </div>
                                 </div>
                                 <h4 className="font-bold text-lg mb-1">{dua.title}</h4>
                                 <p className="text-white/50 text-sm line-clamp-1">{dua.translation}</p>
                             </div>
                         ))}
                         <button className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-white/40 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2">
                             <Plus size={20} /> নতুন কনটেন্ট যুক্ত করুন
                         </button>
                    </div>
                )}

                {activeTab === 'calendar' && (
                    <div className="space-y-6">
                        {/* AI Input Section */}
                        <div className="glass-card p-6 rounded-2xl border border-purple-500/30 bg-purple-900/10">
                            <div className="flex items-center gap-2 mb-4 text-purple-300">
                                <Sparkles size={18} />
                                <h3 className="font-bold">AI অটো-ক্যালেন্ডার</h3>
                            </div>
                            <textarea 
                                value={aiInputText}
                                onChange={(e) => setAiInputText(e.target.value)}
                                placeholder="এখানে ক্যালেন্ডারের টেক্সট পেস্ট করুন (যেমন: '1 Ramadan: Sehri 4:50, Iftar 6:15...')"
                                className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/20 focus:outline-none mb-4"
                            />
                            
                            {aiError && (
                                <div className="flex items-center gap-2 text-red-400 text-xs mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                    <AlertCircle size={14} /> {aiError}
                                </div>
                            )}

                            {aiParsedData.length > 0 ? (
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 text-emerald-400 text-xs mb-2 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                                        <CheckCircle size={14} /> {aiParsedData.length} days parsed successfully!
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleAiApply}
                                            className="flex-1 bg-emerald-500 text-black py-2 rounded-lg font-bold text-sm hover:bg-emerald-400 transition-colors"
                                        >
                                            Confirm & Save to DB
                                        </button>
                                        <button 
                                            onClick={() => setAiParsedData([])}
                                            className="px-4 bg-white/10 text-white py-2 rounded-lg font-bold text-sm hover:bg-white/20"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleAiProcess}
                                    disabled={!aiInputText.trim() || isAiProcessing}
                                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    {isAiProcessing ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />} 
                                    {isAiProcessing ? 'Processing...' : 'Generate with AI'}
                                </button>
                            )}
                        </div>

                        {/* Calendar Editor */}
                        <div className="glass-card p-4 rounded-2xl">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold"> ম্যানুয়াল এডিট</h3>
                                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                                    <button onClick={() => setSelectedMonth(m => m > 1 ? m - 1 : 12)} className="p-1 hover:bg-white/10 rounded"><ChevronLeft size={16} /></button>
                                    <span className="text-xs font-mono w-20 text-center">{selectedMonth}/{selectedYear}</span>
                                    <button onClick={() => setSelectedMonth(m => m < 12 ? m + 1 : 1)} className="p-1 hover:bg-white/10 rounded"><ChevronRight size={16} /></button>
                                </div>
                             </div>

                             <div className="space-y-2">
                                {calendarData.map((day, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white/5 p-2 rounded-lg text-xs">
                                        <div className="col-span-3 text-white/50">{day.date.readable}</div>
                                        <div className="col-span-4">
                                            <label className="block text-[9px] uppercase text-white/20 mb-1">Sehri</label>
                                            <input 
                                                type="text" 
                                                value={day.timings.Fajr.split(' ')[0]} 
                                                onChange={(e) => handleTimeChange(idx, 'Fajr', e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-center"
                                            />
                                        </div>
                                        <div className="col-span-4">
                                            <label className="block text-[9px] uppercase text-white/20 mb-1">Iftar</label>
                                            <input 
                                                type="text" 
                                                value={day.timings.Maghrib.split(' ')[0]} 
                                                onChange={(e) => handleTimeChange(idx, 'Maghrib', e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-center"
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <button 
                                                onClick={() => saveCalendarOverride(day)}
                                                className="p-1.5 bg-avex-lime/10 text-avex-lime rounded hover:bg-avex-lime hover:text-black transition-colors"
                                            >
                                                <Save size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
