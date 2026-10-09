# AGENTS.md — @esport237hub/ui

Instructions for AI coding agents working in this repository.

## What this is

Design system for ESPORT 237 HUB (Cameroonian esports platform). Based on
Astryx (Meta's React + StyleX design system) with a custom `esport237` theme.
Consumed **as TypeScript source** (no build step) by a Next.js 16 dashboard,
an Astro 7 marketing site and an Expo mobile app, via the `esport237hub`
monorepo where this repo is mounted as a git submodule at `packages/ui`.

## Commands

- `bun install` — install deps (**Bun only** — npm/pnpm/yarn are not used; `npm` is not even on PATH on the owner's machine)
- `bun run typecheck` — runs TypeScript 7's `tsc` (alias package `typescript7`, via `scripts/tsc7.ts`) on `tsconfig.web.json` (DOM) and `tsconfig.native.json` (React Native). `typescript` 5.9 stays as the engine for tools that need the compiler's JS API.
- One-off tools: `bunx <tool>` (never `npx`/`pnpm dlx`)

## Before touching a colour — read this

The palette is a **four-layer system**, generated in OKLCH and guarded by a
test. Full documentation: [`DESIGN.md`](../../DESIGN.md) in the monorepo.
Parcours rules: [`UX.md`](../../UX.md).

```bash
bun test src/tokens     # 35 assertions — run after ANY token change
```

The short version, enough to avoid the four mistakes agents actually make here:

1. **Pick a rung, don't invent a shade.** Colours live as 50→950 ramps
   (`ramp.accent`, `ramp.success`, …). Which rung to use per mode is in the
   `ROLE` table: light uses **700** (text and fill) with **800** on hover;
   dark uses **400** with **500**. Never `filter: brightness()` — a filter
   moves the colour outside the system and guarantees no contrast.
2. **Dark mode is not light mode mirrored.** Background steps are ~0.025 of
   OKLCH lightness in light and ~**0.046** in dark — double. Two dark tones
   look far more alike than two light tones the same distance apart. The test
   fails if that ratio drops below 1.5.
3. **In dark mode, a raised surface is always lighter.**
   `bg` < `frame` < `surface` < `surfaceRaised`. No exception.
4. **The accent is interactive; it never states a status.** The brand lime
   belongs to buttons and active elements. `success` is a deliberately distant
   emerald (166° vs 136°) so "validated" cannot be mistaken for a button. The
   test fails if that gap drops below 20°.

Four backgrounds, two strokes, four text levels, per mode. Every text × surface
pair holds AA (4.5:1) — including on `frame`, the darkest light surface, which
is what forced ramp step 700 down to lightness 0.50.

## Hard rules

1. **Only `src/web/astryx.ts` may import `@astryxdesign/*`.** Everything else
   goes through wrappers. Astryx is v0.x and pinned exactly (0.1.7); bumps are
   deliberate, reviewed changes.
2. **Tokens are the single source of truth** (`src/tokens/index.ts`). Any new
   color/spacing/radius must be added there AND mirrored in
   `src/theme/theme.css` (as a `--e237-*` variable using `light-dark()`).
   Generate values with `oklch.ts` (`buildRamp`, `buildSpectrum`,
   `tintNeutral`) rather than picking them by eye.
3. **Web/native parity**: a component added to `./web` should get a `./native`
   sibling with the same name and equivalent props, or a documented reason why not.
   The tone vocabulary is shared — `lib/tone.ts`, one union for both platforms.
4. **Both modes always**: every visual change must work in light AND dark mode.
   Never hardcode a hex value in a component — use CSS variables (web) or
   `useE237Colors()` (native).
5. **Depth comes from the stroke, not a shadow.** A card is defined by its
   border. The neumorphism recipes are neutralised (`--e237-neu-*` resolve to
   `none`): a soft halo under every surface washed the page out instead of
   structuring it. Shadows survive only where something genuinely floats —
   `--e237-shadow-pop` for menus and popovers, `--e237-shadow-modal` for
   modals. No ad-hoc `boxShadow`.
6. **This stylesheet is NOT in an `@layer`, so it beats Tailwind `utilities`.**
   A Tailwind utility placed on a DS-classed element in an app is silently
   ignored. Responsive behaviour of DS components belongs in this package's
   CSS, with media queries — not in `hidden xl:flex` on the app side. This is
   what let the 336 px context rail crush the main column on phones.
7. **No new runtime dependencies** without strong justification — this package
   must stay light for low-end Android devices (core product constraint).
8. **An image that can be missing needs a fallback.** `gameIconUrl()` /
   `gameHeroUrl()` return `undefined` when no asset ships, and components then
   render initials. Fabricating a plausible-looking URL rendered broken icons
   for three disciplines out of five.
9. UI copy in examples/docs is **French** (product language).
10. **The brand mark lives in `src/lib/brand-mark.ts`, and only there.** The
    hexagon + « G/H » monogram (planche « inspiration #1 », variant 02) is a
    handful of literal SVG path strings. `src/web/mark.tsx` and
    `src/native/mark.tsx` only choose the ink; the monorepo's
    `scripts/brand-icons.py` re-reads the SAME strings by regex to rasterise
    every store icon and favicon. So: one constant per path, one single-quoted
    literal, never a template or a concatenation — and after any change to the
    shape, run `bun run brand:icons` in the monorepo and commit the PNGs.
    On the player card (lot M3, 09/10/2026) the watermark
    (`buildSkinDraw().watermark`) and the animated footer mark (`CardMark`,
    web + native, where the « G-HUB » pill used to be) paint these SAME paths;
    their inks come from the skin (`watermarkInk`, `cardMarkInks`), the glint
    timing from `CARD_MARK_GLINT` in `lib/brand-motion.ts`. Readability is
    guarded per skin × shape by `src/skins/card-mark.test.ts`.

## Avant de créer un composant : chercher dans le DS, étendre plutôt que dupliquer

Retour du porteur (08/10/2026, back-office Analytics) : « il faut réutiliser
les composants, même dans le back-office ». Le panel avait recréé ses onglets
soulignés, son sélecteur de période, ses tuiles de KPI… alors que tout
existait ici. La règle, pour les applications comme pour ce dépôt :

1. **Chercher d'abord** : `src/web/index.tsx` et `src/native/index.tsx`
   listent tout ce qui est exporté. Un `<button>` stylé à la main, une
   pastille `rounded-full border px-2 text-xs`, un intitulé
   `uppercase tracking-wider` sont presque toujours un composant existant.
2. **Si une variante manque, étendre** le composant du DS : prop optionnelle,
   rétrocompatible, web ET natif (parité), CSS dans ce dépôt. Jamais de copie
   locale, jamais de surcharge `!px-…` (la feuille du DS, hors `@layer`, bat
   Tailwind de toute façon — règle 6).
3. Un composite d'application (ex. `KpiTile` du panel) reste permis s'il ne
   fait qu'**assembler** des composants du DS avec une logique métier.

Quel composant pour quel besoin :

| Besoin | Web | Natif |
|---|---|---|
| Changer de VUE dans la page (contenu remplacé) | `Tabs` (pilule glissante, `role="tablist"`) ; `fill` pour 2-3 onglets pleine largeur | `SegmentedTabs` |
| Changer de ROUTE (sous-pages d'une section) | `Tabs` avec `href` sur chaque onglet + `linkAs={Link}` (`aria-current="page"`) | — (navigation de l'app) |
| FILTRER une liste (cumulable, relâchable, compteur) | `FilterChip` (`aria-pressed`) | `FilterChip` |
| Choisir UNE option parmi peu (période 7/30/90 j, mode, ville) | `RadioGroup variant="inline"` (puces, `role="radio"`) | `RadioGroup variant="inline"` |
| Choisir UNE option qui mérite une explication | `RadioGroup` (cartes : `hint`, `icon`, `badge`, `trailing`) ; `TierPicker` pour des billets | `RadioGroup`, `TierPicker` |
| Activer / désactiver un réglage (effet immédiat) | `Switch` | `SwitchRow` (`./native/expo`) |
| Cocher (formulaire, consentement) | `Checkbox` | `Checkbox` |
| Chiffre clé / tuile de KPI | `Card` + `Stat` (`aside` pour une mini-courbe, enfants pour variation et précision) | `Stat`, `StatTile` |
| Statut | `Badge tone=…` (`size="sm"` en case dense), `DuelStatusBadge`, `OrderStatusBadge` | idem |
| Étiquette neutre (jeu, catégorie, « 2 jeux ») | `Badge tone="neutral"` | `Badge` |
| Pastille posée SUR une image | `Badge variant="on-media"` (la seule translucide) | — |
| Titre de bloc + compteur + actions sur la rangée | `SectionHeader` (`count`, `actions`) | `SectionHeader` |
| Intertitre DANS une carte | `SectionLabel tone="muted"` (`gold` palmarès) | `SectionLabel`, `SectionTitle` |
| Page entière (conteneur, colonne latérale, trois zones) | `PageLayout` (`header`, `alerts`, `aside`, `start`, `width`) | `Screen` |
| En-tête de page (titre + actions, UNE rangée) | `PageHeader` (`back`, `actions`, `more`, `subtitle`, `meta`) | `TopBar` |
| Alerte en haut de page, fermable | `AlertBanner` dans `PageAlerts` | `Notice` |
| Profil et réglages (navigation + section) | `SettingsLayout`, `SettingsSection`, `SettingsRow` | `SettingsList` (`./native/expo`) |
| Liste à chevrons (raccourcis, sections) | `NavGroup` + `NavItem` | `NavGroup` + `NavItem` |
| Vide, erreur, chargement | `EmptyState`, `ErrorNote` / `Notice`, `Skeleton` / `Spinner` | idem |
| Tableau, pagination | `Table`, `Pagination` | `ListRow` |
| Boutons | `Button` (`ghost` pour une action secondaire), `ButtonLink` (un lien du routeur qui a l'air d'un bouton), `LinkButton` (`<a>`, ou `as`), `IconButton` | `Button`, `IconButton`, `PillButton` |
| Champs | `Input`, `Select` (prop `label`), `SearchField`, `NumberInput`, `DatePicker` | `Field`, `SelectSheet`, `DateField` |
| Fenêtres | `Modal`, `Drawer`, `DropdownMenu`, `Tooltip` | `Sheet`, `SelectSheet` |
| Personnes | `Avatar`, `AvatarGroup`, `PlayerCell` | `Avatar`, `ProfileAvatar` |
| Barre d'onglets, carrousel, confettis | — | `FloatingTabBar`, `Carousel` / `PromoSlideCard`, `ConfettiBurst` |
| Défiler (écran, liste, feuille) | rien : `theme/scrollbar.css` peint toute barre en vert ; jamais de règle de barre par composant | `ScrollView`, `FlatList` (curseur vert dessiné ; jamais ceux de `react-native` à la verticale), `useScrollIndicator` + `ScrollIndicator` pour une autre vue |

## Briques de page du web (lot R, 09/10/2026)

Demande du porteur : « là où il y a le titre les actions doivent être sur la
mm row, ce sont seulement les alerts qui doivent s'afficher en haut avec une
croix ; bcp d'espace vide à combler » puis « toutes les pages n'ont pas la
même min width, souvent les pills / chips sont translucides, souvent pas ».
`src/web/page-layout.tsx` et `src/web/settings-layout.tsx` ; documentation
complète (props, exemples, références Mobbin) : `docs/refonte-web-briques.md`
du monorepo.

1. **Un seul conteneur de page : `PageLayout`.** Deux largeurs, pas une de
   plus : `default` (1 600 px au plus) et `full` (consoles, plateaux). Les
   gouttières viennent du cadre de l'app (16 px). `PageContainer` est
   DÉPRÉCIÉ : il rend désormais le même conteneur, quelle que soit la largeur
   demandée (`wide`/`detail`/`readable` n'existent plus à l'écran).
2. **Une seule colonne latérale** : `aside` de `PageLayout` (340 px, à droite,
   à partir de 1 280 px ; dessous avant ; `stickyAside` par défaut) et
   `start` (zone gauche à partir de 1 440 px — trois zones). Pas d'autre
   seuil, pas d'autre largeur de colonne.
3. **`PageHeader` = une rangée.** Retour à GAUCHE du titre (`back`), méta sous
   le titre (`subtitle`), action principale à droite (`actions`), secondaires
   dans `more` (boutons discrets au large, menu « … » sous 640 px). Le titre
   se tronque, les actions ne tombent jamais dessous. `section` (surtitre)
   est accepté mais n'est PLUS affiché.
4. **Seules les alertes au-dessus du contenu** : `AlertBanner({ id, tone,
   title, body?, action?, dismissible? })` dans `PageAlerts` (ou la prop
   `alerts` de `PageLayout`). La croix est mémorisée par identifiant ET par
   contenu (`lib/alert-dismissal.ts`, `localStorage` sous try/catch) : un
   autre montant, un autre compte fait revenir l'alerte. `danger` →
   `role="alert"`, les autres `role="status"` ; fermer passe le focus à la
   croix voisine, sinon au titre. Un encart PERMANENT n'est pas une alerte :
   il va dans sa section (`Notice`) ou disparaît.
5. **Un seul système de pastilles, toutes OPAQUES** : statut `Badge tone`
   (fond `--e237-<ton>-subtle`, liseré `--e237-<ton>-border`), étiquette
   `Badge tone="neutral"`, filtre `FilterChip` (sélection = accent subtle),
   sur une image `Badge variant="on-media"` (voile `--e237-media-scrim`, la
   seule translucide). `Notice` et `ErrorNote` utilisent la même recette que
   `Badge` (plus de `bg-x/10 border-x/40`). Côté app : `bg-<ton>-subtle`,
   `border-<ton>-border`, jamais `bg-<ton>/10`.
6. **Une hauteur de contrôle** : puce (`.chip`), choix (`RadioGroup inline`)
   et bouton `sm` font 34 px.
7. **En creux dans une carte : `--e237-surface-sunken`** (`bg-sunken`) — tuile
   de chiffre, piste de jauge, vignette vide. `--e237-surface-raised` vaut le
   blanc de la carte en clair : il est réservé à ce qui FLOTTE (menus,
   modales).
8. **Les liens du routeur** : l'application pose une fois
   `<DsLinkProvider component={Link}>` ; `ButtonLink`, le retour de
   `PageHeader`, ses actions « … », `SettingsLayout` et `NavItem` naviguent
   alors sans recharger.

Parité native : `PageHeader`, `PageLayout`, `PageAlerts`, `AlertBanner` et
`SettingsLayout` n'ont pas de jumeau natif — c'est le chrome de PAGE du web
(le mobile a `Screen`, `TopBar`, `Notice`, `SettingsList`). `NavGroup` /
`NavItem` ont le même nom et les mêmes props que le natif
(`tint` → `tone`, `onPress` → `href` / `onClick`).

## Structure

```
src/tokens/    TS design tokens (no deps) — colors light/dark, spacing, radius, font
src/lib/       Helpers partagés (player-stats, duel-status, global-card)
src/theme/     esport237.ts + theme.css (--e237-*) + components.css (.btn, .pcard, .ui-*)
src/css/       global.css = Astryx reset + astryx.css + neutral + theme + components
src/web/       React DOM : foundation, Button riche, fields, FUT PlayerCard/GlobalCard,
               VenueCard, overlays, pickers, nav, table, primitives…
src/native/    React Native : core, fields, cards/skins, sheets, pickers, ScoreInput…
src/icons/     Jeu d'icônes G-HUB : svg/ (sources), generated/ (NE PAS ÉDITER), README.md
```

Icônes : `<Icon name=…>` du jeu maison (`src/icons/README.md`), seul jeu
d'icônes du DS sur les deux plateformes (Lucide est retiré) ; après toute
retouche d'un SVG, `bun run icons` puis `bun run icons:check`.

Peers optionnels : `react-native-reanimated`,
`react-native-gesture-handler`, `@expo/ui`, `@esport237hub/types`. Pas de `next` /
`expo-router` dans le package.

## Expo UI vs RN (native)

- **`@esport237hub/ui/native`** — RN + tokens E237 (marque) : `Button`, `Card`,
  `GradientButton`, `PlayerCard`, `FloatingTabBar`, auth chrome, etc. Zéro import Expo.
- **`@esport237hub/ui/native/expo`** — bridge `@expo/ui` (SwiftUI / Compose / web)
  pour les **contrôles** : `Sheet`, `SelectSheet`, `DateField`/`TimeField`,
  `SwitchRow`, `SettingsList`. Même API de props que les équivalents RN quand
  ils existent → swap = changer la ligne d'import.
- Ne jamais importer `@expo/ui` depuis le barrel `./native` (garde le package
  light et optionnel).
