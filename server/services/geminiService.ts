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
        You are a world-class technical instructor and course creator known for clear, engaging, and practical teaching.
        Create a detailed, structured lesson plan for a course on "${topic}".
        Target Audience Level: ${level}
        Number of Lessons: ${count}
        
        Return a JSON object with this structure:
        {
          "lessons": [
            {
              "title": "Engaging Lesson Title",
              "content": "Full markdown content string",
              "duration": 15
            }
          ]
        }
        
        CRITICAL CONTENT RULES:
        1. **Format**: The "content" field MUST be valid Markdown.
        2. **Structure**: Each lesson's content MUST follow this structure:
           - **Introduction**: Briefly explain what will be learned and why it matters.
           - **Core Concepts**: Explain the theory clearly using analogies where helpful.
           - **Practical Examples (MANDATORY)**: If the topic allows (especially for programming), you MUST provide code examples.
             - Use standard Markdown code blocks: \`\`\`language ... \`\`\`
             - Add comments to explain the code.
           - **Real-World Application**: How is this used in industry?
           - **Summary**: A quick recap of key takeaways.
        3. **Tone**: Professional, encouraging, and authoritative but accessible.
        4. **Length**: Each lesson should be substantial (approx. 400-600 words) to provide real value. Avoid superficial summaries.
        5. **Code**: For programming topics, code examples are NOT optional. They must be included and explained.
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
