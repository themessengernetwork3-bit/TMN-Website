"use client";

interface StepIndicatorProps {
  steps: string[];
  currentIndex: number;
}

/** Rendered on the brand-navy hero band — colors are tuned for that dark background. */
export default function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  return (
    <ol className="flex items-start">
      {steps.map((step, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "todo";
        const isLast = i === steps.length - 1;
        return (
          <li key={step} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  state === "done"
                    ? "bg-brand-green text-white shadow-[0_0_0_4px_rgba(31,174,100,0.2)]"
                    : state === "active"
                      ? "bg-white text-brand-navy shadow-[0_0_0_4px_rgba(255,255,255,0.25)]"
                      : "bg-white/10 text-white/40"
                }`}
              >
                {state === "done" ? (
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
                    <path
                      d="M3 8.5l3 3 7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`text-center text-xs font-medium whitespace-nowrap sm:text-sm ${
                  state === "todo" ? "text-white/40" : "text-white"
                }`}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div className="mx-2 mt-4 h-0.5 flex-1 shrink-0 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-brand-green transition-all duration-500"
                  style={{ width: state === "done" ? "100%" : "0%" }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
