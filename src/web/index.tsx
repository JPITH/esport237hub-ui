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

export { Button, IconButton, LinkButton } from './button';
export type { ButtonProps, IconButtonProps, LinkButtonProps } from './button';

export {
  AudienceCard,
  BrandLogo,
  CircuitTrack,
  CtaBand,
  FaqAccordion,
  FeatureCard,
  Glyph,
  MarketingFooter,
  MarketingHeader,
  NoteCard,
  ProofLevel,
  RankPreview,
  SectionHead,
  StatBand,
  StepCard,
} from './marketing';
export type {
  AudienceCardProps,
  BrandLogoProps,
  CircuitStep,
  CircuitTrackProps,
  CtaBandProps,
  FaqAccordionProps,
  FaqEntry,
  FeatureCardProps,
  GlyphProps,
  IconName,
  MarketingFooterColumn,
  MarketingFooterProps,
  MarketingHeaderProps,
  MarketingNavItem,
  NoteCardProps,
  ProofLevelProps,
  RankLine,
  RankPreviewProps,
  SectionHeadProps,
  StatBandItem,
  StatBandProps,
  StepCardProps,
} from './marketing';

export { Flag, CameroonFlag } from './flag';
export { Table } from './table';
export type { Column, TableProps } from './table';

export { Tabs, FilterChip, Tooltip, Pagination } from './nav';
export { Switch } from './switch';
export type { SwitchProps } from './switch';
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

export { VenueGameList } from './venue-games';
export type { VenueGameItem, VenueGameListProps } from './venue-games';

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

export { CardChrome } from './card-chrome';
export type { CardChromeProps, CardSkinInput } from './card-chrome';

/**
 * Socle des skins : mêmes données et même géométrie que le mobile (voir
 * `@esport237hub/ui/skins`). Un skin créé dans le dashboard arrive via
 * `SkinCatalogProvider` et s'affiche sans code supplémentaire.
 */
export {
  BUILTIN_SKINS,
  BUILTIN_SKIN_KEYS,
  DEFAULT_SKIN_KEY,
  GLOBAL_SKIN_KEY,
  SKIN_SPEC_VERSION,
  isBuiltinSkinKey,
  isLegacyDesign,
  parseSkinSpec,
  resolveSkin,
  skinFromSeed,
  seedFromSkin,
  skinFromLegacyDesign,
  skinCssVars,
  stopColor,
  skinAnimated,
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
  AvatarGroup,
  toAvatarSize,
  formatDate,
} from './primitives';
export type {
  AvatarProps,
  AvatarGroupProps,
  AvatarPerson,
  AvatarSize,
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

export {
  AuthBrandPanel,
  BrandLockup,
  SidebarNavLink,
  ThemeToggleButton,
  sidebarLinkClass,
} from './brand';
export type {
  AuthBrandPanelProps,
  AuthMetric,
  BrandLockupProps,
  SidebarNavLinkOptions,
  SidebarNavLinkProps,
  ThemeToggleButtonProps,
} from './brand';

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

export { Stepper } from './stepper';
export type { StepperProps, StepperStep } from './stepper';

export {
  GameRail,
  GamePicker,
  GAME_RAIL_MAX_VISIBLE,
  DashboardHeader,
  DashboardNavLink,
  FeaturedHero,
  MatchRow,
  MatchList,
  EventRow,
  RankRow,
  ContextPanel,
} from './dashboard';
export type {
  GameRailItem,
  GameRailProps,
  GamePickerProps,
  DashboardHeaderProps,
  DashboardNavLinkProps,
  FeaturedHeroProps,
  MatchSide,
  MatchRowProps,
  MatchListProps,
  EventRowProps,
  RankRowProps,
  ContextPanelProps,
} from './dashboard';

export { DropdownMenu, MenuItem, MenuHeader, MenuSeparator } from './menu';
export type { DropdownMenuProps, MenuItemProps } from './menu';

export { GlobalSearch } from './global-search';
export type { GlobalSearchProps, GlobalSearchItem } from './global-search';

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
