
'use server';

/**
 * @fileOverview Image size optimization AI agent.
 *
 * - optimizeImageSize - A function that handles the image size optimization process.
 * - OptimizeImageSizeInput - The input type for the optimizeImageSize function.
 * - OptimizeImageSizeOutput - The return type for the optimizeImageSize function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeImageSizeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be compressed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetSizeKB: z
    .number()
    .positive()
    .describe('The target image size in kilobytes, e.g., 100 for 100KB.'),
});
export type OptimizeImageSizeInput = z.infer<typeof OptimizeImageSizeInputSchema>;

const OptimizeImageSizeOutputSchema = z.object({
  optimizedPhotoDataUri: z
    .string()
    .describe("The optimized photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type OptimizeImageSizeOutput = z.infer<typeof OptimizeImageSizeOutputSchema>;

export async function optimizeImageSize(input: OptimizeImageSizeInput): Promise<OptimizeImageSizeOutput> {
  return optimizeImageSizeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeImageSizePrompt',
  input: {schema: OptimizeImageSizeInputSchema},
  output: {schema: OptimizeImageSizeOutputSchema},
  prompt: `You are an expert image optimization tool. You will optimize the image to be approximately {{{targetSizeKB}}}KB while maintaining acceptable image quality. Return the optimized image as a data URI.

Image: {{media url=photoDataUri}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const optimizeImageSizeFlow = ai.defineFlow(
  {
    name: 'optimizeImageSizeFlow',
    inputSchema: OptimizeImageSizeInputSchema,
    outputSchema: OptimizeImageSizeOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [{media: {url: input.photoDataUri}}, {text: `Optimize this image to be approximately ${input.targetSizeKB}KB while maintaining acceptable image quality.`}],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], 
      },
    });

    return {optimizedPhotoDataUri: media.url!};
  }
);

