/**
 * Carte globale du joueur — MÊME template FUT « Founders » que la carte de
 * jeu (et que le web) : plaque « GLOBALE » (pas de badge jeu), skin global
 * bleu nuit + or, tag GLB, palmarès sous le nom.
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
import { CardCrest, CardFooter, DivisionChip, s } from './player-card';

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
  division,
  skin = 'global',
}: {
  username: string;
  city?: string | null;
  cards: GameCardLike[];
  /** Division globale (Elite, Challenger…) sous le drapeau. */
  division?: string | null;
  /** « champion » pour le n°1 du classement global. */
  skin?: 'global' | 'champion';
}) {
  const spec = CARD_SKINS[skin];
  const g = buildGlobalCard(cards);

  return (
    <CardChrome skin={skin}>
      <CardCrest spec={spec} label="Globale" />

      <View style={s.head}>
        <View style={s.badge}>
          <Text style={[s.ovr, { color: spec.ink }]}>{g.overall}</Text>
          <Text style={[s.pos, { color: spec.ink }]}>{cityAbbr(city)}</Text>
          <View style={s.flag}>
            <Flag />
          </View>
          {division ? <DivisionChip spec={spec} label={division} /> : null}
        </View>
        <View style={s.img}>
          <UserRound size={96} color={spec.ink} strokeWidth={1.25} style={{ opacity: 0.2 }} />
        </View>
      </View>

      <View style={[s.identity, { borderTopColor: spec.line }]}>
        <Text numberOfLines={1} style={[s.name, { color: spec.ink }]}>
          {username.toUpperCase()}
        </Text>
        <Text numberOfLines={1} style={[s.record, { color: spec.ink }]}>
          {g.points} pts · {g.wins}V/{g.losses}D
          {g.extraGames > 0 ? ` · +${g.extraGames} jeux` : ''}
        </Text>
      </View>

      <View style={s.stats}>
        {g.games.length ? (
          g.games.map((game, i) => (
            <View
              key={game.slug}
              style={[
                s.stat,
                i % 2 === 0
                  ? { borderRightWidth: 1, borderRightColor: spec.line, paddingRight: 12 }
                  : { paddingLeft: 12 },
              ]}>
              <Text style={[s.statValue, { color: spec.ink }]}>{game.rating}</Text>
              <Text style={[s.statAbbr, { color: spec.ink }]}>
                {gameCode(game.slug, game.name)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[s.record, { color: spec.ink }]}>Aucune discipline active.</Text>
        )}
      </View>

      <CardFooter spec={spec} />
    </CardChrome>
  );
}
