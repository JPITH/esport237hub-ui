/** Drapeau du Cameroun en SVG (pas d'emoji). Plateforme centrée Cameroun. */
export function CameroonFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 90 60"
      className={className}
      role="img"
      aria-label="Cameroun"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect x="0" width="30" height="60" fill="#007a5e" />
      <rect x="30" width="30" height="60" fill="#ce1126" />
      <rect x="60" width="30" height="60" fill="#fcd116" />
      <polygon
        fill="#fcd116"
        points="45,22 47,27.25 52.6,27.53 48.23,31.05 49.7,36.47 45,33.4 40.3,36.47 41.77,31.05 37.4,27.53 43,27.25"
      />
    </svg>
  );
}

/** Sélecteur de drapeau (extensible ; Cameroun par défaut). */
export function Flag({
  country = "CM",
  className,
}: {
  country?: string;
  className?: string;
}) {
  // Un seul pays au lancement ; l'API pourra renvoyer d'autres codes plus tard.
  void country;
  return <CameroonFlag className={className} />;
}
