"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertTriangle, BookOpen } from 'lucide-react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCourse: any;
    onDelete: () => Promise<void>;
    isSaving: boolean;
}

export default function DeleteCourseModal({ open, onOpenChange, selectedCourse, onDelete, isSaving }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md fixed top-[55%]! border border-border shadow-2xl z-60 overflow-hidden p-0"
                style={{ backgroundColor: 'oklch(var(--background))' }}
            >
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-full bg-red-500/10 dark:bg-red-500/20">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        <DialogTitle className="font-display font-bold text-2xl text-red-500">Delete Course</DialogTitle>
                    </div>
                    <div className="text-muted-foreground leading-relaxed mt-1">
                        Are you sure you want to delete this course? This action will deactivate it and hide it from students.
                    </div>
                </DialogHeader>
                {selectedCourse && (
                    <div className="px-6 py-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-accent/5">
                            <div className="p-2 rounded-lg bg-accent/10 border border-border">
                                <BookOpen className="h-6 w-6 text-foreground opacity-70" />
                            </div>
                            <div>
                                <p className="font-bold text-lg leading-none mb-1 text-foreground">{selectedCourse.title}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{selectedCourse.category}</span>
                                    <span>•</span>
                                    <span>{selectedCourse.difficulty}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter className="gap-2 border-t border-border p-4 bg-background/50">
                    <Button
                        variant="outline"
                        className="hover:bg-accent"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        disabled={isSaving}
                        className="shadow-lg shadow-destructive/20"
                    >
                        {isSaving ? 'Deleting...' : 'Delete Course'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
