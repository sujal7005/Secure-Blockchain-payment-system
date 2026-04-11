// Frontend/src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export function Sidebar({ isSidebarOpen, setIsSidebarOpen, activePage, setActivePage, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, token } = useAuth();
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    avatar: '',
    walletAddress: ''
  });
  const [loading, setLoading] = useState(true);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "wallet", label: "Wallet", icon: "💰" },
    { id: "settings", label: "Settings", icon: "⚙️" }
  ];

  // Fetch user data from backend
  useEffect(() => {
    if (user) {
      setUserData({
        fullName: user.fullName || 'User',
        email: user.email || '',
        avatar: user.avatar || '',
        walletAddress: user.walletAddress || ''
      });
      setLoading(false);
    } else if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserData({
            fullName: data.user.fullName || 'User',
            email: data.user.email || '',
            avatar: data.user.avatar || '',
            walletAddress: data.user.walletAddress || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get initials for avatar
  const getInitials = () => {
    if (userData.fullName && userData.fullName !== 'User') {
      return userData.fullName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get short wallet address
  const getShortAddress = () => {
    if (userData.walletAddress && userData.walletAddress.length > 10) {
      return `${userData.walletAddress.slice(0, 6)}...${userData.walletAddress.slice(-4)}`;
    }
    return '';
  };

  return (
    <div
      className={`fixed lg:relative top-0 left-0 h-full lg:h-auto z-50 
      ${collapsed ? "w-20" : "w-[280px] lg:w-72"} 
      flex flex-col bg-[#060608]/95 lg:bg-transparent backdrop-blur-3xl 
      p-4 transition-all duration-300 ease-in-out
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <span className="font-bold text-white text-xs">N</span>
          </div>
          {!collapsed && (
            <h2 className="text-xl font-bold tracking-widest uppercase text-white/90">
              NETRA PAY
            </h2>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Minimize / Maximize */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-white/60 hover:text-white transition"
          >
            {collapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 12h16" />
                <path d="M12 4l8 8-8 8" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 12H4" />
                <path d="M12 20l-8-8 8-8" />
              </svg>
            )}
          </button>

          {/* Mobile Close */}
          <button
            className="lg:hidden p-1 text-white/60 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 overflow-y-auto flex-1">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activePage === item.id}
            collapsed={collapsed}
            onClick={() => {
              setActivePage(item.id);
              setIsSidebarOpen(false);
            }}
          />
        ))}
      </nav>

      {/* User Section */}
      <div className="mt-auto w-full pt-6">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4"></div>

        <div 
          onClick={() => {
            setActivePage("profile");
            setIsSidebarOpen(false);
          }}
          className={`flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition cursor-pointer ${collapsed ? "justify-center" : ""}`}
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center font-bold text-white shrink-0">
            {userData.avatar ? (
              <img 
                src={userData.avatar} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg">{getInitials()}</span>
            )}
          </div>

          {!collapsed && (
            <div className="flex flex-col flex-1">
              <span className="text-white text-sm font-semibold truncate">
                {loading ? 'Loading...' : userData.fullName}
              </span>
              <span className="text-white/40 text-[10px] truncate">
                {getShortAddress() || userData.email || 'View Profile'}
              </span>
            </div>
          )}

          <div className="text-emerald-400 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              <path d="M16 11h4v4h-4z" />
            </svg>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className={`w-full mt-3 flex items-center gap-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl p-3 transition cursor-pointer ${collapsed ? "justify-center" : ""}`}
        >
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span className="text-red-400 text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}

/* NavItem Component */
function NavItem({ icon, label, active, collapsed, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 rounded-xl text-xs font-semibold uppercase cursor-pointer flex items-center gap-3 transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-white"
          : "hover:bg-white/5 text-white/60 hover:text-white"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </div>
  );
}