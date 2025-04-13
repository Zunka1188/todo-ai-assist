
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookmarkIcon } from 'lucide-react';
import AppPage from '@/components/ui/app-page';
import SavedRecipesList from '@/components/features/recipe/SavedRecipesList';
import { useRecipes } from '@/hooks/useRecipes';

const SavedRecipesPage: React.FC = () => {
  const { favorites } = useRecipes();
  
  return (
    <AppPage
      title="Saved Recipes"
      icon={<BookmarkIcon className="h-5 w-5" />}
      subtitle="Your collection of saved and custom recipes"
    >
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Recipes</TabsTrigger>
          <TabsTrigger value="custom">Custom Recipes</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          <SavedRecipesList showTitle={false} />
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

export default SavedRecipesPage;
