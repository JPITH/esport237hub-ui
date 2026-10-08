# Icônes G-HUB

Le jeu d'icônes maison de G-HUB : 108 pictogrammes SVG dessinés à la main dans
la direction artistique du produit, qui remplacent Lucide dans l'app mobile.
Une seule source (les tracés de `svg/*.svg`), deux rendus (`<svg>` en ligne
sur le web, `react-native-svg` en natif), aucune couleur en dur.

```tsx
import { Icon } from '@esport237hub/ui/native'; // ou '@esport237hub/ui/web'

<Icon name="trophy" size={20} color={c.gold} />
<Icon name="swords" size={22} color={tint} active={focused} />   // onglet sélectionné
<Icon name="heart" color={c.danger} filled={liked} />              // état coché
<Icon name="bell" accessibilityLabel="Notifications" />            // icône porteuse de sens
```

| Prop | Défaut | Rôle |
|---|---|---|
| `name` | — | `IconName` — union typée générée (`names.ts`) |
| `size` | `24` | côté en pixels |
| `color` | web : `currentColor` ; natif : `textPrimary` du thème | l'encre, toujours un jeton |
| `active` | `false` | variante active : trait + aplat partiel (25 %) |
| `filled` | `false` | variante pleine : l'aplat à pleine encre (favori, note) |
| `strokeWidth` | `1,75` | à ne changer que pour compenser une taille extrême |
| `accessibilityLabel` | — | absent, l'icône est décorative (`aria-hidden`) |

## La grammaire

**Grille 24 × 24, zone utile 20 × 20** (de 2 à 22). L'axe des traits reste
dans 1,5 → 22,5 : avec la demi-épaisseur, l'encre ne sort jamais de la grille
(le test le vérifie point par point).

**Un trait unique de 1,75**, jamais d'aplat pour dessiner une forme : les
icônes se lisent comme une famille, à 16 px comme à 32 px. Extrémités
**droites** (`butt`), jonctions **biseautées** (`bevel`) : un angle vif est
toujours coupé net, jamais arrondi.

**La signature : le chanfrein à 45°.** Le signe de la marque est un hexagone ;
la carte joueur, un bouclier aux angles coupés ; le logo, des manettes
taillées à facettes. Le jeu en reprend la règle, et elle remplace les
arrondis génériques de Lucide :

- **pas de cercle** — un contenant rond devient un **octogone** (carré 3 → 21
  chanfreiné de 5) : `info`, `check-circle`, `alert-circle`, `x-circle`,
  `clock`, `globe` ;
- **pas de coin arrondi** — un rectangle a ses quatre coins coupés à 45°
  (chanfrein 1,25 à 2,5 selon la taille) : `wallet`, `ticket`, `lock`,
  `calendar`, `smartphone`, `credit-card`… ;
- **l'hexagone de la marque** porte l'identité : la tête des personnages
  (`user`, `users`), la pièce G-Points (`coin`, avec un G anguleux), le colis
  (`package`), les nœuds du partage, la médaille ;
- **pas de point rond** — un point est un **losange** plein (`info`,
  `alert-*`, `more`, les points du dé, les roues du panier) ;
- **pas de courbe du tout** : les tracés ne contiennent que des segments
  (`M L H V Z`). Le test refuse toute commande de courbe.

**La variante active** est une couche à part dans chaque SVG
(`class="gh-active"`, cachée par `visibility="hidden"`) : la forme principale,
remplie à 25 % de l'encre. L'onglet sélectionné de la pilule « s'allume » sans
que son dessin épaississe. `filled` pose la même couche à pleine encre.

**Les couleurs** : uniquement `currentColor` (et `none`) dans les sources. Le
composant web hérite de la couleur du texte ; le natif prend la prop `color`
(un jeton de `useE237Colors()`), à défaut `textPrimary`. Le test refuse tout
hex, `rgb()`, nom de couleur, raster, `<image>`, `<use>`, `<style>` ou lien.

## Ajouter ou retoucher une icône

1. Dessiner `svg/<nom-en-kebab>.svg` dans la grille, avec l'en-tête des autres
   sources : `viewBox="0 0 24 24" fill="none" stroke="currentColor"
   stroke-width="1.75" stroke-linejoin="bevel"`. Traits en `<path d>` nus ;
   points en `<path fill="currentColor" stroke="none">` ; variante active en
   `<path class="gh-active" visibility="hidden" fill="currentColor"
   fill-opacity=".25" stroke="none">`.
2. `bun run icons` (`bun scripts/icons.ts`) : SVGO optimise et RÉÉCRIT la
   source (préréglage par défaut, dimensions fixes retirées, `viewBox`
   conservée, 2 décimales), puis régénère `names.ts`, `generated/data.ts`,
   `generated/web.tsx` et `generated/native.tsx`.
3. `bun run icons:check` échoue si une source n'est pas optimisée ou si un
   fichier généré n'est pas à jour ; `bun test src/icons` vérifie la
   grammaire. Ne jamais retoucher `generated/` à la main.
4. Planche de contrôle (normal + actif, 16 / 24 / 32 px, clair et sombre,
   encres des jetons) : `bun scripts/icons.ts --sheet planche.html`.

Poids : 108 sources, **47 862 → 36 521 octets** après SVGO (−24 %) ;
`generated/data.ts` (la donnée embarquée par l'app) pèse ~16 Ko.

## Correspondance avec Lucide

Pour migrer un écran : `<Trophy size={18} color={c.gold} />` devient
`<Icon name="trophy" size={18} color={c.gold} />`. Une table qui stockait des
composants (`Record<…, LucideIcon>`) stocke des noms (`Record<…, IconName>`).
`fill={…}` sur une étoile ou un cœur devient `filled`.

| Lucide | G-HUB | Lucide | G-HUB |
|---|---|---|---|
| `House` | `home` | `Gamepad2` | `gamepad` |
| `Swords` | `swords` | `Trophy` | `trophy` |
| `Store` | `store` (salle de jeux) | `Crown` | `crown` |
| `ShoppingBag` | `shopping-bag` | `Medal` | `medal` |
| `ShoppingCart` | `shopping-cart` | `ShieldCheck` / `ShieldAlert` | `shield-check` / `shield-alert` |
| `UserRound` / `Users` / `UserPlus` | `user` / `users` / `user-plus` | `BadgeCheck` | `badge-check` (vérifié) |
| `ArrowLeft/Right/Up/Down` | `arrow-left/right/up/down` | — | `player-card` (carte joueur) |
| `ArrowUpRight` / `ArrowDownLeft` | `arrow-up-right` / `arrow-down-left` | `QrCode` / `ScanLine` | `qr-code` / `scan` |
| `ArrowUpFromLine` | `upload` | `Ticket` | `ticket` |
| `ChevronLeft/Right/Up/Down` | `chevron-left/right/up/down` | `Wallet` | `wallet` |
| `ChevronsUp` / `ChevronsLeftRight` | `chevrons-up` / `chevrons-left-right` | `HandCoins` | `coin` (G-Points) |
| `X` / `XCircle` | `x` / `x-circle` | `Banknote` / `CreditCard` / `Landmark` | `banknote` / `credit-card` / `landmark` |
| `Plus` / `Minus` | `plus` / `minus` | `Zap` | `zap` (match rapide) |
| `MoreHorizontal` | `more` | `Dice5` / `Dices` | `dice` |
| — | `menu`, `search`, `settings` | `CalendarDays` / `CalendarClock` | `calendar` / `calendar-clock` |
| `ListFilter` / `SlidersHorizontal` | `filter` / `sliders` | `Clock` / `Timer` / `Hourglass` | `clock` / `timer` / `hourglass` |
| `Check` / `CheckCheck` | `check` / `check-check` | `MapPin` / `Navigation` | `map-pin` / `navigation` |
| `CheckCircle2` / `CircleCheck` | `check-circle` | `Building2` / `Globe` | `building` / `globe` |
| `Info` | `info` | `Bell` / `Heart` / `Star` | `bell` / `heart` / `star` |
| `AlertTriangle` / `AlertCircle` | `alert-triangle` / `alert-circle` | `MessageCircle` / `Quote` | `message` / `quote` |
| `Lock` / `KeyRound` / `Fingerprint` | `lock` / `key` / `fingerprint` | `Share2` / `Send` / `SendHorizontal` / `Reply` | `share` / `send` / `send` / `reply` |
| `Eye` / `EyeOff` | `eye` / `eye-off` | `Megaphone` / `Radio` | `megaphone` / `radio` |
| `LogOut` | `log-out` | `Sparkles` / `Gift` / `Flag` / `Shirt` | `sparkles` / `gift` / `flag` / `shirt` |
| `RefreshCw` / `RotateCcw` / `RotateCw` | `refresh` / `rotate-ccw` / `rotate-cw` | `Phone` / `Smartphone` | `phone` / `smartphone` |
| `Trash2` | `trash` | `Images` / `FileImage` / `ImagePlus` / `ImageOff` | `image` / `image` / `image-plus` / `image-off` |
| `PenLine` / `PencilLine` | `pencil` | `Camera` | `camera` |
| `Paperclip` | `paperclip` | `Wifi` / `WifiOff` | `wifi` / `wifi-off` |
| `LayoutGrid` / `Inbox` | `layout-grid` / `inbox` | `BarChart3` / `Newspaper` | `bar-chart` / `newspaper` |
| `Package` | `package` (commande) | `MailCheck` / `Lightbulb` / `Hand` / `Scale` | `mail-check` / `lightbulb` / `hand` / `scale` |
| — | `flame` | | |
