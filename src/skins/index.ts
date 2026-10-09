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
  contrastRatio,
  identityBand,
  IDENTITY_BAND_ALPHA,
  DIVISION_CHIP_BACKGROUND,
  surfaceColorAt,
  neutralOf,
  watermarkInk,
  markInksOn,
  WATERMARK_VISIBILITY,
  WATERMARK_OPACITY_RANGE,
  MARK_MIN_CONTRAST,
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
  WatermarkInk,
  CardMarkInks,
} from './spec';

export {
  CARD_BASE_WIDTH,
  CARD_REF_HEIGHT,
  CARD_ASPECT,
  CARD_INSET,
  CARD_SHAPE,
  CARD_LAYOUT,
  CARD_BACK_LAYOUT,
  FLAG_RADIUS,
  cardLayoutCssVars,
  pct,
  cardScale,
  cardHeight,
  shapePoints,
  shapeClipPath,
  buildSkinDraw,
  skinAnimated,
  CARD_SHAPE_NAMES,
  DEFAULT_CARD_SHAPE,
  isCardShapeName,
  cardShape,
  cardShapes,
  CARD_WATERMARK,
  WATERMARK_GAP,
  WATERMARK_LETTER_G_OPACITY,
  CARD_MARK_SIZE,
  cardMarkInks,
  watermarkRing,
  cardTextProbes,
  TEXT_BLOCK_HEIGHTS,
} from './geometry';
export type {
  CardShapeName,
  CardShapeGeometry,
  CardLayout,
  CardBackLayout,
  ShapeBox,
  SkinDraw,
  DrawStop,
  DrawLinear,
  DrawRadial,
  DrawLine,
  DrawSheen,
  DrawWatermark,
} from './geometry';

export { skinCssVars, skinCssText } from './css';
export type { SkinCssVars } from './css';
