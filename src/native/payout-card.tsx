/**
 * Bloc d'encaissement (natif) — jumeau de `./web/payout-card`.
 *
 * Le natif l'avait déjà factorisé (`PayoutCard` de
 * `apps/mobile/src/components/ui/primitives.tsx`) mais il embarquait le
 * `POST …/payout` ; ici il ne reçoit que `onPayout`, `busy` et `error`.
 */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { formatXaf } from '../lib/money';
import { Button, Card, font, spacing, useE237Colors } from './core';
import { Notice } from './notice';

/* ------------------------------------------------------------------ */
/* LabelValueRow                                                       */
/* ------------------------------------------------------------------ */

export interface LabelValueRowProps {
  label: ReactNode;
  value: ReactNode;
  /** Met la valeur en avant (or) — « À reverser », montants à payer. */
  strong?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Ligne « libellé à gauche / valeur à droite ». */
export function LabelValueRow({
  label,
  value,
  strong = false,
  style,
}: LabelValueRowProps) {
  const c = useE237Colors();
  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <Text
        style={[
          styles.value,
          strong
            ? { color: c.gold, fontWeight: font.weight.bold }
            : { color: c.textPrimary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* PayoutCard                                                          */
/* ------------------------------------------------------------------ */

export interface PayoutCardProps {
  /** Recette nette accumulée. */
  netXaf: number;
  /** Montant encore à reverser ; `0` → « À jour ». */
  payableXaf: number;
  /** Encaissement en cours (POST côté application). */
  busy?: boolean;
  /** Message d'échec de l'encaissement. */
  error?: string | null;
  onPayout: () => void;
  netLabel?: string;
  payableLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function PayoutCard({
  netXaf,
  payableXaf,
  busy = false,
  error,
  onPayout,
  netLabel = 'Recette',
  payableLabel = 'À reverser',
  style,
}: PayoutCardProps) {
  const c = useE237Colors();
  return (
    <Card style={[styles.card, style]}>
      <LabelValueRow label={netLabel} value={formatXaf(netXaf)} />
      {payableXaf > 0 ? (
        <>
          <LabelValueRow label={payableLabel} value={formatXaf(payableXaf)} strong />
          {error ? <Notice tone="danger">{error}</Notice> : null}
          <Button
            label={busy ? 'Encaissement…' : `Encaisser ${formatXaf(payableXaf)}`}
            disabled={busy}
            style={styles.btn}
            onPress={onPayout}
          />
        </>
      ) : (
        <Text style={[styles.upToDate, { color: c.textMuted }]}>
          À jour — rien à reverser.
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing['3'] },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing['2'],
  },
  label: { fontSize: 13 },
  value: { fontSize: font.size.md, fontWeight: font.weight.semibold },
  btn: { minHeight: 44 },
  upToDate: { fontSize: font.size.xs },
});
