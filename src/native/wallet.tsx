/**
 * Portefeuille (natif) — jumeaux de `./web/wallet`, mêmes noms, mêmes props.
 * La ligne de transaction était écrite à l'identique des deux côtés.
 */
import { ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
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
        <Text style={[styles.balanceLabel, { color: c.textSecondary }]}>
          {label}
        </Text>
      </View>
      {balanceXaf === null ? (
        <Skeleton height={36} />
      ) : (
        <Text style={[styles.balanceValue, { color: c.accent }]}>
          {formatXaf(balanceXaf)}
        </Text>
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
        <Text style={[styles.txLabel, { color: c.textPrimary }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.txDate, { color: c.textMuted }]}>{dateLabel}</Text>
      </View>
      <Text style={[styles.txAmount, { color: tone }]}>
        {credit ? '+' : '−'}
        {formatXaf(amountXaf)}
      </Text>
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
            <Text
              style={[
                styles.presetLabel,
                { color: active ? c.onAccent : c.textPrimary },
              ]}
            >
              {formatXaf(preset)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  balance: { gap: spacing['3'] },
  balanceHead: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  balanceLabel: { fontSize: font.size.sm, fontWeight: font.weight.medium },
  balanceValue: { fontSize: font.size['2xl'], fontWeight: font.weight.bold },
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
  txLabel: { fontSize: font.size.sm, fontWeight: font.weight.medium },
  txDate: { fontSize: font.size.xs },
  txAmount: { fontSize: font.size.sm, fontWeight: font.weight.bold },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] },
  preset: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['3'],
    minHeight: 40,
    justifyContent: 'center',
  },
  presetLabel: { fontSize: font.size.sm, fontWeight: font.weight.semibold },
  pressed: { opacity: 0.85 },
});
