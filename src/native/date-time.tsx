/**
 * Champs date et heure maison (paramétrage des évènements, horaires, tarifs…).
 * Aucun picker natif : feuille modale custom, cohérente avec SelectSheet,
 * zones tactiles ≥ 44 px, thèmes clair/sombre via useE237Colors().
 */
import { radius, spacing, useE237Colors } from './core';
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sheet } from './sheet';

const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function Trigger({
  label,
  icon,
  text,
  filled,
  onPress,
}: {
  label?: string;
  icon: ReactNodeIcon;
  text: string;
  filled: boolean;
  onPress: () => void;
}) {
  const c = useE237Colors();
  const Icon = icon;
  return (
    <View style={{ gap: spacing['1'] }}>
      {label ? (
        <Text style={{ color: c.textSecondary, fontSize: 12, fontWeight: '500' }}>{label}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.trigger, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Icon color={c.textSecondary} size={18} />
        <Text
          numberOfLines={1}
          style={{ color: filled ? c.textPrimary : c.textMuted, fontSize: 15, flex: 1 }}>
          {text}
        </Text>
      </Pressable>
    </View>
  );
}
type ReactNodeIcon = typeof CalendarDays;

/** Champ date : calendrier mensuel en feuille. Valeur ISO `YYYY-MM-DD` ou null. */
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

  const today = new Date();
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());
  const base = value ? new Date(`${value}T12:00:00`) : today;
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });

  const firstDay = new Date(view.y, view.m, 1);
  const offset = (firstDay.getDay() + 6) % 7; // lundi en tête
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
    ? new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', {
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

      <Sheet open={open} onClose={() => setOpen(false)} title={label ?? 'Date'}>
        <View style={styles.monthNav}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mois précédent"
            onPress={() => shift(-1)}
            style={styles.monthBtn}>
            <ChevronLeft color={c.textSecondary} size={20} />
          </Pressable>
          <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 15 }}>
            {MONTHS[view.m]} {view.y}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mois suivant"
            onPress={() => shift(1)}
            style={styles.monthBtn}>
            <ChevronRight color={c.textSecondary} size={20} />
          </Pressable>
        </View>

        <View style={styles.grid}>
          {WEEKDAYS.map((d, i) => (
            <View key={`w${i}`} style={styles.cell}>
              <Text style={{ color: c.textMuted, fontSize: 11, fontWeight: '700' }}>{d}</Text>
            </View>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <View key={`e${i}`} style={styles.cell} />;
            const iso = toISO(view.y, view.m, day);
            const isSelected = iso === value;
            const isToday = iso === todayISO;
            return (
              <View key={iso} style={styles.cell}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  style={[
                    styles.day,
                    isSelected && { backgroundColor: c.accent },
                    !isSelected && isToday && { borderWidth: 1, borderColor: c.accent },
                  ]}>
                  <Text
                    style={{
                      color: isSelected ? c.bg : isToday ? c.accent : c.textPrimary,
                      fontWeight: isSelected ? '700' : '400',
                      fontSize: 14,
                    }}>
                    {day}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={[styles.footer, { borderTopColor: c.border }]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onChange(todayISO);
              setView({ y: today.getFullYear(), m: today.getMonth() });
              setOpen(false);
            }}
            style={styles.footerBtn}>
            <Text style={{ color: c.accent, fontWeight: '600', fontSize: 13 }}>
              Aujourd&rsquo;hui
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onChange(null);
              setOpen(false);
            }}
            style={styles.footerBtn}>
            <Text style={{ color: c.textMuted, fontSize: 13 }}>Effacer</Text>
          </Pressable>
        </View>
      </Sheet>
    </>
  );
}

/** Champ heure : colonnes heures/minutes en feuille. Valeur `HH:MM` ou null. */
export function TimeField({
  label,
  value,
  onChange,
  minuteStep = 15,
  placeholder = '--:--',
}: {
  label?: string;
  value: string | null;
  onChange: (value: string) => void;
  minuteStep?: number;
  placeholder?: string;
}) {
  const c = useE237Colors();
  const [open, setOpen] = useState(false);

  const [h, m] = value ? value.split(':').map(Number) : [null, null];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);

  const set = (nh: number | null, nm: number | null) => {
    const hh = String(nh ?? h ?? 0).padStart(2, '0');
    const mm = String(nm ?? m ?? 0).padStart(2, '0');
    onChange(`${hh}:${mm}`);
  };

  return (
    <>
      <Trigger
        label={label}
        icon={Clock}
        text={value ?? placeholder}
        filled={!!value}
        onPress={() => setOpen(true)}
      />

      <Sheet open={open} onClose={() => setOpen(false)} title={label ?? 'Heure'}>
        <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
          <TimeColumn heading="Heures" items={hours} active={h} onPick={(n) => set(n, null)} />
          <TimeColumn
            heading="Minutes"
            items={minutes}
            active={m}
            onPick={(n) => {
              set(null, n);
              if (h !== null) setOpen(false);
            }}
          />
        </View>
      </Sheet>
    </>
  );
}

/** Hauteur d'un item (minHeight 44 + marges) — sert à l'auto-scroll. */
const TIME_ITEM_HEIGHT = 46;

function TimeColumn({
  heading,
  items,
  active,
  onPick,
}: {
  heading: string;
  items: number[];
  active: number | null;
  onPick: (n: number) => void;
}) {
  const c = useE237Colors();
  const ref = useRef<ScrollView>(null);

  // À l'ouverture, amène la valeur sélectionnée dans la fenêtre visible.
  useEffect(() => {
    if (active === null) return;
    const i = items.indexOf(active);
    if (i > 2) {
      ref.current?.scrollTo({ y: (i - 2) * TIME_ITEM_HEIGHT, animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, gap: spacing['1'] }}>
      <Text
        style={{
          color: c.textMuted,
          fontSize: 11,
          fontWeight: '700',
          textAlign: 'center',
          textTransform: 'uppercase',
        }}>
        {heading}
      </Text>
      <ScrollView ref={ref} style={{ maxHeight: 260 }}>
        {items.map((n) => {
          const isActive = n === active;
          return (
            <Pressable
              key={n}
              accessibilityRole="button"
              onPress={() => onPick(n)}
              style={[styles.timeItem, isActive && { backgroundColor: c.accent }]}>
              <Text
                style={{
                  color: isActive ? c.bg : c.textPrimary,
                  fontWeight: isActive ? '700' : '400',
                  fontSize: 15,
                }}>
                {String(n).padStart(2, '0')}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing['3'],
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  day: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: spacing['2'],
  },
  footerBtn: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing['2'],
  },
  timeItem: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    marginVertical: 1,
  },
});
