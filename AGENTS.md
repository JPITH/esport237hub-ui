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
| Intitulé de section / de bloc | `SectionLabel` (`tone="muted"` dans une carte, `gold` palmarès) | `SectionLabel`, `SectionTitle`, `SectionHeader` |
| En-tête de page | `PageHeader` (+ `PageContainer`) | `TopBar`, `Screen` |
| Vide, erreur, chargement | `EmptyState`, `ErrorNote` / `Notice`, `Skeleton` / `Spinner` | idem |
| Tableau, pagination | `Table`, `Pagination` | `ListRow` |
| Boutons | `Button` (`ghost` pour une action secondaire), `LinkButton`, `IconButton` | `Button`, `IconButton`, `PillButton` |
| Champs | `Input`, `Select` (prop `label`), `SearchField`, `NumberInput`, `DatePicker` | `Field`, `SelectSheet`, `DateField` |
| Fenêtres | `Modal`, `Drawer`, `DropdownMenu`, `Tooltip` | `Sheet`, `SelectSheet` |
| Personnes | `Avatar`, `AvatarGroup`, `PlayerCell` | `Avatar`, `ProfileAvatar` |
| Barre d'onglets, carrousel, confettis | — | `FloatingTabBar`, `Carousel` / `PromoSlideCard`, `ConfettiBurst` |
| Défiler (écran, liste, feuille) | rien : `theme/scrollbar.css` peint toute barre en vert ; jamais de règle de barre par composant | `ScrollView`, `FlatList` (curseur vert dessiné ; jamais ceux de `react-native` à la verticale), `useScrollIndicator` + `ScrollIndicator` pour une autre vue |

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
