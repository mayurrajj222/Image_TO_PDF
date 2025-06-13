
"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, FileImage } from 'lucide-react'; // Added FileImage
import type { ConversionResult } from '@/lib/client-converters';


interface ResultsDisplayProps {
  results: ConversionResult[];
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results || results.length === 0) return null;

  const handleDownload = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-lg mt-6 space-y-4">
      <h2 className="text-2xl font-semibold text-center text-foreground">Conversion Results</h2>
      {results.map((result, index) => (
        <Card key={index} className="shadow-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg truncate flex items-center">
              {result.type.startsWith('image/') ? <FileImage className="w-5 h-5 mr-2 text-primary" /> : <FileText className="w-5 h-5 mr-2 text-primary" />}
              {result.name}
            </CardTitle>
            <CardDescription>{result.type}</CardDescription>
          </CardHeader>
          {result.type.startsWith('image/') && (
            <CardContent className="flex justify-center p-4 bg-muted/30">
              <Image
                src={result.dataUrl}
                alt={`Preview of ${result.name}`}
                width={200}
                height={200}
                className="rounded-md object-contain max-h-48"
                data-ai-hint="file preview"
              />
            </CardContent>
          )}
          <CardFooter>
            <Button 
              onClick={() => handleDownload(result.dataUrl, result.name)} 
              className="w-full"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download {result.name.substring(result.name.lastIndexOf('.') + 1).toUpperCase()}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
