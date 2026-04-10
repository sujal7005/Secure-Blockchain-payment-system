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

  // Controlled + uncontrolled flip
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
        x: ((y - centerY) / centerY) * -15,
        y: ((x - centerX) / centerX) * 15
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
    <div className="[perspective:1500px] w-[320px] sm:w-[380px] md:w-[420px] h-[200px] sm:h-[235px] md:h-[260px] flex items-center justify-center">

      {/* Animation */}
      <style>{`
        @keyframes spinBorder {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>

      <div className="transform scale-[0.85] md:scale-100 transition">

        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleFlip}
          className="relative w-[420px] h-[260px] cursor-pointer [transform-style:preserve-3d] transition-transform duration-300 hover:scale-[1.03]"
          style={{
            transform: flipped
              ? `rotateY(180deg)`
              : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
          }}
        >

          {/* ================= FRONT ================= */}
          <CardFront
            cardNumber={cardNumber}
            cardName={cardName}
            validThru={validThru}
            cardType={cardType}
            cardNetwork={cardNetwork}
            mousePos={mousePos}
          />

          {/* ================= BACK ================= */}
          <CardBack cvv={cvv} />

        </div>
      </div>
    </div>
  );
}

/* ================= FRONT COMPONENT ================= */
function CardFront({ cardNumber, cardName, validThru, cardType, cardNetwork, mousePos }) {
  return (
    <div className="absolute inset-0 rounded-[28px] [backface-visibility:hidden]">

      <div className="absolute inset-0 rounded-[28px] bg-white/10 backdrop-blur-2xl border border-white/20 p-8 flex flex-col justify-between overflow-hidden">

        {/* Glow */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none mix-blend-screen"
          style={{
            background: `radial-gradient(350px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.4), transparent 60%)`
          }}
        />

        {/* Card Type */}
        <span className="text-white/80 text-[11px] tracking-[0.3em]">{cardType}</span>

        {/* Number */}
        <div className="text-white font-mono text-2xl tracking-widest">
          {cardNumber || '#### #### #### ####'}
        </div>

        {/* Bottom */}
        <div className="flex justify-between items-end">

          <div>
            <p className="text-white/50 text-[10px]">Name</p>
            <p className="text-white">{cardName || 'YOUR NAME'}</p>
          </div>

          <div>
            <p className="text-white/50 text-[10px]">Valid</p>
            <p className="text-white">{validThru || 'MM/YY'}</p>
          </div>

          <CardNetwork network={cardNetwork} />
        </div>
      </div>

      <BorderAnimation />
    </div>
  );
}

/* ================= BACK COMPONENT ================= */
function CardBack({ cvv }) {
  return (
    <div className="absolute inset-0 rounded-[28px] [transform:rotateY(180deg)] [backface-visibility:hidden]">

      <div className="absolute inset-0 rounded-[28px] bg-white/10 backdrop-blur-2xl border border-white/20 p-6">
        <div className="w-full h-12 bg-black mt-4"></div>

        <div className="mt-6 flex justify-end bg-white/20 p-3 rounded">
          <span className="text-white font-mono">{cvv || '***'}</span>
        </div>
      </div>

      <BorderAnimation />
    </div>
  );
}

/* ================= NETWORK ================= */
function CardNetwork({ network }) {
  if (network === 'Visa') {
    return <span className="text-white font-bold">VISA</span>;
  }

  if (network === 'RuPay') {
    return <span className="text-white font-bold">RuPay</span>;
  }

  return (
    <div className="flex">
      <div className="w-6 h-6 bg-red-500 rounded-full"></div>
      <div className="w-6 h-6 bg-yellow-500 rounded-full -ml-3"></div>
    </div>
  );
}

/* ================= BORDER ================= */
function BorderAnimation() {
  return (
    <div
      className="absolute inset-0 rounded-[28px] pointer-events-none"
      style={{
        padding: '2px',
        WebkitMask:
          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude'
      }}
    >
      <div
        className="absolute top-1/2 left-1/2 w-[200%] h-[200%] bg-[conic-gradient(red,orange,yellow,lime,cyan,blue,magenta,red)]"
        style={{ animation: 'spinBorder 3s linear infinite' }}
      />
    </div>
  );
}