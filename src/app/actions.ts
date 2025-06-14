
'use server';

import { optimizeImageSize, type OptimizeImageSizeInput, type OptimizeImageSizeOutput } from '@/ai/flows/optimize-image-size';
import { optimizePdfSize, type OptimizePdfSizeInput, type OptimizePdfSizeOutput } from '@/ai/flows/optimize-pdf-size';

export interface CompressImageActionResult {
  optimizedPhotoDataUri?: string;
  error?: string;
}

export async function compressImageAction(
  imageDataUri: string,
  targetSizeKB: number
): Promise<CompressImageActionResult> {
  if (!imageDataUri) {
    return { error: 'No image data provided.' };
  }
  if (targetSizeKB <= 0) {
    return { error: 'Target size must be a positive number.'}
  }

  try {
    const input: OptimizeImageSizeInput = { photoDataUri: imageDataUri, targetSizeKB };
    const result: OptimizeImageSizeOutput = await optimizeImageSize(input);
    return { optimizedPhotoDataUri: result.optimizedPhotoDataUri };
  } catch (e) {
    console.error('Error during image compression:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during compression.';
    return { error: `AI image compression failed: ${errorMessage}` };
  }
}

export interface CompressPdfActionResult {
  optimizedPdfDataUri?: string;
  error?: string;
}

export async function compressPdfAction(
  pdfDataUri: string,
  targetSizeKB: number
): Promise<CompressPdfActionResult> {
  if (!pdfDataUri) {
    return { error: 'No PDF data provided.' };
  }
  if (targetSizeKB <= 0) {
    return { error: 'Target size must be a positive number.' };
  }

  try {
    const input: OptimizePdfSizeInput = { pdfDataUri, targetSizeKB };
    const result: OptimizePdfSizeOutput = await optimizePdfSize(input);
    return { optimizedPdfDataUri: result.optimizedPdfDataUri };
  } catch (e) {
    console.error('Error during PDF compression:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during PDF compression.';
    return { error: `AI PDF compression failed: ${errorMessage}` };
  }
}
