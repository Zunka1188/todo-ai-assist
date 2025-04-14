
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, Check, ChevronDown, X, Scroll, SlidersHorizontal, Clock, Users, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Recipe } from '@/data/recipes/types';
import { useTheme } from '@/hooks/use-theme';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DietaryRestrictionType, RecipeSearchProps } from './types';
import { useDebounce } from '@/hooks/useDebounce';

import { recipes } from '@/data/recipes';

// Cache for search results
const recipeSearchCache = new Map<string, Recipe[]>();

const dietaryRestrictions: { value: DietaryRestrictionType; label: string }[] = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'low-carb', label: 'Low-Carb' },
  { value: 'nut-free', label: 'Nut-Free' }
];

const cuisines = [
  { value: 'italian', label: 'Italian' },
  { value: 'french', label: 'French' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'indian', label: 'Indian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'thai', label: 'Thai' },
  { value: 'mediterranean', label: 'Mediterranean' }
];

type SortOption = 'name' | 'prepTime' | 'cookTime' | 'totalTime';

// Generate cache key from search parameters
const generateCacheKey = (
  searchTerm: string, 
  dietary: DietaryRestrictionType[], 
  cuisines: string[], 
  sortBy: SortOption
): string => {
  return [
    searchTerm.toLowerCase().trim(),
    dietary.sort().join(','),
    cuisines.sort().join(','),
    sortBy
  ].join('|');
};

const RecipeSearch: React.FC<RecipeSearchProps> = ({
  onSelectRecipe,
  selectedDietaryRestrictions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    dietary: DietaryRestrictionType[];
    cuisines: string[];
  }>({
    dietary: selectedDietaryRestrictions || [],
    cuisines: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [servingSize, setServingSize] = useState<number>(4);
  const { theme } = useTheme();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (selectedDietaryRestrictions && selectedDietaryRestrictions.length > 0) {
      setActiveFilters(prev => ({
        ...prev,
        dietary: selectedDietaryRestrictions
      }));
    }
  }, [selectedDietaryRestrictions]);

  // Memoize the filtering and sorting logic to improve performance
  const getFilteredRecipes = useCallback((
    searchTerm: string,
    activeFilters: { dietary: DietaryRestrictionType[]; cuisines: string[] },
    sortBy: SortOption
  ) => {
    // Generate cache key
    const cacheKey = generateCacheKey(
      searchTerm,
      activeFilters.dietary,
      activeFilters.cuisines,
      sortBy
    );
    
    // Check cache first
    if (recipeSearchCache.has(cacheKey)) {
      return recipeSearchCache.get(cacheKey)!;
    }

    // If not in cache, perform filtering
    let filtered = [...recipes] as Recipe[];
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (searchTerm) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(lowerSearchTerm) || 
        recipe.cuisine.toLowerCase().includes(lowerSearchTerm) ||
        recipe.category.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (activeFilters.cuisines.length > 0) {
      filtered = filtered.filter(recipe =>
        activeFilters.cuisines.includes(recipe.cuisine)
      );
    }

    if (activeFilters.dietary.length > 0) {
      filtered = filtered.filter(recipe => {
        return activeFilters.dietary.every(restriction => {
          const key = mapRestrictionToKey(restriction);
          return key ? recipe.dietaryInfo[key] : false;
        });
      });
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'prepTime':
          return a.prepTime - b.prepTime;
        case 'cookTime':
          return a.cookTime - b.cookTime;
        case 'totalTime':
          return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
        default:
          return 0;
      }
    });

    // Store in cache (limit cache size to prevent memory issues)
    if (recipeSearchCache.size > 50) {
      // Clear oldest entry if cache is too large
      const oldestKey = recipeSearchCache.keys().next().value;
      recipeSearchCache.delete(oldestKey);
    }
    recipeSearchCache.set(cacheKey, filtered);

    return filtered;
  }, []);

  useEffect(() => {
    const results = getFilteredRecipes(debouncedSearchTerm, activeFilters, sortBy);
    setFilteredRecipes(results);
    
    // Update scroll indicator
    setShowScrollIndicator(results.length > 4);
  }, [debouncedSearchTerm, activeFilters, sortBy, getFilteredRecipes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleDietaryRestriction = useCallback((restriction: DietaryRestrictionType) => {
    setActiveFilters(prev => {
      if (prev.dietary.includes(restriction)) {
        return { ...prev, dietary: prev.dietary.filter(r => r !== restriction) };
      } else {
        return { ...prev, dietary: [...prev.dietary, restriction] };
      }
    });
  }, []);

  const toggleCuisine = useCallback((cuisine: string) => {
    setActiveFilters(prev => {
      if (prev.cuisines.includes(cuisine)) {
        return { ...prev, cuisines: prev.cuisines.filter(c => c !== cuisine) };
      } else {
        return { ...prev, cuisines: [...prev.cuisines, cuisine] };
      }
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({ dietary: [], cuisines: [] });
    setSearchTerm('');
  }, []);

  const getTotalActiveFilters = useCallback(() => {
    return activeFilters.dietary.length + activeFilters.cuisines.length;
  }, [activeFilters.dietary.length, activeFilters.cuisines.length]);

  const calculateMatchingCount = useCallback((filter: DietaryRestrictionType) => {
    return (recipes as Recipe[]).filter(recipe => {
      const key = mapRestrictionToKey(filter);
      return key ? recipe.dietaryInfo[key] : false;
    }).length;
  }, []);

  const handleSelectRecipe = useCallback((recipe: Recipe) => {
    const adjustedRecipe = {
      ...recipe,
      servings: servingSize
    };
    onSelectRecipe(adjustedRecipe);
  }, [servingSize, onSelectRecipe]);

  const incrementServingSize = useCallback(() => {
    if (servingSize < 10) {
      setServingSize(prev => prev + 1);
    }
  }, [servingSize]);

  const decrementServingSize = useCallback(() => {
    if (servingSize > 1) {
      setServingSize(prev => prev - 1);
    }
  }, [servingSize]);

  const mapRestrictionToKey = (restriction: DietaryRestrictionType): keyof Recipe['dietaryInfo'] | null => {
    switch (restriction) {
      case 'vegan': return 'isVegan';
      case 'vegetarian': return 'isVegetarian';
      case 'gluten-free': return 'isGlutenFree';
      case 'dairy-free': return 'isDairyFree';
      case 'low-carb': return 'isLowCarb';
      case 'nut-free': return 'isNutFree';
      default: return null;
    }
  };

  // Compute memoized values to avoid unnecessary rerenders
  const totalActiveFilters = useMemo(() => getTotalActiveFilters(), [getTotalActiveFilters]);

  return (
    <div className="mb-4 w-full">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2 p-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-md">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Servings:</span>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 rounded-full p-0" 
                  onClick={decrementServingSize}
                  disabled={servingSize <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="font-medium mx-2">{servingSize} {servingSize === 1 ? 'person' : 'people'}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 rounded-full p-0" 
                  onClick={incrementServingSize}
                  disabled={servingSize >= 10}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Slider
              value={[servingSize]}
              onValueChange={(value) => setServingSize(value[0])}
              min={1}
              max={10}
              step={1}
              aria-label="Serving size"
              className="w-full"
            />
          </div>
        </div>
      
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for recipes..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-24"
          />
          
          <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-60 p-3" 
              align="end" 
              sideOffset={5}
              style={{ background: theme === "dark" ? "#1f2937" : "#ffffff" }}
            >
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Sort by</h3>
                <RadioGroup 
                  defaultValue="name" 
                  value={sortBy} 
                  onValueChange={(value) => setSortBy(value as SortOption)}
                  className="grid gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="name" id="sort-name" />
                    <Label htmlFor="sort-name">Name (A-Z)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prepTime" id="sort-prep" />
                    <Label htmlFor="sort-prep">Preparation time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cookTime" id="sort-cook" />
                    <Label htmlFor="sort-cook">Cooking time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="totalTime" id="sort-total" />
                    <Label htmlFor="sort-total">Total time</Label>
                  </div>
                </RadioGroup>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8",
                  totalActiveFilters > 0 && "text-primary"
                )}
              >
                <Filter className="h-4 w-4" />
                {totalActiveFilters > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center">
                    {totalActiveFilters}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-72 p-3" 
              align="end" 
              sideOffset={5}
              style={{ background: theme === "dark" ? "#1f2937" : "#ffffff" }}
            >
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
                    {dietaryRestrictions.map((restriction) => {
                      const matchCount = calculateMatchingCount(restriction.value);
                      return (
                        <Button
                          key={restriction.value}
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDietaryRestriction(restriction.value)}
                          className={cn(
                            "justify-start h-auto py-1.5 text-xs",
                            activeFilters.dietary.includes(restriction.value) && 
                            "bg-primary/10 border-primary/30 text-primary font-medium"
                          )}
                          disabled={matchCount === 0 && !activeFilters.dietary.includes(restriction.value)}
                        >
                          {activeFilters.dietary.includes(restriction.value) && (
                            <Check className="mr-1 h-3 w-3 text-primary" />
                          )}
                          <span className="flex-1">{restriction.label}</span>
                          <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">{matchCount}</Badge>
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Cuisines</h4>
                  <ScrollArea className="h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2 pr-4">
                      {cuisines.map((cuisine) => {
                        return (
                          <Button
                            key={cuisine.value}
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCuisine(cuisine.value)}
                            className={cn(
                              "justify-start h-auto py-1.5 text-xs",
                              activeFilters.cuisines.includes(cuisine.value) && 
                              "bg-primary/10 border-primary/30 text-primary font-medium"
                            )}
                          >
                            {activeFilters.cuisines.includes(cuisine.value) && (
                              <Check className="mr-1 h-3 w-3 text-primary" />
                            )}
                            <span className="flex-1">{cuisine.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {totalActiveFilters > 0 && (
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
            {totalActiveFilters > 0 && (
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

      <div className="relative mt-3">
        <ScrollArea className="h-[280px] pr-3 rounded-md overflow-hidden">
          {filteredRecipes.length > 0 ? (
            <div className="space-y-2">
              {filteredRecipes.map((recipe) => {
                const dietaryRestrictions = Object.entries(recipe.dietaryInfo)
                  .filter(([_, value]) => value === true)
                  .map(([key]) => {
                    switch(key) {
                      case 'isVegan': return 'vegan';
                      case 'isVegetarian': return 'vegetarian';
                      case 'isGlutenFree': return 'gluten-free';
                      case 'isDairyFree': return 'dairy-free';
                      case 'isLowCarb': return 'low-carb';
                      case 'isNutFree': return 'nut-free';
                      default: return '';
                    }
                  })
                  .filter(val => val !== '');
                  
                return (
                  <button
                    key={recipe.id}
                    onClick={() => handleSelectRecipe(recipe)}
                    className={cn(
                      "p-3 rounded-md cursor-pointer transition-colors w-full text-left",
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
                          <div className="flex items-center mr-2">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {recipe.prepTime}m prep • {recipe.cookTime}m cook
                            </span>
                          </div>
                          {dietaryRestrictions.slice(0, 3).map(restriction => (
                            <Badge 
                              key={`${recipe.id}-${restriction}`} 
                              variant="outline" 
                              className="text-[10px] px-1 py-0 h-4"
                            >
                              {restriction}
                            </Badge>
                          ))}
                          {dietaryRestrictions.length > 3 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                              +{dietaryRestrictions.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
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
        {showScrollIndicator && (
          <div className="absolute bottom-2 right-2 bg-primary/80 text-white rounded-full p-1.5 shadow-md">
            <Scroll className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeSearch;
