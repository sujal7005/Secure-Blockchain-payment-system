// Backend/src/routes/userRoutes.js (Simplified login for now)
import express from 'express';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import Transaction from '../models/transactionModel.js';

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

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', { email: req.body.email });
    
    const { fullName, email, password, phone, walletAddress } = req.body;
    
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    // Create new user
    const user = new User({ 
      fullName, 
      email, 
      password, 
      phone, 
      walletAddress 
    });
    
    await user.save();
    console.log('User created successfully:', user._id);
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    // Return user without password
    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      walletAddress: user.walletAddress
    };
    
    res.status(201).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login (simplified - without 2FA for now)
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Compare password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        walletAddress: user.walletAddress,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Backend/src/routes/userRoutes.js - Add these missing endpoints

// Get wallet info (you already have this, but let's ensure it's correct)
router.get('/wallet-info', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Get transactions to calculate balance
    const transactions = await Transaction.find({ 
      userId: req.userId, 
      status: 'completed' 
    });
    
    const balance = transactions.reduce((total, tx) => {
      if (tx.type === 'payment_received') return total + tx.amount;
      if (tx.type === 'payment_sent') return total - tx.amount;
      return total;
    }, 0);
    
    res.json({
      success: true,
      balance: balance,
      walletAddress: user?.walletAddress || '',
      network: 'Ethereum Mainnet'
    });
  } catch (error) {
    console.error('Wallet info error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user transactions
router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Format transactions for frontend
    const formattedTransactions = transactions.map(tx => ({
      id: tx._id,
      type: tx.type === 'payment_sent' ? 'sent' : 'received',
      amount: tx.amount,
      currency: tx.currency || 'ETH',
      from: tx.fromAddress,
      to: tx.toAddress,
      status: tx.status,
      description: tx.description,
      date: tx.createdAt,
      category: tx.category
    }));
    
    res.json({ success: true, transactions: formattedTransactions });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get security settings
router.get('/security-settings', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    const settings = {
      twoFactorAuth: user?.twoFactorEnabled || false,
      transactionLimit: user?.securitySettings?.transactionLimit || 10000,
      notificationEmail: user?.securitySettings?.notificationEmail || true,
      notificationPush: user?.securitySettings?.notificationPush || true
    };
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Security settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update security settings
router.put('/security-settings', verifyToken, async (req, res) => {
  try {
    const { twoFactorAuth, transactionLimit, notificationEmail, notificationPush } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        twoFactorEnabled: twoFactorAuth,
        securitySettings: {
          transactionLimit,
          notificationEmail,
          notificationPush
        }
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Update security settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload avatar
router.post('/upload-avatar', verifyToken, async (req, res) => {
  try {
    const { avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, avatarUrl: user.avatar });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export private key
router.get('/export-private-key', verifyToken, async (req, res) => {
  try {
    // In production, never store private keys in database
    // This is a mock implementation
    const mockPrivateKey = '0x' + Array(64).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    res.json({ success: true, privateKey: mockPrivateKey });
  } catch (error) {
    console.error('Export private key error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;