import { GoogleGenAI, Type } from "@google/genai";
import { ScheduleItem } from "../types";

const parseScheduleImage = async (base64Image: string): Promise<ScheduleItem[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image,
            },
          },
          {
            text: `Analyze this timetable image VERY CAREFULLY. This is a grid where:
- The FIRST COLUMN contains day names (Monday, Tuesday, etc.)
- The HEADER ROW contains time slots (like 9-10, 10-11, 11-12, 12-01, 01-02, 02-03, 03-04)
- Each cell contains a class name, or is EMPTY

STRICT RULES - FOLLOW EXACTLY:

1. **ONLY EXTRACT VISIBLE TEXT**: If you see text in a cell, extract it. If a cell is empty, blank, has only a background color, or you cannot clearly read any text - DO NOT create an entry for it.

2. **MAP TIMES FROM COLUMN HEADERS**: Look at which column a cell is in and use THAT column's time slot.
   - Column "9-10" → startTime: "9:00 AM", endTime: "10:00 AM"
   - Column "10-11" → startTime: "10:00 AM", endTime: "11:00 AM"
   - Column "11-12" → startTime: "11:00 AM", endTime: "12:00 PM"
   - Column "12-01" → startTime: "12:00 PM", endTime: "1:00 PM"
   - Column "01-02" → startTime: "1:00 PM", endTime: "2:00 PM"
   - Column "02-03" → startTime: "2:00 PM", endTime: "3:00 PM"
   - Column "03-04" → startTime: "3:00 PM", endTime: "4:00 PM"

3. **MERGED/WIDE CELLS**: If a cell spans 2 columns (like labs), the end time should be the END of the second column. Example: a cell spanning "11-12" and "12-01" = 11:00 AM to 1:00 PM.

4. **GROUPS**: If you see G1, G2, Group 1, Group 2, etc., extract as the group field. If text says "SC LAB G1", subject is "SC LAB" and group is "G1".

5. **ONE ROW = ONE DAY**: Do not mix data from different rows.

6. **DO NOT HALLUCINATE**: If uncertain about any cell, SKIP IT. It's better to miss a class than to invent one.

Return JSON array with objects containing:
- day: string (Monday, Tuesday, etc.)
- startTime: string (HH:MM AM/PM)
- endTime: string (HH:MM AM/PM)  
- subject: string (the class name)
- room: string or null (room number if visible)
- group: string or null (G1, G2, 1, 2, etc. if for specific group)`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        temperature: 0,
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              subject: { type: Type.STRING },
              room: { type: Type.STRING, nullable: true },
              group: { type: Type.STRING, nullable: true },
            },
            required: ["day", "startTime", "endTime", "subject"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];

    const rawData = JSON.parse(text);

    // Add unique IDs to the parsed items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schedule: ScheduleItem[] = rawData.map((item: any) => ({
      ...item,
      id: crypto.randomUUID(),
    }));

    return schedule;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to process schedule image. Please try again.");
  }
};

export const geminiService = {
  parseScheduleImage,
};