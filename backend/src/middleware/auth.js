const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const farmer = await Farmer.findById(decoded.farmerId).select('-__v');
    
    if (!farmer) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.farmer = farmer;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const farmer = await Farmer.findById(decoded.farmerId).select('-__v');
      if (farmer) {
        req.farmer = farmer;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

const generateToken = (farmerId) => {
  return jwt.sign(
    { farmerId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = { auth, optionalAuth, generateToken };
