/**
 * Choix d'une catégorie de billet (natif) — jumeau de `./web/tier-picker`.
 *
 * Divulgation progressive : la liste ne montre que nom, prix et
 * disponibilité. Avantages et restrictions n'apparaissent que sur la
 * catégorie sélectionnée.
 */
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useDsT } from '../i18n';
import { Badge, radius, spacing, useE237Colors } from './core';
import { PerkList } from './perk-list';
import { Txt } from './text';

export interface TierOption {
  id: string;
  name: string;
  /** Prix déjà mis en forme (« 2 000 FCFA », « Gratuit »). */
  priceLabel: string;
  /** Description courte, montrée seulement sur la catégorie choisie. */
  description?: string | null;
  /** Ex. « 12 places restantes », « Complet » ; absent = rien à signaler. */
  availabilityLabel?: string | null;
  /** Catégorie encore achetable ; sinon grisée et non sélectionnable. */
  buyable: boolean;
  perks?: readonly string[] | null;
  limitations?: readonly string[] | null;
}

export interface TierPickerProps {
  tiers: readonly TierOption[];
  value: string | null;
  onChange: (tierId: string) => void;
  /** Libellé du groupe (accessibilité) — défaut « Catégorie de billet ». */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function TierPicker({
  tiers,
  value,
  onChange,
  label,
  style,
}: TierPickerProps) {
  const c = useE237Colors();
  const t = useDsT();
  const groupLabel = label ?? t('form.tier.groupLabel');

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={groupLabel} style={[styles.group, style]}>
      {tiers.map((tier) => {
        const selected = tier.id === value;
        const hasDetails =
          Boolean(tier.perks?.length) || Boolean(tier.limitations?.length);
        return (
          <View
            key={tier.id}
            style={[
              styles.tier,
              {
                borderColor: selected ? c.accent : c.border,
                backgroundColor: c.surface,
              },
              !tier.buyable && styles.disabled,
            ]}
          >
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: !tier.buyable }}
              disabled={!tier.buyable}
              onPress={() => onChange(tier.id)}
              style={({ pressed }) => [styles.head, pressed && styles.pressed]}
            >
              <View style={styles.headMain}>
                <Txt variant="label" numberOfLines={1}>
                  {tier.name}
                </Txt>
                {tier.availabilityLabel ? (
                  <Badge tone={tier.buyable ? 'neutral' : 'danger'}>
                    {tier.availabilityLabel}
                  </Badge>
                ) : null}
              </View>
              <Txt variant="bodyBold" tone="accent">
                {tier.priceLabel}
              </Txt>
            </Pressable>

            {selected ? (
              <View style={[styles.details, { borderTopColor: c.border }]}>
                {tier.description ? (
                  <Txt variant="caption" tone="secondary">
                    {tier.description}
                  </Txt>
                ) : null}
                <PerkList items={tier.perks} />
                <PerkList items={tier.limitations} variant="limitation" />
                {!hasDetails ? (
                  <Txt variant="caption" tone="muted">
                    {t('form.tier.noDetails')}
                  </Txt>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing['2'] },
  tier: { borderWidth: 1, borderRadius: radius.lg, padding: spacing['3'] },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing['3'],
  },
  headMain: { flex: 1, gap: spacing['1'], alignItems: 'flex-start' },
  details: {
    marginTop: spacing['3'],
    paddingTop: spacing['3'],
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing['2'],
  },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
});
