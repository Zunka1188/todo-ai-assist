
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Book, PlusCircle } from 'lucide-react';
import AppPage from '@/components/ui/app-page';
import RecipeForm from '@/components/features/recipe/RecipeForm';
import { Recipe } from '@/types/recipe';
import { useRecipes } from '@/hooks/useRecipes';

const CreateRecipePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { saveCustomRecipe } = useRecipes();
  
  const handleSubmit = (recipe: Recipe) => {
    saveCustomRecipe(recipe);
    navigate('/recipes/collection');
  };
  
  const handleCancel = () => {
    navigate(-1);
  };
  
  return (
    <AppPage
      title={t('recipes.createRecipe')}
      icon={<PlusCircle className="h-5 w-5" />}
      subtitle={t('recipes.createRecipe')}
    >
      <RecipeForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </AppPage>
  );
};

export default CreateRecipePage;
