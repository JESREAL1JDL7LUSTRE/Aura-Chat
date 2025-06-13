'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';

interface ReactionPickerProps {
  onReact: (emoji: string) => void;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '😠'];

export default function ReactionPicker({ onReact }: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div className="relative" ref={pickerRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPicker(!showPicker)}
        className="h-6 w-6 p-0"
      >
        <Smile className="h-3 w-3" />
      </Button>

      {showPicker && (
        <div className="absolute bottom-full mb-1 left-0 bg-white border rounded-lg shadow-lg p-2 flex gap-1 z-50">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(emoji);
                setShowPicker(false);
              }}
              className="hover:bg-gray-100 p-1 rounded text-lg transition-colors"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}