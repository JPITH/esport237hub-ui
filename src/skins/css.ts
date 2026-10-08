/**
 * Passerelle skin → variables CSS.
 *
 * Le FOND de la carte (liseré, surface, halos, rayures) est tracé en SVG des
 * deux côtés — voir `geometry.ts`. Il reste au CSS ce que le SVG ne fait pas :
 * le contenu (plaque jeu, badge, bandeau identité, stats, pied), qui a besoin
 * des couleurs du skin pour ses bordures et ses fonds translucides.
 *
 * Ces variables sont DÉRIVÉES du spec, jamais écrites à la main. C'est ce qui
 * corrige au passage un défaut du modèle précédent : les skins à motif
 * (champion, indomptable, 237 Héritage, Nuit de Douala) ne déclaraient pas
 * `--pc-bg2`/`--pc-bg3`, si bien que leur plaque jeu et leur bandeau identité
 * retombaient sur la palette OR par défaut sur le web.
 *
 * Les classes `.pcard--<skin>` n'existent plus : un skin est une donnée.
 */
import { cardLayoutCssVars, cardShape, shapeClipPath, type CardShapeName } from './geometry';
import { stopColor, type SkinSpec } from './spec';

/** Variables consommées par les règles `.pcard*` de `theme/components.css`. */
export type SkinCssVars = Record<string, string>;

/** Forme du bouclier au format CSS (découpe du balayage « foil »). */
const SHAPE = shapeClipPath();

/**
 * Gabarit du contenu, une fois par forme : la zone sûre d'une forme y replace
 * les blocs, et ses ancrages y posent la plaque jeu et le pied.
 */
const LAYOUTS = new Map<CardShapeName, Record<string, string>>();
function layoutVars(skin: SkinSpec): Record<string, string> {
  const name = cardShape(skin.shape).name;
  let vars = LAYOUTS.get(name);
  if (!vars) {
    vars = cardLayoutCssVars(name);
    LAYOUTS.set(name, vars);
  }
  return vars;
}

/** Variables d'un skin, prêtes à poser sur l'élément `.pcard`. */
export function skinCssVars(skin: SkinSpec): SkinCssVars {
  const vars: SkinCssVars = {
    /* Forme et gabarit : issus de la même géométrie que le tracé SVG et que
       les styles natifs — aucune valeur de position n'est écrite deux fois. */
    /* Hors bouclier, la bande court dans une boîte déjà inscrite dans la
       forme (`DrawSheen.left/boxWidth`) : rien à découper. */
    '--pc-shape': cardShape(skin.shape).clipUnit ? 'none' : SHAPE,
    ...layoutVars(skin),
    /* Texte et filets. */
    '--pc-ink': skin.ink,
    '--pc-line': skin.line,
    '--pc-accent': skin.accent,
    '--pc-border': skin.border,
    /* Cadre — du plus clair au plus sombre. */
    '--pc-frame-hi': stopColor(skin.frame, 0),
    '--pc-frame1': stopColor(skin.frame, 1),
    '--pc-frame2': stopColor(skin.frame, 2),
    /* Surface — haut, halo, bas. */
    '--pc-bg1': skin.radials[0]?.color ?? stopColor(skin.frame, 0),
    '--pc-bg2': stopColor(skin.surface, 0),
    '--pc-bg3': stopColor(skin.surface, 2),
  };
  if (skin.glow) {
    vars['--pc-glowc'] = skin.glow.color;
    vars['--pc-glow-period'] = `${skin.glow.periodMs}ms`;
  }
  return vars;
}

/** Sérialisation `--k: v;` — utile pour un `<style>` ou un test de rendu. */
export function skinCssText(skin: SkinSpec): string {
  return Object.entries(skinCssVars(skin))
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ');
}
