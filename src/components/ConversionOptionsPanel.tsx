
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileImage, FileText, Minimize2, FileUp, Images, Wand2 } from 'lucide-react'; // Corrected: ImageDown changed to Images

export type ConversionOperation = 
  | 'CONVERT_IMAGE' 
  | 'COMPRESS_IMAGE' 
  | 'IMAGE_TO_PDF' 
  | 'PDF_TO_IMAGES';

export interface ConversionConfig {
  operation: ConversionOperation;
  imageTargetFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

interface ConversionOptionsPanelProps {
  fileType: 'image' | 'pdf' | null;
  onConvert: (config: ConversionConfig) => void;
  isLoading: boolean;
}

export function ConversionOptionsPanel({ fileType, onConvert, isLoading }: ConversionOptionsPanelProps) {
  const [selectedOperation, setSelectedOperation] = React.useState<ConversionOperation | null>(null);
  const [imageTargetFormat, setImageTargetFormat] = React.useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  React.useEffect(() => {
    setSelectedOperation(null); // Reset operation when fileType changes
  }, [fileType]);

  const handleOperationChange = (value: string) => {
    setSelectedOperation(value as ConversionOperation);
  };
  
  const handleConvertClick = () => {
    if (selectedOperation) {
      onConvert({ operation: selectedOperation, imageTargetFormat });
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
                     <Minimize2 className="w-5 h-5 mr-2 text-primary" /> Compress Image (to ~100KB)
                  </div>
                </Label>
              </div>
              
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
            <div className="flex items-center space-x-3 p-3 rounded-md border hover:bg-accent/5 has-[:checked]:bg-accent/10 has-[:checked]:border-primary transition-all">
              <RadioGroupItem value="PDF_TO_IMAGES" id="op-pdf-to-images" />
              <Label htmlFor="op-pdf-to-images" className="flex-grow cursor-pointer">
                <div className="flex items-center">
                  <Images className="w-5 h-5 mr-2 text-primary" /> Convert PDF to Images
                </div>
              </Label>
            </div>
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
