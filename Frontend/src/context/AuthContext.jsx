// Frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  // Load token and user from localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setLoading(false);
        } catch (e) {
          console.error('Error parsing stored user:', e);
          // Token exists but user data is corrupted, try to fetch from API
          fetchUserProfile(storedToken);
        }
      } else {
        // Token exists but no user data, fetch from API
        fetchUserProfile(storedToken);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          // Token is invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
        }
      } else {
        // Token is invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('Register response:', data);
      
      if (data.success) {
        // Store token and user in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setToken(data.token);
          setUser(data.user);
        }
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success) {
        // Store token and user in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithPrivateKey = async (privateKey) => {
    setLoading(true);
    try {
      // Create wallet from private key
      const { ethers } = await import('ethers');
      const wallet = new ethers.Wallet(privateKey);
      const walletAddress = wallet.address;
      
      const response = await fetch(`${API_URL}/users/login-with-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('walletAddress', walletAddress);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message || 'No account found with this private key' };
    } catch (error) {
      console.error('Private key login error:', error);
      return { success: false, message: 'Invalid private key' };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {  
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      if (data.success) {
        // Update stored user data
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('walletAddress');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    loginWithPrivateKey,
    logout,
    updateUserProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};