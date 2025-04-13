
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookmarkIcon, Plus } from 'lucide-react';
import AppPage from '@/components/ui/app-page';
import SavedRecipesList from '@/components/features/recipe/SavedRecipesList';
import { Button } from '@/components/ui/button';
import { useRecipes } from '@/hooks/useRecipes';
import { Link } from 'react-router-dom';

const RecipeCollectionPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  return (
    <AppPage
      title={t('recipes.recipeCollection')}
      icon={<BookmarkIcon className="h-5 w-5" />}
      subtitle={t('recipes.saveToAccess')}
      actions={
        <Button asChild>
          <Link to="/recipes/create">
            <Plus className="h-4 w-4 mr-1" />
            {t('recipes.createRecipe')}
          </Link>
        </Button>
      }
    >
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t('navigation.recipes')}</TabsTrigger>
          <TabsTrigger value="saved">{t('recipes.savedRecipes')}</TabsTrigger>
          <TabsTrigger value="custom">{t('recipes.customRecipes')}</TabsTrigger>
          <TabsTrigger value="favorites">{t('recipes.favoriteRecipes')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          <SavedRecipesList showTitle={false} />
        </TabsContent>
        
        <TabsContent value="saved" className="space-y-6">
          <SavedRecipesList showSavedOnly showTitle={false} />
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-6">
          <SavedRecipesList showCustomOnly showTitle={false} />
        </TabsContent>
        
        <TabsContent value="favorites" className="space-y-6">
          <SavedRecipesList showFavoritesOnly showTitle={false} />
        </TabsContent>
      </Tabs>
    </AppPage>
  );
};

export default RecipeCollectionPage;
