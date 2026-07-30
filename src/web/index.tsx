/**
 * Composants web ESPORT 237 HUB (React 19).
 *
 * Stylés par les classes .e237-* / .btn / .pcard et les variables --e237-* :
 * importer `@esport237hub/ui/css` une fois dans l'application.
 * Light/dark : poser data-theme="light" | "dark" sur <html>
 * (absent = suit le système).
 *
 * Les ré-exports Astryx bruts vivent dans '@esport237hub/ui/web/astryx'.
 */
export { color, font, pill, radius, spacing, tokens, withAlpha } from '../tokens';
export type { ColorScale, ThemeMode } from '../tokens';

export {
  Card,
  Badge,
  Stat,
  SectionLabel,
} from './foundation';
export type {
  CardProps,
  BadgeProps,
  StatProps,
  SectionLabelProps,
} from './foundation';

export { Button, IconButton } from './button';
export type { ButtonProps, IconButtonProps } from './button';

export { Flag, CameroonFlag } from './flag';
export { Table } from './table';
export type { Column, TableProps } from './table';

export { Tabs, FilterChip, Tooltip, Pagination } from './nav';
export type { TabDef } from './nav';

export { Select, Combobox, DatePicker, TimePicker } from './pickers';
export type {
  SelectOption,
  SelectProps,
  ComboboxProps,
  DatePickerProps,
  TimePickerProps,
} from './pickers';

export { Modal, Drawer } from './overlay';
export type { ModalProps, DrawerProps } from './overlay';

export { CardSlider } from './card-slider';
export type { Slide } from './card-slider';

export { GameSelect, sortGamesFcFirst } from './game-select';
export type { GameSelectProps } from './game-select';

export { VenueCard } from './venue-card';
export type { VenueCardProps } from './venue-card';

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

export {
  PlayerCard,
  GlobalCard,
  PREMIUM_SKINS,
  SKIN_LABELS,
} from './player-card';
export type {
  CardSkin,
  PlayerCardProps,
  GlobalCardProps,
  GlobalCardCard,
} from './player-card';

export {
  BackLink,
  PageHeader,
  PageContainer,
  DuelStatusBadge,
  Spinner,
  Skeleton,
  EmptyState,
  ErrorNote,
  VerifiedMark,
  Avatar,
  formatDate,
} from './primitives';

export {
  Input,
  Textarea,
  NumberInput,
  PhoneInput,
  SearchField,
} from './fields';
export type {
  InputProps,
  TextareaProps,
  NumberInputProps,
  PhoneInputProps,
  SearchFieldProps,
} from './fields';

export { ColorPicker } from './color-picker';
export type { ColorPickerProps } from './color-picker';

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
