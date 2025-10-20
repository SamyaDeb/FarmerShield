const express = require('express');
const { query, body, validationResult } = require('express-validator');
const { 
  getContractAddresses, 
  isFarmerRegistered, 
  getFarmerDetails, 
  getPremiumBalance, 
  getCUSDBalance 
} = require('../services/contractService');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/contracts/addresses
// @desc    Get contract addresses
// @access  Public
router.get('/addresses', (req, res) => {
  try {
    const addresses = getContractAddresses();
    
    res.json({
      success: true,
      data: {
        addresses,
        network: {
          name: 'Celo Alfajores',
          chainId: 44787,
          rpcUrl: process.env.CELO_RPC_URL
        }
      }
    });
  } catch (error) {
    console.error('Get contract addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/contracts/farmer/:address
// @desc    Check if farmer is registered on blockchain
// @access  Public
router.get('/farmer/:address', [
  query('address').isEthereumAddress().withMessage('Invalid wallet address')
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

    const walletAddress = req.params.address.toLowerCase();
    
    const [isRegistered, farmerDetails] = await Promise.all([
      isFarmerRegistered(walletAddress),
      getFarmerDetails(walletAddress)
    ]);

    res.json({
      success: true,
      data: {
        walletAddress,
        isRegistered,
        farmerDetails: farmerDetails || null
      }
    });
  } catch (error) {
    console.error('Check farmer registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/contracts/balance/:address
// @desc    Get wallet balances
// @access  Public
router.get('/balance/:address', [
  query('address').isEthereumAddress().withMessage('Invalid wallet address')
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

    const walletAddress = req.params.address.toLowerCase();
    
    const [premiumBalance, cusdBalance] = await Promise.all([
      getPremiumBalance(walletAddress),
      getCUSDBalance(walletAddress)
    ]);

    res.json({
      success: true,
      data: {
        walletAddress,
        balances: {
          premium: parseFloat(premiumBalance),
          cusd: parseFloat(cusdBalance)
        },
        currencies: {
          premium: 'cUSD',
          cusd: 'cUSD'
        }
      }
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/contracts/status
// @desc    Get contract status and health
// @access  Public
router.get('/status', async (req, res) => {
  try {
    const addresses = getContractAddresses();
    
    // Test contract connectivity
    const testResults = await Promise.allSettled([
      isFarmerRegistered('0x0000000000000000000000000000000000000000'),
      getCUSDBalance('0x0000000000000000000000000000000000000000')
    ]);

    const contractHealth = {
      farmerRegistry: testResults[0].status === 'fulfilled',
      cusd: testResults[1].status === 'fulfilled'
    };

    const allHealthy = Object.values(contractHealth).every(status => status);

    res.json({
      success: true,
      data: {
        status: allHealthy ? 'healthy' : 'degraded',
        contracts: contractHealth,
        addresses,
        network: {
          name: 'Celo Alfajores',
          chainId: 44787,
          rpcUrl: process.env.CELO_RPC_URL
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get contract status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/contracts/events
// @desc    Get recent contract events (mock implementation)
// @access  Public
router.get('/events', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('type').optional().isIn(['FarmerRegistered', 'PremiumPaid', 'PayoutTriggered']).withMessage('Invalid event type')
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

    const { limit = 20, type } = req.query;
    const limitCount = parseInt(limit);

    // This would typically query blockchain events
    // For now, we'll return mock events
    const mockEvents = [
      {
        type: 'FarmerRegistered',
        farmer: '0x1234567890123456789012345678901234567890',
        latitude: '40.7128',
        longitude: '-74.0060',
        cropType: 'wheat',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        blockNumber: 12345678,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'PremiumPaid',
        farmer: '0x1234567890123456789012345678901234567890',
        amount: '100.0',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567891',
        blockNumber: 12345679,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'PayoutTriggered',
        farmer: '0x1234567890123456789012345678901234567890',
        amount: '500.0',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567892',
        blockNumber: 12345680,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }
    ];

    let events = mockEvents;
    if (type) {
      events = events.filter(event => event.type === type);
    }

    events = events.slice(0, limitCount);

    res.json({
      success: true,
      data: {
        events,
        count: events.length,
        limit: limitCount,
        type: type || 'all'
      }
    });
  } catch (error) {
    console.error('Get contract events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/contracts/verify
// @desc    Verify contract interaction (for testing)
// @access  Public
router.post('/verify', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('action').isIn(['register', 'premium', 'payout']).withMessage('Invalid action')
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

    const { walletAddress, action } = req.body;

    let result;
    switch (action) {
      case 'register':
        result = await isFarmerRegistered(walletAddress);
        break;
      case 'premium':
        result = await getPremiumBalance(walletAddress);
        break;
      case 'payout':
        result = await getCUSDBalance(walletAddress);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    res.json({
      success: true,
      data: {
        walletAddress,
        action,
        result,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Verify contract interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
