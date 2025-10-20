import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const WeatherChart: React.FC = () => {
  // Mock data for the chart
  const weatherData = [
    { date: '2024-01-01', temperature: 15, rainfall: 5, humidity: 65, windSpeed: 12 },
    { date: '2024-01-02', temperature: 18, rainfall: 8, humidity: 70, windSpeed: 15 },
    { date: '2024-01-03', temperature: 22, rainfall: 3, humidity: 60, windSpeed: 10 },
    { date: '2024-01-04', temperature: 25, rainfall: 0, humidity: 55, windSpeed: 8 },
    { date: '2024-01-05', temperature: 28, rainfall: 2, humidity: 50, windSpeed: 6 },
    { date: '2024-01-06', temperature: 30, rainfall: 12, humidity: 75, windSpeed: 18 },
    { date: '2024-01-07', temperature: 26, rainfall: 15, humidity: 80, windSpeed: 20 },
    { date: '2024-01-08', temperature: 20, rainfall: 8, humidity: 70, windSpeed: 14 },
    { date: '2024-01-09', temperature: 17, rainfall: 4, humidity: 65, windSpeed: 11 },
    { date: '2024-01-10', temperature: 19, rainfall: 6, humidity: 68, windSpeed: 13 },
    { date: '2024-01-11', temperature: 23, rainfall: 1, humidity: 58, windSpeed: 9 },
    { date: '2024-01-12', temperature: 27, rainfall: 0, humidity: 52, windSpeed: 7 },
    { date: '2024-01-13', temperature: 31, rainfall: 3, humidity: 48, windSpeed: 5 },
    { date: '2024-01-14', temperature: 29, rainfall: 7, humidity: 62, windSpeed: 12 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
              {entry.dataKey === 'temperature' && '°C'}
              {entry.dataKey === 'rainfall' && 'mm'}
              {entry.dataKey === 'humidity' && '%'}
              {entry.dataKey === 'windSpeed' && ' km/h'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Weather Trends</CardTitle>
          <CardDescription>
            Historical weather data for your farm location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="temperature" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="temperature">Temperature</TabsTrigger>
              <TabsTrigger value="rainfall">Rainfall</TabsTrigger>
              <TabsTrigger value="humidity">Humidity</TabsTrigger>
              <TabsTrigger value="wind">Wind</TabsTrigger>
            </TabsList>

            <TabsContent value="temperature" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="temperature"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="rainfall" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="rainfall"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="humidity" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="wind" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="windSpeed"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeatherChart;
