"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Clock, BookOpen, BarChart, Calendar, Award, Heart, Share2, Download } from 'lucide-react';
import { CourseWithProgress } from '../../api/courseApi';
import { toast } from 'sonner';
import { generateCourseCertificate } from '../../lib/certificateGenerator';
import { auth } from '../../lib/firebase';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseWithProgress | null;
    onEnroll: () => Promise<void>;
    isEnrolling: boolean;
}

export default function CourseDetailsModal({ open, onOpenChange, course, onEnroll, isEnrolling }: Props) {
    const [isDownloadingCertificate, setIsDownloadingCertificate] = useState(false);
    
    if (!course) return null;

    const handleSaveForLater = () => {
        toast.success("Course saved for later!");
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    const handleDownloadCertificate = async () => {
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            toast.error("Please sign in to download certificate");
            return;
        }

        setIsDownloadingCertificate(true);
        try {
            await generateCourseCertificate(
                course,
                currentUser.displayName || 'Student',
                currentUser.email || ''
            );
            toast.success("Certificate downloaded successfully! 🎉");
        } catch (error) {
            console.error('Error generating certificate:', error);
            toast.error("Failed to generate certificate");
        } finally {
            setIsDownloadingCertificate(false);
        }
    };

    // Determine button state based on progress/status
    const isEnrolled = course.status !== 'not-started';
    const isCompleted = course.status === 'completed';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-xl top-[55%] p-0 overflow-hidden border-0 gap-0 z-50"
                style={{ backgroundColor: 'oklch(var(--background))' }}
            >
                {/* Banner Header */}
                <div className="relative h-32 w-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center px-5 gap-5 overflow-hidden">
                    {course.imageUrl ? (
                        <div className="relative z-10 shrink-0">
                            <img
                                src={course.imageUrl}
                                alt={course.title}
                                className="h-20 w-20 object-contain drop-shadow-[0_8px_30px_rgb(0,0,0,0.5)] transform -rotate-3 hover:rotate-0 transition-transform duration-300"
                            />
                        </div>
                    ) : (
                        <div className="h-20 w-20 flex items-center justify-center bg-background/10 rounded-xl shrink-0">
                            <BookOpen className="h-10 w-10 text-primary/40" />
                        </div>
                    )}

                    <div className="relative z-10 flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                            <Badge className="bg-blue-500/90 hover:bg-blue-500 text-white border-0 px-2.5 py-0.5 text-[10px] font-bold rounded-full shadow-md">
                                {course.category}
                            </Badge>
                            <Badge className="bg-purple-500/90 hover:bg-purple-500 text-white border-0 px-2.5 py-0.5 text-[10px] font-bold rounded-full shadow-md capitalize">
                                {course.difficulty}
                            </Badge>
                        </div>
                        <DialogTitle className="text-xl md:text-2xl font-display font-bold text-white drop-shadow-md truncate">
                            {course.title}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Details and enrollment options for the {course.title} course.
                        </DialogDescription>
                    </div>

                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white z-20"
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
                    <div className="md:col-span-2 p-4 space-y-4">
                        <div>
                            <h3 className="text-base font-display font-bold mb-1.5 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                About this Course
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {course.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
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
                    <div className="md:col-span-1 p-4 bg-accent/5 border-l border-border flex flex-col gap-4">
                        <div className="space-y-3">
                            <h3 className="font-display font-bold text-base">Course Actions</h3>

                            {!isEnrolled ? (
                                <Button
                                    size="sm"
                                    className="w-full gradient-bg-primary shadow-lg shadow-primary/20 text-base font-bold h-10"
                                    onClick={onEnroll}
                                    disabled={isEnrolling}
                                >
                                    {isEnrolling ? 'Enrolling...' : 'Apply Now'}
                                    {!isEnrolling && <BookOpen className="ml-2 h-4 w-4" />}
                                </Button>
                            ) : (
                                <>
                                    <div className="space-y-2 p-3 rounded-lg bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="font-medium text-muted-foreground">Your Progress</span>
                                            <span className="font-bold text-primary">{Math.round(course.progress)}%</span>
                                        </div>
                                        <Progress value={course.progress} className="h-2" />
                                        {isCompleted && (
                                            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
                                                <Award className="h-3 w-3" />
                                                <span>Completed!</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {isCompleted ? (
                                        <div className="space-y-2">
                                            <Button
                                                size="sm"
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 text-sm font-bold h-10 flex items-center justify-center"
                                                onClick={onEnroll}
                                                disabled={isEnrolling}
                                            >
                                                <span className="truncate">Review Course</span>
                                                {!isEnrolling && <BookOpen className="ml-1.5 h-3.5 w-3.5 shrink-0" />}
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="w-full bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30 text-sm font-bold h-10 flex items-center justify-center"
                                                onClick={handleDownloadCertificate}
                                                disabled={isDownloadingCertificate}
                                            >
                                                {isDownloadingCertificate ? (
                                                    <span className="truncate">Generating...</span>
                                                ) : (
                                                    <>
                                                        <Download className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                                                        <span className="truncate">Download Certificate</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 text-sm font-bold h-10 flex items-center justify-center"
                                            onClick={onEnroll}
                                            disabled={isEnrolling}
                                        >
                                            <span className="truncate">Continue</span>
                                            {!isEnrolling && <BookOpen className="ml-1.5 h-3.5 w-3.5 shrink-0" />}
                                        </Button>
                                    )}
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" className="w-full h-9 text-xs font-semibold" onClick={handleSaveForLater}>
                                    <Heart className="mr-1.5 h-3.5 w-3.5" />
                                    Save
                                </Button>
                                <Button variant="outline" size="sm" className="w-full h-9 text-xs font-semibold" onClick={handleShare}>
                                    <Share2 className="mr-1.5 h-3.5 w-3.5" />
                                    Share
                                </Button>
                            </div>
                        </div>

                        <div className="border-t border-border pt-4 mt-auto">
                            <h4 className="font-medium mb-2 text-xs">Skills you'll learn</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {course.tags.length > 0 ? (
                                    course.tags.map(tag => (
                                        <Badge key={tag} className="bg-linear-to-r from-blue-500/10 to-purple-500/10 text-foreground border border-blue-500/20 text-xs font-medium px-3 py-1 rounded-md hover:from-blue-500/20 hover:to-purple-500/20 transition-colors">
                                            {tag}
                                        </Badge>
                                    ))
                                ) : (
                                    <>
                                        <Badge className="bg-linear-to-r from-blue-500/10 to-purple-500/10 text-foreground border border-blue-500/20 text-xs font-medium px-3 py-1 rounded-md">{course.category}</Badge>
                                        <Badge className="bg-linear-to-r from-emerald-500/10 to-teal-500/10 text-foreground border border-emerald-500/20 text-xs font-medium px-3 py-1 rounded-md">Fundamentals</Badge>
                                        <Badge className="bg-linear-to-r from-orange-500/10 to-amber-500/10 text-foreground border border-orange-500/20 text-xs font-medium px-3 py-1 rounded-md">Practical Skills</Badge>
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
