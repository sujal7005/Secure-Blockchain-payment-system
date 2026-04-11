// Frontend/src/components/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, token, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });
  const [walletInfo, setWalletInfo] = useState({
    balance: 0,
    address: '',
    network: 'Ethereum Mainnet'
  });
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    transactionLimit: 10000,
    notificationEmail: true,
    notificationPush: true
  });

  // Fetch all user data from backend
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || ''
      });
      fetchWalletInfo();
      fetchTransactionHistory();
      fetchSecuritySettings();
    }
  }, [user]);

  const fetchWalletInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/wallet-info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWalletInfo({
          balance: data.balance || 0,
          address: data.walletAddress || user?.walletAddress || '',
          network: data.network || 'Ethereum Mainnet'
        });
      }
    } catch (error) {
      console.error('Error fetching wallet info:', error);
    }
  };

  const fetchTransactionHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactionHistory(data.transactions || []);
      } else {
        // Use mock data if API fails
        setTransactionHistory([
          { id: 1, type: 'sent', amount: 0.5, currency: 'ETH', to: '0x742d...', date: '2024-01-15', status: 'completed' },
          { id: 2, type: 'received', amount: 100, currency: 'USDC', from: '0x8ba1...', date: '2024-01-14', status: 'completed' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecuritySettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/security-settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSecuritySettings(data.settings || securitySettings);
      }
    } catch (error) {
      console.error('Error fetching security settings:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const result = await updateUserProfile(profileData);
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  const handleCancel = () => {
    setProfileData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      
      try {
        const response = await fetch('http://localhost:5000/api/users/upload-avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfileData(prev => ({ ...prev, avatar: data.avatarUrl }));
          toast.success('Avatar updated successfully!');
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast.error('Failed to upload avatar');
      }
    }
  };

  const handleExportPrivateKey = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/export-private-key', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPrivateKey(data.privateKey);
        setShowPrivateKeyModal(true);
      } else {
        toast.error('Failed to export private key');
      }
    } catch (error) {
      toast.error('Error exporting private key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const updateSecuritySetting = async (setting, value) => {
    const newSettings = { ...securitySettings, [setting]: value };
    setSecuritySettings(newSettings);
    
    try {
      const response = await fetch('http://localhost:5000/api/users/security-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });
      
      if (response.ok) {
        toast.success('Security settings updated!');
      }
    } catch (error) {
      console.error('Error updating security settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-emerald-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && !transactionHistory.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl p-6 border border-white/10 mb-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 p-0.5">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-4xl font-bold text-white">
                  {profileData.fullName ? profileData.fullName[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-2 cursor-pointer hover:bg-emerald-600 transition">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center lg:text-left">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full lg:w-96 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                />
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full lg:w-96 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-2">{profileData.fullName || 'User Name'}</h2>
                <p className="text-gray-400 mb-1">{profileData.email || 'user@example.com'}</p>
                {walletInfo.address && (
                  <div className="flex items-center justify-center lg:justify-start gap-2 mt-2">
                    <p className="text-sm text-emerald-400 font-mono">
                      {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                    </p>
                    <button
                      onClick={() => copyToClipboard(walletInfo.address)}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-semibold transition"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Wallet & Security Section */}
        <div className="space-y-6">
          {/* Wallet Info Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Wallet Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400">Wallet Balance</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {walletInfo.balance} ETH
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400">Network</span>
                <span className="text-white">{walletInfo.network}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Wallet Type</span>
                <span className="text-white">Non-Custodial</span>
              </div>
            </div>
            <button
              onClick={handleExportPrivateKey}
              className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm font-semibold transition"
            >
              Export Private Key
            </button>
          </div>

          {/* Security Settings */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-400">Add an extra layer of security</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => updateSecuritySetting('twoFactorAuth', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div>
                <p className="text-white font-medium mb-2">Daily Transaction Limit (USD)</p>
                <input
                  type="number"
                  value={securitySettings.transactionLimit}
                  onChange={(e) => updateSecuritySetting('transactionLimit', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                />
                <p className="text-xs text-gray-400 mt-1">Maximum amount per transaction</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-400">Receive alerts via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={securitySettings.notificationEmail}
                    onChange={(e) => updateSecuritySetting('notificationEmail', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-400">Receive push notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={securitySettings.notificationPush}
                    onChange={(e) => updateSecuritySetting('notificationPush', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                />
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  rows="3"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-400 resize-none"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-400">Phone: <span className="text-white">{profileData.phone || 'Not provided'}</span></p>
                <p className="text-gray-400">Address: <span className="text-white">{profileData.address || 'Not provided'}</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Transaction History</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {transactionHistory.length > 0 ? (
              transactionHistory.map((tx) => (
                <div key={tx.id || tx.TransactionId} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === 'sent' || tx.Type === 'payment_sent' ? 'bg-red-500/20' : 'bg-emerald-500/20'
                      }`}>
                        <svg className={`w-4 h-4 ${tx.type === 'sent' || tx.Type === 'payment_sent' ? 'text-red-400' : 'text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {tx.type === 'sent' || tx.Type === 'payment_sent' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v8m0 0l3-3m-3 3l-3-3M5 5h14" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {tx.type === 'sent' || tx.Type === 'payment_sent' ? 'Sent' : 'Received'} {tx.amount || tx.Amount} {tx.currency || 'ETH'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {tx.type === 'sent' || tx.Type === 'payment_sent' ? 'To: ' : 'From: '}{tx.to || tx.from || tx.ToAddress || tx.FromAddress}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${tx.type === 'sent' || tx.Type === 'payment_sent' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {tx.type === 'sent' || tx.Type === 'payment_sent' ? '-' : '+'}{tx.amount || tx.Amount} {tx.currency || 'ETH'}
                      </p>
                      <p className={`text-xs ${getStatusColor(tx.status || tx.Status)}`}>
                        {(tx.status || tx.Status || 'completed').charAt(0).toUpperCase() + (tx.status || tx.Status || 'completed').slice(1)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(tx.date || tx.CreatedAt)}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No transactions found</p>
                <p className="text-gray-500 text-sm mt-2">Your transactions will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Private Key Export Modal */}
      {showPrivateKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Export Private Key</h3>
              <button
                onClick={() => setShowPrivateKeyModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center py-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                <p className="text-red-400 text-sm font-semibold mb-2">⚠️ Warning</p>
                <p className="text-gray-300 text-xs">
                  Never share your private key with anyone. Anyone with access to this key can control your funds.
                </p>
              </div>
              
              <div className="bg-black/50 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-400 mb-2">Your Private Key:</p>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={privateKey}
                    readOnly
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(privateKey)}
                  className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 py-2 rounded-lg text-emerald-400 text-sm font-semibold transition"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowPrivateKeyModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-white text-sm font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Profile;