'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ClipboardCheck, Target, TrendingUp, Trophy } from 'lucide-react';

export default function PracticeTestsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight gradient-text transition-all duration-300 pb-2 leading-tight">
          Practice Tests
        </h1>
        <p className="text-muted-foreground text-lg font-sans max-w-2xl leading-relaxed">
          Test your knowledge and track your progress with interactive assessments.
        </p>
      </div>

      <Card className="backdrop-blur-sm gradient-card border-gradient hover:shadow-gradient-md transition-all duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Available Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-300">
              <Target className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-semibold text-lg mb-2">Quick Quiz</h3>
              <p className="text-sm text-muted-foreground">Short assessments to check understanding</p>
            </div>
            <div className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-300">
              <TrendingUp className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-semibold text-lg mb-2">Progress Tests</h3>
              <p className="text-sm text-muted-foreground">Track your learning journey</p>
            </div>
            <div className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md transition-all duration-300">
              <Trophy className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-semibold text-lg mb-2">Final Exams</h3>
              <p className="text-sm text-muted-foreground">Comprehensive course assessments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground py-12">
        <p className="text-lg font-sans">Practice tests coming soon...</p>
      </div>
    </div>
  );
}
