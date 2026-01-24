import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { 
  Brain, BookOpen, Target, FileText, Calendar, TrendingUp,
  Award, Clock, CheckCircle2, ArrowRight, Sparkles, Zap
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { icon: Target, label: 'Practice Questions', value: '245', change: '+12 this week', color: 'text-primary' },
    { icon: BookOpen, label: 'Study Hours', value: '48.5', change: '+5.2 this week', color: 'text-accent' },
    { icon: Award, label: 'Tests Completed', value: '18', change: '+3 this week', color: 'text-green-500' },
    { icon: TrendingUp, label: 'Average Score', value: '87%', change: '+5% improvement', color: 'text-yellow-500' }
  ];

  const recentActivity = [
    { title: 'Completed JavaScript Practice Test', time: '2 hours ago', icon: CheckCircle2, color: 'text-green-500' },
    { title: 'Created React Study Notes', time: '5 hours ago', icon: FileText, color: 'text-blue-500' },
    { title: 'Generated Algorithm Questions', time: '1 day ago', icon: Sparkles, color: 'text-purple-500' },
    { title: 'Reviewed Data Structures', time: '2 days ago', icon: BookOpen, color: 'text-cyan-500' }
  ];

  const upcomingStudy = [
    { subject: 'System Design', time: 'Today, 3:00 PM', progress: 60 },
    { subject: 'React Advanced Patterns', time: 'Tomorrow, 10:00 AM', progress: 30 },
    { subject: 'LeetCode Mock Interview', time: 'Wed, 2:00 PM', progress: 0 }
  ];

  const quickActions = [
    { icon: Brain, label: 'Generate Questions', path: '/question-generator', gradient: 'from-primary to-purple-600' },
    { icon: FileText, label: 'Create Notes', path: '/notes', gradient: 'from-accent to-blue-600' },
    { icon: Target, label: 'Start Practice', path: '/practice', gradient: 'from-green-500 to-emerald-600' },
    { icon: Calendar, label: 'Study Planner', path: '/study-planner', gradient: 'from-yellow-500 to-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-[#030712]">
      <Header />
      
      <main className="px-6 md:px-12 lg:px-24 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Welcome Back! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              Let's continue your learning journey
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  data-testid={`stat-card-${index}`}
                  className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
                  <div className="text-xs text-green-500">{stat.change}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    data-testid={`quick-action-${index}`}
                    className="p-6 bg-gradient-to-br bg-card border-border hover:border-primary/30 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    onClick={() => navigate(action.path)}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold">{action.label}</h3>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity & Upcoming Study */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div 
                      key={index}
                      data-testid={`activity-${index}`}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full bg-secondary flex items-center justify-center ${activity.color}`}>
                        <activity.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium mb-1">{activity.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Upcoming Study Sessions
                </h2>
                <div className="space-y-6">
                  {upcomingStudy.map((session, index) => (
                    <div key={index} data-testid={`upcoming-session-${index}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{session.subject}</div>
                        <div className="text-sm text-muted-foreground">{session.time}</div>
                      </div>
                      <Progress value={session.progress} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">{session.progress}% complete</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Performance Summary */}
            <div className="space-y-8">
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Weekly Goal
                </h2>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-primary mb-2">78%</div>
                  <div className="text-sm text-muted-foreground">of weekly goal completed</div>
                </div>
                <Progress value={78} className="h-3 mb-4" />
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Study Hours</span>
                    <span className="font-medium">8/10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Practice Questions</span>
                    <span className="font-medium">45/50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tests Completed</span>
                    <span className="font-medium">3/4</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Streak Bonus</h3>
                </div>
                <div className="text-3xl font-bold mb-2">7 Days 🔥</div>
                <p className="text-sm text-muted-foreground mb-4">
                  Keep going! You're on a roll.
                </p>
                <Button 
                  data-testid="continue-learning-btn"
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/practice')}
                >
                  Continue Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
