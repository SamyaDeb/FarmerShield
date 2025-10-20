const express = require('express');
const { query, validationResult } = require('express-validator');
const WeatherData = require('../models/WeatherData');
const { getWeatherData } = require('../services/weatherService');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/weather/current
// @desc    Get current weather for location
// @access  Public
router.get('/current', [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('lon').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('radius').optional().isFloat({ min: 1, max: 100 }).withMessage('Radius must be between 1-100 km')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { lat, lon, radius = 10 } = req.query;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusKm = parseFloat(radius);

    // Get latest weather data
    const weatherResult = await getWeatherData(latitude, longitude, {
      address: req.query.address || '',
      city: req.query.city || '',
      state: req.query.state || '',
      country: req.query.country || ''
    });

    if (!weatherResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch weather data',
        error: weatherResult.error
      });
    }

    res.json({
      success: true,
      data: {
        weather: weatherResult.data,
        location: {
          latitude,
          longitude,
          radius: radiusKm
        }
      }
    });
  } catch (error) {
    console.error('Get current weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/weather/history
// @desc    Get weather history for location
// @access  Public
router.get('/history', [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('lon').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('startDate').isISO8601().withMessage('Invalid start date'),
  query('endDate').isISO8601().withMessage('Invalid end date'),
  query('radius').optional().isFloat({ min: 1, max: 100 }).withMessage('Radius must be between 1-100 km'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1-1000')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { lat, lon, startDate, endDate, radius = 10, limit = 100 } = req.query;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusKm = parseFloat(radius);
    const limitCount = parseInt(limit);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    const weatherHistory = await WeatherData.findByLocationAndTimeRange(
      latitude,
      longitude,
      start,
      end,
      radiusKm
    ).limit(limitCount);

    res.json({
      success: true,
      data: {
        weatherHistory: weatherHistory.map(weather => ({
          id: weather._id,
          location: weather.location,
          timestamp: weather.timestamp,
          temperature: weather.temperature,
          humidity: weather.humidity,
          rainfall: weather.rainfall,
          wind: weather.wind,
          pressure: weather.pressure,
          visibility: weather.visibility,
          uvIndex: weather.uvIndex,
          cloudCover: weather.cloudCover,
          weatherCondition: weather.weatherCondition,
          alerts: weather.alerts,
          source: weather.source,
          quality: weather.quality
        })),
        location: {
          latitude,
          longitude,
          radius: radiusKm
        },
        period: {
          start,
          end
        },
        count: weatherHistory.length
      }
    });
  } catch (error) {
    console.error('Get weather history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/weather/stats
// @desc    Get weather statistics for location
// @access  Public
router.get('/stats', [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('lon').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('startDate').isISO8601().withMessage('Invalid start date'),
  query('endDate').isISO8601().withMessage('Invalid end date'),
  query('radius').optional().isFloat({ min: 1, max: 100 }).withMessage('Radius must be between 1-100 km')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { lat, lon, startDate, endDate, radius = 10 } = req.query;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusKm = parseFloat(radius);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    const stats = await WeatherData.calculateStats(
      latitude,
      longitude,
      start,
      end,
      radiusKm
    );

    res.json({
      success: true,
      data: {
        statistics: stats[0] || {
          avgTemperature: 0,
          minTemperature: 0,
          maxTemperature: 0,
          totalRainfall: 0,
          avgHumidity: 0,
          avgWindSpeed: 0,
          maxWindSpeed: 0,
          count: 0
        },
        location: {
          latitude,
          longitude,
          radius: radiusKm
        },
        period: {
          start,
          end
        }
      }
    });
  } catch (error) {
    console.error('Get weather stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/weather/alerts
// @desc    Get weather alerts for location
// @access  Public
router.get('/alerts', [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('lon').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('radius').optional().isFloat({ min: 1, max: 100 }).withMessage('Radius must be between 1-100 km')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { lat, lon, radius = 50 } = req.query;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusKm = parseFloat(radius);

    // Get recent weather data with alerts
    const recentWeather = await WeatherData.findByLocationAndTimeRange(
      latitude,
      longitude,
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      new Date(),
      radiusKm
    ).limit(50);

    const alerts = recentWeather
      .filter(weather => weather.alerts && weather.alerts.length > 0)
      .flatMap(weather => 
        weather.alerts.map(alert => ({
          ...alert,
          location: weather.location,
          timestamp: weather.timestamp
        }))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: {
        alerts,
        location: {
          latitude,
          longitude,
          radius: radiusKm
        },
        count: alerts.length
      }
    });
  } catch (error) {
    console.error('Get weather alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/weather/forecast
// @desc    Get weather forecast (mock implementation)
// @access  Public
router.get('/forecast', [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('lon').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('days').optional().isInt({ min: 1, max: 7 }).withMessage('Days must be between 1-7')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { lat, lon, days = 5 } = req.query;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const forecastDays = parseInt(days);

    // This would typically call a weather API for forecast data
    // For now, we'll return a mock forecast
    const forecast = [];
    const now = new Date();
    
    for (let i = 0; i < forecastDays; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      forecast.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: Math.round(15 + Math.random() * 10),
          max: Math.round(25 + Math.random() * 10),
          unit: 'celsius'
        },
        humidity: {
          value: Math.round(40 + Math.random() * 40),
          unit: 'percent'
        },
        rainfall: {
          value: Math.round(Math.random() * 20),
          unit: 'mm',
          probability: Math.round(Math.random() * 100)
        },
        wind: {
          speed: Math.round(5 + Math.random() * 15),
          unit: 'km/h',
          direction: Math.round(Math.random() * 360)
        },
        weatherCondition: {
          main: ['clear', 'clouds', 'rain', 'thunderstorm'][Math.floor(Math.random() * 4)],
          description: 'Partly cloudy',
          icon: '02d'
        }
      });
    }

    res.json({
      success: true,
      data: {
        forecast,
        location: {
          latitude,
          longitude
        },
        days: forecastDays
      }
    });
  } catch (error) {
    console.error('Get weather forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
