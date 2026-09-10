/**
 * Vignettes de disciplines côté natif.
 *
 * `lib/catalog.gameIconUrl()` rend un CHEMIN WEB (`/media/game-fc27.png`). Sur
 * le web c'est une URL servie par `apps/web/public` ; en natif ce n'est rien du
 * tout : `<Image source={{ uri: '/media/…' }}>` échoue, et les cartes du fil
 * affichaient l'icône « image cassée » à la place de la vignette du jeu — celle
 * que le code appelle lui-même « l'identité de la carte, pas un ornement ».
 *
 * Les visuels pèsent ~1 Mo pièce et vivent déjà dans le bundle de l'app
 * (`apps/mobile/assets/media/`) : les dupliquer ici alourdirait le design
 * system pour rien. L'app enregistre donc ses `require()` au démarrage, et le
 * design system se contente de les redemander.
 */
import type { ImageSourcePropType } from 'react-native';

type Resolver = (slug: string) => ImageSourcePropType | undefined;

let resolver: Resolver | null = null;

/** À appeler une fois au démarrage de l'app (voir `apps/mobile/src/app/_layout.tsx`). */
export function setGameIconResolver(next: Resolver | null): void {
  resolver = next;
}

/**
 * Source d'image locale de la discipline, ou `undefined` si l'app n'en fournit
 * pas — les composants savent alors afficher leur repli, à condition qu'on ne
 * leur mente pas sur l'existence du visuel.
 */
export function gameIconSource(slug: string | null | undefined): ImageSourcePropType | undefined {
  if (!slug || !resolver) return undefined;
  return resolver(slug);
}
