import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle2, XCircle, Clock, Target, Brain,
  TrendingUp, Award, ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Practice() {
  const [activeTest, setActiveTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const practiceCategories = [
    { id: 1, title: 'JavaScript Fundamentals', questions: 25, difficulty: 'Easy', color: 'bg-green-500' },
    { id: 2, title: 'React Patterns', questions: 30, difficulty: 'Medium', color: 'bg-yellow-500' },
    { id: 3, title: 'System Design', questions: 20, difficulty: 'Hard', color: 'bg-red-500' },
    { id: 4, title: 'Data Structures', questions: 40, difficulty: 'Medium', color: 'bg-blue-500' },
    { id: 5, title: 'Algorithms', questions: 35, difficulty: 'Hard', color: 'bg-purple-500' },
    { id: 6, title: 'Database Design', questions: 22, difficulty: 'Medium', color: 'bg-cyan-500' }
  ];

  const mockQuestions = [
    {
      question: 'What is the output of console.log(typeof null)?',
      options: ['null', 'undefined', 'object', 'number'],
      correct: 2
    },
    {
      question: 'Which hook is used to perform side effects in React?',
      options: ['useState', 'useEffect', 'useContext', 'useReducer'],
      correct: 1
    },
    {
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correct: 1
    }
  ];

  const recentScores = [
    { test: 'JavaScript Basics', score: 92, date: '2 days ago' },
    { test: 'React Hooks', score: 88, date: '5 days ago' },
    { test: 'CSS Flexbox', score: 95, date: '1 week ago' }
  ];

  const startTest = (category) => {
    setActiveTest(category);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setSelectedAnswer('');
  };

  const submitAnswer = () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer');
      return;
    }

    const newAnswers = [...answers, { question: currentQuestion, answer: parseInt(selectedAnswer) }];
    setAnswers(newAnswers);
    setSelectedAnswer('');

    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach(answer => {
      if (mockQuestions[answer.question].correct === answer.answer) {
        correct++;
      }
    });
    return Math.round((correct / mockQuestions.length) * 100);
  };

  const resetTest = () => {
    setActiveTest(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setSelectedAnswer('');
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-[#030712]">
        <Header />
        <main className="px-6 md:px-12 lg:px-24 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-12 bg-card border-border text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Test Complete!
              </h2>
              <div className="text-6xl font-bold text-primary mb-4">{score}%</div>
              <p className="text-lg text-muted-foreground mb-8">
                You answered {answers.filter((a, i) => mockQuestions[i].correct === a.answer).length} out of {mockQuestions.length} questions correctly
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  data-testid="try-again-btn"
                  onClick={() => startTest(activeTest)} 
                  variant="outline"
                >
                  Try Again
                </Button>
                <Button 
                  data-testid="back-to-practice-btn"
                  onClick={resetTest}
                  className="bg-primary hover:bg-primary/90"
                >
                  Back to Practice
                </Button>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  if (activeTest) {
    const question = mockQuestions[currentQuestion];
    return (
      <div className="min-h-screen bg-[#030712]">
        <Header />
        <main className="px-6 md:px-12 lg:px-24 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {mockQuestions.length}
                </span>
                <Button 
                  data-testid="exit-test-btn"
                  variant="ghost" 
                  onClick={resetTest}
                >
                  Exit Test
                </Button>
              </div>
              <Progress value={((currentQuestion + 1) / mockQuestions.length) * 100} className="h-2" />
            </div>

            <Card className="p-8 bg-card border-border">
              <h2 className="text-2xl font-semibold mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {question.question}
              </h2>

              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                <div className="space-y-4">
                  {question.options.map((option, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <Button
                data-testid="submit-answer-btn"
                onClick={submitAnswer}
                className="w-full mt-8 h-12 bg-primary hover:bg-primary/90"
              >
                {currentQuestion < mockQuestions.length - 1 ? 'Next Question' : 'Finish Test'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      <Header />
      <main className="px-6 md:px-12 lg:px-24 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Practice Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Test your knowledge and track your progress
            </p>
          </div>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Tests</TabsTrigger>
              <TabsTrigger value="recent">Recent Scores</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {practiceCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: category.id * 0.1 }}
                  >
                    <Card 
                      data-testid={`practice-card-${category.id}`}
                      className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {category.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline">{category.difficulty}</Badge>
                        <span className="text-sm text-muted-foreground">{category.questions} questions</span>
                      </div>
                      <Button
                        data-testid={`start-test-btn-${category.id}`}
                        onClick={() => startTest(category)}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        Start Test
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-8">
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Recent Test Scores
                </h2>
                <div className="space-y-4">
                  {recentScores.map((score, index) => (
                    <div 
                      key={index}
                      data-testid={`recent-score-${index}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                    >
                      <div>
                        <div className="font-medium mb-1">{score.test}</div>
                        <div className="text-sm text-muted-foreground">{score.date}</div>
                      </div>
                      <div className="text-2xl font-bold text-primary">{score.score}%</div>
                    </div>
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
