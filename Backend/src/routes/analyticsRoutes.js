// import { Router } from 'express';
// const router = Router();
// import { find } from '../models/transactionModel';
// import User from '../models/userModel.js';
// import { verify } from 'jsonwebtoken';

// // Middleware to verify token
// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
  
//   if (!token) {
//     return res.status(401).json({ success: false, message: 'No token provided' });
//   }

//   try {
//     const decoded = verify(token, process.env.JWT_SECRET);
//     req.userId = decoded.userId;
//     next();
//   } catch (error) {
//     return res.status(401).json({ success: false, message: 'Invalid token' });
//   }
// };

// // Get dashboard analytics
// router.get('/dashboard', verifyToken, async (req, res) => {
//   try {
//     const userId = req.userId;
    
//     // Get date range (last 6 months)
//     const sixMonthsAgo = new Date();
//     sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
//     // Get all user transactions
//     const transactions = await find({
//       userId,
//       status: 'completed'
//     }).sort({ createdAt: -1 });
    
//     // Calculate summary
//     const summary = {
//       totalReceived: 0,
//       totalSent: 0,
//       netBalance: 0,
//       totalTransactions: transactions.length
//     };
    
//     transactions.forEach(tx => {
//       if (tx.type === 'payment_received') {
//         summary.totalReceived += tx.amount;
//       } else if (tx.type === 'payment_sent') {
//         summary.totalSent += tx.amount;
//       }
//     });
//     summary.netBalance = summary.totalReceived - summary.totalSent;
    
//     // Monthly data
//     const monthlyMap = new Map();
//     transactions.forEach(tx => {
//       const date = new Date(tx.createdAt);
//       const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
//       const monthName = date.toLocaleString('default', { month: 'short' });
      
//       if (!monthlyMap.has(monthKey)) {
//         monthlyMap.set(monthKey, { month: monthName, sent: 0, received: 0 });
//       }
      
//       const monthData = monthlyMap.get(monthKey);
//       if (tx.type === 'payment_sent') {
//         monthData.sent += tx.amount;
//       } else if (tx.type === 'payment_received') {
//         monthData.received += tx.amount;
//       }
//     });
    
//     const monthlyData = Array.from(monthlyMap.values()).slice(-6);
    
//     // Category breakdown
//     const categoryMap = new Map();
//     transactions.forEach(tx => {
//       if (tx.type === 'payment_sent') {
//         const category = tx.category || 'Other';
//         if (!categoryMap.has(category)) {
//           categoryMap.set(category, 0);
//         }
//         categoryMap.set(category, categoryMap.get(category) + tx.amount);
//       }
//     });
    
//     const categoryData = Array.from(categoryMap.entries())
//       .map(([name, value]) => ({ name, value }))
//       .sort((a, b) => b.value - a.value)
//       .slice(0, 5);
    
//     // Weekly activity
//     const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//     const weeklyMap = new Map();
    
//     transactions.forEach(tx => {
//       const date = new Date(tx.createdAt);
//       const dayName = weekDays[date.getDay()];
      
//       if (!weeklyMap.has(dayName)) {
//         weeklyMap.set(dayName, { day: dayName, amount: 0, count: 0 });
//       }
      
//       const dayData = weeklyMap.get(dayName);
//       dayData.amount += tx.amount;
//       dayData.count += 1;
//     });
    
//     const weeklyActivity = Array.from(weeklyMap.values());
    
//     // Last 7 days trend
//     const last7Days = [];
//     for (let i = 6; i >= 0; i--) {
//       const date = new Date();
//       date.setDate(date.getDate() - i);
//       const dateStr = date.toISOString().split('T')[0];
      
//       const dayTransactions = transactions.filter(tx => {
//         const txDate = new Date(tx.createdAt).toISOString().split('T')[0];
//         return txDate === dateStr;
//       });
      
//       let sent = 0, received = 0;
//       dayTransactions.forEach(tx => {
//         if (tx.type === 'payment_sent') sent += tx.amount;
//         else if (tx.type === 'payment_received') received += tx.amount;
//       });
      
//       last7Days.push({
//         label: date.toLocaleDateString('default', { weekday: 'short' }),
//         date: dateStr,
//         sent,
//         received
//       });
//     }
    
//     // Recent transactions
//     const recentTransactions = transactions.slice(0, 10);
    
//     res.json({
//       success: true,
//       analytics: {
//         summary,
//         monthlyData,
//         categoryData,
//         weeklyActivity,
//         last7Days,
//         recentTransactions
//       }
//     });
    
//   } catch (error) {
//     console.error('Analytics error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// export default router;


import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../../config/db.js';

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
    
    // Get summary
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN Type = 'payment_received' THEN Amount ELSE 0 END), 0) AS TotalReceived,
        COALESCE(SUM(CASE WHEN Type = 'payment_sent' THEN Amount ELSE 0 END), 0) AS TotalSent,
        COUNT(*) AS TotalTransactions
      FROM Transactions
      WHERE UserId = ? AND Status = 'completed'
    `;
    
    const summaryResult = await db.executeQuery(summaryQuery, [userId]);
    const summary = summaryResult.recordset[0] || { TotalReceived: 0, TotalSent: 0, TotalTransactions: 0 };
    
    // Get monthly data
    const monthlyQuery = `
      SELECT 
        DATE_FORMAT(CreatedAt, '%b') AS Month,
        COALESCE(SUM(CASE WHEN Type = 'payment_sent' THEN Amount ELSE 0 END), 0) AS Sent,
        COALESCE(SUM(CASE WHEN Type = 'payment_received' THEN Amount ELSE 0 END), 0) AS Received
      FROM Transactions
      WHERE UserId = ? AND Status = 'completed'
        AND CreatedAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(CreatedAt, '%b'), MONTH(CreatedAt)
      ORDER BY MONTH(CreatedAt)
    `;
    
    const monthlyResult = await db.executeQuery(monthlyQuery, [userId]);
    
    // Get category data
    const categoryQuery = `
      SELECT 
        Category AS Name,
        COALESCE(SUM(Amount), 0) AS Value
      FROM Transactions
      WHERE UserId = ? AND Type = 'payment_sent' AND Status = 'completed'
      GROUP BY Category
      ORDER BY Value DESC
    `;
    
    const categoryResult = await db.executeQuery(categoryQuery, [userId]);
    
    // Get weekly activity
    const weeklyQuery = `
      SELECT 
        DAYNAME(CreatedAt) AS Day,
        COALESCE(SUM(Amount), 0) AS Amount,
        COUNT(*) AS Count
      FROM Transactions
      WHERE UserId = ? AND Status = 'completed'
      GROUP BY DAYNAME(CreatedAt), DAYOFWEEK(CreatedAt)
      ORDER BY DAYOFWEEK(CreatedAt)
    `;
    
    const weeklyResult = await db.executeQuery(weeklyQuery, [userId]);
    
    // Get last 7 days trend
    const last7DaysQuery = `
      SELECT 
        DATE_FORMAT(CreatedAt, '%a') AS Label,
        DATE(CreatedAt) AS Date,
        COALESCE(SUM(CASE WHEN Type = 'payment_sent' THEN Amount ELSE 0 END), 0) AS Sent,
        COALESCE(SUM(CASE WHEN Type = 'payment_received' THEN Amount ELSE 0 END), 0) AS Received
      FROM Transactions
      WHERE UserId = ? 
        AND Status = 'completed'
        AND CreatedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(CreatedAt, '%a'), DATE(CreatedAt)
      ORDER BY Date
    `;
    
    const last7DaysResult = await db.executeQuery(last7DaysQuery, [userId]);
    
    // Get recent transactions
    const recentQuery = `
      SELECT 
        TransactionId,
        Type,
        Amount,
        Category,
        Description,
        Status,
        CreatedAt,
        FromAddress,
        ToAddress
      FROM Transactions
      WHERE UserId = ?
      ORDER BY CreatedAt DESC
      LIMIT 10
    `;
    
    const recentResult = await db.executeQuery(recentQuery, [userId]);
    
    res.json({
      success: true,
      analytics: {
        summary: {
          totalReceived: parseFloat(summary.TotalReceived) || 0,
          totalSent: parseFloat(summary.TotalSent) || 0,
          netBalance: parseFloat(summary.TotalReceived - summary.TotalSent) || 0,
          totalTransactions: summary.TotalTransactions || 0
        },
        monthlyData: monthlyResult.recordset || [],
        categoryData: categoryResult.recordset || [],
        weeklyActivity: weeklyResult.recordset || [],
        last7Days: last7DaysResult.recordset || [],
        recentTransactions: recentResult.recordset || []
      }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

export default router;