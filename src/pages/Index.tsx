
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, List, Calendar, File, Upload } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import ScanButton from '@/components/features/ScanButton';
import FeatureCard from '@/components/features/FeatureCard';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import TaskWidget from '@/components/widgets/TaskWidget';
import SpendingWidget from '@/components/widgets/SpendingWidget';

const Index = () => {
  const navigate = useNavigate();

  const handleScan = () => {
    navigate('/scan');
  };

  const featureCards = [
    {
      title: 'Shopping List',
      description: 'Manage items to buy',
      icon: List,
      to: '/shopping'
    },
    {
      title: 'Calendar',
      description: 'Track events and schedule',
      icon: Calendar,
      to: '/calendar'
    },
    {
      title: 'Documents',
      description: 'Organize scanned files',
      icon: File,
      to: '/documents'
    },
    {
      title: 'Upload',
      description: 'Import existing images',
      icon: Upload,
      to: '/upload'
    }
  ];

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">ToDo</h1>
        <p className="text-muted-foreground">Your All-in-One AI-Powered Assistant</p>
      </div>

      {/* Main scan button */}
      <div className="flex justify-center my-6 sm:my-8">
        <ScanButton 
          className="transform hover:scale-105 transition-transform" 
          onScan={handleScan}
        />
      </div>

      {/* Widgets section */}
      <div className="space-y-4">
        <AppHeader 
          title="Widgets" 
          subtitle="Quick access to your information"
          className="text-primary font-semibold"
        />
        
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <CalendarWidget />
          <TaskWidget />
          <SpendingWidget />
        </div>
      </div>

      {/* Feature cards */}
      <div className="space-y-4">
        <AppHeader 
          title="Features" 
          subtitle="Organize your life with AI-powered tools"
          className="text-primary font-semibold"
        />
        
        <div className="dashboard-grid">
          {featureCards.map((card) => (
            <FeatureCard 
              key={card.title} 
              title={card.title}
              description={card.description}
              icon={card.icon}
              to={card.to}
            />
          ))}
        </div>
      </div>

      {/* Quick info */}
      <div className="bg-todo-purple/5 dark:bg-todo-purple/20 p-6 rounded-xl border border-todo-purple/10 dark:border-todo-purple/30">
        <h3 className="font-medium text-todo-purple-dark dark:text-todo-purple-light mb-2">
          Your AI-Powered Assistant
        </h3>
        <p className="text-sm text-muted-foreground">
          ToDo helps you scan, organize, and manage everything in your life. 
          Use the camera to scan items, documents, or receipts, and let AI do the rest.
        </p>
      </div>
    </div>
  );
};

export default Index;
