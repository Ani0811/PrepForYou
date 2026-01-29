"use client";

import React, { ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
  handleCreateCourse: () => Promise<void>;
  isSaving: boolean;
}

export default function CreateCourseModal({ open, onOpenChange, courseForm, setCourseForm, fileInputRef, handleFileUpload, handleFileSelected, isUploading, uploadProgress, localPreview, cancelUpload, pauseUpload, resumeUpload, handleCreateCourse, isSaving }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md! w-full rounded-lg bg-zinc-900/70 border border-zinc-700 shadow-lg ring-1 ring-zinc-700/30">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add a new course to your platform. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
            <Input
              placeholder="Course title"
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description <span className="text-red-500">*</span></label>
            <textarea
              className="flex min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Course description"
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category <span className="text-red-500">*</span></label>
            <Select
              value={courseForm.category}
              onValueChange={(value) => setCourseForm({ ...courseForm, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Programming">Programming</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (minutes)</label>
            <Input
              type="number"
              placeholder="0"
              min="0"
              value={courseForm.duration || ''}
              onChange={(e) => setCourseForm({ ...courseForm, duration: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select
              value={courseForm.difficulty}
              onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                setCourseForm({ ...courseForm, difficulty: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL or Upload</label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={courseForm.imageUrl}
              onChange={(e) => setCourseForm({ ...courseForm, imageUrl: e.target.value })}
            />

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer?.files?.[0];
                if (file) handleFileSelected(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 flex items-center justify-center gap-4 rounded-md border border-dashed border-zinc-700 p-4 bg-zinc-800/30 cursor-pointer text-sm text-muted-foreground hover:bg-zinc-800/40"
            >
              <div className="flex flex-col items-center">
                <div className="text-sm">Drop image here, or click to select</div>
                <div className="text-xs text-muted-foreground">PNG, JPG, GIF — max 10MB</div>
              </div>
              <input
                ref={fileInputRef}
                id="course-image-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {localPreview || courseForm.imageUrl ? (
              <div className="mt-3 flex items-start gap-3">
                <img
                  src={localPreview || courseForm.imageUrl}
                  alt="Course preview"
                  className="h-20 w-28 rounded-md object-cover border border-zinc-700"
                />
                <div className="flex flex-col gap-2">
                  {isUploading && (
                    <div className="text-sm text-muted-foreground">Uploading: {uploadProgress ?? 0}%</div>
                  )}
                  <div className="flex gap-2">
                    {isUploading ? (
                      <>
                        <Button size="sm" variant="outline" onClick={pauseUpload}>Pause</Button>
                        <Button size="sm" variant="outline" onClick={resumeUpload}>Resume</Button>
                        <Button size="sm" variant="destructive" onClick={cancelUpload}>Cancel</Button>
                      </>
                    ) : (
                        <Button size="sm" variant="ghost" onClick={() => {
                        if (localPreview && localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
                        // @ts-ignore
                        // clear preview
                        (window as any).setLocalPreview?.(null);
                        setTimeout(() => setCourseForm((prev: any) => ({ ...prev, imageUrl: '' })), 0);
                      }}>Remove</Button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateCourse}
            disabled={!courseForm.title || !courseForm.description || !courseForm.category || isSaving}
            className="gradient-bg-primary"
          >
            {isSaving ? 'Creating...' : 'Create Course'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
