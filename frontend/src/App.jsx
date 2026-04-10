import { useState } from 'react';
import CreditCard from './components/CreditCard';
import { BalanceCard } from './components/BalanceCard';
import { RecentActivity } from './components/activity';
import { Sidebar } from './components/Sidebar';
import { GraphHome } from './components/graph_home';
import Analytics from './components/Analytics';
import Settings from './components/Settings';

export default function App() {
   const [activeCard, setActiveCard] = useState(0);
   const [spendView, setSpendView] = useState('WEEK');
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

   // 🔥 ADD THIS
   const [activePage, setActivePage] = useState("dashboard");

   const userData = {
      name: "HARSH SHARMA",
      balance: 45290.00,
      cardNumber: "4231 8291 0021 7731",
      validThru: "08/29",
      cvv: "192",
      cardType: "CREDIT",
      cardNetwork: "Visa"
   };

   const transactions = [
      { title: 'Credit Salary', amount: '+₹45,290', tag: 'Income', color: 'bg-emerald-500/20 text-emerald-400' },
      { title: 'Netflix Sub', amount: '-₹649', tag: 'Subscription', color: 'bg-red-500/20 text-red-400' },
      { title: 'Amazon Shopping', amount: '-₹2,490', tag: 'Retail', color: 'bg-orange-500/20 text-orange-400' },
      { title: 'Zomato Dining', amount: '-₹420', tag: 'Food & Drink', color: 'bg-blue-500/20 text-blue-400' },
      { title: 'Spotify Premium', amount: '-₹119', tag: 'Entertainment', color: 'bg-emerald-500/20 text-emerald-400' }
   ];

   return (
      <div className="min-h-screen bg-[#060608] text-white flex lg:flex-row flex-col p-4 gap-6">

         {/* Sidebar */}
         <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            activePage={activePage}
            setActivePage={setActivePage}
         />

         {/* Center */}
         <div className="flex-1 flex flex-col items-center mt-6">

            {/* DASHBOARD */}
            {activePage === "dashboard" && (
               <>
                  {activeCard === 0 ? (
                     <BalanceCard
                        cardName={userData.name}
                        balance={userData.balance}
                        cardType={userData.cardType}
                     />
                  ) : (
                     <CreditCard
                        cardNumber={userData.cardNumber}
                        cardName={userData.name}
                        validThru={userData.validThru}
                        cvv={userData.cvv}
                        cardType={userData.cardType}
                        cardNetwork={userData.cardNetwork}
                     />
                  )}

                  {/* Switch Dots */}
                  <div className="flex gap-3 mt-6 items-center">
                     <button
                        onClick={() => setActiveCard(0)}
                        className={`h-2.5 rounded-full ${activeCard === 0 ? "w-10 bg-emerald-400" : "w-3 bg-white/30"
                           }`}
                     />
                     <button
                        onClick={() => setActiveCard(1)}
                        className={`h-2.5 rounded-full ${activeCard === 1 ? "w-10 bg-purple-400" : "w-3 bg-white/30"
                           }`}
                     />
                  </div>

                  {/* Graph */}
                  {/* <GraphHome
                  spendView={spendView}
                  setSpendView={setSpendView}
                /> */}
               </>
            )}

            {/* ANALYTICS */}
            {activePage === "analytics" && <Analytics />}

            {/* SETTINGS */}
            {activePage === "settings" && <Settings />}

            {/* 🔥 Quick Actions */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-[500px] mt-6">

               {/* Scan QR */}
               <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-white/10 transition cursor-pointer group">

                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                     <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                     </svg>
                  </div>

                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest text-center">
                     Scan QR
                  </span>
               </div>

               {/* Pay Anyone */}
               <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-white/10 transition cursor-pointer group">

                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                     <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                     </svg>
                  </div>

                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest text-center">
                     Pay Anyone
                  </span>
               </div>

               {/* Bank Transfer */}
               <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-white/10 transition cursor-pointer group">

                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                     <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 2 7 22 7 12 2"></polygon>
                        <line x1="2" y1="22" x2="22" y2="22"></line>
                        <line x1="6" y1="18" x2="6" y2="11"></line>
                        <line x1="10" y1="18" x2="10" y2="11"></line>
                        <line x1="14" y1="18" x2="14" y2="11"></line>
                        <line x1="18" y1="18" x2="18" y2="11"></line>
                     </svg>
                  </div>

                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest text-center">
                     Bank Transfer
                  </span>
               </div>

            </div>

            <GraphHome
               spendView={spendView}
               setSpendView={setSpendView}
            />

         </div>

         {/* Right Sidebar */}
         <div className="w-full lg:w-80">
            <RecentActivity transactions={transactions} />
         </div>

      </div>
   );
}