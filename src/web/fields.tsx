'use client';

/**
 * Champs de saisie web ESPORT 237 HUB (React 19) — famille complète.
 *
 * Entrypoint CLIENT séparé (`@esport237hub/ui/web/fields`) : ces composants
 * utilisent des hooks d'état, à ne pas entraîner dans le graphe RSC des pages
 * serveur Next (le reste de `./web` reste sans état, importable côté serveur).
 *
 * Stylés par les classes .e237-field* de theme.css : importer
 * `@esport237hub/ui/css` une fois dans l'application. Aucune dépendance
 * d'icônes : les icônes internes (œil, recherche, ±) sont des SVG inline.
 */
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/* Icônes internes (SVG inline, style « trait » — pas de dépendance)   */
/* ------------------------------------------------------------------ */

type IconProps = { className?: string };

function svgProps(className?: string) {
  return {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
}

function IconEye({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

function IconSearch({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconX({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function IconMinus({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M5 12h14" />
    </svg>
  );
}

function IconPlus({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

/** Drapeau du Cameroun en SVG (pas d'emoji). Plateforme centrée Cameroun. */
function CameroonFlag({ className }: IconProps) {
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

/* ------------------------------------------------------------------ */
/* Label                                                               */
/* ------------------------------------------------------------------ */

function Label({ id, children }: { id: string; children: ReactNode }) {
  return (
    <label htmlFor={id} className="e237-field-label">
      {children}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  icon?: ReactNode;
}

/**
 * Champ texte maison (jamais l'input natif brut). Icône optionnelle, focus ring.
 * Un champ `type="password"` reçoit TOUJOURS le bouton œil afficher/masquer —
 * inutile d'y penser à chaque usage.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, icon, className, id, type = 'text', ...rest }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === 'password';
    // Révélé → on bascule en `text` pour montrer le mot de passe.
    const effectiveType = isPassword && revealed ? 'text' : type;
    return (
      <div className="e237-field-group">
        {label ? <Label id={fieldId}>{label}</Label> : null}
        <div className="e237-field-box">
          {icon ? <span className="e237-field-icon">{icon}</span> : null}
          <input
            ref={ref}
            id={fieldId}
            type={effectiveType}
            className={cx(
              'e237-field',
              !!icon && 'e237-field--pad-icon',
              isPassword && 'e237-field--pad-toggle',
              className,
            )}
            {...rest}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-label={
                revealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
              }
              aria-pressed={revealed}
              className="e237-field-toggle"
            >
              {revealed ? <IconEyeOff /> : <IconEye />}
            </button>
          ) : null}
        </div>
        {hint ? <span className="e237-field-hint">{hint}</span> : null}
      </div>
    );
  },
);
Input.displayName = 'Input';

/* ------------------------------------------------------------------ */
/* Textarea                                                            */
/* ------------------------------------------------------------------ */

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, className, id, rows = 3, ...rest }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <div className="e237-field-group">
        {label ? <Label id={fieldId}>{label}</Label> : null}
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          className={cx('e237-field', 'e237-field--area', className)}
          {...rest}
        />
        {hint ? <span className="e237-field-hint">{hint}</span> : null}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

/* ------------------------------------------------------------------ */
/* NumberInput                                                         */
/* ------------------------------------------------------------------ */

export interface NumberInputProps {
  label?: string;
  hint?: string;
  /** null = champ vide (le placeholder s'affiche). */
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * Saisie de nombre maison : boutons − / + de part et d'autre d'un champ
 * centré qui reste éditable au clavier. Jamais les spinners natifs.
 */
export function NumberInput({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder,
  disabled,
  className,
  id,
}: NumberInputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  // Texte local : autorise le champ vide ou une frappe partielle sans
  // renvoyer de valeur invalide au parent.
  const [text, setText] = useState(value === null ? '' : String(value));
  useEffect(() => {
    setText(value === null ? '' : String(value));
  }, [value]);

  const clamp = (n: number) => {
    let next = Math.max(min, n);
    if (max !== undefined) next = Math.min(max, next);
    return next;
  };

  const commitText = (raw: string) => {
    const digits = raw.replace(/[^0-9-]/g, '');
    if (digits === '' || digits === '-') {
      onChange(null);
      setText('');
      return;
    }
    const next = clamp(Number(digits));
    onChange(next);
    setText(String(next));
  };

  const nudge = (dir: 1 | -1) => {
    const base = value ?? (dir === 1 ? min - step : min + step);
    onChange(clamp(base + dir * step));
  };

  const canMinus = !disabled && (value === null || value > min);
  const canPlus =
    !disabled && (max === undefined || value === null || value < max);

  return (
    <div className={cx('e237-field-group', className)}>
      {label ? <Label id={fieldId}>{label}</Label> : null}
      <div
        className={cx(
          'e237-field',
          'e237-field-composite',
          disabled && 'e237-field--muted',
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Diminuer"
          disabled={!canMinus}
          onClick={() => nudge(-1)}
          className="e237-stepper-btn e237-stepper-btn--minus"
        >
          <IconMinus />
        </button>
        <input
          id={fieldId}
          inputMode="numeric"
          disabled={disabled}
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commitText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitText(text);
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              nudge(1);
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              nudge(-1);
            }
          }}
          className="e237-field-inner e237-field-inner--center"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Augmenter"
          disabled={!canPlus}
          onClick={() => nudge(1)}
          className="e237-stepper-btn e237-stepper-btn--plus"
        >
          <IconPlus />
        </button>
      </div>
      {hint ? <span className="e237-field-hint">{hint}</span> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PhoneInput                                                          */
/* ------------------------------------------------------------------ */

/** Groupes d'affichage d'un numéro camerounais : 6XX XX XX XX. */
function formatCmPhone(digits: string): string {
  const d = digits.slice(0, 9);
  const parts = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 7), d.slice(7, 9)];
  return parts.filter(Boolean).join(' ');
}

export interface PhoneInputProps {
  label?: string;
  hint?: string;
  /** Chiffres du numéro national (9 max), sans le préfixe. */
  value: string;
  onChange: (digits: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * Téléphone — préfixe VERROUILLÉ sur +237 (Cameroun) pour l'instant ;
 * l'indicatif deviendra sélectionnable à l'ouverture d'autres pays.
 */
export function PhoneInput({
  label = 'Téléphone',
  hint,
  value,
  onChange,
  placeholder = '6XX XX XX XX',
  disabled,
  className,
  id,
}: PhoneInputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={cx('e237-field-group', className)}>
      {label ? <Label id={fieldId}>{label}</Label> : null}
      <div
        className={cx(
          'e237-field',
          'e237-field-composite',
          disabled && 'e237-field--muted',
        )}
      >
        <span className="e237-field-affix">
          <CameroonFlag className="e237-affix-flag" />
          +237
        </span>
        <input
          id={fieldId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          value={formatCmPhone(value)}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
          className="e237-field-inner"
        />
      </div>
      {hint ? <span className="e237-field-hint">{hint}</span> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SearchField                                                         */
/* ------------------------------------------------------------------ */

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
  /** Prend le focus à l'affichage (panneaux/popups de recherche). */
  autoFocus?: boolean;
}

/** Barre de recherche animée : icône, spinner pendant la requête, effacement. */
export function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder = 'Rechercher…',
  loading = false,
  className,
  autoFocus = false,
}: SearchFieldProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className={cx('e237-search', className)}>
      <span
        className={cx('e237-search-icon', focused && 'e237-search-icon--focused')}
      >
        {loading ? <span className="e237-spinner" /> : <IconSearch />}
      </span>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit?.();
        }}
        placeholder={placeholder}
        className="e237-field"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Effacer"
          className="e237-search-clear"
        >
          <IconX />
        </button>
      ) : null}
    </div>
  );
}
