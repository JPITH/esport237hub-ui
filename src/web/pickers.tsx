"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Socle commun des menus déroulants maison (aucun contrôle natif).    */
/* ------------------------------------------------------------------ */

export interface SelectOption {
  value: string;
  label: string;
}

/** Ferme le popover au clic extérieur et à Escape. */
function useDismiss(
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, onClose]);
}

function FieldLabel({ id, children }: { id: string; children: ReactNode }) {
  return (
    <label htmlFor={id} className="text-xs font-medium text-secondary">
      {children}
    </label>
  );
}

/** Panneau flottant sous le déclencheur. */
function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`ui-popover ui-animate-pop ${className}`}>
      {children}
    </div>
  );
}

function OptionRow({
  active,
  highlighted,
  onSelect,
  onHover,
  children,
}: {
  active: boolean;
  highlighted: boolean;
  onSelect: () => void;
  onHover: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onSelect}
      onPointerMove={onHover}
      className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
        highlighted ? "bg-raised" : ""
      } ${active ? "font-semibold text-accent" : "text-primary"}`}
    >
      <span className="truncate">{children}</span>
      {active ? <Check className="size-4 shrink-0" /> : null}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Select maison — listbox custom, plus aucun <select> natif.          */
/* ------------------------------------------------------------------ */

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = "Choisir…",
  disabled,
  className = "",
  id,
}: SelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  useDismiss(wrapRef, open, () => setOpen(false));

  const selected = options.find((o) => o.value === value) ?? null;

  const openAt = () => {
    setHi(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const commit = (o: SelectOption) => {
    onChange(o.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      openAt();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => Math.max(0, h - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setHi(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHi(options.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (options[hi]) commit(options[hi]);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label ? <FieldLabel id={fieldId}>{label}</FieldLabel> : null}
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          id={fieldId}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => (open ? setOpen(false) : openAt())}
          onKeyDown={onKeyDown}
          className="ui-field flex h-11 w-full cursor-pointer items-center justify-between gap-2 px-3.5 text-left text-sm"
        >
          <span className={`truncate ${selected ? "" : "text-muted"}`}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-muted transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open ? (
          <Panel>
            <div role="listbox" className="max-h-64 overflow-y-auto p-1">
              {options.map((o, i) => (
                <OptionRow
                  key={o.value}
                  active={o.value === value}
                  highlighted={i === hi}
                  onSelect={() => commit(o)}
                  onHover={() => setHi(i)}
                >
                  {o.label}
                </OptionRow>
              ))}
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Combobox — Select avec recherche intégrée (listes longues).         */
/* ------------------------------------------------------------------ */

export interface ComboboxProps extends Omit<SelectProps, "placeholder"> {
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

export function Combobox({
  label,
  options,
  value,
  onChange,
  placeholder = "Choisir…",
  searchPlaceholder = "Rechercher…",
  emptyText = "Aucun résultat.",
  disabled,
  className = "",
  id,
}: ComboboxProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hi, setHi] = useState(0);
  useDismiss(wrapRef, open, () => setOpen(false));

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset du panneau à l'ouverture
      setQuery("");
      setHi(0);
      // Focus après le rendu du panneau.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const commit = (o: SelectOption) => {
    onChange(o.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((h) => Math.min(filtered.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[hi]) commit(filtered[hi]);
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label ? <FieldLabel id={fieldId}>{label}</FieldLabel> : null}
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          id={fieldId}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="ui-field flex h-11 w-full cursor-pointer items-center justify-between gap-2 px-3.5 text-left text-sm"
        >
          <span className={`truncate ${selected ? "" : "text-muted"}`}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-muted transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open ? (
          <Panel>
            {/* Recherche en encart : le focus reste CONTENU dans le panneau
                (fond teinté + bordure interne, aucun ring qui déborde). */}
            <div className="border-b border-edge p-2">
              <div className="flex items-center gap-2 rounded-lg border border-edge bg-raised px-2.5 transition-colors focus-within:border-accent">
                <Search className="size-4 shrink-0 text-muted" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHi(0);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder={searchPlaceholder}
                  className="h-9 w-full bg-transparent text-sm text-primary outline-none placeholder:text-muted"
                />
              </div>
            </div>
            <div role="listbox" className="max-h-60 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-sm text-muted">{emptyText}</p>
              ) : (
                filtered.map((o, i) => (
                  <OptionRow
                    key={o.value}
                    active={o.value === value}
                    highlighted={i === hi}
                    onSelect={() => commit(o)}
                    onHover={() => setHi(i)}
                  >
                    {o.label}
                  </OptionRow>
                ))
              )}
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DatePicker — calendrier maison (évènements, tournois…).             */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export interface DatePickerProps {
  label?: string;
  /** ISO `YYYY-MM-DD`, ou null si vide. */
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  /** Date minimale sélectionnable (ISO). */
  min?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Choisir une date…",
  min,
  disabled,
  className = "",
  id,
}: DatePickerProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDismiss(wrapRef, open, () => setOpen(false));

  const today = new Date();
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());
  const base = value ? new Date(`${value}T12:00:00`) : today;
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });

  // Lundi = première colonne.
  const firstDay = new Date(view.y, view.m, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shift = (delta: number) => {
    setView(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const display = value
    ? new Date(`${value}T12:00:00`).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label ? <FieldLabel id={fieldId}>{label}</FieldLabel> : null}
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          id={fieldId}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="ui-field flex h-11 w-full cursor-pointer items-center gap-2.5 px-3.5 text-left text-sm"
        >
          <CalendarDays className="size-[18px] shrink-0 text-muted" />
          <span className={`truncate ${display ? "" : "text-muted"}`}>
            {display ?? placeholder}
          </span>
        </button>

        {open ? (
          <Panel className="w-72 p-3">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label="Mois précédent"
                onClick={() => shift(-1)}
                className="grid size-8 place-items-center rounded-md text-secondary transition-colors hover:bg-raised hover:text-primary"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm font-semibold">
                {MONTHS[view.m]} <span className="scoreboard">{view.y}</span>
              </span>
              <button
                type="button"
                aria-label="Mois suivant"
                onClick={() => shift(1)}
                className="grid size-8 place-items-center rounded-md text-secondary transition-colors hover:bg-raised hover:text-primary"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((d, i) => (
                <span
                  key={i}
                  className="grid h-8 place-items-center text-[11px] font-semibold text-muted"
                >
                  {d}
                </span>
              ))}
              {cells.map((day, i) => {
                if (day === null) return <span key={`e${i}`} />;
                const iso = toISO(view.y, view.m, day);
                const isSelected = iso === value;
                const isToday = iso === todayISO;
                const isDisabled = min ? iso < min : false;
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      onChange(iso);
                      setOpen(false);
                    }}
                    className={`grid h-8 place-items-center rounded-md text-sm tabular-nums transition-colors disabled:opacity-30 ${
                      isSelected
                        ? "bg-accent font-bold text-on-accent"
                        : isToday
                          ? "border border-accent/50 text-accent hover:bg-raised"
                          : "text-primary hover:bg-raised"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-edge pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange(todayISO);
                  setView({ y: today.getFullYear(), m: today.getMonth() });
                  setOpen(false);
                }}
                className="rounded-md px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-raised"
              >
                Aujourd&rsquo;hui
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-raised hover:text-primary"
              >
                Effacer
              </button>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TimePicker — heures & minutes en colonnes (horaires, évènements).   */
/* ------------------------------------------------------------------ */

export interface TimePickerProps {
  label?: string;
  /** `HH:MM` (24 h), ou null si vide. */
  value: string | null;
  onChange: (value: string) => void;
  /** Pas des minutes (défaut 15). */
  minuteStep?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function TimePicker({
  label,
  value,
  onChange,
  minuteStep = 15,
  placeholder = "--:--",
  disabled,
  className = "",
  id,
}: TimePickerProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDismiss(wrapRef, open, () => setOpen(false));

  const [h, m] = value ? value.split(":").map(Number) : [null, null];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from(
    { length: Math.ceil(60 / minuteStep) },
    (_, i) => i * minuteStep,
  );

  const set = (nh: number | null, nm: number | null) => {
    const hh = String(nh ?? h ?? 0).padStart(2, "0");
    const mm = String(nm ?? m ?? 0).padStart(2, "0");
    onChange(`${hh}:${mm}`);
  };

  const colBtn = (active: boolean) =>
    `grid h-9 w-full place-items-center rounded-md text-sm tabular-nums transition-colors ${
      active ? "bg-accent font-bold text-on-accent" : "text-primary hover:bg-raised"
    }`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label ? <FieldLabel id={fieldId}>{label}</FieldLabel> : null}
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          id={fieldId}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="ui-field flex h-11 w-full cursor-pointer items-center gap-2.5 px-3.5 text-left text-sm"
        >
          <Clock className="size-[18px] shrink-0 text-muted" />
          <span className={`scoreboard truncate ${value ? "" : "text-muted"}`}>
            {value ?? placeholder}
          </span>
        </button>

        {open ? (
          <Panel className="w-52">
            <div className="grid grid-cols-2">
              <div className="flex flex-col gap-0.5 border-r border-edge p-1">
                <span className="px-1 py-1 text-center text-[11px] font-semibold uppercase text-muted">
                  Heures
                </span>
                <div className="flex max-h-52 flex-col gap-0.5 overflow-y-auto">
                  {hours.map((hh) => (
                    <button
                      key={hh}
                      type="button"
                      onClick={() => set(hh, null)}
                      className={colBtn(hh === h)}
                    >
                      {String(hh).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-0.5 p-1">
                <span className="px-1 py-1 text-center text-[11px] font-semibold uppercase text-muted">
                  Minutes
                </span>
                <div className="flex max-h-52 flex-col gap-0.5 overflow-y-auto">
                  {minutes.map((mm) => (
                    <button
                      key={mm}
                      type="button"
                      onClick={() => {
                        set(null, mm);
                        if (h !== null) setOpen(false);
                      }}
                      className={colBtn(mm === m)}
                    >
                      {String(mm).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
