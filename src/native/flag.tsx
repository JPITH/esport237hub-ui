/**
 * Drapeau du Cameroun en SVG (jamais d'emoji) — port du composant web.
 *
 * Le SVG SEUL : ni bordure, ni arrondi, ni conteneur. Le cadrage et
 * l'espacement appartiennent à l'appelant (`.pcard__flag` côté web, le style
 * `flag` de player-card côté natif) — sinon les habillages s'empilent.
 *
 * Par défaut il remplit son parent, comme la règle web `.pcard__flag svg`.
 * Une taille explicite reste possible pour un usage isolé.
 */
import Svg, { Polygon, Rect } from 'react-native-svg';

export function CameroonFlag({
  width = '100%',
  height = '100%',
}: {
  width?: number | string;
  height?: number | string;
}) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 90 60"
      preserveAspectRatio="xMidYMid slice">
      <Rect x="0" width="30" height="60" fill="#007a5e" />
      <Rect x="30" width="30" height="60" fill="#ce1126" />
      <Rect x="60" width="30" height="60" fill="#fcd116" />
      <Polygon
        fill="#fcd116"
        points="45,22 47,27.25 52.6,27.53 48.23,31.05 49.7,36.47 45,33.4 40.3,36.47 41.77,31.05 37.4,27.53 43,27.25"
      />
    </Svg>
  );
}

/** Sélecteur de drapeau (extensible ; Cameroun par défaut). */
export function Flag({
  country = 'CM',
  width,
  height,
}: {
  country?: string;
  width?: number | string;
  height?: number | string;
}) {
  void country; // Un seul pays au lancement.
  return <CameroonFlag width={width} height={height} />;
}
