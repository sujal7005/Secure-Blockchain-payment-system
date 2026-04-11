// Frontend/src/components/MetaMaskConnect.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Fix the import paths
import contractABI from '../../../Blockchain/artifacts/contracts/MyToken.sol/MyToken.json';
import contractAddresses from '../../../Blockchain/contract-address.json';

const Wallet = () => {
  const [account, setAccount] = useState(null);
  const [ethBalance, setEthBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [network, setNetwork] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [sending, setSending] = useState(false);

  const contractAddress = contractAddresses?.MyToken || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const tokenSymbol = contractAddresses?.symbol || 'TNA';
  const tokenDecimals = contractAddresses?.decimals || 18;

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      alert('Please install MetaMask extension!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setLoading(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);
      
      // Get network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetwork(parseInt(chainId, 16));
      
      // Get balances
      await getBalances(accounts[0]);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  // Get both ETH and Token balances
  const getBalances = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get ETH balance
      const ethBalanceWei = await provider.getBalance(address);
      setEthBalance(parseFloat(ethers.formatEther(ethBalanceWei)));
      
      // Get Token balance
      const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
      const tokenBalanceWei = await contract.balanceOf(address);
      setTokenBalance(parseFloat(ethers.formatEther(tokenBalanceWei)));
      
    } catch (error) {
      console.error('Error getting balances:', error);
    }
  };

  // Send tokens
  const sendTokens = async () => {
    if (!sendAddress || !sendAmount) {
      alert('Please fill all fields');
      return;
    }

    if (parseFloat(sendAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(sendAmount) > tokenBalance) {
      alert(`Insufficient balance! Your balance is ${tokenBalance.toFixed(4)} ${tokenSymbol}`);
      return;
    }

    setSending(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
      
      const amount = ethers.parseEther(sendAmount);
      const tx = await contract.transfer(sendAddress, amount);
      
      setTransactionHash(tx.hash);
      await tx.wait();
      
      alert(`Successfully sent ${sendAmount} ${tokenSymbol} to ${sendAddress}`);
      setSendAmount('');
      setSendAddress('');
      setShowSendModal(false);
      
      // Refresh balances
      await getBalances(account);
      
    } catch (error) {
      console.error('Error sending tokens:', error);
      alert('Transfer failed: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  // Add token to MetaMask
  const addTokenToMetaMask = async () => {
    if (!isMetaMaskInstalled()) {
      alert('Please install MetaMask first!');
      return;
    }

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: contractAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
          },
        },
      });
      
      if (wasAdded) {
        alert(`${tokenSymbol} token has been added to MetaMask!`);
      } else {
        alert('Token was not added to MetaMask');
      }
    } catch (error) {
      console.error('Error adding token:', error);
      alert('Failed to add token to MetaMask');
    }
  };

  // Switch to localhost network
  const switchToLocalhost = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }], // 1337 in hex
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x539',
                chainName: 'Hardhat Localhost',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['http://localhost:8545'],
                blockExplorerUrls: [],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      }
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    alert('Address copied to clipboard!');
  };

  // Listen for account/network changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          getBalances(accounts[0]);
        } else {
          setAccount(null);
          setIsConnected(false);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  if (!isConnected) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Crypto Wallet
          </h1>
          <p className="text-gray-400 text-sm mt-2">Connect your MetaMask wallet</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Connect MetaMask</h3>
          <p className="text-gray-400 text-sm mb-6">
            Connect your MetaMask wallet to manage your {tokenSymbol} tokens
          </p>
          <button
            onClick={connectWallet}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white font-semibold hover:opacity-90 transition"
          >
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Crypto Wallet
        </h1>
        <p className="text-gray-400 text-sm mt-2">Manage your {tokenSymbol} tokens</p>
      </div>

      {/* Network Alert if not on localhost */}
      {network !== 1337 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 text-sm text-center">
            ⚠️ Please switch to Hardhat Localhost network to interact with {tokenSymbol} tokens
          </p>
          <button
            onClick={switchToLocalhost}
            className="mt-2 w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 text-sm transition"
          >
            Switch to Localhost
          </button>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <p className="text-gray-400 text-sm mb-2">ETH Balance</p>
          <h2 className="text-4xl font-bold text-white mb-2">
            {ethBalance.toFixed(4)} ETH
          </h2>
        </div>

        <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <p className="text-gray-400 text-sm mb-2">{tokenSymbol} Balance</p>
          <h2 className="text-4xl font-bold text-white mb-2">
            {tokenBalance.toFixed(4)} {tokenSymbol}
          </h2>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setShowSendModal(true)}
          className="py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Send Tokens
        </button>
        <button
          onClick={() => setShowReceiveModal(true)}
          className="py-3 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition"
        >
          Receive
        </button>
      </div>

      {/* Add Token Button */}
      <button
        onClick={addTokenToMetaMask}
        className="w-full py-3 mb-6 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 font-semibold transition"
      >
        + Add {tokenSymbol} Token to MetaMask
      </button>

      {/* Account Info */}
      <div className="bg-white/5 rounded-xl p-5 border border-white/10">
        <h3 className="text-white font-semibold mb-3">Account Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Address:</span>
            <span className="text-purple-400 font-mono text-xs break-all">{account}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Network:</span>
            <span className="text-white">{network === 1337 ? 'Hardhat Localhost' : `Chain ID: ${network}`}</span>
          </div>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Send {tokenSymbol}</h3>
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
                  Amount ({tokenSymbol})
                </label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.1"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Available: {tokenBalance.toFixed(4)} {tokenSymbol}
                </p>
              </div>
              
              {transactionHash && (
                <div className="bg-blue-500/10 rounded-lg p-2">
                  <p className="text-blue-400 text-xs">Tx Hash: {transactionHash.slice(0, 20)}...</p>
                </div>
              )}
              
              <button
                onClick={sendTokens}
                disabled={sending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Tokens'}
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
              <h3 className="text-xl font-semibold text-white">Receive {tokenSymbol}</h3>
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
                  {account}
                </code>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-xl p-8 mb-4">
                <div className="w-32 h-32 mx-auto bg-white rounded-xl flex items-center justify-center">
                  <span className="text-4xl">📱</span>
                </div>
                <p className="text-gray-400 text-xs mt-4">Share this address to receive {tokenSymbol} tokens</p>
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
    </div>
  );
};

export default Wallet;