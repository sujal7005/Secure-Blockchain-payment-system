// Frontend/src/components/Wallet.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import MetaMaskConnect from './MetaMaskConnect.jsx';
import { ethers } from 'ethers';

// Fix the import paths - use relative path from Frontend to Blockchain
import contractABI from '../../../Blockchain/artifacts/contracts/MyToken.sol/MyToken.json';
import contractAddresses from '../../../Blockchain/contract-address.json';

const Wallet = () => {
  const { user, token } = useAuth();
  const [walletData, setWalletData] = useState({
    balance: 0,
    currency: 'USD',
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [metaMaskConnected, setMetaMaskConnected] = useState(false);
  const [metaMaskAccount, setMetaMaskAccount] = useState(null);
  const [metaMaskBalance, setMetaMaskBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [sendingToken, setSendingToken] = useState(false);
  const [activeTab, setActiveTab] = useState('fiat'); // 'fiat' or 'crypto'

  const contractAddress = contractAddresses?.MyToken || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const tokenSymbol = contractAddresses?.symbol || 'NPT';
  const tokenDecimals = contractAddresses?.decimals || 18;

  // Fetch wallet data from backend
  const fetchWalletData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payments/wallet', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWalletData({
          balance: data.balance || 0,
          currency: data.currency || 'USD',
          transactions: data.transactions || []
        });
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check MetaMask connection status
  const checkMetaMaskConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setMetaMaskConnected(true);
        setMetaMaskAccount(accounts[0]);
        await getTokenBalance(accounts[0]);
      }
    }
  };

  // Get token balance
  const getTokenBalance = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
      const balance = await contract.balanceOf(address);
      setTokenBalance(parseFloat(ethers.formatEther(balance)));
    } catch (error) {
      console.error('Error getting token balance:', error);
    }
  };

  useEffect(() => {
    fetchWalletData();
    checkMetaMaskConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setMetaMaskAccount(accounts[0]);
          getTokenBalance(accounts[0]);
        } else {
          setMetaMaskConnected(false);
          setMetaMaskAccount(null);
        }
      });
    }
  }, [token]);

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

  const handleSendToken = async () => {
    if (!sendAddress || !sendAmount) {
      alert('Please fill all fields');
      return;
    }

    if (parseFloat(sendAmount) > tokenBalance) {
      alert('Insufficient token balance');
      return;
    }

    setSendingToken(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
      
      const amount = ethers.parseEther(sendAmount);
      const tx = await contract.transfer(sendAddress, amount);
      await tx.wait();
      
      alert(`Successfully sent ${sendAmount} ${tokenSymbol} to ${sendAddress}`);
      setSendAmount('');
      setSendAddress('');
      setShowSendModal(false);
      await getTokenBalance(metaMaskAccount);
    } catch (error) {
      console.error('Error sending tokens:', error);
      alert('Failed to send tokens: ' + error.message);
    } finally {
      setSendingToken(false);
    }
  };

  const copyAddress = () => {
    const address = metaMaskAccount || "0x742d35Cc6634C0532925a3b844Bc9e7595f0b2e8";
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
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Wallet Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          My Wallet
        </h1>
        <p className="text-gray-400 text-sm mt-2">Manage your digital assets</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-lg">
        <button
          onClick={() => setActiveTab('fiat')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'fiat'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Fiat Wallet (USD)
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'crypto'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Crypto Wallet ({tokenSymbol})
        </button>
      </div>

      {activeTab === 'fiat' ? (
        // Fiat Wallet Section
        <>
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/10">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Total Balance</p>
              <h2 className="text-5xl font-bold text-white mb-2">
                ${walletData.balance.toLocaleString()}
              </h2>
              <p className="text-green-400 text-sm">{walletData.currency}</p>
            </div>

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
              {walletData.transactions.length > 0 ? (
                walletData.transactions.map((tx) => (
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
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No transactions yet</p>
              )}
            </div>
          </div>
        </>
      ) : (
        // Crypto Wallet Section - MetaMask Integration
        <div className="space-y-6">
          {/* MetaMask Connection */}
          <MetaMaskConnect />

          {/* Token Balance Display */}
          {metaMaskConnected && (
            <>
              <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">{tokenSymbol} Token Balance</p>
                  <h2 className="text-5xl font-bold text-white mb-2">
                    {tokenBalance.toFixed(4)} {tokenSymbol}
                  </h2>
                  <p className="text-emerald-400 text-sm">~ ${(tokenBalance * 0.5).toFixed(2)} USD</p>
                </div>
              </div>

              {/* Token Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowSendModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Send {tokenSymbol}
                </button>
                <button
                  onClick={() => setShowReceiveModal(true)}
                  className="bg-white/10 border border-white/20 py-3 rounded-xl font-semibold hover:bg-white/20 transition"
                >
                  Receive {tokenSymbol}
                </button>
              </div>

              {/* Token Info */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3">Token Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token Name:</span>
                    <span className="text-white">Netra Payment Token</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token Symbol:</span>
                    <span className="text-white">{tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Decimals:</span>
                    <span className="text-white">{tokenDecimals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract Address:</span>
                    <span className="text-purple-400 text-xs font-mono break-all">{contractAddress}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Send Modal - Updated for both fiat and crypto */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Send {activeTab === 'fiat' ? 'Payment' : tokenSymbol}
              </h3>
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
                  Amount ({activeTab === 'fiat' ? 'USD' : tokenSymbol})
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
                {activeTab === 'crypto' && metaMaskConnected && (
                  <p className="text-gray-500 text-xs mt-1">
                    Available balance: {tokenBalance.toFixed(4)} {tokenSymbol}
                  </p>
                )}
              </div>
              
              <button
                onClick={activeTab === 'fiat' ? handleSend : handleSendToken}
                disabled={activeTab === 'crypto' && sendingToken}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {activeTab === 'crypto' && sendingToken ? 'Sending...' : `Send ${activeTab === 'fiat' ? 'Payment' : tokenSymbol}`}
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
              <h3 className="text-xl font-semibold text-white">
                Receive {activeTab === 'fiat' ? 'Payment' : tokenSymbol}
              </h3>
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
                  {activeTab === 'crypto' && metaMaskAccount 
                    ? metaMaskAccount 
                    : "0x742d35Cc6634C0532925a3b844Bc9e7595f0b2e8"}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Network</p>
          <p className="text-white font-semibold">
            {activeTab === 'crypto' && metaMaskConnected ? 'Ethereum (Localhost)' : 'Ethereum Mainnet'}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Security</p>
          <p className="text-green-400 font-semibold">
            {activeTab === 'crypto' && metaMaskConnected ? '✓ MetaMask Connected' : '✓ Hardware Wallet Ready'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Wallet;