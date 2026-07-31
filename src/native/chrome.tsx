/**
 * Chrome d'écran gamifié — barre de titre, soldes, en-têtes de section,
 * bannières, tuiles et lignes de liste.
 *
 * C'est le vocabulaire visuel des écrans « app » : rails horizontaux de
 * tuiles, lignes avec vignette + action, en-têtes avec « Voir tout ».
 * Aucune couleur en dur : tokens + `useE237Colors()` (DESIGN.md).
 */
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { font, radius, spacing, useE237Colors } from './core';
import { haptic } from './haptics';
import { useNeu } from './neu';
import { Txt } from './text';

/* ------------------------------------------------------------------ */
/* Pressable animé (socle commun)                                      */
/* ------------------------------------------------------------------ */

function usePressScale(to = 0.95) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return {
    style,
    onPressIn: () => {
      scale.value = withSpring(to, { damping: 15, stiffness: 340 });
    },
    onPressOut: () => {
      scale.value = withSpring(1, { damping: 13, stiffness: 260 });
    },
  };
}

/* ------------------------------------------------------------------ */
/* IconButton                                                          */
/* ------------------------------------------------------------------ */

export interface IconButtonProps {
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  /** 36 par défaut ; la zone tactile reste ≥ 44 px via hitSlop. */
  size?: number;
  tone?: 'surface' | 'accent';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Pastille ronde en relief — retour, flèches de rail, actions compactes. */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 36,
  tone = 'surface',
  disabled,
  style,
}: IconButtonProps) {
  const c = useE237Colors();
  const neu = useNeu();
  const press = usePressScale(0.9);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={10}
      onPress={onPress}
      onPressIn={() => {
        if (disabled) return;
        haptic('light');
        press.onPressIn();
      }}
      onPressOut={press.onPressOut}
      style={style}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tone === 'accent' ? c.accent : c.surfaceRaised,
          },
          tone === 'accent' ? neu.primaryGlow(c.accent) : neu.raisedSm,
          disabled && styles.disabled,
          press.style,
        ]}
      >
        {icon}
      </Animated.View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* PillButton                                                          */
/* ------------------------------------------------------------------ */

export interface PillButtonProps {
  label: string;
  onPress: () => void;
  tone?: 'accent' | 'cyan' | 'surface';
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Petite pilule d'action : « Voir tout », « Jouer », « Défier ». */
export function PillButton({
  label,
  onPress,
  tone = 'accent',
  icon,
  disabled,
  style,
}: PillButtonProps) {
  const c = useE237Colors();
  const neu = useNeu();
  const press = usePressScale();

  const bg = tone === 'accent' ? c.accent : tone === 'cyan' ? c.cyan : c.surfaceRaised;
  const fg = tone === 'surface' ? c.textPrimary : c.onAccent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      onPressIn={() => {
        if (disabled) return;
        haptic('light');
        press.onPressIn();
      }}
      onPressOut={press.onPressOut}
      style={style}
    >
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: bg },
          tone === 'surface' ? neu.raisedSm : neu.primaryGlow(bg),
          disabled && styles.disabled,
          press.style,
        ]}
      >
        {icon}
        <Txt variant="label" size={font.size.xs + 1} color={fg} numberOfLines={1}>
          {label}
        </Txt>
      </Animated.View>
    </Pressable>
  );
}

export interface PillTagProps {
  label: string;
  tone?: 'accent' | 'cyan' | 'surface';
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Version non cliquable de `PillButton` : à utiliser dans le `trailing`
 * d'une ligne déjà pressable (imbriquer deux pressables casse le web).
 */
export function PillTag({ label, tone = 'surface', icon, style }: PillTagProps) {
  const c = useE237Colors();
  const neu = useNeu();

  const bg = tone === 'accent' ? c.accent : tone === 'cyan' ? c.cyan : c.surfaceRaised;
  const fg = tone === 'surface' ? c.textPrimary : c.onAccent;

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: bg },
        tone === 'surface' ? neu.raisedSm : neu.primaryGlow(bg),
        style,
      ]}
    >
      {icon}
      <Txt variant="label" size={font.size.xs + 1} color={fg} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* BalancePill                                                         */
/* ------------------------------------------------------------------ */

export interface BalancePillProps {
  /** Pastille de gauche (icône Lucide 14 px ou point coloré). */
  icon: ReactNode;
  value: string | number;
  tone?: 'accent' | 'cyan' | 'gold';
  /** Tape sur le solde (ex. ouvrir le wallet). */
  onPress?: () => void;
  pressLabel?: string;
  /** Affiche le bouton « + » (recharge). */
  onAdd?: () => void;
  addLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** Solde compact de la barre du haut : icône + valeur + « + ». */
export function BalancePill({
  icon,
  value,
  tone = 'accent',
  onPress,
  pressLabel = 'Voir le solde',
  onAdd,
  addLabel = 'Ajouter',
  style,
}: BalancePillProps) {
  const c = useE237Colors();
  const neu = useNeu();
  const accent = tone === 'cyan' ? c.cyan : tone === 'gold' ? c.gold : c.accent;

  const amount = (
    <>
      <View style={[styles.balanceIcon, { backgroundColor: `${accent}26` }]}>{icon}</View>
      <Txt variant="label" size={font.size.xs + 1} numberOfLines={1}>
        {value}
      </Txt>
    </>
  );

  return (
    <View
      style={[styles.balance, { backgroundColor: c.surfaceRaised }, neu.raisedSm, style]}
    >
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={pressLabel}
          hitSlop={6}
          onPress={() => {
            haptic('light');
            onPress();
          }}
          style={({ pressed }) => [
            styles.balanceTap,
            pressed && styles.pressed,
          ]}
        >
          {amount}
        </Pressable>
      ) : (
        amount
      )}
      {onAdd ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={addLabel}
          hitSlop={10}
          onPress={() => {
            haptic('light');
            onAdd();
          }}
          style={({ pressed }) => [
            styles.balanceAdd,
            { backgroundColor: accent },
            pressed && styles.pressed,
          ]}
        >
          <Plus color={c.onAccent} size={12} strokeWidth={3} />
        </Pressable>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* TopBar                                                              */
/* ------------------------------------------------------------------ */

export interface TopBarProps {
  title?: string;
  subtitle?: string;
  /** Affiche le bouton retour rond. */
  onBack?: () => void;
  /** Contenu à droite (soldes, actions). */
  right?: ReactNode;
  /** Remplace le titre (logo, avatar + pseudo…). */
  leading?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Barre de titre d'écran — remplace le header de navigation natif. */
export function TopBar({
  title,
  subtitle,
  onBack,
  right,
  leading,
  style,
}: TopBarProps) {
  const c = useE237Colors();

  return (
    <View style={[styles.topBar, style]}>
      {onBack ? (
        <IconButton
          icon={<ChevronLeft color={c.textPrimary} size={20} />}
          onPress={onBack}
          accessibilityLabel="Retour"
        />
      ) : null}

      <View style={styles.topBarMain}>
        {leading ?? (
          <>
            {title ? (
              <Txt variant="title" numberOfLines={1}>
                {title}
              </Txt>
            ) : null}
            {subtitle ? (
              <Txt variant="caption" tone="secondary" numberOfLines={1}>
                {subtitle}
              </Txt>
            ) : null}
          </>
        )}
      </View>

      {right ? <View style={styles.topBarRight}>{right}</View> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHeader                                                       */
/* ------------------------------------------------------------------ */

export interface SectionHeaderProps {
  title: string;
  /** Icône Lucide 16 px, teintée par l'appelant. */
  icon?: ReactNode;
  /** Affiche la pilule « Voir tout ». */
  onSeeAll?: () => void;
  seeAllLabel?: string;
  /** Flèches de défilement du rail associé. */
  onPrev?: () => void;
  onNext?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** En-tête de section : icône + titre à gauche, actions à droite. */
export function SectionHeader({
  title,
  icon,
  onSeeAll,
  seeAllLabel = 'Voir tout',
  onPrev,
  onNext,
  style,
}: SectionHeaderProps) {
  const c = useE237Colors();

  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionHeaderLeft}>
        {icon}
        <Txt variant="heading" numberOfLines={1}>
          {title}
        </Txt>
      </View>

      <View style={styles.sectionHeaderRight}>
        {onSeeAll ? (
          <PillButton label={seeAllLabel} onPress={onSeeAll} tone="accent" />
        ) : null}
        {onPrev ? (
          <IconButton
            icon={<ChevronLeft color={c.textSecondary} size={16} />}
            onPress={onPrev}
            accessibilityLabel="Précédent"
            size={30}
          />
        ) : null}
        {onNext ? (
          <IconButton
            icon={<ChevronRight color={c.textSecondary} size={16} />}
            onPress={onNext}
            accessibilityLabel="Suivant"
            size={30}
          />
        ) : null}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Rail                                                                */
/* ------------------------------------------------------------------ */

export interface RailProps {
  children: ReactNode;
  /** Compense le padding de `Screen` pour un défilement bord à bord. */
  bleed?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
}

/** Rail horizontal de tuiles (défile sous le padding de l'écran). */
export function Rail({ children, bleed = spacing['4'], gap = spacing['3'], style }: RailProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[{ marginHorizontal: -bleed }, style]}
      contentContainerStyle={{ paddingHorizontal: bleed, gap }}
    >
      {children}
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* Tile                                                                */
/* ------------------------------------------------------------------ */

export interface TileProps {
  label?: string;
  caption?: string;
  image?: ImageSourcePropType | null;
  /** Contenu superposé (badge, note) en haut à droite. */
  overlay?: ReactNode;
  /** Repli quand `image` est absent (initiale, icône). */
  fallback?: ReactNode;
  onPress?: () => void;
  width?: number;
  /** Ratio largeur/hauteur du visuel. 1 = carré. */
  aspectRatio?: number;
  style?: StyleProp<ViewStyle>;
}

/** Tuile média d'un rail : visuel arrondi + libellé dessous. */
export function Tile({
  label,
  caption,
  image,
  overlay,
  fallback,
  onPress,
  width = 116,
  aspectRatio = 1,
  style,
}: TileProps) {
  const c = useE237Colors();
  const neu = useNeu();
  const press = usePressScale(0.96);

  const body = (
    <Animated.View style={[{ width }, styles.tile, onPress ? press.style : null, style]}>
      <View
        style={[
          styles.tileMedia,
          { aspectRatio, backgroundColor: c.surfaceRaised },
          neu.card,
        ]}
      >
        {image ? (
          <Image source={image} style={styles.tileImage} resizeMode="cover" />
        ) : (
          <View style={styles.tileFallback}>{fallback}</View>
        )}
        {overlay ? <View style={styles.tileOverlay}>{overlay}</View> : null}
      </View>
      {label ? (
        <Txt variant="label" size={font.size.xs + 1} numberOfLines={1}>
          {label}
        </Txt>
      ) : null}
      {caption ? (
        <Txt variant="caption" tone="secondary" numberOfLines={1}>
          {caption}
        </Txt>
      ) : null}
    </Animated.View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={() => {
        haptic('light');
        press.onPressIn();
      }}
      onPressOut={press.onPressOut}
    >
      {body}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* ListRow                                                             */
/* ------------------------------------------------------------------ */

export interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Petites infos alignées au-dessus du titre (points, durée…). */
  meta?: ReactNode;
  image?: ImageSourcePropType | null;
  /** Repli visuel (initiale, icône) quand `image` est absent. */
  leading?: ReactNode;
  /** Action à droite : `PillButton`, badge, chevron… */
  trailing?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Ligne de liste : vignette + textes + action — la brique des catalogues. */
export function ListRow({
  title,
  subtitle,
  meta,
  image,
  leading,
  trailing,
  onPress,
  style,
}: ListRowProps) {
  const c = useE237Colors();
  const neu = useNeu();
  const press = usePressScale(0.985);

  const body = (
    <Animated.View
      style={[
        styles.row,
        { backgroundColor: c.surfaceRaised },
        neu.card,
        onPress ? press.style : null,
        style,
      ]}
    >
      <View style={[styles.rowThumb, { backgroundColor: c.surface }]}>
        {image ? (
          <Image source={image} style={styles.rowThumbImage} resizeMode="cover" />
        ) : (
          leading
        )}
      </View>

      <View style={styles.rowBody}>
        {meta ? <View style={styles.rowMeta}>{meta}</View> : null}
        <Txt variant="label" numberOfLines={1}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="caption" tone="secondary" numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
      </View>

      {trailing ? <View style={styles.rowTrailing}>{trailing}</View> : null}
    </Animated.View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      onPressIn={() => {
        haptic('light');
        press.onPressIn();
      }}
      onPressOut={press.onPressOut}
    >
      {body}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* MetaChip                                                            */
/* ------------------------------------------------------------------ */

export interface MetaChipProps {
  label: string | number;
  icon?: ReactNode;
  tone?: 'neutral' | 'accent' | 'cyan' | 'gold' | 'danger';
}

/** Micro-info d'une ligne : icône + valeur, fond teinté discret. */
export function MetaChip({ label, icon, tone = 'neutral' }: MetaChipProps) {
  const c = useE237Colors();
  const t =
    tone === 'accent'
      ? c.accent
      : tone === 'cyan'
        ? c.cyan
        : tone === 'gold'
          ? c.gold
          : tone === 'danger'
            ? c.danger
            : c.textSecondary;

  return (
    <View style={[styles.metaChip, { backgroundColor: `${t}1F` }]}>
      {icon}
      <Txt variant="caption" size={font.size.xs - 1} color={t} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* HeroBanner                                                          */
/* ------------------------------------------------------------------ */

export interface HeroBannerProps {
  title: string;
  subtitle?: string;
  /** Libellé du CTA ; sans lui la bannière entière reste pressable. */
  cta?: string;
  onPress?: () => void;
  /** Illustration calée à droite. */
  art?: ImageSourcePropType | null;
  /** Dégradé de fond ; par défaut accent → cyan. */
  colors?: [string, string];
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/** Bannière d'accroche en dégradé — haut d'écran d'accueil. */
export function HeroBanner({
  title,
  subtitle,
  cta,
  onPress,
  art,
  colors,
  height = 148,
  style,
}: HeroBannerProps) {
  const c = useE237Colors();
  const neu = useNeu();
  const press = usePressScale(0.985);
  const [from, to] = colors ?? [c.accent, c.cyan];

  const body = (
    <Animated.View
      style={[
        styles.hero,
        { height, backgroundColor: c.surfaceRaised },
        neu.card,
        onPress ? press.style : null,
        style,
      ]}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="e237HeroGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} stopOpacity={0.95} />
            <Stop offset="1" stopColor={to} stopOpacity={0.75} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#e237HeroGrad)" />
      </Svg>

      {art ? <Image source={art} style={styles.heroArt} resizeMode="contain" /> : null}

      <View style={styles.heroBody}>
        <Txt variant="title" color={c.onAccent} numberOfLines={2}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="caption" color={c.onAccent} numberOfLines={2} style={styles.heroSub}>
            {subtitle}
          </Txt>
        ) : null}
        {cta && onPress ? (
          <View style={styles.heroCta}>
            <PillButton label={cta} onPress={onPress} tone="surface" />
          </View>
        ) : null}
      </View>
    </Animated.View>
  );

  if (!onPress || cta) return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      onPressIn={() => {
        haptic('light');
        press.onPressIn();
      }}
      onPressOut={press.onPressOut}
    >
      {body}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    minHeight: 32,
    paddingHorizontal: spacing['3'],
    borderRadius: radius.full,
    borderCurve: 'continuous',
  },

  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    height: 34,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: radius.full,
    borderCurve: 'continuous',
  },
  balanceTap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1-5'],
    paddingRight: 2,
  },
  balanceIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAdd: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    minHeight: 44,
  },
  topBarMain: { flex: 1, gap: 2 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing['3'],
    minHeight: 36,
  },
  sectionHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },

  tile: { gap: spacing['1'] },
  tileMedia: {
    width: '100%',
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  tileImage: { width: '100%', height: '100%' },
  tileFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileOverlay: { position: 'absolute', top: spacing['2'], right: spacing['2'] },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    paddingRight: spacing['3'],
    minHeight: 72,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
  },
  rowThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowThumbImage: { width: '100%', height: '100%' },
  // `minWidth: 0` : sans lui le contenu long pousse le `trailing` hors du bloc
  // au lieu de se tronquer (la ligne déborderait sur l'action de droite).
  rowBody: { flex: 1, minWidth: 0, gap: 3 },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing['1'],
  },
  rowTrailing: { flexShrink: 0 },

  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.full,
  },

  hero: {
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  heroArt: {
    position: 'absolute',
    right: -8,
    bottom: 0,
    width: '46%',
    height: '112%',
  },
  heroBody: {
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['4'],
    gap: spacing['1'],
    maxWidth: '62%',
  },
  heroSub: { opacity: 0.85 },
  heroCta: { flexDirection: 'row', marginTop: spacing['2'] },
});
