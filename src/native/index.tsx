/**
 * Composants React Native ESPORT 237 HUB (Expo).
 *
 * Mêmes tokens que le web ; light/dark via useColorScheme() / useE237Colors().
 */
export {
  color,
  font,
  radius,
  spacing,
  useE237Colors,
  Button,
  Card,
  Badge,
  Stat,
  SectionLabel,
} from './core';
export type {
  ColorScale,
  ThemeMode,
  ButtonProps,
  CardProps,
  BadgeProps,
  StatProps,
  SectionLabelProps,
} from './core';

export * from './fields';

export {
  Screen,
  SectionTitle,
  ErrorNote,
  EmptyState,
  Skeleton,
  Avatar,
  SegmentedTabs,
} from './primitives';

export { Sheet } from './sheet';
export { SelectSheet } from './select-sheet';
export type { SelectOption } from './select-sheet';
export { DateField, TimeField } from './date-time';
export { GameSelect, sortGamesFcFirst } from './game-select';
export { Flag, CameroonFlag } from './flag';
export {
  CARD_SKINS,
  CardChrome,
  PREMIUM_SKINS,
} from './card-skins';
export type { CardSkin, SkinSpec } from './card-skins';
export { PlayerCard } from './player-card';
export { GlobalCard } from './global-card';
export { DuelStatusBadge } from './duel-status-badge';
export { ScoreInput } from './score-board';

export {
  cardStats,
  cityAbbr,
  gameCategory,
  statValue,
  STAT_DEFS,
  DUEL_STATUS_META,
  statusLabel,
  DISPUTE_STATUSES,
  DISPUTE_STATUS_META,
  disputeStatusMeta,
  buildGlobalCard,
  GLOBAL_CARD_MAX_GAMES,
} from '../lib';
export type {
  GameCategory,
  StatDef,
  DisputeStatus,
  GameCardLike,
  GlobalCardData,
  GlobalCardGame,
} from '../lib';
