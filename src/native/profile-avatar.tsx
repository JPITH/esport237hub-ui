/**
 * Avatar de joueur (natif) — photo si l'API en résout une, initiales sinon.
 *
 * Le repli n'est PAS l'icône « image cassée » de `MediaImage` : sur un profil,
 * l'absence de photo est la normale (une photo de joueur reste privée tant
 * qu'un administrateur ne l'a pas approuvée), pas un incident. On garde donc
 * la pastille à initiales du design system — et c'est `Avatar` qui la peint,
 * avec la MÊME règle d'initiales que le web (`../lib/initials`).
 *
 * `Avatar` porte aussi le repli d'ERREUR : une URL qui casse (média retiré,
 * réseau, 403 sur un média redevenu privé) retombe sur les initiales au lieu
 * de laisser un rond vide. C'est le comportement du jumeau web depuis
 * toujours ; le natif ne l'avait pas.
 *
 * Jumeau web : `ProfileAvatar` de `@esport237hub/ui/web`, mêmes props.
 */
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Avatar } from './primitives';

export interface ProfileAvatarProps {
  /** URL résolue par l'API (`profile.avatar_url`) ou aperçu local. */
  src?: string | null;
  /** Nom affiché — initiales de repli et description accessible. */
  name: string | null | undefined;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProfileAvatar({ src, name, size = 56, style }: ProfileAvatarProps) {
  // `style` s'appliquait autrefois au seul cas « avec photo » : la pastille à
  // initiales ignorait donc les marges de son écran.
  return (
    <View style={style}>
      <Avatar name={name} src={src} size={size} />
    </View>
  );
}
