
import { GoogleGenAI, Type } from "@google/genai";

export interface ParsedTiming {
  date: string; // "DD MMM YYYY" or "YYYY-MM-DD"
  fajr: string; // "HH:MM"
  maghrib: string; // "HH:MM"
}

export const parseCalendarText = async (text: string): Promise<ParsedTiming[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `Extract the Ramadan calendar dates, Sehri (Fajr) ends time, and Iftar (Maghrib) start time from the following text.
      
      CRITICAL RULES:
      1. Target Year: 2026.
      2. TRANSLATION: You MUST translate Bengali month names to English Short Format.
         - 'ফেব্রুয়ারি' -> 'Feb'
         - 'মার্চ' -> 'Mar'
         - 'এপ্রিল' -> 'Apr'
      3. NUMBERS: Convert ALL Bengali digits (০,১,২,৩,৪,৫,৬,৭,৮,৯) to English digits (0,1,2,3,4,5,6,7,8,9).
      4. DATE FORMAT: Return dates STRICTLY in 'DD MMM YYYY' format (e.g., "19 Feb 2026", "01 Mar 2026").
      5. TIME FORMAT: Return times in 'HH:MM' (24-hour format). Ensure single digit hours have a leading zero (e.g., "05:12", not "5:12").
      6. Structure: Return ONLY the JSON array.

      Input Text:
      "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "Date in 'DD MMM YYYY' format (e.g., 19 Feb 2026)" },
              fajr: { type: Type.STRING, description: "Sehri/Fajr time in HH:MM (e.g., 05:12)" },
              maghrib: { type: Type.STRING, description: "Iftar/Maghrib time in HH:MM (e.g., 17:58)" }
            },
            required: ["date", "fajr", "maghrib"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data as ParsedTiming[];
    }
    return [];
  } catch (error: any) {
    console.error("AI Parsing Error:", error);
    if (error.status === 404 || (error.message && error.message.includes('404'))) {
        throw new Error("Model not found (404). Please check if your API Key supports 'gemini-3-flash-preview'.");
    }
    throw new Error("Failed to parse schedule. Ensure the text contains dates and times.");
  }
};
