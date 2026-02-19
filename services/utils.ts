

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

// --- Notification Helpers ---

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const sendNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
        // Check if service worker is ready (for Mobile/PWA support)
        if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: body,
                    icon: 'https://cdn-icons-png.flaticon.com/512/2317/2317963.png',
                    vibrate: [200, 100, 200],
                    tag: 'avex-ramadan'
                } as any);
            });
        } else {
            // Fallback for desktop
            new Notification(title, {
                body: body,
                icon: 'https://cdn-icons-png.flaticon.com/512/2317/2317963.png',
            });
        }
    }
};

// --- New Phonetic Converter ---
export const englishToBengaliPhonetic = (text: string): string => {
  if (!text) return '';
  let s = text.toLowerCase();
  
  // Specific Quranic Words adjustments
  s = s.replace(/allahu/g, 'আল্লাহু');
  s = s.replace(/allahi/g, 'আল্লাহি');
  s = s.replace(/allah/g, 'আল্লাহ');
  s = s.replace(/bismillah/g, 'বিসমিল্লাহ');
  
  // Initial Vowels (start of string or after space/hyphen)
  s = s.replace(/(^|[\s-])a/g, '$1আ');
  s = s.replace(/(^|[\s-])i/g, '$1ই');
  s = s.replace(/(^|[\s-])u/g, '$1উ');
  s = s.replace(/(^|[\s-])e/g, '$1এ');
  s = s.replace(/(^|[\s-])o/g, '$1ও');

  // Double Consonants (Approximating Shadda)
  s = s.replace(/ll/g, 'ল্ল');
  s = s.replace(/mm/g, 'ম্ম');
  s = s.replace(/nn/g, 'ন্ন');
  s = s.replace(/bb/g, 'ব্ব');
  s = s.replace(/dd/g, 'দ্দ');
  s = s.replace(/tt/g, 'ত্ত');
  s = s.replace(/rr/g, 'রর'); // No standard juktaborno for RR easily typed

  // Multi-char consonants
  const multiCons: [string, string][] = [
      ['sh', 'শ'], ['th', 'থ'], ['gh', 'ঘ'], ['kh', 'খ'], 
      ['dh', 'ধ'], ['ph', 'ফ'], ['ch', 'চ'], ['zh', 'ঝ']
  ];
  multiCons.forEach(([eng, ben]) => {
      s = s.replace(new RegExp(eng, 'g'), ben);
  });

  // Single Consonants
  const singleCons: Record<string, string> = {
      'b': 'ব', 'c': 'ক', 'd': 'দ', 'f': 'ফ', 'g': 'গ', 'h': 'হ', 
      'j': 'জ', 'k': 'ক', 'l': 'ল', 'm': 'ম', 'n': 'ন', 'p': 'প', 
      'q': 'ক', 'r': 'র', 's': 'স', 't': 'ত', 'v': 'ভ', 'w': 'ওয়', 
      'x': 'ক্স', 'y': 'ইয়', 'z': 'য'
  };
  for (const [eng, ben] of Object.entries(singleCons)) {
      s = s.replace(new RegExp(eng, 'g'), ben);
  }

  // Medial Vowels (kars)
  s = s.replace(/aa/g, 'া');
  s = s.replace(/ee/g, 'ী');
  s = s.replace(/oo/g, 'ূ');
  s = s.replace(/a/g, 'া');
  s = s.replace(/i/g, 'ি');
  s = s.replace(/u/g, 'ু');
  s = s.replace(/e/g, 'ে');
  s = s.replace(/o/g, 'ো');
  
  // Cleanup
  s = s.replace(/'/g, ''); // Remove apostrophes
  s = s.replace(/-/g, '-'); // Keep hyphens
  
  return s;
};
