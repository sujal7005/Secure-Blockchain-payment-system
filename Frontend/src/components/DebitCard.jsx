import { useState, useRef } from 'react';

export default function DebitCard({
  cardNumber = '',
  cardName = '',
  validThru = '',
  cvv = '',
  cardType = 'DEBIT',
  cardNetwork = 'Visa',
  onFocusCvv = null
}) {
  const cardRef = useRef(null);

  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const flipped = onFocusCvv !== null ? onFocusCvv : isFlipped;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!flipped) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      setRotate({
        x: ((y - centerY) / centerY) * -10,
        y: ((x - centerX) / centerX) * 10
      });
    }

    setMousePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  const handleMouseLeave = () => {
    if (!flipped) setRotate({ x: 0, y: 0 });
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
          transform: flipped
            ? `rotateY(180deg)`
            : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
        }}
      >
        <DebitCardFront
          cardNumber={cardNumber}
          cardName={cardName}
          validThru={validThru}
          cardType={cardType}
          cardNetwork={cardNetwork}
          mousePos={mousePos}
        />
        <DebitCardBack cvv={cvv} />
      </div>
    </div>
  );
}

/* ================= FRONT COMPONENT ================= */
function DebitCardFront({ cardNumber, cardName, validThru, cardType, cardNetwork, mousePos }) {
  return (
    <div className="absolute inset-0 rounded-2xl [backface-visibility:hidden]">
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/20 overflow-hidden shadow-2xl">
        
        {/* Animated Glow */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(59,130,246,0.3), transparent 60%)`
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-white/60 text-[10px] tracking-[0.2em] uppercase">Card Type</span>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-white/90 text-base font-semibold">{cardType}</p>
                <div className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 text-[7px] font-bold uppercase">Debit</div>
              </div>
            </div>
            <DebitCardNetwork network={cardNetwork} />
          </div>

          {/* EMV Chip */}
          <div className="mt-3">
            <div className="w-10 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md flex items-center justify-center shadow-lg">
              <div className="w-7 h-6">
                <div className="flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1.5 h-4 bg-yellow-800/50 rounded-sm"></div>
                  ))}
                </div>
                <div className="w-full h-1 bg-yellow-800/50 mt-1 rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* Card Number */}
          <div className="mt-4">
            <p className="text-white/40 text-[9px] tracking-wider mb-2">Card Number</p>
            <div className="text-white font-mono text-2xl tracking-widest">
              {cardNumber || '#### #### #### ####'}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex justify-between items-end">
            <div>
              <p className="text-white/40 text-[8px] tracking-wider">Card Holder Name</p>
              <p className="text-white text-sm font-semibold tracking-wide mt-1 uppercase">{cardName || 'YOUR NAME'}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-[8px] tracking-wider">Valid Thru</p>
              <p className="text-white text-sm font-semibold mt-1">{validThru || 'MM/YY'}</p>
            </div>
          </div>
        </div>

        {/* Border Animation */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
          <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
    </div>
  );
}

/* ================= BACK COMPONENT ================= */
function DebitCardBack({ cvv }) {
  return (
    <div className="absolute inset-0 rounded-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/20 overflow-hidden shadow-2xl">
        
        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Magnetic Strip */}
          <div className="w-full h-12 bg-black/60 rounded-md mt-2"></div>
          
          {/* CVV Section */}
          <div className="mt-auto mb-6">
            <div className="flex justify-end items-center gap-3">
              <span className="text-white/50 text-[10px] tracking-wider">CVV</span>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-white font-mono text-lg tracking-wider">{cvv || '***'}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-white/30 text-[8px] tracking-wider">Debit card issued by BlockPay Bank</p>
          </div>
        </div>

        {/* Border Animation */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
          <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
    </div>
  );
}

/* ================= NETWORK ================= */
function DebitCardNetwork({ network }) {
  if (network === 'Visa') {
    return (
      <div className="w-12 h-7 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
        <span className="text-white font-bold text-[10px] tracking-wider">VISA</span>
      </div>
    );
  }
  if (network === 'RuPay') {
    return (
      <div className="w-12 h-7 bg-gradient-to-br from-green-600 to-teal-600 rounded flex items-center justify-center">
        <span className="text-white font-bold text-[8px] tracking-wider">RuPay</span>
      </div>
    );
  }
  if (network === 'Mastercard') {
    return (
      <div className="flex items-center gap-1">
        <div className="w-7 h-7 bg-red-500 rounded-full opacity-80"></div>
        <div className="w-7 h-7 bg-yellow-500 rounded-full opacity-80 -ml-3.5"></div>
        <span className="text-white text-[9px] font-semibold ml-1">MC</span>
      </div>
    );
  }
  return (
    <div className="flex">
      <div className="w-7 h-7 bg-red-500 rounded-full"></div>
      <div className="w-7 h-7 bg-yellow-500 rounded-full -ml-3.5"></div>
    </div>
  );
}