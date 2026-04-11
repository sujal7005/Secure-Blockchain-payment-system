import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    WalletIcon,
    BanknotesIcon,
    UserGroupIcon,
    CalendarIcon,
    ArrowPathIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
    const { user, logout } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const goBack = () => {
        window.history.back();
    };

    const goToDashboard = () => {
        window.location.href = '/';
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                setLoading(false);
                return;
            }

            console.log('Fetching analytics data...');

            const response = await fetch('http://localhost:5000/api/analytics/dashboard', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response);

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                logout();
                setError('Session expired. Please login again.');
                toast.error('Session expired. Please login again.');
                setTimeout(() => goToDashboard(), 2000);
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Analytics data received:', data);

            if (data.success) {
                setAnalytics(data.analytics);
                toast.success('Analytics loaded successfully!');
            } else {
                setError(data.message || 'Failed to load analytics');
                toast.error(data.message || 'Failed to load analytics');
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError('Failed to load analytics data. Please try again later.');
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#292929] flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-800 border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <p className="mt-4 text-gray-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#292929] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Unable to load analytics</h3>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={fetchAnalytics}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:opacity-90 transition"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={goToDashboard}
                            className="px-4 py-2 bg-gray-800 rounded-xl text-gray-300 font-medium hover:bg-gray-700 transition"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics || !analytics.summary) {
        return (
            <div className="min-h-screen bg-[#292929] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No data available</h3>
                    <p className="text-gray-400">Start making transactions to see analytics</p>
                    <button
                        onClick={goToDashboard}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:opacity-90 transition"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { summary, monthlyData = [], categoryData = [], weeklyActivity = [], last7Days = [], recentTransactions = [] } = analytics;

    const maxMonthly = monthlyData.length > 0 ? Math.max(...monthlyData.map(m => Math.max(m.sent || 0, m.received || 0))) : 1;
    const maxCategory = categoryData.length > 0 ? Math.max(...categoryData.map(c => c.value || 0)) : 1;
    const maxWeekly = weeklyActivity.length > 0 ? Math.max(...weeklyActivity.map(w => w.amount || 0)) : 1;

    return (
        <div className="min-h-screen bg-[#292929] py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={goBack}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 hover:text-white transition-all duration-200"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span>Back</span>
                    </button>

                    <div className="text-center flex-1">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-2 shadow-lg">
                            <ChartBarIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Analytics Dashboard
                        </h1>
                    </div>

                    <div className="w-20"></div>
                </div>

                <p className="text-center text-gray-400 text-sm -mt-4 mb-8">Track your spending patterns and financial insights</p>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                            <p className="text-gray-500 text-sm">Total Received</p>
                        </div>
                        <p className="text-xl font-bold text-green-400">{formatCurrency(summary.totalReceived)}</p>
                    </div>
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
                            <p className="text-gray-500 text-sm">Total Sent</p>
                        </div>
                        <p className="text-xl font-bold text-red-400">{formatCurrency(summary.totalSent)}</p>
                    </div>
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                            <WalletIcon className="w-4 h-4 text-blue-400" />
                            <p className="text-gray-500 text-sm">Net Balance</p>
                        </div>
                        <p className={`text-xl font-bold ${summary.netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(summary.netBalance)}
                        </p>
                    </div>
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                            <BanknotesIcon className="w-4 h-4 text-purple-400" />
                            <p className="text-gray-500 text-sm">Total Transactions</p>
                        </div>
                        <p className="text-xl font-bold text-white">{summary.totalTransactions}</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Monthly Spending Chart */}
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 border border-gray-800">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-blue-400" />
                            Monthly Spending vs Income
                        </h3>
                        <div className="space-y-3">
                            {monthlyData.length > 0 ? (
                                monthlyData.slice(-6).map((month, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">{month.month}</span>
                                            <div className="flex gap-3">
                                                <span className="text-red-400">Sent: {formatCurrency(month.sent)}</span>
                                                <span className="text-green-400">Received: {formatCurrency(month.received)}</span>
                                            </div>
                                        </div>
                                        <div className="h-8 bg-gray-800 rounded-lg overflow-hidden flex">
                                            <div
                                                className="bg-red-500/80 h-full transition-all duration-500"
                                                style={{ width: `${(month.sent / maxMonthly) * 100}%` }}
                                            />
                                            <div
                                                className="bg-green-500/80 h-full transition-all duration-500"
                                                style={{ width: `${(month.received / maxMonthly) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No monthly data available</p>
                            )}
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 border border-gray-800">
                        <h3 className="text-white font-semibold mb-4">Spending by Category</h3>
                        <div className="space-y-3">
                            {categoryData.length > 0 ? (
                                categoryData.map((category, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-300">{category.name}</span>
                                            <span className="text-white font-medium">{formatCurrency(category.value)}</span>
                                        </div>
                                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-blue-500' :
                                                        idx === 1 ? 'bg-purple-500' :
                                                            idx === 2 ? 'bg-green-500' :
                                                                idx === 3 ? 'bg-yellow-500' : 'bg-pink-500'
                                                    }`}
                                                style={{ width: `${(category.value / maxCategory) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No category data available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Weekly Activity Heatmap */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 border border-gray-800 mb-8">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5 text-purple-400" />
                        Weekly Activity Heatmap
                    </h3>
                    <div className="grid grid-cols-7 gap-2">
                        {weeklyActivity.length > 0 ? (
                            weeklyActivity.map((day, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="text-xs text-gray-400 mb-2">{day.day?.slice(0, 3) || 'N/A'}</div>
                                    <div
                                        className="h-16 bg-gradient-to-t from-blue-500/20 to-purple-500/20 rounded-lg transition-all duration-500 hover:scale-110"
                                        style={{
                                            height: `${Math.max(20, (day.amount / maxWeekly) * 60)}px`,
                                            opacity: day.amount > 0 ? 1 : 0.3
                                        }}
                                    />
                                    <div className="text-xs text-gray-500 mt-1">{day.count || 0} tx</div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-7 text-center py-8 text-gray-500">No weekly activity data</div>
                        )}
                    </div>
                </div>

                {/* Last 7 Days Trend */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 border border-gray-800 mb-8">
                    <h3 className="text-white font-semibold mb-4">Last 7 Days Trend</h3>
                    <div className="space-y-3">
                        {last7Days.length > 0 ? (
                            last7Days.map((day, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">{day.label} ({day.date})</span>
                                        <div className="flex gap-3">
                                            <span className="text-red-400">-{formatCurrency(day.sent)}</span>
                                            <span className="text-green-400">+{formatCurrency(day.received)}</span>
                                        </div>
                                    </div>
                                    <div className="h-6 bg-gray-800 rounded-lg overflow-hidden flex">
                                        <div
                                            className="bg-red-500/70 h-full transition-all duration-500"
                                            style={{ width: `${(day.sent / (day.sent + day.received || 1)) * 100}%` }}
                                        />
                                        <div
                                            className="bg-green-500/70 h-full transition-all duration-500"
                                            style={{ width: `${(day.received / (day.sent + day.received || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No trend data available</p>
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-5 border border-gray-800">
                    <h3 className="text-white font-semibold mb-4">Recent Transactions</h3>
                    <div className="space-y-2">
                        {recentTransactions.length > 0 ? (
                            recentTransactions.slice(0, 5).map((tx, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                                    <div>
                                        <p className="text-white text-sm font-medium">
                                            {tx.type === 'payment_sent' ? 'Sent to' : 'Received from'} {tx.toUser || tx.fromUser || 'Wallet'}
                                        </p>
                                        <p className="text-gray-500 text-xs">{formatDate(tx.createdAt)}</p>
                                    </div>
                                    <div className={`font-semibold ${tx.type === 'payment_sent' ? 'text-red-400' : 'text-green-400'}`}>
                                        {tx.type === 'payment_sent' ? '-' : '+'} {formatCurrency(tx.amount)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No recent transactions</p>
                        )}
                    </div>
                </div>

                {/* Refresh Button */}
                <div className="mt-6 text-center">
                    <button
                        onClick={fetchAnalytics}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition-all duration-200"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Refresh Data
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
      `}</style>
        </div>
    );
};

export default Analytics;