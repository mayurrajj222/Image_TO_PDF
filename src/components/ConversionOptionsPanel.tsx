
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileImage, Minimize2, FileUp, Images, Wand2, FileText } from 'lucide-react';

export type ConversionOperation = 
  | 'CONVERT_IMAGE' 
  | 'COMPRESS_IMAGE' 
  | 'IMAGE_TO_PDF' 
  | 'PDF_TO_IMAGES'
  | 'COMPRESS_PDF';

export interface ConversionConfig {
  operation: ConversionOperation;
  imageTargetFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
  targetSizeKB?: number; 
}

interface ConversionOptionsPanelProps {
  fileType: 'image' | 'pdf' | null;
  onConvert: (config: ConversionConfig) => void;
  isLoading: boolean;
}

export function ConversionOptionsPanel({ fileType, onConvert, isLoading }: ConversionOptionsPanelProps) {
  const [selectedOperation, setSelectedOperation] = React.useState<ConversionOperation | null>(null);
  const [imageTargetFormat, setImageTargetFormat] = React.useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [targetImageSizeKB, setTargetImageSizeKB] = React.useState<number>(100);
  const [targetPdfSizeKB, setTargetPdfSizeKB] = React.useState<number>(500);

  React.useEffect(() => {
    setSelectedOperation(null); 
  }, [fileType]);

  const handleOperationChange = (value: string) => {
    setSelectedOperation(value as ConversionOperation);
  };
  
  const handleConvertClick = () => {
    if (selectedOperation) {
      const currentConfig: ConversionConfig = { operation: selectedOperation };
      if (selectedOperation === 'CONVERT_IMAGE') {
        currentConfig.imageTargetFormat = imageTargetFormat;
      } else if (selectedOperation === 'COMPRESS_IMAGE') {
        currentConfig.targetSizeKB = targetImageSizeKB;
      } else if (selectedOperation === 'COMPRESS_PDF') {
        currentConfig.targetSizeKB = targetPdfSizeKB;
      }
      onConvert(currentConfig);
    }
  };

  if (!fileType) return null;

  return (
    <Card className="w-full max-w-lg mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="w-6 h-6 mr-2 text-primary" />
          Conversion Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup onValueChange={handleOperationChange} value={selectedOperation || ""}>
          {fileType === 'image' && (
            <>
              <div className="flex items-center space-x-3 p-3 rounded-md border hover:bg-accent/5 has-[:checked]:bg-accent/10 has-[:checked]:border-primary transition-all">
                <RadioGroupItem value="CONVERT_IMAGE" id="op-convert-image" />
                <Label htmlFor="op-convert-image" className="flex-grow cursor-pointer">
                  <div className="flex items-center">
                    <FileImage className="w-5 h-5 mr-2 text-primary" /> Convert Image Format
                  </div>
                </Label>
              </div>
              {selectedOperation === 'CONVERT_IMAGE' && (
                <div className="pl-8 my-2">
                  <Select value={imageTargetFormat} onValueChange={(value) => setImageTargetFormat(value as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select output format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image/jpeg">JPEG</SelectItem>
                      <SelectItem value="image/png">PNG</SelectItem>
                      <SelectItem value="image/webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-3 p-3 rounded-md border hover:bg-accent/5 has-[:checked]:bg-accent/10 has-[:checked]:border-primary transition-all">
                <RadioGroupItem value="COMPRESS_IMAGE" id="op-compress-image" />
                <Label htmlFor="op-compress-image" className="flex-grow cursor-pointer">
                  <div className="flex items-center">
                     <Minimize2 className="w-5 h-5 mr-2 text-primary" /> Compress Image
                  </div>
                </Label>
              </div>
              {selectedOperation === 'COMPRESS_IMAGE' && (
                <div className="pl-8 my-2 space-y-2">
                  <Label htmlFor="targetImageSizeKB" className="text-sm font-medium">Target Size (KB)</Label>
                  <Input
                    id="targetImageSizeKB"
                    type="number"
                    value={targetImageSizeKB}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setTargetImageSizeKB(isNaN(value) || value <= 0 ? 1 : value);
                    }}
                    placeholder="e.g., 100"
                    min="1"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground pl-1">Enter desired approximate size in kilobytes.</p>
                </div>
              )}
              
              <div className="flex items-center space-x-3 p-3 rounded-md border hover:bg-accent/5 has-[:checked]:bg-accent/10 has-[:checked]:border-primary transition-all">
                <RadioGroupItem value="IMAGE_TO_PDF" id="op-image-to-pdf" />
                <Label htmlFor="op-image-to-pdf" className="flex-grow cursor-pointer">
                  <div className="flex items-center">
                    <FileUp className="w-5 h-5 mr-2 text-primary" /> Convert Image to PDF
                  </div>
                </Label>
              </div>
            </>
          )}
          {fileType === 'pdf' && (
            <>
              <div className="flex items-center space-x-3 p-3 rounded-md border hover:bg-accent/5 has-[:checked]:bg-accent/10 has-[:checked]:border-primary transition-all">
                <RadioGroupItem value="PDF_TO_IMAGES" id="op-pdf-to-images" />
                <Label htmlFor="op-pdf-to-images" className="flex-grow cursor-pointer">
                  <div className="flex items-center">
                    <Images className="w-5 h-5 mr-2 text-primary" /> Convert PDF to Images
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-md border hover:bg-accent/5 has-[:checked]:bg-accent/10 has-[:checked]:border-primary transition-all">
                <RadioGroupItem value="COMPRESS_PDF" id="op-compress-pdf" />
                <Label htmlFor="op-compress-pdf" className="flex-grow cursor-pointer">
                  <div className="flex items-center">
                     <FileText className="w-5 h-5 mr-2 text-primary" /> Compress PDF
                  </div>
                </Label>
              </div>
              {selectedOperation === 'COMPRESS_PDF' && (
                <div className="pl-8 my-2 space-y-2">
                  <Label htmlFor="targetPdfSizeKB" className="text-sm font-medium">Target Size (KB)</Label>
                  <Input
                    id="targetPdfSizeKB"
                    type="number"
                    value={targetPdfSizeKB}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setTargetPdfSizeKB(isNaN(value) || value <= 0 ? 1 : value);
                    }}
                    placeholder="e.g., 500"
                    min="1"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground pl-1">
                    Enter approximate size. AI PDF compression can be unreliable; very small targets (e.g., &lt;100KB) often result in corrupted or unusable PDFs. The AI will try to prioritize readability, which may mean the output is larger than your target or the operation fails.
                  </p>
                </div>
              )}
            </>
          )}
        </RadioGroup>
        
        <Button 
          onClick={handleConvertClick} 
          disabled={!selectedOperation || isLoading} 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          size="lg"
        >
          {isLoading ? 'Processing...' : 'Convert File'}
        </Button>
      </CardContent>
    </Card>
  );
}

