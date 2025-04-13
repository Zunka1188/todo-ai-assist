
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Edit } from 'lucide-react';
import AppPage from '@/components/ui/app-page';
import RecipeForm from '@/components/features/recipe/RecipeForm';
import { Recipe } from '@/types/recipe';
import { useRecipes } from '@/hooks/useRecipes';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const EditRecipePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { recipeId } = useParams<{ recipeId: string }>();
  const { userRecipes, savedRecipes, customRecipes, saveCustomRecipe, saveRecipe } = useRecipes();
  
  const allRecipes = [...(userRecipes || []), ...(savedRecipes || []), ...(customRecipes || [])];
  const recipe = allRecipes.find(r => r.id === recipeId);
  
  const handleSubmit = (updatedRecipe: Recipe) => {
    // Check if this is a custom recipe or a saved recipe
    if (updatedRecipe.id?.startsWith('custom-')) {
      saveCustomRecipe(updatedRecipe);
    } else {
      saveRecipe(updatedRecipe);
    }
    navigate('/recipes/collection');
  };
  
  const handleCancel = () => {
    navigate(-1);
  };
  
  if (!recipeId) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Recipe ID is missing.</AlertDescription>
      </Alert>
    );
  }
  
  if (!recipe) {
    return (
      <AppPage
        title={t('recipes.editRecipe')}
        icon={<Edit className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppPage>
    );
  }
  
  return (
    <AppPage
      title={t('recipes.editRecipe')}
      icon={<Edit className="h-5 w-5" />}
      subtitle={recipe.name}
    >
      <RecipeForm
        recipe={recipe}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </AppPage>
  );
};

export default EditRecipePage;
