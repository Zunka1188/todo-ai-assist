import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import AppHeader from '@/components/layout/AppHeader';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Laptop, 
  Smartphone, 
  Wifi, 
  Camera, 
  Bell, 
  RefreshCw, 
  Settings, 
  HelpCircle,
  CalendarIcon 
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TroubleshootItemProps {
  title: string;
  solution: React.ReactNode;
  category: string;
  platform: 'all' | 'mobile' | 'desktop';
  icon?: React.ReactNode;
}

const TroubleshootPage = () => {
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activePlatform, setActivePlatform] = useState<'all' | 'mobile' | 'desktop'>('all');

  const troubleshootItems: TroubleshootItemProps[] = [
    {
      title: "App crashes when opening",
      solution: (
        <div className="space-y-2">
          <p>Try the following steps:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Close all background apps</li>
            <li>Restart your device</li>
            <li>Clear app cache (Settings &gt; Apps &gt; ToDo &gt; Storage &gt; Clear Cache)</li>
            <li>Update the app to the latest version</li>
          </ol>
        </div>
      ),
      category: "general",
      platform: "all",
      icon: <RefreshCw className="h-5 w-5" />
    },
    {
      title: "Camera doesn't activate when scanning",
      solution: (
        <div className="space-y-2">
          <p>Check the following:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ensure camera permissions are granted in your device settings</li>
            <li>Make sure another app isn't currently using the camera</li>
            <li>Try restarting the app</li>
            <li>On iOS, check if camera access is enabled in Privacy settings</li>
          </ul>
        </div>
      ),
      category: "scanning",
      platform: "all",
      icon: <Camera className="h-5 w-5" />
    },
    {
      title: "Calendar events not syncing",
      solution: (
        <div className="space-y-2">
          <p>To fix calendar syncing issues:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Check your internet connection</li>
            <li>Verify you have granted calendar permission to the app</li>
            <li>Manually refresh by pulling down on the calendar screen</li>
            <li>Ensure you're signed in to your account</li>
          </ul>
        </div>
      ),
      category: "calendar",
      platform: "all",
      icon: <CalendarIcon className="h-5 w-5" />
    },
    {
      title: "Notifications not working",
      solution: (
        <div className="space-y-2">
          <p>If you're not receiving notifications:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Check notification settings for the app in your device settings</li>
            <li>Ensure Do Not Disturb mode is not enabled</li>
            <li>Verify notifications are enabled within the app settings</li>
            <li>On Android, check battery optimization is disabled for the app</li>
          </ul>
        </div>
      ),
      category: "notifications",
      platform: "all",
      icon: <Bell className="h-5 w-5" />
    },
    {
      title: "App feels slow on older mobile devices",
      solution: (
        <div className="space-y-2">
          <p>To improve performance on older devices:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Close background apps running on your device</li>
            <li>Clear app cache in settings</li>
            <li>Reduce animations in accessibility settings</li>
            <li>Make sure your device has enough free storage</li>
          </ul>
        </div>
      ),
      category: "performance",
      platform: "mobile",
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      title: "Website not loading properly on desktop",
      solution: (
        <div className="space-y-2">
          <p>If the app isn't loading correctly on desktop:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Try using a different web browser (Chrome, Firefox, Safari)</li>
            <li>Clear your browser cache and cookies</li>
            <li>Disable browser extensions that might interfere</li>
            <li>Check if your browser is updated to the latest version</li>
          </ul>
        </div>
      ),
      category: "web",
      platform: "desktop",
      icon: <Laptop className="h-5 w-5" />
    },
    {
      title: "Having trouble with internet connection",
      solution: (
        <div className="space-y-2">
          <p>If you're experiencing connectivity issues:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Check if you have an active internet connection</li>
            <li>Try switching between Wi-Fi and mobile data</li>
            <li>Reset your network settings</li>
            <li>Move closer to your Wi-Fi router if signal is weak</li>
          </ul>
        </div>
      ),
      category: "connectivity",
      platform: "all",
      icon: <Wifi className="h-5 w-5" />
    },
    {
      title: "Settings not saving on mobile app",
      solution: (
        <div className="space-y-2">
          <p>If your settings aren't being saved:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Make sure you're tapping the Save button after changes</li>
            <li>Check if your device has enough storage space</li>
            <li>Try closing and reopening the app</li>
            <li>Update to the latest version of the app</li>
          </ul>
        </div>
      ),
      category: "settings",
      platform: "mobile",
      icon: <Settings className="h-5 w-5" />
    }
  ];

  const filteredItems = troubleshootItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesPlatform = activePlatform === 'all' || item.platform === 'all' || item.platform === activePlatform;
    
    return matchesSearch && matchesCategory && matchesPlatform;
  });

  const categories = ['all', ...Array.from(new Set(troubleshootItems.map(item => item.category)))];

  return (
    <div className="space-y-6">
      <AppHeader 
        title="Troubleshoot" 
        subtitle="Find solutions to common problems"
        icon={<HelpCircle className="h-6 w-6 text-todo-purple" />}
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search for issues..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button 
          variant={activePlatform === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActivePlatform('all')}
          className="flex items-center gap-1"
        >
          All Platforms
        </Button>
        <Button 
          variant={activePlatform === 'mobile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActivePlatform('mobile')}
          className="flex items-center gap-1"
        >
          <Smartphone className="h-4 w-4" />
          Mobile
        </Button>
        <Button 
          variant={activePlatform === 'desktop' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActivePlatform('desktop')}
          className="flex items-center gap-1"
        >
          <Laptop className="h-4 w-4" />
          Desktop
        </Button>
      </div>

      <div className={cn(
        "flex gap-2 py-1",
        isMobile && "overflow-x-auto pb-2 hide-scrollbar"
      )}>
        {categories.map((category) => (
          <Button 
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className={cn(
              "whitespace-nowrap capitalize",
              isMobile && "flex-shrink-0"
            )}
          >
            {category}
          </Button>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-6 text-center">
          <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        {filteredItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <div className={cn(
                  "p-1.5 rounded-md",
                  theme === 'light' ? "bg-todo-purple/10" : "bg-todo-purple/20"
                )}>
                  {item.icon || <HelpCircle className="h-4 w-4 text-todo-purple" />}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {item.category} • 
                    {item.platform === 'all' 
                      ? ' All platforms' 
                      : item.platform === 'mobile' 
                        ? ' Mobile only' 
                        : ' Desktop only'
                    }
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm pl-10">
              {item.solution}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className={cn(
        "rounded-xl p-4 border border-dashed border-todo-purple/30 mt-6 text-center",
        theme === 'light' ? "bg-todo-purple/5" : "bg-todo-purple/10"
      )}>
        <h3 className="font-medium text-todo-purple mb-2">Still need help?</h3>
        <p className="text-sm text-muted-foreground mb-3">
          If you couldn't find a solution to your problem, contact our support team.
        </p>
        <Button className="bg-todo-purple hover:bg-todo-purple/90">
          Contact Support
        </Button>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default TroubleshootPage;
