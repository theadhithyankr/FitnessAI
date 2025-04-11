// Use server directive is required for Genkit flows.
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a personalized workout plan based on user input.
 *
 * The flow takes user's age, weight, height, and fitness goals as input and returns a workout plan.
 *
 * @exports {
 *   generateWorkoutPlan: (input: GenerateWorkoutPlanInput) => Promise<GenerateWorkoutPlanOutput>;
 *   GenerateWorkoutPlanInput: type; The input type for the generateWorkoutPlan function.
 *   GenerateWorkoutPlanOutput: type; The return type for the generateWorkoutPlan function.
 * }
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateWorkoutPlanInputSchema = z.object({
  age: z.number().describe('The age of the user.'),
  weight: z.number().describe('The weight of the user in kilograms.'),
  height: z.number().describe('The height of the user in centimeters.'),
  fitnessGoals: z
    .string()
    .describe(
      'The fitness goals of the user, e.g., lose weight, gain muscle, improve endurance.'
    ),
});
export type GenerateWorkoutPlanInput = z.infer<typeof GenerateWorkoutPlanInputSchema>;

const GenerateWorkoutPlanOutputSchema = z.object({
  workoutPlan: z.string().describe('A personalized workout plan for the user.'),
});
export type GenerateWorkoutPlanOutput = z.infer<typeof GenerateWorkoutPlanOutputSchema>;

export async function generateWorkoutPlan(
  input: GenerateWorkoutPlanInput
): Promise<GenerateWorkoutPlanOutput> {
  return generateWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkoutPlanPrompt',
  input: {
    schema: z.object({
      age: z.number().describe('The age of the user.'),
      weight: z.number().describe('The weight of the user in kilograms.'),
      height: z.number().describe('The height of the user in centimeters.'),
      fitnessGoals: z
        .string()
        .describe(
          'The fitness goals of the user, e.g., lose weight, gain muscle, improve endurance.'
        ),
    }),
  },
  output: {
    schema: z.object({
      workoutPlan: z.string().describe('A personalized workout plan for the user.'),
    }),
  },
  prompt: `You are a personal trainer. You will generate a personalized workout plan for the user based on their age, weight, height, and fitness goals.

  Age: {{{age}}}
  Weight: {{{weight}}} kg
  Height: {{{height}}} cm
  Fitness Goals: {{{fitnessGoals}}}

  Workout Plan:`,
});

const generateWorkoutPlanFlow = ai.defineFlow<
  typeof GenerateWorkoutPlanInputSchema,
  typeof GenerateWorkoutPlanOutputSchema
>({
  name: 'generateWorkoutPlanFlow',
  inputSchema: GenerateWorkoutPlanInputSchema,
  outputSchema: GenerateWorkoutPlanOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
