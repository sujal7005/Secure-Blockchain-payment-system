// Frontend/src/components/TwoFactorModal.jsx
import React, { useState } from 'react';

const TwoFactorModal = ({ email, tempToken, onSuccess, onCancel }) => {
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!code && !backupCode) {
      setError('Please enter verification code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token: code,
          backupCode: backupCode
        })
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        onSuccess(data.user);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Two-Factor Authentication</h3>
        <p className="text-gray-300 text-sm mb-4">
          Enter the 6-digit code from your authenticator app
        </p>
        
        {!useBackupCode ? (
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            maxLength="6"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl font-mono mb-4"
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={backupCode}
            onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-mono mb-4"
          />
        )}
        
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg text-white font-semibold mb-3"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        
        <button
          onClick={() => setUseBackupCode(!useBackupCode)}
          className="w-full text-sm text-purple-400 hover:text-purple-300"
        >
          {useBackupCode ? 'Use authenticator app' : 'Use backup code'}
        </button>
        
        <button
          onClick={onCancel}
          className="w-full mt-3 text-sm text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TwoFactorModal;