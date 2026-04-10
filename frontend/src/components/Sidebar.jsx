import { useState } from "react";
import walletIcon from '../assets/icons8-wallet-100.png'
import Settings from "./Settings";
import Analytics from "./Analytics";

export function Sidebar({ isSidebarOpen, setIsSidebarOpen, activePage, setActivePage }) {
  const [collapsed, setCollapsed] = useState(false);

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
            <span className="font-bold text-white text-xs">H</span>
          </div>

          {!collapsed && (
            <h2 className="text-xl font-bold tracking-widest uppercase text-white/90">
              NETRA PE
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

          {/* Mobile Close (FIXED SVG) */}
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

      <nav className="flex flex-col gap-4 overflow-y-auto flex-1">

        <NavItem
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="2" />
              <rect x="14" y="3" width="7" height="7" rx="2" />
              <rect x="14" y="14" width="7" height="7" rx="2" />
              <rect x="3" y="14" width="7" height="7" rx="2" />
            </svg>
          }
          label="Dashboard"
          active={activePage === "dashboard"}
          collapsed={collapsed}
          onClick={() => setActivePage("dashboard")}
        />

        <NavItem
          icon="📈"
          label="Analytics"
          active={activePage === "analytics"}
          collapsed={collapsed}
          onClick={() => setActivePage("analytics")}
        />

        <NavItem
          icon={<div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-500 border border-gray-500">
            <img src={walletIcon} className="w-4 h-4" />
          </div>}
          label="Wallet"
          active={activePage === "wallet"}
          collapsed={collapsed}
          onClick={() => setActivePage("wallet")}
        />

        <NavItem
          icon="⚙️"
          label="Settings"
          active={activePage === "settings"}
          collapsed={collapsed}
          onClick={() => setActivePage("settings")}
        />

      </nav>

      {/* Bottom */}
      <div className="mt-auto w-full pt-6">

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4"></div>

        <div className={`flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition cursor-pointer ${collapsed ? "justify-center" : ""}`}>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center font-bold text-white shrink-0">
            H
          </div>

          {/* Info */}
          {!collapsed && (
            <div className="flex flex-col flex-1">
              <span className="text-white text-sm font-semibold">Harsh</span>
              <span className="text-white/40 text-[10px]">Connected</span>
            </div>
          )}

          {/* Wallet Icon */}
          <div className="text-emerald-400 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              <path d="M16 11h4v4h-4z" />
            </svg>
          </div>

        </div>

      </div>

    </div>
  );
}

/* 🔹 Nav Item */
function NavItem({ icon, label, active, collapsed }) {
  return (
    <div
      className={`px-4 py-3 rounded-xl text-xs font-semibold uppercase cursor-pointer flex items-center gap-3 transition ${active
        ? "bg-white/10 border border-white/10 text-white"
        : "hover:bg-white/5 text-white/60 hover:text-white"
        }`}
    >
      <span className="text-lg">{icon}</span>

      {!collapsed && <span>{label}</span>}
    </div>
  );
}