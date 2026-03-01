// Clean Scoring Engine (Pure Functions Only)
import { Pick, Game, DEFAULT_SCORING, ScoringConfig } from '../models/types';

/**
 * Calculate points for a single pick
 */
export function calculatePickPoints(
  pick: Pick,
  game: Game,
  config: ScoringConfig = DEFAULT_SCORING
): {
  points: number;
  isCorrect: boolean;
  isUpset: boolean;
} {
  if (game.status !== 'final' || !game.winner) {
    return { points: 0, isCorrect: false, isUpset: false };
  }

  const isCorrect = pick.pickedTeam === game.winner;

  if (!isCorrect) {
    return { points: 0, isCorrect: false, isUpset: false };
  }

  const pickedTeam =
    pick.pickedTeam === game.homeTeam.abbreviation
      ? game.homeTeam
      : game.awayTeam;

  const isUpset = (pickedTeam.spread || 0) > 0;

  let points = config.correctPick;

  if (pick.isLock) {
    points += config.lockBonus;
  }

  if (isUpset) {
    points += config.upsetBonus;
  }

  if (game.isPlayoff && game.playoffRound) {
    points *= config.playoffMultipliers[game.playoffRound] || 1;
  }

  return { points, isCorrect, isUpset };
}

/**
 * Evaluate all picks for a finished game
 * Returns updated pick objects (does NOT persist them)
 */
export function evaluateGamePicks(
  picks: Pick[],
  game: Game,
  config: ScoringConfig = DEFAULT_SCORING
): Pick[] {
  if (game.status !== 'final') return [];

  return picks.map(pick => {
    const { points, isCorrect, isUpset } =
      calculatePickPoints(pick, game, config);

    return {
      ...pick,
      pointsAwarded: points,
      evaluated: true,
      isCorrect,
      isUpset,
    };
  });
}

/**
 * Calculate participation percentage
 * totalFinishedGames = number of games that are final
 */
export function calculateParticipation(
  picks: Pick[],
  totalFinishedGames: number
): number {
  if (totalFinishedGames === 0) return 0;

  const finishedPicks = picks.filter(p => p.evaluated);
  return Math.round((finishedPicks.length / totalFinishedGames) * 100);
}

/**
 * Check playoff eligibility (60% participation required)
 */
export function isPlayoffEligible(
  picks: Pick[],
  totalFinishedGames: number
): boolean {
  return calculateParticipation(picks, totalFinishedGames) >= 60;
}