"use client";

import type { CleaningType } from "@/lib/types";

interface CleaningTypeStepProps {
  stepNumber: number;
  onSelect: (type: CleaningType) => void;
}

const ACCENT_BAR: Record<CleaningType, string> = {
  basic: "bg-brand-green",
  optout: "bg-brand-orange",
};

const ACCENT_PILL: Record<CleaningType, string> = {
  basic: "bg-brand-green/10 text-brand-green",
  optout: "bg-brand-orange/10 text-brand-orange",
};

const OPTIONS: {
  type: CleaningType;
  label: string;
  title: string;
  description: string;
  bullets: string[];
}[] = [
  {
    type: "basic",
    label: "Option 1",
    title: "Basic cleaning for broadcast send",
    description: "Just a customer database — no opt-out list needed.",
    bullets: [
      "Removes duplicate contacts (same phone number)",
      "Formats to Name / CountryCode / Phone / ContactStatus / AllowCampaign / AllowSMS",
    ],
  },
  {
    type: "optout",
    label: "Option 2",
    title: "Opt-out cleaning only",
    description: "An opt-out list plus a customer database.",
    bullets: [
      "Removes duplicate contacts (same phone number)",
      "Removes everyone on your opt-out / do-not-contact list",
      "Formats to Name / CountryCode / Phone / ContactStatus / AllowCampaign / AllowSMS",
    ],
  },
];

export default function CleaningTypeStep({ stepNumber, onSelect }: CleaningTypeStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          {stepNumber}. Choose a cleaning type
        </h2>
        <p className="mt-2 text-base text-zinc-500">
          Pick the workflow that matches what you&rsquo;re sending. Both end with a file
          formatted for a WATI broadcast.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.type}
            type="button"
            onClick={() => onSelect(opt.type)}
            className="group flex flex-col items-start gap-3.5 rounded-2xl border border-zinc-100 p-7 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-200 hover:shadow-md"
          >
            <span className={`h-1.5 w-12 rounded-full ${ACCENT_BAR[opt.type]}`} />
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${ACCENT_PILL[opt.type]}`}
            >
              {opt.label}
            </span>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900">{opt.title}</h3>
            <p className="text-base text-zinc-500">{opt.description}</p>
            <ul className="mt-1 flex flex-col gap-2 text-base text-zinc-600">
              {opt.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <svg
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="none"
                    className="mt-0.5 shrink-0 text-zinc-400"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8.5l3 3 7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
            <span className="mt-2 text-base font-semibold text-brand-green group-hover:underline">
              Select →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
