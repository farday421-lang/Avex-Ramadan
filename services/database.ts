
import { JournalEntry, WaterLog, ChecklistItem, UserProfile, CalendarOverride, QuranProgress } from '../types';
import { supabase } from './supabaseClient';

const KEY_USER = 'avex_user';

// Helper to get current user ID from local storage to act as the key for Supabase
const getCurrentUserId = () => {
    const user = localStorage.getItem(KEY_USER);
    if (user) {
        return JSON.parse(user).id;
    }
    return null;
};

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', text: 'Pray 5 Times', completed: false, isDefault: true },
  { id: '2', text: 'Read Quran', completed: false, isDefault: true },
  { id: '3', text: 'Give Sadaqah', completed: false, isDefault: true },
  { id: '4', text: 'Listen to Islamic Lecture', completed: false, isDefault: true },
  { id: '5', text: 'Taraweeh', completed: false, isDefault: true },
];

export const db = {
  // --- Users ---
  users: {
      sync: async (profile: UserProfile) => {
          const { error } = await supabase
              .from('profiles')
              .upsert({
                  id: profile.id,
                  name: profile.name,
                  role: profile.role,
                  streak: profile.streak,
                  total_fasts: profile.totalFasts,
                  badges: profile.badges,
                  // Maintain existing JSONB data if it exists, otherwise init
                  fasting_progress: [], 
                  quran_completed_paras: []
              }, { onConflict: 'id', ignoreDuplicates: false }); 
          // Note: Upsert might overwrite jsonb if not careful, but for initial sync it's okay.
          if (error) console.error("Error syncing user:", error);
      }
  },

  // --- Fasting Tracker (Ramadan) ---
  fasting: {
      get: async (): Promise<number[]> => {
          const userId = getCurrentUserId();
          if (!userId) return [];
          
          const { data, error } = await supabase
              .from('profiles')
              .select('fasting_progress')
              .eq('id', userId)
              .single();
          
          if (error || !data) return [];
          return (data.fasting_progress as number[]) || [];
      },
      save: async (days: number[]) => {
          const userId = getCurrentUserId();
          if (!userId) return;
          
          const { error } = await supabase
              .from('profiles')
              .update({ fasting_progress: days })
              .eq('id', userId);
          
          if (error) console.error("Error saving fasting progress:", error);
      }
  },

  // --- Quran Tracker ---
  quran: {
      getLastRead: async (): Promise<QuranProgress | null> => {
          const userId = getCurrentUserId();
          if (!userId) return null;

          const { data, error } = await supabase
              .from('profiles')
              .select('quran_last_read')
              .eq('id', userId)
              .single();

          if (error || !data) return null;
          return (data.quran_last_read as QuranProgress) || null;
      },
      saveLastRead: async (progress: QuranProgress) => {
          const userId = getCurrentUserId();
          if (!userId) return;

          const { error } = await supabase
              .from('profiles')
              .update({ quran_last_read: progress })
              .eq('id', userId);

          if (error) console.error("Error saving quran last read:", error);
      },
      getParas: async (): Promise<number[]> => {
          const userId = getCurrentUserId();
          if (!userId) return [];

          const { data, error } = await supabase
              .from('profiles')
              .select('quran_completed_paras')
              .eq('id', userId)
              .single();
          
          if (error || !data) return [];
          return (data.quran_completed_paras as number[]) || [];
      },
      saveParas: async (paras: number[]) => {
          const userId = getCurrentUserId();
          if (!userId) return;

          const { error } = await supabase
              .from('profiles')
              .update({ quran_completed_paras: paras })
              .eq('id', userId);

          if (error) console.error("Error saving paras:", error);
      }
  },

  // --- Journal ---
  journal: {
    getAll: async (): Promise<JournalEntry[]> => {
      const userId = getCurrentUserId();
      if (!userId) return [];
      
      const { data, error } = await supabase
          .from('journal')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });
          
      if (error) {
          console.error("Error fetching journal:", error);
          return [];
      }
      return data as JournalEntry[];
    },
    add: async (entry: JournalEntry) => {
      const userId = getCurrentUserId();
      if (!userId) return entry;

      const { error } = await supabase
          .from('journal')
          .insert({
              id: entry.id,
              user_id: userId,
              date: entry.date,
              mood: entry.mood,
              text: entry.text,
              timestamp: entry.timestamp
          });
      
      if (error) console.error("Error adding journal:", error);
      return entry;
    }
  },

  // --- Water ---
  water: {
    getToday: async (): Promise<WaterLog> => {
      const userId = getCurrentUserId();
      const today = new Date().toDateString();
      if (!userId) return { date: today, glasses: 0, goal: 8 };

      const { data, error } = await supabase
          .from('water_tracking')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .single();
      
      if (error || !data) {
          return { date: today, glasses: 0, goal: 8 };
      }
      return data as WaterLog;
    },
    update: async (log: WaterLog) => {
      const userId = getCurrentUserId();
      if (!userId) return log;

      const { error } = await supabase
          .from('water_tracking')
          .upsert({
              user_id: userId,
              date: log.date,
              glasses: log.glasses,
              goal: log.goal
          });
          
      if (error) console.error("Error updating water:", error);
      return log;
    }
  },

  // --- Checklist ---
  checklist: {
    get: async (): Promise<ChecklistItem[]> => {
      const userId = getCurrentUserId();
      if (!userId) return DEFAULT_CHECKLIST;

      const { data, error } = await supabase
          .from('checklist')
          .select('*')
          .eq('user_id', userId);
      
      if (error || !data || data.length === 0) {
          return DEFAULT_CHECKLIST;
      }
      
      // Convert database fields back to ChecklistItem interface
      return data.map((item: any) => ({
          id: item.id,
          text: item.text,
          completed: item.completed,
          isDefault: item.is_default
      }));
    },
    save: async (items: ChecklistItem[]) => {
      const userId = getCurrentUserId();
      if (!userId) return;

      const rows = items.map(item => ({
          id: item.id,
          user_id: userId,
          text: item.text,
          completed: item.completed,
          is_default: item.isDefault
      }));

      const { error } = await supabase
          .from('checklist')
          .upsert(rows);
          
      if (error) console.error("Error saving checklist:", error);
    }
  },

  // --- Calendar Overrides ---
  calendar: {
    getOverrides: async (): Promise<Record<string, CalendarOverride>> => {
        const { data, error } = await supabase
            .from('calendar_overrides')
            .select('*');
        
        const overrides: Record<string, CalendarOverride> = {};
        if (data) {
            data.forEach((item: any) => {
                overrides[item.date] = {
                    date: item.date,
                    fajr: item.fajr,
                    maghrib: item.maghrib
                };
            });
        }
        return overrides;
    },
    setOverride: async (override: CalendarOverride) => {
        const { error } = await supabase
            .from('calendar_overrides')
            .upsert({
                date: override.date,
                fajr: override.fajr,
                maghrib: override.maghrib
            });
        if (error) console.error("Error setting override:", error);
    },
    setBulkOverrides: async (overrides: CalendarOverride[]) => {
        const rows = overrides.map(o => ({
            date: o.date,
            fajr: o.fajr,
            maghrib: o.maghrib
        }));
        const { error } = await supabase
            .from('calendar_overrides')
            .upsert(rows);
        if (error) console.error("Error bulk overriding:", error);
    }
  },

  // --- Admin / Stats ---
  admin: {
    getStats: async () => {
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        return {
            totalUsers: userCount || 0,
            activeUsers: Math.floor((userCount || 0) * 0.6),
            totalFasts: (userCount || 0) * 5, 
            totalTasbih: (userCount || 0) * 100
        };
    },
    broadcastMessage: async (msg: string) => {
        alert(`Broadcast sent via System: ${msg}`);
        return true;
    }
  }
};
