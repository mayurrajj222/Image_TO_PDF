
"use client";

import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useState, ChangeEvent, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FileDropzoneProps {
  onFileDrop: (file: File) => void;
  acceptedFileTypes?: string; // e.g., "image/*,.pdf"
  currentFile: File | null;
  clearFile: () => void;
  filePreview: string | null;
}

export function FileDropzone({ onFileDrop, acceptedFileTypes = "image/*,.pdf", currentFile, clearFile, filePreview }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileDrop(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onFileDrop(event.dataTransfer.files[0]);
    }
  }, [onFileDrop]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  if (currentFile) {
    return (
      <Card className="w-full max-w-lg shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Uploaded File</h3>
            <Button variant="ghost" size="icon" onClick={clearFile} aria-label="Remove file">
              <X className="h-5 w-5" />
            </Button>
          </div>
          {filePreview && currentFile.type.startsWith('image/') ? (
            <Image 
              src={filePreview} 
              alt={currentFile.name} 
              width={128} 
              height={128} 
              className="mx-auto mb-2 rounded-md object-contain max-h-32"
              data-ai-hint="file preview"
            />
          ) : (
            <FileIcon className="w-16 h-16 mx-auto mb-2 text-primary" />
          )}
          <p className="text-sm text-muted-foreground truncate" title={currentFile.name}>{currentFile.name}</p>
          <p className="text-xs text-muted-foreground">{(currentFile.size / 1024).toFixed(2)} KB</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`w-full max-w-lg border-2 border-dashed hover:border-primary transition-all duration-300 ease-in-out shadow-md ${isDragging ? 'border-primary bg-accent/10' : 'border-border'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      role="button"
      tabIndex={0}
      onClick={() => document.getElementById('fileInput')?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('fileInput')?.click(); }}
      aria-label="File upload area"
    >
      <CardContent className="p-8 text-center">
        <UploadCloud className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Drop File Here</h3>
        <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
        <input
          id="fileInput"
          type="file"
          className="hidden"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
        />
        <p className="text-xs text-muted-foreground">Supports: Images (JPG, PNG, WebP), PDF</p>
      </CardContent>
    </Card>
  );
}
