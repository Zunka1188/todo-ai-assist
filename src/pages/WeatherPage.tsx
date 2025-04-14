
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { WeatherWidget } from '@/components/widgets/WidgetsIndex';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

const WeatherPage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <PageLayout maxWidth="full">
      <div className="space-y-4 w-full">
        <div className="flex flex-col space-y-2">
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-foreground'}`}>
            Weather
          </h1>
          <p className="text-muted-foreground text-sm">
            Current conditions and forecast
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleRefresh}
          >
            <RefreshCw 
              data-testid="refresh-icon"
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} 
            />
            <span>Refresh</span>
          </Button>
          <Button 
            variant="outline"
            size="sm" 
            className="flex items-center gap-1"
          >
            <MapPin className="h-4 w-4" />
            <span>Change location</span>
          </Button>
        </div>

        <div className="w-full">
          <WeatherWidget className="w-full" />
        </div>
      </div>
    </PageLayout>
  );
};

export default WeatherPage;
