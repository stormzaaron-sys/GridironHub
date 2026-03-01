// Home Page - Dashboard with Live ESPN Data - GridironHub Theme
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, format, isValid } from 'date-fns';
import { 
  Trophy, Target, Lock, Flame, RefreshCw, Newspaper, Shield
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { StatCard } from '../components/StatCard';
import { LeaderboardRow } from '../components/LeaderboardRow';
import { NewsCard } from '../components/NewsCard';
import { getSeasonTypeName } from '../services/espnApi';

/**
 * SAFE DATE HELPERS
 * Prevents "Uncaught RangeError: Invalid time value" from crashing the app
 */
const safeFormatDistance = (date: Date | number | string | null | undefined) => {
  if (!date) return 'Recently';
  const d = new Date(date);
  if (!isValid(d)) return 'Recently';
  return formatDistanceToNow(d, { addSuffix: true });
};

const safeFormatTime = (date: Date | number | string | null | undefined) => {
  if (!date) return '--:--';
  const d = new Date(date);
  if (!isValid(d)) return '--:--';
  return format(d, 'HH:mm:ss');
};

export function HomePage() {
  const { 
    currentUser, season, games, playoffGames, 
    leaderboard, news, seasonInfo, isLoading, isPolling, 
    lastSync, refreshGames, startPolling,
  } = useStore();

  useEffect(() => {
    if (!isPolling && season) startPolling();
  }, [isPolling, season, startPolling]);

  const userEntry = leaderboard.find(e => e.userId === currentUser?.id);
  const topThree = leaderboard.slice(0, 3);
  
  const getSeasonDisplayText = () => 
    seasonInfo ? `Week ${seasonInfo.week} • ${seasonInfo.year} ${getSeasonTypeName(seasonInfo.seasonType)}` : 'Syncing...';

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. WELCOME HEADER */}
      <div className="flex items-end justify-between px-1">
        <div>
          <h1 className="text-3xl font-display font-black text-[#111111] uppercase italic tracking-tighter">
            System Log: <span className="text-[#CC0000]">{currentUser?.username}</span>
          </h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">
            {getSeasonDisplayText()}
          </p>
        </div>
        <button 
          onClick={() => refreshGames(true)} 
          className="p-2 bg-[#111111] text-white hover:bg-[#CC0000] shadow-lg transition-colors"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 2. ADMIN ACCESS */}
      {currentUser?.role === 'admin' && (
        <div className="flex items-center gap-4 px-5 py-4 bg-[#111111] border-l-4 border-[#CC0000] shadow-xl">
          <Shield size={20} className="text-[#CC0000]" />
          <div>
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Security Clearance</p>
            <p className="text-white text-sm font-black uppercase italic tracking-widest">Network Admin</p>
          </div>
          <Link to="/admin" className="ml-auto text-[10px] font-black text-[#CC0000] uppercase italic border-b border-[#CC0000]">
            Access Panel →
          </Link>
        </div>
      )}

      {/* 3. USER STATS */}
      {userEntry && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <StatCard label="World Rank" value={`#${userEntry.rank}`} icon={Trophy} color="red" />
          <StatCard label="Total Rating" value={userEntry.totalPoints} icon={Target} color="red" />
          <StatCard label="Lock Accuracy" value={`${userEntry.lockPercentage || 0}%`} icon={Lock} color="red" />
          <StatCard label="Win Streak" value={userEntry.streak || 0} icon={Flame} color="red" />
        </div>
      )}

      {/* 4. LEADERBOARD PREVIEW */}
      <section>
        <div className="flex items-center justify-between mb-3 bg-[#111111] p-3 border-l-4 border-[#CC0000]">
          <h2 className="text-[11px] font-display font-black text-white uppercase italic tracking-widest flex items-center gap-2">
            <Trophy size={14} className="text-[#CC0000]" /> Pro Leaderboard
          </h2>
          <Link to="/leaderboard" className="text-[10px] font-black text-[#CC0000] uppercase italic">Full Table →</Link>
        </div>
        <div className="bg-white border border-gray-100">
          {topThree.map((entry) => (
            <LeaderboardRow key={entry.userId} entry={entry} isCurrentUser={entry.userId === currentUser?.id} />
          ))}
        </div>
      </section>

      {/* 5. NFL NEWSROOM (CLEANED UP SECTION) */}
      <section>
        <div className="flex items-center justify-between mb-4 bg-[#111111] p-3 border-b-2 border-[#CC0000]">
          <h2 className="text-[11px] font-display font-black text-white uppercase italic tracking-widest flex items-center gap-2">
            <Newspaper size={16} className="text-[#CC0000]" /> NFL Newsroom
          </h2>
          <Link to="/news" className="text-[10px] font-black text-[#CC0000] uppercase italic">Archive →</Link>
        </div>
        
        <div className="space-y-4">
          {/* FEATURED STORY - Manual overlay removed to fix double-text */}
          {news && news.length > 0 && (
            <div className="relative overflow-hidden bg-black border-b-4 border-[#CC0000]">
               <NewsCard item={news[0]} featured />
            </div>
          )}

          {/* SECONDARY STORIES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {news.slice(1, 4).map((item) => (
              <NewsCard key={item.id} item={item} compact />
            ))}
          </div>
        </div>
      </section>

      {/* 6. FOOTER SYNC STATUS */}
      <div className="text-center pt-8 opacity-50">
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">
          Last Sync: {safeFormatTime(lastSync)} • Feed Secure
        </p>
      </div>
    </div>
  );
}