/**
 * Gerbe de confettis — la GÉOMÉTRIE, sans React Native : pure et testée
 * (`confetti-model.test.ts`, sous `bun test`, qui ne sait pas charger
 * `react-native`). `ConfettiBurst` (`./confetti.tsx`) n'en fait que le rendu.
 *
 * Venue de l'écran de révélation d'un duel (`apps/mobile`, 08/10/2026), qui
 * était l'une des DEUX implémentations de confettis de l'app : celle du Ludo
 * faisait la même chose autrement, et ignorait « réduire les animations ».
 *
 * `confettiAt` est un worklet : il est lu par le style animé de chaque éclat,
 * sur le fil UI.
 */

export interface ConfettiPiece {
  /** Vitesse de départ, en px pour la durée totale (x : ±, y : vers le haut < 0). */
  vx: number;
  vy: number;
  /** Rotation totale, en degrés. */
  spin: number;
  /** Taille du rectangle. */
  width: number;
  height: number;
  /** Indice de couleur dans la palette fournie par l'écran. */
  colorIndex: number;
  /** Retard de départ, en fraction de la durée. */
  delay: number;
}

/** Générateur pseudo-aléatoire déterministe : même graine, même gerbe. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Une gerbe LÉGÈRE : quelques dizaines d'éclats, partis d'un point, en éventail
 * vers le haut, puis retombant. Déterministe (graine) : les captures et les
 * tests voient la même gerbe, et rien ne tire au hasard pendant le rendu — un
 * tirage au rendu redistribuerait les éclats à chaque trame.
 */
export function confettiPieces(count: number, colors: number, seed = 237): ConfettiPiece[] {
  const rnd = mulberry32(seed);
  const pieces: ConfettiPiece[] = [];
  for (let i = 0; i < count; i += 1) {
    // Éventail de ±70° autour de la verticale.
    const angle = ((rnd() * 140 - 70) * Math.PI) / 180;
    const speed = 260 + rnd() * 220;
    pieces.push({
      vx: Math.sin(angle) * speed,
      vy: -Math.cos(angle) * speed,
      spin: (rnd() < 0.5 ? -1 : 1) * (180 + rnd() * 540),
      width: 6 + Math.round(rnd() * 4),
      height: 10 + Math.round(rnd() * 6),
      colorIndex: i % Math.max(1, colors),
      delay: rnd() * 0.12,
    });
  }
  return pieces;
}

/** Gravité de la retombée, en px pour la durée totale. */
export const CONFETTI_GRAVITY = 900;

/**
 * Position d'un éclat à l'instant `t` (0 → 1) : tir parabolique, puis fondu
 * sur le dernier tiers. Worklet : lu par le style animé de chaque éclat.
 */
export function confettiAt(
  p: Pick<ConfettiPiece, 'vx' | 'vy' | 'spin' | 'delay'>,
  t: number,
): { x: number; y: number; rotate: number; opacity: number } {
  'worklet';
  const local = Math.max(0, Math.min(1, (t - p.delay) / (1 - p.delay)));
  return {
    x: p.vx * local,
    y: p.vy * local + CONFETTI_GRAVITY * local * local,
    rotate: p.spin * local,
    opacity:
      local <= 0 || local >= 1 ? 0 : local < 0.66 ? 1 : Math.max(0, 1 - (local - 0.66) / 0.34),
  };
}

/**
 * La gerbe doit-elle partir ? Jamais sous « réduire les animations »
 * (DESIGN.md, « jamais en mouvement réduit »), jamais sans demande
 * (`fireKey` à 0). La règle vit ici, et non dans chaque écran : c'est
 * précisément l'écran du Ludo qui l'avait oubliée.
 */
export function shouldBurst(fireKey: number, reducedMotion: boolean): boolean {
  return fireKey > 0 && !reducedMotion;
}
