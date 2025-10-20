import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface MapPickerProps {
  onLocationSelect: (location: any) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock location selection - in a real app, this would integrate with a map library like Leaflet
  const handleMapClick = async (lat: number, lng: number) => {
    setIsLoading(true);
    
    // Simulate reverse geocoding
    setTimeout(() => {
      const mockLocation = {
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: 'Sample City',
        state: 'Sample State',
        country: 'Sample Country'
      };
      
      setSelectedLocation(mockLocation);
      onLocationSelect(mockLocation);
      setIsLoading(false);
    }, 1000);
  };

  // Sample farm locations for demo
  const sampleLocations = [
    { lat: 41.8781, lng: -93.0977, name: 'Iowa Farm' },
    { lat: 40.7128, lng: -74.0060, name: 'New York Farm' },
    { lat: 34.0522, lng: -118.2437, name: 'California Farm' },
    { lat: 29.7604, lng: -95.3698, name: 'Texas Farm' },
  ];

  return (
    <div className="relative h-full">
      {/* Mock Map Interface */}
      <div className="relative h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Select Your Farm Location
            </h3>
            <p className="text-gray-600 mb-6">
              Click on one of the sample locations or use the map to select your farm
            </p>
            
            {/* Sample Location Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {sampleLocations.map((location, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleMapClick(location.lat, location.lng)}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {location.name}
                </Button>
              ))}
            </div>

            {/* Mock Map Grid */}
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
              {Array.from({ length: 16 }).map((_, index) => {
                const lat = 40 + (Math.random() - 0.5) * 10;
                const lng = -100 + (Math.random() - 0.5) * 20;
                return (
                  <button
                    key={index}
                    onClick={() => handleMapClick(lat, lng)}
                    disabled={isLoading}
                    className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-green-100 hover:border-green-400 transition-colors"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading location...</p>
            </div>
          </div>
        )}

        {/* Selected Location Indicator */}
        {selectedLocation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-4 right-4"
          >
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3">
                <div className="flex items-center text-green-800">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Location Selected</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  {selectedLocation.address}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          In a real application, this would be an interactive map powered by Leaflet or Google Maps
        </p>
      </div>
    </div>
  );
};

export default MapPicker;
