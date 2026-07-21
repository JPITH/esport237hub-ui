# AGENTS.md — @esport237hub/ui

Instructions for AI coding agents working in this repository.

## What this is

Design system for ESPORT 237 HUB (Cameroonian esports platform). Based on
Astryx (Meta's React + StyleX design system) with a custom `esport237` theme.
Consumed **as TypeScript source** (no build step) by a Next.js 16 dashboard,
an Astro 7 marketing site and an Expo mobile app, via the `esport237hub`
monorepo where this repo is mounted as a git submodule at `packages/ui`.

## Commands

- `pnpm install` — install deps (pnpm only; `npm` is NOT on PATH on the owner's machine)
- `pnpm typecheck` — runs `tsc -p tsconfig.web.json` (DOM) and `tsc -p tsconfig.native.json` (React Native)

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
src/theme/     esport237.ts (Astryx defineTheme) + theme.css (--e237-* vars, .e237-* classes)
src/css/       global.css = Astryx reset + astryx.css + neutral theme + our theme
src/web/       React DOM components (Button, Card, Badge, Stat, SectionLabel, PlayerCard) + astryx.ts re-exports
src/native/    React Native equivalents + useE237Colors()
```
