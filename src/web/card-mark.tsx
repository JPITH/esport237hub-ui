/**
 * Le SIGNE au pied de la carte joueur (web) — jumeau de `../native/card-mark`.
 *
 * Retour du porteur (09/10/2026, lot M3) : « Enlève la pilule. […] Là où était
 * la pilule, mets le logo avec une petite animation en boucle. » La pilule
 * « G-HUB » cède donc la place au signe (`lib/brand-mark`, ses tracés et eux
 * seuls), à la hauteur de l'ancienne pilule.
 *
 * Encres : celles du SKIN (`cardMarkInks`) — sur la carte, le thème c'est le
 * skin, pas le mode clair/sombre de l'application. Chaque encre tient 3:1 sur
 * la surface à l'endroit où le signe est posé.
 *
 * Mouvement : un ÉCLAT (partition `CARD_MARK_GLINT` de `lib/brand-motion`).
 * Une copie claire du signe, masquée par une bande en dégradé qui glisse
 * (`mask-position`, `@keyframes pc-mark-glint`) — du CSS seul : aucun état,
 * aucun rendu React de plus, et `prefers-reduced-motion` la retire. `still`
 * ne la rend même pas : planches et captures générées côté serveur montrent
 * le signe immobile.
 *
 * Sous 20 px de côté (carte de moins de ~272 px), le contour du cadre se
 * bouche : une requête de conteneur bascule sur la variante pleine, la même
 * règle que `markParts()` applique au natif.
 */
import {
  MARK_HEX_SOLID_PATH,
  MARK_LETTER_G_PATH,
  MARK_LETTER_H_PATH,
  MARK_PARTS_OUTLINE,
  MARK_PARTS_SOLID,
  MARK_RING_PATH,
  MARK_VIEW_BOX,
} from "../lib/brand-mark";
import { BRAND_NAME } from "../lib/brand-name";
import { cardMarkInks } from "../skins/geometry";
import type { SkinSpec } from "../skins/spec";

/** Ce que l'éclat illumine : le signe entier, dans ses deux variantes. */
const GLINT_OUTLINE = [MARK_RING_PATH, MARK_LETTER_G_PATH, MARK_LETTER_H_PATH] as const;

export interface CardMarkProps {
  /** Skin résolu de la carte. */
  spec: SkinSpec;
  /** Signe immobile : exports statiques, planches, captures serveur. */
  still?: boolean;
}

export function CardMark({ spec, still = false }: CardMarkProps) {
  const inks = cardMarkInks(spec);
  return (
    <span className="pcard__mark" role="img" aria-label={BRAND_NAME}>
      <svg className="pcard__mark-art" viewBox={MARK_VIEW_BOX} aria-hidden focusable="false">
        <g className="pcard__mark-outline">
          {MARK_PARTS_OUTLINE.map((part) => (
            <path key={part.key} d={part.d} fill={inks[part.role]} />
          ))}
        </g>
        <g className="pcard__mark-solid">
          {MARK_PARTS_SOLID.map((part) => (
            <path key={part.key} d={part.d} fill={inks[part.role]} />
          ))}
        </g>
      </svg>
      {still ? null : (
        <svg className="pcard__mark-glint" viewBox={MARK_VIEW_BOX} aria-hidden focusable="false">
          <g className="pcard__mark-outline" fill={inks.glint}>
            {GLINT_OUTLINE.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          <g className="pcard__mark-solid" fill={inks.glint}>
            <path d={MARK_HEX_SOLID_PATH} />
          </g>
        </svg>
      )}
    </span>
  );
}
