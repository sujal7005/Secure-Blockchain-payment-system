import { useState } from 'react';

export function GraphHome({ spendView, setSpendView }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const data = {
    WEEK: {
      points: [30, 45, 10, 80, 50, 90, 60],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    MONTH: {
      points: [20, 60, 40, 90, 30, 80, 70, 55, 85, 45, 75, 65, 95, 50, 80, 70, 60, 85, 55, 90, 45, 75, 65, 80, 70, 60, 85, 50, 75, 65],
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    }
  };

  const currentData = data[spendView];
  const points = currentData.points;
  const max = Math.max(...points) * 1.2;
  const width = 400;
  const height = 100;
  const stepX = width / (points.length - 1);

  // Generate SVG Path
  const generatePath = () => {
    let path = "";
    points.forEach((p, i) => {
      const x = i * stepX;
      const y = height - (p / max) * height;
      path += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    });
    return path;
  };

  // Generate Area Path (filled area under the line)
  const generateAreaPath = () => {
    let path = "";
    points.forEach((p, i) => {
      const x = i * stepX;
      const y = height - (p / max) * height;
      path += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    });
    // Close the area to the bottom
    path += ` L${(points.length - 1) * stepX},${height} L0,${height} Z`;
    return path;
  };

  const getYPosition = (value) => {
    return height - (value / max) * height;
  };

  return (
    <div className="w-full max-w-[600px] mt-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-white text-sm font-bold tracking-widest uppercase">
            Spending Overview
          </h3>
          <p className="text-white/40 text-[10px] mt-1">Track your spending patterns</p>
        </div>

        <div className="flex gap-1.5 bg-white/5 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setSpendView("WEEK")}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all duration-200 ${
              spendView === "WEEK" 
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg" 
                : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            WEEK
          </button>
          <button
            onClick={() => setSpendView("MONTH")}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all duration-200 ${
              spendView === "MONTH" 
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg" 
                : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            MONTH
          </button>
        </div>
      </div>

      {/* Graph Container */}
      <div className="relative">
        {/* Y-axis Grid Lines */}
        <div className="absolute left-0 right-0 h-full pointer-events-none">
          {[0, 25, 50, 75, 100].map((level) => {
            const y = height - (level / 100) * height;
            return (
              <div
                key={level}
                className="absolute left-0 right-0 border-t border-white/5"
                style={{ top: `${y}px` }}
              >
                <span className="absolute -left-6 text-[8px] text-white/30">
                  {Math.round((level / 100) * max)}
                </span>
              </div>
            );
          })}
        </div>

        {/* SVG Graph */}
        <svg viewBox="0 0 400 100" className="w-full h-[120px] overflow-visible">
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Area under the line */}
          <path
            d={generateAreaPath()}
            fill="url(#areaGradient)"
            className="transition-all duration-500"
          />

          {/* Main Line */}
          <path
            d={generatePath()}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500"
            filter="url(#glow)"
          />

          {/* Data Points */}
          {spendView === "WEEK" && points.map((point, index) => {
            const x = index * stepX;
            const y = getYPosition(point);
            return (
              <g
                key={index}
                className="cursor-pointer transition-all duration-300 hover:scale-125"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={hoveredPoint === index ? 5 : 3}
                  fill="#34d399"
                  stroke="#fff"
                  strokeWidth="1.5"
                  className="transition-all duration-200"
                />
                {hoveredPoint === index && (
                  <>
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="#34d399"
                      opacity="0.2"
                      className="animate-ping"
                    />
                    <rect
                      x={x - 20}
                      y={y - 25}
                      width="40"
                      height="20"
                      rx="4"
                      fill="#1f2937"
                      stroke="#34d399"
                      strokeWidth="1"
                      className="transition-all duration-200"
                    />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      fill="#34d399"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      ₹{point}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* X-axis Labels */}
        <div className="flex justify-between mt-2 px-2">
          {currentData.labels.map((label, index) => (
            <div
              key={index}
              className="text-[8px] text-white/40 text-center font-mono"
              style={{
                width: spendView === "WEEK" ? `${stepX}px` : 'auto'
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-white/40 text-[8px] uppercase tracking-wider">Average</p>
          <p className="text-white text-sm font-bold">
            ₹{(points.reduce((a, b) => a + b, 0) / points.length).toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-white/40 text-[8px] uppercase tracking-wider">Highest</p>
          <p className="text-emerald-400 text-sm font-bold">₹{Math.max(...points)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/40 text-[8px] uppercase tracking-wider">Lowest</p>
          <p className="text-red-400 text-sm font-bold">₹{Math.min(...points)}</p>
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-white/30 text-[8px]">
            {spendView === "WEEK" ? "Last 7 days trend" : "Monthly trend"}
          </span>
        </div>
        <div className="text-emerald-400 text-[10px]">
          {points[points.length - 1] > points[0] ? "↑ +" : "↓ "}
          {Math.abs(((points[points.length - 1] - points[0]) / points[0]) * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}