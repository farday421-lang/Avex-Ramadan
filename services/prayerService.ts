
import { PrayerData, Coordinates } from '../types';
import { db } from './database';

const API_BASE = 'https://api.aladhan.com/v1';

export const fetchPrayerTimes = async (coords: Coordinates): Promise<PrayerData | null> => {
  try {
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000);
    
    const response = await fetch(
      `${API_BASE}/timings/${timestamp}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=2`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch prayer times');
    }

    const json = await response.json();
    
    // Apply override for today if exists (Async now)
    try {
        const overrides = await db.calendar.getOverrides();
        const todayKey = json.data.date.readable; 
        if (overrides[todayKey]) {
            json.data.timings.Fajr = overrides[todayKey].fajr;
            json.data.timings.Maghrib = overrides[todayKey].maghrib;
        }
    } catch (e) {
        console.warn("Could not fetch overrides", e);
    }

    return json.data;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return null;
  }
};

export const fetchMonthlyCalendar = async (coords: Coordinates, month?: number, year?: number): Promise<any[]> => {
  try {
    const m = month || 3; 
    const y = year || 2026;
    
    const response = await fetch(
      `${API_BASE}/calendar?latitude=${coords.latitude}&longitude=${coords.longitude}&method=2&month=${m}&year=${y}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar');
    }

    const json = await response.json();
    
    // Merge overrides (Async)
    let overrides = {};
    try {
        overrides = await db.calendar.getOverrides();
    } catch(e) {
        console.warn("Could not fetch overrides", e);
    }

    const updatedData = json.data.map((day: any) => {
        const dateKey = day.date.readable; 
        if (overrides[dateKey]) {
            return {
                ...day,
                timings: {
                    ...day.timings,
                    Fajr: overrides[dateKey].fajr,
                    Maghrib: overrides[dateKey].maghrib
                }
            };
        }
        return day;
    });

    return updatedData;
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return [];
  }
};

export const getNextPrayer = (timings: any): { name: string; time: string; timeLeft: string } => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  let nextPrayerName = 'Fajr';
  let nextPrayerTimeStr = timings['Fajr'];

  for (const p of prayers) {
    const timeStr = timings[p];
    const cleanTime = timeStr.split(' ')[0];
    const [h, m] = cleanTime.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    
    if (prayerMinutes > currentMinutes) {
      nextPrayerName = p;
      nextPrayerTimeStr = cleanTime;
      break;
    }
  }

  const [nextH, nextM] = nextPrayerTimeStr.split(' ')[0].split(':').map(Number);
  let diffMinutes = (nextH * 60 + nextM) - currentMinutes;
  
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }

  const hoursLeft = Math.floor(diffMinutes / 60);
  const minsLeft = diffMinutes % 60;

  return {
    name: nextPrayerName,
    time: nextPrayerTimeStr,
    timeLeft: `${hoursLeft}h ${minsLeft}m`
  };
};
