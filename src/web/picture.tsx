import type { ImgHTMLAttributes } from 'react';

export interface PictureProps extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Chemin du visuel d'origine, tel qu'il vit dans `public/`
   * (ex. `/brand/auth-bg.png`). Les variantes `.avif` et `.webp` sont
   * déduites — elles sont produites par `bun run scripts/optimize-images.ts`.
   */
  src: string;
  /** Obligatoire : une image décorative prend `alt=""`, jamais rien. */
  alt: string;
}

/**
 * Image locale servie en AVIF, puis WebP, puis le format d'origine.
 *
 * Pourquoi ce composant plutôt que `next/image` : les visuels concernés vivent
 * dans `public/` et sont partagés par le dashboard Next ET le site vitrine
 * Astro. `next/image` ne sert que le premier. Un `<picture>` fonctionne
 * partout, sans configuration de domaines ni serveur d'optimisation.
 *
 * Ce que ça change, mesuré le 16/08/2026 sur les 39 visuels de `public/` :
 * **41,6 Mo → 1,7 Mo en AVIF, soit −96 %**. Le repli affiché derrière chaque
 * carte joueur passait de 1817 Ko à 53 Ko ; le fond de l'écran de connexion —
 * le premier écran d'un visiteur — de 1740 Ko à 40 Ko. Sur un produit qui
 * vise les smartphones d'entrée de gamme et une bande passante contrainte
 * (cahier §13), c'est le geste au meilleur rapport effort / gain.
 *
 * Le fichier d'origine reste en dernier `<img src>` : un navigateur qui ne lit
 * ni AVIF ni WebP affiche toujours quelque chose.
 */

/**
 * Vrai uniquement pour un fichier de `public/` qu'on a nous-mêmes décliné.
 *
 * Les deux conditions comptent autant l'une que l'autre :
 *
 *   • **chemin local** — `/media/x.png`, pas `https://…/x.png` ni `//cdn/x.png`.
 *     C'est le point important, et il est contre-intuitif : `<picture>` NE se
 *     rabat PAS quand une `<source>` renvoie 404. Le navigateur choisit la
 *     première source dont il sait décoder le type, puis s'y tient — un AVIF
 *     manquant donne une image cassée, pas le PNG d'origine. Décliner une URL
 *     de stockage Supabase parce qu'elle finit en `.png` casserait donc
 *     l'avatar de tout le monde, sans erreur visible côté serveur.
 *
 *   • **extension convertie** — le script ne produit d'AVIF/WebP que pour PNG
 *     et JPEG. Un SVG ou un GIF n'a pas de variante.
 */
export function hasLocalVariants(src: string): boolean {
  return src.startsWith('/') && !src.startsWith('//') && /\.(png|jpe?g)$/i.test(src);
}

export function Picture({ src, alt, ...rest }: PictureProps) {
  if (!hasLocalVariants(src)) return <img src={src} alt={alt} {...rest} />;
  const stem = src.replace(/\.(png|jpe?g)$/i, '');

  return (
    /*
     * `display: contents` fait DISPARAÎTRE le <picture> de la mise en page :
     * le <img> devient, pour la disposition, un enfant direct du parent.
     *
     * Sans ça, remplacer un <img> par un <picture> casse tous les appelants qui
     * comptent sur la relation parent → image : `size-full object-cover` dans
     * une carte de salle, un `aspect-ratio` porté par le conteneur, un
     * positionnement absolu. Le <picture> étant `inline` par défaut, la hauteur
     * en pourcentage n'a soudain plus de référence.
     *
     * Le style est inline volontairement, pas dans components.css : cette
     * feuille n'est pas dans un `@layer` et bat donc les utilitaires Tailwind
     * des applications — un piège dans lequel ce dépôt est déjà tombé deux fois.
     */
    <picture style={{ display: 'contents' }}>
      <source srcSet={`${stem}.avif`} type="image/avif" />
      <source srcSet={`${stem}.webp`} type="image/webp" />
      <img src={src} alt={alt} {...rest} />
    </picture>
  );
}

/**
 * Équivalent de `Picture` pour un `background-image`.
 *
 * Un `<picture>` ne sert que les images de contenu. Le héros du dashboard, lui,
 * affiche son visuel en `background-image` — pour le cadrage `cover` et le
 * dégradé superposé — et échappait donc entièrement à l'AVIF : l'image la plus
 * lourde de l'écran d'accueil était aussi la seule restée en PNG.
 *
 * `image-set()` est le pendant CSS de `<source type>` : le navigateur retient la
 * première entrée dont il sait décoder le type. Même limite que `<picture>`,
 * donc même garde-fou — `hasLocalVariants` décide, et une URL distante ressort
 * en simple `url()`.
 *
 * @returns une valeur prête pour `style={{ backgroundImage: … }}`.
 */
export function localImageSet(src: string): string {
  if (!hasLocalVariants(src)) return `url(${JSON.stringify(src)})`;
  const stem = src.replace(/\.(png|jpe?g)$/i, '');
  const original = /\.png$/i.test(src) ? 'image/png' : 'image/jpeg';
  return [
    'image-set(',
    [
      `url("${stem}.avif") type("image/avif")`,
      `url("${stem}.webp") type("image/webp")`,
      `url(${JSON.stringify(src)}) type("${original}")`,
    ].join(', '),
    ')',
  ].join('');
}
