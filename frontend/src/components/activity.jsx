export function RecentActivity({ transactions = [] }) {
  return (
    <div className="w-full lg:w-80 flex flex-col lg:bg-transparent backdrop-blur-3xl lg:border-none border-t border-white/10 lg:rounded-[32px] p-6 lg:p-4 shadow-2xl lg:shadow-none relative z-10 h-auto lg:h-[calc(100vh-3rem)]">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-bold text-sm tracking-widest uppercase text-white/90">
          Recent Activity
        </h3>
        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-white transition">
          See All
        </span>
      </div>

      {/* Transactions List */}
      <div className="flex flex-col gap-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

        {transactions.length === 0 ? (
          <p className="text-white/40 text-sm text-center mt-10">
            No transactions found
          </p>
        ) : (
          transactions.map((tx, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 group cursor-pointer hover:bg-white/5 px-3 -mx-3 rounded-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4">

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-inner ${tx.color}`}>
                  {tx.title?.charAt(0) || 'T'}
                </div>

                <div className="flex flex-col">
                  <span className="text-white/90 text-[13px] font-semibold tracking-wide group-hover:text-white transition">
                    {tx.title}
                  </span>
                  <span className="text-white/40 text-[9px] uppercase tracking-widest">
                    {tx.tag}
                  </span>
                </div>
              </div>

              <span
                className={`font-mono text-sm tracking-tight ${
                  tx.amount?.includes('+')
                    ? 'text-emerald-400'
                    : 'text-white/80'
                }`}
              >
                {tx.amount}
              </span>
            </div>
          ))
        )}

      </div>

      {/* Bottom Button */}
      <div className="mt-auto pt-6 border-t border-white/10 relative">
        <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 tracking-widest text-[10px] font-bold uppercase transition hover:text-white hover:bg-white/10">
          Download PDF Statement
        </button>
      </div>

    </div>
  );
}