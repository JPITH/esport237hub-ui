/**
 * Cartes de liste (natif) — jumelles de `./web/cards`, mêmes noms, mêmes
 * props (la navigation passe par `onPress` au lieu de `href`).
 */
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Gift,
  MapPin,
  Shirt,
  Store,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  competitionFormatLabel,
  competitionStatusLabel,
  competitionStatusTone,
  eventTypeLabel,
  eventTypeTone,
  ticketStatusMeta,
} from '../lib/catalog';
import { formatXaf, priceOrFreeLabel } from '../lib/money';
import { Badge, Card, font, spacing, useE237Colors } from './core';
import { MediaImage } from './media-image';
import { PerkList } from './perk-list';

/** Enveloppe pressable optionnelle — sans `onPress`, simple bloc. */
function Clickable({
  onPress,
  children,
  style,
}: {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  if (!onPress) return <View style={style}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* EventCard                                                           */
/* ------------------------------------------------------------------ */

export interface EventCardProps {
  onPress?: () => void;
  title: string;
  /** Type d'évènement brut (`tournament`, `meetup`…) — libellé et ton dérivés. */
  type: string;
  gameName?: string | null;
  /** Date déjà mise en forme par l'appelant. */
  dateLabel: string;
  /** Salle ou ville. */
  placeLabel?: string | null;
  capacity?: number | null;
  /** Prix déjà calculé (« Gratuit », « À partir de 2 000 FCFA »…). */
  priceLabel: string;
  /** Colore le prix en accent (évènement payant). */
  isPaid?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function EventCard({
  onPress,
  title,
  type,
  gameName,
  dateLabel,
  placeLabel,
  capacity,
  priceLabel,
  isPaid = false,
  style,
}: EventCardProps) {
  const c = useE237Colors();
  return (
    <Clickable onPress={onPress} style={style}>
      <Card style={styles.stack}>
        <View style={styles.headRow}>
          <View style={styles.headMain}>
            <View style={styles.badges}>
              <Badge tone={eventTypeTone(type)}>{eventTypeLabel(type)}</Badge>
              {gameName ? <Badge tone="neutral">{gameName}</Badge> : null}
            </View>
            <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
          </View>
          <Text
            style={[
              styles.price,
              { color: isPaid ? c.accent : c.textSecondary },
            ]}
          >
            {priceLabel}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <CalendarDays color={c.textMuted} size={14} />
            <Text style={[styles.meta, { color: c.textMuted }]}>{dateLabel}</Text>
          </View>
          {placeLabel ? (
            <View style={styles.metaItem}>
              <MapPin color={c.textMuted} size={14} />
              <Text style={[styles.meta, { color: c.textMuted }]}>{placeLabel}</Text>
            </View>
          ) : null}
          {capacity ? (
            <Text style={[styles.meta, { color: c.textMuted }]}>
              · {capacity} places
            </Text>
          ) : null}
        </View>
      </Card>
    </Clickable>
  );
}

/* ------------------------------------------------------------------ */
/* CompetitionCard                                                     */
/* ------------------------------------------------------------------ */

export interface CompetitionCardProps {
  onPress?: () => void;
  title: string;
  /** `upcoming` / `ongoing` / `finished`. */
  status: string;
  /** `single_elimination`, `swiss`… — libellé FR dérivé. */
  format: string;
  isOnline: boolean;
  city?: string | null;
  /** Date de début déjà mise en forme ; absente = non annoncée. */
  dateLabel?: string | null;
  venueName?: string | null;
  style?: StyleProp<ViewStyle>;
}

export function CompetitionCard({
  onPress,
  title,
  status,
  format,
  isOnline,
  city,
  dateLabel,
  venueName,
  style,
}: CompetitionCardProps) {
  const c = useE237Colors();
  const parts = [
    competitionFormatLabel(format),
    isOnline ? 'En ligne' : (city ?? 'En salle'),
    dateLabel ?? null,
    venueName ?? null,
  ].filter(Boolean) as string[];

  return (
    <Clickable onPress={onPress} style={style}>
      <Card style={styles.stack}>
        <View style={styles.headRow}>
          <Text style={[styles.title, styles.grow, { color: c.textPrimary }]}>
            {title}
          </Text>
          <Badge tone={competitionStatusTone(status)}>
            {competitionStatusLabel(status)}
          </Badge>
        </View>
        <Text style={[styles.meta, { color: c.textMuted }]}>
          {parts.join(' · ')}
        </Text>
      </Card>
    </Clickable>
  );
}

/* ------------------------------------------------------------------ */
/* ProductCard                                                         */
/* ------------------------------------------------------------------ */

export interface ProductCardProps {
  onPress?: () => void;
  name: string;
  description?: string | null;
  priceXaf: number;
  /** `digital` (livraison automatique) ou `physical` (retrait en salle). */
  kind: string;
  imageUrl?: string | null;
  style?: StyleProp<ViewStyle>;
}

export function ProductCard({
  onPress,
  name,
  description,
  priceXaf,
  kind,
  imageUrl,
  style,
}: ProductCardProps) {
  const c = useE237Colors();
  const digital = kind === 'digital';
  return (
    <Clickable onPress={onPress} style={style}>
      <Card style={styles.stack}>
        <View>
          <MediaImage
            src={imageUrl}
            alt={name}
            ratio={1}
            rounded="lg"
            fallbackIcon={
              digital ? (
                <Gift color={c.textMuted} size={26} strokeWidth={1.25} />
              ) : (
                <Shirt color={c.textMuted} size={26} strokeWidth={1.25} />
              )
            }
            fallbackLabel="Visuel à venir"
          />
          <Badge tone={digital ? 'cyan' : 'neutral'} style={styles.floatBadge}>
            {digital ? 'Numérique' : 'Physique'}
          </Badge>
        </View>
        <Text style={[styles.title, { color: c.textPrimary }]}>{name}</Text>
        <Text
          numberOfLines={2}
          style={[styles.meta, { color: c.textSecondary, fontSize: font.size.sm }]}
        >
          {description || '—'}
        </Text>
        <Text style={[styles.bigPrice, { color: c.accent }]}>
          {formatXaf(priceXaf)}
        </Text>
      </Card>
    </Clickable>
  );
}

/* ------------------------------------------------------------------ */
/* TicketCard                                                          */
/* ------------------------------------------------------------------ */

export interface TicketCardProps {
  eventTitle: string;
  /** Type d'évènement brut — libellé FR dérivé. */
  eventType: string;
  /** Ouverture de la fiche de l'évènement (titre pressable). */
  onPressEvent?: () => void;
  dateLabel: string;
  city?: string | null;
  quantity: number;
  amountXaf: number;
  /** `paid`, `reserved`, `cancelled`, `refunded`. */
  status: string;
  /** Billet déjà scanné à l'entrée. */
  admitted?: boolean;
  /** Date de l'admission, déjà mise en forme. */
  checkedInAtLabel?: string | null;
  /**
   * Le QR lui-même. Le design system ne fabrique pas le code (l'encodage
   * dépend d'une bibliothèque par plateforme) : il l'accueille — voir
   * `QrFrame`.
   */
  qr?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function TicketCard({
  eventTitle,
  eventType,
  onPressEvent,
  dateLabel,
  city,
  quantity,
  amountXaf,
  status,
  admitted = false,
  checkedInAtLabel,
  qr,
  style,
}: TicketCardProps) {
  const c = useE237Colors();
  const meta = ticketStatusMeta(status);

  const title = (
    <View style={styles.grow}>
      <Text style={[styles.title, { color: c.textPrimary }]}>{eventTitle}</Text>
      <Text style={[styles.meta, { color: c.textMuted }]}>
        {eventTypeLabel(eventType)}
      </Text>
    </View>
  );

  return (
    <Card style={[styles.stack, style]}>
      <View style={styles.headRow}>
        {onPressEvent ? (
          <Pressable
            accessibilityRole="button"
            onPress={onPressEvent}
            style={({ pressed }) => [styles.grow, pressed && styles.pressed]}
          >
            {title}
          </Pressable>
        ) : (
          title
        )}
        <View style={styles.badges}>
          {admitted ? <Badge tone="accent">Admis</Badge> : null}
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <CalendarDays color={c.textMuted} size={14} />
          <Text style={[styles.meta, { color: c.textMuted }]}>{dateLabel}</Text>
        </View>
        {city ? (
          <View style={styles.metaItem}>
            <MapPin color={c.textMuted} size={14} />
            <Text style={[styles.meta, { color: c.textMuted }]}>{city}</Text>
          </View>
        ) : null}
        <Text style={[styles.meta, { color: c.textMuted }]}>
          · {quantity} billet{quantity > 1 ? 's' : ''}
        </Text>
        <Text style={[styles.meta, { color: c.textSecondary, fontWeight: font.weight.semibold }]}>
          {priceOrFreeLabel(amountXaf)}
        </Text>
      </View>

      {qr ? (
        <View style={[styles.qrRow, { borderTopColor: c.border }]}>
          {qr}
          <View style={styles.grow}>
            {admitted ? (
              <>
                <View style={styles.metaItem}>
                  <CheckCircle2 color={c.accent} size={16} />
                  <Text style={[styles.qrTitle, { color: c.accent }]}>
                    Déjà admis à l’entrée
                  </Text>
                </View>
                {checkedInAtLabel ? (
                  <Text style={[styles.meta, { color: c.textMuted }]}>
                    Ce QR a déjà servi le {checkedInAtLabel}.
                  </Text>
                ) : null}
              </>
            ) : (
              <>
                <Text style={[styles.qrTitle, { color: c.textSecondary }]}>
                  Présente ce QR à l’entrée
                </Text>
                <Text style={[styles.meta, { color: c.textMuted }]}>
                  Le personnel le scanne pour valider ton accès.
                </Text>
              </>
            )}
          </View>
        </View>
      ) : null}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* SubscriptionCard                                                    */
/* ------------------------------------------------------------------ */

export interface SubscriptionCardProps {
  venueName: string;
  planName: string;
  /** Abonnement encore consommable (heures restantes et non périmé). */
  usable: boolean;
  /** Libellé d'état quand l'abonnement n'est plus utilisable. */
  statusLabel: string;
  /** Ex. « 4 h restantes ». */
  remainingLabel: string;
  /** Ex. « Jusqu’au 12 août » ; absent = sans péremption. */
  expiresLabel?: string | null;
  city?: string | null;
  pricePaidXaf: number;
  perks?: readonly string[] | null;
  style?: StyleProp<ViewStyle>;
}

export function SubscriptionCard({
  venueName,
  planName,
  usable,
  statusLabel,
  remainingLabel,
  expiresLabel,
  city,
  pricePaidXaf,
  perks,
  style,
}: SubscriptionCardProps) {
  const c = useE237Colors();
  return (
    <Card style={[styles.stack, style]}>
      <View style={styles.headRow}>
        <View style={styles.grow}>
          <View style={styles.metaItem}>
            <Store color={c.accent} size={16} />
            <Text style={[styles.title, { color: c.textPrimary }]}>
              {venueName}
            </Text>
          </View>
          <Text style={[styles.meta, { color: c.textMuted }]}>{planName}</Text>
        </View>
        <Badge tone={usable ? 'accent' : 'neutral'}>
          {usable ? 'Utilisable' : statusLabel}
        </Badge>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Clock color={c.textMuted} size={14} />
          <Text style={[styles.meta, { color: c.textSecondary }]}>
            {remainingLabel}
          </Text>
        </View>
        <Text style={[styles.meta, { color: c.textSecondary }]}>
          {expiresLabel ?? 'Sans péremption'}
        </Text>
        {city ? (
          <View style={styles.metaItem}>
            <MapPin color={c.textMuted} size={14} />
            <Text style={[styles.meta, { color: c.textSecondary }]}>{city}</Text>
          </View>
        ) : null}
        <Text style={[styles.meta, { color: c.textSecondary }]}>
          Payé {formatXaf(pricePaidXaf)}
        </Text>
      </View>

      <PerkList items={perks} />
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* VenueCard                                                           */
/* ------------------------------------------------------------------ */

export interface VenueCardProps {
  onPress?: () => void;
  name: string;
  city: string;
  district?: string | null;
  /** Tarif « à partir de », en FCFA/heure. */
  pricePerHour?: number | null;
  /** Calculé par l'API depuis les horaires ; absent = on n'affiche rien. */
  isOpen?: boolean;
  imageUrl?: string | null;
  /**
   * Disciplines de la salle. Seuls les noms sont rendus, les trois premiers,
   * duels ouverts d'abord (l'API trie déjà ainsi) : sur une carte de liste on
   * répond à « est-ce que mon jeu y est ? », pas au détail de l'inventaire.
   */
  games?: readonly { id: string; name: string; duels_open: boolean }[] | null;
  style?: StyleProp<ViewStyle>;
}

/**
 * Carte de salle (natif) — jumelle de `./web/venue-card`.
 *
 * Le web tire ses puces d'`equipment.consoles` (les types de postes) ; ici
 * ce sont les JEUX, parce que sur mobile la liste des salles est le point
 * d'entrée du parcours « où puis-je jouer à FC 27 ce soir ». Le badge des
 * duels reste sur la fiche : trois pastilles suffisent à donner l'envie
 * d'ouvrir, les mentionner toutes ferait un pavé sur une carte de 160 px.
 */
export function VenueCard({
  onPress,
  name,
  city,
  district,
  pricePerHour,
  isOpen,
  imageUrl,
  games,
  style,
}: VenueCardProps) {
  const c = useE237Colors();
  const shown = (games ?? []).slice(0, 3);
  const extra = (games?.length ?? 0) - shown.length;

  return (
    <Clickable onPress={onPress} style={style}>
      <Card style={styles.stack}>
        <View style={styles.venueMedia}>
          <MediaImage
            src={imageUrl}
            alt={`Salle ${name}`}
            ratio={16 / 10}
            rounded="lg"
            fallbackIcon={
              <Store color={c.textMuted} size={30} strokeWidth={1.25} />
            }
          />
          {isOpen !== undefined ? (
            <View style={styles.floatBadge}>
              <Badge tone={isOpen ? 'accent' : 'neutral'}>
                {isOpen ? 'Ouvert' : 'Fermé'}
              </Badge>
            </View>
          ) : null}
        </View>

        <View style={styles.headRow}>
          <View style={styles.headMain}>
            <Text style={[styles.title, { color: c.textPrimary }]} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.metaItem}>
              <MapPin color={c.textMuted} size={14} />
              <Text style={[styles.meta, { color: c.textMuted }]} numberOfLines={1}>
                {city}
                {district ? ` · ${district}` : ''}
              </Text>
            </View>
          </View>
          {pricePerHour != null ? (
            <Text style={[styles.price, { color: c.accent }]}>
              {formatXaf(pricePerHour)}
              <Text style={[styles.meta, { color: c.textMuted }]}> /h</Text>
            </Text>
          ) : null}
        </View>

        {shown.length ? (
          <View style={styles.badges}>
            {shown.map((game) => (
              <Badge key={game.id} tone={game.duels_open ? 'cyan' : 'neutral'}>
                {game.name}
              </Badge>
            ))}
            {extra > 0 ? <Badge tone="neutral">+{extra}</Badge> : null}
          </View>
        ) : null}
      </Card>
    </Clickable>
  );
}

const styles = StyleSheet.create({
  venueMedia: { position: 'relative' },
  stack: { gap: spacing['2'] },
  grow: { flex: 1 },
  headRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing['3'],
  },
  headMain: { flex: 1, gap: spacing['1'] },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['1-5'] },
  title: { fontSize: font.size.sm, fontWeight: font.weight.semibold },
  price: { fontSize: font.size.sm, fontWeight: font.weight.bold },
  bigPrice: { fontSize: font.size.lg, fontWeight: font.weight.bold },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing['2'],
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'] },
  meta: { fontSize: font.size.xs },
  floatBadge: { position: 'absolute', top: spacing['2'], right: spacing['2'] },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing['3'],
  },
  qrTitle: { fontSize: font.size.sm, fontWeight: font.weight.semibold },
  pressed: { opacity: 0.85 },
});
