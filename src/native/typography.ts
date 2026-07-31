/**
 * Familles chargées par l'app mobile (expo-font) — miroir web :
 * display = Space Grotesk, corps = Chivo (globals.css bannit Inter).
 */
export const fontFamily = {
  body: 'Chivo_400Regular',
  bodyMedium: 'Chivo_500Medium',
  /** Graisses intermédiaires : servent au `Text` de l'app, qui traduit un
   *  `fontWeight` en famille (la graisse est dans le nom du fichier). */
  bodySemi: 'Chivo_600SemiBold',
  bodyBold: 'Chivo_700Bold',
  bodyExtraBold: 'Chivo_800ExtraBold',
  bodyBlack: 'Chivo_900Black',
  display: 'SpaceGrotesk_700Bold',
  displaySemi: 'SpaceGrotesk_600SemiBold',
  displayMedium: 'SpaceGrotesk_500Medium',
  displayRegular: 'SpaceGrotesk_400Regular',
} as const;
