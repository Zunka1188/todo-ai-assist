
import React, { useState } from 'react';
import { SunMedium, Cloud, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { WidgetWrapper } from './shared/WidgetWrapper';

export interface WeatherWidgetProps {
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className }) => {
  const { theme } = useTheme();
  const [currentWeather] = useState({
    temp: 72,
    condition: 'Partly Cloudy',
    high: 78,
    low: 65,
    humidity: 45,
    windSpeed: 8,
    precipitation: 15,
  });
  
  const [forecast] = useState([
    { day: 'Mon', temp: 74, condition: 'sunny' },
    { day: 'Tue', temp: 70, condition: 'cloudy' },
    { day: 'Wed', temp: 68, condition: 'rainy' },
    { day: 'Thu', temp: 72, condition: 'sunny' },
    { day: 'Fri', temp: 75, condition: 'sunny' },
  ]);

  const getWeatherIcon = (condition: string) => {
    switch(condition.toLowerCase()) {
      case 'sunny':
        return <SunMedium className="h-5 w-5 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="h-5 w-5 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="h-5 w-5 text-blue-400" />;
      case 'snowy':
        return <CloudSnow className="h-5 w-5 text-blue-200" />;
      case 'stormy':
        return <CloudLightning className="h-5 w-5 text-purple-500" />;
      default:
        return <SunMedium className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  return (
    <WidgetWrapper className={cn("w-full", className)}>
      <div className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className={cn("text-2xl font-semibold", theme === 'dark' ? "text-white" : "text-foreground")}>
              {currentWeather.temp}°F
            </h2>
            <p className="text-muted-foreground">{currentWeather.condition}</p>
          </div>
          <div>
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
          <div className="flex justify-between">
            {forecast.map((day) => (
              <div key={day.day} className="text-center">
                <p className="text-xs text-muted-foreground">{day.day}</p>
                <div className="my-1">{getWeatherIcon(day.condition)}</div>
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
