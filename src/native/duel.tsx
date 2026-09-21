/**
 * Duels (natif) — jumeaux de `./web/duel`, mêmes noms, mêmes props
 * (la navigation passe par `onPress` au lieu de `href`).
 */
import type { DuelStatus } from '@esport237hub/types';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useDsT } from '../i18n';
import { Badge, Card, font, radius, spacing, useNeu } from './core';
import { DuelStatusBadge } from './duel-status-badge';
import { Txt } from './text';

/* ------------------------------------------------------------------ */
/* DuelRow                                                             */
/* ------------------------------------------------------------------ */

export interface DuelRowProps {
  /** Ouverture du détail ; absent = ligne non pressable. */
  onPress?: () => void;
  /** Pseudo du challenger ; `null` → « ? ». */
  challengerName?: string | null;
  /** Pseudo de l'adversaire ; `null` → « adversaire ouvert ». */
  opponentName?: string | null;
  gameName?: string | null;
  isOnline: boolean;
  /** Date déjà mise en forme (programmée, sinon création). */
  dateLabel: string;
  challengerScore: number | null;
  opponentScore: number | null;
  status: DuelStatus;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ligne de liste d'un duel : adversaires, contexte, score et statut.
 *
 * TROIS RÈGLES DE MISE EN PAGE, TIRÉES D'UNE RECETTE AU TÉLÉPHONE
 *
 * 1. **Une ligne fait toujours la même hauteur.** Le libellé de contexte
 *    n'était pas borné : « EA SPORTS FC 27 · En salle · 11 sept., 08:19 »
 *    passait à la ligne, celui d'à côté non, et la liste montrait des cartes
 *    de deux tailles en alternance. Les deux textes sont désormais sur une
 *    ligne avec ellipse, et la ligne porte une hauteur minimale.
 *
 * 2. **Les statuts s'alignent en colonne.** Sans largeur minimale à droite,
 *    chaque pastille commençait où finissait son texte — « Validé » et
 *    « Salle en attente » ne partageaient aucun bord. Le regard doit pouvoir
 *    descendre la colonne des statuts sans zigzaguer.
 *
 * 3. **Le score ne change pas la hauteur.** Il était EMPILÉ au-dessus de la
 *    pastille : une ligne avec résultat était plus haute qu'une ligne sans.
 *    Il se pose maintenant À CÔTÉ, dans la même rangée.
 *
 * La date passe EN TÊTE du libellé de contexte, avant le jeu et le lieu.
 * L'ellipse mange toujours la fin : avec l'ordre d'avant, « EA SPORTS FC 27 »
 * survivait entier et la date — la seule chose qu'on cherche dans une liste de
 * duels — se coupait en « 11 … ».
 */
export function DuelRow({
  onPress,
  challengerName,
  opponentName,
  gameName,
  isOnline,
  dateLabel,
  challengerScore,
  opponentScore,
  status,
  style,
}: DuelRowProps) {
  const neu = useNeu();
  const t = useDsT();
  const hasScore = challengerScore !== null && opponentScore !== null;

  const body = (pressed: boolean) => (
    <Card style={[styles.row, pressed ? neu.pressedSm : null, style]}>
      <View style={styles.main}>
        <Txt variant="label" numberOfLines={1}>
          {challengerName ?? '?'} vs {opponentName ?? t('ui.openOpponent')}
        </Txt>
        <Txt variant="caption" tone="muted" numberOfLines={1}>
          {dateLabel} · {gameName ?? '—'} ·{' '}
          {isOnline ? t('ui.online') : t('ui.inVenue')}
        </Txt>
      </View>
      <View style={styles.trailing}>
        {hasScore ? (
          <Txt variant="numeric" size={15}>
            {challengerScore}–{opponentScore}
          </Txt>
        ) : null}
        <DuelStatusBadge status={status} />
      </View>
    </Card>
  );

  if (!onPress) return body(false);

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {/*
        Enfoncement neumorphique plutôt qu'un `opacity: 0.85`. Baisser
        l'opacité d'une carte en relief éclaircit ses ombres en même temps que
        son fond : la carte a l'air de s'effacer, pas de s'enfoncer. C'est la
        recette `pressedSm` qui dit « appuyé » dans ce langage visuel.
      */}
      {({ pressed }) => body(pressed)}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* ScoreSide                                                           */
/* ------------------------------------------------------------------ */

export interface ScoreSideProps {
  /** Score ; `null` tant que le résultat n'est pas saisi (« – »). */
  score: number | null;
  /** Pseudo ; `null` → « En attente ». */
  username?: string | null;
  /** Nom civil sous le pseudo (facultatif). */
  name?: string | null;
  winner?: boolean;
  /** Ouverture de la fiche publique du joueur. */
  onPress?: () => void;
  /** Contenu additionnel sous le nom (avatar, drapeau…). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Un côté du tableau de score d'un duel : score, pseudo, nom, badge
 * « Vainqueur ».
 */
export function ScoreSide({
  score,
  username,
  name,
  winner = false,
  onPress,
  children,
  style,
}: ScoreSideProps) {
  const t = useDsT();
  const label = (
    <Txt variant="label">{username ?? t('ui.waiting')}</Txt>
  );

  return (
    <View style={[styles.side, style]}>
      <Txt variant="numeric" size={font.size['3xl']}>
        {score ?? '–'}
      </Txt>
      {onPress && username ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => (pressed ? styles.pressed : undefined)}
        >
          {label}
        </Pressable>
      ) : (
        label
      )}
      {name ? (
        <Txt variant="caption" tone="muted">{name}</Txt>
      ) : null}
      {winner ? <Badge tone="gold">{t('ui.winner')}</Badge> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    borderRadius: radius.lg,
    // Rythme constant de la liste — voir la règle 1 en tête de `DuelRow`.
    minHeight: 72,
  },
  main: { flex: 1, gap: 2, minWidth: 0 },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing['2'],
    // Colonne de statuts alignée — voir la règle 2.
    minWidth: 108,
  },
  side: { alignItems: 'center', gap: spacing['1'] },
  pressed: { opacity: 0.85 },
});
