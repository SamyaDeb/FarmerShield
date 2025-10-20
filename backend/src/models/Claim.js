const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  claimId: {
    type: String,
    required: true,
    unique: true
  },
  weatherData: {
    temperature: {
      value: Number,
      unit: { type: String, default: 'celsius' },
      threshold: Number,
      exceeded: Boolean
    },
    rainfall: {
      value: Number,
      unit: { type: String, default: 'mm' },
      threshold: Number,
      exceeded: Boolean
    },
    humidity: {
      value: Number,
      unit: { type: String, default: 'percent' },
      threshold: Number,
      exceeded: Boolean
    },
    windSpeed: {
      value: Number,
      unit: { type: String, default: 'km/h' },
      threshold: Number,
      exceeded: Boolean
    },
    timestamp: {
      type: Date,
      required: true
    },
    location: {
      latitude: Number,
      longitude: Number
    }
  },
  payoutDetails: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'cUSD'
    },
    multiplier: {
      type: Number,
      default: 1.0
    },
    calculationMethod: {
      type: String,
      enum: ['parametric', 'indemnity', 'hybrid'],
      default: 'parametric'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid', 'failed'],
    default: 'pending'
  },
  transactionHash: {
    type: String,
    sparse: true
  },
  blockNumber: {
    type: Number,
    sparse: true
  },
  gasUsed: {
    type: Number,
    sparse: true
  },
  processingFee: {
    type: Number,
    default: 0
  },
  netPayout: {
    type: Number,
    required: true
  },
  triggeredBy: {
    type: String,
    enum: ['automatic', 'manual', 'oracle'],
    default: 'automatic'
  },
  triggerReason: {
    type: String,
    required: true
  },
  evidence: [{
    type: {
      type: String,
      enum: ['weather_data', 'satellite_image', 'field_photo', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reviewNotes: {
    type: String,
    maxlength: 1000
  },
  reviewedBy: {
    type: String
  },
  reviewedAt: {
    type: Date
  },
  paidAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
claimSchema.index({ farmerId: 1 });
claimSchema.index({ walletAddress: 1 });
claimSchema.index({ claimId: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ createdAt: -1 });
claimSchema.index({ 'weatherData.timestamp': -1 });
claimSchema.index({ transactionHash: 1 }, { sparse: true });

// Virtual for claim age in days
claimSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for is recent claim
claimSchema.virtual('isRecent').get(function() {
  return this.ageInDays <= 7;
});

// Pre-save middleware
claimSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate net payout
  if (this.payoutDetails.amount && this.processingFee) {
    this.netPayout = this.payoutDetails.amount - this.processingFee;
  } else {
    this.netPayout = this.payoutDetails.amount || 0;
  }
  
  next();
});

// Static method to find claims by status
claimSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('farmerId', 'name email walletAddress');
};

// Static method to find claims by farmer
claimSchema.statics.findByFarmer = function(farmerId, limit = 10) {
  return this.find({ farmerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('farmerId', 'name email walletAddress');
};

// Static method to calculate total payouts
claimSchema.statics.calculateTotalPayouts = function(farmerId = null) {
  const matchStage = farmerId ? { farmerId: new mongoose.Types.ObjectId(farmerId) } : {};
  
  return this.aggregate([
    { $match: { ...matchStage, status: 'paid' } },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$payoutDetails.amount' },
        totalClaims: { $sum: 1 },
        averagePayout: { $avg: '$payoutDetails.amount' }
      }
    }
  ]);
};

// Instance method to approve claim
claimSchema.methods.approve = function(reviewedBy, notes = '') {
  this.status = 'approved';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

// Instance method to reject claim
claimSchema.methods.reject = function(reviewedBy, notes = '') {
  this.status = 'rejected';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

// Instance method to mark as paid
claimSchema.methods.markAsPaid = function(transactionHash, blockNumber, gasUsed) {
  this.status = 'paid';
  this.transactionHash = transactionHash;
  this.blockNumber = blockNumber;
  this.gasUsed = gasUsed;
  this.paidAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Claim', claimSchema);
