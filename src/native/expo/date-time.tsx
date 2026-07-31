/**
 * DateField / TimeField backed by `@expo/ui/community/datetime-picker`.
 * Même API que `../date-time` (valeur ISO date / HH:mm).
 */
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { CalendarDays, Clock } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { radius, spacing, useE237Colors } from '../core';
import { Txt } from '../text';
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

function Trigger({
  label,
  icon: Icon,
  text,
  filled,
  onPress,
}: {
  label?: string;
  icon: typeof CalendarDays;
  text: string;
  filled: boolean;
  onPress: () => void;
}) {
  const c = useE237Colors();
  return (
    <View style={{ gap: spacing['1'] }}>
      {label ? (
        <Txt variant="subtitle" size={12} tone="secondary">
          {label}
        </Txt>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={{
          minHeight: 44,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing['2'],
          borderWidth: 1,
          borderRadius: radius.md,
          paddingHorizontal: spacing['3'],
          backgroundColor: c.surface,
          borderColor: c.border,
        }}
      >
        <Icon color={c.textSecondary} size={18} />
        <Txt
          numberOfLines={1}
          variant="body"
          size={15}
          tone={filled ? 'primary' : 'muted'}
          style={{ flex: 1 }}
        >
          {text}
        </Txt>
      </Pressable>
    </View>
  );
}

export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Choisir une date…',
}: {
  label?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}) {
  const c = useE237Colors();
  const [open, setOpen] = useState(false);
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
    <>
      <Trigger
        label={label}
        icon={CalendarDays}
        text={display}
        filled={!!value}
        onPress={() => setOpen(true)}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <DateTimePicker
          mode="date"
          value={current}
          accentColor={c.accent}
          is24Hour
          onValueChange={(_e, date) => {
            onChange(toISODate(date));
            setOpen(false);
          }}
        />
      </Sheet>
    </>
  );
}

export function TimeField({
  label,
  value,
  onChange,
  placeholder = 'Choisir une heure…',
}: {
  label?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}) {
  const c = useE237Colors();
  const [open, setOpen] = useState(false);
  const current = parseTime(value);
  const display = value ?? placeholder;

  return (
    <>
      <Trigger
        label={label}
        icon={Clock}
        text={display}
        filled={!!value}
        onPress={() => setOpen(true)}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <DateTimePicker
          mode="time"
          value={current}
          accentColor={c.accent}
          is24Hour
          onValueChange={(_e, date) => {
            onChange(toHHMM(date));
            setOpen(false);
          }}
        />
      </Sheet>
    </>
  );
}
