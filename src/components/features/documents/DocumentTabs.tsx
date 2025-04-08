
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChefHat, Dumbbell, FileArchive, Plane, Calendar, FileText, Shirt } from 'lucide-react';
import { DocumentCategory } from './types';

interface DocumentTabsProps {
  activeTab: DocumentCategory;
  setActiveTab: (tab: DocumentCategory) => void;
  isMobile: boolean;
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({ activeTab, setActiveTab, isMobile }) => {
  return (
    <TabsList className="grid grid-cols-7 w-full mb-4">
      <TabsTrigger value="style" className="flex items-center gap-2">
        <Shirt className="h-4 w-4" />
        <span className={isMobile ? "sr-only" : ""}>Style</span>
      </TabsTrigger>
      <TabsTrigger value="recipes" className="flex items-center gap-2">
        <ChefHat className="h-4 w-4" />
        <span className={isMobile ? "sr-only" : ""}>Recipes</span>
      </TabsTrigger>
      <TabsTrigger value="travel" className="flex items-center gap-2">
        <Plane className="h-4 w-4" />
        <span className={isMobile ? "sr-only" : ""}>Travel</span>
      </TabsTrigger>
      <TabsTrigger value="fitness" className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4" />
        <span className={isMobile ? "sr-only" : ""}>Fitness</span>
      </TabsTrigger>
      <TabsTrigger value="events" className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span className={isMobile ? "sr-only" : ""}>Events</span>
      </TabsTrigger>
      <TabsTrigger value="other" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className={isMobile ? "sr-only" : ""}>Other</span>
      </TabsTrigger>
      <TabsTrigger value="files" className="flex items-center gap-2">
        <FileArchive className="h-4 w-4" />
        <span className={isMobile ? "sr-only" : ""}>Files</span>
      </TabsTrigger>
    </TabsList>
  );
};
