import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AppPage from '@/components/ui/app-page';
import { recipes } from '@/data/recipes';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Flame, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const RecipePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [servings, setServings] = useState<number>(1);
  const [selectedDiet, setSelectedDiet] = useState<string>('default');
  
  useEffect(() => {
    if (id) {
      // Find the recipe by ID when on a specific recipe page
      const foundRecipe = recipes.find(r => r.id === id);
      
      if (foundRecipe) {
        // Cast the recipe type to match Recipe type from @/types/recipe
        setRecipe(foundRecipe as unknown as Recipe);
      } else {
        setRecipe(null);
        toast({
          title: "Recipe Not Found",
          description: `No recipe found with ID: ${id}`,
          variant: "destructive"
        });
      }
    }
    setLoading(false);
  }, [id]);
  
  // Calculate scaled ingredient quantity
  const calculateQuantity = (quantity: number, scalable: boolean): number | string => {
    if (!scalable) return quantity;
    const scaled = quantity * servings;
    return Number.isInteger(scaled) ? scaled : scaled.toFixed(1);
  };
  
  // Get ingredient list based on selected diet
  const getIngredients = () => {
    if (!recipe) return [];
    
    if (selectedDiet === 'default' || !recipe.ingredients[selectedDiet as keyof typeof recipe.ingredients]) {
      return recipe.ingredients.default;
    }
    
    return recipe.ingredients[selectedDiet as keyof typeof recipe.ingredients] || [];
  };

  // If we're on the recipes list page (no ID)
  if (!id) {
    return (
      <AppPage 
        title="Recipes" 
        subtitle="Browse all recipes"
        isLoading={loading}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-card rounded-lg shadow p-4">
              <img 
                src={recipe.image || '/placeholder.svg'} 
                alt={recipe.name} 
                className="w-full h-48 object-cover rounded-md mb-2" 
              />
              <h3 className="text-lg font-medium">{recipe.name}</h3>
              <p className="text-muted-foreground text-sm capitalize">{recipe.cuisine} • {recipe.category}</p>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{recipe.prepTime + recipe.cookTime} min</span>
                <Flame className="h-4 w-4 ml-3 mr-1" />
                <span>{recipe.calories} kcal</span>
              </div>
              <Button asChild className="w-full mt-3">
                <a href={`/recipes/${recipe.id}`}>View Recipe</a>
              </Button>
            </div>
          ))}
        </div>
      </AppPage>
    );
  }

  return (
    <AppPage 
      title={recipe?.name || "Recipe"} 
      subtitle={recipe ? `${recipe.cuisine.charAt(0).toUpperCase() + recipe.cuisine.slice(1)} • ${recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}` : ""}
      isLoading={loading}
      error={recipe ? null : "Recipe not found"}
      actions={
        <Button variant="outline" size="sm" asChild>
          <a href="/recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Recipes
          </a>
        </Button>
      }
    >
      {recipe && (
        <div className="space-y-6">
          {/* Hero Image */}
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
            <img 
              src={recipe.image || '/placeholder.svg'} 
              alt={recipe.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          
          {/* Recipe Info */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-secondary/50 p-3 rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-1" />
              <p className="text-sm font-medium">Prep Time</p>
              <p className="text-muted-foreground">{recipe.prepTime} min</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-lg">
              <Flame className="h-5 w-5 mx-auto mb-1" />
              <p className="text-sm font-medium">Calories</p>
              <p className="text-muted-foreground">{recipe.calories} kcal</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-lg">
              <User className="h-5 w-5 mx-auto mb-1" />
              <p className="text-sm font-medium">Servings</p>
              <div className="flex items-center justify-center mt-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 rounded-full"
                  onClick={() => setServings(prev => Math.max(1, prev - 1))}
                  disabled={servings <= 1}
                >-</Button>
                <span className="mx-2">{servings}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 rounded-full"
                  onClick={() => setServings(prev => prev + 1)}
                >+</Button>
              </div>
            </div>
          </div>
          
          {/* Diet Selection */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedDiet === 'default' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedDiet('default')}
            >
              Regular
            </Button>
            {recipe.ingredients.vegan && (
              <Button 
                variant={selectedDiet === 'vegan' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedDiet('vegan')}
              >
                Vegan
              </Button>
            )}
            {recipe.ingredients.vegetarian && (
              <Button 
                variant={selectedDiet === 'vegetarian' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedDiet('vegetarian')}
              >
                Vegetarian
              </Button>
            )}
            {recipe.ingredients.glutenFree && (
              <Button 
                variant={selectedDiet === 'glutenFree' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedDiet('glutenFree')}
              >
                Gluten Free
              </Button>
            )}
            {recipe.ingredients.lowCarb && (
              <Button 
                variant={selectedDiet === 'lowCarb' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedDiet('lowCarb')}
              >
                Low Carb
              </Button>
            )}
          </div>
          
          {/* Ingredients and Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
              <ul className="space-y-2">
                {getIngredients().map((ingredient, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">•</span>
                    <span>
                      {calculateQuantity(ingredient.quantity, ingredient.scalable)} {ingredient.unit} {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-3">Instructions</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="ml-5 list-decimal">
                    <p>{instruction}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          {/* Nutritional Information */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Nutritional Information</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-secondary/50 p-3 rounded-lg text-center">
                <p className="text-sm font-medium">Calories</p>
                <p className="text-muted-foreground">{recipe.nutritionalInfo.calories} kcal</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg text-center">
                <p className="text-sm font-medium">Protein</p>
                <p className="text-muted-foreground">{recipe.nutritionalInfo.protein}g</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg text-center">
                <p className="text-sm font-medium">Carbs</p>
                <p className="text-muted-foreground">{recipe.nutritionalInfo.carbohydrates}g</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg text-center">
                <p className="text-sm font-medium">Fat</p>
                <p className="text-muted-foreground">{recipe.nutritionalInfo.fat}g</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg text-center">
                <p className="text-sm font-medium">Fiber</p>
                <p className="text-muted-foreground">{recipe.nutritionalInfo.fiber}g</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppPage>
  );
};

export default RecipePage;
