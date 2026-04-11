// Frontend/src/components/MetaMaskConnect.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Fix the import paths
import contractABI from '../../../Blockchain/artifacts/contracts/MyToken.sol/MyToken.json';
import contractAddresses from '../../../Blockchain/contract-address.json';

const MetaMaskConnect = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [network, setNetwork] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  const contractAddress = contractAddresses.MyToken;
  const tokenSymbol = contractAddresses.symbol || 'NPT';
  const tokenDecimals = contractAddresses.decimals || 18;

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
      
      // Get ETH balance
      const provider = new ethers.BrowserProvider(window.ethereum);
      const ethBalance = await provider.getBalance(accounts[0]);
      setBalance(ethers.formatEther(ethBalance));
      
      // Get token balance
      await getTokenBalance(accounts[0]);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  // Get token balance
  const getTokenBalance = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
      const balance = await contract.balanceOf(address);
      setTokenBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error getting token balance:', error);
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
            image: 'https://i.imgur.com/logo.png', // Optional: Add your token logo URL
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

  // Transfer tokens
  const transferTokens = async () => {
    if (!transferAmount || !transferTo) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
      
      const amount = ethers.parseEther(transferAmount);
      const tx = await contract.transfer(transferTo, amount);
      
      setTransactionHash(tx.hash);
      const receipt = await tx.wait();
      
      alert(`Transfer successful! Transaction hash: ${tx.hash}`);
      setTransferAmount('');
      setTransferTo('');
      setShowTransfer(false);
      
      // Refresh balances
      await getTokenBalance(account);
      const ethBalance = await provider.getBalance(account);
      setBalance(ethers.formatEther(ethBalance));
      
    } catch (error) {
      console.error('Error transferring tokens:', error);
      alert('Transfer failed: ' + error.message);
    } finally {
      setLoading(false);
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
      // This error code indicates that the chain has not been added to MetaMask
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

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          getTokenBalance(accounts[0]);
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
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Connect MetaMask</h3>
        <p className="text-gray-400 text-sm mb-4">
          Connect your MetaMask wallet to interact with NETRA PE Token (NPT)
        </p>
        <button
          onClick={connectWallet}
          disabled={loading}
          className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white font-semibold hover:opacity-90 transition"
        >
          {loading ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Wallet Info */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
          <div className="flex gap-2">
            <button
              onClick={switchToLocalhost}
              className="text-xs px-3 py-1 bg-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/30 transition"
            >
              Switch to Localhost
            </button>
            <button
              onClick={addTokenToMetaMask}
              className="text-xs px-3 py-1 bg-green-500/20 rounded-lg text-green-400 hover:bg-green-500/30 transition"
            >
              Add Token to MetaMask
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-white/10">
            <span className="text-gray-400">Account</span>
            <span className="text-white text-sm font-mono">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/10">
            <span className="text-gray-400">Network</span>
            <span className="text-white">{network === 1337 ? 'Hardhat Localhost' : `Chain ID: ${network}`}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/10">
            <span className="text-gray-400">ETH Balance</span>
            <span className="text-white">{parseFloat(balance).toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">{tokenSymbol} Balance</span>
            <span className="text-emerald-400 font-bold">{parseFloat(tokenBalance).toFixed(4)} {tokenSymbol}</span>
          </div>
        </div>
      </div>

      {/* Transfer Section */}
      {!showTransfer ? (
        <button
          onClick={() => setShowTransfer(true)}
          className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg text-white font-semibold hover:opacity-90 transition"
        >
          Send Tokens
        </button>
      ) : (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Send {tokenSymbol} Tokens</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Recipient Address</label>
              <input
                type="text"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Amount ({tokenSymbol})</label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.0"
                step="0.1"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={transferTokens}
                disabled={loading}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-semibold transition"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
              <button
                onClick={() => setShowTransfer(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Hash */}
      {transactionHash && (
        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
          <p className="text-blue-400 text-xs">Transaction Hash:</p>
          <p className="text-gray-300 text-xs font-mono break-all">{transactionHash}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
        <p className="text-yellow-400 text-sm font-semibold mb-2">📝 Instructions to add token to MetaMask:</p>
        <ol className="text-gray-300 text-xs space-y-1 list-decimal list-inside">
          <li>Click "Add Token to MetaMask" button above</li>
          <li>MetaMask will open a confirmation window</li>
          <li>Click "Add Token" to add NPT to your wallet</li>
          <li>Token will appear in your MetaMask assets list</li>
        </ol>
      </div>
    </div>
  );
};

export default MetaMaskConnect;