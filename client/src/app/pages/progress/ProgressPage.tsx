'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Trophy, TrendingUp, Clock, BookOpen, Award, Target, Flame, Lightbulb, Brain, Zap, TrendingDown } from 'lucide-react';
import { getUserStats } from '../../api/userApi';
import { getCoursesWithProgress, CourseWithProgress } from '../../api/courseApi';
import { toast } from 'sonner';

export default function ProgressPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.error('You must be logged in to view progress.');
        router.push('/login');
        return;
      }
      setCurrentUser(user);
      await fetchData(user.uid);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchData = async (firebaseUid: string) => {
    try {
      setIsLoading(true);
      const [statsData, coursesData] = await Promise.all([
        getUserStats(firebaseUid),
        getCoursesWithProgress(firebaseUid),
      ]);
      
      setStats(statsData.stats);
      setAnalytics(statsData.analytics);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const achievements: any[] = [];
  const completedCourses = courses.filter(c => c.status === 'completed');
  const inProgressCourses = courses.filter(c => c.status === 'in-progress');

  const overallProgress = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
    : 0;

  const learningStreak = stats?.learningStreak || 0;
  const streakTrend = learningStreak > 7 ? 'excellent' : learningStreak > 3 ? 'good' : 'needs-improvement';

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight gradient-text transition-all duration-300">
          Your Progress
        </h1>
        <p className="text-muted-foreground text-lg font-sans">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-gradient-lg transition-all duration-500 backdrop-blur-sm gradient-card border-gradient hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-display">Overall Progress</CardTitle>
            <div className="w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
              <Target className="h-4 w-4 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold gradient-text">
              {overallProgress}%
            </div>
            <Progress value={overallProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-gradient-lg transition-all duration-500 backdrop-blur-sm gradient-card border-gradient hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-display">Learning Streak</CardTitle>
            <div className="w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
              <Flame className="h-4 w-4 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold gradient-text">
              {learningStreak} days
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-sans">Keep the momentum going!</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-gradient-lg transition-all duration-500 backdrop-blur-sm gradient-card border-gradient hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-display">Total Time</CardTitle>
            <div className="w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
              <Clock className="h-4 w-4 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold gradient-text">
              {stats?.totalTimeSpent ? Math.floor(stats.totalTimeSpent / 60) : 0}h {stats?.totalTimeSpent ? stats.totalTimeSpent % 60 : 0}m
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-sans">Time invested in learning</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-gradient-lg transition-all duration-500 backdrop-blur-sm gradient-card border-gradient hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-display">Achievements</CardTitle>
            <div className="w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
              <Trophy className="h-4 w-4 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold gradient-text">
              {achievements.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-sans">Badges earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Personalized Insights */}
      <Card className="border-gradient gradient-card backdrop-blur-sm shadow-gradient-lg hover:shadow-gradient-xl transition-all duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="gradient-text">
              Personalized Insights
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Recommended Study Time */}
            <div className="p-4 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-500 backdrop-blur-sm hover:scale-105">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
                  <Clock className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground font-sans">Recommended Daily</p>
                  <p className="text-2xl font-display font-bold gradient-text">
                    {analytics?.recommendedStudyTime || 60} min
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-sans">
                Based on your current progress and learning streak
              </p>
            </div>

            {/* Learning Streak Visualization */}
            <div className="p-4 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-500 backdrop-blur-sm hover:scale-105">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110 ${
                  streakTrend === 'excellent' ? 'gradient-bg-primary' :
                  streakTrend === 'good' ? 'gradient-bg-primary' : 
                  'gradient-bg-primary'
                }`}>
                  {streakTrend === 'excellent' ? (
                    <TrendingUp className="h-5 w-5 text-primary-foreground" />
                  ) : streakTrend === 'good' ? (
                    <Zap className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground font-sans">Streak Status</p>
                  <p className="text-2xl font-display font-bold capitalize">
                    {streakTrend === 'excellent' ? 'Excellent' : streakTrend === 'good' ? 'Good' : 'Build It'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-sans">
                {streakTrend === 'excellent' ? 'Amazing consistency!' :
                 streakTrend === 'good' ? 'Keep up the good work!' :
                 'Start building your streak today'}
              </p>
            </div>

            {/* Course Completion Trend */}
            <div className="p-4 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-500 backdrop-blur-sm hover:scale-105">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground font-sans">Completion Rate</p>
                  <p className="text-2xl font-display font-bold gradient-text">
                    {courses.length > 0 ? Math.round((completedCourses.length / courses.length) * 100) : 0}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-sans">
                {completedCourses.length} of {courses.length} courses completed
              </p>
            </div>
          </div>

          {/* Top Categories */}
          {analytics?.topCategories && analytics.topCategories.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2 font-display">
                <Lightbulb className="h-4 w-4 text-chart-1" />
                Top Learning Categories
              </h4>
              <div className="flex flex-wrap gap-2">
                {analytics.topCategories.map((category: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="px-3 py-1 gradient-bg-secondary hover:shadow-gradient-sm transition-all duration-300 hover:scale-105 font-display"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Areas */}
          {analytics?.improvementAreas && analytics.improvementAreas.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2 font-display">
                <Target className="h-4 w-4 text-primary" />
                Top 3 Areas for Improvement
              </h4>
              <div className="space-y-2">
                {analytics.improvementAreas.slice(0, 3).map((area: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border gradient-bg-accent transition-all duration-300 backdrop-blur-sm hover:shadow-gradient-sm hover:scale-105"
                  >
                    <div className="w-6 h-6 rounded-full gradient-bg-primary flex items-center justify-center shrink-0 mt-0.5 shadow-gradient-sm transition-transform duration-300 hover:scale-110">
                      <span className="text-xs font-bold text-primary-foreground font-display">{index + 1}</span>
                    </div>
                    <p className="text-sm flex-1 font-sans">{area}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Course Progress */}
        <Card className="backdrop-blur-sm gradient-card border-gradient hover:shadow-gradient-md transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <BookOpen className="h-5 w-5 text-primary" />
              Course Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-sans">Completed</span>
                <span className="font-semibold font-display">{completedCourses.length} / {courses.length}</span>
              </div>
              <Progress
                value={courses.length > 0 ? (completedCourses.length / courses.length) * 100 : 0}
                className="h-2"
              />
            </div>

            <div className="space-y-3 mt-6">
              <h4 className="font-semibold text-sm font-display">In Progress</h4>
              {inProgressCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center font-sans">
                  No courses in progress
                </p>
              ) : (
                inProgressCourses.map((course) => (
                  <div key={course.id} className="space-y-2 p-3 rounded-lg border gradient-card backdrop-blur-sm hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm font-display">{course.title}</span>
                      <Badge variant="secondary" className="gradient-bg-secondary">
                        {course.progress}%
                      </Badge>
                    </div>
                    <Progress value={course.progress} className="h-1.5" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="backdrop-blur-sm gradient-card border-gradient hover:shadow-gradient-md transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Trophy className="h-5 w-5 text-chart-4" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground font-sans">
                  Complete courses and tasks to earn achievements!
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {achievements.map((achievement) => (
                  <div
                    key={Number(achievement.id)}
                    className="p-4 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-500 backdrop-blur-sm hover:scale-105"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src="/assets/generated/achievement-badge.dim_80x80.png"
                        alt="Achievement"
                        className="w-12 h-12 rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-1 font-display">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 font-sans">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 font-sans">
                          {achievement.dateEarned}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Learning Activity Chart */}
      <Card className="backdrop-blur-sm gradient-card border-gradient hover:shadow-gradient-md transition-all duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <TrendingUp className="h-5 w-5 text-chart-1" />
            Learning Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <p className="font-sans">Activity chart visualization coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

