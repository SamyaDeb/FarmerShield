import React from 'react';
import { motion } from 'framer-motion';
import { 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye,
  Sun,
  Cloud,
  CloudSnow,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface WeatherWidgetProps {
  weatherData: any;
  detailed?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weatherData, detailed = false }) => {
  if (!weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CloudRain className="h-5 w-5 mr-2 text-blue-500" />
            Current Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading weather data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'clear':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rain':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="h-8 w-8 text-blue-300" />;
      case 'thunderstorm':
        return <Zap className="h-8 w-8 text-purple-500" />;
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />;
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return 'text-blue-600';
    if (temp < 10) return 'text-blue-500';
    if (temp < 20) return 'text-green-500';
    if (temp < 30) return 'text-yellow-500';
    if (temp < 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRainIntensity = (rainfall: number) => {
    if (rainfall < 2.5) return { level: 'Light', color: 'bg-blue-100 text-blue-800' };
    if (rainfall < 10) return { level: 'Moderate', color: 'bg-blue-200 text-blue-900' };
    if (rainfall < 50) return { level: 'Heavy', color: 'bg-blue-300 text-blue-900' };
    return { level: 'Very Heavy', color: 'bg-blue-400 text-blue-900' };
  };

  const rainIntensity = getRainIntensity(weatherData.rainfall?.value || 0);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CloudRain className="h-5 w-5 mr-2 text-blue-500" />
            Current Weather
          </div>
          <Badge variant="outline" className="text-green-600 border-green-200">
            Live Data
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time weather conditions for your farm
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Weather Display */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            {getWeatherIcon(weatherData.weatherCondition?.main)}
          </div>
          <div className={`text-4xl font-bold ${getTemperatureColor(weatherData.temperature?.current || 0)}`}>
            {weatherData.temperature?.current}°C
          </div>
          <div className="text-lg text-gray-600 capitalize">
            {weatherData.weatherCondition?.description}
          </div>
          <div className="text-sm text-gray-500">
            Feels like {weatherData.temperature?.feelsLike}°C
          </div>
        </motion.div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            className="bg-gray-50 p-4 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-gray-600">
                <Thermometer className="h-4 w-4 mr-1" />
                <span className="text-sm">Temperature</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Min: {weatherData.temperature?.min}°C</span>
                <span>Max: {weatherData.temperature?.max}°C</span>
              </div>
              <Progress 
                value={(weatherData.temperature?.current / weatherData.temperature?.max) * 100} 
                className="h-2"
              />
            </div>
          </motion.div>

          <motion.div 
            className="bg-gray-50 p-4 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-gray-600">
                <Droplets className="h-4 w-4 mr-1" />
                <span className="text-sm">Humidity</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold">
                {weatherData.humidity?.value}%
              </div>
              <Progress 
                value={weatherData.humidity?.value} 
                className="h-2"
              />
            </div>
          </motion.div>

          <motion.div 
            className="bg-gray-50 p-4 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-gray-600">
                <CloudRain className="h-4 w-4 mr-1" />
                <span className="text-sm">Rainfall</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold">
                {weatherData.rainfall?.value}mm
              </div>
              <Badge className={rainIntensity.color}>
                {rainIntensity.level}
              </Badge>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gray-50 p-4 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-gray-600">
                <Wind className="h-4 w-4 mr-1" />
                <span className="text-sm">Wind</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold">
                {weatherData.wind?.speed} km/h
              </div>
              <div className="text-xs text-gray-500">
                {weatherData.wind?.direction}°
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Details */}
        {detailed && (
          <motion.div 
            className="space-y-4 pt-4 border-t"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pressure</span>
                <span className="text-sm font-medium">{weatherData.pressure?.value} hPa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Visibility</span>
                <span className="text-sm font-medium">{weatherData.visibility?.value} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">UV Index</span>
                <span className="text-sm font-medium">{weatherData.uvIndex?.value}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cloud Cover</span>
                <span className="text-sm font-medium">{weatherData.cloudCover?.value}%</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Weather Alerts */}
        {weatherData.alerts && weatherData.alerts.length > 0 && (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="text-sm font-medium text-red-600">Weather Alerts</div>
            {weatherData.alerts.map((alert: any, index: number) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">{alert.event}</span>
                  <Badge variant="destructive" className="text-xs">
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-xs text-red-700 mt-1">{alert.description}</p>
              </div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
