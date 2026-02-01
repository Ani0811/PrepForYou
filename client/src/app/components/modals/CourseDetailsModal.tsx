"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, BookOpen, BarChart, Calendar, Award, Heart, Share2 } from 'lucide-react';
import { CourseWithProgress } from '../../api/courseApi';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseWithProgress | null;
    onEnroll: () => Promise<void>;
    isEnrolling: boolean;
}

export default function CourseDetailsModal({ open, onOpenChange, course, onEnroll, isEnrolling }: Props) {
    if (!course) return null;

    const handleSaveForLater = () => {
        toast.success("Course saved for later!");
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    // Determine button state based on progress/status
    const isEnrolled = course.status !== 'not-started';
    const isCompleted = course.status === 'completed';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-2xl! top-[55%]! p-0 overflow-hidden border-0 gap-0 z-60"
                style={{ backgroundColor: 'oklch(var(--background))' }}
            >
                {/* Banner Image */}
                <div className="relative h-48 w-full bg-muted">
                    {course.imageUrl ? (
                        <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-secondary/20">
                            <BookOpen className="h-12 w-12 text-primary/40" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />

                    <div className="absolute bottom-4 left-6 right-6">
                        <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 font-bold uppercase text-[10px] tracking-wider">
                                {course.category}
                            </Badge>
                            <Badge variant="outline" className="bg-secondary/20 text-secondary-foreground border-secondary/30 font-bold uppercase text-[10px] tracking-wider">
                                {course.difficulty}
                            </Badge>
                        </div>
                        <DialogTitle className="text-2xl md:text-3xl font-display font-bold text-foreground drop-shadow-sm">
                            {course.title}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Details and enrollment options for the {course.title} course.
                        </DialogDescription>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 text-foreground"
                        onClick={onOpenChange.bind(null, false)}
                    >
                        <span className="sr-only">Close</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-0">
                    {/* Main Content */}
                    <div className="md:col-span-2 p-6 space-y-5">
                        <div>
                            <h3 className="text-lg font-display font-bold mb-2 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                About this Course
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {course.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-accent/5">
                                <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-500">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">Duration</p>
                                    <p className="text-xs font-bold truncate">
                                        {course.duration >= 60
                                            ? `${Math.floor(course.duration / 60)}h${course.duration % 60 > 0 ? ` ${course.duration % 60}m` : ''}`
                                            : `${course.duration}m`
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-accent/5">
                                <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-500">
                                    <BarChart className="h-4 w-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">Level</p>
                                    <p className="text-xs font-bold truncate capitalize">{course.difficulty}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-accent/5">
                                <div className="p-1.5 rounded-full bg-purple-500/10 text-purple-500">
                                    <Award className="h-4 w-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">Certificate</p>
                                    <p className="text-xs font-bold truncate">Included</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-accent/5">
                                <div className="p-1.5 rounded-full bg-orange-500/10 text-orange-500">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">Updated</p>
                                    <p className="text-xs font-bold truncate">
                                        {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Recently'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Actions */}
                    <div className="md:col-span-1 p-6 bg-accent/5 border-l border-border flex flex-col gap-6">
                        <div className="space-y-4">
                            <h3 className="font-display font-bold text-lg">Course Actions</h3>

                            {!isEnrolled ? (
                                <Button
                                    size="lg"
                                    className="w-full gradient-bg-primary shadow-lg shadow-primary/20 text-lg font-bold h-12"
                                    onClick={onEnroll}
                                    disabled={isEnrolling}
                                >
                                    {isEnrolling ? 'Enrolling...' : 'Apply Now'}
                                    {!isEnrolling && <BookOpen className="ml-2 h-5 w-5" />}
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 text-base font-bold h-12 flex items-center justify-center"
                                    onClick={onEnroll}
                                    disabled={isEnrolling}
                                >
                                    <span className="truncate">{isCompleted ? 'Review Course' : 'Continue'}</span>
                                    {!isEnrolling && <BookOpen className="ml-2 h-4 w-4 shrink-0" />}
                                </Button>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="w-full" onClick={handleSaveForLater}>
                                    <Heart className="mr-2 h-4 w-4" />
                                    Save
                                </Button>
                                <Button variant="outline" className="w-full" onClick={handleShare}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                </Button>
                            </div>
                        </div>

                        <div className="border-t border-border pt-6 mt-auto">
                            <h4 className="font-medium mb-3 text-sm">Skills you'll learn</h4>
                            <div className="flex flex-wrap gap-2">
                                {course.tags.length > 0 ? (
                                    course.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                                            {tag}
                                        </Badge>
                                    ))
                                ) : (
                                    <>
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase">{course.category}</Badge>
                                        <Badge variant="secondary" className="bg-accent text-accent-foreground text-[10px] font-bold">FUNDAMENTALS</Badge>
                                        <Badge variant="secondary" className="bg-accent text-accent-foreground text-[10px] font-bold">PRACTICAL SKILLS</Badge>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
