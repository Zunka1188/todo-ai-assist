
import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { recipes } from '@/data/recipes';
import { Recipe, DietaryRestriction, Cuisine } from '@/types/recipe';
import { useTheme } from '@/hooks/use-theme';

interface RecipeSearchProps {
  onSelectRecipe: (recipe: Recipe) => void;
  selectedDietaryRestrictions?: string[];
}

// Define dietary restrictions and cuisines
const dietaryRestrictions: { value: DietaryRestriction; label: string }[] = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'nut-free', label: 'Nut-Free' },
  { value: 'low-carb', label: 'Low-Carb' }
];

const cuisines: { value: Cuisine; label: string }[] = [
  { value: 'italian', label: 'Italian' },
  { value: 'french', label: 'French' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'indian', label: 'Indian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'thai', label: 'Thai' },
  { value: 'polish', label: 'Polish' },
  { value: 'greek', label: 'Greek' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'korean', label: 'Korean' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'moroccan', label: 'Moroccan' },
  { value: 'lebanese', label: 'Lebanese' }
];

const RecipeSearch: React.FC<RecipeSearchProps> = ({ onSelectRecipe, selectedDietaryRestrictions = [] }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    dietary: string[];
    cuisines: string[];
  }>({
    dietary: selectedDietaryRestrictions,
    cuisines: [],
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const filtered = recipes.filter(recipe => {
      // Filter by search term
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by dietary restrictions
      const matchesDietary = activeFilters.dietary.length === 0 || 
                           activeFilters.dietary.every(restriction => 
                             recipe.dietaryRestrictions.includes(restriction));
      
      // Filter by cuisine
      const matchesCuisine = activeFilters.cuisines.length === 0 || 
                           activeFilters.cuisines.includes(recipe.cuisine);
      
      return matchesSearch && matchesDietary && matchesCuisine;
    });
    
    setFilteredRecipes(filtered);
  }, [searchTerm, activeFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setActiveFilters(prev => {
      if (prev.dietary.includes(restriction)) {
        return { ...prev, dietary: prev.dietary.filter(r => r !== restriction) };
      } else {
        return { ...prev, dietary: [...prev.dietary, restriction] };
      }
    });
  };

  const toggleCuisine = (cuisine: string) => {
    setActiveFilters(prev => {
      if (prev.cuisines.includes(cuisine)) {
        return { ...prev, cuisines: prev.cuisines.filter(c => c !== cuisine) };
      } else {
        return { ...prev, cuisines: [...prev.cuisines, cuisine] };
      }
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({ dietary: [], cuisines: [] });
    setSearchTerm('');
  };

  const getTotalActiveFilters = () => {
    return activeFilters.dietary.length + activeFilters.cuisines.length;
  };

  return (
    <div className="mb-4 w-full">
      <div className="flex flex-col space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for recipes..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-14"
          />
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8",
                  getTotalActiveFilters() > 0 && "text-primary"
                )}
              >
                <Filter className="h-4 w-4" />
                {getTotalActiveFilters() > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center">
                    {getTotalActiveFilters()}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">Filters</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto py-1 px-2 text-xs" 
                    onClick={clearAllFilters}
                  >
                    Clear all
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Dietary Restrictions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {dietaryRestrictions.map((restriction) => (
                      <Button
                        key={restriction.value}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDietaryRestriction(restriction.value)}
                        className={cn(
                          "justify-start h-auto py-1.5 text-xs",
                          activeFilters.dietary.includes(restriction.value) && 
                          "bg-primary/10 border-primary/30"
                        )}
                      >
                        {activeFilters.dietary.includes(restriction.value) && (
                          <Check className="mr-1 h-3 w-3 text-primary" />
                        )}
                        {restriction.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Cuisines</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {cuisines.map((cuisine) => (
                      <Button
                        key={cuisine.value}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCuisine(cuisine.value)}
                        className={cn(
                          "justify-start h-auto py-1.5 text-xs",
                          activeFilters.cuisines.includes(cuisine.value) && 
                          "bg-primary/10 border-primary/30"
                        )}
                      >
                        {activeFilters.cuisines.includes(cuisine.value) && (
                          <Check className="mr-1 h-3 w-3 text-primary" />
                        )}
                        {cuisine.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Active Filters Display */}
        {getTotalActiveFilters() > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.dietary.map(filter => (
              <Badge 
                key={`dietary-${filter}`} 
                variant="outline"
                className="bg-primary/10 text-xs py-0.5 pl-2"
              >
                {dietaryRestrictions.find(r => r.value === filter)?.label}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 ml-1 p-0"
                  onClick={() => toggleDietaryRestriction(filter)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {activeFilters.cuisines.map(filter => (
              <Badge 
                key={`cuisine-${filter}`} 
                variant="outline"
                className="bg-primary/10 text-xs py-0.5 pl-2"
              >
                {cuisines.find(c => c.value === filter)?.label}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 ml-1 p-0"
                  onClick={() => toggleCuisine(filter)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {getTotalActiveFilters() > 0 && (
              <Button 
                variant="ghost" 
                className="text-xs h-6 px-2 py-0"
                onClick={clearAllFilters}
              >
                Clear all
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Results List */}
      <ScrollArea className="h-[280px] mt-3 pr-3">
        {filteredRecipes.length > 0 ? (
          <div className="space-y-2">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe)}
                className={cn(
                  "p-3 rounded-md cursor-pointer transition-colors",
                  theme === "dark" 
                    ? "hover:bg-slate-800 border border-slate-700" 
                    : "hover:bg-slate-100 border border-slate-200"
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">{recipe.name}</h4>
                    <p className="text-xs text-muted-foreground capitalize">{recipe.cuisine} • {recipe.prepTime + recipe.cookTime} mins</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {recipe.dietaryRestrictions.slice(0, 3).map(restriction => (
                        <Badge 
                          key={`${recipe.id}-${restriction}`} 
                          variant="outline" 
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          {restriction}
                        </Badge>
                      ))}
                      {recipe.dietaryRestrictions.length > 3 && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                          +{recipe.dietaryRestrictions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground">No recipes match your search criteria</p>
            <Button 
              variant="link" 
              className="mt-2 h-auto p-0"
              onClick={clearAllFilters}
            >
              Clear filters
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default RecipeSearch;
