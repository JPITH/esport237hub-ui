/**
 * Portefeuille (natif) — jumeaux de `./web/wallet`, mêmes noms, mêmes props.
 * La ligne de transaction était écrite à l'identique des deux côtés.
 */
import { ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { formatXaf } from '../lib/money';
import { TOPUP_PRESETS } from '../lib/wallet';
import {
  font,
  pill,
  radius,
  spacing,
  useE237Colors,
  withAlpha,
  Card,
} from './core';
import { Skeleton } from './primitives';
import { Txt } from './text';

/* ------------------------------------------------------------------ */
/* BalanceCard                                                         */
/* ------------------------------------------------------------------ */

export interface BalanceCardProps {
  /** Solde en FCFA ; `null` = encore en chargement (squelette). */
  balanceXaf: number | null;
  /** Intitulé au-dessus du montant (défaut « Solde disponible »). */
  label?: string;
  /** Boutons d'action sous le montant. */
  actions?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function BalanceCard({
  balanceXaf,
  label = 'Solde disponible',
  actions,
  style,
}: BalanceCardProps) {
  const c = useE237Colors();
  return (
    <Card style={[styles.balance, style]}>
      <View style={styles.balanceHead}>
        <WalletIcon color={c.textSecondary} size={18} />
        <Txt variant="bodyMedium" tone="secondary">
          {label}
        </Txt>
      </View>
      {balanceXaf === null ? (
        <Skeleton height={36} />
      ) : (
        <Txt variant="numeric" tone="accent" size={font.size['2xl']}>
          {formatXaf(balanceXaf)}
        </Txt>
      )}
      {actions ? <View style={styles.balanceActions}>{actions}</View> : null}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* TransactionRow                                                      */
/* ------------------------------------------------------------------ */

export interface TransactionRowProps {
  /** `credit` = argent qui entre (vert, flèche entrante). */
  direction: 'credit' | 'debit';
  /** Motif lisible (`transaction.reason` ou `walletSourceLabel(source)`). */
  label: string;
  /** Date déjà mise en forme par l'appelant (`formatDate`). */
  dateLabel: string;
  amountXaf: number;
  style?: StyleProp<ViewStyle>;
}

/** Ligne de journal financier : pastille teintée, motif + date, montant signé. */
export function TransactionRow({
  direction,
  label,
  dateLabel,
  amountXaf,
  style,
}: TransactionRowProps) {
  const c = useE237Colors();
  const credit = direction === 'credit';
  const tone = credit ? c.success : c.danger;

  return (
    <View style={[styles.txRow, style]}>
      <View
        style={[
          styles.txIcon,
          { backgroundColor: withAlpha(tone, pill.fill.dark) },
        ]}
      >
        {credit ? (
          <ArrowDownLeft color={tone} size={18} />
        ) : (
          <ArrowUpRight color={tone} size={18} />
        )}
      </View>
      <View style={styles.txBody}>
        <Txt variant="bodyMedium" numberOfLines={1}>
          {label}
        </Txt>
        <Txt variant="caption" tone="muted">{dateLabel}</Txt>
      </View>
      <Txt variant="bodyBold" color={tone}>
        {credit ? '+' : '−'}
        {formatXaf(amountXaf)}
      </Txt>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* AmountPresets                                                       */
/* ------------------------------------------------------------------ */

export interface AmountPresetsProps {
  /** Montants proposés (défaut `TOPUP_PRESETS` : 1000 / 2000 / 5000 / 10000). */
  presets?: readonly number[];
  value: number | null;
  onSelect: (amount: number) => void;
  style?: StyleProp<ViewStyle>;
}

/** Rangée de montants en un appui — recharge du portefeuille. */
export function AmountPresets({
  presets = TOPUP_PRESETS,
  value,
  onSelect,
  style,
}: AmountPresetsProps) {
  const c = useE237Colors();
  return (
    <View style={[styles.presets, style]}>
      {presets.map((preset) => {
        const active = value === preset;
        return (
          <Pressable
            key={preset}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(preset)}
            style={({ pressed }) => [
              styles.preset,
              active
                ? { backgroundColor: c.accent, borderColor: c.accent }
                : { backgroundColor: c.surface, borderColor: c.border },
              pressed && styles.pressed,
            ]}
          >
            <Txt variant="label" tone={active ? 'onAccent' : 'primary'}>
              {formatXaf(preset)}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  balance: { gap: spacing['3'] },
  balanceHead: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  balanceActions: { flexDirection: 'row', gap: spacing['2'] },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txBody: { flex: 1, gap: 1 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] },
  preset: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['3'],
    minHeight: 40,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
});
