import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Crop, 
  Calendar,
  Shield,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { MapPicker } from '../components/MapPicker';
import { WalletConnect } from '../components/WalletConnect';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  farmDetails: z.object({
    cropType: z.string().min(1, 'Please select a crop type'),
    farmSize: z.number().min(0.1, 'Farm size must be at least 0.1'),
    farmSizeUnit: z.enum(['acres', 'hectares']),
    plantingDate: z.string().min(1, 'Please select planting date'),
    expectedHarvestDate: z.string().min(1, 'Please select expected harvest date'),
    description: z.string().optional()
  }),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    country: z.string().min(2, 'Country must be at least 2 characters')
  }),
  weatherThresholds: z.object({
    temperature: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    rainfall: z.object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional()
    }).optional(),
    humidity: z.object({
      min: z.number().min(0).max(100).optional(),
      max: z.number().min(0).max(100).optional()
    }).optional(),
    windSpeed: z.object({
      max: z.number().min(0).optional()
    }).optional()
  }).optional()
});

type RegisterFormData = z.infer<typeof registerSchema>;

const cropTypes = [
  { value: 'wheat', label: 'Wheat', icon: '🌾' },
  { value: 'rice', label: 'Rice', icon: '🌾' },
  { value: 'corn', label: 'Corn', icon: '🌽' },
  { value: 'soybean', label: 'Soybean', icon: '🫘' },
  { value: 'cotton', label: 'Cotton', icon: '🌿' },
  { value: 'sugarcane', label: 'Sugarcane', icon: '🎋' },
  { value: 'potato', label: 'Potato', icon: '🥔' },
  { value: 'tomato', label: 'Tomato', icon: '🍅' },
  { value: 'other', label: 'Other', icon: '🌱' }
];

const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });

  const watchedLocation = watch('location');

  const steps = [
    { number: 1, title: 'Connect Wallet', description: 'Connect your Celo wallet to get started' },
    { number: 2, title: 'Farm Details', description: 'Tell us about your farm and crops' },
    { number: 3, title: 'Location', description: 'Pin your farm location on the map' },
    { number: 4, title: 'Weather Thresholds', description: 'Set your weather protection parameters' },
    { number: 5, title: 'Review & Submit', description: 'Review your information and submit' }
  ];

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

  const handleLocationSelect = (location: any) => {
    setValue('location', location);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Registration data:', data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
  return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600">
                Connect your Celo wallet to register for WeatherShield insurance
          </p>
        </div>
            <WalletConnect 
              onConnect={(address) => {
                setWalletAddress(address);
                setIsWalletConnected(true);
              }}
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Crop className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Farm Details</h2>
              <p className="text-gray-600">
                Tell us about your farm and what you're growing
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cropType">Crop Type</Label>
                  <Select onValueChange={(value) => setValue('farmDetails.cropType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((crop) => (
                        <SelectItem key={crop.value} value={crop.value}>
                          <span className="flex items-center">
                            <span className="mr-2">{crop.icon}</span>
                            {crop.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.farmDetails?.cropType && (
                    <p className="text-sm text-red-600 mt-1">{errors.farmDetails.cropType.message}</p>
                  )}
            </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="farmSize">Farm Size</Label>
                    <Input
                      id="farmSize"
                      type="number"
                      step="0.1"
                      {...register('farmDetails.farmSize', { valueAsNumber: true })}
                      placeholder="0.0"
                    />
          </div>
                  <div>
                    <Label htmlFor="farmSizeUnit">Unit</Label>
                    <Select onValueChange={(value) => setValue('farmDetails.farmSizeUnit', value as 'acres' | 'hectares')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                        <SelectItem value="acres">Acres</SelectItem>
                        <SelectItem value="hectares">Hectares</SelectItem>
                </SelectContent>
              </Select>
            </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plantingDate">Planting Date</Label>
                  <Input
                    id="plantingDate"
                    type="date"
                    {...register('farmDetails.plantingDate')}
                  />
                  {errors.farmDetails?.plantingDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.farmDetails.plantingDate.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="harvestDate">Expected Harvest Date</Label>
              <Input
                    id="harvestDate"
                    type="date"
                    {...register('farmDetails.expectedHarvestDate')}
                  />
                  {errors.farmDetails?.expectedHarvestDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.farmDetails.expectedHarvestDate.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="description">Farm Description (Optional)</Label>
                <Textarea
                  id="description"
                  {...register('farmDetails.description')}
                  placeholder="Tell us more about your farm..."
                  rows={3}
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <MapPin className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Farm Location</h2>
              <p className="text-gray-600">
                Pin your farm location on the map for accurate weather monitoring
              </p>
            </div>
            <div className="h-96 rounded-lg overflow-hidden border">
              <MapPicker onLocationSelect={handleLocationSelect} />
            </div>
            {watchedLocation && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center text-green-800">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Location Selected</span>
                </div>
                <p className="text-green-700 mt-1">{watchedLocation.address}</p>
              </div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Weather Thresholds</h2>
              <p className="text-gray-600">
                Set the weather conditions that would damage your crops
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Thermometer className="h-5 w-5 mr-2 text-red-500" />
                    Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tempMin">Min Temperature (°C)</Label>
                      <Input
                        id="tempMin"
                        type="number"
                        {...register('weatherThresholds.temperature.min', { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tempMax">Max Temperature (°C)</Label>
                      <Input
                        id="tempMax"
                        type="number"
                        {...register('weatherThresholds.temperature.max', { valueAsNumber: true })}
                        placeholder="35"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CloudRain className="h-5 w-5 mr-2 text-blue-500" />
                    Rainfall
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rainMin">Min Rainfall (mm)</Label>
                      <Input
                        id="rainMin"
                        type="number"
                        {...register('weatherThresholds.rainfall.min', { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rainMax">Max Rainfall (mm)</Label>
                      <Input
                        id="rainMax"
                        type="number"
                        {...register('weatherThresholds.rainfall.max', { valueAsNumber: true })}
                        placeholder="50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Droplets className="h-5 w-5 mr-2 text-cyan-500" />
                    Humidity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="humidityMin">Min Humidity (%)</Label>
                      <Input
                        id="humidityMin"
                        type="number"
                        {...register('weatherThresholds.humidity.min', { valueAsNumber: true })}
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="humidityMax">Max Humidity (%)</Label>
                      <Input
                        id="humidityMax"
                        type="number"
                        {...register('weatherThresholds.humidity.max', { valueAsNumber: true })}
                        placeholder="90"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wind className="h-5 w-5 mr-2 text-gray-500" />
                    Wind Speed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="windMax">Max Wind Speed (km/h)</Label>
                    <Input
                      id="windMax"
                      type="number"
                      {...register('weatherThresholds.windSpeed.max', { valueAsNumber: true })}
                      placeholder="50"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
              <p className="text-gray-600">
                Review your information before submitting your registration
              </p>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Registration Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Personal Information</h4>
                      <p className="text-sm text-gray-600">Name: {watch('name')}</p>
                      <p className="text-sm text-gray-600">Email: {watch('email')}</p>
                      <p className="text-sm text-gray-600">Phone: {watch('phone')}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Farm Details</h4>
                      <p className="text-sm text-gray-600">Crop: {watch('farmDetails.cropType')}</p>
                      <p className="text-sm text-gray-600">Size: {watch('farmDetails.farmSize')} {watch('farmDetails.farmSizeUnit')}</p>
                      <p className="text-sm text-gray-600">Location: {watch('location.address')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">WeatherShield</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join WeatherShield</h1>
            <p className="text-gray-600">
              Protect your farm with blockchain-powered parametric insurance
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.number}</span>
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {renderStepContent()}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
            <Button 
              type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      Previous
            </Button>

                    {currentStep < steps.length ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!isValid && currentStep > 1}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
          </form>
              </CardContent>
        </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;