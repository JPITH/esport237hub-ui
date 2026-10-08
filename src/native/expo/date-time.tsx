/**
 * DateField / TimeField backed by `@expo/ui/community/datetime-picker`.
 * Même API que `../date-time` (valeur ISO date / HH:mm).
 */
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';

import type { IconName } from '../../icons/names';
import { useE237Colors } from '../core';
import { FieldTrigger } from '../date-time';
import { Sheet } from './sheet';

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toHHMM(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function parseDate(iso: string | null): Date {
  if (!iso) return new Date();
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function parseTime(hhmm: string | null): Date {
  const base = new Date();
  if (!hhmm) return base;
  const [h, m] = hhmm.split(':').map((n) => Number.parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return base;
  base.setHours(h, m, 0, 0);
  return base;
}

/**
 * Le corps commun aux deux champs : le déclencheur partagé avec la version
 * React Native, puis une feuille avec le sélecteur natif de la plateforme.
 * Choisir referme la feuille.
 */
function NativePickerField({
  label,
  required,
  icon,
  mode,
  text,
  filled,
  current,
  onPick,
}: {
  label?: string;
  required?: boolean;
  icon: IconName;
  mode: 'date' | 'time';
  text: string;
  filled: boolean;
  current: Date;
  onPick: (date: Date) => void;
}) {
  const c = useE237Colors();
  const [open, setOpen] = useState(false);
  return (
    <>
      <FieldTrigger
        label={label}
        required={required}
        icon={icon}
        text={text}
        filled={filled}
        onPress={() => setOpen(true)}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <DateTimePicker
          mode={mode}
          value={current}
          accentColor={c.accent}
          is24Hour
          onValueChange={(_e, date) => {
            onPick(date);
            setOpen(false);
          }}
        />
      </Sheet>
    </>
  );
}

export function DateField({
  label,
  required,
  value,
  onChange,
  placeholder = 'Choisir une date…',
}: {
  label?: string;
  /** Champ obligatoire : un astérisque suit le libellé. */
  required?: boolean;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}) {
  const current = parseDate(value);
  const display = value
    ? current.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : placeholder;

  return (
    <NativePickerField
      label={label}
      required={required}
      icon="calendar"
      mode="date"
      text={display}
      filled={!!value}
      current={current}
      onPick={(date) => onChange(toISODate(date))}
    />
  );
}

export function TimeField({
  label,
  required,
  value,
  onChange,
  placeholder = 'Choisir une heure…',
}: {
  label?: string;
  /** Champ obligatoire : un astérisque suit le libellé. */
  required?: boolean;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}) {
  return (
    <NativePickerField
      label={label}
      required={required}
      icon="clock"
      mode="time"
      text={value ?? placeholder}
      filled={!!value}
      current={parseTime(value)}
      onPick={(date) => onChange(toHHMM(date))}
    />
  );
}
