// src/ai/flows/suggest-recipes.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting recipes based on user fitness goals and dietary preferences.
 *
 * - suggestRecipes - A function that takes user fitness goals and dietary preferences as input and suggests recipes.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The output type for the suggestRecipes function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestRecipesInputSchema = z.object({
  fitnessGoals: z.string().describe('The fitness goals of the user, e.g., weight loss, muscle gain, general health.'),
  dietaryPreferences: z.string().describe('The dietary preferences of the user, e.g., vegetarian, vegan, gluten-free.'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const SuggestRecipesOutputSchema = z.object({
  recipes: z
    .array(
      z.object({
        name: z.string().describe('The name of the recipe.'),
        ingredients: z.string().describe('The ingredients required for the recipe.'),
        instructions: z.string().describe('The instructions to prepare the recipe.'),
      })
    )
    .describe('A list of suggested recipes.'),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: {
    schema: z.object({
      fitnessGoals: z.string().describe('The fitness goals of the user, e.g., weight loss, muscle gain, general health.'),
      dietaryPreferences: z.string().describe('The dietary preferences of the user, e.g., vegetarian, vegan, gluten-free.'),
    }),
  },
  output: {
    schema: z.object({
      recipes: z
        .array(
          z.object({
            name: z.string().describe('The name of the recipe.'),
            ingredients: z.string().describe('The ingredients required for the recipe.'),
            instructions: z.string().describe('The instructions to prepare the recipe.'),
          })
        )
        .describe('A list of suggested recipes.'),
    }),
  },
  prompt: `You are a personal nutrition assistant. Based on the user's fitness goals and dietary preferences, suggest recipes tailored to their needs.

Fitness Goals: {{{fitnessGoals}}}
Dietary Preferences: {{{dietaryPreferences}}}

Suggest 3 recipes.

Each recipe should include the name, ingredients, and instructions.`,
});

const suggestRecipesFlow = ai.defineFlow<
  typeof SuggestRecipesInputSchema,
  typeof SuggestRecipesOutputSchema
>(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
