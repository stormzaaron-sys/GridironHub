import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Trophy, Shield, RefreshCw } from 'lucide-react';
import { GameCard } from '../components/GameCard';

/**
 * CRITICAL MAPPING:
 * These IDs must be 19-23 to trigger SeasonType.POSTSEASON 
 * in our updated espnApi.ts logic.
 */
const POSTSEASON_WEEKS = [
  { id: 19, name: "Wild Card" },
  { id: 20, name: "Divisional" },
  { id: 21, name: "Championship" },
  { id: 23, name: "Super Bowl LIX" }
];

export function PlayoffsPage() {
  // Use 'games' or 'playoffGames' depending on your store's variable name
  const { games, refreshGames, isLoading } = useStore();
  const [activeTab, setActiveTab] = useState(23); // Default to Super Bowl (Week 23)

  useEffect(() => {
    // This sends 19, 20, 21, or 23 to the API
    // The API will subtract 18 to get ESPN's 1, 2, 3, or 5
    refreshGames(false, activeTab, 2025);
  }, [activeTab, refreshGames]);

  return (
    <div className="space-y-6">
      {/* Postseason Header */}
      <div className="bg-[#111111] p-8 text-center border-b-4 border-[#CC0000] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           {/* Decorative background element if desired */}
        </div>
        <Trophy size={48} className="text-[#CC0000] mx-auto mb-3 drop-shadow-[0_0_15px_rgba(204,0,0,0.5)]" />
        <h1 className="text-white font-display font-black uppercase italic text-3xl tracking-tighter">
          2025 Postseason Archive
        </h1>
        <p className="text-[#CC0000] text-[10px] font-black uppercase tracking-[0.4em] mt-2">
          Road to the Championship
        </p>
      </div>

      {/* Tournament Tabs */}
      <div className="flex bg-gray-100 p-1 gap-1">
        {POSTSEASON_WEEKS.map((w) => (
          <button
            key={w.id}
            onClick={() => setActiveTab(w.id)}
            className={`flex-1 py-3 text-[10px] font-black uppercase italic transition-all ${
              activeTab === w.id 
                ? "bg-[#CC0000] text-white shadow-lg scale-[1.02] z-10" 
                : "bg-white text-gray-400 hover:text-[#111111]"
            }`}
          >
            {w.name}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="grid grid-cols-1 gap-4 px-2 sm:px-0">
        {isLoading ? (
          <div className="flex flex-col items-center py-24 animate-pulse">
            <RefreshCw className="w-12 h-12 text-[#CC0000] animate-spin mb-4" />
            <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">Querying Playoff Records...</p>
          </div>
        ) : games.length > 0 ? (
          games.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              hasLockThisWeek={false} // No locks in archive mode
            />
          ))
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-gray-200">
            <Shield size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="font-black uppercase tracking-widest text-gray-400 text-sm italic">
              Record Not Found in Archive
            </p>
            <p className="text-gray-300 text-[10px] uppercase font-bold mt-1">
              Attempting to verify downlink for Week {activeTab}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}