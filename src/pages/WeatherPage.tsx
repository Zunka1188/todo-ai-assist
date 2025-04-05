
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { WeatherWidget } from '@/components/widgets/WidgetsIndex';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin } from 'lucide-react';

const WeatherPage = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <PageLayout
      title="Weather"
      subtitle="Current conditions and forecast"
      actions={
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleRefresh}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
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
      }
    >
      <div className="space-y-6">
        <WeatherWidget expanded={true} />
      </div>
    </PageLayout>
  );
};

export default WeatherPage;
