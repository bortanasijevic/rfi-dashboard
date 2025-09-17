'use client';

import { useState } from 'react';
import { Edit3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NoteModal } from '@/components/NoteModal';

interface NoteCellProps {
  value: string;
  rfiNumber: string;
  rfiSubject: string;
  onSave: (note: string) => Promise<void>;
}

export function NoteCell({ value, rfiNumber, rfiSubject, onSave }: NoteCellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveNote = async (note: string) => {
    await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rfiNumber,
        note,
      }),
    });
    
    await onSave(note);
  };

  const hasNote = value && value.trim().length > 0;
  const displayText = value.length > 50 ? `${value.substring(0, 47)}...` : value;

  return (
    <>
      <div className="flex items-center gap-2 min-w-[200px]">
        <div 
          className="flex-1 cursor-pointer p-2 rounded border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          {hasNote ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">{displayText}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p className="whitespace-pre-wrap">{value}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Edit3 className="h-4 w-4" />
              <span className="text-sm">Add note...</span>
            </div>
          )}
        </div>
      </div>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rfiNumber={rfiNumber}
        rfiSubject={rfiSubject}
        initialNote={value}
        onSave={handleSaveNote}
      />
    </>
  );
}
