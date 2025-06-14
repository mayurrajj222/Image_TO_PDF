
'use server';

/**
 * @fileOverview PDF size optimization AI agent.
 *
 * - optimizePdfSize - A function that handles the PDF size optimization process.
 * - OptimizePdfSizeInput - The input type for the optimizePdfSize function.
 * - OptimizePdfSizeOutput - The return type for the optimizePdfSize function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizePdfSizeInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file to be compressed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  targetSizeKB: z
    .number()
    .positive()
    .describe('The target PDF size in kilobytes, e.g., 500 for 500KB.'),
});
export type OptimizePdfSizeInput = z.infer<typeof OptimizePdfSizeInputSchema>;

const OptimizePdfSizeOutputSchema = z.object({
  optimizedPdfDataUri: z
    .string()
    .describe("The optimized PDF, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});
export type OptimizePdfSizeOutput = z.infer<typeof OptimizePdfSizeOutputSchema>;

export async function optimizePdfSize(input: OptimizePdfSizeInput): Promise<OptimizePdfSizeOutput> {
  return optimizePdfSizeFlow(input);
}

const optimizePdfSizePromptObj = ai.definePrompt({
  name: 'optimizePdfSizePrompt',
  input: {schema: OptimizePdfSizeInputSchema},
  output: {schema: OptimizePdfSizeOutputSchema},
  prompt: `You are an expert PDF optimization tool. Your task is to reduce the file size of the provided PDF (given as a data URI) to approximately {{{targetSizeKB}}}KB.

CRITICAL INSTRUCTIONS:
1.  Your ABSOLUTE PRIMARY GOAL is to produce a VALID and READABLE PDF.
2.  If achieving the target size of {{{targetSizeKB}}}KB would compromise document integrity or readability, you MUST prioritize creating a usable PDF. This means the output PDF should be smaller than the original BUT MUST BE VALID AND OPENABLE, even if it ends up being larger than the {{{targetSizeKB}}}KB target.
3.  DO NOT generate a data URI if its Base64 content represents a corrupted, incomplete, or unopenable PDF. It is far better to be less compressive (or even return a copy of the original if no safe compression is possible) than to produce a broken file.
4.  Be aware that extremely small target sizes (e.g., below 100KB for many typical documents) are often impossible to achieve while maintaining a valid PDF.

Apply techniques such as image re-compression (if any images are present and identifiable within the PDF structure you can understand), font subsetting, or removal of unnecessary metadata or objects, but only if these operations do not break the PDF.

Return ONLY the optimized PDF as a data URI string in the 'optimizedPdfDataUri' field of the JSON output.
The output 'optimizedPdfDataUri' must be a valid data URI string in the format: 'data:application/pdf;base64,<encoded_data>'. The <encoded_data> part MUST be valid Base64 encoding of a complete and openable PDF document.
Do not include any other text, explanations, or markdown in your response.

Original PDF Data URI: {{{pdfDataUri}}}
Target Size: {{{targetSizeKB}}}KB`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
});

const optimizePdfSizeFlow = ai.defineFlow(
  {
    name: 'optimizePdfSizeFlow',
    inputSchema: OptimizePdfSizeInputSchema,
    outputSchema: OptimizePdfSizeOutputSchema,
  },
  async (input) => {
    const { output } = await optimizePdfSizePromptObj(input);
    if (!output?.optimizedPdfDataUri) {
      throw new Error('AI failed to return an optimized PDF data URI. The returned data might be null or malformed.');
    }
    if (!output.optimizedPdfDataUri.startsWith('data:application/pdf;base64,')) {
      throw new Error('AI returned an invalid data URI format for the PDF. It must start with "data:application/pdf;base64,".');
    }
    // Basic check for empty or trivially small base64 content
    const base64Content = output.optimizedPdfDataUri.substring('data:application/pdf;base64,'.length);
    if (base64Content.length < 100) { // Arbitrary small length, real PDFs are usually larger
        throw new Error('AI returned a PDF data URI that appears to be empty or too small to be a valid PDF.');
    }
    return output;
  }
);

