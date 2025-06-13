'use client';

import { X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface FilePreviewProps {
  file: {
    file: File;
    preview?: string;
    type: 'image' | 'document';
  };
  onRemove: () => void;
}

export default function FilePreview({ file, onRemove }: FilePreviewProps) {
  return (
    <div className="relative inline-block">
      {file.type === 'image' && file.preview ? (
        <div className="relative">
          <Image
            src={file.preview}
            alt={file.file.name}
            className="h-20 w-20 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="relative flex items-center gap-2 p-2 bg-gray-100 rounded-lg border max-w-xs">
          <FileText className="h-4 w-4 text-gray-600" />
          <span className="text-sm truncate">{file.file.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-4 w-4 p-0 ml-auto"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}