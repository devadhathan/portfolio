'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';

export function NotesWidget() {
  const notes = [
    'Last updated',
    'Intent to demonstrate AI agent and try something cool',
    'You can write something',
  ];

  return (
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
            {notes.map((note, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 rounded-md bg-secondary/30 border border-border/20 hover:bg-secondary/40 transition-colors"
              >
                <p className="text-xs flex-1 leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

