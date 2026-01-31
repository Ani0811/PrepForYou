"use client";

import React, { ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    Trash2, Plus, FileText, ChevronRight, ChevronLeft,
    BookOpen, Upload, X, Sparkles, Download, Loader2, Eye, Edit3
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AddLessonPayload, generateCourseContent } from '../../api/courseApi';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editCourseForm: any;
    setEditCourseForm: (v: any) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    uploadProgress: number | null;
    localPreview: string | null;
    cancelUpload: () => void;
    // pauseUpload and resumeUpload kept in interface if parent passes them
    pauseUpload: () => void;
    resumeUpload: () => void;
    handleUpdateCourse: (lessons?: AddLessonPayload[]) => Promise<void>;
    isSaving: boolean;
}

export default function EditCourseModal({
    open, onOpenChange, editCourseForm, setEditCourseForm,
    fileInputRef, handleFileUpload, isUploading, uploadProgress,
    localPreview, cancelUpload, pauseUpload, resumeUpload,
    handleUpdateCourse, isSaving
}: Props) {
    const [step, setStep] = React.useState(1);
    const [lessons, setLessons] = React.useState<AddLessonPayload[]>([]);

    // New Lesson Form State
    const [newLessonTitle, setNewLessonTitle] = React.useState('');
    const [newLessonContent, setNewLessonContent] = React.useState('');
    const [newLessonDuration, setNewLessonDuration] = React.useState(15);

    // Bulk Import State
    const [showImport, setShowImport] = React.useState(false);
    const [importError, setImportError] = React.useState<string | null>(null);
    const jsonFileInputRef = React.useRef<HTMLInputElement | null>(null);

    // AI Generator State
    const [showGenerator, setShowGenerator] = React.useState(false);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [genTopic, setGenTopic] = React.useState('');
    const [genLevel, setGenLevel] = React.useState('beginner');
    const [genCount, setGenCount] = React.useState(5);

    // Editing State
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
    const [viewMode, setViewMode] = React.useState<'edit' | 'preview'>('edit');

    // Initialize lessons when editCourseForm changes or modal opens
    React.useEffect(() => {
        if (open) {
            if (editCourseForm && editCourseForm.lessons) {
                setLessons(editCourseForm.lessons.map((l: any, i: number) => ({
                    id: l.id,
                    title: l.title,
                    content: l.content,
                    duration: l.duration || 15,
                    order: l.order || (i + 1)
                })));
            }

            // Sync AI generation difficulty with course difficulty
            if (editCourseForm?.difficulty) {
                setGenLevel(editCourseForm.difficulty);
            }

            if (!editCourseForm?.lessons) {
                setStep(1);
            }
        }
    }, [open, editCourseForm]);

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleEditLesson = (lesson: AddLessonPayload, index: number) => {
        setEditingIndex(index);
        setNewLessonTitle(lesson.title);
        setNewLessonContent(lesson.content);
        setNewLessonDuration(lesson.duration || 15);
        setViewMode('edit');
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setNewLessonTitle('');
        setNewLessonContent('');
        setNewLessonDuration(15);
    };

    const addOrUpdateLesson = () => {
        if (!newLessonTitle || !newLessonContent) return;

        const lessonData: AddLessonPayload = {
            title: newLessonTitle,
            content: newLessonContent,
            duration: newLessonDuration,
            order: editingIndex !== null ? lessons[editingIndex].order : lessons.length + 1
        };

        if (editingIndex !== null) {
            const updated = [...lessons];
            updated[editingIndex] = lessonData;
            setLessons(updated);
            setEditingIndex(null);
        } else {
            setLessons([...lessons, lessonData]);
        }

        // Reset form
        setNewLessonTitle('');
        setNewLessonContent('');
        setNewLessonDuration(15);
    };

    const removeLesson = (index: number) => {
        const updated = lessons.filter((_, i) => i !== index).map((l, i) => ({ ...l, order: i + 1 }));
        setLessons(updated);
        if (editingIndex === index) cancelEdit();
    };

    const handleJsonFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportError(null);
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const parsed = JSON.parse(content);

                if (!Array.isArray(parsed)) {
                    throw new Error('File must contain a JSON array');
                }

                const newLessons: AddLessonPayload[] = [];
                parsed.forEach((item: any) => {
                    if (!item.title || !item.content) return;
                    newLessons.push({
                        title: item.title,
                        content: item.content,
                        duration: Number(item.duration) || 15,
                        order: lessons.length + newLessons.length + 1
                    });
                });

                if (newLessons.length === 0) {
                    throw new Error('No valid lessons found in file');
                }

                setLessons([...lessons, ...newLessons]);
                setShowImport(false);
                if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';

            } catch (err: any) {
                setImportError(err.message || 'Failed to parse JSON file');
            }
        };
        reader.readAsText(file);
    };

    const handleGenerateContent = async () => {
        if (!genTopic) return;
        setIsGenerating(true);
        setImportError(null);

        try {
            const result = await generateCourseContent({
                topic: genTopic,
                level: genLevel,
                count: genCount
            });

            const newLessons: AddLessonPayload[] = result.lessons.map((l: any, i: number) => ({
                ...l,
                order: lessons.length + i + 1
            }));

            setLessons([...lessons, ...newLessons]);
            setShowGenerator(false);
            setGenTopic('');
        } catch (err: any) {
            console.error("Generation failed", err);
            setImportError(err.message || "Failed to generate content");
        } finally {
            setIsGenerating(false);
        }
    };

    const onUpdate = async () => {
        await handleUpdateCourse(lessons);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-4xl! w-full max-h-[90vh] fixed top-[55%]! flex flex-col rounded-2xl border border-border shadow-2xl p-0 overflow-hidden z-[60]"
                style={{ backgroundColor: 'oklch(var(--background))' }}
            >
                <DialogHeader className="flex-none p-8 pb-2">
                    <DialogTitle className="text-2xl font-display font-bold gradient-text">
                        {step === 1 ? 'Edit Course' : 'Manage Lessons'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-1">
                        {step === 1
                            ? 'Update the details of your course below.'
                            : `Review and edit lessons for "${editCourseForm.title}".`}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 flex-1 overflow-y-auto">
                    {step === 1 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                            {/* Left Column: Core Info */}
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-foreground">Title <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="e.g. Advanced Web Development"
                                        value={editCourseForm.title}
                                        className="bg-accent/5 focus:bg-accent/10 transition-colors border-border"
                                        onChange={(e) => setEditCourseForm({ ...editCourseForm, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 text-foreground!">
                                    <Label className="text-sm font-medium text-foreground">Description <span className="text-red-500">*</span></Label>
                                    <textarea
                                        className="flex min-h-[140px] w-full rounded-md border border-input bg-accent/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus:bg-accent/10 text-foreground"
                                        placeholder="What will students learn in this course?"
                                        value={editCourseForm.description}
                                        onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Right Column: Settings & Media */}
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium text-foreground">Category <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={editCourseForm.category}
                                            onValueChange={(value) => setEditCourseForm({ ...editCourseForm, category: value })}
                                        >
                                            <SelectTrigger className="bg-accent/5 border-border">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent
                                                className="border-border z-[100]! opacity-100! shadow-2xl"
                                                style={{ backgroundColor: 'oklch(var(--background))', color: 'oklch(var(--foreground))' }}
                                            >
                                                <SelectItem value="Programming">Programming</SelectItem>
                                                <SelectItem value="Design">Design</SelectItem>
                                                <SelectItem value="Business">Business</SelectItem>
                                                <SelectItem value="Marketing">Marketing</SelectItem>
                                                <SelectItem value="Data Science">Data Science</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium text-foreground">Difficulty</Label>
                                        <Select
                                            value={editCourseForm.difficulty}
                                            onValueChange={(value) => setEditCourseForm({ ...editCourseForm, difficulty: value })}
                                        >
                                            <SelectTrigger className="bg-accent/5 border-border">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent
                                                className="border-border z-[100]! opacity-100! shadow-2xl"
                                                style={{ backgroundColor: 'oklch(var(--background))', color: 'oklch(var(--foreground))' }}
                                            >
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-foreground">Duration (minutes)</Label>
                                    <Input
                                        type="number"
                                        placeholder="120"
                                        min="0"
                                        className="bg-accent/5 transition-colors focus:bg-accent/10 border-border"
                                        value={editCourseForm.duration || ''}
                                        onChange={(e) => setEditCourseForm({ ...editCourseForm, duration: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-foreground">Course Thumbnail</Label>
                                    <Input
                                        placeholder="Paste image URL here..."
                                        value={editCourseForm.imageUrl || ''}
                                        className="bg-accent/5 mb-2 transition-colors focus:bg-accent/10 border-border text-xs"
                                        onChange={(e) => setEditCourseForm({ ...editCourseForm, imageUrl: e.target.value })}
                                    />

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-5 bg-accent/5 cursor-pointer hover:bg-accent/10 hover:border-primary/50 transition-all overflow-hidden"
                                    >
                                        {(localPreview || editCourseForm.imageUrl) ? (
                                            <>
                                                <img
                                                    src={localPreview || editCourseForm.imageUrl}
                                                    alt="Course preview"
                                                    className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-10 transition-opacity"
                                                />
                                                <div className="relative z-10 text-center">
                                                    <div className="font-medium text-sm">Update Image</div>
                                                    <div className="text-[10px] opacity-60">Click or drag to replace</div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center">
                                                <div className="font-medium text-sm">Upload Thumbnail</div>
                                                <div className="text-[10px] opacity-60">PNG, JPG, WEBP</div>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            id="edit-course-image-file"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                    </div>

                                    {isUploading && (
                                        <div className="mt-3 space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-medium text-primary">
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    <span>Uploading... {uploadProgress || 0}%</span>
                                                </div>
                                                <button
                                                    onClick={cancelUpload}
                                                    className="text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider font-bold text-[9px]"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            <div className="h-1.5 w-full bg-accent/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-300 ease-out"
                                                    style={{ width: `${uploadProgress || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-8 h-full overflow-hidden min-h-[500px]">
                            {/* Left: Lessons List */}
                            <div className="md:w-1/3 flex flex-col border rounded-md">
                                <div className="p-3 bg-muted font-medium text-sm flex justify-between items-center">
                                    <span>Curriculum ({lessons.length} Lessons)</span>
                                </div>
                                <ScrollArea className="flex-1 p-2 h-[450px]">
                                    {lessons.length === 0 ? (
                                        <div className="text-center p-8 text-muted-foreground text-sm flex flex-col items-center">
                                            <BookOpen className="h-8 w-8 mb-2 opacity-50" />
                                            No lessons yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {lessons.map((lesson, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleEditLesson(lesson, idx)}
                                                    className={`p-3 border rounded-md transition-colors text-sm group relative cursor-pointer
                                                        ${editingIndex === idx ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-accent/50'}
                                                    `}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="font-medium text-foreground">
                                                            <span className="text-muted-foreground mr-2">{lesson.order}.</span>
                                                            {lesson.title}
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeLesson(idx);
                                                        }}>
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                                                        <Badge variant="outline" className="text-[10px] h-auto py-0">{lesson.duration}m</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>

                            {/* Right: Add/Edit Lesson or Tools */}
                            <div className="md:w-2/3 flex flex-col space-y-4">
                                <div className="font-semibold flex items-center justify-between text-foreground">
                                    <div className="flex items-center gap-2 text-sm">
                                        {showImport ? <Upload className="h-4 w-4" /> : editingIndex !== null ? <FileText className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4" />}
                                        {showImport ? 'Import Lessons' : editingIndex !== null ? 'Edit Lesson' : 'Add Lesson'}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-[10px] font-normal"
                                            onClick={() => {
                                                setShowImport(!showImport);
                                                setImportError(null);
                                                setEditingIndex(null);
                                            }}
                                        >
                                            {showImport ? <X className="h-3 w-3 mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                                            {showImport ? 'Cancel' : 'Import'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-[10px] font-normal text-purple-600"
                                            onClick={() => setShowGenerator(true)}
                                        >
                                            <Sparkles className="h-3 w-3 mr-1" /> AI Generate
                                        </Button>
                                    </div>
                                </div>

                                {showImport ? (
                                    <div className="space-y-4 flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-accent/5">
                                        <Upload className="h-6 w-6 text-primary mb-2" />
                                        <h3 className="font-semibold text-sm">Upload JSON</h3>
                                        {importError && <div className="text-red-500 text-[10px]">{importError}</div>}
                                        <input ref={jsonFileInputRef} type="file" accept=".json" onChange={handleJsonFileSelect} className="hidden" />
                                        <Button size="sm" onClick={() => jsonFileInputRef.current?.click()}>Choose File</Button>
                                    </div>
                                ) : showGenerator ? (
                                    <div className="space-y-3 flex-1 flex flex-col p-4 border rounded-md bg-accent/5 overflow-y-auto">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-xs flex items-center gap-2">
                                                <Sparkles className="h-3 w-3 text-purple-500" /> AI Generator
                                            </h3>
                                            <Button variant="ghost" size="sm" className="h-6" onClick={() => setShowGenerator(false)}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px]">Topic</Label>
                                            <Input placeholder="e.g. Hooks" value={genTopic} onChange={(e) => setGenTopic(e.target.value)} className="h-8 text-xs" />

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-[10px]">Level</Label>
                                                    <Select value={genLevel} onValueChange={setGenLevel}>
                                                        <SelectTrigger className="h-8 text-xs bg-background">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent style={{ backgroundColor: 'oklch(var(--background))' }}>
                                                            <SelectItem value="beginner">Beginner</SelectItem>
                                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                                            <SelectItem value="advanced">Advanced</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label className="text-[10px]">Count</Label>
                                                    <Input type="number" min={1} value={genCount} onChange={(e) => setGenCount(parseInt(e.target.value) || 5)} className="h-8 text-xs" />
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4 h-8 text-xs"
                                            onClick={handleGenerateContent}
                                            disabled={!genTopic || isGenerating}
                                        >
                                            {isGenerating ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Download className="h-3 w-3 mr-2" />}
                                            {isGenerating ? 'Generating...' : 'Generate Lessons'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 flex-1 overflow-y-auto">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Lesson Title <span className="text-red-500">*</span></Label>
                                            <Input
                                                placeholder="e.g. Introduction"
                                                value={newLessonTitle}
                                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                                className="bg-accent/5 h-8 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Duration (mins)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={newLessonDuration}
                                                onChange={(e) => setNewLessonDuration(parseInt(e.target.value) || 0)}
                                                className="bg-accent/5 h-8 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs">Content (Markdown) <span className="text-red-500">*</span></Label>
                                                <div className="flex gap-2 bg-muted/50 p-0.5 rounded-lg border">
                                                    <Button
                                                        variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
                                                        size="sm"
                                                        className="h-6 px-2 text-[10px]"
                                                        onClick={() => setViewMode('edit')}
                                                    >
                                                        <Edit3 className="h-3 w-3 mr-1" /> Edit
                                                    </Button>
                                                    <Button
                                                        variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                                                        size="sm"
                                                        className="h-6 px-2 text-[10px]"
                                                        onClick={() => setViewMode('preview')}
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" /> Preview
                                                    </Button>
                                                </div>
                                            </div>

                                            {viewMode === 'edit' ? (
                                                <div className="flex flex-col gap-1 flex-1">
                                                    <div className="flex gap-1 bg-muted/20 p-1 rounded-t-md border-x border-t">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 hover:bg-muted"
                                                            title="Bold"
                                                            onClick={() => {
                                                                const textarea = document.getElementById('lesson-content-textarea') as HTMLTextAreaElement;
                                                                if (!textarea) return;
                                                                const start = textarea.selectionStart;
                                                                const end = textarea.selectionEnd;
                                                                const text = textarea.value;
                                                                const before = text.substring(0, start);
                                                                const selection = text.substring(start, end);
                                                                const after = text.substring(end);
                                                                const newText = before + `**${selection}**` + after;
                                                                setNewLessonContent(newText);
                                                                setTimeout(() => {
                                                                    textarea.focus();
                                                                    textarea.setSelectionRange(start + 2, end + 2);
                                                                }, 0);
                                                            }}
                                                        >
                                                            <span className="font-bold text-xs">B</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 hover:bg-muted"
                                                            title="Italic"
                                                            onClick={() => {
                                                                const textarea = document.getElementById('lesson-content-textarea') as HTMLTextAreaElement;
                                                                if (!textarea) return;
                                                                const start = textarea.selectionStart;
                                                                const end = textarea.selectionEnd;
                                                                const text = textarea.value;
                                                                const before = text.substring(0, start);
                                                                const selection = text.substring(start, end);
                                                                const after = text.substring(end);
                                                                const newText = before + `_${selection}_` + after;
                                                                setNewLessonContent(newText);
                                                                setTimeout(() => {
                                                                    textarea.focus();
                                                                    textarea.setSelectionRange(start + 1, end + 1);
                                                                }, 0);
                                                            }}
                                                        >
                                                            <span className="italic text-xs font-serif">I</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 hover:bg-muted"
                                                            title="Underline"
                                                            onClick={() => {
                                                                const textarea = document.getElementById('lesson-content-textarea') as HTMLTextAreaElement;
                                                                if (!textarea) return;
                                                                const start = textarea.selectionStart;
                                                                const end = textarea.selectionEnd;
                                                                const text = textarea.value;
                                                                const before = text.substring(0, start);
                                                                const selection = text.substring(start, end);
                                                                const after = text.substring(end);
                                                                const newText = before + `<u>${selection}</u>` + after;
                                                                setNewLessonContent(newText);
                                                                setTimeout(() => {
                                                                    textarea.focus();
                                                                    textarea.setSelectionRange(start + 3, end + 3);
                                                                }, 0);
                                                            }}
                                                        >
                                                            <span className="underline text-xs">U</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 hover:bg-muted"
                                                            title="Code"
                                                            onClick={() => {
                                                                const textarea = document.getElementById('lesson-content-textarea') as HTMLTextAreaElement;
                                                                if (!textarea) return;
                                                                const start = textarea.selectionStart;
                                                                const end = textarea.selectionEnd;
                                                                const text = textarea.value;
                                                                const before = text.substring(0, start);
                                                                const selection = text.substring(start, end);
                                                                const after = text.substring(end);
                                                                const newText = before + `\`${selection}\`` + after;
                                                                setNewLessonContent(newText);
                                                                setTimeout(() => {
                                                                    textarea.focus();
                                                                    textarea.setSelectionRange(start + 1, end + 1);
                                                                }, 0);
                                                            }}
                                                        >
                                                            <span className="font-mono text-xs">{'<>'}</span>
                                                        </Button>
                                                    </div>
                                                    <Textarea
                                                        id="lesson-content-textarea"
                                                        placeholder="Enter content..."
                                                        className="flex-1 min-h-[120px] bg-accent/5 font-mono text-xs rounded-t-none"
                                                        value={newLessonContent}
                                                        onChange={(e) => setNewLessonContent(e.target.value)}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex-1 min-h-[120px] bg-accent/5 rounded-md border p-3 overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
                                                    {newLessonContent ? (
                                                        <ReactMarkdown>
                                                            {newLessonContent}
                                                        </ReactMarkdown>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">No content to preview</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {editingIndex !== null && (
                                                <Button variant="outline" onClick={cancelEdit} className="flex-1 h-8 text-xs">
                                                    Cancel
                                                </Button>
                                            )}
                                            <Button onClick={addOrUpdateLesson} disabled={!newLessonTitle || !newLessonContent} className={`flex-1 h-8 text-xs ${editingIndex !== null ? 'gradient-bg-primary' : ''}`}>
                                                {editingIndex !== null ? 'Update Lesson' : 'Add Lesson'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-none p-8 pt-4 border-t border-border bg-background/50 flex justify-between">
                    <div className="flex gap-2">
                        {step === 2 && (
                            <Button variant="outline" onClick={handleBack} disabled={isSaving}>
                                <ChevronLeft className="h-4 w-4 mr-1" /> Back
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        {step === 1 ? (
                            <Button onClick={handleNext} disabled={!editCourseForm.title || !editCourseForm.description || !editCourseForm.category}>
                                Next: Manage Lessons <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                onClick={onUpdate}
                                disabled={isSaving}
                                className="gradient-bg-primary shadow-lg shadow-primary/20"
                            >
                                {isSaving ? 'Saving...' : 'Save All Changes'}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
