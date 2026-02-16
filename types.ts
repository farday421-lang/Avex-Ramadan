
export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface PrayerData {
  timings: PrayerTimings;
  date: {
    readable: string;
    hijri: {
      date: string;
      month: {
        en: string;
        ar: string;
      };
      day: string;
    };
  };
}

export interface Dua {
  id: number;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  category: 'Sehri' | 'Iftar' | 'General';
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserProfile {
  id: string;
  name: string;
  hasOnboarded: boolean;
  streak: number;
  totalFasts: number;
  role: 'user' | 'admin';
  badges: string[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

// --- New Types ---

export interface JournalEntry {
  id: string;
  date: string;
  mood: 'happy' | 'grateful' | 'tired' | 'sad' | 'neutral';
  text: string;
  timestamp: number;
}

export interface WaterLog {
  date: string;
  glasses: number;
  goal: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  isDefault: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalFasts: number;
  totalTasbih: number;
}

export interface CalendarOverride {
  date: string; // YYYY-MM-DD or comparable key
  fajr: string;
  maghrib: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface QuranProgress {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  timestamp: number;
}
