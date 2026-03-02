// src/models/types.ts
// Core Data Models for NFL Hub

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  inviteCode: string;
  joinDate: string;
  avatarColor: string;
  sessionToken?: string;
  favoriteTeam?: string; // ✅ Added for team helmet support
}

export interface Season {
  id: string;
  year: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  currentWeek: number;
  isPlayoffs: boolean;
  current_week?: number; // Support for snake_case from DB
}

export interface Game {
  gameId: string;
  seasonId: string;
  week: number;
  homeTeam: Team;
  awayTeam: Team;
  kickoffTime: string;
  status: 'scheduled' | 'in_progress' | 'final';
  homeScore?: number;
  awayScore?: number;
  winner?: string;
  isPlayoff: boolean;
  playoffRound?: 'wild_card' | 'divisional' | 'conference' | 'super_bowl';
  isProBowl?: boolean;  // Pro Bowl exhibition game - not part of playoffs
  gameName?: string;    // Original game name from ESPN (e.g., "Pro Bowl Games")
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  logo?: string;
  record?: string;
  spread?: number;
}

export interface Pick {
  id: string;
  oddsDisplay?: string;
  userId: string;
  gameId: string;
  pickedTeam: string;
  selectedTeam?: string; // Support for store mapping
  isLock: boolean;
  pointsAwarded: number;
  evaluated: boolean;
  createdAt: string;
  isCorrect?: boolean;
  isUpset?: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarColor: string;
  seasonId?: string;
  totalPoints: number;
  weeklyPoints: number;
  rank: number;
  previousRank?: number;
  streak: number;
  lockPercentage: number;
  upsets: number;
  gamesPlayed?: number;
  correctPicks?: number;
  weeklyHistory?: number[];
  favoriteTeam?: string; // ✅ Added for helmet display in Standings
}

export interface LeaderboardSnapshot {
  id: string;
  seasonId: string;
  snapshotDate: string;
  week: number;
  entries: LeaderboardEntry[];
}

export interface AdminAdjustment {
  id: string;
  userId: string;
  seasonId: string;
  pointsDelta: number;
  reason: string;
  createdAt: string;
  adminId: string;
}

export interface Badge {
  id: string;
  userId: string;
  seasonId: string;
  badgeType: BadgeType;
  description: string;
  awardedAt: string;
}

export type BadgeType = 
  | 'champion'
  | 'playoff_contender'
  | 'upset_hunter'
  | 'lock_master'
  | 'perfect_week'
  | 'hot_streak'
  | 'comeback_kid'
  | 'iron_man';

export interface NewsItem {
  id: string;
  title: string;
  description?: string;
  content?: string;           // Full article HTML content
  source: string;
  timestamp: string;
  url: string;
  imageUrl?: string;
  videoUrl?: string;          // Video URL for video content
  type?: 'article' | 'video' | 'headline';
  category?: string;          // e.g., "NFL", "Fantasy", "Draft"
  author?: string;
}

export interface CareerStats {
  userId: string;
  totalCareerPoints: number;
  totalCareerLocks: number;
  championships: number;
  averageFinish: number;
  seasonsPlayed: number;
  bestFinish: number;
  worstFinish: number;
  improvementTrend: number;
  badges: Badge[];
}

export interface WeeklyRecap {
  week: number;
  topScorer: { username: string; points: number };
  biggestUpset: { game: string; pickedBy: string[] };
  perfectWeeks: string[];
  lockOfWeek: { username: string; game: string; result: 'won' | 'lost' };
}

// Game Statistics from ESPN Summary API
export interface TeamStat {
  name: string;
  abbreviation: string;
  value: string;
}

export interface TeamLeader {
  name: string;
  displayName: string;
  stats: string;
  teamAbbrev: string;
}

export interface TeamStats {
  teamId: string;
  teamAbbrev: string;
  score: number;
  stats: TeamStat[];
  leaders: TeamLeader[];
}

export interface ScoringPlay {
  quarter: number;
  clock: string;
  description: string;
  awayScore?: number;
  homeScore?: number;
}

export interface GameStats {
  gameId: string;
  teamStats: TeamStats[];
  scoringPlays: ScoringPlay[];
}

// Scoring configuration
export interface ScoringConfig {
  correctPick: number;
  lockBonus: number;
  upsetBonus: number;
  perfectWeekBonus: number;
  playoffMultipliers: {
    wild_card: number;
    divisional: number;
    conference: number;
    super_bowl: number;
  };
}

export const DEFAULT_SCORING: ScoringConfig = {
  correctPick: 1,
  lockBonus: 1,
  upsetBonus: 1,
  perfectWeekBonus: 3,
  playoffMultipliers: {
    wild_card: 1,
    divisional: 2,
    conference: 3,
    super_bowl: 5,
  },
};

// Valid invite codes for 12 friends
export const VALID_INVITE_CODES = [
  'GRIDIRON01', 'GRIDIRON02', 'GRIDIRON03', 'GRIDIRON04',
  'GRIDIRON05', 'GRIDIRON06', 'GRIDIRON07', 'GRIDIRON08',
  'GRIDIRON09', 'GRIDIRON10', 'GRIDIRON11', 'GRIDIRON12',
];

export const AVATAR_COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500',
];