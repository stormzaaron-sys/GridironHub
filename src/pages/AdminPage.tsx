// src/pages/AdminPage.tsx
import { useState, useEffect } from 'react';
import {
  Shield,
  RefreshCw,
  Key,
  Wifi,
  WifiOff,
  Clock,
  Database,
  Users,
  AlertOctagon
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../services/supabase';
import { getSyncStatus, forceRefreshAll } from '../services/dataSync';
import { detectCurrentSeasonInfo, SeasonType } from '../services/espnApi';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

export function AdminPage() {
  const {
    currentUser,
    season,
    leaderboard,
    refreshGames,
    refreshNews,
    isLoading
  } = useStore();

  const [tokens, setTokens] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());
  const [seasonInfo, setSeasonInfo] = useState<{
    seasonType: SeasonType;
    week: number;
    year: number;
  } | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      const { data } = await supabase.from('invite_tokens').select('*').order('token');
      if (data) setTokens(data);
    };
    fetchTokens();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setSyncStatus(getSyncStatus()), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSeasonInfo(detectCurrentSeasonInfo());
  }, []);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-gray-200">
        <AlertOctagon size={64} className="text-[#CC0000] mb-4" />
        <h2 className="text-2xl font-display font-black uppercase italic text-[#111111]">Unauthorized Access</h2>
        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-2">Administrator Credentials Required</p>
      </div>
    );
  }

  const handleForceSync = async () => {
    if (season) {
      await forceRefreshAll(season.id, season.current_week);
      setSyncStatus(getSyncStatus());
    }
  };

  const getSeasonTypeName = (type: SeasonType) => {
    switch (type) {
      case SeasonType.PRESEASON: return 'Preseason';
      case SeasonType.REGULAR: return 'Regular Season';
      case SeasonType.POSTSEASON: return 'Postseason';
      default: return 'Unknown';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* 1. ADMIN BROADCAST HEADER */}
      <div className="flex justify-between items-end border-b-4 border-[#111111] pb-2">
        <div>
          <p className="text-[#CC0000] font-display font-black uppercase italic text-sm tracking-widest leading-none">System Control</p>
          <h1 className="text-5xl font-display font-black text-[#111111] uppercase italic tracking-tighter mt-1 flex items-center gap-4">
            Network Admin
          </h1>
        </div>
        <div className="bg-[#111111] px-4 py-1 self-start">
          <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Secure Session</span>
        </div>
      </div>

      {/* 2. LIVE SYNC OPERATIONS CENTER */}
      <section className="bg-white border border-gray-200 shadow-xl">
        <div className="bg-[#111111] px-4 py-2 flex justify-between items-center">
          <h3 className="text-[11px] font-black text-white uppercase italic tracking-widest flex items-center gap-2">
            <Database size={14} className="text-[#CC0000]" />
            ESPN Data Uplink Status
          </h3>
          <div className="flex items-center gap-2">
             <div className={cn("w-2 h-2 rounded-full animate-pulse", (syncStatus.isPollingGames || syncStatus.isPollingNews) ? "bg-green-500" : "bg-gray-600")} />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
               {(syncStatus.isPollingGames || syncStatus.isPollingNews) ? "Active Feed" : "Standby"}
             </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 border border-gray-200 mb-6">
            {[
              { label: 'Network Week', value: seasonInfo?.week || '—' },
              { label: 'Season Phase', value: seasonInfo ? getSeasonTypeName(seasonInfo.seasonType) : '—' },
              { label: 'Game Sync', value: syncStatus.lastGameSync ? format(syncStatus.lastGameSync, 'HH:mm:ss') : 'Offline' },
              { label: 'News Sync', value: syncStatus.lastNewsSync ? format(syncStatus.lastNewsSync, 'HH:mm:ss') : 'Offline' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-display font-black text-[#111111] uppercase italic">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleForceSync}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-3 bg-[#CC0000] text-white font-black uppercase italic tracking-tighter hover:bg-[#990000] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              Master Force Sync
            </button>
            <button
              onClick={() => refreshGames(true)}
              className="py-3 bg-[#111111] text-white font-black uppercase italic tracking-tighter hover:bg-black transition-colors"
            >
              Refresh Game Data
            </button>
            <button
              onClick={() => refreshNews(true)}
              className="py-3 bg-gray-100 text-[#111111] font-black uppercase italic tracking-tighter hover:bg-gray-200 transition-colors border border-gray-200"
            >
              Update News Feed
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 3. ACCESS TOKENS (The "Security Log" Look) */}
        <section className="bg-white border border-gray-200 shadow-sm">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
            <h3 className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] flex items-center gap-2">
              <Key size={14} /> Invite Token Registry
            </h3>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto">
            <div className="space-y-2">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className={cn(
                    "flex justify-between items-center p-3 border-l-4",
                    token.claimed ? "bg-gray-50 border-gray-300 opacity-60" : "bg-white border-[#CC0000] shadow-sm"
                  )}
                >
                  <div>
                    <code className="text-sm font-black text-[#111111] tracking-widest">{token.token}</code>
                    <div className="flex gap-2 mt-1">
                      {token.is_admin && <span className="text-[8px] font-black bg-purple-600 text-white px-1 uppercase">Admin</span>}
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                        {token.claimed ? 'Claimed' : 'Unused'}
                      </span>
                    </div>
                  </div>
                  <div className={cn("w-2 h-2 rounded-full", token.claimed ? "bg-gray-300" : "bg-[#CC0000]")} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 p-3 border-t border-gray-200">
             <p className="text-[10px] font-black text-gray-400 uppercase text-center italic">
               Registry Depth: {tokens.length} Entries
             </p>
          </div>
        </section>

        {/* 4. LEAGUE METRICS */}
        <section className="space-y-6">
          <div className="bg-[#111111] p-6 text-white shadow-xl relative overflow-hidden">
            <Users className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32" />
            <h3 className="text-[10px] font-black uppercase italic tracking-[0.2em] mb-6 border-b border-gray-800 pb-2">League Vital Signs</h3>
            
            <div className="grid grid-cols-2 gap-8 relative z-10">
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Users</p>
                <p className="text-4xl font-display font-black italic">{leaderboard.length}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Season Year</p>
                <p className="text-4xl font-display font-black italic">{season?.year}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Current Week</p>
                <p className="text-4xl font-display font-black italic text-[#CC0000]">W{season?.current_week}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">League State</p>
                <p className="text-4xl font-display font-black italic">
                  {season?.is_active ? 'LIVE' : 'IDLE'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#111111] p-4 flex items-center gap-4">
            <Clock className="text-gray-300" size={24} />
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">System Time</p>
              <p className="text-sm font-black text-[#111111] uppercase mt-1">
                {format(new Date(), 'EEEE, MMM do - HH:mm:ss')}
              </p>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}