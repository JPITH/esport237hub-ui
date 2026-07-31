/**
 * Composants du site vitrine (`apps/marketing`, Astro).
 *
 * Contraintes propres à la vitrine, différentes du dashboard :
 *
 * 1. **Zéro JavaScript.** Ces composants sont rendus côté serveur par Astro
 *    sans directive `client:*` : aucun runtime React n'est envoyé au visiteur.
 *    Donc pas de `useState`, pas de `useEffect`, pas de gestionnaire d'événement.
 *    Les interactions se font en CSS (`:hover`, `:active`, `:focus-visible`) ou
 *    en HTML natif (`<details>` pour l'accordéon FAQ).
 * 2. **Icônes par nom.** Astro ne peut pas passer un élément React en prop
 *    depuis un `.astro` : les composants reçoivent un nom d'icône (`string`) et
 *    résolvent eux-mêmes le glyphe Lucide. Cela permet aussi de décrire les
 *    sections dans de simples fichiers de données.
 * 3. **Relief neumorphique** composé uniquement des tokens `--e237-neu-*` —
 *    jamais de `box-shadow` littérale (cf. DESIGN.md).
 *
 * Les classes `.mkt-*` correspondantes vivent dans `src/theme/components.css`.
 */
import type { HTMLAttributes, ReactNode } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Coins,
  Crown,
  EyeOff,
  Gamepad2,
  Gauge,
  Handshake,
  Info,
  Landmark,
  ListChecks,
  Lock,
  Mail,
  MapPin,
  Medal,
  MonitorPlay,
  Newspaper,
  Percent,
  Phone,
  Puzzle,
  QrCode,
  Radar,
  ScrollText,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Swords,
  Ticket,
  Timer,
  TrendingUp,
  Trophy,
  UserRound,
  Users,
  Video,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/* Registre d'icônes — Lucide uniquement, jamais d'emoji (cf. DESIGN.md) */
/* ------------------------------------------------------------------ */

const ICONS = {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Coins,
  Crown,
  EyeOff,
  Gamepad2,
  Gauge,
  Handshake,
  Info,
  Landmark,
  ListChecks,
  Lock,
  Mail,
  MapPin,
  Medal,
  MonitorPlay,
  Newspaper,
  Percent,
  Phone,
  Puzzle,
  QrCode,
  Radar,
  ScrollText,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Swords,
  Ticket,
  Timer,
  TrendingUp,
  Trophy,
  UserRound,
  Users,
  Video,
  Wallet,
  Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export interface GlyphProps {
  name?: string;
  size?: number;
  className?: string;
}

/**
 * Rend une icône Lucide à partir de son nom.
 * Nom inconnu ou absent → rien (pas de glyphe de repli hasardeux).
 */
export function Glyph({ name, size = 20, className }: GlyphProps) {
  if (!name) return null;
  const Icon = ICONS[name as IconName];
  if (!Icon) return null;
  return <Icon size={size} className={className} aria-hidden strokeWidth={1.75} />;
}

/* ------------------------------------------------------------------ */
/* Marque                                                              */
/* ------------------------------------------------------------------ */

export interface BrandLogoProps {
  /** Cible du lien ; omis → rendu en simple `<span>` (footer). */
  href?: string;
  /** Chemin du logo servi par l'app (`/brand/logo.png`). */
  src?: string;
  size?: number;
  /** Masque le mot-clé texte sous le seuil `sm` (header mobile). */
  compactWordmark?: boolean;
  className?: string;
}

/**
 * Logo + mot-clé « ESPORT 237 HUB », identiques au dashboard
 * (`apps/web/src/components/app-shell.tsx`) : image réelle, jamais une
 * initiale dessinée en CSS.
 */
export function BrandLogo({
  href,
  src = '/brand/logo.png',
  size = 36,
  compactWordmark = false,
  className,
}: BrandLogoProps) {
  const inner = (
    <>
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="mkt-brand__img"
        style={{ width: size, height: size }}
        loading="eager"
        decoding="async"
      />
      <span className={cx('mkt-brand__word', compactWordmark && 'mkt-brand__word--compact')}>
        ESPORT <span className="mkt-brand__accent">237</span> HUB
      </span>
    </>
  );

  if (!href) {
    return <span className={cx('mkt-brand', className)}>{inner}</span>;
  }
  return (
    <a href={href} className={cx('mkt-brand', className)} aria-label="ESPORT 237 HUB — accueil">
      {inner}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Titres de section                                                   */
/* ------------------------------------------------------------------ */

export interface SectionHeadProps {
  /** Sur-titre court en capitales (barre cyan ajoutée en CSS). */
  label?: string;
  title: ReactNode;
  lead?: ReactNode;
  /** `center` pour les sections pleine largeur. */
  align?: 'start' | 'center';
  /** Niveau de titre — `h1` réservé au hero. */
  as?: 'h1' | 'h2';
  className?: string;
}

export function SectionHead({
  label,
  title,
  lead,
  align = 'start',
  as: Tag = 'h2',
  className,
}: SectionHeadProps) {
  return (
    <header className={cx('mkt-head', align === 'center' && 'mkt-head--center', className)}>
      {label ? <span className="e237-section-label">{label}</span> : null}
      <Tag className="mkt-head__title">{title}</Tag>
      {lead ? <p className="mkt-head__lead">{lead}</p> : null}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Cartes de contenu                                                   */
/* ------------------------------------------------------------------ */

/* `title` est un nœud React ici, pas l'attribut HTML `title` (infobulle). */
export interface FeatureCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  icon?: string;
  title: ReactNode;
  text: ReactNode;
  /** Chiffre ou mention courte affichée en pied de carte. */
  extra?: ReactNode;
  /** Teinte du médaillon d'icône. */
  tone?: 'accent' | 'cyan' | 'gold';
  /** Rend la carte cliquable dans son ensemble. */
  href?: string;
}

/** Carte en relief : médaillon d'icône creusé, titre, texte, mention. */
export function FeatureCard({
  icon,
  title,
  text,
  extra,
  tone = 'accent',
  href,
  className,
  ...rest
}: FeatureCardProps) {
  const body = (
    <>
      {icon ? (
        <span className={cx('mkt-medallion', `mkt-medallion--${tone}`)}>
          <Glyph name={icon} size={20} />
        </span>
      ) : null}
      <h3 className="mkt-card__title">{title}</h3>
      <p className="mkt-card__text">{text}</p>
      {extra ? <span className="mkt-card__extra">{extra}</span> : null}
    </>
  );

  if (href) {
    return (
      <a href={href} className={cx('e237-card mkt-card mkt-card--link', className)}>
        {body}
        <span className="mkt-card__arrow" aria-hidden>
          <ArrowRight size={16} />
        </span>
      </a>
    );
  }
  return (
    <article className={cx('e237-card mkt-card', className)} {...rest}>
      {body}
    </article>
  );
}

export interface StepCardProps {
  /** Rang affiché dans la pastille (1, 2, 3…). */
  step: number;
  icon?: string;
  title: ReactNode;
  text: ReactNode;
  className?: string;
}

/** Étape numérotée d'un parcours (« comment ça marche »). */
export function StepCard({ step, icon, title, text, className }: StepCardProps) {
  return (
    <article className={cx('e237-card mkt-step', className)}>
      <span className="mkt-step__num scoreboard" aria-hidden>
        {String(step).padStart(2, '0')}
      </span>
      <div className="mkt-step__body">
        <h3 className="mkt-card__title">
          {icon ? <Glyph name={icon} size={18} className="mkt-step__icon" /> : null}
          {title}
        </h3>
        <p className="mkt-card__text">{text}</p>
      </div>
    </article>
  );
}

export interface ProofLevelProps {
  /** Code du niveau : P1 → P4. */
  code: string;
  title: ReactNode;
  text: ReactNode;
  icon?: string;
  /** Remplissage de la jauge, de 1 à 4. */
  strength: number;
  className?: string;
}

/**
 * Échelon de preuve (P1 → P4). La jauge matérialise la force de la preuve :
 * piste creusée, segments remplis en relief.
 */
export function ProofLevel({ code, title, text, icon, strength, className }: ProofLevelProps) {
  return (
    <article className={cx('e237-card mkt-proof', className)}>
      <div className="mkt-proof__top">
        <span className="mkt-proof__code scoreboard">{code}</span>
        {icon ? (
          <span className="mkt-medallion mkt-medallion--cyan mkt-medallion--sm">
            <Glyph name={icon} size={16} />
          </span>
        ) : null}
      </div>
      <h3 className="mkt-card__title">{title}</h3>
      <p className="mkt-card__text">{text}</p>
      <div
        className="mkt-gauge"
        role="img"
        aria-label={`Niveau de preuve ${strength} sur 4`}
      >
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cx('mkt-gauge__seg', i <= strength && 'mkt-gauge__seg--on')} />
        ))}
      </div>
    </article>
  );
}

export interface AudienceCardProps {
  icon?: string;
  audience: ReactNode;
  title: ReactNode;
  text: ReactNode;
  bullets?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  tone?: 'accent' | 'cyan' | 'gold';
  className?: string;
}

/** Panneau « pour qui » — joueur, salle partenaire, organisateur. */
export function AudienceCard({
  icon,
  audience,
  title,
  text,
  bullets = [],
  ctaLabel,
  ctaHref,
  tone = 'accent',
  className,
}: AudienceCardProps) {
  return (
    <article className={cx('e237-card mkt-audience', className)}>
      <span className={cx('mkt-medallion', `mkt-medallion--${tone}`)}>
        <Glyph name={icon} size={20} />
      </span>
      <span className="mkt-audience__tag">{audience}</span>
      <h3 className="mkt-card__title">{title}</h3>
      <p className="mkt-card__text">{text}</p>
      {bullets.length ? (
        <ul className="mkt-audience__list">
          {bullets.map((b) => (
            <li key={b}>
              <BadgeCheck size={15} aria-hidden strokeWidth={2} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {ctaLabel && ctaHref ? (
        <a className="mkt-audience__cta" href={ctaHref}>
          {ctaLabel}
          <ArrowRight size={15} aria-hidden />
        </a>
      ) : null}
    </article>
  );
}

export interface CircuitStep {
  title: string;
  text: string;
  icon?: string;
}

export interface CircuitTrackProps {
  steps: CircuitStep[];
  className?: string;
}

/**
 * Parcours en jetons posés dans une rainure — « du défi au point inscrit ».
 *
 * Grammaire de relief tenue sur toute la page : la piste est CREUSÉE
 * (enregistré, immuable), les jetons sont BOMBÉS (les étapes que l'on
 * traverse). Horizontal à partir de 1000 px, vertical en dessous : la rainure
 * bascule via `writing-mode` en CSS, sans média-query en JS.
 */
export function CircuitTrack({ steps, className }: CircuitTrackProps) {
  return (
    <ol className={cx('mkt-circuit', className)}>
      {steps.map((step, i) => (
        <li key={step.title} className="mkt-circuit__step">
          <span className="mkt-circuit__token scoreboard" aria-hidden>
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className="mkt-circuit__body">
            <h3 className="mkt-circuit__title">
              {step.icon ? <Glyph name={step.icon} size={16} /> : null}
              {step.title}
            </h3>
            <p className="mkt-card__text">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export interface NoteCardProps {
  icon?: string;
  title: ReactNode;
  text: ReactNode;
  /** `limit` pour les limites assumées, `info` pour une précision neutre. */
  tone?: 'info' | 'limit';
  className?: string;
}

/**
 * Encart d'honnêteté : ce que le produit ne fait pas (encore).
 *
 * Volontairement CREUSÉ, pas bombé — ce n'est pas une action, c'est une règle
 * gravée. Sert à annoncer les limites de la bêta plutôt qu'à les taire.
 */
export function NoteCard({ icon, title, text, tone = 'info', className }: NoteCardProps) {
  return (
    <div className={cx('mkt-note', tone === 'limit' && 'mkt-note--limit', className)}>
      <span className="mkt-note__icon">
        <Glyph name={icon ?? 'Info'} size={16} />
      </span>
      <div>
        <strong className="mkt-note__title">{title}</strong>
        <p className="mkt-note__text">{text}</p>
      </div>
    </div>
  );
}

export interface RankLine {
  rank: number;
  username: string;
  city: string;
  division: string;
}

export interface RankPreviewProps {
  lines: RankLine[];
  /** Ligne fantôme finale : « ta place est encore libre ». */
  ghostLabel?: string;
  className?: string;
}

/**
 * Extrait de classement — lignes en pilules creusées (motif `.e237-rank-row`
 * du dashboard, transposé sans dépendance aux données).
 *
 * `ghostLabel` ajoute une ligne en pointillés : la place du visiteur.
 */
export function RankPreview({ lines, ghostLabel, className }: RankPreviewProps) {
  return (
    <div className={cx('mkt-rank', className)}>
      {lines.map((line) => (
        <div key={line.username} className="mkt-rank__row">
          <span
            className={cx('mkt-rank__pos', line.rank <= 3 && `mkt-rank__pos--${line.rank}`)}
          >
            {line.rank}
          </span>
          <span className="mkt-rank__name">{line.username}</span>
          <span className="mkt-rank__city">{line.city}</span>
          <span className="mkt-rank__div">{line.division}</span>
        </div>
      ))}
      {ghostLabel ? (
        <div className="mkt-rank__row mkt-rank__row--ghost">
          <span className="mkt-rank__pos">?</span>
          <span className="mkt-rank__name">{ghostLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chiffres                                                            */
/* ------------------------------------------------------------------ */

export interface StatBandItem {
  value: string;
  label: string;
  icon?: string;
}

export interface StatBandProps {
  items: StatBandItem[];
  className?: string;
}

/** Bandeau de chiffres — piste creusée, tuiles en relief. */
export function StatBand({ items, className }: StatBandProps) {
  return (
    <div className={cx('mkt-statband', className)}>
      {items.map((item) => (
        <div key={item.label} className="mkt-statband__item">
          {item.icon ? (
            <span className="mkt-statband__icon">
              <Glyph name={item.icon} size={18} />
            </span>
          ) : null}
          <strong className="mkt-statband__value scoreboard">{item.value}</strong>
          <span className="mkt-statband__label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ — accordéon natif, sans JavaScript                              */
/* ------------------------------------------------------------------ */

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  items: FaqEntry[];
  /** Ouvre la première question (utile sur l'extrait de la landing). */
  openFirst?: boolean;
  /**
   * Regroupe les `<details>` : n'en laisse qu'un ouvert à la fois.
   * Fonctionne sans JS (attribut `name`, natif sur les navigateurs récents).
   */
  exclusiveName?: string;
  className?: string;
}

export function FaqAccordion({
  items,
  openFirst = false,
  exclusiveName,
  className,
}: FaqAccordionProps) {
  return (
    <div className={cx('mkt-faq', className)}>
      {items.map((item, i) => (
        <details
          key={item.question}
          className="mkt-faq__item"
          name={exclusiveName}
          open={openFirst && i === 0}
        >
          <summary className="mkt-faq__q">
            <span>{item.question}</span>
            <ChevronDown size={18} className="mkt-faq__chevron" aria-hidden />
          </summary>
          <div className="mkt-faq__a">
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Appel à l'action                                                    */
/* ------------------------------------------------------------------ */

export interface CtaBandProps {
  label?: string;
  title: ReactNode;
  text?: ReactNode;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Mention discrète sous les boutons (ex. « Gratuit pendant la bêta »). */
  note?: ReactNode;
  className?: string;
}

export function CtaBand({
  label,
  title,
  text,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  note,
  className,
}: CtaBandProps) {
  return (
    <section className={cx('mkt-cta', className)}>
      <div className="mkt-cta__inner">
        {label ? <span className="e237-section-label">{label}</span> : null}
        <h2 className="mkt-cta__title">{title}</h2>
        {text ? <p className="mkt-cta__text">{text}</p> : null}
        <div className="mkt-cta__actions">
          <a className="btn btn--primary btn--lg" href={primaryHref}>
            {primaryLabel}
            <ArrowRight size={18} aria-hidden />
          </a>
          {secondaryLabel && secondaryHref ? (
            <a className="btn btn--secondary btn--lg" href={secondaryHref}>
              {secondaryLabel}
            </a>
          ) : null}
        </div>
        {note ? <p className="mkt-cta__note">{note}</p> : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chrome — en-tête et pied de page                                    */
/* ------------------------------------------------------------------ */

export interface MarketingNavItem {
  label: string;
  href: string;
}

export interface MarketingHeaderProps {
  navItems: MarketingNavItem[];
  ctaLabel: string;
  ctaHref: string;
  /** Chemin courant (`Astro.url.pathname`) pour marquer le lien actif. */
  currentPath?: string;
  logoSrc?: string;
  className?: string;
}

/**
 * En-tête collant, fondu dans la page : aucun fond ni séparateur, seuls les
 * éléments portent le relief (règle « barre du haut » de DESIGN.md).
 *
 * Le bouton de thème est rendu ici mais câblé par le script inline de
 * `Base.astro` (via son `id`) : aucun îlot React n'est hydraté.
 */
export function MarketingHeader({
  navItems,
  ctaLabel,
  ctaHref,
  currentPath = '/',
  logoSrc,
  className,
}: MarketingHeaderProps) {
  const isActive = (href: string) =>
    href === '/' ? currentPath === '/' : currentPath.startsWith(href);

  return (
    <header className={cx('mkt-header', className)}>
      <div className="mkt-header__inner">
        <BrandLogo href="/" src={logoSrc} compactWordmark />

        <nav className="mkt-nav" aria-label="Navigation principale">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cx('mkt-nav__link', isActive(item.href) && 'mkt-nav__link--on')}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mkt-header__actions">
          <button
            id="theme-toggle"
            type="button"
            className="mkt-themetoggle"
            title="Changer de thème"
            aria-label="Changer de thème"
          >
            <Sparkles size={16} aria-hidden />
          </button>
          <a className="btn btn--primary btn--sm mkt-header__cta" href={ctaHref}>
            {ctaLabel}
          </a>
        </div>
      </div>
    </header>
  );
}

export interface MarketingFooterColumn {
  title: string;
  links: MarketingNavItem[];
}

export interface MarketingFooterProps {
  columns: MarketingFooterColumn[];
  /** Ligne légale, sous le séparateur. */
  legal?: ReactNode;
  logoSrc?: string;
  className?: string;
}

export function MarketingFooter({ columns, legal, logoSrc, className }: MarketingFooterProps) {
  return (
    <footer className={cx('mkt-footer', className)}>
      <div className="mkt-footer__inner">
        <div className="mkt-footer__brand">
          <BrandLogo src={logoSrc} />
          <p className="mkt-footer__slogan">Chaque match construit une carrière.</p>
          <p className="mkt-footer__place">
            <MapPin size={14} aria-hidden strokeWidth={2} />
            <span>Yaoundé · Douala · Cameroun</span>
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} className="mkt-footer__col" aria-label={col.title}>
            <span className="mkt-footer__coltitle">{col.title}</span>
            {col.links.map((link) => (
              <a key={link.href} href={link.href} className="mkt-footer__link">
                {link.label}
              </a>
            ))}
          </nav>
        ))}
      </div>
      {legal ? <div className="mkt-footer__legal">{legal}</div> : null}
    </footer>
  );
}
