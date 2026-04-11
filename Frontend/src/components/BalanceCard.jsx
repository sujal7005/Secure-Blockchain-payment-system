import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export function BalanceCard({ cardName = 'JOHN DOE', balance = 12450.50, cardType = 'CREDIT' }) {
   const cardRef = useRef(null);
   const [rotate, setRotate] = useState({ x: 0, y: 0 });
   const [isFlipped, setIsFlipped] = useState(false);
   const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

   const safeBalance = Number(balance) || 0;
   const spent = safeBalance * 0.15;
   const income = safeBalance + spent;

   const qrData = JSON.stringify({
      type: 'balance_card',
      cardHolder: cardName,
      balance: safeBalance,
      currency: 'INR',
      cardType: cardType,
      timestamp: new Date().toISOString(),
      cardNumber: `**** **** **** ${Math.floor(Math.random() * 10000)}`,
      message: `Balance Card for ${cardName} with ₹${safeBalance.toLocaleString()}`
   });

   const handleMouseMove = (e) => {
      if (!cardRef.current || isFlipped) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      setRotate({
         x: ((y - centerY) / centerY) * -10,
         y: ((x - centerX) / centerX) * 10
      });

      setMousePos({
         x: (x / rect.width) * 100,
         y: (y / rect.height) * 100
      });
   };

   const handleMouseLeave = () => {
      if (!isFlipped) setRotate({ x: 0, y: 0 });
      setMousePos({ x: 50, y: -20 });
   };

   const handleFlip = () => {
      setIsFlipped(!isFlipped);
      setRotate({ x: 0, y: 0 });
   };

   return (
      <div className="[perspective:1200px] w-full max-w-[680px] mx-auto">
         <style>{`
            @keyframes spinBorder {
               from { transform: translate(-50%, -50%) rotate(0deg); }
               to { transform: translate(-50%, -50%) rotate(360deg); }
            }
         `}</style>

         <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleFlip}
            className="relative w-full aspect-[1.586/1] cursor-pointer [transform-style:preserve-3d] transition-all duration-500"
            style={{
               transform: isFlipped
                  ? `rotateY(180deg)`
                  : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
            }}
         >
            <BalanceCardFront
               cardName={cardName}
               balance={safeBalance}
               cardType={cardType}
               spent={spent}
               income={income}
               mousePos={mousePos}
            />
            <BalanceCardBack cardName={cardName} balance={safeBalance} qrData={qrData} />
         </div>
      </div>
   );
}

/* ================= FRONT COMPONENT ================= */
function BalanceCardFront({ cardName, balance, cardType, spent, income, mousePos }) {
   return (
      <div className="absolute inset-0 rounded-2xl [backface-visibility:hidden]">
         <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
            
            {/* Animated Glow Effect */}
            <div
               className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
               style={{
                  background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(16,185,129,0.3), transparent 60%)`
               }}
            />

            {/* Decorative Background Circles */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

            {/* Content */}
            <div className="relative z-10 p-6 flex flex-col h-full">
               {/* Header */}
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center shadow-lg">
                        <span className="text-white text-lg font-bold">{cardName.charAt(0).toUpperCase()}</span>
                     </div>
                     <div>
                        <p className="text-white/50 text-xs uppercase tracking-wider">Account Holder</p>
                        <p className="text-white font-semibold text-sm tracking-wide uppercase">{cardName}</p>
                     </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                     Active
                  </div>
               </div>

               {/* Balance */}
               <div className="mt-6">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-1">
                     {cardType === 'CREDIT' ? 'Total Balance' : 'Available Balance'}
                  </p>
                  <div className="flex items-baseline gap-1">
                     <span className="text-white/60 text-2xl font-light">₹</span>
                     <span className="text-white text-4xl font-bold tracking-tight">
                        {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </span>
                  </div>
               </div>

               {/* Stats */}
               <div className="mt-4 grid grid-cols-2 gap-4 py-3 border-y border-white/10">
                  <div>
                     <div className="flex items-center gap-1 mb-1">
                        <span className="text-emerald-400 text-xs">↑</span>
                        <span className="text-white/40 text-[10px] uppercase tracking-wider">Inflow</span>
                     </div>
                     <p className="text-white font-semibold text-sm">+₹{income.toLocaleString()}</p>
                  </div>
                  <div>
                     <div className="flex items-center gap-1 mb-1">
                        <span className="text-purple-400 text-xs">↓</span>
                        <span className="text-white/40 text-[10px] uppercase tracking-wider">Outflow</span>
                     </div>
                     <p className="text-white font-semibold text-sm">-₹{spent.toLocaleString()}</p>
                  </div>
               </div>

               {/* Footer */}
               <div className="mt-auto flex justify-between items-end">
                  <div className="w-12 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md flex items-center justify-center shadow-lg">
                     <div className="w-8 h-6">
                        <div className="flex gap-0.5">
                           {[...Array(3)].map((_, i) => (
                              <div key={i} className="w-1.5 h-4 bg-yellow-800/50 rounded-sm"></div>
                           ))}
                        </div>
                        <div className="w-full h-1 bg-yellow-800/50 mt-1 rounded-sm"></div>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-white/40 text-[9px] uppercase tracking-wider">Valid Thru</p>
                     <p className="text-white text-sm font-semibold">12/28</p>
                  </div>
               </div>
            </div>

            {/* Border Animation */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
               <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
         </div>
      </div>
   );
}

/* ================= BACK COMPONENT ================= */
function BalanceCardBack({ cardName, balance, qrData }) {
   return (
      <div className="absolute inset-0 rounded-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
         <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 flex flex-col h-full">
               <div className="text-center mb-4">
                  <h3 className="text-white text-base font-semibold">Card Details</h3>
                  <p className="text-white/40 text-[10px] mt-1">Scan QR code with your phone</p>
               </div>

               <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="bg-white rounded-xl p-3 shadow-lg">
                     <QRCodeCanvas 
                        value={qrData}
                        size={140}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#000000"
                     />
                  </div>
                  <p className="text-white/30 text-[10px] mt-3 text-center">
                     Scan to view card details
                  </p>
               </div>

               <div className="text-center mt-4 pt-3 border-t border-white/10">
                  <p className="text-white/30 text-[8px] tracking-wider">Tap card to flip • Blockchain secured</p>
               </div>
            </div>

            {/* Border Animation */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
               <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
         </div>
      </div>
   );
}