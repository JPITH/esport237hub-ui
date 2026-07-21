/**
 * Thème Astryx « esport237 ».
 *
 * Généré via l'API documentée `defineTheme` d'Astryx (Meta) :
 * https://astryx.atmeta.com/docs/theme
 *
 * Les tuples [light, dark] alimentent la bascule automatique de mode
 * (CSS light-dark()). Pour un build de production SSR :
 *   bunx astryx theme build src/theme/esport237.ts
 * (produit esport237.css / .js / .d.ts — voir la doc « Runtime vs Built »).
 */
import { defineTheme } from '@astryxdesign/core/theme';

import { color, font, radius } from '../tokens';

export const esport237 = defineTheme({
  name: 'esport237',
  color: {
    accent: color.dark.accent,
    neutralStyle: 'cool',
  },
  typography: {
    scale: { base: 15, ratio: 1.2 },
    body: {
      family: 'Inter',
      fallbacks: "-apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    },
  },
  radius: { base: radius.sm, multiplier: 1.4 },
  motion: { fast: 150, medium: 320, ratio: 0.75 },
  tokens: {
    '--color-accent': [color.light.accent, color.dark.accent],
    '--color-background-surface': [color.light.surface, color.dark.surface],
    '--color-text-primary': [color.light.textPrimary, color.dark.textPrimary],
    '--font-family-body': font.family.body,
  },
});

export default esport237;
