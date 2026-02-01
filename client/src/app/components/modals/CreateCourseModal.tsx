"use client";

import React, { ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trash2, FileText, ChevronRight, ChevronLeft, BookOpen, Upload, X, Sparkles, Download, Loader2 } from 'lucide-react';
import { AddLessonPayload } from '../../api/courseApi';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseForm: any;
  setCourseForm: (v: any) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  handleFileSelected: (f: File) => void;
  isUploading: boolean;
  uploadProgress: number | null;
  localPreview: string | null;
  cancelUpload: () => void;
  pauseUpload: () => void;
  resumeUpload: () => void;
  handleCreateCourse: (lessons: AddLessonPayload[]) => Promise<void>;
  isSaving: boolean;
}

export default function CreateCourseModal({ open, onOpenChange, courseForm, setCourseForm, fileInputRef, handleFileUpload, handleFileSelected, isUploading, uploadProgress, localPreview, cancelUpload, pauseUpload, resumeUpload, handleCreateCourse, isSaving }: Props) {
  const [step, setStep] = React.useState(1);
  const [lessons, setLessons] = React.useState<AddLessonPayload[]>([]);

  // New Lesson Form State
  const [newLessonTitle, setNewLessonTitle] = React.useState('');
  const [newLessonContent, setNewLessonContent] = React.useState('');
  const [newLessonDuration, setNewLessonDuration] = React.useState(15);

  // Import / AI Generator State
  const [showImport, setShowImport] = React.useState(false);
  const [showGenerator, setShowGenerator] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);
  const jsonFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [genTopic, setGenTopic] = React.useState('');
  const [genLevel, setGenLevel] = React.useState('beginner');
  const [genCount, setGenCount] = React.useState(5);

  // Editing State
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleEditLesson = (lesson: AddLessonPayload, index: number) => {
    setEditingIndex(index);
    setNewLessonTitle(lesson.title);
    setNewLessonContent(lesson.content);
    setNewLessonDuration(lesson.duration || 15);
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
      // Update existing
      const updated = [...lessons];
      updated[editingIndex] = lessonData;
      setLessons(updated);
      setEditingIndex(null); // Exit edit mode
    } else {
      // Add new
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

  const handleJsonFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const contentStr = event.target?.result as string;
        const parsed = JSON.parse(contentStr);

        if (!Array.isArray(parsed)) throw new Error('File must contain a JSON array of lessons');

        const baseOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) : 0;
        const imported: AddLessonPayload[] = [];

        for (let i = 0; i < parsed.length; i++) {
          const item: any = parsed[i];
          if (!item.title || !item.content) continue;
          imported.push({
            title: item.title,
            content: item.content,
            duration: Number(item.duration) || 15,
            order: baseOrder + i + 1
          });
        }

        setLessons([...lessons, ...imported]);
        setShowImport(false);
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
    if (!genTopic) return;
    setIsGenerating(true);
    setImportError(null);
    try {
      const { generateCourseContent } = await import('../../api/courseApi');
      const result = await generateCourseContent({ topic: genTopic, level: genLevel, count: genCount });
      
      const baseOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) : 0;
      const generated: AddLessonPayload[] = result.lessons.map((l: any, i: number) => ({
        title: l.title,
        content: l.content,
        duration: Number(l.duration) || 15,
        order: baseOrder + i + 1
      }));

      setLessons([...lessons, ...generated]);
      setShowGenerator(false);
      setGenTopic('');
    } catch (err: any) {
      console.error('Generation failed', err);
      setImportError(err.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };


  const onCreate = async () => {
    await handleCreateCourse(lessons);
  };

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setStep(1);
      setLessons([]);
      setNewLessonTitle('');
      setNewLessonContent('');
      setEditingIndex(null);
      setShowImport(false);
      setShowGenerator(false);
      setImportError(null);
      setGenTopic('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl w-full max-h-[90vh] fixed top-[55%]! left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-2xl border border-border shadow-2xl p-0 overflow-hidden z-60"
        style={{ backgroundColor: 'oklch(var(--background))' }}
      >
        <DialogHeader className="flex-none p-8 pb-2">
          <DialogTitle className="text-xl font-display font-bold gradient-text">Create New Course</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Fill in the details below to launch your new course.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 flex-1 overflow-y-auto flex flex-col">
          {step === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
              {/* Left Column: Core Info */}
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Title <span className="text-red-500">*</span></label>
                  <Input
                    placeholder="e.g. Advanced Web Development"
                    value={courseForm.title}
                    className="bg-accent/5 focus:bg-accent/10 transition-colors border-border"
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5 text-foreground!">
                  <label className="text-sm font-medium text-foreground">Description <span className="text-red-500">*</span></label>
                  <textarea
                    className="flex min-h-25 w-full rounded-md border border-input bg-accent/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus:bg-accent/10 text-foreground"
                    placeholder="What will students learn in this course?"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Right Column: Settings & Media */}
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 relative z-10">
                    <label className="text-sm font-medium text-foreground">Category <span className="text-red-500">*</span></label>
                    <Select
                      value={courseForm.category}
                      onValueChange={(value) => setCourseForm({ ...courseForm, category: value })}
                    >
                      <SelectTrigger className="bg-accent/5 border-border">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent
                        className="border-border z-100! opacity-100! shadow-2xl"
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

                  <div className="space-y-1.5 relative z-10">
                    <label className="text-sm font-medium text-foreground">Difficulty</label>
                    <Select
                      value={courseForm.difficulty}
                      onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                        setCourseForm({ ...courseForm, difficulty: value })
                      }
                    >
                      <SelectTrigger className="bg-accent/5 border-border">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent
                        className="border-border z-100! opacity-100! shadow-2xl"
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
                  <label className="text-sm font-medium text-foreground">Duration (minutes)</label>
                  <Input
                    type="number"
                    placeholder="120"
                    min="0"
                    className="bg-accent/5 transition-colors focus:bg-accent/10 border-border"
                    value={courseForm.duration || ''}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Course Thumbnail</label>

                  <Input
                    placeholder="Paste image URL here..."
                    value={courseForm.imageUrl}
                    className="bg-accent/5 mb-2 transition-colors focus:bg-accent/10 border-border text-xs"
                    onChange={(e) => setCourseForm({ ...courseForm, imageUrl: e.target.value })}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-5 bg-accent/5 cursor-pointer hover:bg-accent/10 hover:border-primary/50 transition-all overflow-hidden"
                  >
                    {(localPreview || courseForm.imageUrl) ? (
                      <>
                        <img
                          src={localPreview || courseForm.imageUrl}
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
                      id="course-image-file"
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
            <div className="flex flex-col md:flex-row gap-8 h-full overflow-hidden">
              {/* Left: Lessons List */}
              <div className="md:w-1/3 flex flex-col border rounded-md">
                <div className="p-3 bg-muted font-medium text-sm flex justify-between items-center">
                  <span>Curriculum ({lessons.length} Lessons)</span>
                </div>
                <ScrollArea className="flex-1 p-2 h-112.5">
                  {lessons.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground text-sm flex flex-col items-center">
                      <BookOpen className="h-8 w-8 mb-2 opacity-50" />
                      No lessons added yet.
                      <p className="text-xs mt-1">Add at least one lesson to publish.</p>
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
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span className="truncate max-w-37.5">{lesson.content.substring(0, 30)}...</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] h-auto py-0">{lesson.duration}m</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Right: Import / AI Generate Options */}
              <div className="md:w-2/3 flex flex-col space-y-4">
                <div className="font-semibold flex items-center justify-between text-foreground">
                  <div className="flex items-center gap-2">
                    {showImport ? <Upload className="h-4 w-4" /> : showGenerator ? <Sparkles className="h-4 w-4 text-purple-500" /> : <BookOpen className="h-4 w-4" />}
                    {showImport ? 'Import Lessons (JSON)' : showGenerator ? 'AI Content Generator' : 'Add Lessons'}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs font-normal"
                      onClick={() => {
                        setShowImport(!showImport);
                        setShowGenerator(false);
                        setImportError(null);
                      }}
                    >
                      {showImport ? (
                        <>
                          <X className="h-3 w-3 mr-1" /> Cancel
                        </>
                      ) : (
                        <>
                          <Upload className="h-3 w-3 mr-1" /> Import JSON
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs font-normal text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                      onClick={() => {
                        if (!showGenerator) {
                          setGenTopic(courseForm.title || '');
                          setGenLevel(courseForm.difficulty || 'beginner');
                        }
                        setShowGenerator(!showGenerator);
                        setShowImport(false);
                      }}
                    >
                      {showGenerator ? (
                        <>
                          <X className="h-3 w-3 mr-1" /> Cancel
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" /> AI Generate
                        </>
                      )}
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
                      <p className="text-sm text-muted-foreground">
                        Select a .json file containing an array of lessons to import them automatically.
                      </p>
                    </div>

                    {importError && (
                      <div className="w-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs p-3 rounded border border-red-200 dark:border-red-800 text-center">
                        {importError}
                      </div>
                    )}

                    <div className="flex flex-col gap-3 w-full max-w-xs">
                      <input
                        ref={jsonFileInputRef}
                        type="file"
                        accept=".json,application/json"
                        onChange={handleJsonFileSelect}
                        className="hidden"
                      />
                      <Button
                        onClick={() => jsonFileInputRef.current?.click()}
                        className="w-full"
                      >
                        Choose File
                      </Button>

                      <div className="text-[10px] text-muted-foreground text-center">
                        Expected format: <code className="bg-muted px-1 rounded">[{`{"title":"...","content":"..."}`}]</code>
                      </div>
                    </div>
                  </div>
                ) : showGenerator ? (
                  <div className="space-y-3 flex-1 flex flex-col p-4 border rounded-md bg-accent/5 overflow-y-auto max-h-100">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Topic</Label>
                        <Input
                          placeholder="e.g. Python for Data Science"
                          value={genTopic}
                          onChange={(e) => setGenTopic(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 relative z-10">
                          <Label className="text-xs">Level</Label>
                          <Select value={genLevel} onValueChange={setGenLevel}>
                            <SelectTrigger className="h-8 text-xs bg-accent/5 border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className="border-border z-100! opacity-100! shadow-2xl"
                              style={{ backgroundColor: 'oklch(var(--background))', color: 'oklch(var(--foreground))' }}
                            >
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Lesson Count</Label>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={genCount}
                            onChange={(e) => setGenCount(parseInt(e.target.value) || 5)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {importError && (
                      <div className="w-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs p-3 rounded border border-red-200 dark:border-red-800 text-center">
                        {importError}
                      </div>
                    )}

                    <div className="bg-purple-50 dark:bg-purple-900/10 p-2 rounded text-[10px] text-purple-800 dark:text-purple-300 border border-purple-100 dark:border-purple-900/20">
                      <p>Generates <strong>{genCount}</strong> lessons on <strong>{genTopic || '...'}</strong> ({genLevel}).</p>
                      <p className="mt-1 opacity-70">These lessons will be added to your curriculum.</p>
                    </div>

                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={handleGenerateContent}
                      disabled={!genTopic || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-3 w-3 mr-2" /> Generate Lessons
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  editingIndex !== null ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold flex items-center gap-2 text-foreground">
                          <FileText className="h-4 w-4 text-primary" /> Preview Lesson
                        </div>
                        <div>
                          <Button variant="ghost" size="sm" onClick={() => setEditingIndex(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <ScrollArea className="flex-1 p-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none bg-background/50 p-4 rounded-xl border border-border/50">
                          <ReactMarkdown>{lessons[editingIndex].content}</ReactMarkdown>
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-6 border rounded-md bg-accent/5">
                      <div className="text-center max-w-md space-y-3">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <h3 className="font-semibold text-lg">Add Lessons</h3>
                        <p className="text-sm text-muted-foreground">
                          Use <strong>Import JSON</strong> to upload lessons from a file, or <strong>AI Generate</strong> to create lessons automatically.
                        </p>
                      </div>
                    </div>
                  )
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
            {step === 1 ? (
              <Button onClick={handleNext} disabled={!courseForm.title || !courseForm.description || !courseForm.category}>
                Next: Add Lessons <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={onCreate}
                disabled={lessons.length === 0 || isSaving}
                className="gradient-bg-primary shadow-lg shadow-primary/20"
              >
                {isSaving ? 'Creating...' : `Create Course (${lessons.length} Lessons)`}
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}
