import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { RefreshCw, ChevronLeft, ChevronRight, Calendar, Info } from 'lucide-react';
import { GameCard } from '../components/GameCard';

export function PicksPage() {
  // Added picks and user to check for existing locks in the archive
  const { games, isLoading, refreshGames, picks } = useStore();
  
  // Default to Week 18 (The finale of the regular season)
  const [selectedWeek, setSelectedWeek] = useState(18);

  useEffect(() => {
    // We pass 'false' for forceRefresh, the selected week, and explicitly 2025
    refreshGames(false, selectedWeek, 2025);
  }, [selectedWeek, refreshGames]);

  const changeWeek = (delta: number) => {
    const next = selectedWeek + delta;
    if (next >= 1 && next <= 18) setSelectedWeek(next);
  };

  // Archive check: Did the user have a lock this week?
  const hasLockThisWeek = picks.some(p => p.week === selectedWeek && p.isLock);

  return (
    <div className="space-y-6">
      {/* Historical Season Header */}
      <div className="bg-[#111111] p-4 border-l-4 border-[#CC0000] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h1 className="text-white font-display font-black uppercase italic tracking-tighter text-xl flex items-center gap-2">
              <Calendar size={20} className="text-[#CC0000]" /> 
              2025 Regular Season
            </h1>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
              Historical Archive Mode
            </p>
          </div>
          <div className="flex flex-col items-end">
             <span className="bg-[#CC0000] text-white text-[10px] font-black px-2 py-0.5 uppercase italic">
               Offseason
             </span>
             <span className="text-gray-600 text-[10px] font-bold uppercase mt-1">Status: Final</span>
          </div>
        </div>

        {/* Week Selector Gridiron Style */}
        <div className="flex items-center justify-center gap-6 bg-white/5 p-3 rounded border border-white/10">
          <button 
            onClick={() => changeWeek(-1)}
            disabled={selectedWeek === 1}
            className="text-white hover:text-[#CC0000] disabled:opacity-20 transition-all hover:scale-110 active:scale-90"
          >
            <ChevronLeft size={28} strokeWidth={3} />
          </button>
          
          <div className="text-center min-w-[140px] border-x border-white/10 px-4">
            <p className="text-[#CC0000] text-[10px] font-black uppercase tracking-widest mb-1">Select Week</p>
            <p className="text-white text-3xl font-display font-black italic uppercase leading-none tracking-tighter">
              Week {selectedWeek}
            </p>
          </div>

          <button 
            onClick={() => changeWeek(1)}
            disabled={selectedWeek === 18}
            className="text-white hover:text-[#CC0000] disabled:opacity-20 transition-all hover:scale-110 active:scale-90"
          >
            <ChevronRight size={28} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Archive Notice */}
      <div className="bg-blue-50 border border-blue-100 p-3 flex items-start gap-3">
        <Info size={16} className="text-blue-500 mt-0.5" />
        <p className="text-[11px] font-bold text-blue-700 leading-tight uppercase italic">
          Viewing completed games from the 2025 season. Click any game card to expand full box scores and player stats.
        </p>
      </div>

      {/* Games List */}
      {isLoading ? (
        <div className="flex flex-col items-center py-24 animate-pulse">
          <RefreshCw className="w-12 h-12 text-[#CC0000] animate-spin mb-4" />
          <p className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em]">Accessing ESPN Vault...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {games.length > 0 ? (
            games.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                hasLockThisWeek={hasLockThisWeek}
                // onPick is null because you can't pick archived games
              />
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200">
               <p className="text-gray-400 font-black uppercase italic">No Game Records Found for Week {selectedWeek}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}