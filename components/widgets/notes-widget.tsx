'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Clock } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  lastUpdated: Date;
  isIntent?: boolean;
}

export function NotesWidget() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Get current date/time for last updated
  const websiteLastUpdated = new Date();

  const notes: Note[] = [
    {
      id: '1',
      content: `Hey there! 👋

I'm Deva-dhat-than, and I built this portfolio to showcase something a bit different - an AI-powered portfolio agent that can dynamically rearrange and curate my work based on your interests.

This isn't just a static portfolio; it's an interactive experience where you can ask questions, explore projects, and see my work organized in real-time. Think of it as a conversation with my portfolio!

I wanted to demonstrate how AI can enhance the way we present our work and make portfolios more engaging and personalized. Whether you're here to learn about my design process, explore specific projects, or just curious about the tech behind this - feel free to interact with the agent and see what happens!

Hope you enjoy exploring! 🚀`,
      lastUpdated: new Date('2024-12-19T10:30:00'),
      isIntent: true,
    },
    {
      id: '2',
      content: `Last updated: ${websiteLastUpdated.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })}`,
      lastUpdated: websiteLastUpdated,
    },
    {
      id: '3',
      content: 'Currently working from Edinburgh',
      lastUpdated: new Date('2024-12-19T08:00:00'),
    },
  ];

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDateTime(date);
  };

  return (
    <>
      <Card className="border-2 border-border/70 bg-card/60 backdrop-blur-md dark:shadow-md flex flex-col max-h-[300px]">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3 flex-1 min-h-0 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-2 pr-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`flex flex-col gap-1 p-2.5 rounded-md border transition-all cursor-pointer ${
                    note.isIntent
                      ? 'bg-primary/10 border-primary/30 hover:bg-primary/15 hover:border-primary/40'
                      : 'bg-secondary/30 border-border/20 hover:bg-secondary/40 hover:border-border/30'
                  }`}
                >
                  <p className={`text-xs flex-1 leading-relaxed ${note.isIntent ? 'font-medium' : ''}`}>
                    {note.isIntent ? '💭 Personal Message' : note.content.length > 50 ? `${note.content.substring(0, 50)}...` : note.content}
                  </p>
                  {note.id === '2' && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(note.lastUpdated)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {selectedNote?.isIntent ? '💭 Personal Message' : 'Note'}
            </DialogTitle>
            {selectedNote?.id === '2' && (
              <DialogDescription className="flex items-center gap-2 pt-2">
                <Clock className="h-3.5 w-3.5" />
                <span>Last updated: {selectedNote && formatDateTime(selectedNote.lastUpdated)}</span>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="mt-4">
            <div className={`p-4 rounded-lg ${selectedNote?.isIntent ? 'bg-primary/5 border border-primary/20' : 'bg-secondary/30 border border-border/20'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {selectedNote?.content}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

