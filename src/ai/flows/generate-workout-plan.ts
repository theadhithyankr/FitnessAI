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
  workoutPlan: z.string().describe('A personalized workout plan for the user in markdown format.'),
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
      workoutPlan: z.string().describe('A personalized workout plan for the user in markdown format.'),
    }),
  },
  prompt: `You are a personal trainer. Generate a personalized workout plan for the user based on their age, weight, height, and fitness goals. The workout plan should be in markdown format.

  Age: {{{age}}}
  Weight: {{{weight}}} kg
  Height: {{{height}}} cm
  Fitness Goals: {{{fitnessGoals}}}

  The workout plan should include a mix of strength and cardio exercises, with clear instructions on sets and reps. Each exercise should specify what type it is. The format must be Markdown. Start with a main heading like "Personalized Workout Plan"

  Example:

  # Personalized Workout Plan

  ## Monday: Strength Training

  - **Push-ups**: 3 sets of 10 reps (Strength)
  - **Squats**: 3 sets of 12 reps (Strength)
  - **Plank**: 3 sets, hold for 30 seconds (Strength)

  ## Tuesday: Cardio

  - **Running**: 30 minutes (Cardio)
  - **Cycling**: 30 minutes (Cardio)

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
