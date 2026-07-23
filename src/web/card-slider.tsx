"use client";

import { useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Slide {
  label: string;
  node: ReactNode;
}

/**
 * Carrousel de cartes glissable (tactile + flèches + points). Par défaut la
 * première diapo (carte globale) ; on slide pour voir les cartes par jeu.
 */
export function CardSlider({
  slides,
  className = "",
}: {
  slides: Slide[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);

  if (slides.length === 0) return null;

  const go = (i: number) =>
    setIndex(Math.max(0, Math.min(slides.length - 1, i)));

  return (
    <div className={className}>
      <div
        className="overflow-hidden"
        onTouchStart={(e) => {
          startX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (startX.current === null) return;
          const dx = e.changedTouches[0].clientX - startX.current;
          if (dx < -40) go(index + 1);
          else if (dx > 40) go(index - 1);
          startX.current = null;
        }}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              className="w-full shrink-0"
              aria-hidden={i !== index}
              inert={i !== index}
            >
              {s.node}
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Carte précédente"
            className="grid size-8 shrink-0 place-items-center rounded-md border border-edge text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex flex-1 items-center justify-center">
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={s.label}
                aria-current={i === index || undefined}
                className="grid size-11 place-items-center text-secondary hover:text-accent"
              >
                <span
                  aria-hidden
                  className={`block h-1.5 rounded-full transition-[width,background-color] duration-200 ${
                    i === index
                      ? "w-5 bg-accent"
                      : "w-1.5 bg-edge"
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === slides.length - 1}
            aria-label="Carte suivante"
            className="grid size-8 shrink-0 place-items-center rounded-md border border-edge text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}

      <div className="mt-2 text-center text-xs font-medium text-secondary">
        {slides[index].label}
      </div>
    </div>
  );
}
