
export const toBengaliNumber = (num: number | string): string => {
  const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const bengali = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(c => {
    const index = english.indexOf(c);
    return index > -1 ? bengali[index] : c;
  }).join('');
};

export const translatePrayer = (name: string): string => {
    const map: Record<string, string> = {
        'Fajr': 'ফজর', 
        'Sunrise': 'সূর্যোদয়', 
        'Dhuhr': 'জোহর', 
        'Asr': 'আসর', 
        'Maghrib': 'মাগরিব', 
        'Isha': 'ইশা', 
        'Sunset': 'সূর্যাস্ত',
        'Midnight': 'মধ্যরাত'
    };
    return map[name] || name;
};

export const getBengaliMonth = (monthIndex: number): string => {
    const months = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    return months[monthIndex];
};

export const getBengaliDay = (dayIndex: number): string => {
    const days = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];
    return days[dayIndex];
};

export const getBengaliTimePeriod = (date: Date): string => {
    const hour = date.getHours();
    
    if (hour >= 3 && hour < 6) return 'ভোর'; // 3 AM - 6 AM
    if (hour >= 6 && hour < 12) return 'সকাল'; // 6 AM - 12 PM
    if (hour >= 12 && hour < 15) return 'দুপুর'; // 12 PM - 3 PM
    if (hour >= 15 && hour < 18) return 'বিকেল'; // 3 PM - 6 PM
    if (hour >= 18 && hour < 20) return 'সন্ধ্যা'; // 6 PM - 8 PM
    return 'রাত'; // 8 PM - 3 AM
};
