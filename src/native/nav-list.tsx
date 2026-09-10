/**
 * Liste de navigation groupée — une carte, des rangées compactes.
 *
 * POURQUOI ELLE EXISTE
 * L'écran Profil enchaînait sept `ListRow` : sept cartes en relief, 72 px de
 * haut, chacune avec une vignette carrée de 56 px… restée vide, parce qu'une
 * entrée de menu n'a pas d'image. Résultat, un menu de sept liens occupait
 * deux écrans et demi de défilement, et sept ombres portées se répondaient
 * sans hiérarchie. `ListRow` est faite pour du CONTENU (une salle, un
 * évènement, une commande) ; un menu, c'est autre chose.
 *
 * Le relief se joue donc au niveau du GROUPE, pas de la rangée : une seule
 * carte `neu.card`, des rangées séparées par un filet, et l'enfoncement
 * (`neu.pressedSm`) réservé à la rangée touchée. C'est la même grammaire
 * neumorphique, appliquée à la bonne échelle.
 */
import type { ReactNode } from 'react';
import { Children, isValidElement, cloneElement } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ChevronRight } from 'lucide-react-native';

import { radius, spacing, useE237Colors, useNeu } from './core';
import { haptic } from './haptics';
import { Txt } from './text';

export interface NavItemProps {
  /** Pictogramme, posé dans une pastille teintée de 36 px. */
  icon?: ReactNode;
  /** Teinte de la pastille — par défaut l'accent de la marque. */
  tint?: string;
  label: string;
  /** Une ligne d'explication sous le libellé. Facultative, et coupée à une ligne. */
  hint?: string;
  /** Contenu à droite, à la place du chevron (compteur, interrupteur…). */
  trailing?: ReactNode;
  onPress: () => void;
  /** Posé par `NavGroup` : la dernière rangée ne porte pas de filet. */
  last?: boolean;
}

export function NavItem({
  icon,
  tint,
  label,
  hint,
  trailing,
  onPress,
  last = false,
}: NavItemProps) {
  const c = useE237Colors();
  const neu = useNeu();
  const tone = tint ?? c.accent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={onPress}
      onPressIn={() => haptic('light')}
      style={({ pressed }) => [
        styles.item,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
        pressed ? neu.pressedSm : null,
      ]}
    >
      {icon ? (
        <View style={[styles.badge, { backgroundColor: `${tone}1f` }]}>{icon}</View>
      ) : null}

      <View style={styles.body}>
        <Txt variant="label" numberOfLines={1}>
          {label}
        </Txt>
        {hint ? (
          <Txt variant="caption" tone="secondary" numberOfLines={1}>
            {hint}
          </Txt>
        ) : null}
      </View>

      {trailing ?? <ChevronRight color={c.textMuted} size={18} />}
    </Pressable>
  );
}

export function NavGroup({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useE237Colors();
  const neu = useNeu();

  // `last` est posé ici et non par l'écran : un menu gagne et perd des entrées
  // selon le rôle (propriétaire de salle, opérateur), et c'est exactement le
  // genre de détail qu'un appelant oublie de mettre à jour.
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <View
      style={[
        styles.group,
        { backgroundColor: c.surfaceRaised },
        neu.card,
        style,
      ]}
    >
      {items.map((child, index) =>
        cloneElement(child as React.ReactElement<NavItemProps>, {
          last: index === items.length - 1,
        }),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    // 56 px : au-dessus de la cible tactile de 44 px, sans le volume d'une
    // `ListRow` de 72 px dont on n'a pas besoin ici.
    minHeight: 56,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0, gap: 2 },
});
