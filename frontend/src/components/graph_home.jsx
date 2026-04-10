export function GraphHome({ spendView, setSpendView }) {

  const data = {
    WEEK: [30, 45, 10, 80, 50, 90, 60],
    MONTH: [20, 60, 40, 90, 30, 80]
  };

  const points = data[spendView];

  // Generate SVG Path
  const generatePath = () => {
    const max = Math.max(...points) * 1.5;
    const width = 400;
    const height = 100;
    const stepX = width / (points.length - 1);

    let path = "";

    points.forEach((p, i) => {
      const x = i * stepX;
      const y = height - (p / max) * height;

      path += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    });

    return path;
  };

  return (
    <div className="w-full max-w-[500px] mt-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-4 shadow-xl">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-sm font-bold tracking-widest uppercase">
          Spending Overview
        </h3>

        <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setSpendView("WEEK")}
            className={`px-2 py-1 text-[10px] font-bold ${
              spendView === "WEEK" ? "bg-white/10 text-white" : "text-white/40"
            }`}
          >
            WEEK
          </button>
          <button
            onClick={() => setSpendView("MONTH")}
            className={`px-2 py-1 text-[10px] font-bold ${
              spendView === "MONTH" ? "bg-white/10 text-white" : "text-white/40"
            }`}
          >
            MONTH
          </button>
        </div>
      </div>

      {/* Graph */}
      <svg viewBox="0 0 400 100" className="w-full h-[100px]">

        <path
          d={generatePath()}
          fill="none"
          stroke="#34d399"
          strokeWidth="3"
          strokeLinecap="round"
        />

      </svg>

    </div>
  );
}