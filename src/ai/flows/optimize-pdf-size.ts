
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

Prioritize maintaining document readability and preserving essential content. You may need to apply techniques such as image re-compression (if any images are present and identifiable), font subsetting, or removal of unnecessary metadata or objects.

Return ONLY the optimized PDF as a data URI string in the 'optimizedPdfDataUri' field of the JSON output.
Do not include any other text, explanations, or markdown.
The output 'optimizedPdfDataUri' must be a valid data URI string: 'data:application/pdf;base64,<encoded_data>'.

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
    return output;
  }
);
