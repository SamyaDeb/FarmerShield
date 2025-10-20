import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind, 
  MapPin, 
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { WeatherWidget } from '../components/WeatherWidget';
import { ClaimsList } from '../components/ClaimsList';
import { FarmStats } from '../components/FarmStats';
import { WeatherChart } from '../components/WeatherChart';

const Dashboard = () => {
  const [farmer, setFarmer] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate loading farmer data
    setTimeout(() => {
      setFarmer({
        id: '1',
        name: 'John Smith',
        walletAddress: '0x1234...5678',
        location: {
          address: '123 Farm Road, Iowa, USA',
          latitude: 41.8781,
          longitude: -93.0977
        },
        farmDetails: {
          cropType: 'corn',
          farmSize: 250,
          farmSizeUnit: 'acres',
          plantingDate: '2024-04-15',
          expectedHarvestDate: '2024-10-15'
        },
        insuranceDetails: {
          isRegistered: true,
          policyStatus: 'active',
          premiumAmount: 500,
          coverageAmount: 50000,
          nextPremiumDue: '2024-12-15'
        }
      });
      setIsLoading(false);
    }, 1000);

    // Simulate weather data
    setTimeout(() => {
      setWeatherData({
        temperature: { current: 22, min: 18, max: 26, unit: 'celsius' },
        humidity: { value: 65, unit: 'percent' },
        rainfall: { value: 5.2, unit: 'mm' },
        wind: { speed: 12, direction: 180, unit: 'km/h' },
        pressure: { value: 1013, unit: 'hPa' },
        uvIndex: { value: 6 },
        weatherCondition: { main: 'partly_cloudy', description: 'Partly Cloudy' },
        alerts: []
      });
    }, 1500);

    // Simulate claims data
    setTimeout(() => {
      setClaims([
        {
          id: '1',
          claimId: 'WS-2024-001',
          status: 'paid',
          amount: 2500,
          triggerReason: 'Excessive rainfall threshold exceeded',
          createdAt: '2024-01-15',
          paidAt: '2024-01-16'
        },
        {
          id: '2',
          claimId: 'WS-2024-002',
          status: 'pending',
          amount: 1800,
          triggerReason: 'Temperature threshold exceeded',
          createdAt: '2024-01-20'
        }
      ]);
    }, 2000);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">WeatherShield</h1>
                <p className="text-sm text-gray-500">Welcome back, {farmer?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Farm Overview Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Farm Location</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{farmer?.location.address}</div>
                <p className="text-xs text-muted-foreground">
                  {farmer?.farmDetails.farmSize} {farmer?.farmDetails.farmSizeUnit}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coverage Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${farmer?.insuranceDetails.coverageAmount?.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {farmer?.insuranceDetails.policyStatus}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crop Type</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{farmer?.farmDetails.cropType}</div>
                <p className="text-xs text-muted-foreground">
                  Planted: {new Date(farmer?.farmDetails.plantingDate).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Premium</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${farmer?.insuranceDetails.premiumAmount}</div>
                <p className="text-xs text-muted-foreground">
                  Due: {new Date(farmer?.insuranceDetails.nextPremiumDue).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="weather">Weather</TabsTrigger>
                <TabsTrigger value="claims">Claims</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <WeatherWidget weatherData={weatherData} />
                      <FarmStats farmer={farmer} claims={claims} />
                    </div>
                  </TabsContent>

                  <TabsContent value="weather" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <WeatherWidget weatherData={weatherData} detailed />
                      <WeatherChart />
                    </div>
                  </TabsContent>

                  <TabsContent value="claims" className="space-y-6">
                    <ClaimsList claims={claims} />
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FarmStats farmer={farmer} claims={claims} detailed />
                      <WeatherChart />
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;