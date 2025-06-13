
'use server';

import { optimizeImageSize, type OptimizeImageSizeInput, type OptimizeImageSizeOutput } from '@/ai/flows/optimize-image-size';

export interface CompressImageActionResult {
  optimizedPhotoDataUri?: string;
  error?: string;
}

export async function compressImageAction(
  imageDataUri: string
): Promise<CompressImageActionResult> {
  if (!imageDataUri) {
    return { error: 'No image data provided.' };
  }

  try {
    const input: OptimizeImageSizeInput = { photoDataUri: imageDataUri };
    const result: OptimizeImageSizeOutput = await optimizeImageSize(input);
    return { optimizedPhotoDataUri: result.optimizedPhotoDataUri };
  } catch (e) {
    console.error('Error during image compression:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during compression.';
    return { error: `AI compression failed: ${errorMessage}` };
  }
}
