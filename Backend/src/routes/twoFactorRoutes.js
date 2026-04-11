// Backend/src/routes/twoFactorRoutes.js
import express from 'express';
import User from '../models/userModel.js';
import TwoFactorService from '../services/twoFactorService.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Setup 2FA (Generate secret and QR code)
router.post('/setup', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Generate 2FA secret
    const { secret, qrCode, otpauthUrl } = await TwoFactorService.generateSecret(user.email);
    
    // Store secret temporarily (will be enabled after verification)
    req.session = req.session || {};
    req.session.tempSecret = secret;
    
    res.json({
      success: true,
      secret: secret,
      qrCode: qrCode,
      otpauthUrl: otpauthUrl
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify and enable 2FA
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { token, secret } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Verify the token
    const isValid = TwoFactorService.verifyToken(secret, token);
    
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
    
    // Generate backup codes
    const backupCodes = TwoFactorService.generateBackupCodes();
    
    // Enable 2FA for user
    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    user.backupCodes = backupCodes;
    await user.save();
    
    res.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes: backupCodes.map(bc => bc.code)
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Disable 2FA
router.post('/disable', verifyToken, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.userId).select('+twoFactorSecret');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.twoFactorEnabled) {
      // Verify token before disabling
      const isValid = TwoFactorService.verifyToken(user.twoFactorSecret, token);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid verification code' });
      }
    }
    
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.backupCodes = [];
    await user.save();
    
    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify 2FA during login
router.post('/verify-login', async (req, res) => {
  try {
    const { email, token, backupCode } = req.body;
    
    const user = await User.findOne({ email }).select('+twoFactorSecret +backupCodes');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let isValid = false;
    
    // Check backup code
    if (backupCode) {
      const backupCodeObj = user.backupCodes.find(bc => bc.code === backupCode && !bc.used);
      if (backupCodeObj) {
        backupCodeObj.used = true;
        await user.save();
        isValid = true;
      }
    } 
    // Check TOTP token
    else if (token) {
      isValid = TwoFactorService.verifyToken(user.twoFactorSecret, token);
    }
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
    }
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, twoFactorVerified: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('2FA login verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get 2FA status
router.get('/status', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      success: true,
      enabled: user?.twoFactorEnabled || false
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;