import { useState } from 'react';
import { ChevronDown, Loader2, Lock, Check } from 'lucide-react';
import { fetchGameStats } from '../services/espnGameStats';
import { Game, Pick } from '../models/types';
import { GameStatsDropdown } from './GameStatsDropdown';
import { cn } from '../utils/cn';

interface GameCardProps {
  game: Game;
  userPick?: Pick;
  onPick?: (team: string, isLock: boolean) => void;
  hasLockThisWeek: boolean;
}

export function GameCard({ game, userPick, onPick, hasLockThisWeek }: GameCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isFinished = game.status === 'final';
  const isLive = game.status === 'in_progress';
  const canPick = onPick && game.status === 'scheduled' && new Date(game.kickoffTime) > new Date();

  const toggleStats = async () => {
    if (!isFinished && !isLive) return;
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (stats || loading) return;

    setLoading(true);
    const result = await fetchGameStats(game.gameId);
    setStats(result);
    setLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-none shadow-sm overflow-hidden mb-1">
      <div 
        className={cn(
          "flex items-center p-4 transition-colors",
          (isFinished || isLive) ? "cursor-pointer hover:bg-gray-50" : ""
        )}
        onClick={toggleStats}
      >
        <div className="w-24 border-r border-gray-100 pr-4 mr-4 flex flex-col justify-center items-center text-center">
          {isLive ? (
            <span className="bg-[#CC0000] text-white text-[10px] font-black px-2 py-0.5 animate-pulse uppercase italic">Live</span>
          ) : isFinished ? (
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Final</span>
          ) : (
            <div className="text-[#111111] text-[10px] font-black uppercase leading-tight">
              {new Date(game.kickoffTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}<br/>
              <span className="text-gray-400 font-bold">{new Date(game.kickoffTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={game.awayTeam.logo} alt="" className="w-7 h-7 object-contain" />
              <span className="text-xl font-display font-black uppercase italic tracking-tighter text-[#111111]">
                {game.awayTeam.abbreviation}
              </span>
              {userPick?.selected_team === game.awayTeam.abbreviation && (
                <Check size={14} className="text-[#CC0000] stroke-[4px]" />
              )}
            </div>
            <span className={cn("text-2xl font-display font-black italic", (game.awayScore > (game.homeScore ?? 0) || isFinished) ? "text-[#111111]" : "text-gray-300")}>
              {game.awayScore || 0}
            </span>
          </div>

          <div className="flex items-center justify-between md:border-l md:pl-6 border-gray-100">
            <div className="flex items-center gap-3">
              <img src={game.homeTeam.logo} alt="" className="w-7 h-7 object-contain" />
              <span className="text-xl font-display font-black uppercase italic tracking-tighter text-[#111111]">
                {game.homeTeam.abbreviation}
              </span>
              {userPick?.selected_team === game.homeTeam.abbreviation && (
                <Check size={14} className="text-[#CC0000] stroke-[4px]" />
              )}
            </div>
            <span className={cn("text-2xl font-display font-black italic", (game.homeScore > (game.awayScore ?? 0) || isFinished) ? "text-[#111111]" : "text-gray-300")}>
              {game.homeScore || 0}
            </span>
          </div>
        </div>

        {(isFinished || isLive) && (
          <div className="ml-4 pl-4 border-l border-gray-100">
            {loading ? <Loader2 className="animate-spin text-gray-300" size={18} /> : <ChevronDown className={cn("text-gray-300", expanded && "rotate-180")} size={18} />}
          </div>
        )}
      </div>

      {canPick && (
        <div className="bg-gray-50 border-t border-gray-100 p-1 flex gap-1">
          {[game.awayTeam.abbreviation, game.homeTeam.abbreviation].map((team) => {
            const isPicked = userPick?.selected_team === team;
            return (
              <button
                key={team}
                onClick={(e) => { e.stopPropagation(); onPick?.(team, userPick?.isLock || false); }}
                className={cn(
                  "flex-1 py-2 font-display font-black uppercase italic text-xs transition-all border",
                  isPicked 
                    ? "bg-[#111111] border-[#111111] text-white" 
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-[#111111]"
                )}
              >
                {isPicked ? `Selected ${team}` : `Pick ${team}`}
              </button>
            );
          })}

          {userPick?.selected_team && (
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                onPick?.(userPick.selected_team, !userPick.isLock); 
              }}
              disabled={!userPick.isLock && hasLockThisWeek}
              className={cn(
                "px-4 py-2 font-display font-black uppercase italic text-xs border transition-all flex items-center gap-2",
                userPick.isLock 
                  ? "bg-[#CC0000] border-[#CC0000] text-white" 
                  : "bg-white border-gray-200 text-gray-400 hover:border-[#CC0000] hover:text-[#CC0000] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-400"
              )}
            >
              <Lock size={12} className={userPick.isLock ? "fill-white" : ""} />
              {userPick.isLock ? "Locked" : "Lock It"}
            </button>
          )}
        </div>
      )}

      {expanded && stats && (
        <div className="border-t border-gray-100">
           <GameStatsDropdown stats={stats} game={game} />
        </div>
      )}
    </div>
  );
}