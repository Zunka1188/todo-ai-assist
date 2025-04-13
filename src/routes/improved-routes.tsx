
import React from 'react';
import { RouteObject } from 'react-router-dom';

import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import ScanPage from '@/pages/ScanPage';
import UploadPage from '@/pages/UploadPage';
import DocumentsPage from '@/pages/DocumentsPage';
import DocumentsSubtabPage from '@/pages/DocumentsSubtabPage';
import ShoppingPage from '@/pages/ShoppingPage';
import CalendarPage from '@/pages/CalendarPage';
import WeatherPage from '@/pages/WeatherPage';
import TasksPage from '@/pages/TasksPage';
import SettingsPage from '@/pages/SettingsPage';
import TroubleshootPage from '@/pages/TroubleshootPage';
import ProduceRecognitionPage from '@/pages/ProduceRecognitionPage';
import AIModelsPage from '@/pages/AIModelsPage';
import AITrainingPage from '@/pages/AITrainingPage';
import RecipePage from '@/pages/RecipePage';
import SavedRecipesPage from '@/pages/SavedRecipesPage';

import RouteGuard from '@/components/auth/RouteGuard';

// Define the improved routes
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/scan',
    element: <ScanPage />,
  },
  {
    path: '/upload',
    element: <UploadPage />,
  },
  {
    path: '/documents',
    element: <RouteGuard><DocumentsPage /></RouteGuard>,
    children: [
      {
        path: ':subtab',
        element: <DocumentsSubtabPage />,
      },
    ],
  },
  {
    path: '/shopping',
    element: <ShoppingPage />,
  },
  {
    path: '/calendar',
    element: <CalendarPage />,
  },
  {
    path: '/calendar/:view',
    element: <CalendarPage />,
  },
  {
    path: '/weather',
    element: <WeatherPage />,
  },
  {
    path: '/tasks',
    element: <TasksPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '/troubleshoot',
    element: <TroubleshootPage />,
  },
  {
    path: '/produce',
    element: <ProduceRecognitionPage />,
  },
  {
    path: '/ai/models',
    element: <AIModelsPage />,
  },
  {
    path: '/ai/training',
    element: <AITrainingPage />,
  },
  {
    path: '/recipes',
    element: <RecipePage />,
  },
  {
    path: '/recipes/:recipeId',
    element: <RecipePage />,
  },
  {
    path: '/saved-recipes',
    element: <SavedRecipesPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];
