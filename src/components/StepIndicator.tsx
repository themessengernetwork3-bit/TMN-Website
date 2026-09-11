"use client";

interface StepIndicatorProps {
  steps: string[];
  currentIndex: number;
}

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
                  ? "bg-teal-600 text-white"
                  : state === "active"
                    ? "bg-teal-100 text-teal-800 ring-2 ring-teal-600 dark:bg-teal-900 dark:text-teal-100"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={
                state === "todo"
                  ? "text-zinc-400"
                  : "font-medium text-zinc-800 dark:text-zinc-100"
              }
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-1 hidden h-px w-6 bg-zinc-300 dark:bg-zinc-700 sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
