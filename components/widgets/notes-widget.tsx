'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, FileText } from 'lucide-react';

export function NotesWidget() {
  const [notes, setNotes] = useState<string[]>([
    'Design system updates needed',
    'Review prototype feedback',
    'Schedule user testing',
  ]);
  const [newNote, setNewNote] = useState('');

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote]);
      setNewNote('');
    }
  };

  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  return (
    <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md dark:shadow-md h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3 flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          <div className="space-y-2">
            {notes.map((note, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 rounded-md bg-secondary/30 border border-border/20 hover:bg-secondary/40 transition-colors group"
              >
                <p className="text-xs flex-1 leading-relaxed">{note}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={() => removeNote(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0 pt-2 border-t border-border/20">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addNote()}
            placeholder="Add note..."
            className="h-8 text-xs"
          />
          <Button size="icon" onClick={addNote} className="h-8 w-8 flex-shrink-0">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

