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
      className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        dragging
          ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
          : "border-zinc-300 dark:border-zinc-700"
      } ${disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
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
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,.xlsx,.xls"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="font-medium text-zinc-800 dark:text-zinc-100">{label}</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{helpText}</p>
      <p className="mt-3 text-xs text-zinc-400">CSV, XLSX or XLS — click or drag & drop</p>
    </div>
  );
}
