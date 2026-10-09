"use client";

/**
 * Profil et réglages — la disposition des « paramètres » du web (lot R,
 * 09/10/2026 : « les paramètres de profil, les interfaces ne sont pas très
 * top »).
 *
 * - Large (≥ 1 024 px) : la liste des sections à GAUCHE, collée, la section
 *   ouverte à droite — Buffer, Gumloop, MagicPath (Mobbin).
 * - Téléphone : comme l'application — la page d'entrée montre son contenu
 *   PUIS la liste des sections (rangées à chevron) ; une section s'ouvre en
 *   pleine page, avec « Toutes les sections » pour revenir.
 *
 * Une seule arborescence DOM pour les deux : la CSS du design system décide
 * (règle 6 de l'AGENTS.md — jamais de `hidden lg:flex` côté application).
 *
 * `SettingsSection` et `SettingsRow` donnent les rangées « libellé à gauche,
 * réglage à droite » des mêmes références : un interrupteur, un sélecteur ou
 * un bouton par rangée, l'explication sous le libellé.
 */

import type { ElementType, ReactNode } from "react";

import { Icon } from "../icons/generated/web";
import type { IconName } from "../icons/names";
import { useDsT } from "../i18n/hooks";
import { SectionHeader, useDsLink } from "./page-layout";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface SettingsNavItem {
  href: string;
  label: string;
  icon?: IconName;
  /** Une ligne sous le libellé, au téléphone seulement (la liste de l'app). */
  description?: string;
  /** Intertitre du groupe (« Mon compte », « Réglages ») — les éléments d'un groupe se suivent. */
  group?: string;
  /** Valeur à droite (solde, compteur) — au téléphone et au large. */
  trailing?: ReactNode;
  /** `danger` : se déconnecter, supprimer. */
  tone?: "default" | "danger";
}

export interface SettingsLayoutProps {
  nav: SettingsNavItem[];
  /** La section affichée (comparée à `href`). */
  activeHref?: string | null;
  /**
   * Page d'entrée (« Profil ») : au téléphone, la liste des sections suit
   * son contenu. Sur une section, la liste est masquée au téléphone et
   * remplacée par un retour vers `indexHref`.
   */
  isIndex?: boolean;
  /** La page d'entrée, pour le retour du téléphone. */
  indexHref?: string;
  /** Libellé du retour du téléphone ; défaut « Toutes les sections ». */
  indexLabel?: string;
  /** Nom accessible de la navigation ; défaut « Sections ». */
  navLabel?: string;
  /** Lien du routeur, si l'application n'a pas posé de `DsLinkProvider`. */
  linkAs?: ElementType;
  className?: string;
  children: ReactNode;
}

/** Les éléments regroupés dans l'ordre d'arrivée, un intertitre par groupe. */
function groupsOf(nav: SettingsNavItem[]): Array<{ group?: string; items: SettingsNavItem[] }> {
  const out: Array<{ group?: string; items: SettingsNavItem[] }> = [];
  for (const item of nav) {
    const last = out[out.length - 1];
    if (last && last.group === item.group) last.items.push(item);
    else out.push({ group: item.group, items: [item] });
  }
  return out;
}

export function SettingsLayout({
  nav,
  activeHref = null,
  isIndex = false,
  indexHref,
  indexLabel,
  navLabel,
  linkAs,
  className,
  children,
}: SettingsLayoutProps) {
  const t = useDsT();
  const Link = useDsLink(linkAs);
  return (
    <div className={cx("e237-settings", isIndex && "e237-settings--index", className)}>
      <nav className="e237-settings__nav" aria-label={navLabel ?? t("ui.settings.nav")}>
        {groupsOf(nav).map(({ group, items }, gi) => (
          <div key={group ?? `g${gi}`} className="e237-settings__group">
            {group ? <p className="e237-settings__group-title">{group}</p> : null}
            <ul className="e237-settings__list">
              {items.map((item) => {
                const active = activeHref === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cx(
                        "e237-settings__link",
                        active && "is-active",
                        item.tone === "danger" && "e237-settings__link--danger",
                      )}
                    >
                      {item.icon ? (
                        <span className="e237-settings__icon">
                          <Icon name={item.icon} size={18} active={active} />
                        </span>
                      ) : null}
                      <span className="e237-settings__label">
                        <span className="e237-settings__label-text">{item.label}</span>
                        {item.description ? (
                          <span className="e237-settings__desc">{item.description}</span>
                        ) : null}
                      </span>
                      {item.trailing != null ? (
                        <span className="e237-settings__trailing">{item.trailing}</span>
                      ) : null}
                      <span className="e237-settings__chevron">
                        <Icon name="chevron-right" size={16} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="e237-settings__body">
        {!isIndex && indexHref ? (
          <Link href={indexHref} className="e237-settings__back">
            <Icon name="arrow-left" size={16} />
            {indexLabel ?? t("ui.settings.backToList")}
          </Link>
        ) : null}
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NavGroup / NavItem — la liste à chevrons du mobile, sur le web      */
/* ------------------------------------------------------------------ */

/** Teinte de la pastille d'icône — les tons du DS, la même que le natif (`tint`). */
export type NavItemTone = "accent" | "cyan" | "gold" | "success" | "info" | "danger" | "neutral";

export interface NavItemProps {
  label: string;
  /** Une ligne d'explication sous le libellé. */
  hint?: string;
  icon?: IconName;
  /** Teinte de la pastille de l'icône — `accent` par défaut, comme le natif. */
  tone?: NavItemTone;
  /** Valeur à droite (solde, compteur), avant le chevron. */
  trailing?: ReactNode;
  /** Navigation — sinon `onClick`. */
  href?: string;
  onClick?: () => void;
  linkAs?: ElementType;
}

/**
 * Une rangée de la liste : pastille d'icône teintée, libellé, explication,
 * valeur, chevron — le `NavItem` du natif (`native/nav-list.tsx`), même nom,
 * mêmes props (`tint` → `tone`, `onPress` → `href`/`onClick`).
 */
export function NavItem({ label, hint, icon, tone = "accent", trailing, href, onClick, linkAs }: NavItemProps) {
  const Link = useDsLink(linkAs);
  const inner = (
    <>
      {icon ? (
        <span className={`e237-nav-item__icon e237-nav-item__icon--${tone}`}>
          <Icon name={icon} size={18} />
        </span>
      ) : null}
      <span className="e237-nav-item__text">
        <span className="e237-nav-item__label">{label}</span>
        {hint ? <span className="e237-nav-item__hint">{hint}</span> : null}
      </span>
      {trailing != null ? <span className="e237-nav-item__trailing">{trailing}</span> : null}
      <span className="e237-nav-item__chevron">
        <Icon name="chevron-right" size={16} />
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <Link href={href} className={cx("e237-nav-item", tone === "danger" && "e237-nav-item--danger")}>
          {inner}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={cx("e237-nav-item", tone === "danger" && "e237-nav-item--danger")}
        >
          {inner}
        </button>
      )}
    </li>
  );
}

/** Le cadre d'une liste de `NavItem` (une carte, des filets entre les rangées). */
export function NavGroup({
  children,
  label,
  className,
}: {
  children: ReactNode;
  /** Nom accessible de la liste, s'il n'y a pas de titre visible juste au-dessus. */
  label?: string;
  className?: string;
}) {
  return (
    <ul className={cx("e237-nav-group", className)} aria-label={label}>
      {children}
    </ul>
  );
}

export interface SettingsSectionProps {
  title?: ReactNode;
  /** Une phrase sous le titre — ce que la section règle. */
  description?: ReactNode;
  /** Action de la section, sur la rangée du titre. */
  actions?: ReactNode;
  /** `danger` : la zone « supprimer mon compte ». */
  tone?: "default" | "danger";
  id?: string;
  className?: string;
  children: ReactNode;
}

/** Un groupe de rangées sous un titre de section (`SectionHeader`). */
export function SettingsSection({
  title,
  description,
  actions,
  tone = "default",
  id,
  className,
  children,
}: SettingsSectionProps) {
  return (
    <section
      className={cx("e237-settings-section", tone === "danger" && "e237-settings-section--danger", className)}
      aria-labelledby={id && title ? `${id}-title` : undefined}
    >
      {title != null ? (
        <SectionHeader
          id={id ? `${id}-title` : undefined}
          title={title}
          subtitle={description}
          actions={actions}
        />
      ) : null}
      <div className="e237-settings-section__rows">{children}</div>
    </section>
  );
}

export interface SettingsRowProps {
  label: ReactNode;
  /** L'explication, sous le libellé. */
  description?: ReactNode;
  /** Le réglage, à droite (interrupteur, sélecteur, bouton). */
  control?: ReactNode;
  /** Contenu sous la rangée (un formulaire qui s'ouvre, des pastilles). */
  children?: ReactNode;
  /** Relie le libellé au champ du `control` (`<label for>`). */
  htmlFor?: string;
  tone?: "default" | "danger";
  className?: string;
}

/** Une rangée de réglage : libellé et explication à gauche, réglage à droite. */
export function SettingsRow({
  label,
  description,
  control,
  children,
  htmlFor,
  tone = "default",
  className,
}: SettingsRowProps) {
  const Label = htmlFor ? "label" : "span";
  return (
    <div className={cx("e237-settings-row", tone === "danger" && "e237-settings-row--danger", className)}>
      <div className="e237-settings-row__main">
        <div className="e237-settings-row__text">
          <Label className="e237-settings-row__label" {...(htmlFor ? { htmlFor } : {})}>
            {label}
          </Label>
          {description != null ? <p className="e237-settings-row__desc">{description}</p> : null}
        </div>
        {control != null ? <div className="e237-settings-row__control">{control}</div> : null}
      </div>
      {children != null ? <div className="e237-settings-row__extra">{children}</div> : null}
    </div>
  );
}
