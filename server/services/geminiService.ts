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
                maxOutputTokens: 8192,
            }
        });
        return this.model;
    }

    static async generateLessonPlan(topic: string, level: string, count: number): Promise<{ lessons: GeneratedLesson[] }> {
        const model = this.getModel();

        // Determine level-specific guidance
        const levelGuidance = 
            level.toLowerCase() === 'beginner' 
                ? 'Use simple language, explain basics thoroughly, and avoid jargon. Include plenty of examples.'
                : level.toLowerCase() === 'advanced'
                ? 'Use advanced concepts, technical terminology, and concise explanations. Focus on depth and best practices.'
                : 'Use clear technical language appropriate for intermediate learners. Balance theory with practical examples.';

        // Single prompt requesting ALL lessons at once
        const prompt = `You are an expert technical instructor creating a complete course on "${topic}" for ${level} learners.

Generate exactly ${count} lessons that progressively build knowledge from foundational concepts to advanced topics.

${levelGuidance}

CRITICAL FORMATTING RULES:
- For code examples, ALWAYS use proper markdown code blocks with triple backticks and language identifier (e.g., \`\`\`python for Python code)
- Use inline backticks for short code references like function names or variables (e.g., \`variable_name\`, \`function()\`)
- Ensure all code blocks have proper opening \`\`\`language and closing \`\`\` fences
- Use escaped newlines (\\n) for line breaks in JSON strings
- Properly escape all quotes in content with \\"

REQUIRED OUTPUT FORMAT:
Return ONLY valid JSON matching this exact schema (no markdown code fences, no extra text):

{
  "lessons": [
    {
      "title": "Lesson Title",
      "content": "Detailed markdown content with proper code blocks",
      "duration": 15
    }
  ]
}

Each lesson should:
- Have a clear, descriptive title
- Include comprehensive markdown content (600-1200 words)
- Specify duration in minutes (typically 10-30 minutes)
- Build upon previous lessons logically

Generate exactly ${count} lessons now.`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = (await response.text()).trim();

            // Remove markdown code fences if present
            if (text.startsWith('```')) {
                text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/s, '').trim();
            }

            // Parse JSON response
            const parsed = JSON.parse(text);

            // Validate response structure
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Response is not a valid object');
            }

            if (!Array.isArray(parsed.lessons)) {
                throw new Error('Response does not contain a "lessons" array');
            }

            if (parsed.lessons.length !== count) {
                throw new Error(`Expected ${count} lessons, received ${parsed.lessons.length}`);
            }

            // Validate and transform lessons
            const lessons: GeneratedLesson[] = parsed.lessons.map((lesson: any, idx: number) => {
                if (!lesson || typeof lesson !== 'object') {
                    throw new Error(`Lesson ${idx + 1} is not a valid object`);
                }

                if (!lesson.title || typeof lesson.title !== 'string') {
                    throw new Error(`Lesson ${idx + 1} missing valid "title"`);
                }

                if (!lesson.content || typeof lesson.content !== 'string') {
                    throw new Error(`Lesson ${idx + 1} missing valid "content"`);
                }

                const duration = typeof lesson.duration === 'number' ? lesson.duration : parseInt(lesson.duration, 10);
                if (isNaN(duration) || duration <= 0) {
                    throw new Error(`Lesson ${idx + 1} has invalid "duration"`);
                }

                return {
                    title: lesson.title.trim(),
                    content: lesson.content,
                    duration: duration,
                };
            });

            return { lessons };

        } catch (err) {
            if (err instanceof SyntaxError) {
                throw new Error(`Failed to parse Gemini JSON response: ${err.message}`);
            }
            throw new Error(`Failed to generate lesson plan: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
}
