interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

// Node positions (x, y, radius) traced from the real network-node mark: a
// scattered graph with two larger "hub" nodes and several smaller satellites.
const NODES: [number, number, number][] = [
  [4, 24, 1.6], // far left small
  [10, 16, 1.8],
  [12, 27, 4.2], // left hub
  [15, 34, 1.6], // bottom-left small
  [22, 11, 1.4], // top small
  [23, 20, 2.2],
  [26, 32, 1.6],
  [32, 9, 2.6], // top-right medium
  [33, 20, 4.2], // right hub
  [41, 15, 1.8],
  [37, 27, 1.6],
];

const EDGES: [number, number][] = [
  [0, 2],
  [1, 2],
  [2, 3],
  [2, 5],
  [2, 6],
  [5, 4],
  [5, 7],
  [5, 8],
  [7, 8],
  [8, 9],
  [8, 10],
  [8, 6],
];

/** The Messenger Network wordmark: orange network-node icon + small-caps name. */
export default function Logo({ variant = "dark", className = "" }: LogoProps) {
  const nameColor = variant === "dark" ? "text-zinc-900" : "text-white";
  const eyebrowColor = variant === "dark" ? "text-zinc-500" : "text-zinc-300";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 46 40"
        width="38"
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
        <span className={`block text-[0.65rem] font-normal ${eyebrowColor}`}>The</span>
        <span
          className={`block text-lg font-bold tracking-tight ${nameColor}`}
          style={{ fontVariantCaps: "small-caps" }}
        >
          Messenger Network
        </span>
      </span>
    </div>
  );
}
