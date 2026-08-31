'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  DRAW_TEXT_FONT,
  DRAW_TEXT_LINE_HEIGHT,
  measureTextWidth,
  textLines,
  type DrawTextItem,
} from '@/lib/draw-export';

type DrawTextLayerProps = {
  items: DrawTextItem[];
  onChange: (items: DrawTextItem[]) => void;
  /** Text tool in hand: the layer takes pointer events off the ink surface. */
  active: boolean;
  color: string;
  size: number;
};

/** Below the drawesome toolbar (z-index 30), above its drawing surface. */
const LAYER_Z = 10;
const DRAG_THRESHOLD = 4;

function newId() {
  return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function DrawTextLayer({ items, onChange, active, color, size }: DrawTextLayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);

  const commit = useCallback(() => {
    setEditingId((current) => {
      if (current) onChange(items.filter((item) => item.text.trim()));
      return null;
    });
  }, [items, onChange]);

  // Leaving the tool shouldn't strand an open, empty caret on the board.
  useEffect(() => {
    if (!active && editingId) commit();
  }, [active, commit, editingId]);

  useEffect(() => {
    if (!editingId) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, [editingId]);

  const startNew = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!active || event.target !== rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const item: DrawTextItem = {
      id: newId(),
      // Nudge up so the caret lands where the click did, not below it.
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top - (size * DRAW_TEXT_LINE_HEIGHT) / 2),
      text: '',
      color,
      size,
    };
    onChange([...items.filter((existing) => existing.text.trim()), item]);
    setEditingId(item.id);
  };

  const handleItemPointerDown = (event: React.PointerEvent<HTMLDivElement>, item: DrawTextItem) => {
    if (!active || editingId === item.id) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id: item.id, dx: event.clientX - item.x, dy: event.clientY - item.y, moved: false };
  };

  const handleItemPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const x = Math.round(event.clientX - drag.dx);
    const y = Math.round(event.clientY - drag.dy);
    const item = items.find((candidate) => candidate.id === drag.id);
    if (!item) return;
    if (!drag.moved && Math.abs(item.x - x) < DRAG_THRESHOLD && Math.abs(item.y - y) < DRAG_THRESHOLD) {
      return;
    }
    drag.moved = true;
    onChange(items.map((candidate) => (candidate.id === drag.id ? { ...candidate, x, y } : candidate)));
  };

  const handleItemPointerUp = (event: React.PointerEvent<HTMLDivElement>, item: DrawTextItem) => {
    const drag = dragRef.current;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag && !drag.moved) setEditingId(item.id);
  };

  const update = (id: string, text: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const remove = (id: string) => {
    if (editingId === id) setEditingId(null);
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div
      ref={rootRef}
      onPointerDown={startNew}
      className="absolute inset-0 overflow-hidden rounded-[inherit]"
      style={{ zIndex: LAYER_Z, pointerEvents: active ? 'auto' : 'none', cursor: active ? 'text' : undefined }}
    >
      {items.map((item) => {
        const editing = editingId === item.id;
        const shared: React.CSSProperties = {
          position: 'absolute',
          left: item.x,
          top: item.y,
          color: item.color,
          font: `${item.size}px ${DRAW_TEXT_FONT}`,
          lineHeight: DRAW_TEXT_LINE_HEIGHT,
          whiteSpace: 'pre',
          margin: 0,
        };

        if (editing) {
          return (
            <textarea
              key={item.id}
              ref={inputRef}
              value={item.text}
              rows={textLines(item).length}
              onChange={(event) => update(item.id, event.target.value)}
              onBlur={commit}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === 'Escape') {
                  event.preventDefault();
                  commit();
                }
              }}
              spellCheck={false}
              className="resize-none border-0 bg-transparent p-0 outline-none"
              style={{
                ...shared,
                width: Math.max(measureTextWidth(item) + item.size, item.size * 4),
                overflow: 'hidden',
                caretColor: item.color,
              }}
            />
          );
        }

        return (
          <div
            key={item.id}
            style={{ ...shared, cursor: active ? 'move' : 'default', touchAction: 'none' }}
            className="group/text select-none"
            onPointerDown={(event) => handleItemPointerDown(event, item)}
            onPointerMove={handleItemPointerMove}
            onPointerUp={(event) => handleItemPointerUp(event, item)}
          >
            {item.text}
            {active ? (
              <button
                type="button"
                aria-label="Delete text"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => remove(item.id)}
                className="absolute -right-2 -top-2 hidden h-5 w-5 translate-x-full items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground shadow-sm group-hover/text:flex hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
