/**
 * Le garde-fou de la POLICE.
 *
 * POURQUOI CE FICHIER EXISTE
 * Constaté à l'appareil le 21/09/2026, sur un Galaxy A25 dont le propriétaire
 * a choisi une écriture manuscrite comme police système : sur l'écran
 * Portefeuille, « Mon wallet » et « Recharger » sortaient en police produit,
 * mais « Porte-monnaie » et « 0 FCFA » en écriture manuscrite. Les deux
 * fautifs venaient d'ici.
 *
 * La cause : un `<Text>` de react-native SANS `fontFamily` hérite de la police
 * du TÉLÉPHONE, pas de celle de l'application. Le design system rendait une
 * vingtaine de fichiers dans ce cas. Rien ne le voyait : ni le typecheck, qui
 * trouve le style parfaitement valide, ni l'appareil du développeur, qui garde
 * la police système par défaut et donne donc le bon résultat par accident.
 *
 * Corriger les vingt fichiers ne suffisait pas : sans porte, le vingt-et-unième
 * arrive dans six mois. D'où ces deux règles.
 *
 * POURQUOI UN TEST ET PAS UN SCRIPT DE LINT
 * La CI (`.github/workflows/ci.yml`) exécute `test` en BLOQUANT et `lint` en
 * `continue-on-error` — le temps que la dette de lint de l'API soit résorbée.
 * Une garde placée dans `lint` serait rapportée sans jamais rien arrêter. Et
 * `bun test src` tourne déjà : aucun outil à ajouter, aucune commande de plus à
 * penser à lancer. C'est le même choix que `tokens/contrast.test.ts`, qui garde
 * la palette de la même façon.
 *
 * `bun test src/native/text-family.test.ts` pour ne jouer que celui-ci.
 */
import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const NATIF = join(import.meta.dir);

/**
 * Les fichiers encore autorisés à rendre un `Text` de react-native.
 *
 * Ce ne sont PAS des exceptions tolérées par principe : chacun déclare déjà
 * `fontFamily` dans chacun de ses styles de texte, ils étaient donc corrects
 * avant cette garde et les réécrire en `Txt` aurait été un risque sans gain.
 * `player-card` porte en plus sa propre typographie mise à l'échelle
 * (`CARD_FONTS`, facteur `k`) que les variantes ne savent pas reproduire, et
 * `global-card` emprunte ses styles via `useCardStyles()`.
 *
 * CETTE LISTE NE DOIT QUE RÉTRÉCIR. On n'y ajoute pas un fichier pour faire
 * passer la garde : on écrit `<Txt>`.
 */
const TOLÉRÉS = new Set([
  'auth.tsx',
  'core.tsx',
  'dashboard.tsx',
  'fields.tsx',
  'global-card.tsx',
  'player-card.tsx',
  'stepper-form.tsx',
  // Définit `Txt` : c'est le seul `Text` qui a le droit d'exister.
  'text.tsx',
]);

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((entrée) => {
    const chemin = join(dir, entrée);
    if (statSync(chemin).isDirectory()) return sources(chemin);
    if (!/\.tsx?$/.test(chemin) || chemin.endsWith('.test.ts')) return [];
    return [chemin];
  });
}

const FICHIERS = sources(NATIF).map((chemin) => ({
  nom: relative(NATIF, chemin).split(sep).join('/'),
  contenu: readFileSync(chemin, 'utf8'),
}));

/**
 * Les noms importés depuis `react-native` par un fichier.
 *
 * On lit l'IMPORT et non les balises `<Text>` : une balise citée dans un
 * commentaire en prose (il y en a, dans `expo/settings-list.tsx`) ferait un
 * faux positif, et `StyleProp<TextStyle>` contient littéralement « <Text ».
 * L'import, lui, ne ment pas — et un import devenu inutile se fait attraper au
 * passage.
 */
function importésDeReactNative(source: string): string[] {
  const noms: string[] = [];
  const bloc = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]react-native['"]/g;
  for (const trouvé of source.matchAll(bloc)) {
    for (const brut of (trouvé[1] ?? '').split(',')) {
      const nom = brut.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0];
      if (nom) noms.push(nom);
    }
  }
  return noms;
}

describe('la police produit ne peut plus fuir', () => {
  it.each(FICHIERS.filter((f) => !TOLÉRÉS.has(f.nom)).map((f) => [f.nom, f.contenu] as const))(
    '%s rend son texte avec `Txt`, pas avec le `Text` de react-native',
    (nom, contenu) => {
      expect(
        importésDeReactNative(contenu),
        `${nom} importe « Text » de react-native. Sans \`fontFamily\`, ce texte ` +
          `prend la police du téléphone : utiliser \`<Txt variant="…">\` de ` +
          `./text, ou \`typeStyle(variant)\` si un \`Text\` est imposé.`,
      ).not.toContain('Text');
    },
  );

  /**
   * La seconde faute, documentée en tête de `text.tsx` : nos familles sont des
   * faces nommées (`Chivo_700Bold`). Poser un `fontWeight` à côté pousse
   * Android à synthétiser la graisse, et la police produit saute — le même
   * symptôme, par un autre chemin, que la garde ci-dessus ne verrait pas
   * puisque la famille est bien là.
   */
  it.each(FICHIERS.map((f) => [f.nom, f.contenu] as const))(
    '%s ne pose aucun `fontWeight` à côté d’une face nommée',
    (nom, contenu) => {
      const fautes = contenu
        .split('\n')
        .map((ligne, i) => [i + 1, ligne] as const)
        .filter(([, ligne]) => /(^|[^\w.])fontWeight\s*:/.test(ligne))
        // `fontWeight: 'normal'` ANNULE une graisse héritée au lieu d'en
        // demander une : c'est le remède, pas la faute (voir `player-card`).
        .filter(([, ligne]) => !/fontWeight\s*:\s*'normal'/.test(ligne))
        .map(([n, ligne]) => `${nom}:${n} — ${ligne.trim()}`);

      expect(
        fautes,
        'La graisse est dans le nom de la famille : choisir la variante `Txt` ' +
          'qui la porte (bodyMedium, bodyBold, label…) plutôt qu’un `fontWeight`.',
      ).toEqual([]);
    },
  );
});
