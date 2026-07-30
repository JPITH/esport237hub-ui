"use client";

import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

/* ------------------------------------------------------------------ */
/* BrandLockup                                                         */
/* ------------------------------------------------------------------ */

export interface BrandLockupProps {
  /** `sm` (32 px) pour les barres latérales, `md` (36 px) pour l'accueil. */
  size?: "sm" | "md";
  /** Masque le mot-symbole et ne garde que la pastille « E » (menu replié). */
  compact?: boolean;
  /** Rend l'ensemble cliquable ; sinon simple `<span>`. */
  href?: string;
  className?: string;
}

/**
 * Bloc de marque « E » + « ESPORT 237 HUB ».
 *
 * Il était recopié cinq fois (app-shell ×2, layout admin ×2, panneau
 * d'authentification) — et le « 237 » en vert n'était pas toujours au même
 * endroit. Une seule écriture, ici.
 */
export function BrandLockup({
  size = "sm",
  compact = false,
  href,
  className = "",
}: BrandLockupProps) {
  const box = size === "md" ? "size-9 text-lg" : "size-8";
  const content = (
    <>
      <span
        aria-hidden
        className={`grid ${box} shrink-0 place-items-center rounded-md bg-accent font-display font-bold text-on-accent`}
      >
        E
      </span>
      {compact ? null : (
        <span className="font-display text-sm font-bold leading-tight tracking-tight">
          ESPORT <span className="text-accent">237</span> HUB
        </span>
      )}
    </>
  );

  const cls = `flex items-center gap-2 ${className}`.trim();
  if (href) {
    return (
      <a href={href} aria-label="ESPORT 237 HUB — accueil" className={cls}>
        {content}
      </a>
    );
  }
  return (
    <span aria-label="ESPORT 237 HUB" className={cls}>
      {content}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* SidebarNavLink                                                      */
/* ------------------------------------------------------------------ */

export interface SidebarNavLinkOptions {
  active: boolean;
  /** Menu replié : l'icône seule, centrée. */
  collapsed?: boolean;
  /**
   * Rail vertical à gauche de l'élément actif (`.nav-active`).
   * Vrai dans l'espace joueur, faux dans l'espace d'administration.
   */
  rail?: boolean;
}

/**
 * Fabrique de classes d'un lien de barre latérale — à passer à `next/link`
 * (le design system ne connaît pas le routeur de l'application).
 *
 * `app-shell.tsx` et `(admin)/layout.tsx` écrivaient la même fabrique
 * `linkClass` à deux endroits, à une classe près.
 */
export function sidebarLinkClass({
  active,
  collapsed = false,
  rail = true,
}: SidebarNavLinkOptions): string {
  return [
    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
    collapsed ? "justify-center px-0" : "",
    active
      ? `${rail ? "nav-active " : ""}bg-accent/12 font-semibold text-accent`
      : "text-secondary hover:bg-raised hover:text-primary",
  ]
    .filter(Boolean)
    .join(" ");
}

export interface SidebarNavLinkProps extends SidebarNavLinkOptions {
  href: string;
  /** Icône Lucide. */
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Lien de barre latérale prêt à l'emploi (ancre native). Les applications qui
 * ont besoin du préchargement `next/link` utilisent plutôt
 * `sidebarLinkClass()`.
 */
export function SidebarNavLink({
  href,
  icon,
  label,
  onClick,
  active,
  collapsed = false,
  rail = true,
  className = "",
}: SidebarNavLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={`${sidebarLinkClass({ active, collapsed, rail })} ${className}`.trim()}
    >
      {icon ? (
        <span className="grid shrink-0 place-items-center [&>svg]:size-[18px]">
          {icon}
        </span>
      ) : null}
      {collapsed ? null : <span className="truncate">{label}</span>}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* ThemeToggleButton                                                   */
/* ------------------------------------------------------------------ */

const THEME_LABEL = { light: "Clair", dark: "Sombre" } as const;

export interface ThemeToggleButtonProps {
  /** Thème actuellement rendu. */
  mode: "light" | "dark";
  /**
   * Bascule demandée. L'événement est fourni : la coquille applicative peut
   * s'en servir pour la révélation circulaire (`document.startViewTransition`)
   * — la persistance du choix ne regarde pas le design system.
   */
  onToggle: (event: { clientX: number; clientY: number }) => void;
  /** `true` = carré 36 px (barre du haut) ; `false` = pleine largeur. */
  compact?: boolean;
  className?: string;
}

/**
 * Bascule de thème — RENDU uniquement (deux variantes, compacte et large).
 *
 * La mécanique (next-themes, `localStorage`, View Transitions) reste dans
 * l'application : le design system ne doit dépendre d'aucun fournisseur de
 * thème. Il ne sait que dessiner l'état qu'on lui donne.
 */
export function ThemeToggleButton({
  mode,
  onToggle,
  compact = false,
  className = "",
}: ThemeToggleButtonProps) {
  const next = mode === "light" ? "dark" : "light";
  const Icon = mode === "light" ? Sun : Moon;
  const aria = `Thème : ${THEME_LABEL[mode]} — cliquer pour ${THEME_LABEL[next]}`;

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => onToggle({ clientX: e.clientX, clientY: e.clientY })}
        aria-label={aria}
        title={`Thème : ${THEME_LABEL[mode]}`}
        className={`grid size-9 place-items-center rounded-md border border-edge text-secondary transition-colors hover:border-accent hover:text-accent ${className}`.trim()}
      >
        <Icon className="size-[18px]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => onToggle({ clientX: e.clientX, clientY: e.clientY })}
      aria-label={aria}
      className={`flex h-9 w-full items-center justify-between gap-2 rounded-md border border-edge px-3 text-sm text-secondary transition-colors hover:border-accent hover:text-accent ${className}`.trim()}
    >
      <span className="flex items-center gap-2">
        <Icon className="size-4" />
        {THEME_LABEL[mode]}
      </span>
      <span className="text-[11px] text-muted">changer</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* AuthBrandPanel                                                      */
/* ------------------------------------------------------------------ */

export interface AuthMetric {
  value: string;
  label: string;
}

export interface AuthBrandPanelProps {
  title: ReactNode;
  subtitle: string;
  /**
   * Chiffres mis en avant. Ils étaient CODÉS EN DUR dans le composant
   * (« 12 duels validés », « 6 salles »…) : des données produit figées dans
   * du rendu. Ils arrivent désormais par props ; une liste vide n'affiche
   * simplement rien.
   */
  metrics?: readonly AuthMetric[];
  /** Ligne de pied de panneau (ex. « Douala · Yaoundé · Bafoussam »). */
  footer?: ReactNode;
  className?: string;
}

/**
 * Panneau de marque des écrans d'authentification (colonne gauche du split
 * desktop, masquée sous `lg`).
 */
export function AuthBrandPanel({
  title,
  subtitle,
  metrics = [],
  footer,
  className = "",
}: AuthBrandPanelProps) {
  return (
    <aside
      className={`relative hidden flex-col justify-between overflow-hidden border-r border-edge bg-surface p-10 lg:flex ${className}`.trim()}
    >
      <div className="pitch-line absolute inset-x-0 top-1/2" aria-hidden />
      <div
        className="absolute -right-24 -top-24 size-80 rounded-full border border-accent/20"
        aria-hidden
      />
      <div className="relative">
        <BrandLockup size="md" />
      </div>

      <div className="relative flex flex-col gap-6">
        <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight">
          {title}
        </h1>
        <p className="max-w-sm text-sm text-secondary">{subtitle}</p>
        {metrics.length ? (
          <div className="flex gap-8 pt-2">
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-col">
                <span className="scoreboard text-3xl text-accent">{m.value}</span>
                <span className="text-xs text-secondary">{m.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {footer ? (
        <span className="relative text-xs text-muted">{footer}</span>
      ) : (
        <span />
      )}
    </aside>
  );
}
