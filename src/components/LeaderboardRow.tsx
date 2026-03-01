// LeaderboardRow Component - GridironHub ESPN Theme
import { TrendingUp, TrendingDown, Flame, Trophy, Lock } from 'lucide-react';
import { LeaderboardEntry } from '../models/types';
import { cn } from '../utils/cn';

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
  const weeklyHistory = entry.weeklyHistory ?? [];

  // Rank badge styles - Forced High Contrast Text
  const getRankStyles = () => {
    if (rank === 1) return {
      bg: 'bg-gradient-to-br from-amber-300 to-yellow-500',
      text: '!text-amber-950', // Forced dark for gold
      border: 'border-amber-400'
    };
    if (rank === 2) return {
      bg: 'bg-gradient-to-br from-slate-200 to-slate-400',
      text: '!text-slate-900', // Forced dark for silver
      border: 'border-slate-300'
    };
    if (rank === 3) return {
      bg: 'bg-gradient-to-br from-orange-300 to-orange-500',
      text: '!text-orange-950', // Forced dark for bronze
      border: 'border-orange-400'
    };
    return {
      bg: 'bg-gray-100',
      text: '!text-[#4A4A4A]',
      border: 'border-gray-200'
    };
  };

  const rankStyles = getRankStyles();

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 sm:p-4 transition-all duration-300 group',
        'bg-white border-b border-gray-100', // Changed to border-b for a cleaner list look
        isCurrentUser
          ? 'border-l-4 border-l-[#CC0000] bg-red-50/30'
          : 'hover:bg-gray-50'
      )}
    >
      {/* Rank Badge */}
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-sm border shadow-inner shrink-0',
        rankStyles.bg,
        rankStyles.text,
        rankStyles.border
      )}>
        {rank === 1 ? (
          <Trophy size={20} strokeWidth={3} />
        ) : (
          <span className="text-base italic">{rank}</span>
        )}
      </div>

      {/* Avatar - VISIBILITY FIX: Forced White Text */}
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm',
        isCurrentUser ? 'bg-[#CC0000]' : 'bg-[#111111]'
      )}>
        <span style={{ color: 'white' }} className="!text-white font-display font-bold text-sm uppercase">
          {entry.username?.slice(0, 2) ?? '??'}
        </span>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            'font-bold truncate text-base tracking-tight',
            isCurrentUser ? '!text-[#CC0000]' : '!text-[#111111]'
          )}>
            {entry.username}
          </p>
          
          {/* Hot Streak Badge */}
          {streak >= 3 && (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[10px] font-black uppercase tracking-tighter animate-pulse">
              <Flame size={12} className="fill-orange-500 stroke-orange-600" />
              {streak} STREAK
            </div>
          )}
        </div>

        {/* Stats Row */}
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
          'flex items-center gap-0.5 text-[10px] font-black px-2 py-1 rounded-lg shrink-0',
          rankChange > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
        )}>
          {rankChange > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(rankChange)}
        </div>
      )}

      {/* Points Section - Forced Black Text */}
      <div className="text-right min-w-[70px] border-l border-gray-100 pl-4 shrink-0">
        <p className="font-display font-black text-2xl !text-[#111111] leading-none italic group-hover:scale-110 transition-transform">
          {entry.totalPoints ?? 0}
        </p>
        <p className="text-[10px] !text-[#9CA3AF] font-black uppercase tracking-widest mt-1">
          PTS
        </p>
      </div>

      {/* Weekly History Sparkline */}
      {weeklyHistory.length > 0 && (
        <div className="hidden lg:flex items-end gap-1 h-10 pl-4 border-l border-gray-100 shrink-0">
          {weeklyHistory.slice(-5).map((pts, i) => {
            const maxVal = Math.max(...weeklyHistory.slice(-5), 1);
            const height = Math.max(20, (pts / maxVal) * 100);
            return (
              <div
                key={i}
                className={cn(
                  'w-2 rounded-t-sm transition-all duration-500',
                  i === weeklyHistory.slice(-5).length - 1 ? 'bg-[#CC0000]' : 'bg-slate-300'
                )}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}