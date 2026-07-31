/**
 * Neumorphisme native — miroir de `--e237-neu-*` (theme.css).
 *
 * Toute surface en relief compose ces recettes ; pas d'ombre ad hoc
 * dans les composants (DESIGN.md).
 */
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

export type NeuMode = 'light' | 'dark';

/**
 * Une recette neu n'est qu'une `boxShadow` : ce type minimal reste
 * assignable aussi bien à `ViewStyle` qu'à `TextStyle` (champs de saisie).
 */
export type NeuStyle = { boxShadow: string };

export type NeuShadows = {
  /** Cartes, panneaux — edge + raised. */
  card: NeuStyle;
  /** Relief fort (panneaux). */
  raised: NeuStyle;
  /** Relief atténué (boutons secondaires, pilules). */
  raisedSm: NeuStyle;
  /** Creux fort (état actif). */
  pressed: NeuStyle;
  /** Creux atténué (champs). */
  pressedSm: NeuStyle;
  /** CTA primary — liseré + glow accent (comme `.btn--primary`). */
  primaryGlow: (accent: string) => NeuStyle;
};

function hi(mode: NeuMode) {
  return mode === 'light'
    ? 'rgb(255 255 255 / 0.92)'
    : 'rgb(255 255 255 / 0.05)';
}

function lo(mode: NeuMode) {
  return mode === 'light' ? 'rgb(15 23 42 / 0.13)' : 'rgb(0 0 0 / 0.6)';
}

function edge(mode: NeuMode) {
  return mode === 'light'
    ? 'rgb(255 255 255 / 0.7)'
    : 'rgb(255 255 255 / 0.06)';
}

function shadow(boxShadow: string): NeuStyle {
  return { boxShadow };
}

/** Recettes neu pour un mode donné (alignées sur theme.css). */
export function createNeu(mode: NeuMode): NeuShadows {
  const h = hi(mode);
  const l = lo(mode);
  const raised = `-5px -5px 14px ${h}, 7px 7px 20px ${l}`;
  const raisedSm = `-2px -2px 6px ${h}, 3px 4px 10px ${l}`;
  const pressed = `inset 3px 3px 8px ${l}, inset -3px -3px 8px ${h}`;
  const pressedSm = `inset 2px 2px 5px ${l}, inset -1px -1px 3px ${h}`;
  const edgeInset = `inset 0 1px 0 ${edge(mode)}`;

  return {
    card: shadow(`${edgeInset}, ${raised}`),
    raised: shadow(raised),
    raisedSm: shadow(raisedSm),
    pressed: shadow(pressed),
    pressedSm: shadow(pressedSm),
    primaryGlow: (accent: string) =>
      shadow(
        `0 1px 0 color-mix(in srgb, #fff 25%, transparent) inset, 0 6px 18px -8px color-mix(in srgb, ${accent} 70%, transparent)`,
      ),
  };
}

/** Hook — recettes neu selon le schéma clair/sombre. */
export function useNeu(): NeuShadows {
  const scheme = useColorScheme();
  const mode: NeuMode = scheme === 'light' ? 'light' : 'dark';
  return useMemo(() => createNeu(mode), [mode]);
}
