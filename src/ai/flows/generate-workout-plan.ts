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
  availableEquipment: z
    .string()
    .describe(
      'The equipment available to the user, e.g., dumbbells, resistance bands, pull-up bar.'
    )
    .optional(),
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
      availableEquipment: z
        .string()
        .describe(
          'The equipment available to the user, e.g., dumbbells, resistance bands, pull-up bar.'
        )
        .optional(),
    }),
  },
  output: {
    schema: z.object({
      workoutPlan: z.string().describe('A personalized workout plan for the user in markdown format.'),
    }),
  },
  prompt: `You are a personal trainer. Generate a personalized workout plan for the user based on their age, weight, height, fitness goals, and available equipment. The workout plan should be in markdown format, divided into 7 days.

  Age: {{{age}}}
  Weight: {{{weight}}} kg
  Height: {{{height}}} cm
  Fitness Goals: {{{fitnessGoals}}}
  Available Equipment: {{{availableEquipment}}}

  Generate a workout plan that uses ONLY the available equipment specified. If no equipment is specified, use only bodyweight exercises.

  The workout plan should be in markdown table format with columns: Exercise Name, Sets, and Reps/Time.
  Each day should have a mix of strength and cardio exercises, with clear instructions on sets and reps.

  Example:

  # Personalized Workout Plan

  ## Day 1:
  | Exercise Name | Sets | Reps/Time |
  | :------------ | :--- | :-------- |
  | Push-ups      | 3    | 10        |
  | Squats        | 3    | 12        |
  | Running       | 1    | 30 minutes|

  ## Day 2:
  | Exercise Name | Sets | Reps/Time |
  | :------------ | :--- | :-------- |
  | Pull-ups      | 3    | 8         |
  | Lunges        | 3    | 10 each leg |
  | Swimming      | 1    | 45 minutes|

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
