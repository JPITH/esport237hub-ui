/** Drapeau du Cameroun en SVG (pas d'emoji) — port du composant web. */
import { View } from 'react-native';
import Svg, { Polygon, Rect } from 'react-native-svg';

export function CameroonFlag({ width = 26, height = 17 }: { width?: number; height?: number }) {
  return (
    <View style={{ width, height, borderRadius: 2, overflow: 'hidden' }}>
      <Svg width={width} height={height} viewBox="0 0 90 60" preserveAspectRatio="xMidYMid slice">
        <Rect x="0" width="30" height="60" fill="#007a5e" />
        <Rect x="30" width="30" height="60" fill="#ce1126" />
        <Rect x="60" width="30" height="60" fill="#fcd116" />
        <Polygon
          fill="#fcd116"
          points="45,22 47,27.25 52.6,27.53 48.23,31.05 49.7,36.47 45,33.4 40.3,36.47 41.77,31.05 37.4,27.53 43,27.25"
        />
      </Svg>
    </View>
  );
}

/** Sélecteur de drapeau (extensible ; Cameroun par défaut). */
export function Flag({
  country = 'CM',
  width,
  height,
}: {
  country?: string;
  width?: number;
  height?: number;
}) {
  void country; // Un seul pays au lancement.
  return <CameroonFlag width={width} height={height} />;
}
