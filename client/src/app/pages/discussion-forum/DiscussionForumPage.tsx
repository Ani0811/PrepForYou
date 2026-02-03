'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { MessageSquare, Users, HelpCircle, TrendingUp } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

export default function DiscussionForumPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight gradient-text transition-all duration-300 pb-2 leading-tight">
          Discussion Forum
        </h1>
        <p className="text-muted-foreground text-lg font-sans max-w-2xl leading-relaxed">
          Connect with fellow learners, ask questions, and share knowledge with the community.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="default" className="gradient-bg-primary">
            <MessageSquare className="h-4 w-4 mr-2" />
            New Discussion
          </Button>
        </div>
      </div>

      <Card className="backdrop-blur-sm gradient-card border-gradient hover:shadow-gradient-md transition-all duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Users className="h-5 w-5 text-primary" />
            Popular Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sample discussion thread */}
            <div className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">General</Badge>
                  <Badge variant="outline" className="text-xs">12 replies</Badge>
                </div>
                <span className="text-xs text-muted-foreground">2 days ago</span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Welcome to the Discussion Forum!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Introduce yourself and share what courses you're interested in learning.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>Started by PrepForYou Team</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Help</Badge>
                  <Badge variant="outline" className="text-xs">5 replies</Badge>
                </div>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">How to Get Started?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tips and tricks for making the most of your learning experience on PrepForYou.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" />
                  <span>Common Questions</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Study Tips</Badge>
                  <Badge variant="outline" className="text-xs">8 replies</Badge>
                </div>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Share Your Study Strategies</h3>
              <p className="text-sm text-muted-foreground mb-4">
                What techniques have helped you succeed in your courses? Share your experience!
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Trending Discussion</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground py-12">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary/50" />
        <p className="text-lg font-sans">More discussions coming soon...</p>
      </div>
    </div>
  );
}
