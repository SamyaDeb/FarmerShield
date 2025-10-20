const axios = require('axios');

/**
 * RedStone Oracle Service for Weather Data
 * Integrates with RedStone's decentralized oracle network for real-time weather data
 */

class RedStoneService {
  constructor() {
    this.baseURL = process.env.REDSTONE_BASE_URL || 'https://api.redstone.finance';
    this.apiKey = process.env.REDSTONE_API_KEY;
    this.timeout = 10000; // 10 seconds
  }

  /**
   * Fetch weather data from RedStone oracle
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Object>} - Weather data from RedStone
   */
  async fetchWeatherData(latitude, longitude) {
    try {
      console.log(`Fetching weather data from RedStone for coordinates: ${latitude}, ${longitude}`);
      
      const response = await axios.get(`${this.baseURL}/v1/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          units: 'metric',
          appid: this.apiKey
        },
        timeout: this.timeout,
        headers: {
          'User-Agent': 'WeatherShield/1.0',
          'Accept': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error(`RedStone API returned status ${response.status}`);
      }

      return {
        success: true,
        data: this.normalizeWeatherData(response.data),
        source: 'redstone',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('RedStone API error:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'redstone',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Normalize RedStone weather data to our standard format
   * @param {Object} rawData - Raw data from RedStone API
   * @returns {Object} - Normalized weather data
   */
  normalizeWeatherData(rawData) {
    return {
      temperature: {
        current: rawData.main.temp,
        min: rawData.main.temp_min,
        max: rawData.main.temp_max,
        feelsLike: rawData.main.feels_like,
        unit: 'celsius'
      },
      humidity: {
        value: rawData.main.humidity,
        unit: 'percent'
      },
      rainfall: {
        value: rawData.rain?.['1h'] || 0,
        unit: 'mm',
        intensity: this.getRainIntensity(rawData.rain?.['1h'] || 0)
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
      location: {
        latitude: rawData.coord.lat,
        longitude: rawData.coord.lon,
        city: rawData.name,
        country: rawData.sys.country
      }
    };
  }

  /**
   * Get rain intensity level based on rainfall amount
   * @param {number} rainfall - Rainfall in mm
   * @returns {string} - Intensity level
   */
  getRainIntensity(rainfall) {
    if (rainfall < 2.5) return 'light';
    if (rainfall < 10) return 'moderate';
    if (rainfall < 50) return 'heavy';
    return 'very_heavy';
  }

  /**
   * Fetch historical weather data
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} - Historical weather data
   */
  async fetchHistoricalWeather(latitude, longitude, startDate, endDate) {
    try {
      console.log(`Fetching historical weather data from RedStone for ${startDate} to ${endDate}`);
      
      const response = await axios.get(`${this.baseURL}/v1/weather/history`, {
        params: {
          lat: latitude,
          lon: longitude,
          start_date: startDate,
          end_date: endDate,
          units: 'metric',
          appid: this.apiKey
        },
        timeout: this.timeout * 2, // Longer timeout for historical data
        headers: {
          'User-Agent': 'WeatherShield/1.0',
          'Accept': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error(`RedStone API returned status ${response.status}`);
      }

      return {
        success: true,
        data: response.data.list.map(item => this.normalizeWeatherData(item)),
        source: 'redstone',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('RedStone historical data error:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'redstone',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get weather forecast
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @param {number} days - Number of forecast days (1-7)
   * @returns {Promise<Object>} - Weather forecast data
   */
  async fetchWeatherForecast(latitude, longitude, days = 5) {
    try {
      console.log(`Fetching weather forecast from RedStone for ${days} days`);
      
      const response = await axios.get(`${this.baseURL}/v1/weather/forecast`, {
        params: {
          lat: latitude,
          lon: longitude,
          cnt: days * 8, // 8 data points per day (3-hour intervals)
          units: 'metric',
          appid: this.apiKey
        },
        timeout: this.timeout,
        headers: {
          'User-Agent': 'WeatherShield/1.0',
          'Accept': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error(`RedStone API returned status ${response.status}`);
      }

      return {
        success: true,
        data: response.data.list.map(item => this.normalizeWeatherData(item)),
        source: 'redstone',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('RedStone forecast error:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'redstone',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check if weather conditions exceed thresholds
   * @param {Object} weatherData - Current weather data
   * @param {Object} thresholds - Weather thresholds
   * @returns {Object} - Threshold check results
   */
  checkWeatherThresholds(weatherData, thresholds) {
    const results = {};

    if (thresholds.temperature) {
      const temp = weatherData.temperature.current;
      results.temperature = {
        exceeded: temp > thresholds.temperature.max || temp < thresholds.temperature.min,
        value: temp,
        threshold: thresholds.temperature,
        severity: this.calculateSeverity(temp, thresholds.temperature)
      };
    }

    if (thresholds.rainfall) {
      const rain = weatherData.rainfall.value;
      results.rainfall = {
        exceeded: rain > thresholds.rainfall.max || rain < thresholds.rainfall.min,
        value: rain,
        threshold: thresholds.rainfall,
        severity: this.calculateSeverity(rain, thresholds.rainfall)
      };
    }

    if (thresholds.humidity) {
      const humidity = weatherData.humidity.value;
      results.humidity = {
        exceeded: humidity > thresholds.humidity.max || humidity < thresholds.humidity.min,
        value: humidity,
        threshold: thresholds.humidity,
        severity: this.calculateSeverity(humidity, thresholds.humidity)
      };
    }

    if (thresholds.windSpeed) {
      const windSpeed = weatherData.wind.speed.value;
      results.windSpeed = {
        exceeded: windSpeed > thresholds.windSpeed.max,
        value: windSpeed,
        threshold: { max: thresholds.windSpeed.max },
        severity: this.calculateSeverity(windSpeed, { max: thresholds.windSpeed.max })
      };
    }

    return results;
  }

  /**
   * Calculate severity level for threshold exceedance
   * @param {number} value - Current value
   * @param {Object} threshold - Threshold object with min/max
   * @returns {string} - Severity level
   */
  calculateSeverity(value, threshold) {
    if (!threshold) return 'normal';

    const { min = -Infinity, max = Infinity } = threshold;
    
    if (value < min) {
      const deviation = (min - value) / min;
      if (deviation > 0.5) return 'critical';
      if (deviation > 0.2) return 'severe';
      return 'moderate';
    }
    
    if (value > max) {
      const deviation = (value - max) / max;
      if (deviation > 0.5) return 'critical';
      if (deviation > 0.2) return 'severe';
      return 'moderate';
    }
    
    return 'normal';
  }

  /**
   * Get service health status
   * @returns {Object} - Service health information
   */
  async getHealthStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/v1/health`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'WeatherShield/1.0'
        }
      });

      return {
        status: 'healthy',
        responseTime: response.headers['x-response-time'] || 'unknown',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new RedStoneService();
