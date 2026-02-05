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
              mimeType: "image/png", // Assuming PNG or JPEG, API is flexible usually but best to match
              data: base64Image,
            },
          },
          {
            text: `Analyze this image of a weekly class schedule. 
            Extract all class sessions into a structured list.
            Return a JSON array where each object contains:
            - day: Full English name of the day (e.g., "Monday")
            - startTime: format HH:MM AM/PM
            - endTime: format HH:MM AM/PM
            - subject: Name of the course or subject
            - room: (Optional) Room number or location if visible
            
            Strictly output valid JSON matching the schema.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
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

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process schedule image. Please try again.");
  }
};

export const geminiService = {
  parseScheduleImage,
};