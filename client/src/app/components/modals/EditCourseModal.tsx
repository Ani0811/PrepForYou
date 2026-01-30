"use client";

import React, { ChangeEvent, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
    pauseUpload: () => void;
    resumeUpload: () => void;
    handleUpdateCourse: () => Promise<void>;
    isSaving: boolean;
}

export default function EditCourseModal({ open, onOpenChange, editCourseForm, setEditCourseForm, fileInputRef, handleFileUpload, isUploading, uploadProgress, localPreview, cancelUpload, pauseUpload, resumeUpload, handleUpdateCourse, isSaving }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-2xl! w-full fixed top-[55%]! flex flex-col rounded-xl border border-border shadow-2xl p-0 overflow-hidden z-[60]"
                style={{ backgroundColor: 'oklch(var(--background))' }}
            >
                <DialogHeader className="flex-none p-5 pb-0">
                    <DialogTitle className="text-2xl font-display font-bold gradient-text">Edit Course</DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-1">
                        Update the details of your course below.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column: Core Info */}
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Title <span className="text-red-500">*</span></label>
                                <Input
                                    placeholder="e.g. Advanced Web Development"
                                    value={editCourseForm.title}
                                    className="bg-accent/5 focus:bg-accent/10 transition-colors border-border"
                                    onChange={(e) => setEditCourseForm({ ...editCourseForm, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5 text-foreground!">
                                <label className="text-sm font-medium text-foreground">Description <span className="text-red-500">*</span></label>
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
                                    <label className="text-sm font-medium text-foreground">Category <span className="text-red-500">*</span></label>
                                    <Select
                                        value={editCourseForm.category}
                                        onValueChange={(value) => setEditCourseForm({ ...editCourseForm, category: value })}
                                    >
                                        <SelectTrigger className="bg-accent/5 border-border">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent
                                            className="border-border z-[70]! opacity-100! shadow-2xl"
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
                                    <label className="text-sm font-medium text-foreground">Difficulty</label>
                                    <Select
                                        value={editCourseForm.difficulty}
                                        onValueChange={(value) => setEditCourseForm({ ...editCourseForm, difficulty: value })}
                                    >
                                        <SelectTrigger className="bg-accent/5 border-border">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent
                                            className="border-border z-[70]! opacity-100! shadow-2xl"
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
                                    value={editCourseForm.duration || ''}
                                    onChange={(e) => setEditCourseForm({ ...editCourseForm, duration: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Course Thumbnail</label>

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
                                    <div className="mt-2 space-y-1">
                                        <div className="flex justify-between text-[10px] font-medium text-primary">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress ?? 0}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-accent/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-300"
                                                style={{ width: `${uploadProgress ?? 0}%` }}
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-end mt-1">
                                            <button onClick={pauseUpload} className="text-[10px] hover:text-primary transition-colors">Pause</button>
                                            <button onClick={resumeUpload} className="text-[10px] hover:text-primary transition-colors">Resume</button>
                                            <button onClick={cancelUpload} className="text-[10px] hover:text-red-500 transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-none p-5 pt-4 border-t border-border bg-background/50">
                    <Button
                        variant="outline"
                        className="hover:bg-accent"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateCourse}
                        disabled={!editCourseForm.title || !editCourseForm.description || !editCourseForm.category || isSaving}
                        className="gradient-bg-primary shadow-lg shadow-primary/20"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
