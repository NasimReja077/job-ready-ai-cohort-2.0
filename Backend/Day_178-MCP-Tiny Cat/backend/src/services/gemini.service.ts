import path from "node:path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

const envPath = path.resolve(process.cwd(), "src/.env");
dotenv.config({ path: envPath });
dotenv.config();

const geminiApiKey =
  process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();

if (!geminiApiKey) {
  throw new Error(
    "Missing Gemini API key. Add GEMINI_API_KEY=your_key to backend/src/.env"
  );
}

const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
});

export async function generateAiResponse(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
  });

  return response.text;
}
