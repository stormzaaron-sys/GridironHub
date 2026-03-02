// src/store/useStore.ts
import { create } from 'zustand';
import {
  User,
  Season,
  Game,
  Pick,
  LeaderboardEntry,
  NewsItem,
  Badge,
  GameStats
} from '../models/types';
import * as dataSync from '../services/dataSync';
import { SeasonInfo, detectCurrentSeasonInfo } from '../services/espnApi';
import { supabase } from '../services/supabase';

interface NFLHubState {
  currentUser: User | null;
  isAuthenticated: boolean;
  authChecked: boolean;

  season: Season | null;
  games: Game[];
  playoffGames: Game[];
  proBowlGames: Game[];
  picks: Pick[];
  leaderboard: LeaderboardEntry[];
  news: NewsItem[];
  userBadges: Badge[];
  gameStats: { [gameId: string]: GameStats | undefined };
  seasonInfo: SeasonInfo | null;

  isLoading: boolean;
  dataLoaded: boolean;
  error: string | null;
  lastSync: Date | null;
  isPolling: boolean;
  pollingInterval: ReturnType<typeof setInterval> | null;

  // Auth Actions
  login: (inviteCode: string, username?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;

  // Data Actions
  loadData: () => Promise<void>;
  loadWeek: (week: number, year?: number) => Promise<void>;
  refreshGames: (forceRefresh?: boolean, week?: number, year?: number) => Promise<void>;
  refreshNews: (forceRefresh?: boolean) => Promise<void>;

  // Picks & Social
  loadPicks: () => Promise<void>;
  makePick: (gameId: string, team: string, isLock: boolean) => Promise<void>;
  recalculateLeaderboard: () => Promise<void>;

  // Live Updates
  startPolling: () => void;
  stopPolling: () => void;
}

export const useStore = create<NFLHubState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  authChecked: false,

  season: null,
  games: [],
  playoffGames: [],
  proBowlGames: [],
  picks: [],
  leaderboard: [],
  news: [],
  userBadges: [],
  gameStats: {},
  seasonInfo: null,

  isLoading: false,
  dataLoaded: false,
  error: null,
  lastSync: null,
  isPolling: false,
  pollingInterval: null,

  // ================= AUTH =================

  login: async (inviteCode: string, username?: string) => {
    const code = inviteCode.toUpperCase().trim();
    set({ error: null });
    
    const { data: tokenRow, error: tokenError } = await supabase
      .from('invite_tokens')
      .select('*')
      .eq('token', code)
      .single();

    if (tokenError || !tokenRow) { 
      set({ error: 'Invalid invite code' }); 
      return false; 
    }

    let profile;

    if (tokenRow.claimed && tokenRow.claimed_by) {
      if (!username || username.trim().length < 2) {
        set({ error: 'This code is already claimed. Enter your username to link this device.' });
        return false;
      }

      const { data: existingProfile, error: matchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', tokenRow.claimed_by)
        .eq('username', username.trim())
        .single();

      if (matchError || !existingProfile) {
        set({ error: 'Incorrect username for this invite code.' });
        return false;
      }

      profile = existingProfile;
    } else {
      if (!username || username.trim().length < 2) { 
        set({ error: 'Please choose a username (2-20 characters)' }); 
        return false; 
      }

      const { data: nameCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim())
        .single();

      if (nameCheck) {
        set({ error: 'That username is already taken. Try another!' });
        return false;
      }

      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({ 
          username: username.trim(), 
          token_id: tokenRow.id, 
          is_admin: tokenRow.is_admin,
          favorite_team: 'NFL' 
        })
        .select()
        .single();

      if (profileError) {
        set({ error: 'System error creating profile' });
        return false;
      }

      profile = newProfile;

      await supabase
        .from('invite_tokens')
        .update({ claimed: true, claimed_by: profile.id })
        .eq('id', tokenRow.id);
    }

    const sessionToken = crypto.randomUUID();
    await supabase.from('sessions').insert({ 
      user_id: profile.id, 
      session_token: sessionToken 
    });
    
    localStorage.setItem('nfl_session', sessionToken);

    set({
      currentUser: { 
        id: profile.id, 
        username: profile.username, 
        role: profile.is_admin ? 'admin' : 'user', 
        inviteCode: code, 
        joinDate: profile.created_at, 
        avatarColor: '#f97316', 
        sessionToken,
        favoriteTeam: profile.favorite_team || 'NFL'
      },
      isAuthenticated: true,
      dataLoaded: false,
      error: null
    });

    await get().loadData();
    return true;
  },

  logout: async () => {
    const state = get();
    if (state.pollingInterval) clearInterval(state.pollingInterval);
    const token = localStorage.getItem('nfl_session');
    if (token) await supabase.from('sessions').delete().eq('session_token', token);
    localStorage.removeItem('nfl_session');
    set({ currentUser: null, isAuthenticated: false, picks: [], leaderboard: [], dataLoaded: false, isPolling: false, pollingInterval: null });
  },

  restoreSession: async () => {
    const token = localStorage.getItem('nfl_session');
    if (!token) { set({ authChecked: true }); return; }
    const { data: session } = await supabase.from('sessions').select('*').eq('session_token', token).single();
    if (!session) { localStorage.removeItem('nfl_session'); set({ authChecked: true }); return; }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user_id).single();
    if (!profile) { localStorage.removeItem('nfl_session'); set({ authChecked: true }); return; }

    set({
      currentUser: { 
        id: profile.id, 
        username: profile.username, 
        role: profile.is_admin ? 'admin' : 'user', 
        inviteCode: '', 
        joinDate: profile.created_at, 
        avatarColor: '#f97316', 
        sessionToken: token,
        favoriteTeam: profile.favorite_team || 'NFL'
      },
      isAuthenticated: true,
      authChecked: true,
    });
    await get().loadData();
  },

  updateProfile: (updates) => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
    }));
    get().recalculateLeaderboard();
  },

  // ================= DATA =================

  loadData: async () => {
    const state = get();
    if (state.isLoading) return;

    try {
      set({ isLoading: true, error: null });
      const { data: season } = await supabase.from('seasons').select('*').eq('is_active', true).single();

      if (!season) {
        set({ isLoading: false, error: 'No active season found' });
        return;
      }

      const detectedSeasonInfo = detectCurrentSeasonInfo();
      const result = await dataSync.fullSync(season.id, detectedSeasonInfo.week, detectedSeasonInfo.year);

      const normalizedSeason = {
        ...season,
        year: detectedSeasonInfo.year,
        current_week: detectedSeasonInfo.week,
        currentWeek: detectedSeasonInfo.week,
      };

      set({
        season: normalizedSeason,
        games: result.games || [],
        playoffGames: result.playoffGames || [],
        proBowlGames: result.proBowlGames || [],
        news: result.news || [],
        seasonInfo: result.seasonInfo,
        lastSync: new Date(),
        isLoading: false,
        dataLoaded: true,
      });

      await get().loadPicks();
      await get().recalculateLeaderboard();
    } catch (error) {
      console.error('loadData error:', error);
      set({ isLoading: false, error: 'Failed to load data' });
    }
  },

  loadWeek: async (week: number, year?: number) => {
    const state = get();
    if (state.isLoading || !state.season) return;

    try {
      set({ isLoading: true });
      const targetYear = year ?? state.season.year;
      const gamesResult = await dataSync.syncGames(state.season.id, week, targetYear, false);

      set({
        season: { ...state.season, currentWeek: week, current_week: week, year: targetYear },
        games: gamesResult.games || [],
        playoffGames: gamesResult.playoffGames || [],
        seasonInfo: { ...gamesResult.seasonInfo, week, year: targetYear },
        isLoading: false,
      });

      await get().loadPicks();
    } catch (error) {
      console.error('loadWeek error:', error);
      set({ isLoading: false });
    }
  },

  refreshGames: async (forceRefresh = false, reqWeek?: number, reqYear?: number) => {
    const state = get();
    if (!state.season || state.isLoading) return;

    const targetWeek = reqWeek ?? (state.season.currentWeek ?? state.season.current_week);
    const targetYear = reqYear ?? state.season.year;

    try {
      set({ isLoading: true });
      const gamesResult = await dataSync.syncGames(state.season.id, targetWeek, targetYear, forceRefresh);
      
      set({
        games: gamesResult.games || [],
        playoffGames: gamesResult.playoffGames || [],
        seasonInfo: gamesResult.seasonInfo,
        lastSync: new Date(),
        isLoading: false,
      });
    } catch (error) {
      console.error('refreshGames error:', error);
      set({ isLoading: false });
    }
  },

  refreshNews: async (forceRefresh = false) => {
    try {
      const news = await dataSync.syncNews(forceRefresh);
      if (news.length > 0) set({ news });
    } catch (error) {
      console.error('News Error:', error);
    }
  },

  // ================= PICKS & SOCIAL =================

  loadPicks: async () => {
    const user = get().currentUser;
    if (!user) return;
    const { data } = await supabase.from('picks').select('*').eq('user_id', user.id);
    const normalizedPicks = (data || []).map(pick => ({
      ...pick,
      gameId: pick.game_id,
      isLock: pick.is_lock,
      selectedTeam: pick.selected_team,
    }));
    set({ picks: normalizedPicks });
  },

  makePick: async (gameId, team, isLock) => {
    const { currentUser, picks, games } = get();
    if (!currentUser) return;

    const previousPicks = [...picks];
    let updatedPicks = [...picks];

    if (isLock) {
      const targetGame = games.find(g => g.gameId === gameId);
      const targetWeek = targetGame?.week;
      updatedPicks = updatedPicks.map(p => {
        const pGame = games.find(g => g.gameId === p.gameId);
        if (pGame && pGame.week === targetWeek) {
          return { ...p, isLock: false, is_lock: false };
        }
        return p;
      });
    }

    const newPick = { 
      game_id: gameId, 
      gameId, 
      user_id: currentUser.id, 
      selected_team: team, 
      selectedTeam: team, 
      is_lock: isLock, 
      isLock, 
      points_awarded: 0 
    };

    set({ picks: updatedPicks.filter(p => p.gameId !== gameId).concat(newPick) });

    try {
      if (isLock) {
        const weekGameIds = games.map(g => g.gameId);
        await supabase.from('picks').update({ is_lock: false }).eq('user_id', currentUser.id).in('game_id', weekGameIds);
      }
      const { error } = await supabase.from('picks').upsert({ 
        user_id: currentUser.id, 
        game_id: gameId, 
        selected_team: team, 
        is_lock: isLock, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'user_id, game_id' });
      
      if (error) throw error;
      await get().loadPicks();
      await get().recalculateLeaderboard();
    } catch (err) {
      set({ picks: previousPicks, error: 'Failed to sync pick' });
    }
  },

  recalculateLeaderboard: async () => {
    const { data: picks } = await supabase.from('picks').select('user_id, points_awarded, is_lock');
    const { data: profiles } = await supabase.from('profiles').select('id, username, favorite_team, avatar_color');
    const stats: Record<string, { pts: number; locks: number; correctLocks: number }> = {};
    
    picks?.forEach(p => {
      if (!stats[p.user_id]) stats[p.user_id] = { pts: 0, locks: 0, correctLocks: 0 };
      stats[p.user_id].pts += (p.points_awarded || 0);
      if (p.is_lock) {
        stats[p.user_id].locks++;
        if (p.points_awarded > 1) stats[p.user_id].correctLocks++;
      }
    });

    const leaderboard: LeaderboardEntry[] = (profiles || []).map(profile => {
      const s = stats[profile.id] || { pts: 0, locks: 0, correctLocks: 0 };
      return { 
        userId: profile.id, 
        username: profile.username, 
        avatarColor: profile.avatar_color || '#f97316',
        totalPoints: s.pts, 
        weeklyPoints: 0,
        rank: 0, 
        lockPercentage: s.locks > 0 ? Math.round((s.correctLocks / s.locks) * 100) : 0, 
        streak: 0,
        favoriteTeam: profile.favorite_team || 'NFL',
        upsets: 0
      };
    });

    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints).forEach((e, i) => e.rank = i + 1);
    set({ leaderboard });
  },

  startPolling: () => {
    const state = get();
    if (state.isPolling) return;
    const interval = setInterval(() => {
      const s = get();
      if (s.games.some(g => g.status === 'in_progress')) s.refreshGames(false);
    }, 30000);
    set({ isPolling: true, pollingInterval: interval });
  },

  stopPolling: () => {
    const state = get();
    if (state.pollingInterval) clearInterval(state.pollingInterval);
    set({ isPolling: false, pollingInterval: null });
  },
}));