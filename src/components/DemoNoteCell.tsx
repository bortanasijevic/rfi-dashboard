'use client';

import { useState } from 'react';
import { FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DemoNoteCellProps {
  value: string;
  rfiNumber: string;
  rfiSubject: string;
}

export function DemoNoteCell({ value, rfiNumber, rfiSubject }: DemoNoteCellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasNote = value && value.trim().length > 0;
  const displayText = value.length > 40 ? `${value.substring(0, 37)}...` : value;

  if (!hasNote) {
    return (
      <div className="flex items-center gap-2 min-w-[150px] max-w-[200px]">
        <div className="flex-1 p-2 text-muted-foreground text-sm">
          —
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 min-w-[150px] max-w-[200px]">
        <div 
          className="flex-1 cursor-pointer p-2 rounded border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <span className="text-sm truncate">{displayText}</span>
                  {value.length > 40 && (
                    <Eye className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p className="whitespace-pre-wrap">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">Click to view in modal</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Note for RFI {rfiNumber}</DialogTitle>
            <DialogDescription className="text-sm">
              <strong>Subject:</strong> {rfiSubject}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {value}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Note: This is a read-only view in the demo version.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
