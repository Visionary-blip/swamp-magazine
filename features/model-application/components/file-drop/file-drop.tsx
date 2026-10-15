"use client";

import { useRef, useState, type DragEvent } from "react";

// The dashed drop box on the application forms: drag a photo onto it or tap to
// choose one. The prompt is the box's own text until a file is picked, then the
// file's name takes its place.
export function FileDrop({ name, prompt }: { name: string; prompt: string }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // A dropped file has to be moved into the real input, or the form posts
  // without it.
  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (!dropped || !fileInput.current) return;
    const transfer = new DataTransfer();
    transfer.items.add(dropped);
    fileInput.current.files = transfer.files;
    setFileName(dropped.name);
  }

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center gap-1 border-2 border-dashed px-4 py-8 text-center font-body text-xs tracking-widest transition-colors ${
        dragging ? "border-brand-yellow text-brand-yellow" : "border-brand-red"
      }`}
    >
      <span>{fileName ?? prompt}</span>
      <input
        ref={fileInput}
        className="sr-only"
        type="file"
        name={name}
        accept="image/*"
        required
        onChange={(event) =>
          setFileName(event.currentTarget.files?.[0]?.name ?? null)
        }
      />
    </label>
  );
}
