/**
 * Primitives d'interface native (sans composites API).
 * Couleurs via useE237Colors() — light et dark (DESIGN.md).
 */
import { AlertCircle, BadgeCheck, Inbox } from 'lucide-react-native';
import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  makeMutable,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  pill,
  radius,
  spacing,
  useE237Colors,
  useE237Mode,
  useToneSurface,
  withAlpha,
} from './core';
import { dsLocale, useDsT } from '../i18n';
import { initials } from '../lib/initials';
import { haptic } from './haptics';
import { Txt } from './text';

export { Field, Textarea, PhoneField, Stepper, SearchField } from './fields';

type ScreenScrollProps = {
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  contentInsetAdjustmentBehavior?: 'automatic' | 'never' | 'scrollableAxes' | 'always';
  keyboardShouldPersistTaps?: boolean | 'handled' | 'always' | 'never';
  showsVerticalScrollIndicator?: boolean;
  bottomOffset?: number;
  extraKeyboardSpace?: number;
  children?: ReactNode;
};

/** Fond de page + défilement. Passe `ScrollComponent` pour le clavier-aware. */
export function Screen({
  children,
  ScrollComponent = ScrollView,
  padBottom,
  contentStyle,
  safeTop = true,
}: {
  children: ReactNode;
  ScrollComponent?: ComponentType<ScreenScrollProps>;
  /** Réserve sous le contenu — à régler sur la hauteur de la tab bar flottante. */
  padBottom?: number;
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * Décale le contenu sous l’encoche / status bar (TopBar uniforme).
   * Défaut `true` ; les onglets (`TabScreen`) et les écrans déjà dans un
   * `SafeAreaView` passent `false`.
   */
  safeTop?: boolean;
}) {
  const c = useE237Colors();
  const insets = useSafeAreaInsets();
  const Scroll = ScrollComponent;
  return (
    <Scroll
      style={{ backgroundColor: c.bg, flex: 1 }}
      contentContainerStyle={[
        styles.screen,
        // Remplace le `paddingTop` du shorthand : encoche + même air que les côtés.
        safeTop && { paddingTop: insets.top + spacing['4'] },
        padBottom != null && { paddingBottom: padBottom },
        contentStyle,
      ]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={24}
      extraKeyboardSpace={12}
    >
      {children}
    </Scroll>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Txt variant="overline" tone="cyan">
      {children}
    </Txt>
  );
}

export function ErrorNote({ message }: { message: string }) {
  const c = useE237Colors();
  return (
    <View
      style={[
        styles.note,
        { backgroundColor: `${c.danger}18`, borderColor: `${c.danger}66` },
      ]}
    >
      <AlertCircle color={c.danger} size={16} />
      <Txt selectable variant="body" tone="danger" style={{ flex: 1 }}>
        {message}
      </Txt>
    </View>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  const c = useE237Colors();
  return (
    <View style={[styles.empty, { borderColor: c.border }]}>
      <Inbox color={c.textMuted} size={22} />
      <Txt variant="body" tone="secondary" align="center">
        {children}
      </Txt>
    </View>
  );
}

/**
 * Bloc fantôme avec balayage lumineux (« shimmer »).
 *
 * Le shimmer n'est pas décoratif : il distingue « ça charge » de « c'est vide
 * et ça restera vide ». Un bloc figé ressemble à une carte cassée ; un bloc qui
 * respire annonce une arrivée. C'est aussi ce qui couvre les BASCULES de
 * contenu (changement de discipline sur le classement) : la liste ne saute pas
 * d'un état à l'autre, elle passe par un état de chargement lisible.
 *
 * Réécrit le 21/09/2026 pour le coût, pas pour l'allure. Chaque bloc montait
 * son propre `<Svg>` avec un `<LinearGradient>` — et TOUS sous le même
 * `id="e237Shimmer"` : sur react-native-web, les identifiants SVG sont
 * globaux au document, donc huit squelettes se disputaient une définition
 * unique. Chaque bloc lançait en plus sa propre boucle Reanimated : une liste
 * en chargement, sur l'Android d'entrée de gamme qui est la cible du produit,
 * en allumait une dizaine.
 *
 * Désormais : UNE seule horloge partagée par tout l'écran (module-level
 * `SharedValue`, démarrée au premier squelette monté, arrêtée au dernier), et
 * une bande peinte par trois `View` superposées plutôt que par un dégradé SVG.
 * Même lecture à l'œil, sans SVG ni boucle par bloc.
 *
 * La bande est en `pointerEvents="none"` et l'animation est purement visuelle :
 * elle ne retarde ni ne bloque l'affichage des données quand elles arrivent.
 */

/** Durée d'un balayage, en ms — assez lent pour ne pas scintiller. */
const SHIMMER_DURATION = 1400;

/**
 * Horloge unique : 0 → 1 en boucle, partagée par tous les squelettes montés.
 * Un compteur de montages évite qu'un écran qui se démonte laisse tourner une
 * animation pour personne (batterie, cas typique d'un onglet quitté).
 */
const shimmerClock = makeMutable(0);
let shimmerMounts = 0;

function retainShimmerClock(): () => void {
  shimmerMounts += 1;
  if (shimmerMounts === 1) {
    shimmerClock.value = 0;
    shimmerClock.value = withRepeat(
      withTiming(1, { duration: SHIMMER_DURATION, easing: Easing.linear }),
      -1,
      false,
    );
  }
  return () => {
    shimmerMounts -= 1;
    if (shimmerMounts === 0) {
      cancelAnimation(shimmerClock);
      shimmerClock.value = 0;
    }
  };
}

export function Skeleton({ height = 64 }: { height?: number }) {
  const c = useE237Colors();
  // Largeur mesurée : la bande se déplace d'une largeur d'écran à l'autre, il
  // faut donc la connaître. Tant qu'elle vaut 0, seul le fond est peint.
  const [width, setWidth] = useState(0);

  useEffect(retainShimmerClock, []);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -width + shimmerClock.value * 2 * width }],
  }));

  // Le dégradé SVG remplacé par trois bandes de la même encre, d'opacité
  // croissante puis décroissante : à 7 % sur fond de surface, l'œil ne fait
  // pas la différence, et il n'y a plus ni SVG ni `<Defs>` par squelette.
  const band = withAlpha(c.textPrimary, 0.07);
  const bandSoft = withAlpha(c.textPrimary, 0.035);

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        height,
        borderRadius: radius.lg,
        backgroundColor: c.surface,
        overflow: 'hidden',
      }}
    >
      {width > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              bottom: 0,
              flexDirection: 'row',
              width: width * 0.6,
            },
            bandStyle,
          ]}
        >
          <View style={{ flex: 1, backgroundColor: bandSoft }} />
          <View style={{ flex: 1, backgroundColor: band }} />
          <View style={{ flex: 1, backgroundColor: bandSoft }} />
        </Animated.View>
      ) : null}
    </View>
  );
}

/**
 * Avatar à initiales ou photo — même dosage de fond que les autres pilules.
 *
 * Deux garanties, qui manquaient toutes deux :
 *  - les initiales viennent de `initials()` (`../lib`), la MÊME règle que le
 *    web ; `name.charAt(0)` rendait une pastille vide sur un pseudo commençant
 *    par un emoji, et une seule lettre là où le web en affichait deux ;
 *  - une URL qui casse (média retiré, réseau coupé, 403) RETOMBE sur les
 *    initiales. Sans ce repli, l'avatar devenait un rond vide, indiscernable
 *    d'un bug d'affichage.
 */
export function Avatar({
  name,
  size = 44,
  src,
}: {
  name: string | null | undefined;
  size?: number;
  /** URI locale ou URL distante (sinon initiales). */
  src?: string | null;
}) {
  const c = useE237Colors();
  const surface = useToneSurface(c.accent);
  // On mémorise l'URL qui a échoué, pas un booléen : changer de photo doit
  // retenter le chargement sans effet de synchronisation (parité web).
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showPhoto = !!src && failedSrc !== src;
  const letters = initials(name);

  return (
    <View
      accessibilityLabel={name ?? undefined}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...surface,
      }}
    >
      {showPhoto ? (
        <Image
          source={{ uri: src }}
          style={{ width: size, height: size }}
          resizeMode="cover"
          onError={() => setFailedSrc(src)}
          accessibilityLabel={name ?? undefined}
        />
      ) : (
        /* Deux lettres dans un rond de 24 px débordent à 0.4 × la taille :
           l'échelle suit le NOMBRE de lettres, pas la seule taille. */
        <Txt
          variant="title"
          tone="accent"
          size={size * (letters.length > 1 ? 0.34 : 0.42)}
        >
          {letters}
        </Txt>
      )}
    </View>
  );
}

/**
 * Marque « joueur vérifié » (icône Lucide BadgeCheck) — jumelle du web.
 * Elle manquait au natif : les écrans posaient l'icône à la main.
 */
export function VerifiedMark({ size = 14 }: { size?: number }) {
  const c = useE237Colors();
  const t = useDsT();
  return (
    <BadgeCheck
      color={c.cyan}
      size={size}
      accessibilityLabel={t('ui.player.verified')}
    />
  );
}

/**
 * Date courte — jumelle de `formatDate` du web (même sortie).
 * Elle manquait au natif : chaque application refaisait la sienne.
 *
 * La locale vient du design system, pas d'un `'fr-FR'` figé : un joueur en
 * anglais lisait « 10 sept., 11:19 » au milieu d'un écran traduit.
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return date.toLocaleString(dsLocale() === 'en' ? 'en-GB' : 'fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

/**
 * Onglets segmentés — pastille active qui glisse (timing, sans rebond).
 *
 * Parité web `.seg` / `.seg__pill` : la gouttière prend `surfaceRaised`, la
 * pastille active un fond PLEIN (`surface`) bordé, pas un simple voile teinté
 * — c'est ce qui rend l'onglet actif lisible sur un écran de téléphone.
 */
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const c = useE237Colors();
  const mode = useE237Mode();
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.value === value),
  );
  const itemWidth = width > 0 ? (width - 8) / tabs.length : 0;

  const pillStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: withTiming(index * itemWidth, {
            duration: 200,
            easing: Easing.out(Easing.cubic),
          }),
        },
      ],
    }),
    [index, itemWidth],
  );

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[
        styles.segment,
        { backgroundColor: c.surfaceRaised, borderColor: c.border },
      ]}
    >
      {itemWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.segmentPill,
            {
              width: itemWidth,
              backgroundColor: c.surface,
              borderColor: withAlpha(c.accent, pill.stroke[mode]),
            },
            pillStyle,
          ]}
        />
      ) : null}
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <Pressable
            key={t.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            hitSlop={{ top: 3, bottom: 3 }}
            onPress={() => {
              haptic('selection');
              onChange(t.value);
            }}
            style={styles.segmentItem}
          >
            <Txt
              numberOfLines={1}
              variant={active ? 'label' : 'subtitle'}
              tone={active ? 'accent' : 'secondary'}
              size={13}
            >
              {t.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing['4'], gap: spacing['3'], paddingBottom: spacing['12'] },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing['3'],
  },
  empty: {
    alignItems: 'center',
    gap: spacing['2'],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing['6'],
  },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.full,
    padding: 3,
  },
  segmentPill: {
    position: 'absolute',
    left: 3,
    top: 3,
    bottom: 3,
    borderWidth: 1,
    borderRadius: radius.full,
  },
  segmentItem: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing['2'],
  },
});
