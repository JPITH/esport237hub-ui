/**
 * Avis sur une salle (natif) — jumeaux de `../web/rating`.
 *
 * Mêmes noms, mêmes props, mêmes mots. Les étoiles sont OR (`gold`) et non
 * accent : DESIGN.md interdit à l'accent de dire un état, et une note EST un
 * état ; l'or est le jeton « podium, décoratif » prévu pour ça.
 */
import { Lock, Star } from 'lucide-react-native';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useDsT } from '../i18n';
import {
  RATING_AXES,
  RATING_GATE_MESSAGE,
  RATING_LABELS,
  RATING_MAX,
  formatRatingAverage,
  ratingCountLabel,
  ratingDistribution,
  starFills,
  type RatingAxis,
  type RatingGate,
  type RatingScore,
} from '../lib/rating';
import { font, radius, spacing, useE237Colors } from './core';

/* ------------------------------------------------------------------ */
/* StarRating — lecture                                                */
/* ------------------------------------------------------------------ */

export interface StarRatingProps {
  value: number | null | undefined;
  /** Côté d'une étoile en pixels (défaut 16). */
  size?: number;
  /** Écrit la valeur à droite des étoiles. */
  showValue?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Les étoiles d'une note, en lecture. Le remplissage partiel est obtenu par
 * recouvrement : une étoile vide, une étoile pleine par-dessus dans une vue
 * de largeur fractionnaire — même construction que le web, donc 4,1 et 4,9 se
 * distinguent des deux côtés.
 */
export function StarRating({ value, size = 16, showValue = false, style }: StarRatingProps) {
  const c = useE237Colors();
  const t = useDsT();
  const fills = starFills(value);
  const label =
    value === null || value === undefined
      ? t('rating.summary.not_rated')
      : t('rating.summary.value_of_max', { value: formatRatingAverage(value), max: RATING_MAX });

  return (
    <View
      style={[styles.row, style]}
      accessibilityRole="image"
      accessible
      accessibilityLabel={label}>
      <View style={styles.stars}>
        {fills.map((fill, i) => (
          <View key={i} style={{ width: size, height: size }}>
            <Star size={size} color={c.textMuted} strokeWidth={1.5} />
            {fill > 0 ? (
              <View style={[styles.overlay, { width: size * fill, height: size }]}>
                <Star size={size} color={c.gold} fill={c.gold} strokeWidth={1.5} />
              </View>
            ) : null}
          </View>
        ))}
      </View>
      {showValue ? (
        <Text style={[styles.value, { color: c.textPrimary }]}>
          {formatRatingAverage(value)}
        </Text>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* StarRatingInput — saisie                                            */
/* ------------------------------------------------------------------ */

export interface StarRatingInputProps {
  value: RatingScore | null;
  onChange: (value: RatingScore) => void;
  /** Intitulé lu par les lecteurs d'écran (« Note de la salle »). */
  legend: string;
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SCORES: readonly RatingScore[] = [1, 2, 3, 4, 5];

/**
 * Saisie d'une note. Chaque étoile est un bouton radio accessible — VoiceOver
 * et TalkBack annoncent « 4, Très bien, sélectionné ». La cible fait au moins
 * 44 px de haut avec la marge de frappe : on demande cette note debout, dans
 * une salle, souvent d'une main.
 */
export function StarRatingInput({
  value,
  onChange,
  legend,
  size = 34,
  disabled = false,
  style,
}: StarRatingInputProps) {
  const c = useE237Colors();
  const t = useDsT();

  return (
    <View style={[styles.inputBlock, disabled ? styles.disabled : null, style]}>
      <View style={styles.stars} accessibilityRole="radiogroup" accessibilityLabel={legend}>
        {SCORES.map((score) => {
          const active = value !== null && score <= value;
          return (
            <Pressable
              key={score}
              onPress={disabled ? undefined : () => onChange(score)}
              hitSlop={6}
              accessibilityRole="radio"
              accessibilityState={{ selected: value === score, disabled }}
              accessibilityLabel={`${score} — ${RATING_LABELS[score]}`}
              style={({ pressed }) => [styles.starButton, pressed ? styles.pressed : null]}>
              <Star
                size={size}
                color={active ? c.gold : c.textMuted}
                fill={active ? c.gold : 'transparent'}
                strokeWidth={1.5}
              />
            </Pressable>
          );
        })}
      </View>
      {/* L'échelle en toutes lettres : « 3 étoiles » ne veut rien dire seul. */}
      <Text style={[styles.hint, { color: c.textSecondary }]}>
        {value === null ? t('rating.input.choose') : RATING_LABELS[value]}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* RatingSummary                                                       */
/* ------------------------------------------------------------------ */

export interface RatingSummaryProps {
  average: number | null | undefined;
  count: number;
  breakdown?: Partial<Record<RatingScore, number>> | null;
  axes?: Partial<Record<RatingAxis, number | null>> | null;
  style?: StyleProp<ViewStyle>;
}

/**
 * Le bloc « note de la salle ». Une salle sans avis affiche « Aucun avis » et
 * une invitation — jamais « 0/5 » : elle n'a pas démérité, elle vient
 * d'ouvrir.
 */
export function RatingSummary({ average, count, breakdown, axes, style }: RatingSummaryProps) {
  const c = useE237Colors();
  const t = useDsT();
  const empty = !count;
  const bars = breakdown ? ratingDistribution(breakdown) : null;

  return (
    <View style={[styles.summary, style]}>
      <View style={styles.summaryTop}>
        <View style={styles.summaryScore}>
          <Text style={[styles.average, { color: c.gold }]}>
            {formatRatingAverage(empty ? null : average)}
          </Text>
          <StarRating value={empty ? 0 : average} size={13} />
          <Text style={[styles.count, { color: c.textSecondary }]}>{ratingCountLabel(count)}</Text>
        </View>

        {bars && !empty ? (
          <View style={styles.bars}>
            {bars.map((bar) => (
              <View key={bar.score} style={styles.barRow}>
                <Text style={[styles.barScore, { color: c.textSecondary }]}>{bar.score}</Text>
                <View style={[styles.barTrack, { backgroundColor: c.surfaceRaised }]}>
                  <View
                    style={[styles.barFill, { backgroundColor: c.gold, width: `${bar.percent}%` }]}
                  />
                </View>
                <Text style={[styles.barCount, { color: c.textMuted }]}>{bar.count}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            {t('rating.summary.empty')}
          </Text>
        )}
      </View>

      {axes && !empty ? (
        <View style={styles.axes}>
          {RATING_AXES.map((axis) => {
            const score = axes[axis.key];
            if (score === null || score === undefined) return null;
            return (
              <View key={axis.key} style={styles.axisRow}>
                <Text style={[styles.axisLabel, { color: c.textSecondary }]}>{axis.label}</Text>
                <StarRating value={score} size={11} showValue />
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* VenueReview                                                         */
/* ------------------------------------------------------------------ */

export interface VenueReviewProps {
  author: string;
  /** Déjà mis en forme par l'application (`relative-time`). */
  when: string;
  score: number;
  comment?: string | null;
  /** Repère « a joué ici » — c'est ce qui rend l'avis crédible. */
  verified?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function VenueReview({
  author,
  when,
  score,
  comment,
  verified = true,
  style,
}: VenueReviewProps) {
  const c = useE237Colors();
  const t = useDsT();
  return (
    <View style={[styles.review, { borderBottomColor: c.border }, style]}>
      <View style={styles.reviewHead}>
        <Text style={[styles.author, { color: c.textPrimary }]}>{author}</Text>
        {verified ? (
          <View style={[styles.playedHere, { backgroundColor: c.accentSubtle }]}>
            <Text style={[styles.playedHereText, { color: c.accent }]}>
              {t('rating.review.played_here')}
            </Text>
          </View>
        ) : null}
        <Text style={[styles.when, { color: c.textMuted }]}>{when}</Text>
      </View>
      <StarRating value={score} size={13} />
      {comment ? <Text style={[styles.comment, { color: c.textSecondary }]}>{comment}</Text> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* RatingGateNotice                                                    */
/* ------------------------------------------------------------------ */

export interface RatingGateNoticeProps {
  gate: RatingGate;
  style?: StyleProp<ViewStyle>;
}

/** Pourquoi le joueur ne peut pas (encore) noter — la condition, pas un refus. */
export function RatingGateNotice({ gate, style }: RatingGateNoticeProps) {
  const c = useE237Colors();
  if (gate === 'open') return null;
  return (
    <View
      style={[
        styles.gate,
        { backgroundColor: c.surfaceRaised, borderColor: c.border },
        style,
      ]}>
      <Lock size={16} color={c.textMuted} />
      <Text style={[styles.gateText, { color: c.textSecondary }]}>
        {RATING_GATE_MESSAGE[gate]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing['1-5'] },
  stars: { flexDirection: 'row', alignItems: 'center' },
  overlay: { position: 'absolute', left: 0, top: 0, overflow: 'hidden' },
  value: { fontSize: font.size.sm, fontWeight: font.weight.semibold },

  inputBlock: { gap: spacing['2'] },
  disabled: { opacity: 0.6 },
  starButton: { paddingHorizontal: 2, paddingVertical: spacing['1'] },
  pressed: { opacity: 0.7 },
  hint: { fontSize: font.size.xs },

  summary: { gap: spacing['4'] },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: spacing['4'] },
  summaryScore: { alignItems: 'center', gap: spacing['1'] },
  average: { fontSize: 34, fontWeight: font.weight.bold, lineHeight: 36 },
  count: { fontSize: font.size.xs },
  bars: { flex: 1, gap: spacing['1'] },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  barScore: { width: 12, fontSize: font.size.xs, fontVariant: ['tabular-nums'] },
  barTrack: { flex: 1, height: 6, borderRadius: radius.full, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.full },
  barCount: { width: 28, textAlign: 'right', fontSize: font.size.xs },
  emptyText: { flex: 1, fontSize: font.size.sm },

  axes: { gap: spacing['2'] },
  axisRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  axisLabel: { fontSize: font.size.xs },

  review: { gap: spacing['2'], paddingVertical: spacing['3'], borderBottomWidth: StyleSheet.hairlineWidth },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  author: { fontSize: font.size.sm, fontWeight: font.weight.semibold },
  playedHere: { borderRadius: radius.full, paddingHorizontal: spacing['2'], paddingVertical: 2 },
  playedHereText: {
    fontSize: 10,
    fontWeight: font.weight.semibold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  when: { marginLeft: 'auto', fontSize: font.size.xs },
  comment: { fontSize: font.size.sm },

  gate: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['2'],
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing['3'],
  },
  gateText: { flex: 1, fontSize: font.size.sm },
});
