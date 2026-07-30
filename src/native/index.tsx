/**
 * Composants React Native ESPORT 237 HUB (Expo).
 *
 * Mêmes tokens que le web ; light/dark via useColorScheme() / useE237Colors().
 */
export {
  color,
  font,
  pill,
  radius,
  spacing,
  withAlpha,
  useE237Colors,
  useE237Mode,
  useToneColor,
  useToneSurface,
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
  BadgeTone,
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

export { FilterChip } from './filter-chip';
export type { FilterChipProps } from './filter-chip';

export {
  DivisionBadge,
  divisionLabel,
  divisionAccessibleLabel,
} from './division-badge';
export type { DivisionBadgeProps } from './division-badge';

export { TrendArrow, formatDelta } from './trend-arrow';
export type { TrendArrowProps, TrendMovement } from './trend-arrow';

export { MediaImage } from './media-image';
export type { MediaImageProps, MediaRounded } from './media-image';

export { StatTile, QuickAction } from './dashboard';
export type { StatTileProps, StatTileTrend, QuickActionProps } from './dashboard';

export { Sheet } from './sheet';
export { SelectSheet } from './select-sheet';
export type { SelectOption } from './select-sheet';
export { DateField, TimeField } from './date-time';
export { GameSelect, sortGamesFcFirst } from './game-select';
export { Flag, CameroonFlag } from './flag';
export {
  CARD_FONTS,
  CARD_SKINS,
  CardChrome,
  CardSlot,
  PREMIUM_SKINS,
  useCardScale,
} from './card-skins';
export type { CardSkin, SkinSpec } from './card-skins';
export { PlayerCard, DivisionChip } from './player-card';
export type { PlayerCardProps } from './player-card';
export { GlobalCard } from './global-card';
export type { GlobalCardProps } from './global-card';
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
