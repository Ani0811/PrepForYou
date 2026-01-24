import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Brain, Download, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function QuestionGenerator() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState([5]);
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const mockQuestions = [
    {
      id: 1,
      question: 'What is the virtual DOM in React?',
      options: [
        'A copy of the real DOM kept in memory',
        'A database for storing component state',
        'A styling framework',
        'A testing library'
      ],
      answer: 'A copy of the real DOM kept in memory',
      explanation: 'The virtual DOM is a lightweight copy of the real DOM that React uses to efficiently update the UI.'
    },
    {
      id: 2,
      question: 'Which hook would you use to perform side effects in a React component?',
      options: ['useState', 'useEffect', 'useContext', 'useReducer'],
      answer: 'useEffect',
      explanation: 'useEffect is specifically designed to handle side effects like data fetching, subscriptions, and DOM manipulation.'
    },
    {
      id: 3,
      question: 'What is the purpose of React.memo()?',
      options: [
        'To memorize user inputs',
        'To prevent unnecessary re-renders',
        'To store component state',
        'To create memoized selectors'
      ],
      answer: 'To prevent unnecessary re-renders',
      explanation: 'React.memo is a higher-order component that memoizes the result and only re-renders when props change.'
    }
  ];

  const handleGenerate = () => {
    if (!topic) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      setGeneratedQuestions(mockQuestions.slice(0, questionCount[0]));
      setIsGenerating(false);
      toast.success(`Generated ${questionCount[0]} questions!`);
    }, 2000);
  };

  const handleCopyQuestion = (question) => {
    const text = `Q: ${question.question}\n\nOptions:\n${question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nAnswer: ${question.answer}`;
    navigator.clipboard.writeText(text);
    toast.success('Question copied to clipboard!');
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon!');
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              AI Question Generator
            </h1>
            <p className="text-lg text-muted-foreground">
              Generate custom practice questions powered by AI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-card border-border sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Configuration
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      data-testid="topic-input"
                      placeholder="e.g., React Hooks, JavaScript, Algorithms"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="h-12 bg-secondary/50 border-transparent focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger 
                        id="difficulty"
                        data-testid="difficulty-select"
                        className="h-12 bg-secondary/50"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Question Type</Label>
                    <Select value={questionType} onValueChange={setQuestionType}>
                      <SelectTrigger 
                        id="type"
                        data-testid="question-type-select"
                        className="h-12 bg-secondary/50"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="true-false">True/False</SelectItem>
                        <SelectItem value="short-answer">Short Answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Number of Questions: {questionCount[0]}</Label>
                    <Slider
                      data-testid="question-count-slider"
                      value={questionCount}
                      onValueChange={setQuestionCount}
                      min={1}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <Button
                    data-testid="generate-questions-btn"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Questions
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Generated Questions */}
            <div className="lg:col-span-2">
              {generatedQuestions.length === 0 ? (
                <Card className="p-12 bg-card border-border text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Generate Your Questions
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Configure your preferences on the left and click "Generate Questions" to create AI-powered practice questions
                  </p>
                </Card>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Generated Questions
                    </h2>
                    <Button
                      data-testid="export-questions-btn"
                      variant="outline"
                      onClick={handleExport}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  {generatedQuestions.map((q, index) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        data-testid={`question-card-${q.id}`}
                        className="p-6 bg-card border-border"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <Badge variant="outline">Question {index + 1}</Badge>
                          <Button
                            data-testid={`copy-question-btn-${q.id}`}
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyQuestion(q)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <h3 className="text-lg font-semibold mb-4">
                          {q.question}
                        </h3>

                        <div className="space-y-2 mb-6">
                          {q.options.map((option, i) => (
                            <div
                              key={i}
                              className={`p-3 rounded-lg border transition-colors ${
                                option === q.answer
                                  ? 'border-primary/50 bg-primary/5'
                                  : 'border-border'
                              }`}
                            >
                              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                              {option}
                              {option === q.answer && (
                                <Badge className="ml-2 bg-primary">Correct</Badge>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                          <div className="text-sm font-medium text-primary mb-2">Explanation</div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
