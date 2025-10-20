const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
  location: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    address: String,
    city: String,
    state: String,
    country: String
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  temperature: {
    current: {
      value: Number,
      unit: { type: String, default: 'celsius' }
    },
    min: {
      value: Number,
      unit: { type: String, default: 'celsius' }
    },
    max: {
      value: Number,
      unit: { type: String, default: 'celsius' }
    },
    feelsLike: {
      value: Number,
      unit: { type: String, default: 'celsius' }
    }
  },
  humidity: {
    value: {
      type: Number,
      min: 0,
      max: 100
    },
    unit: { type: String, default: 'percent' }
  },
  rainfall: {
    value: {
      type: Number,
      min: 0
    },
    unit: { type: String, default: 'mm' },
    intensity: {
      type: String,
      enum: ['light', 'moderate', 'heavy', 'very_heavy'],
      default: 'light'
    }
  },
  wind: {
    speed: {
      value: Number,
      unit: { type: String, default: 'km/h' }
    },
    direction: {
      value: Number,
      unit: { type: String, default: 'degrees' }
    },
    gust: {
      value: Number,
      unit: { type: String, default: 'km/h' }
    }
  },
  pressure: {
    value: Number,
    unit: { type: String, default: 'hPa' }
  },
  visibility: {
    value: Number,
    unit: { type: String, default: 'km' }
  },
  uvIndex: {
    value: {
      type: Number,
      min: 0,
      max: 11
    }
  },
  cloudCover: {
    value: {
      type: Number,
      min: 0,
      max: 100
    },
    unit: { type: String, default: 'percent' }
  },
  weatherCondition: {
    main: {
      type: String,
      enum: ['clear', 'clouds', 'rain', 'snow', 'thunderstorm', 'drizzle', 'mist', 'fog', 'haze', 'dust', 'smoke', 'sand', 'ash', 'squall', 'tornado', 'overcast', 'partly cloudy', 'sunny', 'cloudy']
    },
    description: String,
    icon: String
  },
  alerts: [{
    event: String,
    description: String,
    start: Date,
    end: Date,
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe', 'extreme']
    }
  }],
  source: {
    type: {
      type: String,
      enum: ['redstone', 'openweather', 'weatherapi', 'manual'],
      default: 'weatherapi'
    },
    apiKey: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    }
  },
  quality: {
    score: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    },
    completeness: {
      type: Number,
      min: 0,
      max: 1,
      default: 1.0
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
weatherDataSchema.index({ 
  'location.latitude': 1, 
  'location.longitude': 1, 
  timestamp: -1 
});
weatherDataSchema.index({ timestamp: -1 });
weatherDataSchema.index({ 'source.type': 1 });
weatherDataSchema.index({ 'weatherCondition.main': 1 });

// Virtual for temperature in fahrenheit
weatherDataSchema.virtual('temperature.fahrenheit').get(function() {
  if (this.temperature.current && this.temperature.current.unit === 'celsius') {
    return (this.temperature.current.value * 9/5) + 32;
  }
  return this.temperature.current?.value;
});

// Virtual for wind speed in mph
weatherDataSchema.virtual('wind.speedMph').get(function() {
  if (this.wind.speed && this.wind.speed.unit === 'km/h') {
    return this.wind.speed.value * 0.621371;
  }
  return this.wind.speed?.value;
});

// Virtual for rainfall in inches
weatherDataSchema.virtual('rainfall.inches').get(function() {
  if (this.rainfall.value && this.rainfall.unit === 'mm') {
    return this.rainfall.value * 0.0393701;
  }
  return this.rainfall.value;
});

// Static method to find weather data by location and time range
weatherDataSchema.statics.findByLocationAndTimeRange = function(latitude, longitude, startDate, endDate, radiusKm = 10) {
  const earthRadius = 6371; // Earth's radius in kilometers
  
  return this.find({
    'location.latitude': {
      $gte: latitude - (radiusKm / earthRadius) * (180 / Math.PI),
      $lte: latitude + (radiusKm / earthRadius) * (180 / Math.PI)
    },
    'location.longitude': {
      $gte: longitude - (radiusKm / earthRadius) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180),
      $lte: longitude + (radiusKm / earthRadius) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180)
    },
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ timestamp: -1 });
};

// Static method to get latest weather for location
weatherDataSchema.statics.getLatestWeather = function(latitude, longitude, radiusKm = 10) {
  return this.findByLocationAndTimeRange(latitude, longitude, new Date(Date.now() - 24 * 60 * 60 * 1000), new Date())
    .limit(1);
};

// Static method to calculate weather statistics
weatherDataSchema.statics.calculateStats = function(latitude, longitude, startDate, endDate, radiusKm = 10) {
  return this.aggregate([
    {
      $match: {
        'location.latitude': {
          $gte: latitude - (radiusKm / earthRadius) * (180 / Math.PI),
          $lte: latitude + (radiusKm / earthRadius) * (180 / Math.PI)
        },
        'location.longitude': {
          $gte: longitude - (radiusKm / earthRadius) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180),
          $lte: longitude + (radiusKm / earthRadius) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180)
        },
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        avgTemperature: { $avg: '$temperature.current.value' },
        minTemperature: { $min: '$temperature.min.value' },
        maxTemperature: { $max: '$temperature.max.value' },
        totalRainfall: { $sum: '$rainfall.value' },
        avgHumidity: { $avg: '$humidity.value' },
        avgWindSpeed: { $avg: '$wind.speed.value' },
        maxWindSpeed: { $max: '$wind.speed.value' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Instance method to check if weather exceeds thresholds
weatherDataSchema.methods.exceedsThresholds = function(thresholds) {
  const results = {};
  
  if (thresholds.temperature) {
    results.temperature = {
      exceeded: this.temperature.current.value > thresholds.temperature.max || 
                this.temperature.current.value < thresholds.temperature.min,
      value: this.temperature.current.value,
      threshold: thresholds.temperature
    };
  }
  
  if (thresholds.rainfall) {
    results.rainfall = {
      exceeded: this.rainfall.value > thresholds.rainfall.max || 
                this.rainfall.value < thresholds.rainfall.min,
      value: this.rainfall.value,
      threshold: thresholds.rainfall
    };
  }
  
  if (thresholds.humidity) {
    results.humidity = {
      exceeded: this.humidity.value > thresholds.humidity.max || 
                this.humidity.value < thresholds.humidity.min,
      value: this.humidity.value,
      threshold: thresholds.humidity
    };
  }
  
  if (thresholds.windSpeed) {
    results.windSpeed = {
      exceeded: this.wind.speed.value > thresholds.windSpeed.max,
      value: this.wind.speed.value,
      threshold: { max: thresholds.windSpeed.max }
    };
  }
  
  return results;
};

module.exports = mongoose.model('WeatherData', weatherDataSchema);
