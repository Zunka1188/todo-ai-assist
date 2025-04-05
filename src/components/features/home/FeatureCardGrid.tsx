
import React from 'react';
import { ShoppingBag, Calendar, File, Cloud } from 'lucide-react';
import FeatureCard from '@/components/features/FeatureCard';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import AppHeader from '@/components/layout/AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';

interface FeatureCardGridProps {
  className?: string;
}

const FeatureCardGrid: React.FC<FeatureCardGridProps> = ({ className }) => {
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();

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
      title: 'Weather',
      description: 'Check forecast and conditions',
      icon: Cloud,
      to: '/weather'
    }
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <AppHeader 
        title="Features" 
        subtitle="Organize your life with AI-powered tools"
        className={cn(
          "font-semibold section-header",
          theme === 'light' ? "text-primary" : "text-white"
        )}
      />
      
      <div className={cn("grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-4", className)}>
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
  );
};

export default FeatureCardGrid;
