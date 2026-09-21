/**
 * Bloc d'encaissement (natif) — jumeau de `./web/payout-card`.
 *
 * Le natif l'avait déjà factorisé (`PayoutCard` de
 * `apps/mobile/src/components/ui/primitives.tsx`) mais il embarquait le
 * `POST …/payout` ; ici il ne reçoit que `onPayout`, `busy` et `error`.
 */
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useDsT } from '../i18n';
import { formatXaf } from '../lib/money';
import { Button, Card, font, spacing } from './core';
import { Notice } from './notice';
import { Txt } from './text';

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
  return (
    <View style={[styles.row, style]}>
      <Txt variant="body" size={13} tone="secondary">
        {label}
      </Txt>
      <Txt
        variant={strong ? 'bodyBold' : 'bodyMedium'}
        size={font.size.md}
        tone={strong ? 'gold' : 'primary'}
      >
        {value}
      </Txt>
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
  netLabel,
  payableLabel,
  style,
}: PayoutCardProps) {
  const t = useDsT();
  return (
    <Card style={[styles.card, style]}>
      <LabelValueRow label={netLabel ?? t('money.payout.net')} value={formatXaf(netXaf)} />
      {payableXaf > 0 ? (
        <>
          <LabelValueRow
            label={payableLabel ?? t('money.payout.payable')}
            value={formatXaf(payableXaf)}
            strong
          />
          {error ? <Notice tone="danger">{error}</Notice> : null}
          <Button
            label={
              busy
                ? t('money.payout.processing')
                : t('money.payout.collect', { amount: formatXaf(payableXaf) })
            }
            disabled={busy}
            style={styles.btn}
            onPress={onPayout}
          />
        </>
      ) : (
        <Txt variant="caption" tone="muted">
          {t('money.payout.upToDate')}
        </Txt>
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
  btn: { minHeight: 44 },
});
