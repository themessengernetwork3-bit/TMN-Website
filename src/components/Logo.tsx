interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

const NODES: [number, number, number][] = [
  [5, 34, 2.5],
  [13, 27, 2],
  [12, 18, 3],
  [21, 21, 4],
  [30, 13, 3],
  [22, 8, 2],
  [33, 6, 2],
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [4, 6],
];

/** The Messenger Network wordmark: orange network-node icon + two-line name. */
export default function Logo({ variant = "dark", className = "" }: LogoProps) {
  const nameColor = variant === "dark" ? "text-zinc-900" : "text-white";
  const eyebrowColor = variant === "dark" ? "text-zinc-500" : "text-zinc-300";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 40 40"
        width="34"
        height="34"
        className="shrink-0"
        aria-hidden="true"
      >
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a][0]}
            y1={NODES[a][1]}
            x2={NODES[b][0]}
            y2={NODES[b][1]}
            stroke="var(--color-brand-orange)"
            strokeWidth="1"
          />
        ))}
        {NODES.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="var(--color-brand-orange)" />
        ))}
      </svg>
      <span className="leading-none">
        <span className={`block text-[0.65rem] font-medium ${eyebrowColor}`}>The</span>
        <span className={`block text-lg font-bold tracking-tight ${nameColor}`}>
          Messenger Network
        </span>
      </span>
    </div>
  );
}
