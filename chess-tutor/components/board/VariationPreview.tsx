"use client";

import type { VariationMove } from "@/types/annotations";

type VariationPreviewProps = {
  variation: VariationMove[];
  previewIndex: number;
  onPreviewIndexChange: (index: number) => void;
};

export function VariationPreview({
  variation,
  previewIndex,
  onPreviewIndexChange,
}: VariationPreviewProps) {
  if (variation.length === 0) return null;

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        Variation preview
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onPreviewIndexChange(-1)}
          className={`rounded-md px-2 py-1 font-mono text-xs ${
            previewIndex === -1
              ? "bg-amber-200 text-amber-950"
              : "bg-white text-stone-600 hover:bg-stone-100"
          }`}
        >
          Current
        </button>
        {variation.map((move, i) => (
          <button
            key={`${move.san}-${i}`}
            type="button"
            onClick={() => onPreviewIndexChange(i)}
            className={`rounded-md px-2 py-1 font-mono text-xs ${
              previewIndex === i
                ? "bg-amber-200 text-amber-950"
                : "bg-white text-stone-600 hover:bg-stone-100"
            }`}
          >
            {move.san}
          </button>
        ))}
      </div>
    </div>
  );
}
