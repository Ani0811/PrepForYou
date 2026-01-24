import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, Mail, Calendar, Trophy, Target, 
  BookOpen, Clock, TrendingUp, Award, Edit2
} from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: 'January 2025',
    bio: 'Aspiring full-stack developer preparing for technical interviews'
  });

  const stats = [
    { icon: Target, label: 'Questions Completed', value: '245', color: 'text-primary' },
    { icon: Clock, label: 'Study Hours', value: '48.5', color: 'text-accent' },
    { icon: BookOpen, label: 'Notes Created', value: '32', color: 'text-green-500' },
    { icon: Trophy, label: 'Tests Passed', value: '18', color: 'text-yellow-500' }
  ];

  const achievements = [
    { title: '7 Day Streak', icon: '🔥', unlocked: true },
    { title: 'Early Bird', icon: '🌅', unlocked: true },
    { title: 'Knowledge Seeker', icon: '📚', unlocked: true },
    { title: 'Practice Master', icon: '🎯', unlocked: false },
    { title: 'Speed Demon', icon: '⚡', unlocked: false },
    { title: 'Perfect Score', icon: '💯', unlocked: false }
  ];

  const recentActivity = [
    { action: 'Completed JavaScript Test', date: '2 hours ago', score: 92 },
    { action: 'Created React Study Notes', date: '5 hours ago', score: null },
    { action: 'Generated Algorithm Questions', date: '1 day ago', score: null },
    { action: 'Completed Data Structures Test', date: '2 days ago', score: 88 }
  ];

  const skillProgress = [
    { skill: 'JavaScript', progress: 85, level: 'Advanced' },
    { skill: 'React', progress: 75, level: 'Intermediate' },
    { skill: 'System Design', progress: 60, level: 'Intermediate' },
    { skill: 'Data Structures', progress: 70, level: 'Intermediate' },
    { skill: 'Algorithms', progress: 65, level: 'Intermediate' }
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-[#030712]">
      <Header />
      <main className="px-6 md:px-12 lg:px-24 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Profile Header */}
          <Card className="p-8 bg-card border-border mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {userInfo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        data-testid="profile-name-input"
                        value={userInfo.name}
                        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                        className="h-10 bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        data-testid="profile-bio-input"
                        value={userInfo.bio}
                        onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                        className="h-10 bg-secondary/50"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {userInfo.name}
                    </h1>
                    <p className="text-muted-foreground mb-4">{userInfo.bio}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {userInfo.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {userInfo.joinDate}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      data-testid="save-profile-btn"
                      onClick={handleSaveProfile}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Save Changes
                    </Button>
                    <Button
                      data-testid="cancel-edit-btn"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    data-testid="edit-profile-btn"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  data-testid={`profile-stat-${index}`}
                  className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      data-testid={`activity-${index}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                    >
                      <div>
                        <div className="font-medium mb-1">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">{activity.date}</div>
                      </div>
                      {activity.score && (
                        <Badge className="bg-primary">{activity.score}%</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Skill Progress
                </h2>
                <div className="space-y-6">
                  {skillProgress.map((skill, index) => (
                    <div key={index} data-testid={`skill-${index}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{skill.skill}</div>
                        <Badge variant="outline">{skill.level}</Badge>
                      </div>
                      <Progress value={skill.progress} className="h-2 mb-1" />
                      <div className="text-sm text-muted-foreground">{skill.progress}% mastered</div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Achievements
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <Card
                      key={index}
                      data-testid={`achievement-${index}`}
                      className={`p-6 text-center transition-all ${
                        achievement.unlocked
                          ? 'bg-secondary/50 border-primary/30'
                          : 'bg-secondary/20 border-border opacity-50'
                      }`}
                    >
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <div className="font-medium text-sm">{achievement.title}</div>
                      {achievement.unlocked && (
                        <Badge className="mt-2 bg-primary">Unlocked</Badge>
                      )}
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
