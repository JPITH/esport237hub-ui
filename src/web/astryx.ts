/**
 * Ré-exports Astryx (Meta) — SEUL fichier autorisé à importer @astryxdesign/*.
 *
 * Règle du monorepo : les applications n'importent jamais @astryxdesign/*
 * directement ; elles passent par @esport237hub/ui. Astryx est en v0.x —
 * ce fichier concentre les changements cassants éventuels.
 *
 * On se limite volontairement aux points d'entrée documentés
 * (https://astryx.atmeta.com/docs/getting-started) ; le catalogue des
 * 160+ composants sera exposé progressivement, au fur et à mesure des besoins.
 */

export { Button as AstryxButton } from '@astryxdesign/core/Button';
export { VStack, HStack } from '@astryxdesign/core/Layout';
export {
  Avatar as AstryxAvatar,
  type AvatarSize as AstryxAvatarSize,
  type AvatarProps as AstryxAvatarProps,
} from '@astryxdesign/core/Avatar';
export {
  AvatarGroup as AstryxAvatarGroup,
  AvatarGroupOverflow as AstryxAvatarGroupOverflow,
  type AvatarGroupProps as AstryxAvatarGroupProps,
} from '@astryxdesign/core/AvatarGroup';
