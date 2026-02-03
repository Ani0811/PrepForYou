'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BookOpen, FileText, Search } from 'lucide-react';

export default function StudyGuidePage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight gradient-text transition-all duration-300 pb-2 leading-tight">
          Study Guide
        </h1>
        <p className="text-muted-foreground text-lg font-sans max-w-2xl leading-relaxed">
          Review key concepts and essential information to master your courses.
        </p>
      </div>

      <Card className="backdrop-blur-sm gradient-card border-gradient hover:shadow-gradient-md transition-all duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <BookOpen className="h-5 w-5 text-primary" />
            Study Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-300">
              <FileText className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-semibold text-lg mb-2">Course Summaries</h3>
              <p className="text-sm text-muted-foreground">Quick overview of all course materials</p>
            </div>
            <div className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-300">
              <BookOpen className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-semibold text-lg mb-2">Key Concepts</h3>
              <p className="text-sm text-muted-foreground">Essential topics you need to know</p>
            </div>
            <div className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-300">
              <Search className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-semibold text-lg mb-2">Quick Reference</h3>
              <p className="text-sm text-muted-foreground">Fast lookup for important information</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground py-12">
        <p className="text-lg font-sans">Study guide content coming soon...</p>
      </div>
    </div>
  );
}
