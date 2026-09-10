export * from './player-stats';
export * from './duel-status';
export * from './global-card';
export * from './tone';
export * from './money';
export * from './media-policy';
export * from './order-status';
export * from './catalog';
export * from './wallet';
export * from './ranking';
export * from './rating';
export * from './relative-time';
export * from './external-url';
export * from './brand-mark';
/*
 * Le STORE seul, pas les hooks.
 *
 * `./lib` est importé par des Server Components (les balises de partage et
 * l'image OpenGraph d'un duel traduisent un statut). Next refuse de compiler
 * tout module du graphe serveur qui importe `useSyncExternalStore` : les hooks
 * vivent donc dans `../i18n/hooks`, marqué `'use client'`, et sortent par les
 * façades `./web` et `./native`.
 */
export * from '../i18n/store';
