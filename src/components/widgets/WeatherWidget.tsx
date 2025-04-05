
import React from 'react';
import { Cloud, Sun, CloudRain, Thermometer } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { WidgetWrapper } from './shared/WidgetWrapper';

const WeatherWidget = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Mock weather data - in a real app this would come from an API
  const weather = {
    temp: 72,
    condition: 'Partly Cloudy',
    humidity: 45,
    wind: 8
  };

  // Select icon based on condition
  const getWeatherIcon = () => {
    const condition = weather.condition.toLowerCase();
    if (condition.includes('cloud')) return <Cloud className="h-8 w-8 text-blue-400" />;
    if (condition.includes('rain')) return <CloudRain className="h-8 w-8 text-blue-500" />;
    return <Sun className="h-8 w-8 text-yellow-400" />;
  };

  return (
    <WidgetWrapper className="flex flex-col space-y-3">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-lg">Today's Weather</h3>
        {getWeatherIcon()}
      </div>
      
      <div className="flex items-center">
        <Thermometer className="h-5 w-5 mr-2 text-red-400" />
        <span className="text-2xl font-semibold">{weather.temp}°F</span>
      </div>
      
      <p className="text-sm text-muted-foreground">{weather.condition}</p>
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <div>Humidity: {weather.humidity}%</div>
        <div>Wind: {weather.wind} mph</div>
      </div>
    </WidgetWrapper>
  );
};

export default WeatherWidget;
