'use server';

import {
  intelligentFormCompletion,
  type IntelligentFormCompletionInput,
  type IntelligentFormCompletionOutput,
} from '@/ai/flows/intelligent-form-completion';

export async function getSuggestions(
  input: IntelligentFormCompletionInput
): Promise<
  | { success: true; data: IntelligentFormCompletionOutput }
  | { success: false; error: string }
> {
  try {
    const output = await intelligentFormCompletion(input);
    return { success: true, data: output };
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching suggestions.',
    };
  }
}
