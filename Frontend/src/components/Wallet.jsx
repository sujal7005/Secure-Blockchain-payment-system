import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Wallet = () => {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState({
    balance: 1250.75,
    currency: 'USD',
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  useEffect(() => {
    // Simulate fetching wallet data
    setTimeout(() => {
      setWalletData({
        balance: 1250.75,
        currency: 'USD',
        transactions: [
          { id: 1, type: 'received', amount: 500, from: '0x742d...', date: '2024-01-15', status: 'completed' },
          { id: 2, type: 'sent', amount: 250, to: '0x3a7b...', date: '2024-01-14', status: 'completed' },
          { id: 3, type: 'received', amount: 1000, from: '0x8c4d...', date: '2024-01-13', status: 'completed' },
          { id: 4, type: 'sent', amount: 75.5, to: '0x2e9f...', date: '2024-01-12', status: 'pending' },
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleSend = () => {
    if (!sendAddress || !sendAmount) {
      alert('Please fill all fields');
      return;
    }
    alert(`Sending ${sendAmount} USD to ${sendAddress}`);
    setSendAmount('');
    setSendAddress('');
    setShowSendModal(false);
  };

  const copyAddress = () => {
    const address = "0x742d35Cc6634C0532925a3b844Bc9e7595f0b2e8";
    navigator.clipboard.writeText(address);
    alert('Address copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Wallet Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          My Wallet
        </h1>
        <p className="text-gray-400 text-sm mt-2">Manage your digital assets</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/10">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Total Balance</p>
          <h2 className="text-5xl font-bold text-white mb-2">
            ${walletData.balance.toLocaleString()}
          </h2>
          <p className="text-green-400 text-sm">{walletData.currency}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setShowSendModal(true)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Send
          </button>
          <button
            onClick={() => setShowReceiveModal(true)}
            className="flex-1 bg-white/10 border border-white/20 py-3 rounded-xl font-semibold hover:bg-white/20 transition"
          >
            Receive
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold text-lg">Recent Transactions</h3>
          <button className="text-gray-400 text-xs hover:text-white transition">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {walletData.transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'received' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <span className="text-lg">{tx.type === 'received' ? '📥' : '📤'}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {tx.type === 'received' ? 'Received from' : 'Sent to'} {tx.from || tx.to}
                  </p>
                  <p className="text-gray-500 text-xs">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${tx.type === 'received' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'received' ? '+' : '-'} ${tx.amount}
                </p>
                <p className="text-xs text-gray-500 capitalize">{tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Send Payment</h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={sendAddress}
                  onChange={(e) => setSendAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <button
                onClick={handleSend}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Send Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Receive Payment</h3>
              <button
                onClick={() => setShowReceiveModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center">
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-gray-400 text-sm mb-2">Your Wallet Address</p>
                <code className="text-purple-400 text-xs break-all">
                  0x742d35Cc6634C0532925a3b844Bc9e7595f0b2e8
                </code>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-xl p-8 mb-4">
                <div className="w-32 h-32 mx-auto bg-white rounded-xl flex items-center justify-center">
                  <span className="text-4xl">📱</span>
                </div>
                <p className="text-gray-400 text-xs mt-4">Scan QR code to receive payment</p>
              </div>
              
              <button
                onClick={copyAddress}
                className="w-full bg-white/10 border border-white/20 py-3 rounded-lg font-semibold hover:bg-white/20 transition"
              >
                Copy Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Network</p>
          <p className="text-white font-semibold">Ethereum Mainnet</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Security</p>
          <p className="text-green-400 font-semibold">✓ Hardware Wallet Ready</p>
        </div>
      </div>
    </div>
  );
};

export default Wallet;