import { useState, useRef } from 'react';

export default function CreditCard({
  cardNumber = '',
  cardName = '',
  validThru = '',
  cvv = '',
  cardType = 'CREDIT',
  cardNetwork = 'Mastercard',
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
        <CardFront
          cardNumber={cardNumber}
          cardName={cardName}
          validThru={validThru}
          cardType={cardType}
          cardNetwork={cardNetwork}
          mousePos={mousePos}
        />
        <CardBack cvv={cvv} />
      </div>
    </div>
  );
}

/* ================= FRONT COMPONENT ================= */
function CardFront({ cardNumber, cardName, validThru, cardType, cardNetwork, mousePos }) {
  return (
    <div className="absolute inset-0 rounded-2xl [backface-visibility:hidden]">
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 overflow-hidden shadow-2xl">
        
        {/* Animated Glow */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.25), transparent 60%)`
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-white/60 text-[10px] tracking-[0.2em] uppercase">Card Type</span>
              <p className="text-white/90 text-base font-semibold mt-1">{cardType}</p>
            </div>
            <CardNetwork network={cardNetwork} />
          </div>

          {/* Card Number */}
          <div className="mt-6">
            <p className="text-white/50 text-[10px] tracking-wider mb-2">Card Number</p>
            <div className="text-white font-mono text-2xl tracking-widest">
              {cardNumber || '#### #### #### ####'}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex justify-between items-end">
            <div>
              <p className="text-white/50 text-[8px] tracking-wider">Card Holder Name</p>
              <p className="text-white text-sm font-semibold tracking-wide mt-1 uppercase">{cardName || 'YOUR NAME'}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-[8px] tracking-wider">Valid Thru</p>
              <p className="text-white text-sm font-semibold mt-1">{validThru || 'MM/YY'}</p>
            </div>
          </div>
        </div>

        {/* Border Animation */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
          <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
    </div>
  );
}

/* ================= BACK COMPONENT ================= */
function CardBack({ cvv }) {
  return (
    <div className="absolute inset-0 rounded-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 overflow-hidden shadow-2xl">
        
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
            <p className="text-white/30 text-[8px] tracking-wider">This card is issued by BlockPay Bank</p>
          </div>
        </div>

        {/* Border Animation */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
          <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
    </div>
  );
}

/* ================= NETWORK ================= */
function CardNetwork({ network }) {
  if (network === 'Visa') {
    return <span className="text-white font-bold text-xl tracking-wider">VISA</span>;
  }
  if (network === 'RuPay') {
    return <span className="text-white font-bold text-xl tracking-wider">RuPay</span>;
  }
  if (network === 'Mastercard') {
    return (
      <div className="flex items-center gap-1">
        <div className="w-8 h-8 bg-red-500 rounded-full opacity-80"></div>
        <div className="w-8 h-8 bg-yellow-500 rounded-full opacity-80 -ml-4"></div>
        <span className="text-white text-[10px] font-semibold ml-2">Mastercard</span>
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