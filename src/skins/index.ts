/**
 * `@esport237hub/ui/skins` — design des cartes joueur, sans dépendance.
 *
 * Point d'entrée utilisable partout (Next.js, Expo, Node) : ni React ni DOM ni
 * React Native. Un skin est une DONNÉE (`SkinSpec`) ; la géométrie de la carte
 * est calculée ici ; seuls les rendus SVG vivent dans `./web` et `./native`.
 *
 * Créer un skin dans le dashboard = écrire un `SkinSpec` en base. Aucun code à
 * ajouter pour qu'il s'affiche sur web, iOS et Android.
 */
export {
  SKIN_SPEC_VERSION,
  SKIN_STRIPE_PATTERNS,
  BUILTIN_SKINS,
  BUILTIN_SKIN_KEYS,
  DEFAULT_SKIN_KEY,
  GLOBAL_SKIN_KEY,
  isBuiltinSkinKey,
  frameLinear,
  surfaceLinear,
  stopColor,
  stripes,
  sheen,
  glow,
  skinFromSeed,
  seedFromSkin,
  isLegacyDesign,
  skinFromLegacyDesign,
  parseSkinSpec,
  resolveSkin,
  parseColor,
  mixColor,
  withAlpha,
  lighten,
  darken,
  luminance,
  readableInk,
} from './spec';
export type {
  SkinSpec,
  SkinSeed,
  SkinStop,
  SkinLinear,
  SkinRadial,
  SkinStripes,
  SkinStripePattern,
  SkinSheen,
  SkinGlow,
  BuiltinSkinKey,
} from './spec';

export {
  CARD_BASE_WIDTH,
  CARD_REF_HEIGHT,
  CARD_ASPECT,
  CARD_INSET,
  CARD_SHAPE,
  CARD_LAYOUT,
  FLAG_RADIUS,
  cardLayoutCssVars,
  pct,
  cardScale,
  cardHeight,
  shapePoints,
  shapeClipPath,
  buildSkinDraw,
  skinAnimated,
} from './geometry';
export type {
  SkinDraw,
  DrawStop,
  DrawLinear,
  DrawRadial,
  DrawLine,
  DrawSheen,
} from './geometry';

export { skinCssVars, skinCssText } from './css';
export type { SkinCssVars } from './css';
