const express = require('express');
const { body, validationResult } = require('express-validator');
const Farmer = require('../models/Farmer');
const { generateToken } = require('../middleware/auth');
const { authenticateWallet } = require('../services/walletService');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new farmer
// @access  Public
router.post('/register', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('location.address').trim().isLength({ min: 5 }).withMessage('Address is required'),
  body('location.city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('location.state').trim().isLength({ min: 2 }).withMessage('State is required'),
  body('location.country').trim().isLength({ min: 2 }).withMessage('Country is required'),
  body('farmDetails.cropType').isIn(['wheat', 'rice', 'corn', 'soybean', 'cotton', 'sugarcane', 'potato', 'tomato', 'other']).withMessage('Invalid crop type'),
  body('farmDetails.farmSize').isFloat({ min: 0.1 }).withMessage('Farm size must be at least 0.1'),
  body('farmDetails.farmSizeUnit').isIn(['acres', 'hectares']).withMessage('Invalid farm size unit'),
  body('farmDetails.plantingDate').isISO8601().withMessage('Invalid planting date'),
  body('farmDetails.expectedHarvestDate').isISO8601().withMessage('Invalid harvest date'),
  body('signature').notEmpty().withMessage('Wallet signature is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      walletAddress,
      name,
      email,
      phone,
      location,
      farmDetails,
      signature,
      message
    } = req.body;

    // Verify wallet signature
    const isValidSignature = await authenticateWallet(walletAddress, signature, message);
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet signature'
      });
    }

    // Check if farmer already exists
    const existingFarmer = await Farmer.findOne({
      $or: [
        { walletAddress: walletAddress.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingFarmer) {
      return res.status(400).json({
        success: false,
        message: 'Farmer already exists with this wallet address or email'
      });
    }

    // Create new farmer
    const farmer = new Farmer({
      walletAddress: walletAddress.toLowerCase(),
      name,
      email: email.toLowerCase(),
      phone,
      location,
      farmDetails,
      insuranceDetails: {
        isRegistered: false,
        policyStatus: 'inactive'
      }
    });

    await farmer.save();

    // Generate JWT token
    const token = generateToken(farmer._id);

    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully',
      data: {
        farmer: {
          id: farmer._id,
          walletAddress: farmer.walletAddress,
          name: farmer.name,
          email: farmer.email,
          location: farmer.location,
          farmDetails: farmer.farmDetails,
          insuranceDetails: farmer.insuranceDetails
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login farmer with wallet signature
// @access  Public
router.post('/login', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('signature').notEmpty().withMessage('Wallet signature is required'),
  body('message').notEmpty().withMessage('Message is required')
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

    const { walletAddress, signature, message } = req.body;

    // Verify wallet signature
    const isValidSignature = await authenticateWallet(walletAddress, signature, message);
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet signature'
      });
    }

    // Find farmer by wallet address
    const farmer = await Farmer.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found. Please register first.'
      });
    }

    if (!farmer.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Update last login
    farmer.lastLogin = new Date();
    await farmer.save();

    // Generate JWT token
    const token = generateToken(farmer._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        farmer: {
          id: farmer._id,
          walletAddress: farmer.walletAddress,
          name: farmer.name,
          email: farmer.email,
          location: farmer.location,
          farmDetails: farmer.farmDetails,
          insuranceDetails: farmer.insuranceDetails
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current farmer profile
// @access  Private
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmer._id).select('-__v');
    
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
          createdAt: farmer.createdAt
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

// @route   POST /api/auth/verify-signature
// @desc    Verify wallet signature without authentication
// @access  Public
router.post('/verify-signature', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('signature').notEmpty().withMessage('Wallet signature is required'),
  body('message').notEmpty().withMessage('Message is required')
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

    const { walletAddress, signature, message } = req.body;

    const isValidSignature = await authenticateWallet(walletAddress, signature, message);
    
    res.json({
      success: true,
      data: {
        isValid: isValidSignature
      }
    });

  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signature verification'
    });
  }
});

module.exports = router;
