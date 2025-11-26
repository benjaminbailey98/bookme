'use server';

/**
 * @fileOverview A Genkit flow for intelligent form completion in the booking request page.
 *
 * - intelligentFormCompletion - A function that suggests values for optional fields in the booking form.
 * - IntelligentFormCompletionInput - The input type for the intelligentFormCompletion function.
 * - IntelligentFormCompletionOutput - The return type for the intelligentFormCompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentFormCompletionInputSchema = z.object({
  eventType: z.string().optional().describe('The type of the event (e.g., Wedding, Concert).'),
  venue: z.string().optional().describe('The name of the venue where the event will be held.'),
  location: z.string().optional().describe('The address of the event venue.'),
  attire: z.string().optional().describe('The suggested attire for the event.'),
  theme: z.string().optional().describe('The theme of the event.'),
  pastEntries: z
    .array(z.string())
    .optional()
    .describe('A list of the user past entries in booking forms.'),
});
export type IntelligentFormCompletionInput = z.infer<
  typeof IntelligentFormCompletionInputSchema
>;

const IntelligentFormCompletionOutputSchema = z.object({
  suggestedAttire: z
    .string()
    .optional()
    .describe('Suggested attire based on event type and theme.'),
  suggestedTheme: z
    .string()
    .optional()
    .describe('Suggested theme based on event type and venue.'),
  additionalNotes: z
    .string()
    .optional()
    .describe('Any additional notes or suggestions for the event.'),
});

export type IntelligentFormCompletionOutput = z.infer<
  typeof IntelligentFormCompletionOutputSchema
>;

export async function intelligentFormCompletion(
  input: IntelligentFormCompletionInput
): Promise<IntelligentFormCompletionOutput> {
  return intelligentFormCompletionFlow(input);
}

const intelligentFormCompletionPrompt = ai.definePrompt({
  name: 'intelligentFormCompletionPrompt',
  input: {schema: IntelligentFormCompletionInputSchema},
  output: {schema: IntelligentFormCompletionOutputSchema},
  prompt: `Based on the event details and past entries, suggest values for the optional fields.

Event Type: {{{eventType}}}
Venue: {{{venue}}}
Location: {{{location}}}
Theme: {{{theme}}}
Past Entries: {{{pastEntries}}}

Consider the event type, venue, and location to suggest appropriate attire and theme. Also, provide any additional notes or suggestions that might be helpful for planning the event.

Output suggested attire, theme and additional notes in JSON format. If no suggestion is applicable, set to null.
`,
});

const intelligentFormCompletionFlow = ai.defineFlow(
  {
    name: 'intelligentFormCompletionFlow',
    inputSchema: IntelligentFormCompletionInputSchema,
    outputSchema: IntelligentFormCompletionOutputSchema,
  },
  async input => {
    const {output} = await intelligentFormCompletionPrompt(input);
    return output!;
  }
);
