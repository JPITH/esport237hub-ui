/**
 * Avatar de joueur (natif) — photo si l'API en résout une, initiale sinon.
 *
 * Le repli n'est PAS l'icône « image cassée » de `MediaImage` : sur un profil,
 * l'absence de photo est la normale (une photo de joueur reste privée tant
 * qu'un administrateur ne l'a pas approuvée), pas un incident. On garde donc
 * la pastille à initiale du design system.
 *
 * Jumeau web : `ProfileAvatar` de `@esport237hub/ui/web`, mêmes props.
 */
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useE237Colors } from './core';
import { MediaImage } from './media-image';
import { Avatar } from './primitives';

export interface ProfileAvatarProps {
  /** URL résolue par l'API (`profile.avatar_url`) ou aperçu local. */
  src?: string | null;
  /** Nom affiché — initiale de repli et description accessible. */
  name: string | null | undefined;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProfileAvatar({ src, name, size = 56, style }: ProfileAvatarProps) {
  const c = useE237Colors();

  if (!src) {
    return <Avatar name={name ?? '?'} size={size} />;
  }

  return (
    <View style={[{ width: size }, style]}>
      <MediaImage
        src={src}
        alt={`Photo de profil de ${name ?? 'joueur'}`}
        ratio={1}
        rounded="full"
        style={{ borderColor: c.border }}
      />
    </View>
  );
}
