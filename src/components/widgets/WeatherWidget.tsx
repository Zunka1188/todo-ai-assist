
import React, { useState, useEffect } from 'react';
import { SunMedium, Cloud, CloudRain, CloudSnow, CloudLightning, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { WidgetWrapper } from './shared/WidgetWrapper';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export interface WeatherWidgetProps {
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className }) => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [currentWeather, setCurrentWeather] = useState({
    temp: 72,
    condition: 'Partly Cloudy',
    high: 78,
    low: 65,
    humidity: 45,
    windSpeed: 8,
    precipitation: 15,
  });
  
  const [forecast, setForecast] = useState([
    { day: 'Mon', temp: 74, condition: 'sunny' },
    { day: 'Tue', temp: 70, condition: 'cloudy' },
    { day: 'Wed', temp: 68, condition: 'rainy' },
    { day: 'Thu', temp: 72, condition: 'sunny' },
    { day: 'Fri', temp: 75, condition: 'sunny' },
  ]);

  const fetchWeatherData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setHasError(false);
    
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would fetch real weather data here
      // For now, we'll use our static data
      
      if (showRefreshing) {
        toast({
          title: "Weather Updated",
          description: "Latest weather information loaded.",
          duration: 3000,
        });
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setHasError(true);
      
      if (showRefreshing) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
      
      toast({
        title: "Weather Data Error",
        description: "Unable to retrieve weather information. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  useEffect(() => {
    fetchWeatherData();
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch(condition.toLowerCase()) {
      case 'sunny':
        return <SunMedium className="h-5 w-5 text-yellow-500" aria-hidden="true" />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="h-5 w-5 text-gray-400" aria-hidden="true" />;
      case 'rainy':
        return <CloudRain className="h-5 w-5 text-blue-400" aria-hidden="true" />;
      case 'snowy':
        return <CloudSnow className="h-5 w-5 text-blue-200" aria-hidden="true" />;
      case 'stormy':
        return <CloudLightning className="h-5 w-5 text-purple-500" aria-hidden="true" />;
      default:
        return <SunMedium className="h-5 w-5 text-yellow-500" aria-hidden="true" />;
    }
  };
  
  const handleRefresh = () => {
    fetchWeatherData(true);
  };
  
  if (isLoading) {
    return (
      <WidgetWrapper className={cn("w-full", className)}>
        <div className="flex flex-col items-center justify-center p-6">
          <div className="animate-pulse flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Loading weather data...</p>
          </div>
        </div>
      </WidgetWrapper>
    );
  }
  
  if (hasError) {
    return (
      <WidgetWrapper className={cn("w-full", className)}>
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" aria-hidden="true" />
          <h3 className="font-medium mb-1">Unable to load weather</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Please check your connection and try again
          </p>
          <Button 
            onClick={handleRefresh}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </WidgetWrapper>
    );
  }
  
  return (
    <WidgetWrapper className={cn("w-full", className)}>
      <div className="space-y-4">
        {/* Top bar with refresh button */}
        <div className="flex justify-end">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
            aria-label="Refresh weather data"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
        
        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className={cn("text-2xl font-semibold", theme === 'dark' ? "text-white" : "text-foreground")}
                aria-label={`Current temperature ${currentWeather.temp} degrees Fahrenheit`}>
              {currentWeather.temp}°F
            </h2>
            <p className="text-muted-foreground">{currentWeather.condition}</p>
          </div>
          <div aria-hidden="true">
            {getWeatherIcon(currentWeather.condition)}
          </div>
        </div>
        
        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">High</p>
            <p className={theme === 'dark' ? "text-white" : "text-foreground"}>{currentWeather.high}°F</p>
          </div>
          <div>
            <p className="text-muted-foreground">Low</p>
            <p className={theme === 'dark' ? "text-white" : "text-foreground"}>{currentWeather.low}°F</p>
          </div>
          <div>
            <p className="text-muted-foreground">Humidity</p>
            <p className={theme === 'dark' ? "text-white" : "text-foreground"}>{currentWeather.humidity}%</p>
          </div>
        </div>
        
        {/* 5-Day Forecast */}
        <div>
          <h3 className={cn("text-sm font-medium mb-2", theme === 'dark' ? "text-gray-300" : "text-gray-700")}>
            5-Day Forecast
          </h3>
          <div className="flex justify-between" role="list" aria-label="Five-day weather forecast">
            {forecast.map((day) => (
              <div key={day.day} className="text-center" role="listitem" aria-label={`${day.day}: ${day.temp} degrees, ${day.condition}`}>
                <p className="text-xs text-muted-foreground">{day.day}</p>
                <div className="my-1" aria-hidden="true">{getWeatherIcon(day.condition)}</div>
                <p className="text-xs font-medium">{day.temp}°</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
};

export default WeatherWidget;
