"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Mail, Target, Calendar, TrendingUp, BookOpen, Clock } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground font-sans">Loading profile…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground font-sans">Please sign in to view your profile.</p>
      </div>
    );
  }

  const userProfile = {
    id: user.uid,
    name: user.displayName ?? 'No name',
    email: user.email ?? '',
    avatarUrl: user.photoURL ?? '',
    learningGoals: 'Not set yet'
  };

  const stats = {
    totalCourses: 0,
    completedCourses: 0,
    learningStreak: 0,
    totalTimeSpent: 0
  };

  const initials = userProfile.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight gradient-text transition-all duration-300">Profile</h1>
        <p className="text-muted-foreground text-lg font-sans">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1 gradient-card border-gradient backdrop-blur-sm hover:shadow-gradient-md transition-all duration-500">
          <CardHeader>
            <CardTitle className="font-display">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 ring-2 ring-gradient-start transition-all duration-300 hover:scale-110">
                <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                <AvatarFallback className="text-2xl font-display gradient-bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-display font-bold">{userProfile.name}</h2>
              <Badge variant="secondary" className="mt-2 gradient-bg-secondary">Active Learner</Badge>
            </div>

            <div className="space-y-4 pt-4 border-t">
              {userProfile.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium font-display">Email</p>
                    <p className="text-sm text-muted-foreground break-all font-sans">{userProfile.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium font-display">Member Since</p>
                  <p className="text-sm text-muted-foreground font-sans">January 2025</p>
                </div>
              </div>

              {userProfile.learningGoals && (
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium font-display">Learning Goals</p>
                    <p className="text-sm text-muted-foreground font-sans">{userProfile.learningGoals}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <Card className="lg:col-span-2 gradient-card border-gradient backdrop-blur-sm hover:shadow-gradient-md transition-all duration-500">
          <CardHeader>
            <CardTitle className="font-display">Learning Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
                    <BookOpen className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-sans">Total Courses</p>
                    <p className="text-2xl font-display font-bold">{stats ? Number(stats.totalCourses) : 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
                    <TrendingUp className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-sans">Completed</p>
                    <p className="text-2xl font-display font-bold">{stats ? Number(stats.completedCourses) : 0}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-sans">Learning Streak</p>
                    <p className="text-2xl font-display font-bold">{stats ? Number(stats.learningStreak) : 0} days</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shadow-gradient-sm transition-transform duration-300 hover:scale-110">
                    <Clock className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-sans">Time Spent</p>
                    <p className="text-2xl font-display font-bold">
                      {stats ? Math.floor(Number(stats.totalTimeSpent) / 60) : 0}h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg gradient-bg-secondary">
              <h3 className="font-semibold mb-2 font-display">Account ID</h3>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {userProfile?.id ? String(userProfile.id) : 'Not available'}
                </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferences Card */}
      <Card className="gradient-card border-gradient backdrop-blur-sm hover:shadow-gradient-md transition-all duration-500">
        <CardHeader>
          <CardTitle className="font-display">Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
              <div>
                <p className="font-medium font-display">Email Notifications</p>
                <p className="text-sm text-muted-foreground font-sans">Receive updates about your progress</p>
              </div>
              <Badge variant="outline" className="gradient-bg-secondary">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
              <div>
                <p className="font-medium font-display">Daily Reminders</p>
                <p className="text-sm text-muted-foreground font-sans">Get reminded to complete your daily tasks</p>
              </div>
              <Badge variant="outline" className="gradient-bg-secondary">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border gradient-card hover:shadow-gradient-sm transition-all duration-300 hover:scale-105">
              <div>
                <p className="font-medium font-display">Public Profile</p>
                <p className="text-sm text-muted-foreground font-sans">Allow others to view your achievements</p>
              </div>
              <Badge variant="secondary" className="gradient-bg-secondary">Private</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

