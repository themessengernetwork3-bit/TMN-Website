"use client";

interface StepIndicatorProps {
  steps: string[];
  currentIndex: number;
}

/** Rendered on the brand-navy hero band — colors are tuned for that dark background. */
export default function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3 text-sm">
      {steps.map((step, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "todo";
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                state === "done"
                  ? "bg-brand-green text-white"
                  : state === "active"
                    ? "bg-white/10 text-brand-mint ring-2 ring-brand-green"
                    : "bg-white/5 text-white/40"
              }`}
            >
              {i + 1}
            </span>
            <span className={state === "todo" ? "text-white/40" : "font-medium text-white"}>
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-1 hidden h-px w-6 bg-white/15 sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
