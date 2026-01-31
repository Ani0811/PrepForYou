'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    getCourseById,
    getCourseProgressDetails,
    completeLesson,
    Course,
    Lesson
} from '../../api/courseApi';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
    BookOpen,
    CheckCircle,
    Circle,
    ChevronLeft,
    Menu,
    Loader2,
    Lock
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudyPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const courseId = (params?.courseId || searchParams.get('courseId')) as string;
    const router = useRouter();

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
    const [progressPercent, setProgressPercent] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Auth & Data Fetching
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                toast.error('You must be logged in to access this course.');
                router.push('/login');
                return;
            }
            setCurrentUser(user);
            await fetchData(user.uid);
        });
        return () => unsubscribe();
    }, [courseId]);

    const fetchData = async (uid: string) => {
        try {
            setIsLoading(true);

            // 1. Fetch Course (includes lessons)
            const courseData = await getCourseById(courseId);
            setCourse(courseData);
            const sortedLessons = courseData.lessons || [];
            setLessons(sortedLessons);

            // 2. Fetch Progress
            const progressData = await getCourseProgressDetails(courseId, uid);

            if (progressData) {
                setProgressPercent(progressData.percent);
                const completedSet = new Set(progressData.completedLessons);
                setCompletedLessonIds(completedSet);

                // Determine active lesson: First incomplete lesson, or first lesson
                if (sortedLessons.length > 0) {
                    const firstIncomplete = sortedLessons.find(l => !completedSet.has(l.id));
                    setActiveLesson(firstIncomplete || sortedLessons[0]);
                }
            } else {
                // No progress yet (just enrolled via enrollment check presumably, or direct access)
                if (sortedLessons.length > 0) setActiveLesson(sortedLessons[0]);
            }

        } catch (error) {
            console.error('Error loading study data:', error);
            toast.error('Failed to load course content.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLessonSelect = (lesson: Lesson) => {
        setActiveLesson(lesson);
        // On mobile, maybe close sidebar?
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const handleCompleteLesson = async () => {
        if (!currentUser || !activeLesson) return;

        try {
            setIsCompleting(true);

            // Call API
            const result = await completeLesson(courseId, activeLesson.id, currentUser.uid);

            // Update local state
            setCompletedLessonIds(prev => new Set(prev).add(activeLesson.id));
            setProgressPercent(result.progress);

            toast.success('Lesson completed!');

            // Auto-advance to next lesson
            const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
            if (currentIndex < lessons.length - 1) {
                setActiveLesson(lessons[currentIndex + 1]);
            } else {
                toast.success('Course completed! Congratulations!');
            }

        } catch (error) {
            console.error('Error completing lesson:', error);
            toast.error('Failed to save progress.');
        } finally {
            setIsCompleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex bg-background h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 font-display text-lg">Loading your classroom...</span>
            </div>
        );
    }

    if (!course || !activeLesson) {
        return (
            <div className="flex bg-background h-screen flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold">Course Content Not Found</h2>
                <Button onClick={() => router.push('/courses')}>Back to Courses</Button>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
            {/* Sidebar - Lesson Navigation */}
            <div
                className={`${sidebarOpen ? 'w-80' : 'w-0'
                    } bg-card border-r border-border flex flex-col transition-all duration-300 relative z-20`}
            >
                <div className="p-4 border-b border-border bg-muted/20">
                    <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground" onClick={() => router.push('/courses')}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Courses
                    </Button>
                    <h2 className="font-display font-bold text-lg leading-tight line-clamp-2">{course.title}</h2>
                    <div className="mt-3 flex items-center gap-2">
                        <Progress value={progressPercent} className="h-2 flex-1" />
                        <span className="text-xs font-semibold text-muted-foreground">{progressPercent}%</span>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-2">
                        {lessons.map((lesson, index) => {
                            const isCompleted = completedLessonIds.has(lesson.id);
                            const isActive = activeLesson.id === lesson.id;

                            return (
                                <div
                                    key={lesson.id}
                                    onClick={() => handleLessonSelect(lesson)}
                                    className={`
                    group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border
                    ${isActive
                                            ? 'bg-primary/10 border-primary/20 shadow-sm'
                                            : 'hover:bg-accent border-transparent hover:border-border'
                                        }
                  `}
                                >
                                    <div className={`mt-0.5 ${isCompleted ? 'text-green-500' : isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                        {isCompleted ? <CheckCircle className="h-5 w-5 fill-green-500/10" /> : <BookOpen className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium leading-tight ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                            {index + 1}. {lesson.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[10px] text-muted-foreground bg-accent/50 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
                                                {lesson.duration} min
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background relative">
                {/* Toggle Sidebar Button (Mobile/Desktop) */}
                {!sidebarOpen && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 left-4 z-30 bg-background/50 backdrop-blur-md shadow-sm border border-border"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                )}

                {/* Toggle button when open is inside the header usually, but here: */}
                {sidebarOpen && (
                    <div className="absolute top-4 left-4 z-30 md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </div>
                )}

                {/* Desktop Toggle (when open) */}
                {sidebarOpen && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-[50%] -left-3 z-30 h-6 w-6 rounded-full border border-border bg-background shadow-md hidden md:flex items-center justify-center"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <ChevronLeft className="h-3 w-3" />
                    </Button>
                )}


                <ScrollArea className="flex-1 h-full">
                    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 pb-32">

                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-muted-foreground border-border">
                                    Lesson {activeLesson.order}
                                </Badge>
                                {completedLessonIds.has(activeLesson.id) && (
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                                        Completed
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-3xl font-display font-bold text-foreground">
                                {activeLesson.title}
                            </h1>
                        </div>

                        {/* Text Content */}
                        <div className="prose dark:prose-invert max-w-none">
                            <div className="whitespace-pre-wrap font-sans text-lg leading-relaxed text-muted-foreground">
                                {activeLesson.content}
                            </div>
                        </div>

                    </div>
                </ScrollArea>

                {/* Bottom Action Bar */}
                <div className="border-t border-border p-4 bg-background/80 backdrop-blur-xl absolute bottom-0 left-0 right-0 z-10 flex justify-between items-center max-w-none">
                    <div className="hidden md:block text-sm text-muted-foreground">
                        {completedLessonIds.has(activeLesson.id) ? "You've completed this lesson." : "Mark as complete to continue."}
                    </div>
                    <div className="flex gap-4 ml-auto">
                        <Button variant="outline" onClick={() => {
                            const currIdx = lessons.findIndex(l => l.id === activeLesson.id);
                            if (currIdx > 0) setActiveLesson(lessons[currIdx - 1]);
                        }} disabled={lessons.findIndex(l => l.id === activeLesson.id) === 0}>
                            Previous
                        </Button>

                        <Button
                            onClick={handleCompleteLesson}
                            disabled={isCompleting}
                            className={completedLessonIds.has(activeLesson.id) ? "bg-accent hover:bg-accent/80 text-foreground" : "gradient-bg-primary shadow-lg shadow-primary/20"}
                        >
                            {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {completedLessonIds.has(activeLesson.id) ? 'Next Lesson' : 'Complete & Continue'}
                            {!isCompleting && <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
