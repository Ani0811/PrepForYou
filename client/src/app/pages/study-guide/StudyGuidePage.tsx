'use client';

import { useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
  getAllStudyGuides,
  getStudyGuideById,
  reviewFlashcard,
  getFlashcardsForReview,
  type StudyGuide,
  type StudyGuideSummary,
  type Flashcard,
} from '../../api/studyGuideApi';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { Skeleton } from '../../components/ui/skeleton';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import {
  BookOpen,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Lightbulb,
  BookMarked,
  Layers,
  RefreshCw,
  Brain,
  ArrowLeft,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────

export default function StudyGuidePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Guide list
  const [guides, setGuides] = useState<StudyGuideSummary[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected / detail view
  const [selectedGuide, setSelectedGuide] = useState<StudyGuide | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);

  // Active tab inside detail view
  const [activeTab, setActiveTab] = useState('overview');
  const [detailSearch, setDetailSearch] = useState('');

  // Flashcard state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewCards, setReviewCards] = useState<Flashcard[]>([]);
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  // ── Auth ────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // ── Load guide list ─────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllStudyGuides();
        setGuides(data);
      } catch {
        toast.error('Failed to load study guides');
      } finally {
        setIsLoadingList(false);
      }
    })();
  }, []);

  // ── Open a guide ───────────────────────────────────────────────────

  const openGuide = async (id: string) => {
    setIsLoadingGuide(true);
    setSelectedGuide(null);
    setActiveTab('overview');
    setDetailSearch('');
    setFlashcardIndex(0);
    setIsFlipped(false);
    setReviewMode(false);
    setReviewCards([]);
    try {
      const guide = await getStudyGuideById(id);
      setSelectedGuide(guide);
    } catch {
      toast.error('Failed to load study guide');
    } finally {
      setIsLoadingGuide(false);
    }
  };

  const closeGuide = () => {
    setSelectedGuide(null);
    setIsLoadingGuide(false);
  };

  // ── Flashcard handlers ────────────────────────────────────────────

  const handleRateFlashcard = async (rating: number) => {
    if (!user) return;
    const cards = reviewMode ? reviewCards : (selectedGuide?.flashcards ?? []);
    const card = cards[flashcardIndex];
    if (!card) return;
    try {
      await reviewFlashcard(card.id, user.uid, rating);
    } catch {
      /* silently skip */
    }
    setIsFlipped(false);
    if (flashcardIndex < cards.length - 1) {
      setFlashcardIndex((i) => i + 1);
    } else {
      toast.success('Great job! You reviewed all flashcards. 🎉');
      setFlashcardIndex(0);
    }
  };

  const handleStartReview = async () => {
    if (!user || !selectedGuide) return;
    setIsLoadingReview(true);
    try {
      const due = await getFlashcardsForReview(selectedGuide.id, user.uid);
      if (due.length === 0) {
        toast.info('No flashcards due for review right now — come back later!');
        return;
      }
      setReviewCards(due);
      setReviewMode(true);
      setFlashcardIndex(0);
      setIsFlipped(false);
      toast.info(`${due.length} card${due.length === 1 ? '' : 's'} due for review.`);
    } catch {
      toast.error('Failed to load review queue');
    } finally {
      setIsLoadingReview(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────

  const filteredGuides = useMemo(() => {
    if (!searchQuery) return guides;
    const q = searchQuery.toLowerCase();
    return guides.filter((g) => g.title.toLowerCase().includes(q));
  }, [guides, searchQuery]);

  const filteredConcepts = useMemo(() => {
    if (!selectedGuide) return [];
    const q = detailSearch.toLowerCase();
    if (!q) return selectedGuide.keyConcepts;
    return selectedGuide.keyConcepts.filter(
      (c) => c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q)
    );
  }, [selectedGuide, detailSearch]);

  const filteredRefs = useMemo(() => {
    if (!selectedGuide) return [];
    const q = detailSearch.toLowerCase();
    if (!q) return selectedGuide.quickRefs;
    return selectedGuide.quickRefs.filter(
      (r) => r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q)
    );
  }, [selectedGuide, detailSearch]);

  const currentCards = reviewMode ? reviewCards : (selectedGuide?.flashcards ?? []);
  const currentCard = currentCards[flashcardIndex];
  const flashcardProgress = currentCards.length > 0 ? ((flashcardIndex + 1) / currentCards.length) * 100 : 0;

  // ── List loading skeleton ───────────────────────────────────────────

  if (isLoadingList) {
    return (
      <div className="space-y-8 pb-10">
        <div className="space-y-2">
          <Skeleton className="h-14 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 w-full" />)}
        </div>
      </div>
    );
  }

  // ── Guide detail loading ──────────────────────────────────────────

  if (isLoadingGuide) {
    return (
      <div className="space-y-8 pb-10">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-8 w-64" />
        <Card className="backdrop-blur-sm gradient-card border-gradient">
          <CardContent className="py-10 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Detail view ─────────────────────────────────────────────────

  if (selectedGuide) {
    return (
      <div className="space-y-6 pb-10">
        <Button variant="ghost" className="gap-2 -ml-2" onClick={closeGuide}>
          <ArrowLeft className="h-4 w-4" />
          All Study Guides
        </Button>

        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight gradient-text transition-all duration-300 pb-1 leading-tight">
            {selectedGuide.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            {selectedGuide.keyConcepts.length} concepts · {selectedGuide.quickRefs.length} references ·{' '}
            {selectedGuide.flashcards.length} flashcards
          </p>
        </div>

        <Card className="backdrop-blur-sm gradient-card border-gradient">
          <CardContent className="pt-4">
            <Tabs
              value={activeTab}
              onValueChange={(t) => { setActiveTab(t); setDetailSearch(''); }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                <TabsList className="h-auto flex-wrap gap-1">
                  <TabsTrigger value="overview" className="gap-1.5">
                    <FileText className="h-4 w-4" /> Overview
                  </TabsTrigger>
                  <TabsTrigger value="concepts" className="gap-1.5">
                    <Lightbulb className="h-4 w-4" /> Key Concepts
                    <Badge variant="secondary" className="text-xs ml-1">{selectedGuide.keyConcepts.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="references" className="gap-1.5">
                    <BookOpen className="h-4 w-4" /> Quick Reference
                    <Badge variant="secondary" className="text-xs ml-1">{selectedGuide.quickRefs.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="flashcards" className="gap-1.5">
                    <Layers className="h-4 w-4" /> Flashcards
                    <Badge variant="secondary" className="text-xs ml-1">{selectedGuide.flashcards.length}</Badge>
                  </TabsTrigger>
                </TabsList>

                {(activeTab === 'concepts' || activeTab === 'references') && (
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search…"
                      value={detailSearch}
                      onChange={(e) => setDetailSearch(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-6">
                {selectedGuide.overview && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedGuide.overview}</p>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {selectedGuide.summary}
                </div>
                <div className="grid gap-4 sm:grid-cols-3 pt-2">
                  <button onClick={() => setActiveTab('concepts')} className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md hover:border-primary/40 transition-all duration-300 text-left">
                    <Lightbulb className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-display font-semibold text-base mb-1">Key Concepts</h3>
                    <p className="text-xs text-muted-foreground">{selectedGuide.keyConcepts.length} essential topics</p>
                  </button>
                  <button onClick={() => setActiveTab('references')} className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md hover:border-primary/40 transition-all duration-300 text-left">
                    <BookOpen className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-display font-semibold text-base mb-1">Quick Reference</h3>
                    <p className="text-xs text-muted-foreground">{selectedGuide.quickRefs.length} cheatsheet items</p>
                  </button>
                  <button onClick={() => setActiveTab('flashcards')} className="p-6 rounded-lg border gradient-card hover:shadow-gradient-md hover:border-primary/40 transition-all duration-300 text-left">
                    <Layers className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-display font-semibold text-base mb-1">Flashcards</h3>
                    <p className="text-xs text-muted-foreground">{selectedGuide.flashcards.length} review cards</p>
                  </button>
                </div>
              </TabsContent>

              {/* Key Concepts */}
              <TabsContent value="concepts">
                {filteredConcepts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                    <Brain className="h-12 w-12 opacity-30" />
                    <p className="text-sm">{detailSearch ? `No concepts matching "​${detailSearch}"` : 'No key concepts available'}</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredConcepts.map((concept) => (
                      <div key={concept.id} className="p-4 rounded-lg border gradient-card hover:border-primary/40 transition-all duration-200">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-sm leading-tight">{concept.term}</h4>
                          <div className="flex gap-1 flex-wrap justify-end shrink-0">
                            {concept.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{concept.definition}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Quick Reference */}
              <TabsContent value="references">
                {filteredRefs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                    <BookOpen className="h-12 w-12 opacity-30" />
                    <p className="text-sm">{detailSearch ? `No references matching "​${detailSearch}"` : 'No quick references available'}</p>
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-2">
                    {filteredRefs.map((ref) => (
                      <AccordionItem key={ref.id} value={ref.id} className="border gradient-card rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-3 text-left">
                            <span className="font-semibold text-sm">{ref.title}</span>
                            <div className="flex gap-1">
                              {ref.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <pre className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed font-sans py-2">{ref.content}</pre>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabsContent>

              {/* Flashcards */}
              <TabsContent value="flashcards">
                {currentCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                    <Layers className="h-12 w-12 opacity-30" />
                    <p className="text-sm">No flashcards available</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          Card {flashcardIndex + 1} of {currentCards.length}
                          {reviewMode && <span className="ml-2 text-primary font-medium">(Review mode)</span>}
                        </span>
                        {currentCard && (
                          <Badge variant={currentCard.difficulty === 'easy' ? 'default' : currentCard.difficulty === 'hard' ? 'destructive' : 'secondary'} className="text-xs">
                            {currentCard.difficulty}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {reviewMode && (
                          <Button variant="ghost" size="sm" onClick={() => { setReviewMode(false); setFlashcardIndex(0); setIsFlipped(false); }}>All Cards</Button>
                        )}
                        <Button variant="outline" size="sm" className="gap-2" onClick={handleStartReview} disabled={isLoadingReview}>
                          {isLoadingReview ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                          Review Due
                        </Button>
                      </div>
                    </div>

                    <div className="cursor-pointer select-none" style={{ perspective: '1000px' }} onClick={() => setIsFlipped((f) => !f)}>
                      <div className="relative w-full min-h-52 transition-all duration-500" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                        <div className="absolute inset-0 p-8 rounded-xl border gradient-card flex flex-col items-center justify-center gap-3" style={{ backfaceVisibility: 'hidden' }}>
                          <Badge variant="outline" className="text-xs">Question</Badge>
                          <p className="text-lg font-display font-semibold text-center leading-relaxed">{currentCard?.front}</p>
                          {currentCard?.tags.length ? (
                            <div className="flex gap-1 flex-wrap justify-center mt-1">
                              {currentCard.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                            </div>
                          ) : null}
                          <p className="text-xs text-muted-foreground mt-3">Click to reveal answer</p>
                        </div>
                        <div className="absolute inset-0 p-8 rounded-xl border border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-3" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                          <Badge variant="default" className="text-xs">Answer</Badge>
                          <p className="text-base text-center leading-relaxed">{currentCard?.back}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <Button variant="outline" size="sm" onClick={() => { setFlashcardIndex((i) => Math.max(0, i - 1)); setIsFlipped(false); }} disabled={flashcardIndex === 0}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {isFlipped ? (
                        <div className="flex gap-2 flex-wrap justify-center">
                          <Button size="sm" variant="destructive" className="gap-1 text-xs" onClick={() => handleRateFlashcard(1)}><X className="h-3 w-3" /> Again</Button>
                          <Button size="sm" variant="outline" className="gap-1 text-xs border-orange-500/50 text-orange-400 hover:text-orange-300" onClick={() => handleRateFlashcard(2)}>Hard</Button>
                          <Button size="sm" variant="outline" className="gap-1 text-xs border-blue-500/50 text-blue-400 hover:text-blue-300" onClick={() => handleRateFlashcard(3)}>Good</Button>
                          <Button size="sm" variant="outline" className="gap-1 text-xs border-green-500/50 text-green-400 hover:text-green-300" onClick={() => handleRateFlashcard(4)}><Check className="h-3 w-3" /> Easy</Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => setIsFlipped(true)}><RotateCcw className="h-4 w-4" /> Reveal Answer</Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => { setFlashcardIndex((i) => Math.min(currentCards.length - 1, i + 1)); setIsFlipped(false); }} disabled={flashcardIndex === currentCards.length - 1}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <Progress value={flashcardProgress} className="h-1.5" />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight gradient-text transition-all duration-300 pb-2 leading-tight">
          Study Guide
        </h1>
        <p className="text-muted-foreground text-lg font-sans max-w-2xl leading-relaxed">
          Browse study guides with key concepts, quick references, and flashcards.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search study guides…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredGuides.length === 0 ? (
        <Card className="backdrop-blur-sm gradient-card border-gradient">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
            <BookMarked className="h-16 w-16 text-muted-foreground opacity-40" />
            <h3 className="text-xl font-display font-semibold">
              {searchQuery ? `No guides matching "​${searchQuery}"` : 'No study guides yet'}
            </h3>
            {!searchQuery && (
              <p className="text-muted-foreground text-center max-w-md">
                Study guides will appear here once they're created.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide) => (
            <button
              key={guide.id}
              onClick={() => openGuide(guide.id)}
              className="text-left p-6 rounded-xl border gradient-card hover:shadow-gradient-md hover:border-primary/40 transition-all duration-300 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <BookMarked className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                {!guide.isPublished && (
                  <Badge variant="outline" className="text-xs shrink-0">Draft</Badge>
                )}
              </div>
              <h3 className="font-display font-semibold text-base leading-snug">{guide.title}</h3>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Lightbulb className="h-3.5 w-3.5" />{guide._count.keyConcepts} concepts</span>
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{guide._count.quickRefs} refs</span>
                <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{guide._count.flashcards} cards</span>
              </div>
              <p className="text-xs text-muted-foreground/60">
                Updated {new Date(guide.updatedAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}