const axios = require('axios');
const WeatherData = require('../models/WeatherData');
const Claim = require('../models/Claim');
const Farmer = require('../models/Farmer');
const { triggerPayout } = require('./contractService');

/**
 * Fetch weather data from RedStone Oracle
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} - Weather data
 */
const fetchRedStoneWeatherData = async (latitude, longitude) => {
  // Fallback to OpenWeather if RedStone key is not available
  console.log('RedStone not available, using OpenWeather fallback');
  return await fetchOpenWeatherData(latitude, longitude);
};

/**
 * Fetch weather data from WeatherAPI.com (primary)
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} - Weather data
 */
const fetchWeatherAPIData = async (latitude, longitude) => {
  try {
    const response = await axios.get('https://api.weatherapi.com/v1/current.json', {
      params: {
        key: process.env.WEATHERAPI_KEY,
        q: `${latitude},${longitude}`,
        aqi: 'yes'
      },
      timeout: 10000
    });

    return {
      success: true,
      data: response.data,
      source: 'weatherapi'
    };
  } catch (error) {
    console.error('WeatherAPI error:', error);
    return {
      success: false,
      error: error.message,
      source: 'weatherapi'
    };
  }
};

/**
 * Fetch weather data from OpenWeather API (backup)
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} - Weather data
 */
const fetchOpenWeatherData = async (latitude, longitude) => {
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: latitude,
        lon: longitude,
        units: 'metric',
        appid: process.env.OPENWEATHER_API_KEY
      },
      timeout: 10000
    });

    return {
      success: true,
      data: response.data,
      source: 'openweather'
    };
  } catch (error) {
    console.error('OpenWeather API error:', error);
    return {
      success: false,
      error: error.message,
      source: 'openweather'
    };
  }
};

/**
 * Process and normalize weather data
 * @param {Object} rawData - Raw weather data from API
 * @param {string} source - Data source
 * @param {Object} location - Location information
 * @returns {Object} - Normalized weather data
 */
const processWeatherData = (rawData, source, location) => {
  const timestamp = new Date();
  
  if (source === 'weatherapi') {
    return {
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        city: location.city,
        state: location.state,
        country: location.country
      },
      timestamp,
      temperature: {
        current: {
          value: rawData.current.temp_c,
          unit: 'celsius'
        },
        min: {
          value: rawData.current.temp_c - 5, // WeatherAPI doesn't provide min/max in current
          unit: 'celsius'
        },
        max: {
          value: rawData.current.temp_c + 5,
          unit: 'celsius'
        },
        feelsLike: {
          value: rawData.current.feelslike_c,
          unit: 'celsius'
        }
      },
      humidity: {
        value: rawData.current.humidity,
        unit: 'percent'
      },
      rainfall: {
        value: rawData.current.precip_mm || 0,
        unit: 'mm',
        intensity: getRainIntensity(rawData.current.precip_mm || 0)
      },
      wind: {
        speed: {
          value: rawData.current.wind_kph,
          unit: 'km/h'
        },
        direction: {
          value: rawData.current.wind_degree,
          unit: 'degrees'
        },
        gust: {
          value: rawData.current.gust_kph || rawData.current.wind_kph,
          unit: 'km/h'
        }
      },
      pressure: {
        value: rawData.current.pressure_mb,
        unit: 'hPa'
      },
      visibility: {
        value: rawData.current.vis_km,
        unit: 'km'
      },
      uvIndex: {
        value: rawData.current.uv || 0
      },
      cloudCover: {
        value: rawData.current.cloud,
        unit: 'percent'
      },
      weatherCondition: {
        main: rawData.current.condition.text.toLowerCase(),
        description: rawData.current.condition.text,
        icon: rawData.current.condition.icon
      },
      alerts: rawData.alerts || [],
      source: {
        type: source,
        confidence: 0.95
      },
      quality: {
        score: 0.95,
        completeness: 1.0,
        accuracy: 0.95
      }
    };
  } else if (source === 'redstone') {
    return {
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        city: location.city,
        state: location.state,
        country: location.country
      },
      timestamp,
      temperature: {
        current: {
          value: rawData.main.temp,
          unit: 'celsius'
        },
        min: {
          value: rawData.main.temp_min,
          unit: 'celsius'
        },
        max: {
          value: rawData.main.temp_max,
          unit: 'celsius'
        },
        feelsLike: {
          value: rawData.main.feels_like,
          unit: 'celsius'
        }
      },
      humidity: {
        value: rawData.main.humidity,
        unit: 'percent'
      },
      rainfall: {
        value: rawData.rain?.['1h'] || 0,
        unit: 'mm',
        intensity: getRainIntensity(rawData.rain?.['1h'] || 0)
      },
      wind: {
        speed: {
          value: rawData.wind.speed * 3.6, // Convert m/s to km/h
          unit: 'km/h'
        },
        direction: {
          value: rawData.wind.deg,
          unit: 'degrees'
        },
        gust: {
          value: (rawData.wind.gust || rawData.wind.speed) * 3.6,
          unit: 'km/h'
        }
      },
      pressure: {
        value: rawData.main.pressure,
        unit: 'hPa'
      },
      visibility: {
        value: rawData.visibility / 1000, // Convert m to km
        unit: 'km'
      },
      uvIndex: {
        value: rawData.uvi || 0
      },
      cloudCover: {
        value: rawData.clouds.all,
        unit: 'percent'
      },
      weatherCondition: {
        main: rawData.weather[0].main.toLowerCase(),
        description: rawData.weather[0].description,
        icon: rawData.weather[0].icon
      },
      alerts: rawData.alerts || [],
      source: {
        type: source,
        confidence: 0.9
      },
      quality: {
        score: 0.9,
        completeness: 1.0,
        accuracy: 0.9
      }
    };
  } else if (source === 'openweather') {
    // Similar processing for OpenWeather data
    return processWeatherData(rawData, 'redstone', location); // Simplified for now
  }
};

/**
 * Get rain intensity based on rainfall amount
 * @param {number} rainfall - Rainfall in mm
 * @returns {string} - Intensity level
 */
const getRainIntensity = (rainfall) => {
  if (rainfall < 2.5) return 'light';
  if (rainfall < 10) return 'moderate';
  if (rainfall < 50) return 'heavy';
  return 'very_heavy';
};

/**
 * Save weather data to database
 * @param {Object} weatherData - Processed weather data
 * @returns {Promise<Object>} - Saved weather data
 */
const saveWeatherData = async (weatherData) => {
  try {
    const weather = new WeatherData(weatherData);
    await weather.save();
    return weather;
  } catch (error) {
    console.error('Save weather data error:', error);
    throw error;
  }
};

/**
 * Get weather data for a location
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {Object} locationInfo - Additional location information
 * @returns {Promise<Object>} - Weather data
 */
const getWeatherData = async (latitude, longitude, locationInfo = {}) => {
  try {
    // Try WeatherAPI first (primary)
    let weatherResult = await fetchWeatherAPIData(latitude, longitude);
    
    // Fallback to OpenWeather if WeatherAPI fails
    if (!weatherResult.success) {
      console.log('WeatherAPI failed, trying OpenWeather...');
      weatherResult = await fetchOpenWeatherData(latitude, longitude);
    }
    
    if (!weatherResult.success) {
      throw new Error('All weather APIs failed');
    }
    
    // Process and save data
    const processedData = processWeatherData(
      weatherResult.data,
      weatherResult.source,
      {
        latitude,
        longitude,
        ...locationInfo
      }
    );
    
    const savedData = await saveWeatherData(processedData);
    
    return {
      success: true,
      data: savedData
    };
  } catch (error) {
    console.error('Get weather data error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check weather thresholds for farmers
 * @param {Object} weatherData - Weather data
 * @param {Object} thresholds - Weather thresholds
 * @returns {Object} - Threshold check results
 */
const checkWeatherThresholds = (weatherData, thresholds) => {
  return weatherData.exceedsThresholds(thresholds);
};

/**
 * Process weather triggers for all farmers
 */
const processWeatherTriggers = async () => {
  try {
    console.log('Processing weather triggers...');
    
    // Get all active farmers
    const farmers = await Farmer.find({
      isActive: true,
      'insuranceDetails.isRegistered': true,
      'insuranceDetails.policyStatus': 'active'
    });
    
    for (const farmer of farmers) {
      try {
        // Get latest weather data for farmer's location
        const weatherResult = await getWeatherData(
          farmer.location.latitude,
          farmer.location.longitude,
          {
            address: farmer.location.address,
            city: farmer.location.city,
            state: farmer.location.state,
            country: farmer.location.country
          }
        );
        
        if (!weatherResult.success) {
          console.error(`Failed to get weather data for farmer ${farmer._id}`);
          continue;
        }
        
        const weatherData = weatherResult.data;
        
        // Check if weather exceeds farmer's thresholds
        if (farmer.weatherThresholds) {
          const thresholdResults = checkWeatherThresholds(weatherData, farmer.weatherThresholds);
          
          // Check if any threshold was exceeded
          const hasExceededThreshold = Object.values(thresholdResults).some(
            result => result && result.exceeded
          );
          
          if (hasExceededThreshold) {
            console.log(`Weather threshold exceeded for farmer ${farmer._id}`);
            
            // Create claim
            const claim = new Claim({
              farmerId: farmer._id,
              walletAddress: farmer.walletAddress,
              claimId: `claim_${Date.now()}_${farmer._id}`,
              weatherData: {
                temperature: {
                  value: weatherData.temperature.current.value,
                  unit: weatherData.temperature.current.unit,
                  threshold: farmer.weatherThresholds.temperature?.max || 0,
                  exceeded: thresholdResults.temperature?.exceeded || false
                },
                rainfall: {
                  value: weatherData.rainfall.value,
                  unit: weatherData.rainfall.unit,
                  threshold: farmer.weatherThresholds.rainfall?.max || 0,
                  exceeded: thresholdResults.rainfall?.exceeded || false
                },
                humidity: {
                  value: weatherData.humidity.value,
                  unit: weatherData.humidity.unit,
                  threshold: farmer.weatherThresholds.humidity?.max || 0,
                  exceeded: thresholdResults.humidity?.exceeded || false
                },
                windSpeed: {
                  value: weatherData.wind.speed.value,
                  unit: weatherData.wind.speed.unit,
                  threshold: farmer.weatherThresholds.windSpeed?.max || 0,
                  exceeded: thresholdResults.windSpeed?.exceeded || false
                },
                timestamp: weatherData.timestamp,
                location: {
                  latitude: weatherData.location.latitude,
                  longitude: weatherData.location.longitude
                }
              },
              payoutDetails: {
                amount: calculatePayoutAmount(farmer, thresholdResults),
                currency: 'cUSD',
                multiplier: 1.0,
                calculationMethod: 'parametric'
              },
              status: 'pending',
              triggeredBy: 'automatic',
              triggerReason: generateTriggerReason(thresholdResults)
            });
            
            await claim.save();
            
            // Trigger payout
            try {
              const payoutResult = await triggerPayout(
                farmer.walletAddress,
                claim.payoutDetails.amount
              );
              
              if (payoutResult.success) {
                await claim.markAsPaid(
                  payoutResult.transactionHash,
                  payoutResult.blockNumber,
                  payoutResult.gasUsed
                );
                console.log(`Payout successful for farmer ${farmer._id}`);
              }
            } catch (payoutError) {
              console.error(`Payout failed for farmer ${farmer._id}:`, payoutError);
              claim.status = 'failed';
              await claim.save();
            }
          }
        }
      } catch (farmerError) {
        console.error(`Error processing farmer ${farmer._id}:`, farmerError);
      }
    }
    
    console.log('Weather trigger processing completed');
  } catch (error) {
    console.error('Process weather triggers error:', error);
  }
};

/**
 * Calculate payout amount based on weather conditions
 * @param {Object} farmer - Farmer object
 * @param {Object} thresholdResults - Threshold check results
 * @returns {number} - Payout amount
 */
const calculatePayoutAmount = (farmer, thresholdResults) => {
  const baseAmount = farmer.insuranceDetails.coverageAmount || 1000; // Default coverage
  let multiplier = 0;
  
  // Calculate multiplier based on exceeded thresholds
  Object.values(thresholdResults).forEach(result => {
    if (result && result.exceeded) {
      multiplier += 0.25; // 25% for each exceeded threshold
    }
  });
  
  return Math.min(baseAmount * multiplier, baseAmount); // Cap at full coverage
};

/**
 * Generate trigger reason based on threshold results
 * @param {Object} thresholdResults - Threshold check results
 * @returns {string} - Trigger reason
 */
const generateTriggerReason = (thresholdResults) => {
  const reasons = [];
  
  if (thresholdResults.temperature?.exceeded) {
    reasons.push('Temperature threshold exceeded');
  }
  if (thresholdResults.rainfall?.exceeded) {
    reasons.push('Rainfall threshold exceeded');
  }
  if (thresholdResults.humidity?.exceeded) {
    reasons.push('Humidity threshold exceeded');
  }
  if (thresholdResults.windSpeed?.exceeded) {
    reasons.push('Wind speed threshold exceeded');
  }
  
  return reasons.join(', ');
};

/**
 * Start weather monitoring service
 */
const startWeatherMonitoring = () => {
  // Run every 30 minutes
  setInterval(processWeatherTriggers, 30 * 60 * 1000);
  
  // Also run immediately on startup
  processWeatherTriggers();
  
  console.log('Weather monitoring service started');
};

module.exports = {
  getWeatherData,
  processWeatherTriggers,
  startWeatherMonitoring,
  fetchRedStoneWeatherData,
  fetchOpenWeatherData
};
