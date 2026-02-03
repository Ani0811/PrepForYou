'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BookOpen, Calendar, TrendingUp, User } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

export default function BlogsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight gradient-text transition-all duration-300 pb-2 leading-tight">
          Blogs
        </h1>
        <p className="text-muted-foreground text-lg font-sans max-w-2xl leading-relaxed">
          Read and learn from our collection of educational articles and tutorials.
        </p>
      </div>

      <Card className="backdrop-blur-sm gradient-card border-gradient hover:shadow-gradient-md transition-all duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <BookOpen className="h-5 w-5 text-primary" />
            Latest Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sample blog post card */}
            <div className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Tutorial</Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Coming Soon</span>
                </div>
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">Getting Started with Your Learning Journey</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Learn how to make the most of PrepForYou's platform and achieve your learning goals effectively.
              </p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">PrepForYou Team</span>
              </div>
            </div>

            <div className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Tips & Tricks</Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Coming Soon</span>
                </div>
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">Study Strategies for Success</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Discover effective study techniques to maximize your retention and understanding of course materials.
              </p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">PrepForYou Team</span>
              </div>
            </div>

            <div className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Success Stories</Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Coming Soon</span>
                </div>
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">How Our Students Achieve Their Goals</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Real stories from learners who transformed their careers with PrepForYou's courses.
              </p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">PrepForYou Team</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground py-12">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary/50" />
        <p className="text-lg font-sans">More blog posts coming soon...</p>
      </div>
    </div>
  );
}
