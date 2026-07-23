/**
 * Carte globale du joueur — MÊME template FUT que la carte de jeu (et que le
 * web) : skin « global » bleu nuit + or, tag GLB, gros chiffre victoires.
 *
 * Un joueur = une identité globale + N cartes de jeu. La carte globale est
 * DÉRIVÉE de toutes ses cartes (`buildGlobalCard`) : OVERALL = meilleure note,
 * six disciplines maximum (le surplus est compté), victoires/défaites cumulées.
 */
import { UserRound } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { buildGlobalCard, type GameCardLike } from '../lib/global-card';
import { cityAbbr } from '../lib/player-stats';

import { CARD_SKINS, CardChrome } from './card-skins';
import { Flag } from './flag';
import { s } from './player-card';

const GAME_CODE: Record<string, string> = {
  fc27: 'FC',
  'clash-royale': 'CR',
  'call-of-duty': 'COD',
  'pubg-mobile': 'PUB',
  valorant: 'VAL',
};

function gameCode(slug: string | undefined, name: string): string {
  if (slug && GAME_CODE[slug]) return GAME_CODE[slug];
  return name
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 3)
    .toUpperCase();
}

export function GlobalCard({
  username,
  city,
  cards,
  skin = 'global',
}: {
  username: string;
  city?: string | null;
  cards: GameCardLike[];
  /** « champion » pour le n°1 du classement global. */
  skin?: 'global' | 'champion';
}) {
  const spec = CARD_SKINS[skin];
  const g = buildGlobalCard(cards);

  return (
    <CardChrome skin={skin}>
      <View style={s.head}>
        <View style={s.badge}>
          <Text style={[s.ovr, { color: spec.ink }]}>{g.overall}</Text>
          <Text style={[s.ovrLabel, { color: spec.ink }]}>GLB</Text>
          <Text style={[s.pos, { color: spec.ink }]}>{cityAbbr(city)}</Text>
          <View style={[s.rule, { backgroundColor: spec.ink }]} />
          <Flag />
        </View>
        <View style={s.img}>
          <UserRound size={96} color={spec.ink} strokeWidth={1.25} style={{ opacity: 0.2 }} />
        </View>
      </View>

      <View style={s.nameWrap}>
        <View style={s.winsRow}>
          <Text
            style={[
              s.wins,
              {
                color: spec.accent,
                textShadowColor: `${spec.accent}55`,
                textShadowRadius: 12,
                textShadowOffset: { width: 0, height: 4 },
              },
            ]}>
            {g.wins}
          </Text>
          <Text style={[s.winsLbl, { color: spec.ink }]}>VICT.</Text>
        </View>
        <Text numberOfLines={1} style={[s.name, { color: spec.ink }]}>
          {username.toUpperCase()}
        </Text>
        <Text numberOfLines={1} style={[s.meta, { color: spec.ink }]}>
          {g.points} pts · {g.wins}V/{g.losses}D
          {g.extraGames > 0 ? ` · +${g.extraGames} jeux` : ''}
        </Text>
      </View>

      <View style={[s.stats, { borderTopColor: spec.line }]}>
        {g.games.length ? (
          g.games.map((game) => (
            <View key={game.slug} style={s.stat}>
              <Text style={[s.statValue, { color: spec.ink }]}>{game.rating}</Text>
              <Text style={[s.statAbbr, { color: spec.ink }]}>
                {gameCode(game.slug, game.name)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[s.meta, { color: spec.ink }]}>Aucune discipline active.</Text>
        )}
      </View>
    </CardChrome>
  );
}
