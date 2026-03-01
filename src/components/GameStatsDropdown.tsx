import { GameStats, Game } from '../models/types';
import { formatStatName } from '../services/espnGameStats';
import { ComparisonStatRow } from './ComparisonStatRow';
import { AlertCircle, Zap, TrendingUp, Trophy } from 'lucide-react';
import { cn } from '../utils/cn';

interface GameStatsDropdownProps {
  stats: GameStats;
  game: Game; 
}

export function GameStatsDropdown({ stats, game }: GameStatsDropdownProps) {
  const awayTeamAbbrev = game.awayTeam.abbreviation;
  const homeTeamAbbrev = game.homeTeam.abbreviation;

  const awayTeam = stats.teamStats.find(t => t.teamAbbrev === awayTeamAbbrev);
  const homeTeam = stats.teamStats.find(t => t.teamAbbrev === homeTeamAbbrev);

  const awayColor = game.awayTeam.color || '#475569';
  const homeColor = game.homeTeam.color || '#CC0000';

  return (
    <div className="bg-[#F6F6F6] border-t border-gray-300 animate-in slide-in-from-top-2 duration-200 pb-6">
      
      {/* SECTION 1: TEAM STATS COMPARISON */}
      <div className="p-2 sm:p-4">
        <div className="bg-[#111111] py-2 px-4 mb-[1px] flex justify-between items-center border-l-4 border-[#CC0000]">
          <h4 className="text-[11px] font-display font-black text-white uppercase italic tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-[#CC0000] fill-[#CC0000]" /> 
            Matchup Analysis
          </h4>
          <div className="flex gap-10 text-[10px] font-black text-gray-400 uppercase italic tracking-tighter mr-2">
            <span className={cn(game.awayScore > game.homeScore && "text-white")}>{awayTeamAbbrev}</span>
            <span className={cn(game.homeScore > game.awayScore && "text-white")}>{homeTeamAbbrev}</span>
          </div>
        </div>
        
        <div className="border border-gray-200 bg-white px-4 py-2 shadow-sm">
          {awayTeam?.stats?.slice(0, 10).map((stat, idx) => {
            const homeStatValue = homeTeam?.stats?.[idx]?.value || '0';
            return (
              <ComparisonStatRow 
                key={idx}
                label={formatStatName(stat.name)}
                awayValue={stat.value}
                homeValue={homeStatValue}
                awayColor={awayColor}
                homeColor={homeColor}
              />
            );
          })}
        </div>
      </div>

      {/* SECTION 2: TOP PERFORMERS / LEADERS */}
      {(awayTeam?.leaders?.length || homeTeam?.leaders?.length) && (
        <div className="px-2 sm:px-4 mb-4">
          <div className="bg-[#111111] py-2 px-4 mb-[1px] border-l-4 border-gray-500">
            <h4 className="text-[11px] font-display font-black text-white uppercase italic tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-gray-400" /> Key Contributors
            </h4>
          </div>
          
          <div className="grid grid-cols-2 gap-[1px] bg-gray-200 border border-gray-200 shadow-md">
            {[awayTeam, homeTeam].map((team, tIdx) => (
              <div key={tIdx} className="bg-white p-4">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <img 
                    src={tIdx === 0 ? game.awayTeam.logo : game.homeTeam.logo} 
                    className="w-5 h-5 object-contain" 
                    alt="" 
                  />
                  <span className="text-[10px] font-black uppercase italic text-[#111111]">
                    {team?.teamAbbrev} Leaders
                  </span>
                </div>
                {team?.leaders?.slice(0, 3).map((leader, lIdx) => (
                  <div key={lIdx} className="mb-4 last:mb-0 group">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                      {leader.name}
                    </p>
                    <p className="text-[11px] font-black text-[#111111] uppercase italic leading-none group-hover:text-[#CC0000] transition-colors">
                      {leader.displayName}
                    </p>
                    <p className="text-[10px] font-bold text-[#CC0000] mt-1 tabular-nums font-mono">
                      {leader.stats}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: SCORING LOG (CRITICAL FOR ARCHIVE) */}
      {stats.scoringPlays && stats.scoringPlays.length > 0 && (
        <div className="p-2 sm:p-4">
          <div className="bg-[#CC0000] py-2 px-4 mb-[1px] shadow-sm">
            <h4 className="text-[11px] font-display font-black text-white uppercase italic tracking-widest flex items-center gap-2">
              <Trophy size={14} className="fill-white/20" /> Scoring Summary
            </h4>
          </div>
          
          <div className="divide-y divide-gray-100 bg-white border border-gray-200 shadow-lg">
            {stats.scoringPlays.map((play, idx) => (
              <div key={idx} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors group">
                <div className="flex flex-col items-center justify-start min-w-[50px] border-r border-gray-100">
                  <span className="text-[10px] font-black text-[#CC0000] uppercase italic">Q{play.quarter}</span>
                  <span className="text-[9px] font-bold text-gray-400 tabular-nums">{play.clock}</span>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-black text-[#111111] leading-tight mb-2 uppercase italic tracking-tight group-hover:text-[#CC0000]">
                    {play.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-900 px-2 py-0.5 skew-x-[-10deg]">
                      <span className="text-[10px] font-black text-white tabular-nums italic">
                        {awayTeamAbbrev} {play.awayScore} — {play.homeScore} {homeTeamAbbrev}
                      </span>
                    </div>
                    {/* Optional: Add a "Touchdown" or "FG" tag if you can parse the description */}
                    {play.description.includes('TD') && (
                      <span className="text-[8px] font-black text-[#CC0000] border border-[#CC0000] px-1 uppercase">Touchdown</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!awayTeam?.stats?.length && (!stats.scoringPlays || stats.scoringPlays.length === 0) && (
        <div className="py-16 bg-white flex flex-col items-center justify-center border border-gray-200 mx-4 shadow-inner mt-4">
          <AlertCircle size={32} className="text-gray-100 mb-2" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
            Uplink Failed: No Data Record Found
          </p>
        </div>
      )}
    </div>
  );
}