"use client";

import { useRef, useState } from "react";

interface DropzoneProps {
  label: string;
  helpText: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export default function Dropzone({
  label,
  helpText,
  multiple = false,
  onFiles,
  disabled = false,
}: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    onFiles(Array.from(fileList));
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
        dragging
          ? "scale-[1.01] border-brand-green bg-brand-green/5"
          : "border-zinc-200 hover:border-brand-green/50 hover:bg-zinc-50/60"
      } ${disabled ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <div
        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
          dragging
            ? "bg-brand-green text-white"
            : "bg-zinc-100 text-zinc-400 group-hover:bg-brand-green/10 group-hover:text-brand-green"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 16V4m0 0l-4 4m4-4l4 4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,.xlsx,.xls"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="font-medium text-zinc-800">{label}</p>
      <p className="mt-1 text-sm text-zinc-500">{helpText}</p>
      <p className="mt-3 text-xs text-zinc-400">
        CSV, XLSX or XLS — click or drag & drop
      </p>
    </div>
  );
}
