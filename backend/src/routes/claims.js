const express = require('express');
const { query, body, validationResult } = require('express-validator');
const Claim = require('../models/Claim');
const Farmer = require('../models/Farmer');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/claims
// @desc    Get farmer's claims
// @access  Private
router.get('/', [
  auth,
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'paid', 'failed']).withMessage('Invalid status'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive')
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

    const { status, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { farmerId: req.farmer._id };
    if (status) {
      query.status = status;
    }

    const claims = await Claim.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('farmerId', 'name email walletAddress');

    const totalClaims = await Claim.countDocuments(query);

    res.json({
      success: true,
      data: {
        claims: claims.map(claim => ({
          id: claim._id,
          claimId: claim.claimId,
          status: claim.status,
          weatherData: claim.weatherData,
          payoutDetails: claim.payoutDetails,
          netPayout: claim.netPayout,
          triggeredBy: claim.triggeredBy,
          triggerReason: claim.triggerReason,
          evidence: claim.evidence,
          reviewNotes: claim.reviewNotes,
          reviewedBy: claim.reviewedBy,
          reviewedAt: claim.reviewedAt,
          transactionHash: claim.transactionHash,
          blockNumber: claim.blockNumber,
          paidAt: claim.paidAt,
          createdAt: claim.createdAt,
          ageInDays: claim.ageInDays,
          isRecent: claim.isRecent
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalClaims / limit),
          totalClaims,
          hasNext: page * limit < totalClaims,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/claims/:id
// @desc    Get specific claim
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const claim = await Claim.findOne({
      _id: req.params.id,
      farmerId: req.farmer._id
    }).populate('farmerId', 'name email walletAddress');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    res.json({
      success: true,
      data: {
        claim: {
          id: claim._id,
          claimId: claim.claimId,
          status: claim.status,
          weatherData: claim.weatherData,
          payoutDetails: claim.payoutDetails,
          netPayout: claim.netPayout,
          triggeredBy: claim.triggeredBy,
          triggerReason: claim.triggerReason,
          evidence: claim.evidence,
          reviewNotes: claim.reviewNotes,
          reviewedBy: claim.reviewedBy,
          reviewedAt: claim.reviewedAt,
          transactionHash: claim.transactionHash,
          blockNumber: claim.blockNumber,
          gasUsed: claim.gasUsed,
          processingFee: claim.processingFee,
          paidAt: claim.paidAt,
          createdAt: claim.createdAt,
          updatedAt: claim.updatedAt,
          ageInDays: claim.ageInDays,
          isRecent: claim.isRecent
        }
      }
    });
  } catch (error) {
    console.error('Get claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/claims/:id/evidence
// @desc    Add evidence to claim
// @access  Private
router.post('/:id/evidence', [
  auth,
  body('type').isIn(['weather_data', 'satellite_image', 'field_photo', 'document']).withMessage('Invalid evidence type'),
  body('url').isURL().withMessage('Invalid URL'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long')
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

    const claim = await Claim.findOne({
      _id: req.params.id,
      farmerId: req.farmer._id
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add evidence to processed claim'
      });
    }

    const { type, url, description } = req.body;
    
    claim.evidence.push({
      type,
      url,
      description,
      uploadedAt: new Date()
    });

    await claim.save();

    res.json({
      success: true,
      message: 'Evidence added successfully',
      data: {
        evidence: claim.evidence
      }
    });
  } catch (error) {
    console.error('Add evidence error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/claims/stats/summary
// @desc    Get claims summary statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmer._id);
    
    // Get total payouts
    const totalPayouts = await Claim.calculateTotalPayouts(farmer._id);
    
    // Get claims by status
    const claimsByStatus = await Claim.aggregate([
      { $match: { farmerId: farmer._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$payoutDetails.amount' }
        }
      }
    ]);

    // Get recent claims (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentClaims = await Claim.countDocuments({
      farmerId: farmer._id,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get average payout
    const avgPayout = await Claim.aggregate([
      { $match: { farmerId: farmer._id, status: 'paid' } },
      {
        $group: {
          _id: null,
          average: { $avg: '$payoutDetails.amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalPayouts: totalPayouts[0] || {
          totalAmount: 0,
          totalClaims: 0,
          averagePayout: 0
        },
        claimsByStatus: claimsByStatus.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            totalAmount: item.totalAmount
          };
          return acc;
        }, {}),
        recentClaims,
        averagePayout: avgPayout[0]?.average || 0,
        farmer: {
          name: farmer.name,
          walletAddress: farmer.walletAddress,
          insuranceDetails: farmer.insuranceDetails
        }
      }
    });
  } catch (error) {
    console.error('Get claims stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/claims/stats/timeline
// @desc    Get claims timeline data
// @access  Private
router.get('/stats/timeline', [
  auth,
  query('months').optional().isInt({ min: 1, max: 12 }).withMessage('Months must be between 1-12')
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

    const months = parseInt(req.query.months) || 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const timelineData = await Claim.aggregate([
      {
        $match: {
          farmerId: req.farmer._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$payoutDetails.amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        timeline: timelineData,
        period: `${months} months`,
        startDate,
        endDate: new Date()
      }
    });
  } catch (error) {
    console.error('Get claims timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
