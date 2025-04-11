'use client';

import {useState, useEffect} from 'react';
import {GenerateWorkoutPlanInput, generateWorkoutPlan} from '@/ai/flows/generate-workout-plan';
import {SuggestRecipesInput, suggestRecipes} from '@/ai/flows/suggest-recipes';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {cn} from '@/lib/utils';
import {Trash2, Save, Edit} from 'lucide-react';
import {initializeApp} from 'firebase/app';
import {getFirestore, collection, addDoc, getDocs, deleteDoc, doc} from 'firebase/firestore';
import {firebaseConfig} from '@/lib/firebase-config';

initializeApp(firebaseConfig);
const db = getFirestore();

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
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState<string>('');
  const [savedWorkouts, setSavedWorkouts] = useState<any[]>([]);
  const [workoutTitle, setWorkoutTitle] = useState<string>('');

  useEffect(() => {
    loadSavedWorkouts();
  }, []);

  const loadSavedWorkouts = async () => {
    const querySnapshot = await getDocs(collection(db, 'workouts'));
    const workouts = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    setSavedWorkouts(workouts);
  };

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
      availableEquipment: availableEquipment,
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

  const handleAddEquipment = () => {
    if (newEquipment && !availableEquipment.includes(newEquipment)) {
      setAvailableEquipment([...availableEquipment, newEquipment]);
      setNewEquipment('');
    }
  };

  const handleRemoveEquipment = (equipmentToRemove: string) => {
    setAvailableEquipment(availableEquipment.filter(equipment => equipment !== equipmentToRemove));
  };

  const handleSaveWorkout = async () => {
    if (!workoutPlan) {
      alert('No workout plan to save.');
      return;
    }

    const workoutData = {
      title: workoutTitle || 'Untitled Workout',
      generatedDate: new Date().toISOString(),
      days: workoutDays.map(day => ({
        title: day.title,
        content: day.content,
      })),
      userData: {
        age: age,
        weight: weight,
        height: height,
        fitnessGoals: fitnessGoals,
        availableEquipment: availableEquipment,
      },
    };

    try {
      await addDoc(collection(db, 'workouts'), workoutData);
      alert('Workout saved successfully!');
      setWorkoutTitle('');
      loadSavedWorkouts();
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout.');
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      await deleteDoc(doc(db, 'workouts', workoutId));
      alert('Workout deleted successfully!');
      loadSavedWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-4 bg-black antialiased">
      <h1 className="text-3xl font-bold mb-4 text-white tracking-tight">FitPlan AI</h1>

      <Card className="w-full max-w-md mb-8 shadow-lg rounded-xl p-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">User Information</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your details to generate a personalized plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="age" className="text-lg font-semibold">
              Age
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              onChange={e => setAge(Number(e.target.value))}
              className="bg-black text-white border border-white focus:border-teal-500 shadow-sm rounded-lg px-4 py-2"
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="weight" className="text-lg font-semibold">
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              placeholder="Enter your weight in kg"
              onChange={e => setWeight(Number(e.target.value))}
              className="bg-black text-white border border-white focus:border-teal-500 shadow-sm rounded-lg px-4 py-2"
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="height" className="text-lg font-semibold">
              Height (cm)
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="Enter your height in cm"
              onChange={e => setHeight(Number(e.target.value))}
              className="bg-black text-white border border-white focus:border-teal-500 shadow-sm rounded-lg px-4 py-2"
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="fitnessGoals" className="text-lg font-semibold">
              Fitness Goals
            </Label>
            <Textarea
              id="fitnessGoals"
              placeholder="Enter your fitness goals"
              onChange={e => setFitnessGoals(e.target.value)}
              className="bg-black text-white border border-white placeholder-gray-400 focus:border-teal-500 shadow-sm rounded-lg px-4 py-2"
            />
          </div>

          <div className="grid w-full gap-2">
            <Label htmlFor="availableEquipment" className="text-lg font-semibold">
              Available Equipment
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="newEquipment"
                type="text"
                placeholder="Add equipment and press Enter"
                value={newEquipment}
                onChange={e => setNewEquipment(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEquipment();
                  }
                }}
                className="bg-black text-white border border-white focus:border-teal-500 shadow-sm rounded-lg px-4 py-2"
              />
              <Button type="button" variant="secondary" onClick={handleAddEquipment}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableEquipment.map(equipment => (
                <div
                  key={equipment}
                  className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-semibold flex items-center space-x-1"
                >
                  <span>{equipment}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveEquipment(equipment)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mb-8 shadow-lg rounded-xl p-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">Recipe Preferences</CardTitle>
          <CardDescription className="text-muted-foreground">
            Specify your dietary preferences for tailored recipe suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="dietaryPreferences" className="text-lg font-semibold">
              Dietary Preferences
            </Label>
            <Textarea
              id="dietaryPreferences"
              placeholder="Enter your dietary preferences"
              onChange={e => setDietaryPreferences(e.target.value)}
              className="bg-black text-white border border-white placeholder-gray-400 focus:border-teal-500 shadow-sm rounded-lg px-4 py-2"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          variant="accent"
          onClick={handleGenerateWorkoutPlan}
          className="hover:shadow-lg hover:bg-teal-600"
        >
          Generate Workout Plan
        </Button>
        <Button
          variant="accent"
          onClick={handleSuggestRecipes}
          className="hover:shadow-lg hover:bg-teal-600"
        >
          Suggest Recipes
        </Button>
      </div>

      {workoutPlan && (
        <Card className="w-full max-w-md mt-8 shadow-lg rounded-xl p-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Workout Plan</CardTitle>
            <CardDescription className="text-muted-foreground">
              Here is your personalized workout plan:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Workout Title"
              value={workoutTitle}
              onChange={e => setWorkoutTitle(e.target.value)}
              className="mb-4 bg-black text-white border border-white focus:border-teal-500 shadow-sm rounded-lg px-4 py-2"
            />
            <Accordion type="single" collapsible>
              {workoutDays.map((day, index) => (
                <AccordionItem key={index} value={`day-${index}`}>
                  <AccordionTrigger>
                    <h3 className="text-md font-semibold text-primary tracking-tight">{day.title}</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <table className="w-full rounded-lg border border-border text-sm">
                      <thead>
                        <tr className="bg-secondary">
                          <th className="p-2 text-left font-semibold">Exercise Name</th>
                          <th className="p-2 text-left font-semibold">Sets</th>
                          <th className="p-2 text-left font-semibold">Reps/Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {day.content
                          .split('\n')
                          .filter(line => line.includes('|'))
                          .slice(2)
                          .map((line, lineIndex) => {
                            const [exercise, sets, reps] = line
                              .split('|')
                              .map(item => item.trim())
                              .filter(item => item !== '');
                            return (
                              <tr
                                key={lineIndex}
                                className={`${lineIndex % 2 === 0 ? 'bg-muted' : ''}`}
                              >
                                <td className="p-2">{exercise}</td>
                                <td className="p-2">{sets}</td>
                                <td className="p-2">{reps}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Button variant="primary" onClick={handleSaveWorkout}>
              <Save className="mr-2 h-4 w-4" />
              Save Workout
            </Button>
          </CardContent>
        </Card>
      )}

      {recipeSuggestions && (
        <Card className="w-full max-w-md mt-8 shadow-lg rounded-xl p-6">
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

      <Card className="w-full max-w-md mt-8 shadow-lg rounded-xl p-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">Saved Workouts</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your saved workout plans.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {savedWorkouts.map(workout => (
            <Card key={workout.id} className="mb-4">
              <CardHeader>
                <CardTitle className="text-md font-semibold">{workout.title}</CardTitle>
                <CardDescription className="text-sm">
                  Generated on: {new Date(workout.generatedDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {workout.days.map((day, index) => (
                    <AccordionItem key={index} value={`saved-day-${index}`}>
                      <AccordionTrigger>
                        <h3 className="text-sm font-medium text-primary">{day.title}</h3>
                      </AccordionTrigger>
                      <AccordionContent>
                        <table className="w-full rounded-lg border border-border text-sm">
                          <thead>
                            <tr className="bg-secondary">
                              <th className="p-2 text-left font-semibold">Exercise Name</th>
                              <th className="p-2 text-left font-semibold">Sets</th>
                              <th className="p-2 text-left font-semibold">Reps/Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {day.content
                              .split('\n')
                              .filter(line => line.includes('|'))
                              .slice(2)
                              .map((line, lineIndex) => {
                                const [exercise, sets, reps] = line
                                  .split('|')
                                  .map(item => item.trim())
                                  .filter(item => item !== '');
                                return (
                                  <tr
                                    key={lineIndex}
                                    className={`${lineIndex % 2 === 0 ? 'bg-muted' : ''}`}
                                  >
                                    <td className="p-2">{exercise}</td>
                                    <td className="p-2">{sets}</td>
                                    <td className="p-2">{reps}</td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <div className="flex justify-end mt-4">
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteWorkout(workout.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
