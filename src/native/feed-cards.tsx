/**
 * Cartes du fil d'accueil (natif) — tournoi et événement.
 *
 * Ce ne sont PAS les `EventCard` / `CompetitionCard` de `./cards`, qui sont des
 * lignes d'agenda : compactes, homogènes, faites pour être parcourues à la
 * verticale dans une liste dédiée. Une carte de fil a un autre travail — arrêter
 * le pouce au milieu d'un flux mélangé, et faire comprendre en un coup d'œil de
 * quoi il s'agit.
 *
 * LA DIFFÉRENCE ENTRE LES DEUX CARTES EST STRUCTURELLE, PAS DÉCORATIVE
 *
 * C'est le point à ne pas perdre en les retouchant. Elle découle du modèle de
 * données, pas d'un choix graphique :
 *
 *   • un TOURNOI porte UN jeu (`competitions.game_id`). Le jeu est donc son
 *     identité : il occupe la vignette de tête. Et comme la table ne stocke
 *     aucun visuel de couverture, la carte est nécessairement typographique —
 *     titre, format, échéance, places restantes. Elle ressemble à une affiche
 *     de compétition ;
 *
 *   • un ÉVÉNEMENT porte PLUSIEURS jeux (`event_games`, migration 0030). Aucun
 *     ne peut donc le représenter seul : l'identité passe par le visuel de
 *     couverture, et les jeux s'affichent en rangée de pastilles sous le titre.
 *     Elle ressemble à une affiche d'événement.
 *
 * Résultat : dans un fil qui alterne les deux, on les distingue à la silhouette,
 * avant même d'avoir lu un mot. C'est ce qu'on cherche — un badge « TOURNOI » en
 * haut à gauche de deux cartes par ailleurs identiques ne se voit pas en
 * défilant.
 *
 * TENSION DE COMPTEUR
 *
 * Les places restantes s'affichent en `danger` sous 20 % de la capacité, et
 * seulement là. Une carte qui crie en permanence n'informe plus (UX.md, aversion
 * à la perte : la rareté ne fonctionne que si elle est vraie).
 */
import {
  CalendarDays,
  Globe,
  MapPin,
  Ticket,
  Trophy,
  Users,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { competitionFormatLabel, eventTypeLabel, eventTypeTone, gameIconUrl } from '../lib/catalog';
import { priceOrFreeLabel } from '../lib/money';
import { Badge, Card, font, spacing, useE237Colors } from './core';
import { MediaImage } from './media-image';

/** Jeu tel qu'il apparaît sur une carte du fil. */
export interface FeedCardGame {
  id: string;
  slug: string;
  name: string;
}

/** Seuil de tension : en dessous, les places restantes passent en rouge. */
const TENSION = 0.2;

function placesTone(slotsLeft: number | null, capacity: number | null) {
  if (slotsLeft === null || capacity === null || capacity === 0) return 'neutral' as const;
  if (slotsLeft === 0) return 'danger' as const;
  return slotsLeft / capacity <= TENSION ? ('danger' as const) : ('neutral' as const);
}

/* ------------------------------------------------------------------ */
/* Rangée de pastilles de jeux                                         */
/* ------------------------------------------------------------------ */

/**
 * Les jeux d'un événement, en rangée.
 *
 * Trois au plus, puis « +N ». Un événement à six jeux occuperait sinon deux
 * lignes de pastilles et repousserait la date hors de l'écran — or la date est
 * l'information qui décide si on clique.
 */
function GameChips({ games, max = 3 }: { games: FeedCardGame[]; max?: number }) {
  const c = useE237Colors();
  if (games.length === 0) return null;
  const visibles = games.slice(0, max);
  const reste = games.length - visibles.length;

  return (
    <View style={styles.chipRow}>
      {visibles.map((game) => {
        const icon = gameIconUrl(game.slug);
        return (
          <View key={game.id} style={[styles.chip, { backgroundColor: c.frame, borderColor: c.border }]}>
            {icon ? (
              <MediaImage src={icon} alt="" ratio={1} rounded="sm" style={styles.chipIcon} />
            ) : null}
            <Text style={[styles.chipText, { color: c.textSecondary }]} numberOfLines={1}>
              {game.name}
            </Text>
          </View>
        );
      })}
      {reste > 0 ? (
        <View style={[styles.chip, { backgroundColor: c.frame, borderColor: c.border }]}>
          <Text style={[styles.chipText, { color: c.textMuted }]}>+{reste}</Text>
        </View>
      ) : null}
    </View>
  );
}

function MetaLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  const c = useE237Colors();
  return (
    <View style={styles.metaItem}>
      {icon}
      <Text style={[styles.meta, { color: c.textMuted }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Carte TOURNOI — un jeu, typographique                               */
/* ------------------------------------------------------------------ */

export interface FeedTournamentCardProps {
  title: string;
  /** Format brut (`single_elimination`…) — le libellé est dérivé ici. */
  format: string;
  /** Date déjà mise en forme par l'appelant (il connaît la locale et « dans 2 j »). */
  dateLabel: string;
  game?: FeedCardGame | null;
  city?: string | null;
  isOnline?: boolean;
  venueName?: string | null;
  capacity?: number | null;
  participantCount?: number;
  slotsLeft?: number | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function FeedTournamentCard({
  title,
  format,
  dateLabel,
  game,
  city,
  isOnline = false,
  venueName,
  capacity = null,
  participantCount = 0,
  slotsLeft = null,
  onPress,
  style,
}: FeedTournamentCardProps) {
  const c = useE237Colors();
  const icon = game ? gameIconUrl(game.slug) : undefined;
  const tone = placesTone(slotsLeft, capacity);
  const lieu = isOnline ? 'En ligne' : (venueName ?? city ?? null);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [style, pressed && onPress ? styles.pressed : null]}
    >
      <Card style={styles.stack}>
        <View style={styles.tournHead}>
          {/* Vignette du jeu : c'est l'identité de la carte, pas un ornement. */}
          {icon ? (
            <MediaImage src={icon} alt={game?.name ?? ''} ratio={1} rounded="md" style={styles.tournIcon} />
          ) : (
            <View style={[styles.tournIcon, styles.tournIconPh, { backgroundColor: c.frame }]}>
              <Trophy color={c.textMuted} size={20} />
            </View>
          )}
          <View style={styles.tournHeadText}>
            <View style={styles.badges}>
              <Badge tone="accent">Tournoi</Badge>
              <Badge tone="neutral">{competitionFormatLabel(format)}</Badge>
            </View>
            <Text style={[styles.title, { color: c.textPrimary }]} numberOfLines={2}>
              {title}
            </Text>
            {game ? (
              <Text style={[styles.gameName, { color: c.textSecondary }]} numberOfLines={1}>
                {game.name}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.metaRow}>
          <MetaLine icon={<CalendarDays color={c.textMuted} size={14} />} text={dateLabel} />
          {lieu ? (
            <MetaLine
              icon={
                isOnline ? (
                  <Globe color={c.textMuted} size={14} />
                ) : (
                  <MapPin color={c.textMuted} size={14} />
                )
              }
              text={lieu}
            />
          ) : null}
        </View>

        {capacity !== null ? (
          <View style={styles.footRow}>
            <MetaLine
              icon={<Users color={c.textMuted} size={14} />}
              text={`${participantCount}/${capacity} inscrits`}
            />
            {slotsLeft !== null ? (
              <Badge tone={tone}>
                {slotsLeft === 0 ? 'Complet' : `${slotsLeft} place${slotsLeft > 1 ? 's' : ''}`}
              </Badge>
            ) : null}
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Carte ÉVÉNEMENT — plusieurs jeux, visuel de couverture              */
/* ------------------------------------------------------------------ */

export interface FeedEventCardProps {
  title: string;
  /** Type brut (`meetup`, `watch_party`…) — libellé et ton dérivés. */
  type: string;
  dateLabel: string;
  coverUrl?: string | null;
  /** Tous les jeux concernés. Vide = événement généraliste, et c'est légitime. */
  games?: FeedCardGame[];
  city?: string | null;
  venueName?: string | null;
  isPaid?: boolean;
  priceXaf?: number | null;
  capacity?: number | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function FeedEventCard({
  title,
  type,
  dateLabel,
  coverUrl,
  games = [],
  city,
  venueName,
  isPaid = false,
  priceXaf = null,
  capacity = null,
  onPress,
  style,
}: FeedEventCardProps) {
  const c = useE237Colors();
  const lieu = venueName ?? city ?? null;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [style, pressed && onPress ? styles.pressed : null]}
    >
      <Card style={styles.eventCard}>
        {/*
          La couverture EST l'identité : pleine largeur, en tête. Sans visuel on
          ne laisse pas un trou — `MediaImage` pose son propre repli, et le ratio
          reste le même pour que le fil ne saute pas d'une carte à l'autre.
        */}
        <MediaImage
          src={coverUrl}
          alt={title}
          ratio={16 / 9}
          rounded="none"
          fallbackLabel={eventTypeLabel(type)}
          style={styles.cover}
        />

        <View style={styles.eventBody}>
          <View style={styles.badges}>
            <Badge tone={eventTypeTone(type)}>{eventTypeLabel(type)}</Badge>
            {games.length > 1 ? (
              <Badge tone="cyan">{games.length} jeux</Badge>
            ) : games.length === 0 ? (
              // Pas un défaut : une assemblée de joueurs n'a pas de jeu, et
              // l'annoncer vaut mieux que de laisser un vide inexpliqué.
              <Badge tone="neutral">Tous publics</Badge>
            ) : null}
          </View>

          <Text style={[styles.title, { color: c.textPrimary }]} numberOfLines={2}>
            {title}
          </Text>

          <GameChips games={games} />

          <View style={styles.metaRow}>
            <MetaLine icon={<CalendarDays color={c.textMuted} size={14} />} text={dateLabel} />
            {lieu ? <MetaLine icon={<MapPin color={c.textMuted} size={14} />} text={lieu} /> : null}
          </View>

          <View style={styles.footRow}>
            <View style={styles.metaItem}>
              <Ticket color={isPaid ? c.accent : c.textMuted} size={14} />
              <Text
                style={[styles.price, { color: isPaid ? c.accent : c.textSecondary }]}
              >
                {priceOrFreeLabel(isPaid ? priceXaf : null)}
              </Text>
            </View>
            {capacity !== null ? (
              <Text style={[styles.meta, { color: c.textMuted }]}>{capacity} places</Text>
            ) : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  stack: { gap: spacing['2'] },

  // ── Tournoi
  tournHead: { flexDirection: 'row', gap: spacing['2'], alignItems: 'flex-start' },
  tournIcon: { width: 52, height: 52 },
  tournIconPh: { alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  tournHeadText: { flex: 1, gap: 4, minWidth: 0 },
  gameName: { fontSize: font.size.sm, fontWeight: font.weight.medium },

  // ── Événement : la couverture touche les bords, donc le rembourrage
  // descend dans le corps plutôt que sur la carte.
  eventCard: { padding: 0, overflow: 'hidden', gap: 0 },
  cover: { width: '100%' },
  eventBody: { padding: spacing['4'], gap: spacing['2'] },

  // ── Communs
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  title: { fontSize: font.size.md, fontWeight: font.weight.bold, lineHeight: 21 },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 160,
  },
  chipIcon: { width: 14, height: 14 },
  chipText: { fontSize: font.size.xs, fontWeight: font.weight.medium },
  metaRow: { flexDirection: 'row', gap: spacing['4'], flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 0 },
  meta: { fontSize: font.size.xs, fontWeight: font.weight.regular },
  footRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing['2'] },
  price: { fontSize: font.size.sm, fontWeight: font.weight.bold },
});
