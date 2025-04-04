
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Calendar, File, CreditCard, HelpCircle } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import ScanButton from '@/components/features/ScanButton';
import FeatureCard from '@/components/features/FeatureCard';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import TaskWidget from '@/components/widgets/TaskWidget';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();

  const handleScan = () => {
    navigate('/scan');
  };

  const featureCards = [
    {
      title: 'Shopping',
      description: 'Manage items to buy',
      icon: ShoppingBag,
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
      title: 'Spending',
      description: 'Track expenses and budgets',
      icon: CreditCard,
      to: '/spending'
    }
  ];

  return (
    <div className="space-y-5 py-3 sm:space-y-6 sm:py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className={cn(
          "text-3xl font-bold",
          theme === 'light' ? "text-foreground" : "text-white"
        )}>ToDo</h1>
        <p className="text-muted-foreground dark:text-gray-300">Your All-in-One AI-Powered Assistant</p>
      </div>

      {/* Main scan button */}
      <div className="flex justify-center my-4 sm:my-6">
        <ScanButton 
          className="transform hover:scale-105 transition-transform active:scale-95 touch-manipulation" 
          onScan={handleScan}
        />
      </div>

      {/* Widgets section */}
      <div className="space-y-3 sm:space-y-4">
        <AppHeader 
          title="Widgets" 
          subtitle="Quick access to your information"
          className={theme === 'light' ? "text-primary font-semibold section-header" : "text-white font-semibold section-header"}
        />
        
        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
          <CalendarWidget />
          <TaskWidget />
        </div>
      </div>

      {/* Feature cards */}
      <div className="space-y-3 sm:space-y-4">
        <AppHeader 
          title="Features" 
          subtitle="Organize your life with AI-powered tools"
          className={theme === 'light' ? "text-primary font-semibold section-header" : "text-white font-semibold section-header"}
        />
        
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
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
      <div className="bg-todo-purple/5 dark:bg-todo-purple/20 p-4 sm:p-6 rounded-xl border border-todo-purple/10 dark:border-todo-purple/30">
        <h3 className={cn(
          "font-medium mb-2",
          theme === 'light' 
            ? "text-todo-purple-dark" 
            : "text-todo-purple-light"
        )}>
          Your AI-Powered Assistant
        </h3>
        <p className="text-sm text-muted-foreground dark:text-gray-300 mb-4">
          ToDo helps you scan, organize, and manage everything in your life. 
          Use the camera to scan items, documents, or receipts, and let AI do the rest.
        </p>
        <div className="flex justify-center">
          <a 
            href="/troubleshoot" 
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-todo-purple/10 hover:bg-todo-purple/20 transition-colors text-todo-purple"
          >
            <HelpCircle className="h-4 w-4" />
            Need help? Visit our troubleshooting page
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
