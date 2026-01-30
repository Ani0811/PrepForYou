"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { BookOpen, Clock, Award, Sparkles, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getCoursesWithProgress, getRecommendedCourses, updateCourseProgress, type CourseWithProgress } from '../../api/courseApi';
import { toast } from 'sonner';
import { CourseDetailsModal } from '../../components/modals';

export default function CoursesPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedCourses, setRecommendedCourses] = useState<CourseWithProgress[]>([]);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<CourseWithProgress | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        fetchCourses(u.uid);
        fetchRecommendedCourses(u.uid);
      } else {
        setIsLoading(false);
        setIsLoadingRecommended(false);
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

  const fetchRecommendedCourses = async (firebaseUid: string) => {
    setIsLoadingRecommended(true);
    try {
      const data = await getRecommendedCourses(firebaseUid);
      setRecommendedCourses(data);
    } catch (error: any) {
      console.error('Error fetching recommended courses:', error);
      setRecommendedCourses([]);
    } finally {
      setIsLoadingRecommended(false);
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

    setIsEnrolling(true);
    try {
      await updateCourseProgress(selectedCourse.id, user.uid, {
        status: 'in-progress',
        progress: 0
      });

      toast.success('Successfully enrolled!');
      setIsDetailsModalOpen(false);

      // Refresh courses to show updated status
      await fetchCourses(user.uid, selectedCategory === 'All' ? undefined : selectedCategory);
      fetchRecommendedCourses(user.uid);
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text">
          Courses
        </h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse backdrop-blur-sm">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight gradient-text transition-all duration-300">
          Courses
        </h1>
        <p className="text-muted-foreground text-lg font-sans">
          Explore and continue your learning journey
        </p>
      </div>

      {/* Recommended for You Section */}
      {recommendedCourses.length > 0 && (
        <Card className="border-gradient gradient-card backdrop-blur-sm shadow-gradient-lg hover:shadow-gradient-xl transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <div className="w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="gradient-text">
                Recommended for You
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground font-sans">
              Personalized course recommendations based on your learning goals and progress
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingRecommended ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse backdrop-blur-sm">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-5/6" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendedCourses.slice(0, 5).map((course) => {
                  const status = getCourseStatus(course.progress);
                  return (
                    <Card
                      key={course.id}
                      className="hover:shadow-gradient-lg hover:scale-105 transition-all duration-500 cursor-pointer group border-gradient relative overflow-hidden backdrop-blur-sm gradient-card"
                    >
                      <div className="absolute top-2 right-2 z-10">
                        <div className="w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center backdrop-blur-sm shadow-gradient-sm transition-transform duration-300 group-hover:scale-110">
                          <Star className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-gradient-md">
                            <BookOpen className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <Badge variant={status.variant} className="gradient-bg-secondary">
                            {status.label}
                          </Badge>
                        </div>
                        <CardTitle className="line-clamp-2 font-display">{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 font-sans">
                          {course.description}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="gap-1 gradient-bg-secondary">
                            <Award className="h-3 w-3" />
                            {course.category}
                          </Badge>
                          <Badge variant="outline" className="gap-1 gradient-bg-secondary">
                            <Clock className="h-3 w-3" />
                            {Math.round(course.duration / 60)}h
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-sans">Progress</span>
                            <span className="font-semibold font-display">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Courses with Category Tabs */}
      <Tabs defaultValue="All" className="w-full" onValueChange={handleCategoryChange}>
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gradient-bg-secondary backdrop-blur-sm">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="px-4 font-medium font-display data-[state=active]:gradient-bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-gradient-md transition-all duration-300 data-[state=active]:scale-105"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse backdrop-blur-sm">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-5/6" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : getCoursesByCategory(category).length === 0 ? (
              <Card className="backdrop-blur-sm gradient-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-sans">No courses available in this category</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {getCoursesByCategory(category).map((course) => {
                  const status = getCourseStatus(course.progress);
                  return (
                    <Card
                      key={course.id}
                      className="hover:shadow-gradient-lg hover:scale-105 transition-all duration-500 cursor-pointer group backdrop-blur-sm gradient-card border-gradient"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-gradient-md">
                            <BookOpen className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <Badge variant={status.variant} className="gradient-bg-secondary">
                            {status.label}
                          </Badge>
                        </div>
                        <CardTitle className="line-clamp-2 font-display">{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 font-sans">
                          {course.description}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="gap-1 gradient-bg-secondary">
                            <Award className="h-3 w-3" />
                            {course.category}
                          </Badge>
                          <Badge variant="outline" className="gap-1 gradient-bg-secondary">
                            <Clock className="h-3 w-3" />
                            {Math.round(course.duration / 60)}h
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground font-sans">Progress</span>
                              <span className="font-semibold font-display">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>

                          <Button
                            className="w-full gradient-bg-primary shadow-lg shadow-primary/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCourseDetails(course);
                            }}
                          >
                            View Course
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


