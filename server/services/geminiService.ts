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
        // Helper to parse single-lesson JSON responses robustly
        const tryParse = (s: string) => {
            try {
                return JSON.parse(s);
            } catch {
                return null;
            }
        };

        const extractObject = (src: string) => {
            const first = src.indexOf('{');
            const last = src.lastIndexOf('}');
            if (first === -1 || last === -1 || last <= first) return null;
            return src.slice(first, last + 1);
        };

        const repairString = (src: string) => {
            let repaired = '';
            let inStr = false;
            for (let i = 0; i < src.length; i++) {
                const ch = src[i];
                if (ch === '"') {
                    let backslashes = 0;
                    let j = i - 1;
                    while (j >= 0 && src[j] === '\\') { backslashes++; j--; }
                    const escaped = backslashes % 2 === 1;
                    if (!escaped) inStr = !inStr;
                    repaired += ch;
                    continue;
                }

                if (inStr) {
                    if (ch === '\\') {
                        const next = src[i + 1];
                        const validEscapes = ['"', '\\', '/', 'b', 'f', 'n', 'r', 't'];
                        if (next && validEscapes.includes(next)) {
                            repaired += ch + next; i++; continue;
                        }
                        if (next === 'u') {
                            const hex = src.substr(i + 2, 4);
                            if (/^[0-9a-fA-F]{4}$/.test(hex)) { repaired += '\\u' + hex; i += 5; continue; }
                            repaired += '\\\\'; continue;
                        }
                        repaired += '\\\\'; continue;
                    }
                    if (ch === '\n' || ch === '\r') { repaired += '\\n'; continue; }
                }
                repaired += ch;
            }
            return repaired;
        };

        const lessons: GeneratedLesson[] = [];
        for (let idx = 1; idx <= count; idx++) {
            try {
                // Per-lesson prompt to reduce overall output size and improve parsing
                const perPrompt = `You are a concise technical instructor. Produce ONE lesson (only a single JSON object) for the course "${topic}" targeting ${level} learners. This is lesson ${idx} of ${count}. ${level.toLowerCase() === 'beginner' ? 'Use simple language and explain basics.' : level.toLowerCase() === 'advanced' ? 'Use advanced concepts and concise explanations.' : 'Use clear technical language.'} 

CRITICAL FORMATTING RULES:
- For code examples, ALWAYS use proper markdown code blocks with triple backticks and language identifier (e.g., \`\`\`python for Python code)
- Use inline backticks for short code references like function names or variables (e.g., \`variable_name\`, \`function()\`)
- Ensure all code blocks have proper opening \`\`\`language and closing \`\`\` fences
- Use escaped newlines (\\n) for line breaks in the JSON
- Escape quotes in content with \\\"

RETURN ONLY a single JSON OBJECT with keys: title (string), content (markdown string with proper code blocks), duration (minutes as integer). Do not include any surrounding text.`;

                const res = await model.generateContent(perPrompt);
                const response = await res.response;
                let text = (await response.text()).trim();
                if (text.startsWith('```')) text = text.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '');

                // Try direct parse
                let obj = tryParse(text);
                if (!obj) {
                    // Try extract object
                    const cand = extractObject(text);
                    if (cand) obj = tryParse(cand);
                }
                if (!obj) {
                    // Repair and try again
                    const cand = extractObject(text) || text;
                    const repaired = repairString(cand);
                    obj = tryParse(repaired);
                }

                if (!obj || !obj.title || !obj.content) {
                    console.error('Failed to parse lesson', idx, 'raw:', text.substring(0, 2000));
                    throw new Error(`Failed to parse lesson ${idx} from AI response`);
                }

                lessons.push({
                    title: String(obj.title).trim(),
                    content: String(obj.content),
                    duration: Number(obj.duration) || 15,
                });
            } catch (err) {
                console.error('Gemini parsing error for lesson', idx, err);
                throw new Error(`Failed to generate lesson ${idx}: ${err instanceof Error ? err.message : String(err)}`);
            }
        }

        return { lessons };
    }
}
