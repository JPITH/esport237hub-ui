/**
 * Une animation en boucle n'anime sa vue qu'une fois cette vue MONTÉE.
 *
 * Diagnostic du 14/10/2026 (émulateur EAS, « G-HUB ne répond pas » sur la
 * Boutique) : une boucle démarrée dans le `useEffect` du montage pousse ses
 * styles avant qu'Android ait créé la vue native. Reanimated (Android) échoue
 * alors à chaque image — « synchronouslyUpdateUIProps failed … Unable to find
 * SurfaceMountingManager » — et écrit chaque fois une pile Java complète dans
 * le journal, SUR LE FIL PRINCIPAL. Quatorze reflets de cartes ont produit
 * cinq millions de lignes en vingt secondes : le fil principal, occupé à
 * journaliser, ne montait plus les vues, et les échecs continuaient. ANR.
 *
 * La garde : un drapeau partagé, faux tant que la vue n'a pas reçu son
 * `onLayout` (plus une courte marge, le temps que la transaction de montage
 * passe). Le style animé rend une valeur FIXE tant qu'il est faux — identique
 * d'une image à l'autre, donc rien n'est poussé à la vue — puis suit
 * l'horloge. Au démontage, le drapeau retombe : la boucle cesse de viser une
 * vue qui s'en va.
 */
import { useCallback, useEffect, useRef } from 'react';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

/** Marge après `onLayout` : une image ou deux, invisible sur un reflet décoratif. */
const SETTLE_MS = 120;

export function useMountedGate(): { ready: SharedValue<boolean>; onLayout: () => void } {
  const ready = useSharedValue(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onLayout = useCallback(() => {
    if (timer.current || ready.value) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      ready.value = true;
    }, SETTLE_MS);
  }, [ready]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      ready.value = false;
    },
    [ready],
  );

  return { ready, onLayout };
}
