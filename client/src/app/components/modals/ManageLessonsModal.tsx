import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, Plus, FileText, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { addLesson, getCourseById, Lesson } from '../../api/courseApi';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string | null;
    courseTitle: string;
}

export default function ManageLessonsModal({ open, onOpenChange, courseId, courseTitle }: Props) {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // New Lesson Form
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [duration, setDuration] = useState(15);

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
            <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] fixed top-[55%]! left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-2xl border border-border shadow-2xl p-0 overflow-hidden z-[60]">
                <DialogHeader className="flex-none p-8 pb-3">
                    <DialogTitle>Manage Lessons: {courseTitle}</DialogTitle>
                    <DialogDescription>
                        Add and view lessons for this course.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 pt-0 flex flex-col md:flex-row gap-8 flex-1 overflow-hidden min-h-[400px]">
                    {/* Left: Lesson List */}
                    <div className="md:w-1/3 flex flex-col border rounded-md">
                        <div className="p-3 bg-muted font-medium text-sm flex justify-between items-center">
                            <span>Existing Lessons ({lessons.length})</span>
                        </div>
                        <ScrollArea className="flex-1 p-2">
                            {isLoading ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : lessons.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground text-sm">
                                    No lessons yet. Add one!
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {lessons.map((lesson) => (
                                        <div key={lesson.id} className="p-3 border rounded-md bg-card hover:bg-accent/50 transition-colors text-sm">
                                            <div className="flex items-start justify-between">
                                                <div className="font-medium">
                                                    <span className="text-muted-foreground mr-2">{lesson.order}.</span>
                                                    {lesson.title}
                                                </div>
                                                <Badge variant="outline" className="text-[10px] h-5">
                                                    {lesson.duration}m
                                                </Badge>
                                            </div>
                                            <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    <span className="truncate max-w-[100px]">{lesson.content.substring(0, 20)}...</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Right: Add Lesson Form */}
                    <div className="md:w-2/3 flex flex-col space-y-4">
                        <div className="font-semibold flex items-center gap-2 text-foreground">
                            <Plus className="h-4 w-4" /> Add New Lesson
                        </div>

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
                                <Label htmlFor="content">Content (Markdown)</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Enter lesson content here..."
                                    className="min-h-[150px] flex-1 font-mono text-sm bg-accent/5"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Use Markdown for formatting.</p>
                            </div>
                        </div>

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
                </div>
            </DialogContent>
        </Dialog>
    );
}
