// Backend/src/routes/analyticsRoutes.js
import express from 'express';
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

// Get dashboard analytics
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get all user's completed transactions
    const transactions = await Transaction.find({ 
      userId: userId, 
      status: 'completed' 
    }).sort({ createdAt: -1 });
    
    // Calculate summary
    const summary = {
      totalReceived: 0,
      totalSent: 0,
      netBalance: 0,
      totalTransactions: transactions.length
    };
    
    transactions.forEach(tx => {
      if (tx.type === 'payment_received') {
        summary.totalReceived += tx.amount;
      } else if (tx.type === 'payment_sent') {
        summary.totalSent += tx.amount;
      }
    });
    summary.netBalance = summary.totalReceived - summary.totalSent;
    
    // Monthly data (last 6 months)
    const monthlyMap = new Map();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    transactions.forEach(tx => {
      const date = new Date(tx.createdAt);
      if (date >= sixMonthsAgo) {
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const monthName = date.toLocaleString('default', { month: 'short' });
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { month: monthName, sent: 0, received: 0 });
        }
        
        const monthData = monthlyMap.get(monthKey);
        if (tx.type === 'payment_sent') {
          monthData.sent += tx.amount;
        } else if (tx.type === 'payment_received') {
          monthData.received += tx.amount;
        }
      }
    });
    
    const monthlyData = Array.from(monthlyMap.values()).slice(-6);
    
    // Category breakdown (for spending)
    const categoryMap = new Map();
    transactions.forEach(tx => {
      if (tx.type === 'payment_sent') {
        const category = tx.category || 'Other';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, 0);
        }
        categoryMap.set(category, categoryMap.get(category) + tx.amount);
      }
    });
    
    const categoryData = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    // Weekly activity
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyMap = new Map();
    
    transactions.forEach(tx => {
      const date = new Date(tx.createdAt);
      const dayName = weekDays[date.getDay()];
      
      if (!weeklyMap.has(dayName)) {
        weeklyMap.set(dayName, { day: dayName, amount: 0, count: 0 });
      }
      
      const dayData = weeklyMap.get(dayName);
      dayData.amount += tx.amount;
      dayData.count += 1;
    });
    
    const weeklyActivity = Array.from(weeklyMap.values());
    
    // Last 7 days trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.createdAt).toISOString().split('T')[0];
        return txDate === dateStr;
      });
      
      let sent = 0, received = 0;
      dayTransactions.forEach(tx => {
        if (tx.type === 'payment_sent') sent += tx.amount;
        else if (tx.type === 'payment_received') received += tx.amount;
      });
      
      last7Days.push({
        label: date.toLocaleDateString('default', { weekday: 'short' }),
        date: dateStr,
        sent,
        received
      });
    }
    
    // Recent transactions
    const recentTransactions = transactions.slice(0, 10).map(tx => ({
      id: tx._id,
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description,
      status: tx.status,
      createdAt: tx.createdAt,
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress
    }));
    
    res.json({
      success: true,
      analytics: {
        summary,
        monthlyData,
        categoryData,
        weeklyActivity,
        last7Days,
        recentTransactions
      }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

export default router;