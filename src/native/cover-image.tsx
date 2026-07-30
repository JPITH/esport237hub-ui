/**
 * Visuels d'évènement et de salle (natif) — jumeaux de `./web/cover-image`.
 *
 * Elles n'ajoutent aucune logique : elles figent le cadre (ratio, arrondi) et
 * le REPLI propre à chaque objet, pour qu'une affiche manquante ressemble
 * partout à la même chose au lieu d'un rectangle vide. Les URLs viennent déjà
 * résolues par l'API (`cover_image_url`, `photo_urls`) : l'application ne
 * fabrique jamais d'URL de stockage.
 */
import { Building2, CalendarDays } from 'lucide-react-native';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { spacing, useE237Colors } from './core';
import { MediaImage } from './media-image';

/** Arrondis proposés — sous-ensemble de `MediaRounded` utile aux visuels. */
export type CoverRounded = 'md' | 'lg' | 'xl';

export interface EventCoverProps {
  /** `event.cover_image_url` — `null` tant qu'aucune affiche n'est approuvée. */
  src?: string | null;
  /** Titre de l'évènement : sert de description accessible. */
  title: string;
  /** Ratio du cadre ; 16/9 en liste, plus haut sur la fiche. */
  ratio?: number;
  rounded?: CoverRounded;
  style?: StyleProp<ViewStyle>;
}

/** Affiche d'un évènement (liste ou fiche). */
export function EventCover({
  src,
  title,
  ratio = 16 / 9,
  rounded = 'md',
  style,
}: EventCoverProps) {
  const c = useE237Colors();
  return (
    <MediaImage
      src={src}
      alt={`Affiche de l’évènement ${title}`}
      ratio={ratio}
      rounded={rounded}
      fallbackIcon={<CalendarDays color={c.textMuted} size={26} strokeWidth={1.25} />}
      fallbackLabel="Affiche à venir"
      style={style}
    />
  );
}

export interface VenuePhotoProps {
  /** URL déjà résolue par l'API (`photo_urls[i]`). */
  src?: string | null;
  /** Nom de la salle : sert de description accessible. */
  name: string;
  ratio?: number;
  rounded?: CoverRounded;
  style?: StyleProp<ViewStyle>;
}

/** Photo d'une salle partenaire. */
export function VenuePhoto({
  src,
  name,
  ratio = 16 / 9,
  rounded = 'md',
  style,
}: VenuePhotoProps) {
  const c = useE237Colors();
  return (
    <MediaImage
      src={src}
      alt={`Photo de la salle ${name}`}
      ratio={ratio}
      rounded={rounded}
      fallbackIcon={<Building2 color={c.textMuted} size={26} strokeWidth={1.25} />}
      fallbackLabel="Photo à venir"
      style={style}
    />
  );
}

export interface VenuePhotoStripProps {
  photos: readonly string[];
  name: string;
  /** Largeur d'une vignette du bandeau (défaut 220 px). */
  width?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bandeau horizontal des photos d'une salle. Sans photo, on montre UN cadre
 * de repli plutôt que rien : le joueur comprend que l'emplacement existe.
 */
export function VenuePhotoStrip({
  photos,
  name,
  width = 220,
  style,
}: VenuePhotoStripProps) {
  if (photos.length === 0) {
    return <VenuePhoto name={name} style={style} />;
  }
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
      style={style}
    >
      {photos.map((url) => (
        <View key={url} style={{ width }}>
          <VenuePhoto src={url} name={name} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: { gap: spacing['2'] },
});
