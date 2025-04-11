'use client';

import {useState} from 'react';
import {GenerateWorkoutPlanInput, generateWorkoutPlan} from '@/ai/flows/generate-workout-plan';
import {SuggestRecipesInput, suggestRecipes} from '@/ai/flows/suggest-recipes';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Home() {
  const [age, setAge] = useState<number | undefined>(undefined);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [fitnessGoals, setFitnessGoals] = useState<string>('');
  const [workoutPlan, setWorkoutPlan] = useState<string | undefined>(undefined);
  const [recipeSuggestions, setRecipeSuggestions] = useState<
    {name: string; ingredients: string; instructions: string}[] | undefined
  >(undefined);
  const [dietaryPreferences, setDietaryPreferences] = useState<string>('');

  const handleGenerateWorkoutPlan = async () => {
    if (age === undefined || weight === undefined || height === undefined) {
      alert('Please fill in all fields.');
      return;
    }

    const input: GenerateWorkoutPlanInput = {
      age: age,
      weight: weight,
      height: height,
      fitnessGoals: fitnessGoals,
    };

    const result = await generateWorkoutPlan(input);
    setWorkoutPlan(result?.workoutPlan);
  };

  const handleSuggestRecipes = async () => {
    const input: SuggestRecipesInput = {
      fitnessGoals: fitnessGoals,
      dietaryPreferences: dietaryPreferences,
    };
    const result = await suggestRecipes(input);
    setRecipeSuggestions(result?.recipes);
  };

  const splitWorkoutPlan = (plan: string | undefined) => {
    if (!plan) return [];

    const days = plan.split('## ').filter(day => day.startsWith('Day'));
    return days.map(day => {
      const [title, ...content] = day.split('\n');
      return {
        title: '## ' + title.trim(),
        content: content.join('\n').trim(),
      };
    });
  };

  const workoutDays = splitWorkoutPlan(workoutPlan);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-4 bg-background antialiased">
      <h1 className="text-3xl font-bold mb-4 text-primary tracking-tight">FitPlan AI</h1>

      <Card className="w-full max-w-md mb-8 shadow-md rounded-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">User Information</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your details to generate a personalized plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              onChange={(e) => setAge(Number(e.target.value))}
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="Enter your weight in kg"
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="Enter your height in cm"
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="fitnessGoals">Fitness Goals</Label>
            <Textarea
              id="fitnessGoals"
              placeholder="Enter your fitness goals"
              onChange={(e) => setFitnessGoals(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mb-8 shadow-md rounded-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">Recipe Preferences</CardTitle>
          <CardDescription className="text-muted-foreground">
            Specify your dietary preferences for tailored recipe suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="dietaryPreferences">Dietary Preferences</Label>
            <Textarea
              id="dietaryPreferences"
              placeholder="Enter your dietary preferences"
              onChange={(e) => setDietaryPreferences(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="accent" onClick={handleGenerateWorkoutPlan}>
          Generate Workout Plan
        </Button>
        <Button variant="accent" onClick={handleSuggestRecipes}>
          Suggest Recipes
        </Button>
      </div>

      {workoutPlan && (
        <Card className="w-full max-w-md mt-8 shadow-md rounded-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Workout Plan</CardTitle>
            <CardDescription className="text-muted-foreground">
              Here is your personalized workout plan:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {workoutDays.map((day, index) => (
                <AccordionItem key={index} value={`day-${index}`}>
                  <AccordionTrigger>{day.title}</AccordionTrigger>
                  <AccordionContent>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{day.content}</ReactMarkdown>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {recipeSuggestions && (
        <Card className="w-full max-w-md mt-8 shadow-md rounded-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Recipe Suggestions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Here are some recipes tailored to your goals and preferences:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recipeSuggestions.map((recipe, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-md font-semibold text-primary tracking-tight">{recipe.name}</h3>
                <p className="text-sm font-medium">Ingredients:</p>
                <p className="text-sm text-muted-foreground">{recipe.ingredients}</p>
                <p className="text-sm font-medium">Instructions:</p>
                <p className="text-sm text-muted-foreground">{recipe.instructions}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
