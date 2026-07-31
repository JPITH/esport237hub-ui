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
  useNeu,
  createNeu,
  fontFamily,
  Button,
  Card,
  Badge,
  Stat,
  SectionLabel,
} from './core';
export type {
  ColorScale,
  ThemeMode,
  NeuMode,
  NeuShadows,
  NeuStyle,
  ButtonProps,
  BadgeTone,
  CardProps,
  BadgeProps,
  StatProps,
  SectionLabelProps,
} from './core';

export * from './fields';

export { Txt, typeStyle } from './text';
export type { TxtProps, TxtTone, TxtVariant } from './text';

export {
  Screen,
  SectionTitle,
  ErrorNote,
  EmptyState,
  Skeleton,
  Avatar,
  VerifiedMark,
  SegmentedTabs,
  formatDate,
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

export {
  BalancePill,
  HeroBanner,
  IconButton,
  ListRow,
  MetaChip,
  PillButton,
  PillTag,
  Rail,
  SectionHeader,
  Tile,
  TopBar,
} from './chrome';
export type {
  BalancePillProps,
  HeroBannerProps,
  IconButtonProps,
  ListRowProps,
  MetaChipProps,
  PillButtonProps,
  PillTagProps,
  RailProps,
  SectionHeaderProps,
  TileProps,
  TopBarProps,
} from './chrome';

export { StatTile, QuickAction } from './dashboard';
export type { StatTileProps, StatTileTrend, QuickActionProps } from './dashboard';

export { Sheet } from './sheet';
export type { SheetProps } from './sheet';
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
export type { CardSkin, CardSkinInput, CardChromeProps } from './card-skins';

/**
 * Socle des skins : mêmes données et même géométrie que le web (voir
 * `@esport237hub/ui/skins`). Un skin créé dans le dashboard arrive ici via
 * `SkinCatalogProvider` et s'affiche sans code supplémentaire.
 */
export {
  BUILTIN_SKINS,
  BUILTIN_SKIN_KEYS,
  DEFAULT_SKIN_KEY,
  GLOBAL_SKIN_KEY,
  SKIN_SPEC_VERSION,
  isBuiltinSkinKey,
  parseSkinSpec,
  resolveSkin,
  skinFromSeed,
  seedFromSkin,
  stopColor,
  skinAnimated,
  cardScale,
  buildSkinDraw,
} from '../skins';
export type {
  SkinSpec,
  SkinSeed,
  SkinStripePattern,
  BuiltinSkinKey,
  SkinDraw,
} from '../skins';
export { SkinCatalogProvider, useSkin, useSkinCatalog, useSkins } from '../skins/context';
export type { SkinCatalog, SkinCatalogProviderProps } from '../skins/context';
export { SkinPicker, SkinSwatch } from './skin-picker';
export type { SkinPickerProps, SkinSwatchProps } from './skin-picker';
export { PlayerCard, DivisionChip } from './player-card';
export type { PlayerCardProps } from './player-card';
export { GlobalCard } from './global-card';
export type { GlobalCardProps } from './global-card';
export { DuelStatusBadge } from './duel-status-badge';
export { ScoreInput } from './score-board';
export { E237TabBar, TAB_BAR_SPACE } from './tab-bar';
export type { E237TabBarProps } from './tab-bar';
export { StepperForm } from './stepper-form';
export type { StepperFormProps } from './stepper-form';
export { haptic, setNativeHaptics } from './haptics';
export type { HapticKind } from './haptics';
export {
  AuthScreen,
  AuthHero,
  AuthGlassCard,
  AuthDivider,
  GradientButton,
  OutlineButton,
  GoogleButton,
} from './auth';
export { SwipeDeck } from './swipe-deck';
export type { SwipePlayer } from './swipe-deck';
export { Checkbox, RadioGroup } from './choice';
export type { CheckboxProps, RadioGroupProps, RadioOption } from './choice';

export { StringListField } from './string-list-field';
export type { StringListFieldProps } from './string-list-field';

export { Notice } from './notice';
export type { NoticeProps } from './notice';

export { PerkList } from './perk-list';
export type { PerkListProps } from './perk-list';

export { ProfileAvatar } from './profile-avatar';
export type { ProfileAvatarProps } from './profile-avatar';

export { QrFrame } from './qr-frame';
export type { QrFrameProps } from './qr-frame';

export { EventCover, VenuePhoto, VenuePhotoStrip } from './cover-image';
export type {
  CoverRounded,
  EventCoverProps,
  VenuePhotoProps,
  VenuePhotoStripProps,
} from './cover-image';

export { AppLogo, BrandLockup } from './brand';
export type { AppLogoProps, BrandLockupProps } from './brand';

export {
  ChampionSpotlight,
  DivisionCell,
  LiveBar,
  MovementCell,
  PlayerCell,
  RankMedal,
  RankingSkeleton,
} from './ranking';
export type {
  ChampionSpotlightProps,
  DivisionCellProps,
  LiveBarProps,
  MovementCellProps,
  PlayerCellProps,
  RankMedalProps,
  RankingSkeletonProps,
} from './ranking';

export { AmountPresets, BalanceCard, TransactionRow } from './wallet';
export type {
  AmountPresetsProps,
  BalanceCardProps,
  TransactionRowProps,
} from './wallet';

export { LabelValueRow, PayoutCard } from './payout-card';
export type { LabelValueRowProps, PayoutCardProps } from './payout-card';

export {
  CompetitionCard,
  EventCard,
  ProductCard,
  SubscriptionCard,
  TicketCard,
} from './cards';
export type {
  CompetitionCardProps,
  EventCardProps,
  ProductCardProps,
  SubscriptionCardProps,
  TicketCardProps,
} from './cards';

export { DuelRow, ScoreSide } from './duel';
export type { DuelRowProps, ScoreSideProps } from './duel';

export { TierPicker } from './tier-picker';
export type { TierOption, TierPickerProps } from './tier-picker';

export { OrderStatusBadge } from './order-status-badge';
export type { OrderStatusBadgeProps } from './order-status-badge';

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
  formatXaf,
  formatFcfa,
  priceOrFreeLabel,
  ALLOWED_IMAGE_MIME_TYPES,
  IMAGE_ACCEPT_ATTRIBUTE,
  MAX_BYTES_BY_KIND,
  maxBytesForKind,
  maxSizeLabel,
  UPLOAD_STEP_LABEL,
  validateImageFile,
  ORDER_STATUS_TONE,
  orderStatusLabel,
  EVENT_TYPE_LABEL,
  EVENT_TYPE_TONE,
  EVENT_STATUS_LABEL,
  eventTypeLabel,
  eventTypeTone,
  COMPETITION_FORMAT_LABEL,
  COMPETITION_STATUS_LABEL,
  COMPETITION_STATUS_TONE,
  competitionFormatLabel,
  competitionStatusLabel,
  competitionStatusTone,
  TICKET_STATUS_META,
  ticketStatusMeta,
  SUBSCRIPTION_STATUS_LABEL,
  subscriptionStatusLabel,
  PLATFORM_LABEL,
  platformLabel,
  WALLET_SOURCE_LABEL,
  walletSourceLabel,
  TOPUP_PRESETS,
  LIVE_STATUS_LABEL,
  rankMovementPlaces,
  rankMovementLabel,
  divisionMovementLabel,
  formatClock,
} from '../lib';
export type {
  GameCategory,
  StatDef,
  DisputeStatus,
  GameCardLike,
  GlobalCardData,
  GlobalCardGame,
  Tone,
  AllowedImageMimeType,
  ImageFileLike,
  UploadStep,
  LiveStatus,
  RankMovement,
} from '../lib';
