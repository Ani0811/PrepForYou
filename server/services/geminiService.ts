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
                maxOutputTokens: 65536,
                temperature: 0.7,
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
- Include well-structured markdown content (400-800 words)
- Specify duration in minutes (typically 10-25 minutes)
- Build upon previous lessons logically
- Keep JSON strings properly formatted and escaped

IMPORTANT: Keep content concise but informative. Ensure the entire JSON response is complete and valid.

Generate exactly ${count} lessons now.`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = (await response.text()).trim();

            // Log response length for debugging
            console.log(`[GeminiService] Received response of ${text.length} characters, ${count} lessons requested`);

            // Remove markdown code fences if present
            if (text.startsWith('```')) {
                text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/s, '').trim();
            }

            // Parse JSON response with fallbacks for minor formatting issues
            function tryParseJSON(input: string): any | null {
                try {
                    return JSON.parse(input);
                } catch (e) {
                    console.log('[GeminiService] Direct JSON parse failed, attempting repairs...');
                    // attempt to extract the first JSON object in the text
                    const first = input.indexOf('{');
                    const last = input.lastIndexOf('}');
                    if (first !== -1 && last !== -1 && last > first) {
                        let candidate = input.slice(first, last + 1);
                        // remove trailing commas before closing braces/brackets
                        candidate = candidate.replace(/,\s*([}\]])/g, '$1');
                        // replace smart quotes with straight quotes
                        candidate = candidate.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
                        try {
                            return JSON.parse(candidate);
                        } catch (e2) {
                            console.log('[GeminiService] Repaired JSON parse also failed, attempting lesson recovery...');
                        }

                        // Try 3: Extract complete lesson objects individually
                        try {
                            const lessonsStart = candidate.indexOf('"lessons"');
                            if (lessonsStart !== -1) {
                                const arrayStart = candidate.indexOf('[', lessonsStart);
                                if (arrayStart !== -1) {
                                    const lessons = [];
                                    let depth = 0;
                                    let currentLesson = '';
                                    let inString = false;
                                    let escape = false;
                                    let captureStarted = false;

                                    for (let i = arrayStart + 1; i < candidate.length; i++) {
                                        const char = candidate[i];

                                        if (escape) {
                                            if (captureStarted) currentLesson += char;
                                            escape = false;
                                            continue;
                                        }
                                        if (char === '\\') {
                                            if (captureStarted) currentLesson += char;
                                            escape = true;
                                            continue;
                                        }
                                        if (char === '"') {
                                            if (captureStarted) currentLesson += char;
                                            inString = !inString;
                                            continue;
                                        }
                                        if (inString) {
                                            if (captureStarted) currentLesson += char;
                                            continue;
                                        }

                                        if (char === '{') {
                                            depth++;
                                            captureStarted = true;
                                            currentLesson += char;
                                        } else if (char === '}') {
                                            currentLesson += char;
                                            depth--;
                                            if (depth === 0 && captureStarted) {
                                                try {
                                                    const lesson = JSON.parse(currentLesson.trim());
                                                    if (lesson.title && lesson.content) {
                                                        lessons.push(lesson);
                                                    }
                                                } catch {}
                                                currentLesson = '';
                                                captureStarted = false;
                                            }
                                        } else if (captureStarted) {
                                            currentLesson += char;
                                        }
                                    }

                                    if (lessons.length > 0) {
                                        console.log(`[GeminiService] Recovered ${lessons.length} complete lessons from malformed JSON`);
                                        return { lessons };
                                    }
                                }
                            }
                        } catch (e3) {
                            console.log('[GeminiService] Lesson recovery also failed');
                        }
                    }
                    return null;
                }
            }

            const parsed = tryParseJSON(text);
            if (!parsed) {
                console.error('[GeminiService] Failed to parse response. Length:', text.length);
                console.error('[GeminiService] First 2000 chars:', text.slice(0, 2000));
                console.error('[GeminiService] Last 500 chars:', text.slice(-500));
                throw new SyntaxError(`Could not parse JSON response from Gemini. Response length: ${text.length} chars. See server logs for details.`);
            }

            // Validate response structure
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Response is not a valid object');
            }

            if (!Array.isArray(parsed.lessons)) {
                throw new Error('Response does not contain a "lessons" array');
            }

            if (parsed.lessons.length === 0) {
                throw new Error('No valid lessons found in response');
            }

            if (parsed.lessons.length < count) {
                console.warn(`[GeminiService] Expected ${count} lessons, but recovered ${parsed.lessons.length}. Proceeding with partial result.`);
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
