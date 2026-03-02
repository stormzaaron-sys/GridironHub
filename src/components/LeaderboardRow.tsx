import { TrendingUp, TrendingDown, Flame, Trophy, Lock } from 'lucide-react';
import { LeaderboardEntry } from '../models/types';
import { cn } from '../utils/cn';
import { getTeamLogo } from '../utils/nflTeams';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  showTrend?: boolean;
  rank?: number; 
}

export function LeaderboardRow({ entry, isCurrentUser, showTrend = true, rank: dynamicRank }: LeaderboardRowProps) {
  const rank = dynamicRank ?? entry.rank ?? 0;
  const previousRank = entry.previousRank ?? rank;
  const rankChange = previousRank - rank;

  const streak = entry.streak ?? 0;
  const lockPercentage = entry.lockPercentage ?? 0;

  const rankStyles = (() => {
    if (rank === 1) return { bg: 'bg-gradient-to-br from-amber-300 to-yellow-500', text: '!text-amber-950', border: 'border-amber-400' };
    if (rank === 2) return { bg: 'bg-gradient-to-br from-slate-200 to-slate-400', text: '!text-slate-900', border: 'border-slate-300' };
    if (rank === 3) return { bg: 'bg-gradient-to-br from-orange-300 to-orange-500', text: '!text-orange-950', border: 'border-orange-400' };
    return { bg: 'bg-gray-100', text: '!text-[#4A4A4A]', border: 'border-gray-200' };
  })();

  return (
    <div className={cn(
        'flex items-center gap-3 p-3 sm:p-4 transition-all duration-300 group bg-white border-b border-gray-100',
        isCurrentUser ? 'border-l-4 border-l-[#CC0000] bg-red-50/30' : 'hover:bg-gray-50'
      )}>
      
      {/* Rank Badge */}
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-sm border shadow-inner shrink-0',
        rankStyles.bg, rankStyles.text, rankStyles.border
      )}>
        {rank === 1 ? <Trophy size={20} strokeWidth={3} /> : <span className="text-base italic">{rank}</span>}
      </div>

      {/* --- NFL HELMET AVATAR --- */}
      <div className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-md overflow-hidden bg-gray-50 transition-all group-hover:shadow-lg',
        isCurrentUser && 'ring-2 ring-[#CC0000]/20'
      )}>
        <img 
          src={getTeamLogo(entry.favoriteTeam || 'NFL')} 
          alt={`${entry.username}'s Team`}
          className="w-10 h-10 object-contain transform group-hover:scale-110 transition-transform duration-300"
          onError={(e) => { e.currentTarget.src = getTeamLogo('NFL'); }}
        />
      </div>

      {/* User Info - Flex-1 allows this section to grow, overflow-hidden prevents blowout */}
      <div className="flex-1 min-w-0 ml-1 overflow-hidden">
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <p className={cn(
            'font-bold text-base tracking-tight uppercase italic font-display whitespace-nowrap',
            isCurrentUser ? '!text-[#CC0000]' : '!text-[#111111]'
          )}>
            {entry.username}
          </p>
          
          {streak >= 3 && (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[10px] font-black uppercase tracking-tighter animate-pulse shrink-0">
              <Flame size={12} className="fill-orange-500 stroke-orange-600" />
              {streak} STREAK
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#6B7280] mt-0.5 font-bold uppercase tracking-tight">
          <span className="flex items-center gap-1">
            <Lock size={12} className={lockPercentage > 50 ? "text-amber-500" : ""} />
            {lockPercentage}% LOCKS
          </span>
        </div>
      </div>

      {/* Trend Indicator */}
      {showTrend && rankChange !== 0 && (
        <div className={cn(
          'flex items-center gap-0.5 text-[10px] font-black px-2 py-1 rounded-lg shrink-0 hidden xs:flex', 
          rankChange > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
        )}>
          {rankChange > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(rankChange)}
        </div>
      )}

      {/* Points Display */}
      <div className="text-right min-w-[65px] sm:min-w-[75px] border-l border-gray-100 pl-4 shrink-0">
        <p className="font-display font-black text-xl sm:text-2xl !text-[#111111] leading-none italic group-hover:scale-110 transition-transform duration-300">
          {entry.totalPoints ?? 0}
        </p>
        <p className="text-[10px] !text-[#9CA3AF] font-black uppercase tracking-widest mt-1">PTS</p>
      </div>
    </div>
  );
}