// ESPN Game Stats Service - Fetches detailed game statistics
import axios from 'axios';
import { GameStats, TeamStats, ScoringPlay } from '../models/types';

const ESPN_SUMMARY_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary';

/**
 * Fetch detailed game statistics from ESPN Summary API
 * Only call this for finished games when user clicks to expand
 */
export async function fetchGameStats(gameId: string): Promise<GameStats | null> {
  try {
    const url = `${ESPN_SUMMARY_URL}?event=${gameId}`;
    console.log('[espnGameStats] Fetching stats for game:', gameId);
    
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!data) {
      console.warn('[espnGameStats] No data returned for game:', gameId);
      return null;
    }

    // Parse team stats from boxscore
    const teamStats: TeamStats[] = data.boxscore?.teams?.map((team: any) => ({
      teamId: team.team?.id || '',
      teamAbbrev: team.team?.abbreviation || '',
      score: team.score || 0,
      stats: parseTeamStatistics(team.statistics || []),
      leaders: parseTeamLeaders(team.leaders || [], team.team?.abbreviation || ''),
    })) || [];

    // Parse scoring plays
    const scoringPlays: ScoringPlay[] = parseScoringPlays(data.scoringPlays || data.plays || []);

    console.log('[espnGameStats] Parsed stats:', {
      gameId,
      teams: teamStats.length,
      scoringPlays: scoringPlays.length,
    });

    return {
      gameId,
      teamStats,
      scoringPlays,
    };
  } catch (err) {
    console.error('[espnGameStats] Failed to fetch stats for', gameId, err);
    return null;
  }
}

/**
 * Parse team statistics from ESPN response — FIXED FOR REAL ESPN DATA
 */
function parseTeamStatistics(statistics: any[]): { name: string; abbreviation: string; value: string }[] {
  if (!Array.isArray(statistics)) return [];
  
  return statistics.map((stat: any) => {
    // ESPN uses different fields depending on the game
    const displayValue = stat.displayValue || stat.value || '0';
    const name = stat.name || stat.label || 'unknown';
    const abbrev = stat.abbreviation || '';

    return {
      name: name,
      abbreviation: abbrev,
      value: displayValue, // This is the actual number shown on ESPN
    };
  });
}

/**
 * Parse team leaders (top performers) from ESPN response
 */
function parseTeamLeaders(leaders: any[], teamAbbrev: string): { name: string; displayName: string; stats: string; teamAbbrev: string }[] {
  if (!Array.isArray(leaders)) return [];
  
  return leaders.map((leader: any) => {
    // Get the top athlete in this category
    const topAthlete = leader.leaders?.[0];
    
    return {
      name: leader.name || leader.displayName || 'Unknown',
      displayName: topAthlete?.athlete?.displayName || topAthlete?.athlete?.shortName || 'Unknown',
      stats: topAthlete?.displayValue || '',
      teamAbbrev,
    };
  }).filter(l => l.displayName !== 'Unknown');
}

/**
 * Parse scoring plays from ESPN response
 */
function parseScoringPlays(plays: any[]): ScoringPlay[] {
  if (!Array.isArray(plays)) return [];
  
  return plays
    .filter((play: any) => {
      // Filter to only scoring plays
      return play.scoringPlay || play.type?.text?.toLowerCase().includes('touchdown') || 
             play.type?.text?.toLowerCase().includes('field goal') ||
             play.type?.text?.toLowerCase().includes('safety');
    })
    .map((play: any) => ({
      quarter: play.period?.number || play.period?.value || 0,
      clock: play.clock?.displayValue || play.clock || '',
      description: play.text || play.description || play.shortText || '',
      awayScore: play.awayScore,
      homeScore: play.homeScore,
    }))
    .slice(0, 20); // Limit to 20 scoring plays max
}

/**
 * Format stat name for display
 */
export function formatStatName(name: string): string {
  // Convert camelCase or snake_case to Title Case
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Get icon/emoji for stat category
 */
export function getStatIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('pass')) return '🏈';
  if (lower.includes('rush')) return '🏃';
  if (lower.includes('receiv')) return '🙌';
  if (lower.includes('yard')) return '📏';
  if (lower.includes('touchdown') || lower.includes('td')) return '🎯';
  if (lower.includes('intercept')) return '🛡️';
  if (lower.includes('sack')) return '💥';
  if (lower.includes('fumble')) return '⚠️';
  if (lower.includes('penalty')) return '🚩';
  if (lower.includes('possession')) return '⏱️';
  if (lower.includes('first down')) return '1️⃣';
  return '📊';
}
