
import React from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

interface TabItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  content?: React.ReactNode;
  disabled?: boolean;
}

interface AppTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  tabsListClassName?: string;
  fullWidth?: boolean;
  renderContent?: boolean;
}

const AppTabs: React.FC<AppTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  orientation = 'horizontal',
  className,
  tabsListClassName,
  fullWidth = true,
  renderContent = true
}) => {
  const { isMobile } = useIsMobile();
  
  return (
    <Tabs
      value={activeTab}
      onValueChange={onChange}
      orientation={orientation}
      className={cn(
        'w-full',
        className
      )}
    >
      <TabsList 
        className={cn(
          orientation === 'horizontal' 
            ? `grid grid-cols-${tabs.length} ${fullWidth ? 'w-full' : ''}` 
            : 'grid grid-cols-1 h-full',
          tabsListClassName
        )}
      >
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className={cn(
              'flex items-center justify-center p-2 touch-manipulation',
              isMobile ? 'text-xs py-1.5' : ''
            )}
          >
            {tab.icon && (
              <tab.icon 
                className={cn(
                  'h-4 w-4', 
                  orientation === 'horizontal' ? 'mr-2' : 'mb-2'
                )} 
              />
            )}
            <span>
              {isMobile && tab.shortLabel ? tab.shortLabel : tab.label}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {renderContent && tabs.map(tab => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default AppTabs;
