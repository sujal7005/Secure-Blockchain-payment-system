import { useState, useRef } from 'react';

export function BalanceCard({ cardName = 'JOHN DOE', balance = 12450.50, cardType = 'CREDIT' }) {
   const safeBalance = Number(balance) || 0;
   const spent = safeBalance * 0.15;
   const income = safeBalance + spent;

   return (
      <div className="relative w-full max-w-[420px] bg-white/5 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 overflow-hidden group hover:-translate-y-1 transition-transform duration-500">

         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
         <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 group-hover:bg-purple-500/20 transition-all duration-700"></div>

         <div className="flex justify-between items-center relative z-10 mb-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-indigo-500 p-[2px]">
                  <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
                     <span className="text-white text-sm font-bold">{(cardName || 'U').charAt(0).toUpperCase()}</span>
                  </div>
               </div>
               <div className="flex flex-col">
                  <span className="text-white/50 text-[10px] font-semibold tracking-widest uppercase">Account Holder</span>
                  <span className="text-white/90 text-sm font-semibold tracking-wide truncate max-w-[140px] uppercase">{cardName || 'USER'}</span>
               </div>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-inner">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Active
            </div>
         </div>

         <div className="flex flex-col relative z-10 mb-8">
            <span className="text-white/50 text-[10px] tracking-widest uppercase font-semibold mb-1">
               {cardType === 'CREDIT' ? 'Trinetra Coin' : 'Total Remaining Funds'}
            </span>
            <div className="flex items-start gap-1">
               <span className="text-white/60 text-2xl font-light mt-1">₹</span>
               <span className="text-white text-4xl sm:text-5xl font-light tracking-tight drop-shadow-md">
                  {safeBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </span>
            </div>
         </div>

         <div className="flex gap-4 relative z-10 w-full mb-6 py-4 border-y border-white/5">
            <div className="flex flex-col w-1/2">
               <span className="text-white/40 text-[9px] tracking-widest uppercase font-semibold mb-1 flex items-center gap-1">
                  <span className="text-emerald-400 font-bold">↑</span> INFLOW
               </span>
               <span className="text-white/90 font-mono text-sm tracking-wide shadow-sm">
                  +₹{income.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </span>
            </div>
            <div className="w-px h-auto bg-white/5"></div>
            <div className="flex flex-col w-1/2">
               <span className="text-white/40 text-[9px] tracking-widest uppercase font-semibold mb-1 flex items-center gap-1">
                  <span className="text-purple-400 font-bold">↓</span> OUTFLOW
               </span>
               <span className="text-white/90 font-mono text-sm tracking-wide shadow-sm">
                  -₹{spent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </span>
            </div>
         </div>

         <div className="absolute bottom-0 left-0 w-full h-24 opacity-20 pointer-events-none flex items-end translate-y-2">
            <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
               <path d="M0,100 L0,50 Q100,0 200,50 T400,30 L400,100 Z" fill="url(#gradEmerald)" />
               <defs>
                  <linearGradient id="gradEmerald" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                     <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </linearGradient>
               </defs>
            </svg>
         </div>
      </div>
   );
}
