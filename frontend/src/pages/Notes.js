import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, FileText, Edit, Trash2, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Notes() {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'React Hooks Summary',
      content: 'useState: Manages state in functional components\nuseEffect: Handles side effects\nuseContext: Accesses context values',
      tags: ['React', 'JavaScript'],
      date: '2 days ago',
      aiGenerated: false
    },
    {
      id: 2,
      title: 'System Design Principles',
      content: 'Scalability, Reliability, Availability, Maintainability, Efficiency',
      tags: ['System Design'],
      date: '5 days ago',
      aiGenerated: false
    },
    {
      id: 3,
      title: 'Data Structures Cheat Sheet',
      content: 'Arrays: O(1) access, O(n) insertion\nLinked Lists: O(n) access, O(1) insertion\nHash Tables: O(1) average operations',
      tags: ['Data Structures', 'Algorithms'],
      date: '1 week ago',
      aiGenerated: false
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '', tags: [] });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSaveNote = () => {
    if (!currentNote.title || !currentNote.content) {
      toast.error('Please fill in all fields');
      return;
    }

    if (editingId) {
      setNotes(notes.map(note => note.id === editingId ? { ...currentNote, id: editingId } : note));
      toast.success('Note updated!');
    } else {
      const newNote = {
        ...currentNote,
        id: Date.now(),
        date: 'Just now',
        aiGenerated: false
      };
      setNotes([newNote, ...notes]);
      toast.success('Note created!');
    }

    setIsDialogOpen(false);
    setCurrentNote({ title: '', content: '', tags: [] });
    setEditingId(null);
  };

  const handleEditNote = (note) => {
    setCurrentNote(note);
    setEditingId(note.id);
    setIsDialogOpen(true);
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    toast.success('Note deleted!');
  };

  const handleGenerateWithAI = () => {
    toast.info('AI note generation coming soon!');
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
                  Study Notes
                </h1>
                <p className="text-lg text-muted-foreground">
                  Organize your learning with smart notes
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  data-testid="ai-generate-note-btn"
                  variant="outline"
                  className="gap-2 hover:bg-primary/10"
                  onClick={handleGenerateWithAI}
                >
                  <Sparkles className="h-4 w-4" />
                  AI Generate
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      data-testid="create-note-btn"
                      className="gap-2 bg-primary hover:bg-primary/90"
                      onClick={() => {
                        setCurrentNote({ title: '', content: '', tags: [] });
                        setEditingId(null);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      New Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{editingId ? 'Edit Note' : 'Create New Note'}</DialogTitle>
                      <DialogDescription>
                        {editingId ? 'Update your note details below' : 'Add a new note to your collection'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Input
                          data-testid="note-title-input"
                          placeholder="Note title"
                          value={currentNote.title}
                          onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                          className="h-12 bg-secondary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Textarea
                          data-testid="note-content-input"
                          placeholder="Write your note here..."
                          value={currentNote.content}
                          onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                          className="min-h-[200px] bg-secondary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          data-testid="note-tags-input"
                          placeholder="Tags (comma separated)"
                          value={currentNote.tags?.join(', ') || ''}
                          onChange={(e) => setCurrentNote({ 
                            ...currentNote, 
                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                          })}
                          className="h-12 bg-secondary/50"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        data-testid="save-note-btn"
                        onClick={handleSaveNote}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {editingId ? 'Update Note' : 'Save Note'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                data-testid="search-notes-input"
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-secondary/50 border-transparent focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No notes found</p>
              </div>
            ) : (
              filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    data-testid={`note-card-${note.id}`}
                    className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold flex-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {note.title}
                      </h3>
                      <div className="flex gap-1">
                        <Button
                          data-testid={`edit-note-btn-${note.id}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditNote(note)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          data-testid={`delete-note-btn-${note.id}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4 flex-1 whitespace-pre-wrap line-clamp-4">
                      {note.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {note.tags?.map((tag, i) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                      {note.aiGenerated && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{note.date}</div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
