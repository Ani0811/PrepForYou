import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export interface GeneratedLesson {
    title: string;
    content: string;
    duration: number;
}

export class GeminiService {
    private static model: GenerativeModel | null = null;

    private static getModel(): GenerativeModel {
        if (this.model) return this.model;

        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            throw new Error("GEMINI_API_KEY is not set in environment variables");
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        this.model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        return this.model;
    }

    static async generateLessonPlan(topic: string, level: string, count: number): Promise<{ lessons: GeneratedLesson[] }> {
        try {
            const model = this.getModel();

            const prompt = `
        You are an expert course creator. Create a structured lesson plan for a course on "${topic}".
        Target Audience Level: ${level}
        Number of Lessons: ${count}
        
        Return a JSON object with this structure:
        {
          "lessons": [
            {
              "title": "Lesson Title",
              "content": "Detailed educational content in Markdown format, clearly explaining the concept.",
              "duration": 15
            }
          ]
        }
        
        Rules:
        1. "content" must be detailed (at least 2-3 paragraphs) and formatted in Markdown.
        2. "duration" should be an estimated integer in minutes.
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const data = JSON.parse(text);

            if (!data.lessons || !Array.isArray(data.lessons)) {
                throw new Error("Invalid response format from AI: 'lessons' array missing");
            }

            return data;
        } catch (error: any) {
            console.error("Gemini AI Generation Error:", error);
            throw new Error(`Failed to generate content: ${error.message}`);
        }
    }
}
