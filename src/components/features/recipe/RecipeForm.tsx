
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Recipe, Cuisine, Ingredient } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (recipe: Recipe) => void;
  onCancel: () => void;
}

const cuisineOptions: Cuisine[] = [
  'thai', 'polish', 'french', 'italian', 'japanese', 
  'chinese', 'indian', 'mexican', 'greek', 'spanish', 
  'vietnamese', 'korean', 'turkish', 'moroccan', 'lebanese',
  'mediterranean'
];

const categoryOptions = [
  'main', 'side', 'dessert', 'breakfast', 'snack', 'soup', 'appetizer'
];

const defaultRecipe: Omit<Recipe, 'id'> = {
  name: '',
  category: 'main',
  cuisine: 'italian',
  baseServings: 4,
  prepTime: 15,
  cookTime: 30,
  calories: 0,
  ingredients: {
    default: []
  },
  instructions: [''],
  dietaryInfo: {
    isVegan: false,
    isVegetarian: false,
    isGlutenFree: false,
    isDairyFree: false,
    isLowCarb: false,
    isNutFree: false
  },
  nutritionalInfo: {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0
  },
  image: '/placeholder.svg'
};

const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  onSubmit,
  onCancel
}) => {
  const { t } = useTranslation();
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients.default || [{ name: '', quantity: 1, unit: 'pcs', scalable: true }]
  );
  const [instructions, setInstructions] = useState<string[]>(
    recipe?.instructions || ['']
  );

  const formSchema = z.object({
    name: z.string().min(3, { message: 'Recipe name must be at least 3 characters' }),
    category: z.string(),
    cuisine: z.string(),
    baseServings: z.coerce.number().positive(),
    prepTime: z.coerce.number().positive(),
    cookTime: z.coerce.number().positive(),
    isVegan: z.boolean(),
    isVegetarian: z.boolean(),
    isGlutenFree: z.boolean(),
    isDairyFree: z.boolean(),
    isLowCarb: z.boolean(),
    isNutFree: z.boolean(),
    calories: z.coerce.number().nonnegative(),
    protein: z.coerce.number().nonnegative(),
    carbohydrates: z.coerce.number().nonnegative(),
    fat: z.coerce.number().nonnegative(),
    fiber: z.coerce.number().nonnegative()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: recipe?.name || '',
      category: recipe?.category || 'main',
      cuisine: recipe?.cuisine || 'italian',
      baseServings: recipe?.baseServings || 4,
      prepTime: recipe?.prepTime || 15,
      cookTime: recipe?.cookTime || 30,
      isVegan: recipe?.dietaryInfo.isVegan || false,
      isVegetarian: recipe?.dietaryInfo.isVegetarian || false,
      isGlutenFree: recipe?.dietaryInfo.isGlutenFree || false,
      isDairyFree: recipe?.dietaryInfo.isDairyFree || false,
      isLowCarb: recipe?.dietaryInfo.isLowCarb || false,
      isNutFree: recipe?.dietaryInfo.isNutFree || false,
      calories: recipe?.nutritionalInfo.calories || 0,
      protein: recipe?.nutritionalInfo.protein || 0,
      carbohydrates: recipe?.nutritionalInfo.carbohydrates || 0,
      fat: recipe?.nutritionalInfo.fat || 0,
      fiber: recipe?.nutritionalInfo.fiber || 0
    }
  });

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 1, unit: 'pcs', scalable: true }]);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 1);
    setInstructions(newInstructions);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (ingredients.length === 0 || instructions.length === 0) {
      // Handle validation error
      return;
    }

    const newRecipe: Recipe = {
      id: recipe?.id || `custom-${Date.now()}`,
      name: values.name,
      category: values.category as Recipe['category'],
      cuisine: values.cuisine as Cuisine,
      baseServings: values.baseServings,
      prepTime: values.prepTime,
      cookTime: values.cookTime,
      calories: values.calories,
      ingredients: {
        default: ingredients
      },
      instructions: instructions.filter(instruction => instruction.trim() !== ''),
      dietaryInfo: {
        isVegan: values.isVegan,
        isVegetarian: values.isVegetarian,
        isGlutenFree: values.isGlutenFree,
        isDairyFree: values.isDairyFree,
        isLowCarb: values.isLowCarb,
        isNutFree: values.isNutFree
      },
      nutritionalInfo: {
        calories: values.calories,
        protein: values.protein,
        carbohydrates: values.carbohydrates,
        fat: values.fat,
        fiber: values.fiber
      },
      image: recipe?.image || '/placeholder.svg'
    };

    onSubmit(newRecipe);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recipes.recipeDetails')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('recipes.name')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('recipes.category')}</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cuisine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('recipes.cuisine')}</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cuisine" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cuisineOptions.map(cuisine => (
                            <SelectItem key={cuisine} value={cuisine}>
                              {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="baseServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('recipes.servings')}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prepTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('recipes.prepTime')}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cookTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('recipes.cookTime')}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-medium">{t('recipes.dietary.restrictions')}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isVegan"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 rounded-md border p-3">
                      <FormLabel>{t('recipes.dietary.vegan')}</FormLabel>
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isVegetarian"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 rounded-md border p-3">
                      <FormLabel>{t('recipes.dietary.vegetarian')}</FormLabel>
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isGlutenFree"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 rounded-md border p-3">
                      <FormLabel>{t('recipes.dietary.glutenFree')}</FormLabel>
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isDairyFree"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 rounded-md border p-3">
                      <FormLabel>{t('recipes.dietary.dairyFree')}</FormLabel>
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <h3 className="text-lg font-medium">{t('recipes.nutritionalInfo')}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carbohydrates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbs (g)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat (g)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t('recipes.ingredients')}</h3>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="h-4 w-4 mr-1" /> {t('common.add')}
              </Button>
            </div>

            {ingredients.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <FormLabel htmlFor={`ingredient-${index}-name`}>Name</FormLabel>
                  <Input
                    id={`ingredient-${index}-name`}
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <FormLabel htmlFor={`ingredient-${index}-quantity`}>Qty</FormLabel>
                  <Input
                    id={`ingredient-${index}-quantity`}
                    type="number"
                    min="0"
                    step="0.1"
                    value={ingredient.quantity}
                    onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                  />
                </div>
                <div className="col-span-3">
                  <FormLabel htmlFor={`ingredient-${index}-unit`}>Unit</FormLabel>
                  <Input
                    id={`ingredient-${index}-unit`}
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="col-span-1 flex items-center">
                  <Switch 
                    checked={ingredient.scalable} 
                    onCheckedChange={(checked) => updateIngredient(index, 'scalable', checked)} 
                    aria-label="Scalable"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t('recipes.instructions')}</h3>
              <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                <Plus className="h-4 w-4 mr-1" /> {t('common.add')}
              </Button>
            </div>

            {instructions.map((instruction, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-1 flex items-center justify-center pt-3">
                  <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center text-primary font-medium">
                    {index + 1}
                  </div>
                </div>
                <div className="col-span-10">
                  <Textarea
                    rows={2}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                  />
                </div>
                <div className="col-span-1 flex justify-center pt-3">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeInstruction(index)}
                    disabled={instructions.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end space-x-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="submit">
            {recipe ? t('common.save') : t('recipes.createRecipe')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RecipeForm;
