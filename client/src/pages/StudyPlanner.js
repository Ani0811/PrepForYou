import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Target, 
  Sparkles,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudyPlanner() {
  const [date, setDate] = useState(new Date());
  const [goals, setGoals] = useState([
    { id: 1, text: 'Complete React Hooks tutorial', completed: true, priority: 'high' },
    { id: 2, text: 'Practice 10 algorithm problems', completed: false, priority: 'high' },
    { id: 3, text: 'Review system design notes', completed: false, priority: 'medium' },
    { id: 4, text: 'Read CSS Grid article', completed: true, priority: 'low' }
  ]);

  const [studySessions, setStudySessions] = useState([
    {
      id: 1,
      title: 'React Patterns Deep Dive',
      date: '2025-01-20',
      time: '10:00 AM',
      duration: '2 hours',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Algorithm Practice Session',
      date: '2025-01-21',
      time: '2:00 PM',
      duration: '1.5 hours',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'System Design Review',
      date: '2025-01-22',
      time: '4:00 PM',
      duration: '1 hour',
      status: 'upcoming'
    }
  ]);

  const handleGenerateWithAI = () => {
    toast.info('AI study plan generation coming soon!');
  };

  const toggleGoal = (id) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const weeklyProgress = {
    completed: 12,
    total: 20,
    percentage: 60
  };

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className="min-h-screen bg-[#030712]">
      <Header />
      <main className="px-6 md:px-12 lg:px-24 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Study Planner
                </h1>
                <p className="text-lg text-muted-foreground">
                  Plan your learning journey with AI-powered insights
                </p>
              </div>
              <Button
                data-testid="ai-generate-plan-btn"
                className="gap-2 bg-primary hover:bg-primary/90"
                onClick={handleGenerateWithAI}
              >
                <Sparkles className="h-4 w-4" />
                Generate AI Plan
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Calendar & Stats */}
            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Study Calendar
                </h2>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                />
              </Card>

              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Weekly Progress
                </h2>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {weeklyProgress.percentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {weeklyProgress.completed} of {weeklyProgress.total} goals completed
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Study Hours</span>
                    <span className="font-medium">15/20</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Topics Covered</span>
                    <span className="font-medium">8/12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Streak</span>
                    <span className="font-medium">7 days 🔥</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Goals & Sessions */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="goals">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="goals">Today's Goals</TabsTrigger>
                  <TabsTrigger value="sessions">Study Sessions</TabsTrigger>
                </TabsList>

                <TabsContent value="goals" className="mt-6">
                  <Card className="p-6 bg-card border-border">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Daily Goals
                      </h2>
                      <Button 
                        data-testid="add-goal-btn"
                        variant="outline" 
                        size="sm"
                        onClick={() => toast.info('Add goal feature coming soon!')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Goal
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {goals.map((goal) => (
                        <div
                          key={goal.id}
                          data-testid={`goal-${goal.id}`}
                          className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                        >
                          <Checkbox
                            checked={goal.completed}
                            onCheckedChange={() => toggleGoal(goal.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className={`font-medium ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {goal.text}
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${priorityColors[goal.priority]}`} />
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="sessions" className="mt-6">
                  <Card className="p-6 bg-card border-border">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Upcoming Sessions
                      </h2>
                      <Button 
                        data-testid="schedule-session-btn"
                        variant="outline" 
                        size="sm"
                        onClick={() => toast.info('Schedule session feature coming soon!')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {studySessions.map((session) => (
                        <Card
                          key={session.id}
                          data-testid={`session-${session.id}`}
                          className="p-4 bg-secondary/30 border-border hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold">{session.title}</h3>
                            <Badge variant="outline">{session.status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {session.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {session.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {session.duration}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* AI Suggestions */}
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      AI Recommendation
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Based on your progress, we recommend focusing on Data Structures this week. 
                      You're 80% complete with React patterns - great job!
                    </p>
                    <Button 
                      data-testid="view-recommendations-btn"
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.info('AI recommendations coming soon!')}
                    >
                      View Full Recommendations
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
