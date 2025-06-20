
"use client";

import React, { useState, useEffect } from 'react';
import { FileDropzone } from './FileDropzone';
import { ConversionOptionsPanel, type ConversionConfig } from './ConversionOptionsPanel'; // Removed ConversionOperation type import as it's not directly used here
import { ResultsDisplay } from './ResultsDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { useToast } from "@/hooks/use-toast";
import { compressImageAction, compressPdfAction } from '@/app/actions'; // Added compressPdfAction
import { convertImageFormat, imageToPdf, pdfToImages, type ConversionResult, type ImageMimeType } from '@/lib/client-converters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function FormatFlexApp() {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (inputFile) {
      if (inputFile.type.startsWith('image/')) {
        setFileType('image');
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(inputFile);
      } else if (inputFile.type === 'application/pdf') {
        setFileType('pdf');
        setFilePreview(null); 
      } else {
        toast({
          variant: "destructive",
          title: "Unsupported File Type",
          description: `File type ${inputFile.type} is not supported. Please upload an image or PDF.`,
        });
        handleClearFile();
      }
      setResults([]); 
    } else {
      setFileType(null);
      setFilePreview(null);
      setResults([]);
    }
  }, [inputFile, toast]);

  const handleFileDrop = (file: File) => {
    setInputFile(file);
  };

  const handleClearFile = () => {
    setInputFile(null);
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleConvert = async (config: ConversionConfig) => {
    if (!inputFile) return;
    setIsLoading(true);
    setResults([]);

    try {
      let conversionResults: ConversionResult[] = [];
      const fileDataUri = await readFileAsDataURL(inputFile);

      switch (config.operation) {
        case 'CONVERT_IMAGE':
          if (config.imageTargetFormat) {
            const result = await convertImageFormat(inputFile, config.imageTargetFormat as ImageMimeType);
            conversionResults.push(result);
          } else {
            throw new Error("Target format for image conversion not specified.");
          }
          break;
        case 'COMPRESS_IMAGE':
          if (typeof config.targetSizeKB !== 'number' || config.targetSizeKB <= 0) {
            throw new Error("Target size for image compression must be a positive number.");
          }
          const compressedImgResult = await compressImageAction(fileDataUri, config.targetSizeKB);
          if (compressedImgResult.error) throw new Error(compressedImgResult.error);
          if (compressedImgResult.optimizedPhotoDataUri) {
            const ext = inputFile.name.substring(inputFile.name.lastIndexOf('.') + 1) || 'jpg';
            conversionResults.push({
              name: `compressed_${inputFile.name.substring(0, inputFile.name.lastIndexOf('.')) || inputFile.name}.${ext}`,
              dataUrl: compressedImgResult.optimizedPhotoDataUri,
              type: inputFile.type, 
            });
          }
          break;
        case 'IMAGE_TO_PDF':
          const pdfResult = await imageToPdf(inputFile);
          conversionResults.push(pdfResult);
          break;
        case 'PDF_TO_IMAGES':
          const images = await pdfToImages(inputFile, 'image/png');
          conversionResults.push(...images);
          break;
        case 'COMPRESS_PDF':
          if (typeof config.targetSizeKB !== 'number' || config.targetSizeKB <= 0) {
            throw new Error("Target size for PDF compression must be a positive number.");
          }
          const compressedPdfResult = await compressPdfAction(fileDataUri, config.targetSizeKB);
          if (compressedPdfResult.error) throw new Error(compressedPdfResult.error);
          if (compressedPdfResult.optimizedPdfDataUri) {
            conversionResults.push({
              name: `compressed_${inputFile.name}`,
              dataUrl: compressedPdfResult.optimizedPdfDataUri,
              type: 'application/pdf',
            });
          }
          break;
        default:
          // Ensure exhaustive check with a helper function or by casting 'never'
          const exhaustiveCheck: never = config.operation;
          throw new Error(`Invalid conversion operation: ${exhaustiveCheck}`);
      }
      setResults(conversionResults);
      if (conversionResults.length > 0) {
        toast({
          title: "Conversion Successful!",
          description: `${conversionResults.length} file(s) processed.`,
        });
      } else if (! (config.operation === 'COMPRESS_IMAGE' || config.operation === 'COMPRESS_PDF')) { // Avoid success message if compression yields no result but no error
         toast({
          variant: "default",
          title: "Processing Complete",
          description: "The operation finished, but no output files were generated. This may be expected for some operations or if the AI could not perform the task.",
        });
      }
    } catch (error: any) {
      console.error("Conversion failed:", error);
      toast({
        variant: "destructive",
        title: "Conversion Failed",
        description: error.message || "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 bg-background">
      <header className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary font-headline">FormatFlex</h1>
        <p className="text-md sm:text-lg text-muted-foreground mt-2">Your flexible friend for file conversions and compression.</p>
      </header>

      <main className="w-full flex flex-col items-center">
        <FileDropzone 
          onFileDrop={handleFileDrop} 
          currentFile={inputFile}
          clearFile={handleClearFile}
          filePreview={filePreview}
        />

        {isLoading && (
          <div className="mt-8 text-center">
            <LoadingSpinner size={48} />
            <p className="mt-2 text-lg text-primary animate-pulse">Processing your file...</p>
          </div>
        )}

        {!isLoading && inputFile && (
          <ConversionOptionsPanel 
            fileType={fileType} 
            onConvert={handleConvert} 
            isLoading={isLoading}
          />
        )}
        
        {!isLoading && results.length > 0 && (
          <ResultsDisplay results={results} />
        )}

        {!inputFile && !isLoading && (
          <Card className="mt-8 max-w-lg w-full text-center bg-secondary/30 shadow-sm">
            <CardContent className="p-6">
              <AlertTriangle className="mx-auto h-12 w-12 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-foreground">Getting Started is Easy!</h3>
              <p className="text-muted-foreground mt-2">
                Simply drag and drop an image (JPG, PNG, WebP) or a PDF file into the area above, or click to browse your files. Then, choose your desired conversion option.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="mt-10 sm:mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FormatFlex. All rights reserved.</p>
      </footer>
    </div>
  );
}
