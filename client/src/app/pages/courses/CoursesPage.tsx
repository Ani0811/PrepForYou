"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { BookOpen, Clock, Award, Sparkles, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getCoursesWithProgress, updateCourseProgress, type CourseWithProgress } from '../../api/courseApi';
import { toast } from 'sonner';
import { CourseDetailsModal } from '../../components/modals';
import confetti from 'canvas-confetti';

export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<CourseWithProgress | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        fetchCourses(u.uid);
      } else {
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchCourses = async (firebaseUid: string, category?: string) => {
    setIsLoading(true);
    try {
      const data = await getCoursesWithProgress(firebaseUid, category);
      setCourses(data);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (user) {
      fetchCourses(user.uid, category === 'All' ? undefined : category);
    }
  };

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];

  const getCoursesByCategory = (category: string) => {
    if (category === 'All') return courses;
    return courses.filter(c => c.category === category);
  };

  const getCourseStatus = (progress: number) => {
    if (progress === 0) return { label: 'Not Started', variant: 'secondary' as const };
    if (progress === 100) return { label: 'Completed', variant: 'default' as const };
    return { label: 'In Progress', variant: 'outline' as const };
  };

  const openCourseDetails = (course: CourseWithProgress) => {
    setSelectedCourse(course);
    setIsDetailsModalOpen(true);
  };

  const handleEnroll = async () => {
    if (!selectedCourse || !user) return;

    if (selectedCourse.status !== 'not-started') {
      setIsDetailsModalOpen(false);
      router.push(`/learn?courseId=${selectedCourse.id}`);
      return;
    }

    setIsEnrolling(true);
    try {
      await updateCourseProgress(selectedCourse.id, user.uid, {
        status: 'in-progress',
        progress: 0
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1']
      });

      setSelectedCourse({
        ...selectedCourse,
        status: 'in-progress',
        progress: 0
      });

      if (user) {
        fetchCourses(user.uid, selectedCategory === 'All' ? undefined : selectedCategory);
      }

      toast.success('Successfully enrolled! 🎉');
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="backdrop-blur-sm gradient-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-sans">Please sign in to view courses</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight gradient-text transition-all duration-300 pb-2 leading-tight">
          Learning Journey
        </h1>
        <p className="text-muted-foreground text-lg font-sans max-w-2xl leading-relaxed">
          Master new skills with our AI-powered courses. Track your progress and achieve your goals.
        </p>
      </div>

      <Tabs defaultValue="All" className="w-full" onValueChange={handleCategoryChange}>
        <div className="flex items-center justify-start mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="bg-transparent h-auto p-0 gap-3">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="px-6 py-2 rounded-xl font-display font-semibold text-sm transition-all duration-300
                           border-2 border-border/40 bg-card/30 backdrop-blur-md
                           data-[state=active]:gradient-bg-primary data-[state=active]:text-primary-foreground 
                           data-[state=active]:border-transparent data-[state=active]:shadow-lg
                           hover:border-primary/40 hover:bg-primary/5
                           shadow-sm cursor-pointer"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-0 focus-visible:outline-none">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse bg-card/30 backdrop-blur-sm border-2 border-border/50 rounded-2xl h-[340px]">
                    <CardHeader className="p-6">
                      <div className="w-12 h-12 bg-muted/50 rounded-xl mb-3" />
                      <div className="h-6 bg-muted/50 rounded-lg w-3/4" />
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4">
                      <div className="space-y-2">
                        <div className="h-3 bg-muted/50 rounded w-full" />
                        <div className="h-3 bg-muted/50 rounded w-5/6" />
                      </div>
                      <div className="h-10 bg-muted/50 rounded-xl w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : getCoursesByCategory(category).length === 0 ? (
              <Card className="backdrop-blur-xl bg-card/20 border-2 border-dashed border-border/50 rounded-[32px] overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <BookOpen className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-3">No content found</h3>
                  <p className="text-muted-foreground text-base font-sans max-w-sm">We're still crafting world-class courses for the "{category}" category. Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {getCoursesByCategory(category).map((course) => {
                  const status = getCourseStatus(course.progress);
                  return (
                    <Card
                      key={course.id}
                      className="group relative flex flex-col h-full bg-card/40 backdrop-blur-xl border-2 border-border/50 rounded-[28px] overflow-hidden transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:-translate-y-2"
                      onClick={() => openCourseDetails(course)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <CardHeader className="relative p-6 pb-3">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg border border-primary/20">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <Badge
                            variant={status.variant}
                            className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold shadow-inner ${status.label === 'Completed' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20' :
                              status.label === 'In Progress' ? 'bg-primary/20 text-primary border-primary/20' :
                                'bg-muted/50 text-muted-foreground border-transparent'
                              }`}
                          >
                            {status.label}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl font-display font-bold leading-tight group-hover:text-primary transition-colors duration-300">
                          {course.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="relative flex-1 p-6 pt-0 space-y-6">
                        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed font-sans font-medium opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                          {course.description}
                        </p>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/30 border border-border/30 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <Award className="h-3.5 w-3.5 text-primary" />
                            {course.category}
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/30 border border-border/30 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <Clock className="h-3.5 w-3.5 text-orange-500" />
                            {Math.round(course.duration / 60)}h
                          </div>
                        </div>

                        <div className="pt-2 space-y-4 mt-auto">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium font-display text-muted-foreground">Progress</span>
                              <span className="text-2xl font-display font-bold gradient-text">{course.progress}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                              <div className="h-full gradient-bg-primary transition-all duration-1000 ease-out" style={{ width: `${course.progress}%` }} />
                            </div>
                          </div>

                          <Button
                            className="w-full h-11 rounded-xl font-bold text-sm transition-all duration-300 gradient-bg-primary hover:shadow-lg group-hover:translate-y-[-2px] active:scale-95"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCourseDetails(course);
                            }}
                          >
                            Browse Course
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <CourseDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        course={selectedCourse}
        onEnroll={handleEnroll}
        isEnrolling={isEnrolling}
      />
    </div>
  );
}
