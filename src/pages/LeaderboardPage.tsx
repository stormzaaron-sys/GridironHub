// Leaderboard Page - GridironHub ESPN Theme
import { useState, useMemo } from 'react';
import { Trophy, TrendingUp, Filter, Users, Award, Zap, Target } from 'lucide-react';
import { useStore } from '../store/useStore';
import { LeaderboardRow } from '../components/LeaderboardRow';
import { cn } from '../utils/cn';

type SortBy = 'total' | 'weekly' | 'streak' | 'locks' | 'upsets';

export function LeaderboardPage() {
  const { currentUser, season, leaderboard } = useStore();
  const [sortBy, setSortBy] = useState<SortBy>('total');
  const [showFilters, setShowFilters] = useState(false);

  // Memoize sorting so it doesn't recalculate on every tiny render
  const sortedLeaderboard = useMemo(() => {
    return [...leaderboard].sort((a, b) => {
      switch (sortBy) {
        case 'weekly':
          return (b.weeklyPoints || 0) - (a.weeklyPoints || 0);
        case 'streak':
          return (b.streak || 0) - (a.streak || 0);
        case 'locks':
          return (b.lockPercentage || 0) - (a.lockPercentage || 0);
        case 'upsets':
          return (b.upsets || 0) - (a.upsets || 0);
        default:
          return (b.totalPoints || 0) - (a.totalPoints || 0);
      }
    });
  }, [leaderboard, sortBy]);

  const userEntry = leaderboard.find(e => e.userId === currentUser?.id);
  const currentWeek = season?.currentWeek ?? season?.current_week ?? 1;

  const sortOptions: { value: SortBy; label: string; icon: typeof Trophy }[] = [
    { value: 'total', label: 'Total Points', icon: Trophy },
    { value: 'weekly', label: 'This Week', icon: Target },
    { value: 'streak', label: 'Hot Streak', icon: Zap },
    { value: 'locks', label: 'Lock %', icon: Award },
    { value: 'upsets', label: 'Upsets', icon: TrendingUp },
  ];

  // Calculate some aggregate stats for the header
  const avgScore = leaderboard.length 
    ? Math.round(leaderboard.reduce((sum, e) => sum + (e.totalPoints || 0), 0) / leaderboard.length) 
    : 0;
  const bestStreak = Math.max(...leaderboard.map(e => e.streak || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#111111] flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Trophy className="text-amber-600" size={24} />
            </div>
            Standings
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {season?.year} Season • Week {currentWeek}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-2.5 rounded-lg transition-all border flex items-center gap-2 text-sm font-semibold",
            showFilters 
              ? 'bg-[#111111] text-white border-[#111111]' 
              : 'bg-white text-[#4A4A4A] border-gray-200 hover:border-gray-300'
          )}
        >
          <Filter size={18} />
          {showFilters ? 'Hide' : 'Sort'}
        </button>
      </div>

      {/* Sort Options - Now with better mobile wrapping */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-xl animate-in fade-in zoom-in-95 duration-200">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            const active = sortBy === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 min-w-[120px] justify-center",
                  active
                    ? 'bg-white text-[#111111] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#111111]'
                )}
              >
                <Icon size={16} className={active ? 'text-amber-500' : ''} />
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs text-[#6B7280] font-bold uppercase tracking-wider">Players</p>
          <p className="text-2xl font-display font-black text-[#111111]">{leaderboard.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs text-[#6B7280] font-bold uppercase tracking-wider">Top Score</p>
          <p className="text-2xl font-display font-black text-[#111111]">{leaderboard[0]?.totalPoints || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs text-[#6B7280] font-bold uppercase tracking-wider">Avg Score</p>
          <p className="text-2xl font-display font-black text-[#111111]">{avgScore}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs text-[#6B7280] font-bold uppercase tracking-wider">Best Streak</p>
          <p className="text-2xl font-display font-black text-[#111111]">{bestStreak}🔥</p>
        </div>
      </div>

      {/* Your Rank Sticker (Sticky for long lists) */}
      {userEntry && (
        <div className="bg-[#111111] text-white rounded-xl p-4 flex items-center justify-between shadow-lg border-l-4 border-amber-400 sticky top-4 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-black text-amber-400">
              #{userEntry.rank}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Your Current Rank</p>
              <p className="font-display font-bold text-lg">{userEntry.username}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white">{userEntry.totalPoints} <span className="text-xs text-gray-400">PTS</span></p>
          </div>
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="space-y-3 mt-4">
        {sortedLeaderboard.map((entry, index) => {
          const isTop3 = index < 3 && sortBy === 'total';
          const isFirst = index === 0 && sortBy === 'total';

          return (
            <div key={entry.userId} className="relative group">
              {/* Special Crown for Rank 1 */}
              {isFirst && (
                <div className="absolute -top-3 -left-2 z-10 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded shadow-sm rotate-[-10deg]">
                  KING OF THE HILL
                </div>
              )}
              
              <LeaderboardRow
                entry={entry}
                isCurrentUser={entry.userId === currentUser?.id}
                showTrend={sortBy === 'total'}
                // Pass rank based on sorted index, not fixed DB rank
                rank={index + 1} 
              />
            </div>
          );
        })}

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Trophy size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">The Season Hasn't Started</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">
              Picks aren't locked in yet. Once games go final, the leaderboard will update automatically.
            </p>
          </div>
        )}
      </div>

      {/* Footer / Tiebreaker Info */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mt-8">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-200/50 rounded-lg text-amber-700">
            <Target size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">How Ranking Works</p>
            <p className="text-xs text-amber-800/70 mt-1 leading-relaxed">
              Standings are updated in real-time. If points are tied, the winner is decided by: 
              <span className="font-bold"> Highest Lock %, then Most Weekly Wins, then current Hot Streak.</span>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}