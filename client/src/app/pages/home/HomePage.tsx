"use client";

// Hook imports removed for App Router conversion; use client-side auth for name display.
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { CheckCircle2, Circle, BookOpen, Clock, Target, TrendingUp } from 'lucide-react';

export default function HomePage() {
  // Client-side user profile (populated from Firebase auth)
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUserProfile({ name: u.displayName, email: u.email });
      else setUserProfile(null);
    });
    return () => unsub();
  }, []);
  const tasks: any[] = [];
  const courses: any[] = [];
  const stats: any = undefined;

  const router = useRouter();

  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 5);
  const inProgressCourses = courses.filter(c => Number(c.progress) > 0 && Number(c.progress) < 100).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight gradient-text transition-all duration-300">
          Welcome back, {userProfile?.name || 'Student'}! 👋
        </h1>
        <p className="text-muted-foreground text-lg font-sans">
          Here's your learning overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-gradient-lg transition-all duration-500 border-gradient gradient-card backdrop-blur-sm hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-display">Total Courses</CardTitle>
            <div className="w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold gradient-text">
              {stats ? Number(stats.totalCourses) : courses.length}
            </div>
            <p className="text-xs text-muted-foreground font-sans">
              {stats ? Number(stats.completedCourses) : 0} completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-gradient-lg transition-all duration-500 border-gradient gradient-card backdrop-blur-sm hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-display">Learning Streak</CardTitle>
            <div className="w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold gradient-text">
              {stats ? Number(stats.learningStreak) : 0} days
            </div>
            <p className="text-xs text-muted-foreground font-sans">Keep it up!</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-gradient-lg transition-all duration-500 border-gradient gradient-card backdrop-blur-sm hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-display">Time Spent</CardTitle>
            <div className="w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
              <Clock className="h-4 w-4 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold gradient-text">
              {stats ? Math.floor(Number(stats.totalTimeSpent) / 60) : 0}h
            </div>
            <p className="text-xs text-muted-foreground font-sans">Total learning time</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-gradient-lg transition-all duration-500 border-gradient gradient-card backdrop-blur-sm hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-display">Pending Tasks</CardTitle>
            <div className="w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
              <Target className="h-4 w-4 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold gradient-text">
              {pendingTasks.length}
            </div>
            <p className="text-xs text-muted-foreground font-sans">Tasks to complete</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Tasks */}
        <Card className="backdrop-blur-sm gradient-card border-gradient hover:shadow-gradient-md transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Target className="h-5 w-5 text-primary" />
              Daily Prep Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-chart-1" />
                <p className="font-sans">All tasks completed! Great job! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div
                    key={Number(task.id)}
                    className="flex items-start gap-3 p-3 rounded-lg border gradient-bg-accent transition-all duration-300 hover:shadow-gradient-sm"
                  >
                    <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium font-display">{task.title}</p>
                      <p className="text-sm text-muted-foreground font-sans">{task.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-sans">Due: {task.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* In Progress Courses */}
        <Card className="backdrop-blur-sm gradient-card border-gradient hover:shadow-gradient-md transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <BookOpen className="h-5 w-5 text-chart-1" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inProgressCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4" />
                <p className="font-sans">Start a new course to begin learning!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inProgressCourses.map((course) => (
                  <div
                    key={Number(course.id)}
                    className="p-4 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-500 cursor-pointer hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold font-display">{course.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1 font-sans">
                          {course.description}
                        </p>
                      </div>
                      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-medium px-2.5 py-0.5 rounded-md shrink-0">
                        {course.category}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-sans">Progress</span>
                        <span className="font-medium font-display">{Number(course.progress)}%</span>
                      </div>
                      <Progress value={Number(course.progress)} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Resources */}
      <Card className="backdrop-blur-sm gradient-card border-gradient hover:shadow-gradient-md transition-all duration-500">
        <CardHeader>
          <CardTitle className="font-display">Quick Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Study Guide', desc: 'Review key concepts', path: '/study-guide' },
              { title: 'Practice Tests', desc: 'Test your knowledge', path: '/practice-tests' },
              { title: 'Blogs', desc: 'Read and Learn', path: '/blogs' },
              { title: 'Discussion Forum', desc: 'Ask questions', path: '/discussion-forum' },
            ].map((resource) => (
              <button
                key={resource.title}
                type="button"
                onClick={() => router.push(resource.path)}
                className="p-4 rounded-lg border gradient-card hover:shadow-gradient-md hover:scale-105 transition-all duration-500 text-left group"
              >
                <div className="w-10 h-10 rounded-lg gradient-bg-primary mb-3 group-hover:scale-110 transition-transform shadow-gradient-sm" />
                <h4 className="font-semibold font-display mb-1">{resource.title}</h4>
                <p className="text-sm text-muted-foreground font-sans">{resource.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

