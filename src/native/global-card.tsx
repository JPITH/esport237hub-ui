/**
 * Carte globale du joueur — MÊME template FUT « Founders » que la carte de
 * jeu (et que le web) : plaque « GLOBALE » (pas de badge jeu), skin global
 * bleu nuit + or, tag GLB, palmarès sous le nom.
 *
 * Un joueur = une identité globale + N cartes de jeu. La carte globale est
 * DÉRIVÉE de toutes ses cartes (`buildGlobalCard`) : OVERALL = meilleure note,
 * six disciplines maximum (le surplus est compté), victoires/défaites cumulées.
 */
import { Text, View } from 'react-native';

import { buildGlobalCard, type GameCardLike } from '../lib/global-card';
import { cityAbbr } from '../lib/player-stats';

import { CARD_SKINS, CardChrome } from './card-skins';
import { Flag } from './flag';
import {
  CardCrest,
  CardFooter,
  CardPortrait,
  DivisionChip,
  useCardStyles,
} from './player-card';

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

export interface GlobalCardProps {
  username: string;
  city?: string | null;
  cards: GameCardLike[];
  /** Division globale (Elite, Challenger…) sous le drapeau. */
  division?: string | null;
  /** Photo détourée du joueur ; silhouette IA de repli sinon. */
  imageUrl?: string | null;
  /** « champion » pour le n°1 du classement global. */
  skin?: 'global' | 'champion';
}

export function GlobalCard({ skin = 'global', ...props }: GlobalCardProps) {
  return (
    <CardChrome skin={skin}>
      <GlobalCardBody skin={skin} {...props} />
    </CardChrome>
  );
}

/** Corps de carte — rendu SOUS CardChrome pour recevoir l'échelle mesurée. */
function GlobalCardBody({
  username,
  city,
  cards,
  division,
  imageUrl,
  skin = 'global',
}: GlobalCardProps) {
  const spec = CARD_SKINS[skin];
  const s = useCardStyles();
  const g = buildGlobalCard(cards);

  return (
    <>
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
        <CardPortrait imageUrl={imageUrl} />
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
                  ? [s.statLeft, { borderRightColor: spec.line }]
                  : s.statRight,
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
    </>
  );
}
