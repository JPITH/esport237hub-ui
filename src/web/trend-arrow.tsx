import { ArrowDown, ArrowUp, Minus } from "lucide-react";

/** Sens du mouvement au classement. */
export type TrendMovement = "up" | "down" | "same";

export interface TrendArrowProps {
  movement: TrendMovement;
  /** Écart affiché à côté de la flèche (places gagnées/perdues, points…). */
  delta?: number;
  /** Taille de l'icône en px (défaut 14). */
  size?: number;
  /** Masque le libellé accessible par défaut (si déjà décrit par le parent). */
  label?: string;
  className?: string;
}

const MOVEMENT_LABEL: Record<TrendMovement, string> = {
  up: "En hausse",
  down: "En baisse",
  same: "Stable",
};

/** Formate l'écart avec son signe (« +3 », « -2 », « 0 »). */
export function formatDelta(movement: TrendMovement, delta: number): string {
  const n = Math.abs(delta);
  if (movement === "up") return `+${n}`;
  if (movement === "down") return `-${n}`;
  return `${n}`;
}

/**
 * Flèche de mouvement au classement : haute VERTE (accent) si le joueur
 * monte, basse ROUGE (danger) s'il descend, tiret discret (textMuted) s'il
 * ne bouge pas. Icônes Lucide — jamais d'emoji.
 */
export function TrendArrow({
  movement,
  delta,
  size = 14,
  label,
  className = "",
}: TrendArrowProps) {
  const Icon =
    movement === "up" ? ArrowUp : movement === "down" ? ArrowDown : Minus;
  const text = MOVEMENT_LABEL[movement];
  const full =
    label ??
    (delta != null ? `${text} de ${Math.abs(delta)}` : text);

  return (
    <span
      className={`e237-trend e237-trend--${movement} ${className}`.trim()}
      aria-label={full}
      title={full}
    >
      <Icon aria-hidden width={size} height={size} strokeWidth={2.5} />
      {delta != null ? (
        <span className="e237-trend__delta">{formatDelta(movement, delta)}</span>
      ) : null}
    </span>
  );
}
