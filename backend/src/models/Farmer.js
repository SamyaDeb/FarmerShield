const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  phone: {
    type: String,
    required: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format']
  },
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
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    }
  },
  farmDetails: {
    cropType: {
      type: String,
      required: true,
      enum: ['wheat', 'rice', 'corn', 'soybean', 'cotton', 'sugarcane', 'potato', 'tomato', 'other']
    },
    farmSize: {
      type: Number,
      required: true,
      min: 0.1
    },
    farmSizeUnit: {
      type: String,
      required: true,
      enum: ['acres', 'hectares']
    },
    plantingDate: {
      type: Date,
      required: true
    },
    expectedHarvestDate: {
      type: Date,
      required: true
    }
  },
  insuranceDetails: {
    isRegistered: {
      type: Boolean,
      default: false
    },
    registrationDate: {
      type: Date
    },
    premiumAmount: {
      type: Number,
      default: 0
    },
    coverageAmount: {
      type: Number,
      default: 0
    },
    policyStatus: {
      type: String,
      enum: ['active', 'inactive', 'expired', 'suspended'],
      default: 'inactive'
    },
    lastPremiumPayment: {
      type: Date
    },
    nextPremiumDue: {
      type: Date
    }
  },
  weatherThresholds: {
    temperature: {
      min: Number,
      max: Number
    },
    rainfall: {
      min: Number,
      max: Number
    },
    humidity: {
      min: Number,
      max: Number
    },
    windSpeed: {
      max: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
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

// Indexes for better query performance
farmerSchema.index({ walletAddress: 1 });
farmerSchema.index({ email: 1 });
farmerSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
farmerSchema.index({ 'farmDetails.cropType': 1 });
farmerSchema.index({ 'insuranceDetails.policyStatus': 1 });
farmerSchema.index({ createdAt: -1 });

// Virtual for full name
farmerSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for farm size in acres
farmerSchema.virtual('farmSizeInAcres').get(function() {
  if (this.farmDetails.farmSizeUnit === 'hectares') {
    return this.farmDetails.farmSize * 2.47105; // Convert hectares to acres
  }
  return this.farmDetails.farmSize;
});

// Pre-save middleware
farmerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find farmers by location
farmerSchema.statics.findByLocation = function(latitude, longitude, radiusInKm = 50) {
  const earthRadius = 6371; // Earth's radius in kilometers
  
  return this.find({
    'location.latitude': {
      $gte: latitude - (radiusInKm / earthRadius) * (180 / Math.PI),
      $lte: latitude + (radiusInKm / earthRadius) * (180 / Math.PI)
    },
    'location.longitude': {
      $gte: longitude - (radiusInKm / earthRadius) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180),
      $lte: longitude + (radiusInKm / earthRadius) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180)
    }
  });
};

// Instance method to check if farmer is eligible for payout
farmerSchema.methods.isEligibleForPayout = function() {
  return this.insuranceDetails.isRegistered && 
         this.insuranceDetails.policyStatus === 'active' &&
         this.isActive;
};

module.exports = mongoose.model('Farmer', farmerSchema);
