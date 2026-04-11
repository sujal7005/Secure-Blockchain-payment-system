// Frontend/src/components/TwoFactorSetup.jsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

const TwoFactorSetup = () => {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/2fa/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setIsEnabled(data.enabled);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const setup2FA = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setSecret(data.secret);
        setQrCode(data.qrCode);
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!verificationCode) {
      setError('Please enter verification code');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/2fa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationCode, secret })
      });
      const data = await response.json();
      if (data.success) {
        setBackupCodes(data.backupCodes);
        setStep(3);
        setIsEnabled(true);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to verify 2FA');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    const code = prompt('Enter your 2FA code to disable:');
    if (!code) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: code })
      });
      const data = await response.json();
      if (data.success) {
        setIsEnabled(false);
        alert('2FA disabled successfully');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  if (isEnabled) {
    return (
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
          <p className="text-green-400 text-sm">✅ 2FA is currently ENABLED</p>
          <p className="text-gray-400 text-xs mt-2">Your account is protected with two-factor authentication</p>
        </div>
        <button
          onClick={disable2FA}
          disabled={loading}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition"
        >
          {loading ? 'Disabling...' : 'Disable 2FA'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
      
      {step === 1 && (
        <div>
          <p className="text-gray-300 text-sm mb-4">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
          <button
            onClick={setup2FA}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition"
          >
            {loading ? 'Setting up...' : 'Enable 2FA'}
          </button>
        </div>
      )}
      
      {step === 2 && (
        <div>
          <p className="text-gray-300 text-sm mb-4">
            1. Scan this QR code with Google Authenticator or any authenticator app
          </p>
          <div className="flex justify-center mb-4">
            {qrCode && <img src={qrCode} alt="QR Code" className="w-48 h-48" />}
          </div>
          <p className="text-gray-300 text-sm mb-2">
            2. Enter the 6-digit code from your authenticator app
          </p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="000000"
            maxLength="6"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white mb-4"
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            onClick={verifyAndEnable}
            disabled={loading}
            className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition"
          >
            {loading ? 'Verifying...' : 'Verify and Enable'}
          </button>
        </div>
      )}
      
      {step === 3 && (
        <div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <p className="text-yellow-400 text-sm font-semibold mb-2">⚠️ Save Your Backup Codes</p>
            <p className="text-gray-300 text-xs mb-3">
              These codes can be used to access your account if you lose your authenticator device.
              Save them in a secure place.
            </p>
            <div className="bg-black/50 rounded-lg p-3">
              {backupCodes.map((code, index) => (
                <code key={index} className="block text-green-400 text-sm font-mono mb-1">
                  {code}
                </code>
              ))}
            </div>
          </div>
          <button
            onClick={() => setStep(1)}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition"
          >
            I've Saved My Backup Codes
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;