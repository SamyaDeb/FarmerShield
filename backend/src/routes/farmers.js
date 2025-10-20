const express = require('express');
const { body, validationResult } = require('express-validator');
const Farmer = require('../models/Farmer');
const { auth } = require('../middleware/auth');
const { isFarmerRegistered, getFarmerDetails, getPremiumBalance, getCUSDBalance } = require('../services/contractService');

const router = express.Router();

// @route   GET /api/farmers/profile
// @desc    Get farmer profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmer._id);
    
    // Get blockchain data
    const [isRegistered, farmerDetails, premiumBalance, cusdBalance] = await Promise.all([
      isFarmerRegistered(farmer.walletAddress),
      getFarmerDetails(farmer.walletAddress),
      getPremiumBalance(farmer.walletAddress),
      getCUSDBalance(farmer.walletAddress)
    ]);
    
    res.json({
      success: true,
      data: {
        farmer: {
          id: farmer._id,
          walletAddress: farmer.walletAddress,
          name: farmer.name,
          email: farmer.email,
          phone: farmer.phone,
          location: farmer.location,
          farmDetails: farmer.farmDetails,
          insuranceDetails: farmer.insuranceDetails,
          weatherThresholds: farmer.weatherThresholds,
          isActive: farmer.isActive,
          lastLogin: farmer.lastLogin,
          createdAt: farmer.createdAt,
          blockchainData: {
            isRegistered,
            farmerDetails,
            premiumBalance: parseFloat(premiumBalance),
            cusdBalance: parseFloat(cusdBalance)
          }
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/farmers/profile
// @desc    Update farmer profile
// @access  Private
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('location.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('location.address').optional().trim().isLength({ min: 5 }).withMessage('Address is required'),
  body('location.city').optional().trim().isLength({ min: 2 }).withMessage('City is required'),
  body('location.state').optional().trim().isLength({ min: 2 }).withMessage('State is required'),
  body('location.country').optional().trim().isLength({ min: 2 }).withMessage('Country is required'),
  body('farmDetails.cropType').optional().isIn(['wheat', 'rice', 'corn', 'soybean', 'cotton', 'sugarcane', 'potato', 'tomato', 'other']).withMessage('Invalid crop type'),
  body('farmDetails.farmSize').optional().isFloat({ min: 0.1 }).withMessage('Farm size must be at least 0.1'),
  body('farmDetails.farmSizeUnit').optional().isIn(['acres', 'hectares']).withMessage('Invalid farm size unit'),
  body('farmDetails.plantingDate').optional().isISO8601().withMessage('Invalid planting date'),
  body('farmDetails.expectedHarvestDate').optional().isISO8601().withMessage('Invalid harvest date')
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

    const farmer = await Farmer.findById(req.farmer._id);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'phone', 'location', 'farmDetails'];
    allowedUpdates.forEach(field => {
      if (req.body[field]) {
        farmer[field] = { ...farmer[field], ...req.body[field] };
      }
    });

    await farmer.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        farmer: {
          id: farmer._id,
          walletAddress: farmer.walletAddress,
          name: farmer.name,
          email: farmer.email,
          phone: farmer.phone,
          location: farmer.location,
          farmDetails: farmer.farmDetails,
          insuranceDetails: farmer.insuranceDetails,
          weatherThresholds: farmer.weatherThresholds
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/farmers/weather-thresholds
// @desc    Update weather thresholds
// @access  Private
router.put('/weather-thresholds', [
  auth,
  body('temperature.min').optional().isFloat().withMessage('Invalid temperature min'),
  body('temperature.max').optional().isFloat().withMessage('Invalid temperature max'),
  body('rainfall.min').optional().isFloat({ min: 0 }).withMessage('Invalid rainfall min'),
  body('rainfall.max').optional().isFloat({ min: 0 }).withMessage('Invalid rainfall max'),
  body('humidity.min').optional().isFloat({ min: 0, max: 100 }).withMessage('Invalid humidity min'),
  body('humidity.max').optional().isFloat({ min: 0, max: 100 }).withMessage('Invalid humidity max'),
  body('windSpeed.max').optional().isFloat({ min: 0 }).withMessage('Invalid wind speed max')
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

    const farmer = await Farmer.findById(req.farmer._id);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    farmer.weatherThresholds = { ...farmer.weatherThresholds, ...req.body };
    await farmer.save();

    res.json({
      success: true,
      message: 'Weather thresholds updated successfully',
      data: {
        weatherThresholds: farmer.weatherThresholds
      }
    });
  } catch (error) {
    console.error('Update weather thresholds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/farmers/register-insurance
// @desc    Register for insurance
// @access  Private
router.post('/register-insurance', [
  auth,
  body('premiumAmount').isFloat({ min: 0 }).withMessage('Premium amount must be positive'),
  body('coverageAmount').isFloat({ min: 0 }).withMessage('Coverage amount must be positive')
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

    const { premiumAmount, coverageAmount } = req.body;
    const farmer = await Farmer.findById(req.farmer._id);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    if (farmer.insuranceDetails.isRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Farmer is already registered for insurance'
      });
    }

    // Update insurance details
    farmer.insuranceDetails = {
      isRegistered: true,
      registrationDate: new Date(),
      premiumAmount,
      coverageAmount,
      policyStatus: 'active',
      nextPremiumDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    };

    await farmer.save();

    res.json({
      success: true,
      message: 'Insurance registration successful',
      data: {
        insuranceDetails: farmer.insuranceDetails
      }
    });
  } catch (error) {
    console.error('Register insurance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/farmers/stats
// @desc    Get farmer statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmer._id);
    
    // Get blockchain balances
    const [premiumBalance, cusdBalance] = await Promise.all([
      getPremiumBalance(farmer.walletAddress),
      getCUSDBalance(farmer.walletAddress)
    ]);

    // Get claim statistics
    const Claim = require('../models/Claim');
    const claimStats = await Claim.calculateTotalPayouts(farmer._id);
    
    res.json({
      success: true,
      data: {
        balances: {
          premium: parseFloat(premiumBalance),
          cusd: parseFloat(cusdBalance)
        },
        claims: claimStats[0] || {
          totalAmount: 0,
          totalClaims: 0,
          averagePayout: 0
        },
        farmDetails: {
          size: farmer.farmSizeInAcres,
          cropType: farmer.farmDetails.cropType,
          plantingDate: farmer.farmDetails.plantingDate,
          expectedHarvestDate: farmer.farmDetails.expectedHarvestDate
        },
        insurance: farmer.insuranceDetails
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/farmers/nearby
// @desc    Get nearby farmers
// @access  Private
router.get('/nearby', [
  auth,
  body('radius').optional().isFloat({ min: 1, max: 100 }).withMessage('Radius must be between 1-100 km')
], async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmer._id);
    const radius = parseFloat(req.query.radius) || 50; // Default 50km radius
    
    const nearbyFarmers = await Farmer.findByLocation(
      farmer.location.latitude,
      farmer.location.longitude,
      radius
    ).select('name location farmDetails insuranceDetails isActive').limit(20);

    res.json({
      success: true,
      data: {
        farmers: nearbyFarmers.map(f => ({
          id: f._id,
          name: f.name,
          location: f.location,
          farmDetails: f.farmDetails,
          insuranceDetails: f.insuranceDetails,
          isActive: f.isActive
        })),
        count: nearbyFarmers.length,
        radius
      }
    });
  } catch (error) {
    console.error('Get nearby farmers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
