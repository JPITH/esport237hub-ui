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
- `bun run typecheck` — runs `tsc -p tsconfig.web.json` (DOM) and `tsc -p tsconfig.native.json` (React Native)
- One-off tools: `bunx <tool>` (never `npx`/`pnpm dlx`)

## Hard rules

1. **Only `src/web/astryx.ts` may import `@astryxdesign/*`.** Everything else
   goes through wrappers. Astryx is v0.x and pinned exactly (0.1.7); bumps are
   deliberate, reviewed changes.
2. **Tokens are the single source of truth** (`src/tokens/index.ts`). Any new
   color/spacing/radius must be added there AND mirrored in
   `src/theme/theme.css` (as a `--e237-*` variable using `light-dark()`).
3. **Web/native parity**: a component added to `./web` should get a `./native`
   sibling with the same name and equivalent props, or a documented reason why not.
4. **Both modes always**: every visual change must work in light AND dark mode.
   Never hardcode a hex value in a component — use CSS variables (web) or
   `useE237Colors()` (native).
5. **No new runtime dependencies** without strong justification — this package
   must stay light for low-end Android devices (core product constraint).
6. UI copy in examples/docs is **French** (product language).

## Structure

```
src/tokens/    TS design tokens (no deps) — colors light/dark, spacing, radius, font
src/lib/       Helpers partagés (player-stats, duel-status, global-card)
src/theme/     esport237.ts + theme.css (--e237-*) + components.css (.btn, .pcard, .ui-*)
src/css/       global.css = Astryx reset + astryx.css + neutral + theme + components
src/web/       React DOM : foundation, Button riche, fields, FUT PlayerCard/GlobalCard,
               VenueCard, overlays, pickers, nav, table, primitives…
src/native/    React Native : core, fields, cards/skins, sheets, pickers, ScoreInput…
```

Peers optionnels : `lucide-react`, `lucide-react-native`, `react-native-reanimated`,
`@esport237hub/types`. Pas de `next` / `expo-router` dans le package.
