/**
 * Drapeaux en SVG (jamais d'emoji : leur rendu dépend du système, et Windows
 * n'affiche que deux lettres). Couleurs nationales officielles — les seules
 * couleurs écrites en dur du design system, parce qu'elles ne sont pas les
 * nôtres. Dessins simplifiés pour 18 × 12 px : les armoiries des drapeaux qui
 * en portent (Guinée équatoriale) sont omises, illisibles à cette taille.
 *
 * Pays couverts : ceux de `lib/phone-countries.ts`. Un code inconnu rend ses
 * deux lettres dans un cartouche neutre plutôt qu'un faux drapeau.
 */
import type { ReactNode } from 'react';

const STAR = '45,22 47,27.25 52.6,27.53 48.23,31.05 49.7,36.47 45,33.4 40.3,36.47 41.77,31.05 37.4,27.53 43,27.25';

/** Trois bandes verticales. */
function vertical(a: string, b: string, c: string, extra?: ReactNode) {
  return (
    <>
      <rect x="0" width="30" height="60" fill={a} />
      <rect x="30" width="30" height="60" fill={b} />
      <rect x="60" width="30" height="60" fill={c} />
      {extra}
    </>
  );
}

/** Trois bandes horizontales. */
function horizontal(a: string, b: string, c: string, extra?: ReactNode) {
  return (
    <>
      <rect y="0" width="90" height="20" fill={a} />
      <rect y="20" width="90" height="20" fill={b} />
      <rect y="40" width="90" height="20" fill={c} />
      {extra}
    </>
  );
}

const FLAGS: Record<string, { name: string; draw: () => ReactNode }> = {
  CM: {
    name: 'Cameroun',
    draw: () => vertical('#007a5e', '#ce1126', '#fcd116', <polygon fill="#fcd116" points={STAR} />),
  },
  GA: { name: 'Gabon', draw: () => horizontal('#009e60', '#fcd116', '#3a75c4') },
  TD: { name: 'Tchad', draw: () => vertical('#002664', '#fecb00', '#c60c30') },
  CG: {
    name: 'Congo',
    draw: () => (
      <>
        <rect width="90" height="60" fill="#fbde4a" />
        <polygon points="0,0 60,0 0,60" fill="#009543" />
        <polygon points="90,0 90,60 30,60" fill="#dc241f" />
      </>
    ),
  },
  CF: {
    name: 'Centrafrique',
    draw: () => (
      <>
        <rect y="0" width="90" height="15" fill="#003082" />
        <rect y="15" width="90" height="15" fill="#ffffff" />
        <rect y="30" width="90" height="15" fill="#289728" />
        <rect y="45" width="90" height="15" fill="#ffce00" />
        <rect x="37.5" width="15" height="60" fill="#d21034" />
        <polygon fill="#ffce00" points="15,2 16.8,6.5 21.5,6.7 17.8,9.6 19.1,14.2 15,11.6 10.9,14.2 12.2,9.6 8.5,6.7 13.2,6.5" />
      </>
    ),
  },
  GQ: {
    name: 'Guinée équatoriale',
    draw: () => horizontal('#3e9a00', '#ffffff', '#e32118', <polygon points="0,0 22,30 0,60" fill="#0073ce" />),
  },
  NG: { name: 'Nigeria', draw: () => vertical('#008751', '#ffffff', '#008751') },
  CI: { name: 'Côte d’Ivoire', draw: () => vertical('#f77f00', '#ffffff', '#009e60') },
  SN: {
    name: 'Sénégal',
    draw: () => vertical('#00853f', '#fdef42', '#e31b23', <polygon fill="#00853f" points={STAR} />),
  },
  FR: { name: 'France', draw: () => vertical('#002395', '#ffffff', '#ed2939') },
  BE: { name: 'Belgique', draw: () => vertical('#000000', '#fdda24', '#ef3340') },
};

/** Drapeau du Cameroun en SVG (pas d'emoji). Plateforme centrée Cameroun. */
export function CameroonFlag({ className }: { className?: string }) {
  return <Flag country="CM" className={className} />;
}

/**
 * Drapeau d'un pays, par code ISO alpha-2. Cameroun par défaut.
 * `decorative` : le nom du pays est déjà écrit à côté (menu d'indicatifs) —
 * le drapeau ne le répète pas aux lecteurs d'écran.
 */
export function Flag({
  country = 'CM',
  className,
  decorative = false,
}: {
  country?: string;
  className?: string;
  decorative?: boolean;
}) {
  const flag = FLAGS[country.toUpperCase()];
  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': flag?.name ?? country };
  if (!flag) {
    return (
      <svg viewBox="0 0 90 60" className={className} preserveAspectRatio="xMidYMid slice" {...a11y}>
        <rect width="90" height="60" rx="6" fill="currentColor" opacity="0.18" />
        <text x="45" y="40" textAnchor="middle" fontSize="28" fontWeight="700" fill="currentColor">
          {country.toUpperCase().slice(0, 2)}
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 90 60" className={className} preserveAspectRatio="xMidYMid slice" {...a11y}>
      {flag.draw()}
    </svg>
  );
}
