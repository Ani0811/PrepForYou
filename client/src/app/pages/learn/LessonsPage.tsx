'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
    BookOpen,
    CheckCircle,
    ChevronLeft,
    Menu,
    Loader2,
    Lock
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

// Code Block with Typing Animation Component (triggers on scroll)
function CodeBlockWithTyping({ match, children, ...props }: any) {
    const [displayedCode, setDisplayedCode] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const fullCode = String(children).replace(/\n$/, '');
    const hasTyped = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer to detect when code block is in viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasTyped.current) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 } // Trigger when 30% of the code block is visible
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    // Typing animation effect
    useEffect(() => {
        if (!isVisible || hasTyped.current) {
            if (hasTyped.current) {
                setDisplayedCode(fullCode);
                setIsTyping(false);
            }
            return;
        }

        hasTyped.current = true;
        let index = 0;
        setDisplayedCode('');
        setIsTyping(true);

        const typingInterval = setInterval(() => {
            if (index < fullCode.length) {
                setDisplayedCode(fullCode.slice(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(typingInterval);
            }
        }, 20); // Typing speed: 20ms per character

        return () => clearInterval(typingInterval);
    }, [isVisible, fullCode]);

    return (
        <div ref={containerRef} className="rounded-xl overflow-hidden my-6 shadow-2xl border border-border/50 bg-slate-50 dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-950">
            {/* macOS-style window header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-linear-to-r dark:from-slate-800 dark:to-slate-900 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm hover:bg-red-600 transition-colors cursor-pointer" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm hover:bg-yellow-600 transition-colors cursor-pointer" />
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm hover:bg-green-600 transition-colors cursor-pointer" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-400 ml-2">
                        {match?.[1] || 'code'}
                    </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-500 font-mono">
                    {match?.[1] ? `script.${match[1]}` : 'untitled'}
                </div>
            </div>
            {/* Code content with typing animation */}
            <pre className="m-0 p-0 bg-transparent relative">
                <code className="block p-6 text-sm font-mono overflow-x-auto text-slate-900 dark:text-slate-100 leading-relaxed bg-transparent" {...props}>
                    {displayedCode}
                    {isTyping && <span className="inline-block w-2 h-5 bg-primary/70 ml-0.5 animate-pulse" />}
                </code>
            </pre>
        </div>
    );
}

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
    const mainScrollRef = useRef<HTMLDivElement | null>(null);
    const contentSentinelRef = useRef<HTMLDivElement | null>(null);
    const [hasSeenContent, setHasSeenContent] = useState(false);

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

    // Reset seen-content flag when lesson changes or when completed lessons update
    useEffect(() => {
        setHasSeenContent(activeLesson ? completedLessonIds.has(activeLesson.id) : false);
    }, [activeLesson, completedLessonIds]);

    // Observe sentinel within the main scroll container to detect when user reaches end
    useEffect(() => {
        const sentinel = contentSentinelRef.current;
        const root = mainScrollRef.current;
        if (!sentinel || !root) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setHasSeenContent(true);
            },
            { root, threshold: 0.9 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [activeLesson]);

    // Scroll main content to top whenever the active lesson changes
    useEffect(() => {
        if (mainScrollRef.current) {
            try {
                mainScrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
            } catch (e) {
                mainScrollRef.current.scrollTop = 0;
            }
        }
    }, [activeLesson]);

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

    const isCompleteLocked = !hasSeenContent && !completedLessonIds.has(activeLesson.id);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
            {/* Sidebar - Lesson Navigation */}
            <div
                className={`${sidebarOpen ? 'w-80 border-r' : 'w-0 border-r-0'
                    } bg-background/95 backdrop-blur-md flex flex-col transition-all duration-300 ease-in-out relative z-20 shrink-0 border-border overflow-hidden`}
            >
                <div className="p-5 border-b border-border bg-card/50 min-w-[320px]">
                    <Button variant="outline" size="sm" className="mb-3 w-full font-semibold transition transform hover:-translate-y-0.5 hover:shadow-sm" onClick={() => router.push('/courses')}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Courses
                    </Button>
                    <h2 className="font-display font-bold text-xl leading-tight line-clamp-2 mb-1">{course.title}</h2>
                    <p className="text-xs text-muted-foreground mb-3">Track your progress</p>
                    <div className="flex items-center gap-3">
                        <Progress value={progressPercent} className="h-2.5 flex-1" />
                        <span className="text-sm font-bold text-primary">{progressPercent}%</span>
                    </div>
                </div>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-2.5 min-w-[320px]">
                        {lessons.map((lesson, index) => {
                            const isCompleted = completedLessonIds.has(lesson.id);
                            const isActive = activeLesson.id === lesson.id;
                            
                            // Check if previous lesson is completed (for locking logic)
                            const isPreviousCompleted = index === 0 || completedLessonIds.has(lessons[index - 1].id);
                            const isLocked = !isPreviousCompleted && !isCompleted;

                            return (
                                <div
                                    key={lesson.id}
                                    onClick={() => !isLocked && handleLessonSelect(lesson)}
                                    className={`
                    group flex items-start gap-3 p-3.5 rounded-xl transition-all border-2
                    ${isLocked 
                        ? 'cursor-not-allowed opacity-50 bg-muted/30 border-border/30' 
                        : 'cursor-pointer'}
                    ${isActive && !isLocked
                                            ? 'bg-primary/10 border-primary/30 shadow-md shadow-primary/10'
                                            : !isLocked ? 'hover:bg-accent/50 border-transparent hover:border-border/50' : 'border-transparent'
                                        }
                  `}
                                >
                                    <div className={`mt-0.5 transition-transform ${isActive && !isLocked ? 'scale-110' : ''} ${isLocked ? 'text-muted-foreground/50' : isCompleted ? 'text-green-500' : isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                        {isLocked ? (
                                            <Lock className="h-5 w-5" />
                                        ) : isCompleted ? (
                                            <CheckCircle className="h-5 w-5 fill-green-500/20" />
                                        ) : (
                                            <BookOpen className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold leading-tight mb-1.5 ${isLocked ? 'text-muted-foreground' : isActive ? 'text-primary' : 'text-foreground'}`}>
                                            {index + 1}. {lesson.title}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground bg-accent px-2 py-1 rounded-md uppercase tracking-wide font-bold">
                                                {lesson.duration} min
                                            </span>
                                            {isCompleted && (
                                                <span className="text-[9px] text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wide font-bold">
                                                    ✓ Done
                                                </span>
                                            )}
                                            {isLocked && (
                                                <span className="text-[9px] text-orange-600 bg-orange-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wide font-bold">
                                                    🔒 Locked
                                                </span>
                                            )}
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


                <div ref={mainScrollRef} className="flex-1 overflow-y-auto h-full scrollbar-gutter-stable">
                    <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-10 pb-32">

                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5">
                                <Badge variant="outline" className="text-xs font-bold px-3 py-1 border-primary/30 text-primary bg-primary/5">
                                    Lesson {activeLesson.order}
                                </Badge>
                                {completedLessonIds.has(activeLesson.id) && (
                                    <Badge variant="secondary" className="text-xs font-bold px-3 py-1 bg-green-500/10 text-green-600 border border-green-500/20">
                                        ✓ Completed
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
                                {activeLesson.title}
                            </h1>
                            <div className="h-1 w-20 bg-linear-to-r from-primary to-primary/30 rounded-full" />
                        </div>


                        {/* Text Content */}
                        <div className="prose dark:prose-invert max-w-none">
                            <div className="font-sans text-lg md:text-xl leading-relaxed text-foreground/90 bg-card/30 p-8 rounded-2xl border border-border/50">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 font-display" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3 font-display" {...props} />,
                                        h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-5 mb-2 font-display" {...props} />,
                                        p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                                        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                        code: ({ node, className, children, ...props }: any) => {
                                            const match = /language-(\w+)/.exec(className || '')
                                            return !match ? (
                                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props}>
                                                    {children}
                                                </code>
                                            ) : (
                                                <CodeBlockWithTyping match={match} {...props}>{children}</CodeBlockWithTyping>
                                            )
                                        },
                                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/50 pl-4 italic my-6 text-muted-foreground bg-primary/5 py-2 pr-2 rounded-r" {...props} />,
                                    }}
                                >
                                    {activeLesson.content}
                                </ReactMarkdown>
                            </div>
                        </div>

                    </div>
                    <div ref={contentSentinelRef} className="w-full h-2" />
                </div>

                {/* Bottom Action Bar */}
                 <div className="border-t border-border p-5 absolute bottom-0 left-0 right-0 z-10 flex justify-between items-center max-w-none shadow-2xl"
                     style={{ backgroundColor: 'oklch(var(--background) / 1)' }}>
                    <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                        <div className={`w-2 h-2 rounded-full ${completedLessonIds.has(activeLesson.id) ? 'bg-green-500' : 'bg-primary'} animate-pulse`} />
                        {completedLessonIds.has(activeLesson.id) ? "You've completed this lesson!" : "Mark as complete to unlock the next lesson"}
                    </div>
                    <div className="flex gap-3 ml-auto w-full md:w-auto">
                        <Button
                            variant="outline"
                            className="flex-1 md:flex-none font-semibold transition transform disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-md"
                            onClick={() => {
                                const currIdx = lessons.findIndex(l => l.id === activeLesson.id);
                                if (currIdx > 0) setActiveLesson(lessons[currIdx - 1]);
                            }}
                            disabled={lessons.findIndex(l => l.id === activeLesson.id) === 0}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>

                        <Button
                            onClick={handleCompleteLesson}
                            disabled={isCompleting || isCompleteLocked}
                            title={isCompleteLocked ? 'Scroll to the end of the lesson to unlock' : undefined}
                            className={`flex-1 md:flex-none font-bold text-base px-6 transition-transform ${completedLessonIds.has(activeLesson.id)
                                ? "bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/30"
                                : "gradient-bg-primary shadow-lg shadow-primary/30"
                                } ${isCompleteLocked ? 'opacity-60 cursor-not-allowed hover:shadow-none hover:scale-100' : 'hover:scale-[1.02] hover:shadow-xl'}`}
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
