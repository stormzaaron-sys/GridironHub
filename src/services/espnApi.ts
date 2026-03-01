// src/services/espnApi.ts
import { Game, NewsItem } from '../models/types';

const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
const ESPN_SCOREBOARD = `${ESPN_BASE_URL}/scoreboard`;
const ESPN_NEWS = `${ESPN_BASE_URL}/news`;

export enum SeasonType { PRESEASON = 1, REGULAR = 2, POSTSEASON = 3 }

export interface SeasonInfo {
  seasonType: SeasonType; 
  week: number; 
  year: number;
  isOffseason: boolean; 
  showingLastSeason: boolean;
  bannerMessage?: string; 
  currentSeasonWeek: number;
}

/**
 * FIXED Dynamic Season Detection
 * Corrects the 'Week 5' bug by defaulting to 23 (Super Bowl) during the 2026 offseason.
 */
export function detectCurrentSeasonInfo(): SeasonInfo {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; 
  const currentYear = today.getFullYear();

  /**
   * OFFSEASON LOGIC (March - July 2026)
   * We treat this period as the 'Archive' for the 2025 Season.
   */
  const isOffseason = (currentYear === 2026 && currentMonth >= 3 && currentMonth <= 7);

  return {
    // During offseason, we default to the Postseason (Super Bowl)
    seasonType: isOffseason ? SeasonType.POSTSEASON : SeasonType.REGULAR,
    // BUG FIX: Changed from 5 to 23. 
    // 23 represents the Super Bowl in our internal mapping (18 + 5).
    week: isOffseason ? 23 : 1, 
    year: 2025, 
    isOffseason: isOffseason,
    showingLastSeason: isOffseason,
    bannerMessage: isOffseason ? `2025 Season Archive Active` : undefined,
    currentSeasonWeek: isOffseason ? 23 : 1
  };
}

export function getSeasonTypeName(type: SeasonType): string {
  if (type === SeasonType.PRESEASON) return 'Preseason';
  if (type === SeasonType.POSTSEASON) return 'Postseason';
  return 'Regular Season';
}

/**
 * Normalizes game data from ESPN API
 */
function normalizeGame(e: any, sId: string): Game {
  const c = e.competitions[0];
  const h = c.competitors.find((t: any) => t.homeAway === 'home');
  const a = c.competitors.find((t: any) => t.homeAway === 'away');
  
  return {
    id: e.id,
    gameId: e.id, 
    seasonId: sId, 
    week: e.week?.number || 1,
    kickoffTime: e.date,
    status: e.status.type.state === 'post' ? 'final' : e.status.type.state === 'in' ? 'in_progress' : 'scheduled',
    homeTeam: { 
      id: h.team.id, 
      name: h.team.displayName, 
      abbreviation: h.team.abbreviation || 'NFL', 
      logo: h.team.logo, 
      record: h.records?.[0]?.summary 
    },
    awayTeam: { 
      id: a.team.id, 
      name: a.team.displayName, 
      abbreviation: a.team.abbreviation || 'NFL', 
      logo: a.team.logo, 
      record: a.records?.[0]?.summary 
    },
    homeScore: parseInt(h.score) || 0, 
    awayScore: parseInt(a.score) || 0,
    winner: h.winner ? h.team.abbreviation : a.winner ? a.team.abbreviation : undefined,
    isPlayoff: e.season.type === 3, 
    gameName: e.name
  };
}

/**
 * Core Fetch Logic with Internal Mapping
 * Handles mapping our custom week range (1-23) to ESPN's seasontype/week params.
 */
export async function fetchWeeklyGames(seasonId: string, reqWeek?: number, reqYear?: number) {
  const info = detectCurrentSeasonInfo();
  
  // Use requested week, or default to the detected 'current' week (23 in offseason)
  const week = reqWeek ?? info.week; 
  const year = reqYear ?? info.year;
  
  let apiType: number;
  let apiWeek: number;

  /**
   * INTERNAL MAPPING LOGIC:
   * Weeks 1-18  -> Regular Season (Type 2)
   * Weeks 19-23 -> Postseason (Type 3), Weeks 1-5
   */
  if (week <= 18) {
    apiType = 2; 
    apiWeek = week;
  } else {
    apiType = 3; 
    apiWeek = week - 18; // e.g., 23 - 18 = 5 (Super Bowl)
  }

  const url = `${ESPN_SCOREBOARD}?seasontype=${apiType}&week=${apiWeek}&year=${year}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    
    const games = (data.events || []).map((e: any) => normalizeGame(e, seasonId));
    
    return { 
      games: games, 
      seasonInfo: { ...info, week: week, year: year, seasonType: apiType } 
    };
  } catch (e) { 
    console.error("[ESPN API] Fetch Error:", e);
    return { games: [], seasonInfo: info }; 
  }
}

/**
 * Normalizes news items for the UI
 */
function normalizeNewsItem(art: any, index: number): NewsItem {
  let safeDate = new Date().toISOString();
  if (art.published) {
    const parsed = new Date(art.published);
    if (!isNaN(parsed.getTime())) {
      safeDate = parsed.toISOString();
    }
  }

  return {
    id: art.id || `news-${index}-${Date.now()}`,
    title: art.headline || 'NFL Update',
    description: art.description?.replace(/<[^>]*>/g, '').trim() || '',
    timestamp: safeDate,
    url: art.links?.web?.href || '',
    imageUrl: art.images?.[0]?.url || art.video?.[0]?.thumbnail || '',
    source: 'ESPN',
    type: art.type === 'video' || art.video?.length > 0 ? 'video' : 'article',
    category: art.categories?.[0]?.description || 'NFL'
  };
}

export async function fetchNews(limit = 25): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${ESPN_NEWS}?limit=${limit}`);
    const data = await res.json();
    return (data.articles || []).map((a: any, i: number) => normalizeNewsItem(a, i));
  } catch (err) {
    console.error("News fetch failed", err);
    return [];
  }
}

export const fetchGames = async (sId: string, w?: number, y?: number) => (await fetchWeeklyGames(sId, w, y)).games;