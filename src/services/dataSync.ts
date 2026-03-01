// src/services/dataSync.ts
import { Game, NewsItem } from '../models/types';
import * as espnApi from './espnApi';
import { SeasonInfo } from './espnApi';

// ✅ Use a Map to track sync status per week to prevent overlapping fetches
const syncLocks: Map<string, boolean> = new Map();
let currentSeasonInfo: SeasonInfo | null = null;
let lastGameSync: Date | null = null;
let lastNewsSync: Date | null = null;

function ensureValidDate(date: any): Date | null {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
}

function getSyncKey(week?: number, year?: number): string {
  return `${year || '2025'}-${week || 'auto'}`;
}

/**
 * Sync Games - Updated for 2025 Archive Stability
 */
export async function syncGames(
  seasonId: string,
  week?: number,
  year?: number,
  forceRefresh = false
): Promise<{
  games: Game[];
  seasonInfo: SeasonInfo;
  playoffGames: Game[];
  proBowlGames: Game[];
}> {
  const syncKey = getSyncKey(week, year);
  
  // If we are already fetching this specific week, don't start again
  if (syncLocks.get(syncKey) && !forceRefresh) {
    return {
      games: [],
      seasonInfo: currentSeasonInfo || espnApi.detectCurrentSeasonInfo(),
      playoffGames: [],
      proBowlGames: [],
    };
  }

  syncLocks.set(syncKey, true);

  try {
    // We pass the week/year directly to our fixed espnApi
    const response = await espnApi.fetchWeeklyGames(
      seasonId,
      week,
      year
    );

    const games = Array.isArray(response?.games) ? response.games : [];
    const seasonInfo = response?.seasonInfo || espnApi.detectCurrentSeasonInfo();

    currentSeasonInfo = seasonInfo;

    /**
     * LOGIC FIX:
     * If the week requested is 19-23, these ARE the playoff games.
     * We don't need to do a secondary 'fetchLastSeasonPlayoffs' call 
     * because we are already in the 2025 archive.
     */
    let playoffGames: Game[] = [];
    let proBowlGames: Game[] = [];

    if (week && week >= 19) {
      playoffGames = games; // Current results are the playoffs
    } 
    
    // Pro Bowl is usually specific to a certain week/event name
    proBowlGames = games.filter(g => g.gameName?.toLowerCase().includes('pro bowl'));

    lastGameSync = new Date();

    return {
      games,
      seasonInfo,
      playoffGames,
      proBowlGames,
    };
  } catch (error) {
    console.error('[DataSync] Games sync error:', error);
    return {
      games: [],
      seasonInfo: currentSeasonInfo || espnApi.detectCurrentSeasonInfo(),
      playoffGames: [],
      proBowlGames: [],
    };
  } finally {
    // Release the lock so the user can click other weeks
    syncLocks.set(syncKey, false);
  }
}

/**
 * Sync News
 */
let newsSyncInProgress = false;

export async function syncNews(forceRefresh = false): Promise<NewsItem[]> {
  if (newsSyncInProgress && !forceRefresh) return [];
  newsSyncInProgress = true;

  try {
    const news = await espnApi.fetchNews(15);
    lastNewsSync = new Date();
    return (news || []).map(item => ({
      ...item,
      timestamp: item.timestamp || new Date().toISOString()
    }));
  } catch (error) {
    console.error('[DataSync] News sync error:', error);
    return [];
  } finally {
    newsSyncInProgress = false;
  }
}

export async function fullSync(seasonId: string, week?: number, year?: number) {
  const [gamesResult, news] = await Promise.all([
    syncGames(seasonId, week, year, false),
    syncNews(false),
  ]);

  return {
    ...gamesResult,
    news,
  };
}

export async function forceRefreshAll(seasonId: string, week?: number, year?: number) {
  syncLocks.clear();
  const [gamesResult, news] = await Promise.all([
    syncGames(seasonId, week, year, true),
    syncNews(true),
  ]);

  return {
    ...gamesResult,
    news,
  };
}

export function getSyncStatus() {
  return {
    lastGameSync: ensureValidDate(lastGameSync),
    lastNewsSync: ensureValidDate(lastNewsSync),
    syncInProgress: Array.from(syncLocks.values()).some(v => v),
    seasonInfo: currentSeasonInfo,
  };
}