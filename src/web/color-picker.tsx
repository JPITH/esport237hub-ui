"use client";

/**
 * Sélecteur de couleur maison (ColorPicker) — ESPORT 237 HUB.
 *
 * Gestion interne en HSV/HSL, sans dépendance externe.
 * Stylé par les classes .cpick* de components.css.
 * Light/dark : suit les variables --e237-* du thème.
 */

import { useEffect, useId, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Helpers de conversion couleur (aucune dépendance)                   */
/* ------------------------------------------------------------------ */

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)      { r = c; g = x; b = 0; }
  else if (h < 120){ r = x; g = c; b = 0; }
  else if (h < 180){ r = 0; g = c; b = x; }
  else if (h < 240){ r = 0; g = x; b = c; }
  else if (h < 300){ r = x; g = 0; b = c; }
  else             { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Convertit HSV (canvas natif) en HSL (état interne). */
function hsvToHsl(
  h: number,
  s: number,
  v: number,
): [number, number, number] {
  const l = v * (1 - s / 200);
  const sl =
    l === 0 || l === 100
      ? 0
      : ((v - l) / Math.min(l, 100 - l)) * 100;
  return [h, Math.round(sl), Math.round(l)];
}

/** Convertit HSL (état interne) en HSV (pour positionner le curseur canvas). */
function hslToHsv(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  const ln = l / 100;
  const sn = s / 100;
  const v = ln + sn * Math.min(ln, 1 - ln);
  const sv = v === 0 ? 0 : 2 * (1 - ln / v);
  return [h, Math.round(sv * 100), Math.round(v * 100)];
}

/* ------------------------------------------------------------------ */
/* Interface publique                                                   */
/* ------------------------------------------------------------------ */

export interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  hint?: string;
  id?: string;
}

/* ------------------------------------------------------------------ */
/* Composant                                                            */
/* ------------------------------------------------------------------ */

export function ColorPicker({
  value,
  onChange,
  label,
  hint,
  id: idProp,
}: ColorPickerProps) {
  const genId = useId();
  const id = idProp ?? genId;

  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);

  const [hue, satL, lgt] = hexToHsl(value);
  const [svH, svS, svV] = hslToHsv(hue, satL, lgt);

  const rootRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);

  /* Synchronise le champ texte si la valeur change de l'extérieur. */
  useEffect(() => {
    setHexInput(value);
  }, [value]);

  /* Fermeture clic-dehors. */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Couleur hue pur pour l'arrière-plan de la zone SV. */
  const hueColor = hslToHex(svH, 100, 50);

  /* Positions du curseur SV en %. */
  const cursorLeft = svS;
  const cursorTop = 100 - svV;

  function updateFromHsv(h: number, s: number, v: number) {
    const [nh, ns, nl] = hsvToHsl(h, s, v);
    const hex = hslToHex(nh, ns, nl);
    setHexInput(hex);
    onChange(hex);
  }

  function handleSvDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = svRef.current!;
    el.setPointerCapture(e.pointerId);
    updateSvFromEvent(e);
  }

  function handleSvMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons === 0) return;
    updateSvFromEvent(e);
  }

  function updateSvFromEvent(e: React.PointerEvent) {
    const rect = svRef.current!.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100;
    const v =
      Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height)) * 100;
    updateFromHsv(svH, s, v);
  }

  function handleHue(e: React.ChangeEvent<HTMLInputElement>) {
    const h = Number(e.target.value);
    updateFromHsv(h, svS, svV);
  }

  function handleHexInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setHexInput(raw);
    const hex = raw.startsWith("#") ? raw : "#" + raw;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      onChange(hex);
    }
  }

  function handleHexBlur() {
    const hex = hexInput.startsWith("#") ? hexInput : "#" + hexInput;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      setHexInput(hex);
      onChange(hex);
    } else {
      setHexInput(value);
    }
  }

  return (
    <div className="cpick" ref={rootRef}>
      {label ? (
        <div className="cpick__header">
          <label htmlFor={id} className="cpick__label">
            {label}
          </label>
          {hint ? <span className="cpick__hint">{hint}</span> : null}
        </div>
      ) : null}

      <div className="cpick__row">
        <button
          type="button"
          className="cpick__swatch"
          style={{ background: value }}
          aria-label="Ouvrir le sélecteur de couleur"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        />
        <input
          id={id}
          type="text"
          className="cpick__hex"
          value={hexInput}
          onChange={handleHexInput}
          onBlur={handleHexBlur}
          spellCheck={false}
          maxLength={7}
          aria-label={label ?? "Couleur hexadécimale"}
        />
      </div>

      {open ? (
        <div className="cpick__popover ui-animate-pop">
          {/* Zone saturation/valeur */}
          <div
            className="cpick__sv-area"
            ref={svRef}
            onPointerDown={handleSvDown}
            onPointerMove={handleSvMove}
          >
            <div
              className="cpick__sv-bg"
              style={{ background: hueColor }}
            />
            <div className="cpick__sv-white" />
            <div className="cpick__sv-black" />
            <div
              className="cpick__cursor"
              style={{
                left: `${cursorLeft}%`,
                top: `${cursorTop}%`,
              }}
            />
          </div>

          {/* Slider teinte */}
          <input
            type="range"
            className="cpick__hue"
            min={0}
            max={360}
            value={svH}
            onChange={handleHue}
            aria-label="Teinte"
          />

          {/* Aperçu + hex en lecture */}
          <div className="cpick__footer">
            <div
              className="cpick__preview"
              style={{ background: value }}
              aria-hidden
            />
            <span className="cpick__value">{value.toUpperCase()}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
