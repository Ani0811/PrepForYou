import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, Plus, FileText, Trash2, BookOpen, Eye, Upload, Sparkles, Download, X } from 'lucide-react';
import { generateCourseContent, AddLessonPayload } from '../../api/courseApi';
import { toast } from 'sonner';
import { addLesson, getCourseById, Lesson } from '../../api/courseApi';
import ReactMarkdown from 'react-markdown';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string | null;
    courseTitle: string;
    courseDifficulty: string;
}

export default function ManageLessonsModal({ open, onOpenChange, courseId, courseTitle, courseDifficulty }: Props) {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    // New Lesson Form
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [duration, setDuration] = useState(15);
    const [showImport, setShowImport] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const jsonFileInputRef = useRef<HTMLInputElement | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [genTopic, setGenTopic] = useState('');
    const [genLevel, setGenLevel] = useState('beginner');
    const [genCount, setGenCount] = useState(5);

    useEffect(() => {
        if (open && courseId) {
            fetchLessons();
        }
    }, [open, courseId]);

    const fetchLessons = async () => {
        if (!courseId) return;
        setIsLoading(true);
        try {
            // We reuse getCourseById as it includes lessons now
            const courseData = await getCourseById(courseId);
            setLessons(courseData.lessons || []);
        } catch (error) {
            console.error('Error fetching lessons:', error);
            toast.error('Failed to load lessons');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJsonFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportError(null);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const contentStr = event.target?.result as string;
                const parsed = JSON.parse(contentStr);

                if (!Array.isArray(parsed)) throw new Error('File must contain a JSON array of lessons');
                if (!courseId) throw new Error('No course selected');

                const baseOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) : 0;

                for (let i = 0; i < parsed.length; i++) {
                    const item: any = parsed[i];
                    if (!item.title || !item.content) continue;
                    const payload: AddLessonPayload = {
                        title: item.title,
                        content: item.content,
                        duration: Number(item.duration) || 15,
                        order: baseOrder + i + 1
                    };
                    await addLesson(courseId, payload);
                }

                toast.success('Lessons imported');
                setShowImport(false);
                fetchLessons();
                if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
            } catch (err: any) {
                console.error('Import failed', err);
                setImportError(err.message || 'Failed to import JSON');
            }
        };

        reader.onerror = () => setImportError('Error reading file');
        reader.readAsText(file);
    };

    const handleGenerateContent = async () => {
        if (!genTopic || !courseId) return;
        setIsGenerating(true);
        setImportError(null);
        try {
            const result = await generateCourseContent({ topic: genTopic, level: genLevel, count: genCount });
            const baseOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) : 0;
            for (let i = 0; i < result.lessons.length; i++) {
                const l = result.lessons[i];
                const payload: AddLessonPayload = {
                    title: l.title,
                    content: l.content,
                    duration: Number(l.duration) || 15,
                    order: baseOrder + i + 1
                };
                await addLesson(courseId, payload);
            }

            toast.success('Generated lessons added');
            setShowGenerator(false);
            setGenTopic('');
            fetchLessons();
        } catch (err: any) {
            console.error('Generation failed', err);
            setImportError(err.message || 'Failed to generate content');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddLesson = async () => {
        if (!courseId || !title || !content) {
            toast.error('Title and content are required');
            return;
        }

        setIsAdding(true);
        try {
            const nextOrder = lessons.length > 0
                ? Math.max(...lessons.map(l => l.order)) + 1
                : 1;

            await addLesson(courseId, {
                title,
                content,
                duration,
                order: nextOrder
            });

            toast.success('Lesson added successfully');

            // Reset form
            setTitle('');
            setContent('');
            setDuration(15);

            // Refresh list
            fetchLessons();
        } catch (error) {
            console.error('Error adding lesson:', error);
            toast.error('Failed to add lesson');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-4xl w-full max-h-[90vh] fixed top-[55%]! left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-2xl border border-border shadow-2xl p-0 overflow-hidden z-60"
                style={{ backgroundColor: 'oklch(var(--background))' }}
            >
                <DialogHeader className="flex-none p-8 pb-3">
                    <DialogTitle>Manage Lessons: {courseTitle}</DialogTitle>
                    <DialogDescription>
                        Add and view lessons for this course.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 pt-0 flex flex-col md:flex-row gap-8 flex-1 overflow-hidden min-h-100">
                    {/* Left: Lesson List */}
                    <div className="md:w-1/3 flex flex-col border rounded-md">
                        <div className="p-3 bg-muted font-medium text-sm flex justify-between items-center">
                            <span>Existing Lessons ({lessons.length})</span>
                        </div>
                        <ScrollArea className="flex-1 h-100">
                            {isLoading ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : lessons.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground text-sm">
                                    No lessons yet. Add one!
                                </div>
                            ) : (
                                <div className="space-y-2 p-2">
                                    {lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className={`p-3 border rounded-md bg-card transition-colors text-sm cursor-pointer ${selectedLesson?.id === lesson.id
                                                ? 'bg-primary/10 border-primary/30'
                                                : 'hover:bg-accent/50'
                                                }`}
                                            onClick={() => setSelectedLesson(lesson)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="font-medium flex-1">
                                                    <span className="text-muted-foreground mr-2">{lesson.order}.</span>
                                                    {lesson.title}
                                                </div>
                                                <Badge variant="outline" className="text-[10px] h-5">
                                                    {lesson.duration}m
                                                </Badge>
                                            </div>
                                            <div className="mt-2 flex gap-2 text-xs text-muted-foreground items-center">
                                                <Eye className="h-3 w-3" />
                                                <span className="truncate">Click to preview</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Right: Preview or Add Lesson Form */}
                    <div className="md:w-2/3 flex flex-col space-y-4">
                        {selectedLesson ? (
                            /* Lesson Preview */
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="font-semibold flex items-center gap-2 text-foreground">
                                        <Eye className="h-4 w-4" /> Lesson Preview
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => { setShowImport(true); setShowGenerator(false); }}>
                                            <Upload className="h-4 w-4 mr-1" /> Import JSON
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => { setGenTopic(courseTitle); setGenLevel(courseDifficulty); setShowGenerator(true); setShowImport(false); }}>
                                            <Sparkles className="h-4 w-4 mr-1" /> AI Generate
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedLesson(null)}
                                        >
                                            <Plus className="h-4 w-4 mr-1" /> Add New
                                        </Button>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4 bg-accent/5 flex-1 overflow-hidden flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg">{selectedLesson.title}</h3>
                                            <div className="flex gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    Lesson {selectedLesson.order}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {selectedLesson.duration} minutes
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-2 mt-2">
                                        <div className="pr-4">
                                            <p className="text-sm font-medium text-muted-foreground mb-2">Content:</p>
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="text-sm font-medium text-muted-foreground">Preview</div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => { setShowImport(true); setShowGenerator(false); }}>
                                                        <Upload className="h-3 w-3 mr-1" /> Import JSON
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => { setShowGenerator(true); setShowImport(false); }}>
                                                        <Sparkles className="h-3 w-3 mr-1" /> AI Generate
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="text-sm prose prose-sm dark:prose-invert max-w-none bg-background/50 p-4 rounded-xl border border-border/50">
                                                <ReactMarkdown>{selectedLesson.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Add Lesson Form */
                            <div className="flex flex-col">
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold flex items-center gap-2 text-foreground">
                                        <Plus className="h-4 w-4" /> Add New Lesson
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => { setShowImport(true); setShowGenerator(false); }}>
                                            <Upload className="h-4 w-4 mr-1" /> Import JSON
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => { setGenTopic(courseTitle); setGenLevel(courseDifficulty); setShowGenerator(true); setShowImport(false); }}>
                                            <Sparkles className="h-4 w-4 mr-1" /> AI Generate
                                        </Button>
                                    </div>
                                </div>

                                {showImport ? (
                                    <div className="space-y-4 flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-accent/5">
                                        <div className="text-center space-y-2 max-w-sm">
                                            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                                <Upload className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="font-semibold text-lg">Upload JSON File</h3>
                                            <p className="text-sm text-muted-foreground">Select a .json file containing an array of lessons to import them automatically.</p>
                                        </div>

                                        {importError && (
                                            <div className="w-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs p-3 rounded border border-red-200 dark:border-red-800 text-center">
                                                {importError}
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-3 w-full max-w-xs">
                                            <input ref={jsonFileInputRef} type="file" accept=".json,application/json" onChange={handleJsonFileSelect} className="hidden" />
                                            <Button onClick={() => jsonFileInputRef.current?.click()} className="w-full">Choose File</Button>
                                            <Button variant="outline" onClick={() => { setShowImport(false); setImportError(null); }}>Cancel</Button>
                                        </div>
                                    </div>
                                ) : showGenerator ? (
                                    <div className="space-y-3 flex-1 flex flex-col p-4 border rounded-md bg-accent/5 overflow-y-auto max-h-100">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-500" /> AI Content Generator</h3>
                                            <Button variant="ghost" size="sm" className="h-6" onClick={() => setShowGenerator(false)}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Topic</Label>
                                                <Input placeholder="e.g. Python for Data Science" value={genTopic} onChange={(e) => setGenTopic(e.target.value)} className="h-8 text-xs" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Level</Label>
                                                    <select value={genLevel} onChange={(e) => setGenLevel(e.target.value)} className="h-8 text-xs w-full rounded border border-border bg-accent/5 px-2">
                                                        <option value="beginner">Beginner</option>
                                                        <option value="intermediate">Intermediate</option>
                                                        <option value="advanced">Advanced</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Lesson Count</Label>
                                                    <Input type="number" min={1} max={20} value={genCount} onChange={(e) => setGenCount(parseInt(e.target.value) || 5)} className="h-8 text-xs" />
                                                </div>
                                            </div>
                                        </div>

                                        {importError && (
                                            <div className="w-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs p-3 rounded border border-red-200 dark:border-red-800 text-center">
                                                {importError}
                                            </div>
                                        )}

                                        <div className="bg-purple-50 dark:bg-purple-900/10 p-2 rounded text-[10px] text-purple-800 dark:text-purple-300 border border-purple-100 dark:border-purple-900/20">
                                            <p>Generates a <strong>{genCount}</strong>-lesson course on <strong>{genTopic || '...'}</strong> ({genLevel}).</p>
                                            <p className="mt-1 opacity-70">Generated lessons will be added directly to this course.</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleGenerateContent} disabled={!genTopic || isGenerating}>
                                                {isGenerating ? (
                                                    <>
                                                        <Loader2 className="h-3 w-3 mr-2 animate-spin" /> Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="h-3 w-3 mr-2" /> Generate
                                                    </>
                                                )}
                                            </Button>
                                            <Button variant="outline" onClick={() => setShowGenerator(false)}>Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="title">Lesson Title</Label>
                                            <Input
                                                id="title"
                                                placeholder="e.g. Introduction to Variables"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="bg-accent/5"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="duration">Duration (minutes)</Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                min="1"
                                                value={duration}
                                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                                className="bg-accent/5"
                                            />
                                        </div>

                                        <div className="space-y-1.5 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="content">Content (Markdown)</Label>
                                                <div className="flex gap-2">
                                                    <input ref={jsonFileInputRef} type="file" accept=".json,application/json" onChange={handleJsonFileSelect} className="hidden" />
                                                    <Button variant="outline" size="sm" onClick={() => jsonFileInputRef.current?.click()}>
                                                        <Upload className="h-3 w-3 mr-1" /> Import JSON
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => { setGenTopic(courseTitle); setGenLevel(courseDifficulty); setShowGenerator(true); setShowImport(false); }}>
                                                        <Sparkles className="h-3 w-3 mr-1" /> AI Generate
                                                    </Button>
                                                </div>
                                            </div>

                                            <Textarea
                                                id="content"
                                                placeholder="Enter lesson content here..."
                                                className="min-h-37.5 flex-1 font-mono text-sm bg-accent/5"
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">Use Markdown for formatting.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-border/50">
                                    <Button
                                        onClick={handleAddLesson}
                                        disabled={isAdding || !title || !content}
                                        className="w-full gradient-bg-primary shadow-lg shadow-primary/20 h-10"
                                    >
                                        {isAdding ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="mr-2 h-4 w-4" /> Add Lesson
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
