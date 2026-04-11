// Frontend/src/App.jsx
import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import CreditCard from './components/CreditCard';
import DebitCard from './components/DebitCard';
import { BalanceCard } from './components/BalanceCard';
import { RecentActivity } from './components/activity';
import { Sidebar } from './components/Sidebar';
import { GraphHome } from './components/graph_home';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Wallet from './components/Wallet';
import Profile from './components/Profile';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

const API_URL = 'http://localhost:5000/api';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user && !token) {
      navigate('/login');
    }
  }, [user, loading, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  return (user || token) ? children : null;
};

// Dashboard Component
function Dashboard() {
  const { user, logout, token } = useAuth();
  const [activeCard, setActiveCard] = useState(0);
  const [spendView, setSpendView] = useState('WEEK');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalReceived: 0,
    totalSent: 0,
    totalTransactions: 0
  });

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      // Fetch wallet balance
      const balanceRes = await fetch(`${API_URL}/users/wallet-info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setUserBalance(balanceData.balance || 0);
        setAccountBalance(balanceData.balance || 0);
      }

      // Fetch recent transactions
      const transactionsRes = await fetch(`${API_URL}/users/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setRecentTransactions(transactionsData.transactions || []);
        
        // Calculate stats from transactions
        const stats = (transactionsData.transactions || []).reduce((acc, tx) => {
          if (tx.type === 'received' || tx.Type === 'payment_received') {
            acc.totalReceived += (tx.amount || tx.Amount || 0);
          } else {
            acc.totalSent += (tx.amount || tx.Amount || 0);
          }
          acc.totalTransactions++;
          return acc;
        }, { totalReceived: 0, totalSent: 0, totalTransactions: 0 });
        
        setDashboardStats(stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format transactions for RecentActivity component
  const formattedTransactions = recentTransactions.map(tx => ({
    id: tx._id || tx.id,
    title: tx.title || tx.description || (tx.type === 'received' || tx.Type === 'payment_received' ? 'Payment Received' : 'Payment Sent'),
    amount: `${(tx.type === 'received' || tx.Type === 'payment_received') ? '+' : '-'}₹${((tx.amount || tx.Amount || 0)).toLocaleString()}`,
    tag: tx.tag || tx.category || ((tx.type === 'received' || tx.Type === 'payment_received') ? 'Income' : 'Expense'),
    color: (tx.type === 'received' || tx.Type === 'payment_received') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400',
    date: tx.date || tx.createdAt,
    status: tx.status || 'completed'
  }));

  // Credit Card User Data - Dynamically using fetched data
  const creditCardData = {
    name: user?.fullName?.toUpperCase() || "HARSH SHARMA",
    balance: userBalance,
    cardNumber: "4231 8291 0021 7731",
    validThru: "08/29",
    cvv: "192",
    cardType: "CREDIT",
    cardNetwork: "Visa"
  };

  // Debit Card User Data
  const debitCardData = {
    name: user?.fullName?.toUpperCase() || "HARSH SHARMA",
    balance: userBalance * 0.3,
    cardNumber: "5234 5678 9012 3456",
    validThru: "12/27",
    cvv: "456",
    cardType: "DEBIT",
    cardNetwork: "Mastercard"
  };

  // Navigation functions
  const nextCard = () => {
    setIsFlipped(false);
    setActiveCard((prev) => (prev + 1) % 3);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setActiveCard((prev) => (prev - 1 + 3) % 3);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  // Function to render the correct page content
  const renderPageContent = () => {
    switch(activePage) {
      case "dashboard":
        return (
          <div className="w-full flex flex-col items-center">
            {/* Cards Container */}
            <div className="w-full max-w-[900px] mx-auto flex items-center justify-center gap-4">
              <button
                onClick={prevCard}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="relative perspective-1000 w-full max-w-[700px]">
                <div className={`relative transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                  <div className="backface-hidden">
                    {activeCard === 0 ? (
                      <BalanceCard
                        cardName={creditCardData.name}
                        balance={creditCardData.balance}
                        cardType={creditCardData.cardType}
                      />
                    ) : activeCard === 1 ? (
                      <CreditCard
                        cardNumber={creditCardData.cardNumber}
                        cardName={creditCardData.name}
                        validThru={creditCardData.validThru}
                        cvv={creditCardData.cvv}
                        cardType={creditCardData.cardType}
                        cardNetwork={creditCardData.cardNetwork}
                      />
                    ) : (
                      <DebitCard
                        cardNumber={debitCardData.cardNumber}
                        cardName={debitCardData.name}
                        validThru={debitCardData.validThru}
                        cvv={debitCardData.cvv}
                        cardType={debitCardData.cardType}
                        cardNetwork={debitCardData.cardNetwork}
                      />
                    )}
                  </div>
                  
                  <div className="backface-hidden rotate-y-180 absolute top-0 left-0 w-full">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/20 shadow-2xl min-h-[400px]">
                      <div className="text-center h-full flex flex-col justify-between">
                        <div>
                          <div className="mb-6">
                            <svg className="w-20 h-20 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <h3 className="text-white font-semibold text-xl mb-4">Card Security</h3>
                          <div className="bg-black/50 rounded-lg p-4 mb-4">
                            <p className="text-gray-400 text-xs mb-2">CVV/CVC</p>
                            <p className="text-white font-mono text-2xl tracking-wider">
                              {activeCard === 1 ? creditCardData.cvv : debitCardData.cvv}
                            </p>
                          </div>
                          <div className="bg-black/50 rounded-lg p-4">
                            <p className="text-gray-400 text-xs mb-2">Valid Thru</p>
                            <p className="text-white font-mono text-xl">
                              {activeCard === 1 ? creditCardData.validThru : debitCardData.validThru}
                            </p>
                          </div>
                        </div>
                        <div className="mt-6">
                          <p className="text-xs text-gray-500">This card is issued by NETRA PE.</p>
                          <div className="mt-3 flex justify-center gap-2">
                            <div className="w-8 h-5 bg-red-600 rounded"></div>
                            <div className="w-8 h-5 bg-blue-600 rounded"></div>
                            <div className="w-8 h-5 bg-orange-500 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={nextCard}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="mt-4">
              <button
                onClick={flipCard}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-2 rounded-full transition-all hover:scale-105 shadow-lg text-sm font-medium"
              >
                {isFlipped ? 'Show Front' : 'Show Back'}
              </button>
            </div>

            <div className="flex gap-6 mt-4 text-[10px] text-white/40">
              <button onClick={() => { setActiveCard(0); setIsFlipped(false); }} className={`transition ${activeCard === 0 ? "text-emerald-400" : "hover:text-white/60"}`}>Balance Card</button>
              <button onClick={() => { setActiveCard(1); setIsFlipped(false); }} className={`transition ${activeCard === 1 ? "text-purple-400" : "hover:text-white/60"}`}>Credit Card</button>
              <button onClick={() => { setActiveCard(2); setIsFlipped(false); }} className={`transition ${activeCard === 2 ? "text-blue-400" : "hover:text-white/60"}`}>Debit Card</button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-[500px] mt-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-white/10 transition cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest text-center">Scan QR</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-white/10 transition cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest text-center">Pay Anyone</span>
              </div>

              <div onClick={() => setShowBalanceModal(true)} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-white/10 transition cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18v12H3z" />
                    <path d="M8 10h8" />
                    <path d="M8 14h4" />
                    <circle cx="18" cy="12" r="2" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest text-center">Check Balance</span>
              </div>
            </div>

            <GraphHome spendView={spendView} setSpendView={setSpendView} />
          </div>
        );
      case "analytics":
        return <Analytics />;
      case "wallet":
        return <Wallet />;
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex lg:flex-row flex-col p-4 gap-6">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col items-center mt-4">
        {renderPageContent()}
      </div>

      {activePage === "dashboard" && (
        <div className="w-full lg:w-80">
          <RecentActivity transactions={formattedTransactions} />
        </div>
      )}

      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Account Balance</h3>
              <button onClick={() => setShowBalanceModal(false)} className="text-gray-400 hover:text-white transition">✕</button>
            </div>
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm mb-2">Total Balance</p>
              <p className="text-4xl font-bold text-white">₹{accountBalance.toLocaleString()}</p>
              <p className="text-green-400 text-sm mt-2">✓ Available for withdrawal</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 py-2 rounded-lg text-emerald-400 text-sm font-semibold transition">Withdraw</button>
              <button className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 py-2 rounded-lg text-blue-400 text-sm font-semibold transition">Deposit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main App Component with Routes
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}