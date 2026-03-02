// src/pages/LeaderboardPage.tsx
import { useState, useMemo } from 'react';
import { Trophy, TrendingUp, Filter, Award, Zap, Target } from 'lucide-react';
import { useStore } from '../store/useStore';
import { LeaderboardRow } from '../components/LeaderboardRow';
import { getTeamLogo } from '../utils/nflTeams'; // ✅ Import helmet utility
import { cn } from '../utils/cn';

type SortBy = 'total' | 'weekly' | 'streak' | 'locks' | 'upsets';

export function LeaderboardPage() {
  const { currentUser, season, leaderboard, isLoading } = useStore();
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
          // If total points are equal, sort alphabetically so the roster is stable
          if ((b.totalPoints || 0) === (a.totalPoints || 0)) {
            return a.username.localeCompare(b.username);
          }
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
          <p className="text-sm text-[#6B7280] mt-1 font-bold uppercase tracking-widest">
            {season?.year || '2026'} Season • Week {currentWeek}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-2.5 rounded-lg transition-all border flex items-center gap-2 text-sm font-bold uppercase",
            showFilters 
              ? 'bg-[#111111] text-white border-[#111111]' 
              : 'bg-white text-[#4A4A4A] border-gray-200 hover:border-gray-300'
          )}
        >
          <Filter size={18} />
          {showFilters ? 'Hide' : 'Sort'}
        </button>
      </div>

      {/* Sort Options */}
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
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black uppercase italic transition-all flex-1 min-w-[120px] justify-center",
                  active
                    ? 'bg-white text-[#111111] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#111111]'
                )}
              >
                <Icon size={16} className={active ? 'text-[#CC0000]' : ''} />
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Players', val: leaderboard.length },
          { label: 'Top Score', val: leaderboard[0]?.totalPoints || 0 },
          { label: 'Avg Score', val: avgScore },
          { label: 'Best Streak', val: `${bestStreak}🔥` }
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-4 border-b-4 border-gray-100 shadow-sm">
            <p className="text-[10px] text-[#6B7280] font-black uppercase tracking-widest leading-none mb-2">{card.label}</p>
            <p className="text-2xl font-display font-black text-[#111111] italic">{card.val}</p>
          </div>
        ))}
      </div>

      {/* ✅ Sticky Rank Sticker - Only show if user is in the leaderboard and data isn't loading */}
      {userEntry && !isLoading && (
        <div className="bg-[#111111] text-white rounded-xl p-4 flex items-center justify-between shadow-xl border-l-4 border-[#CC0000] sticky top-4 z-20 transform translate-z-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <img 
                  src={getTeamLogo(userEntry.favoriteTeam || 'NFL')} 
                  className="w-10 h-10 object-contain" 
                  alt="My Team" 
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#CC0000] text-[10px] font-black px-1.5 rounded-full border-2 border-[#111111]">
                #{userEntry.rank || leaderboard.indexOf(userEntry) + 1}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Your Current Rank</p>
              <p className="font-display font-bold text-lg italic uppercase">{userEntry.username}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white italic leading-none">{userEntry.totalPoints || 0}</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">TOTAL PTS</p>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-1 mt-4">
        {sortedLeaderboard.map((entry, index) => {
          const isFirst = index === 0 && sortBy === 'total' && entry.totalPoints > 0;
          return (
            <div key={entry.userId} className="relative group">
              {isFirst && (
                <div className="absolute -top-3 -left-2 z-10 bg-[#CC0000] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-md rotate-[-5deg] uppercase italic tracking-tighter">
                  King of the Hill
                </div>
              )}
              <LeaderboardRow
                entry={entry}
                isCurrentUser={entry.userId === currentUser?.id}
                showTrend={sortBy === 'total'}
                rank={index + 1} 
              />
            </div>
          );
        })}

        {/* Empty State - Only show if literally NO profiles exist */}
        {leaderboard.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Trophy size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 uppercase">Roster is Empty</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm font-medium">
              Waiting for players to join the league! Once profiles are created, they will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Footer / Rules */}
      <div className="bg-[#111111] rounded-xl p-5 border-t-4 border-[#CC0000] shadow-lg mt-8 text-white">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#CC0000] rounded-lg">
            <Target size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black uppercase italic tracking-widest">How Ranking Works</p>
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed font-bold uppercase tracking-tight">
              Standings are updated in real-time. If points are tied, the winner is decided by: 
              <span className="text-white ml-1">Highest Lock %, then Most Weekly Wins, then current Hot Streak.</span>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}